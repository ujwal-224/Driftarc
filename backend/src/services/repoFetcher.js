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
  if (filePath.includes('node_modules/') || filePath.includes('.git/') || filePath.includes('dist/') || filePath.includes('build/')) {
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
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
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

/**
 * Fetches relevant files from a GitHub repository via the GitHub REST API tree.
 */
export async function fetchGitHubRepo({ owner, repo, branch, token }) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DriftCheck-Scanner'
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  // 1. Get default branch if not specified
  let targetBranch = branch;
  if (!targetBranch) {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      const err = await repoRes.text();
      throw new Error(`Failed to access GitHub repo ${owner}/${repo}: ${repoRes.status} ${err}`);
    }
    const repoData = await repoRes.json();
    targetBranch = repoData.default_branch || 'main';
  }

  // 2. Fetch the git tree recursively
  const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`;
  const treeRes = await fetch(treeUrl, { headers });
  if (!treeRes.ok) {
    const err = await treeRes.text();
    throw new Error(`Failed to fetch file tree for ${owner}/${repo}@${targetBranch}: ${treeRes.status} ${err}`);
  }
  const treeData = await treeRes.json();

  if (!treeData.tree || !Array.isArray(treeData.tree)) {
    throw new Error(`Repository tree is empty or invalid for ${owner}/${repo}`);
  }

  // Filter relevant files (limit up to 100 relevant files to stay within rate limits)
  const scannableBlobs = treeData.tree.filter(item => item.type === 'blob' && isScannableFile(item.path)).slice(0, 80);

  const files = [];
  for (const blob of scannableBlobs) {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${targetBranch}/${blob.path}`;
      const contentRes = await fetch(rawUrl, { headers });
      if (contentRes.ok) {
        const content = await contentRes.text();
        files.push({ path: blob.path, content });
      }
    } catch {
      // Continue on single file error
    }
  }

  return files;
}
