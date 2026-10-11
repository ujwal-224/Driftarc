import fs from 'fs';
import path from 'path';

/**
 * Normalizes a GitHub repository URL or slug into { owner, repo }.
 */
export function parseGitHubUrl(urlOrSlug) {
  if (!urlOrSlug) return null;
  const cleaned = urlOrSlug.trim().replace(/\.git$/, '').replace(/\/$/, '');
  const match = cleaned.match(/(?:github\.com\/)?([^/]+)\/([^/]+)$/i);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}

/**
 * Filter to determine whether a file in the repo should be scanned.
 * Skips large binary files, node_modules, lock files, images, etc.
 */
function isScannableFile(filePath) {
  if (!filePath) return false;
  const normalized = filePath.replace(/\\/g, '/');
  if (
    normalized.includes('node_modules/') ||
    normalized.includes('.git/') ||
    normalized.includes('dist/') ||
    normalized.includes('build/') ||
    normalized.includes('demo/') ||
    normalized.includes('/test/') ||
    normalized.startsWith('test/') ||
    normalized.includes('/tests/') ||
    normalized.startsWith('tests/') ||
    normalized.includes('/__tests__/') ||
    /\.(test|spec)\.[a-z0-9]+$/i.test(normalized)
  ) {
    return false;
  }
  const ext = path.extname(filePath).toLowerCase();
  const scannableExts = new Set([
    '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
    '.json', '.yml', '.yaml', '.env', '.example',
    '.prisma', '.sql', '.toml'
  ]);
  const basename = path.basename(filePath).toLowerCase();
  if (basename === 'dockerfile' || basename.startsWith('dockerfile.')) return true;
  if (basename.startsWith('.env')) return true;
  return scannableExts.has(ext);
}

/**
 * Fetches files from a local directory (recursive).
 */
export function fetchLocalRepo(dirPath) {
  const files = [];

  const candidatePaths = [
    path.resolve(dirPath),
    path.resolve(process.cwd(), dirPath),
    path.resolve(process.cwd(), '..', dirPath)
  ];
  const targetDir = candidatePaths.find(p => fs.existsSync(p)) || path.resolve(dirPath);

  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'demo') {
        continue;
      }
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile()) {
        const relPath = path.relative(targetDir, fullPath).replace(/\\/g, '/');
        if (isScannableFile(relPath)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            files.push({ path: relPath, content });
          } catch {
            // Ignore unreadable files
          }
        }
      }
    }
  }

  traverse(targetDir);
  return files;
}

import zlib from 'zlib';

/**
 * Parses an in-memory tar archive buffer extracted from GitHub tarball.
 */
function parseTarArchive(unzipped, maxFiles = 120) {
  let offset = 0;
  const files = [];
  let nextLongName = null;

  while (offset + 512 <= unzipped.length && files.length < maxFiles) {
    const header = unzipped.subarray(offset, offset + 512);
    // End of archive is marked by two consecutive 512-byte zero blocks
    if (header.every(b => b === 0)) break;

    let name = '';
    if (nextLongName) {
      name = nextLongName;
      nextLongName = null;
    } else {
      let nameEnd = 0;
      while (nameEnd < 100 && header[nameEnd] !== 0) nameEnd++;
      name = header.toString('utf8', 0, nameEnd);

      // Check ustar prefix
      const ustar = header.toString('utf8', 257, 262);
      if (ustar.startsWith('ustar')) {
        let prefixEnd = 345;
        while (prefixEnd < 500 && header[prefixEnd] !== 0) prefixEnd++;
        if (prefixEnd > 345) {
          const prefix = header.toString('utf8', 345, prefixEnd);
          name = prefix + '/' + name;
        }
      }
    }

    const sizeStr = header.toString('utf8', 124, 136).trim().replace(/\0/g, '');
    const size = parseInt(sizeStr, 8) || 0;
    const type = String.fromCharCode(header[156]);

    offset += 512;
    const content = unzipped.subarray(offset, offset + size);

    if (type === 'L') {
      let end = 0;
      while (end < content.length && content[end] !== 0) end++;
      nextLongName = content.toString('utf8', 0, end);
    } else if (type === '0' || type === '\0' || type === '') {
      // Strip top-level directory (e.g., "repo-name-main/")
      const slashIdx = name.indexOf('/');
      const relPath = slashIdx !== -1 ? name.slice(slashIdx + 1) : name;
      if (relPath && isScannableFile(relPath)) {
        try {
          files.push({
            path: relPath,
            content: content.toString('utf8')
          });
        } catch {
          // Ignore binary or decode errors
        }
      }
    }

    offset += Math.ceil(size / 512) * 512;
  }

  return files;
}

