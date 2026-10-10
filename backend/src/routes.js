import express from 'express';
import multer from 'multer';
import { extractDiagram } from './services/gemma.js';
import { scan } from './services/scanner.js';
import { fetchGitHubRepo, fetchLocalRepo, parseGitHubUrl } from './services/repoFetcher.js';
import { draftIssue } from './services/issueWriter.js';
import { createGitHubIssue } from './services/github.js';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DriftArc API',
    timestamp: new Date().toISOString()
  });
});

/**
 * Upload and parse diagram image via Gemma 4 vision
 */
router.post('/diagram/extract', upload.single('image'), async (req, res) => {
  try {
    let imageBuffer = null;
    let mimeType = 'image/png';

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body?.imageBase64) {
      const match = req.body.imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        imageBuffer = Buffer.from(match[2], 'base64');
      } else {
        imageBuffer = Buffer.from(req.body.imageBase64, 'base64');
      }
    }

    if (!imageBuffer) {
      return res.status(400).json({ error: 'No image file or imageBase64 provided' });
    }

    const result = await extractDiagram(imageBuffer, mimeType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Run deterministic code scan against repository
 */
router.post('/scan', async (req, res) => {
  try {
    const { repoUrl, branch, localPath, components = [], connections = [] } = req.body;
    let files = req.body.files;
    const token = req.headers['x-github-token'] || req.body.token;

    if (!Array.isArray(files) || files.length === 0) {
      if (localPath) {
        files = fetchLocalRepo(localPath);
      } else if (repoUrl) {
        const parsed = parseGitHubUrl(repoUrl);
        if (!parsed) {
          return res.status(400).json({ error: `Invalid GitHub repository URL: "${repoUrl}"` });
        }
        files = await fetchGitHubRepo({
          owner: parsed.owner,
          repo: parsed.repo,
          branch,
          token
        });
      } else {
        return res.status(400).json({ error: 'Provide either repoUrl, localPath, or files array' });
      }
    }

    const scanResult = scan({ files, components, connections });
    res.json({
      ...scanResult,
      filesScanned: files.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Draft GitHub issues for findings
 */
router.post('/issues/draft', async (req, res) => {
  try {
    const { findings, finding, repoName } = req.body;
    const targetFindings = Array.isArray(findings) ? findings : (finding ? [finding] : []);

    if (targetFindings.length === 0) {
      return res.status(400).json({ error: 'No findings provided to draft issues' });
    }

    const drafts = [];
    for (const f of targetFindings) {
      // Only draft issues for actionable findings (mismatch or undocumented)
      if (f.status === 'mismatch' || f.status === 'undocumented') {
        const draft = await draftIssue({ finding: f, repoName });
        drafts.push(draft);
      }
    }

    res.json({ drafts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create or dry-run GitHub issue
 */
router.post('/issues/create', async (req, res) => {
  try {
    const { repoUrl, issue, dryRun = false } = req.body;
    const token = req.headers['x-github-token'] || req.body.token;

    if (!repoUrl) {
      return res.status(400).json({ error: 'repoUrl is required' });
    }
    if (!issue || !issue.title || !issue.body) {
      return res.status(400).json({ error: 'issue title and body are required' });
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({ error: 'Invalid GitHub repository URL' });
    }

    const result = await createGitHubIssue({
      owner: parsed.owner,
      repo: parsed.repo,
      title: issue.title,
      body: issue.body,
      token,
      dryRun
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
