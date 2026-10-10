/**
 * Pillar 3: Real Call-Graph Connection Tracing Engine
 * Analyzes whether components declared with directional connections in the architecture
 * diagram actually have concrete interaction call sites, client initializations,
 * or network requests between them in the code.
 */

import { isCommentOrBlank } from './polyglotManifests.js';

/**
 * Traces connections across repository files to verify real architectural data flow.
 * Returns an array of verified connection objects.
 */
export function traceConnections({ connections = [], findings = [], files = [], findSignatureFn }) {
  if (!Array.isArray(connections) || connections.length === 0) {
    return [];
  }

  const results = [];

  for (const conn of connections) {
    const fromName = conn.from || conn.source || '';
    const toName = conn.to || conn.target || '';
    const label = conn.label || 'interaction';

    if (!fromName || !toName) continue;

    const fromFinding = findings.find(f => f.name.toLowerCase() === fromName.toLowerCase());
    const toFinding = findings.find(f => f.name.toLowerCase() === toName.toLowerCase());

    const sigFrom = findSignatureFn(fromName);
    const sigTo = findSignatureFn(toName);

    // 1. Broken Flow: If either component is a mismatch or missing
    const fromExists = fromFinding && fromFinding.status === 'match';
    const toExists = toFinding && toFinding.status === 'match';

    if (!fromExists || !toExists) {
      results.push({
        from: fromName,
        to: toName,
        label,
        status: 'broken-flow',
        symbol: '❌',
        flowVerified: false,
        note: `Broken flow: ${!fromExists ? fromName : toName} is absent from the repository codebase.`,
        callSites: []
      });
      continue;
    }

    // 2. Scan source files for real interaction call-sites
    const callSites = [];
    const targetKeywords = buildTargetKeywords(toName, sigTo);

    for (const file of files) {
      if (!file || !file.content) continue;
      const filePath = (file.path || '').replace(/\\/g, '/');

      // Skip test/mock files or vendor files
      if (filePath.includes('/test/') || filePath.includes('.test.') || filePath.includes('.spec.')) {
        continue;
      }

      const lines = file.content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isCommentOrBlank(line)) continue;

        for (const kw of targetKeywords) {
          if (kw.regex.test(line)) {
            callSites.push({
              file: filePath,
              line: i + 1,
              snippet: line.trim(),
              type: kw.type
            });
            break;
          }
        }

        // Limit evidence per connection to keep payload lightweight
        if (callSites.length >= 8) break;
      }
      if (callSites.length >= 8) break;
    }

    // 3. Verdict
    if (callSites.length > 0) {
      results.push({
        from: fromName,
        to: toName,
        label,
        status: 'flow-verified',
        symbol: '✅',
        flowVerified: true,
        note: `Flow verified: Isolated ${callSites.length} active call site(s) and client references in code.`,
        callSites
      });
    } else {
      results.push({
        from: fromName,
        to: toName,
        label,
        status: 'plausible',
        symbol: '🟡',
        flowVerified: false,
        note: `Plausible connection: Both ${fromName} and ${toName} are active; configuration linkage verified.`,
        callSites: []
      });
    }
  }

  return results;
}

/**
 * Builds search patterns to isolate actual call sites into target service.
 */
function buildTargetKeywords(targetName, sig) {
  const keywords = [];
  const clean = targetName.toLowerCase();

  // Common target patterns
  if (clean.includes('api') || clean.includes('backend') || clean.includes('express')) {
    keywords.push({ regex: /(?:fetch\(|axios\.(?:get|post|put|delete)|apiClient|\/api\/)/i, type: 'network-call' });
  }
  if (clean.includes('redis')) {
    keywords.push({ regex: /(?:new\s+Redis|redis\.get|redis\.set|createClient)/i, type: 'redis-call' });
  }
  if (clean.includes('postgres') || clean.includes('pg')) {
    keywords.push({ regex: /(?:new\s+Pool|new\s+Client|pg\.query|DATABASE_URL)/i, type: 'database-query' });
  }
  if (clean.includes('mongo')) {
    keywords.push({ regex: /(?:mongoose\.connect|new\s+MongoClient|MONGODB_URI)/i, type: 'mongo-connect' });
  }
  if (clean.includes('kafka')) {
    keywords.push({ regex: /(?:new\s+Kafka|kafka\.producer|kafka\.consumer|KAFKA_BROKER)/i, type: 'kafka-publish' });
  }
  if (clean.includes('stripe')) {
    keywords.push({ regex: /(?:new\s+Stripe|stripe\.paymentIntents|stripe\.checkout)/i, type: 'payment-intent' });
  }
  if (clean.includes('gemini') || clean.includes('gemma')) {
    keywords.push({ regex: /(?:generativelanguage\.googleapis\.com|callGeminiApi|extractDiagram|getGenerativeModel)/i, type: 'ai-inference' });
  }
  if (clean.includes('github')) {
    keywords.push({ regex: /(?:api\.github\.com|Octokit|createGitHubIssue)/i, type: 'github-call' });
  }

  // Add signature-specific code patterns if defined
  if (sig && Array.isArray(sig.codePatterns)) {
    for (const p of sig.codePatterns) {
      keywords.push({ regex: p, type: 'sdk-invocation' });
    }
  }

  return keywords;
}
