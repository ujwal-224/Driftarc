import { signatures, findSignature } from '../rules/signatures.js';

/**
 * Searches for evidence of a technology signature within a list of files.
 * Returns an array of evidence items: { file, line, snippet, type }
 */
export function findEvidenceForSignature(sig, files) {
  const evidence = [];

  for (const file of files) {
    if (!file || typeof file.content !== 'string') continue;
    const filePath = file.path || '';
    const lines = file.content.split('\n');

    // 1. Check package.json dependencies (root or monorepo subdirectories like apps/api/package.json)
    if (filePath.endsWith('package.json') && sig.dependencies && sig.dependencies.length > 0) {
      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];
        for (const dep of sig.dependencies) {
          // Look for dependency key pattern: "dep": or 'dep':
          const depRegex = new RegExp(`['"]${dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*:`, 'i');
          if (depRegex.test(lineContent)) {
            evidence.push({
              file: filePath,
              line: i + 1,
              snippet: lineContent.trim(),
              type: 'dependency'
            });
          }
        }
      }
    }

    // 2. Check docker-compose and Dockerfile
    const isDocker = /(docker-compose.*\.ya?ml|Dockerfile.*)$/i.test(filePath);
    if (isDocker && sig.dockerPatterns) {
      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];
        for (const pattern of sig.dockerPatterns) {
          if (pattern.test(lineContent)) {
            evidence.push({
              file: filePath,
              line: i + 1,
              snippet: lineContent.trim(),
              type: 'docker'
            });
          }
        }
      }
    }

    // 3. Check .env and .env.example
    const isEnv = /(\.env|\.env\.example|\.env\.[a-z0-9_-]+)$/i.test(filePath);
    if (isEnv && sig.envPatterns) {
      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];
        for (const pattern of sig.envPatterns) {
          if (pattern.test(lineContent)) {
            evidence.push({
              file: filePath,
              line: i + 1,
              snippet: lineContent.trim(),
              type: 'env'
            });
          }
        }
      }
    }

    // 4. Check import/require statements in source code (.js, .jsx, .ts, .tsx, .mjs, .cjs)
    const isSourceCode = /\.(jsx?|tsx?|mjs|cjs)$/i.test(filePath);
    if (isSourceCode && sig.importPatterns) {
      for (let i = 0; i < lines.length; i++) {
        const lineContent = lines[i];
        for (const pattern of sig.importPatterns) {
          if (pattern.test(lineContent)) {
            evidence.push({
              file: filePath,
              line: i + 1,
              snippet: lineContent.trim(),
              type: 'import'
            });
          }
        }
      }
    }

    // 5. Check file path patterns
    if (sig.filePatterns) {
      for (const pattern of sig.filePatterns) {
        if (pattern.test(filePath)) {
          evidence.push({
            file: filePath,
            line: 1,
            snippet: `File path matches signature: ${filePath}`,
            type: 'filepath'
          });
          break;
        }
      }
    }
  }

  return evidence;
}

/**
 * Pure, deterministic scanner: scan({ files, components, connections })
 * Returns structured findings and heuristic connection checks.
 */
export function scan({ files = [], components = [], connections = [] }) {
  const findings = [];
  const matchedSignatureIds = new Set();

  // 1. Evaluate all components declared in the diagram
  for (const comp of components) {
    const compName = typeof comp === 'string' ? comp : (comp?.name || 'Unknown');
    const sig = findSignature(compName);

    if (!sig) {
      // Rule: Unknown component with no signature MUST be 'unknown', NEVER 'match'
      findings.push({
        name: compName,
        signatureId: null,
        status: 'unknown',
        reason: `No detection signature found in catalog for "${compName}"`,
        evidence: []
      });
      continue;
    }

    matchedSignatureIds.add(sig.id);
    const evidence = findEvidenceForSignature(sig, files);

    if (evidence.length > 0) {
      findings.push({
        name: compName,
        signatureId: sig.id,
        canonicalName: sig.name,
        status: 'match',
        reason: `Verified in codebase with ${evidence.length} evidence point(s)`,
        evidence
      });
    } else {
      findings.push({
        name: compName,
        signatureId: sig.id,
        canonicalName: sig.name,
        status: 'mismatch',
        reason: `Declared in architecture diagram, but zero evidence found in codebase`,
        evidence: []
      });
    }
  }

  // 2. Scan for undocumented technologies in the codebase
  for (const sig of signatures) {
    // Skip if already in the diagram
    if (matchedSignatureIds.has(sig.id)) continue;

    const evidence = findEvidenceForSignature(sig, files);
    if (evidence.length > 0) {
      findings.push({
        name: sig.name,
        signatureId: sig.id,
        canonicalName: sig.name,
        status: 'undocumented',
        reason: `Discovered active evidence in repository, but component is absent from architecture diagram`,
        evidence
      });
    }
  }

  // 3. Heuristic connection check (Task 6)
  const connectionsCheck = [];
  if (Array.isArray(connections) && connections.length > 0) {
    for (const conn of connections) {
      const fromName = conn.from || conn.source || '';
      const toName = conn.to || conn.target || '';
      const sigFrom = findSignature(fromName);
      const sigTo = findSignature(toName);

      if (sigFrom && sigTo) {
        // Look for cross-referencing evidence: does any file associated with sigFrom reference sigTo?
        const fromEvidence = findEvidenceForSignature(sigFrom, files);
        const toEvidence = findEvidenceForSignature(sigTo, files);

        const hasBoth = fromEvidence.length > 0 && toEvidence.length > 0;
        connectionsCheck.push({
          from: fromName,
          to: toName,
          status: hasBoth ? 'verified' : 'unverified',
          symbol: hasBoth ? '✅' : '❔',
          label: 'heuristic',
          note: hasBoth
            ? `Both ${fromName} and ${toName} verified in repo; connection plausible.`
            : `Could not verify active interaction in code between ${fromName} and ${toName}.`
        });
      }
    }
  }

  // Compute summary stats
  const summary = {
    total: findings.length,
    match: findings.filter(f => f.status === 'match').length,
    mismatch: findings.filter(f => f.status === 'mismatch').length,
    undocumented: findings.filter(f => f.status === 'undocumented').length,
    unknown: findings.filter(f => f.status === 'unknown').length
  };

  return { findings, summary, connectionsCheck };
}
