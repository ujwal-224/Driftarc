/**
 * Pillar 2: Universal Polyglot Manifest & AST Parser
 * Parses manifests for Node.js, Python, Go, Rust, and Infrastructure containers.
 * Filters out comments and dead text to prevent false positive matches.
 */

/**
 * Extracts dependencies from any recognized package manifest.
 * Returns: Array of { name, version, file, type }
 */
export function extractManifestDependencies(filePath, content) {
  if (!filePath || !content) return [];
  const normalizedPath = filePath.replace(/\\/g, '/');
  const basename = normalizedPath.split('/').pop().toLowerCase();
  const results = [];

  // 1. Node.js (package.json)
  if (basename === 'package.json') {
    try {
      const parsed = JSON.parse(content);
      const depBuckets = [
        { key: 'dependencies', type: 'npm-prod' },
        { key: 'devDependencies', type: 'npm-dev' },
        { key: 'peerDependencies', type: 'npm-peer' }
      ];
      for (const bucket of depBuckets) {
        if (parsed[bucket.key] && typeof parsed[bucket.key] === 'object') {
          for (const [depName, ver] of Object.entries(parsed[bucket.key])) {
            results.push({
              name: depName.toLowerCase(),
              version: String(ver),
              file: filePath,
              type: bucket.type
            });
          }
        }
      }
    } catch {}
  }

  // 2. Python (requirements.txt)
  else if (basename === 'requirements.txt' || basename.endsWith('-requirements.txt')) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-r')) continue;
      const match = trimmed.match(/^([a-zA-Z0-9_\-\.]+)(?:[=><~!\s].*)?$/);
      if (match) {
        results.push({
          name: match[1].toLowerCase(),
          version: trimmed,
          file: filePath,
          type: 'pip'
        });
      }
    }
  }

  // 3. Python (pyproject.toml)
  else if (basename === 'pyproject.toml') {
    const lines = content.split('\n');
    let inDepSection = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('[')) {
        inDepSection = /\[(project\.dependencies|tool\.poetry\.dependencies)\]/i.test(trimmed);
        continue;
      }
      if (inDepSection && trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([a-zA-Z0-9_\-\.]+)\s*=/);
        if (match) {
          results.push({
            name: match[1].toLowerCase(),
            version: trimmed,
            file: filePath,
            type: 'python-poetry'
          });
        }
      }
    }
  }

  // 4. Go (go.mod)
  else if (basename === 'go.mod') {
    const lines = content.split('\n');
    let inRequireBlock = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('require (')) {
        inRequireBlock = true;
        continue;
      }
      if (inRequireBlock && trimmed === ')') {
        inRequireBlock = false;
        continue;
      }
      if (inRequireBlock || trimmed.startsWith('require ')) {
        const clean = trimmed.replace(/^require\s+/, '');
        const parts = clean.split(/\s+/);
        if (parts[0] && !parts[0].startsWith('//')) {
          results.push({
            name: parts[0].toLowerCase(),
            version: parts[1] || '',
            file: filePath,
            type: 'go-module'
          });
        }
      }
    }
  }

  // 5. Rust (Cargo.toml)
  else if (basename === 'cargo.toml') {
    const lines = content.split('\n');
    let inDepSection = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('[')) {
        inDepSection = /\[dependencies\]|\[dev-dependencies\]/i.test(trimmed);
        continue;
      }
      if (inDepSection && trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([a-zA-Z0-9_\-]+)\s*=/);
        if (match) {
          results.push({
            name: match[1].toLowerCase(),
            version: trimmed,
            file: filePath,
            type: 'cargo-crate'
          });
        }
      }
    }
  }

  return results;
}

/**
 * Strips comments from code lines to avoid false positives in documentation.
 */
export function isCommentOrBlank(line, fileExt = '.js') {
  const trimmed = line.trim();
  if (!trimmed) return true;

  // Single-line comment patterns
  if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
    return true;
  }
  // Markdown or HTML comment
  if (trimmed.startsWith('<!--') || trimmed.startsWith('-->')) {
    return true;
  }
  return false;
}

/**
 * Polyglot Source Import Analyzer
 * Inspects JS, TS, Python, Go, Rust import/require patterns without executing strings.
 */
export function inspectSourceImports(filePath, line, lineNum) {
  if (isCommentOrBlank(line)) return null;

  const patterns = [
    // JS/TS: import ... from 'pkg' or require('pkg')
    /(?:from\s+['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\))/i,
    // Python: import pkg or from pkg import ...
    /^(?:import\s+([a-zA-Z0-9_]+)|from\s+([a-zA-Z0-9_]+)\s+import)/i,
    // Go: "github.com/..."
    /^\s*['"]([a-zA-Z0-9_.\-\/]+)['"]\s*$/i,
    // Rust: use pkg::...
    /^\s*use\s+([a-zA-Z0-9_]+)::/i
  ];

  for (const regex of patterns) {
    const match = line.match(regex);
    if (match) {
      const importedPkg = match[1] || match[2];
      if (importedPkg && !importedPkg.startsWith('.')) {
        return {
          file: filePath,
          line: lineNum,
          module: importedPkg,
          snippet: line.trim()
        };
      }
    }
  }

  return null;
}