/**
 * Attempts to download and extract repo files via GitHub codeload tarball (rate-limit free).
 */
async function tryFetchViaTarball({ owner, repo, branch, authToken }) {
  const candidateBranches = branch ? [branch] : ['main', 'master'];
  
  for (const b of candidateBranches) {
    try {
      // Direct codeload endpoint does not consume REST API quota
      const codeloadUrl = `https://codeload.github.com/${owner}/${repo}/tar.gz/refs/heads/${b}`;
      const headers = { 'User-Agent': 'DriftArc-Scanner' };
      if (authToken) {
        headers['Authorization'] = `token ${authToken}`;
      }

      let res = await fetch(codeloadUrl, { headers });

      // If codeload is forbidden or not found and we have a token, try the API tarball redirect endpoint
      if (!res.ok && authToken) {
        const apiTarballUrl = `https://api.github.com/repos/${owner}/${repo}/tarball/${b}`;
        res = await fetch(apiTarballUrl, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${authToken}`,
            'User-Agent': 'DriftArc-Scanner'
          },
          redirect: 'follow'
        });
      }

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const unzipped = zlib.gunzipSync(Buffer.from(arrayBuf));
        const files = parseTarArchive(unzipped);
        if (files.length > 0) {
          return files;
        }
      }
    } catch {
      // Try next branch or fallback to REST API
    }
  }

  return null;
}

/**
 * Fetches relevant files from a GitHub repository.
 * Prioritizes fast, rate-limit-free tarball archive downloads,
 * and falls back to the GitHub REST API tree if needed.
 */
export async function fetchGitHubRepo({ owner, repo, branch, token }) {
  const authToken = token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  // 1. Try rate-limit-free tarball download first
  const tarballFiles = await tryFetchViaTarball({ owner, repo, branch, authToken });
  if (tarballFiles && tarballFiles.length > 0) {
    return tarballFiles;
  }

  // 2. Fallback to GitHub REST API tree endpoint
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DriftArc-Scanner'
  };
  if (authToken) {
    headers['Authorization'] = `token ${authToken}`;
  }

  let targetBranch = branch;
  if (!targetBranch) {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      const err = await repoRes.text();
      if (repoRes.status === 403 && (err.includes('rate limit') || err.includes('API rate limit'))) {
        throw new Error(`GitHub API rate limit exceeded for ${owner}/${repo}. Please provide a GitHub Personal Access Token (PAT) in DriftArc or set GITHUB_TOKEN on your server.`);
      }
      throw new Error(`Failed to access GitHub repo ${owner}/${repo}: ${repoRes.status} ${err}`);
    }
    const repoData = await repoRes.json();
    targetBranch = repoData.default_branch || 'main';
  }

  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`;
  const treeRes = await fetch(treeUrl, { headers });
  if (!treeRes.ok) {
    const err = await treeRes.text();
    if (treeRes.status === 403 && (err.includes('rate limit') || err.includes('API rate limit'))) {
      throw new Error(`GitHub API rate limit exceeded for ${owner}/${repo}@${targetBranch}. Please provide a GitHub Personal Access Token (PAT) in DriftArc or set GITHUB_TOKEN on your server.`);
    }
    throw new Error(`Failed to fetch file tree for ${owner}/${repo}@${targetBranch}: ${treeRes.status} ${err}`);
  }
  const treeData = await treeRes.json();

  if (!treeData.tree || !Array.isArray(treeData.tree)) {
    throw new Error(`Repository tree is empty or invalid for ${owner}/${repo}`);
  }

  const scannableBlobs = treeData.tree.filter(item => item.type === 'blob' && isScannableFile(item.path)).slice(0, 80);

  // Fetch in concurrent batches to avoid taking 30 seconds
  const files = [];
  const batchSize = 10;
  for (let i = 0; i < scannableBlobs.length; i += batchSize) {
    const batch = scannableBlobs.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (blob) => {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${targetBranch}/${blob.path}`;
          const contentRes = await fetch(rawUrl, { headers });
          if (contentRes.ok) {
            const content = await contentRes.text();
            files.push({ path: blob.path, content });
          }
        } catch {
          // Ignore individual file error
        }
      })
    );
  }

  return files;
}
