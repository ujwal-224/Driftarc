import { config } from '../config.js';

/**
 * Clean and parse JSON response from LLM output.
 */
function extractJson(text) {
  if (!text) return null;
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(`Failed to parse JSON response from model: ${text.slice(0, 200)}...`);
  }
}

/**
 * Calls Gemini API for multimodal or text generation.
 */
async function callGeminiApi({ prompt, imageBuffer, mimeType }) {
  const { apiKey, model } = config.llm;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  // Model fallback chain if primary model experiences 503 spikes or 429 limits
  const candidateModels = [model, 'gemini-3.5-flash', 'gemini-3.7-flash'].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  let lastError;
  for (const candidate of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${apiKey}`;

    const parts = [];
    if (imageBuffer && mimeType) {
      const base64Data = imageBuffer.toString('base64');
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: base64Data
        }
      });
    }
    parts.push({ text: prompt });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        // If 503 (high demand) or 429 (rate limit), try fallback model
        if ((response.status === 503 || response.status === 429) && candidate !== candidateModels[candidateModels.length - 1]) {
          console.warn(`[DriftCheck] Model ${candidate} returned ${response.status}, attempting fallback...`);
          lastError = new Error(`Gemini API error (${response.status}) on ${candidate}: ${errorBody}`);
          continue;
        }
        throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty response received from Gemini API');
      }

      return extractJson(text);
    } catch (err) {
      lastError = err;
      if (candidate !== candidateModels[candidateModels.length - 1]) {
        console.warn(`[DriftCheck] Model ${candidate} failed (${err.message}), trying fallback...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All candidate Gemini models failed');
}

/**
 * Calls OpenAI-compatible API (e.g. OpenRouter, Ollama, etc.)
 */
async function callOpenAiCompatibleApi({ prompt, imageBuffer, mimeType }) {
  const { apiKey, model, baseUrl } = config.llm;
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const content = [];
  if (imageBuffer && mimeType) {
    const base64Data = imageBuffer.toString('base64');
    content.push({
      type: 'image_url',
      image_url: {
        url: `data:${mimeType || 'image/png'};base64,${base64Data}`
      }
    });
  }
  content.push({ type: 'text', text: prompt });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [{ role: 'user', content }]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI-compatible LLM error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Empty response received from OpenAI-compatible LLM endpoint');
  }

  return extractJson(text);
}

/**
 * Extracts architecture components and connections from an image using Gemma 4 vision.
 */
export async function extractDiagram(imageBuffer, mimeType = 'image/png') {
  if (!imageBuffer) {
    throw new Error('Image buffer is required for diagram extraction');
  }

  const prompt = `You are an expert software architecture visual parser.
Examine this architecture diagram carefully.
Identify all architectural components (nodes/boxes/services/databases/clients) and directional or bidirectional connections between them.

Return ONLY a valid JSON object strictly matching this schema:
{
  "components": [
    { "name": "Component Name", "type": "frontend|service|database|cache|gateway|external|queue" }
  ],
  "connections": [
    { "from": "ComponentNameA", "to": "ComponentNameB", "label": "description of interaction" }
  ]
}

Be precise and retain standard technology names (e.g., React, Express, API, PostgreSQL, Redis, Stripe, MongoDB, RabbitMQ).`;

  try {
    let result;
    if (config.llm.provider === 'openai') {
      result = await callOpenAiCompatibleApi({ prompt, imageBuffer, mimeType });
    } else {
      result = await callGeminiApi({ prompt, imageBuffer, mimeType });
    }

    if (!result || !Array.isArray(result.components)) {
      throw new Error('Invalid JSON structure returned by model: "components" array missing');
    }

    return {
      components: result.components.map(c => ({
        name: typeof c === 'string' ? c : (c.name || 'Unknown'),
        type: c.type || 'service'
      })),
      connections: Array.isArray(result.connections) ? result.connections : []
    };
  } catch (error) {
    // Surface the real error message
    throw new Error(`Diagram extraction failed: ${error.message}`);
  }
}

/**
 * Drafts an issue summary and description using Gemma 4 text.
 * Strictly respects hard rule: AI drafts text from verified facts only; evidence is appended by code.
 */
export async function draftIssueText({ finding, repoName }) {
  const prompt = `You are a technical documentation assistant.
A code scanner has verified an architecture drift finding for repository "${repoName || 'the repository'}".
Finding details:
- Technology/Component: ${finding.name}
- Status: ${finding.status} (mismatch = documented in architecture diagram but absent in codebase; undocumented = active in codebase but missing from architecture diagram)
- Scanner reason: ${finding.reason}

Write a professional, concise GitHub issue title and description outlining the discrepancy and recommended remediation.
Do NOT fabricate file paths or lines (factual evidence is automatically appended by code).

Return strictly JSON:
{
  "title": "[DriftCheck] Brief descriptive issue title",
  "description": "Clear explanation of the drift and recommended actions."
}`;

  try {
    let result;
    if (config.llm.provider === 'openai') {
      result = await callOpenAiCompatibleApi({ prompt });
    } else {
      result = await callGeminiApi({ prompt });
    }

    return {
      title: result?.title || `[DriftCheck] Architecture Drift: ${finding.name} (${finding.status})`,
      description: result?.description || `Architecture discrepancy identified: ${finding.reason}`
    };
  } catch (error) {
    // Fallback template when LLM call fails or key is missing
    return {
      title: `[DriftCheck] ${finding.status === 'mismatch' ? 'Missing Component' : 'Undocumented Component'}: ${finding.name}`,
      description: `### Architecture Drift Identified\n\n**Component:** ${finding.name}\n**Finding Type:** ${finding.status.toUpperCase()}\n\n**Summary:**\n${finding.reason}\n\n*Note: LLM drafting was offline (${error.message}). Generated standard deterministic issue template.*`
    };
  }
}
