import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractDiagram } from '../src/services/gemma.js';
import { config } from '../src/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSmokeTest() {
  console.log('=== DriftCheck Gemma Model Smoke Test ===');
  console.log(`LLM Provider : ${config.llm.provider}`);
  console.log(`LLM Model    : ${config.llm.model}`);
  console.log(`Base URL     : ${config.llm.baseUrl}`);
  console.log(`API Key set  : ${config.llm.apiKey ? 'YES (length ' + config.llm.apiKey.length + ')' : 'NO'}`);

  // Find target image: CLI arg, demo diagram, docs diagram, or create dummy image
  let imagePath = process.argv[2];
  if (!imagePath) {
    const candidatePaths = [
      path.resolve(__dirname, '../../docs/architecture.png'),
      path.resolve(__dirname, '../fixtures/sample-diagram.png')
    ];
    imagePath = candidatePaths.find(p => fs.existsSync(p));
  }

  if (!imagePath || !fs.existsSync(imagePath)) {
    console.warn('[smoke] No test image found. Creating minimal 1x1 test PNG...');
    const fixtureDir = path.resolve(__dirname, '../fixtures');
    fs.mkdirSync(fixtureDir, { recursive: true });
    imagePath = path.join(fixtureDir, 'sample-diagram.png');
    // Minimal valid 1x1 transparent PNG buffer
    const minimalPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(imagePath, minimalPng);
  }

  console.log(`[smoke] Reading test diagram image: ${imagePath}`);
  const imageBuffer = fs.readFileSync(imagePath);

  try {
    console.log('[smoke] Sending image to extractDiagram()...');
    const startTime = Date.now();
    const result = await extractDiagram(imageBuffer, 'image/png');
    const elapsed = Date.now() - startTime;

    console.log(`[smoke] Success! Received result in ${elapsed}ms:`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(`[smoke] Model call failed: ${error.message}`);
    console.log('\n[smoke] Troubleshooting guidance:');
    console.log('1. For Google Gemini API (Gemini Flash / Pro):');
    console.log('   Set GEMINI_API_KEY in backend/.env');
    console.log('   LLM_PROVIDER=gemini');
    console.log('   LLM_MODEL=gemini-2.5-flash (or gemini-1.5-flash)');
    console.log('2. For Gemma 4 via OpenAI-compatible endpoint (OpenRouter, Ollama, etc.):');
    console.log('   Set in backend/.env:');
    console.log('   LLM_PROVIDER=openai');
    console.log('   LLM_BASE_URL=https://openrouter.ai/api/v1 (or http://localhost:11434/v1 for Ollama)');
    console.log('   OPENAI_API_KEY=your_key_here');
    console.log('   LLM_MODEL=google/gemma-4-31b-it (or gemma4:latest)');
    process.exit(1);
  }
}

runSmokeTest();
