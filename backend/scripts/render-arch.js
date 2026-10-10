import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive, beautiful architecture SVG
const fullArchitectureSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="760" viewBox="0 0 1280 760" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1280" y2="760" gradientUnits="userSpaceOnUse">
      <stop stop-color="#080c14"/>
      <stop offset="0.5" stop-color="#0d1424"/>
      <stop offset="1" stop-color="#11192e"/>
    </linearGradient>

    <linearGradient id="cyanCard" x1="0" y1="0" x2="280" y2="200" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0e2439" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#142f4c" stop-opacity="0.9"/>
    </linearGradient>

    <linearGradient id="indigoCard" x1="0" y1="0" x2="380" y2="400" gradientUnits="userSpaceOnUse">
      <stop stop-color="#151b38" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#1e2652" stop-opacity="0.9"/>
    </linearGradient>

    <linearGradient id="purpleCard" x1="0" y1="0" x2="280" y2="200" gradientUnits="userSpaceOnUse">
      <stop stop-color="#221338" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#321b54" stop-opacity="0.9"/>
    </linearGradient>

    <filter id="cardGlowCyan" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#06b6d4" flood-opacity="0.25"/>
    </filter>

    <filter id="cardGlowIndigo" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#6366f1" flood-opacity="0.25"/>
    </filter>

    <filter id="cardGlowPurple" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#a855f7" flood-opacity="0.25"/>
    </filter>

    <marker id="arrowCyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
    </marker>
    <marker id="arrowIndigo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
    </marker>
    <marker id="arrowPurple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
    </marker>
  </defs>

  <!-- Background Canvas -->
  <rect width="1280" height="760" fill="url(#bgGrad)"/>

  <!-- Subtle Grid lines -->
  <g stroke="#ffffff" stroke-opacity="0.03" stroke-width="1">
    <line x1="0" y1="120" x2="1280" y2="120" />
    <line x1="0" y1="240" x2="1280" y2="240" />
    <line x1="0" y1="360" x2="1280" y2="360" />
    <line x1="0" y1="480" x2="1280" y2="480" />
    <line x1="0" y1="600" x2="1280" y2="600" />
  </g>

  <!-- Header Banner -->
  <g transform="translate(60, 48)">
    <rect width="140" height="28" rx="6" fill="#1e293b" stroke="#334155" />
    <text x="70" y="18" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">SYSTEM ARCHITECTURE</text>
    <text x="0" y="62" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold">DriftCheck Architecture</text>
    <text x="0" y="90" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="14">Deterministic Codebase Scanner &amp; Multimodal Architecture Drift Detector</text>
  </g>

  <!-- ================= TIER 1: FRONTEND ================= -->
  <g transform="translate(60, 180)" filter="url(#cardGlowCyan)">
    <rect width="300" height="490" rx="16" fill="url(#cyanCard)" stroke="#0284c7" stroke-width="2"/>
    
    <!-- Header -->
    <rect width="300" height="56" rx="16" fill="#0369a1" fill-opacity="0.3"/>
    <circle cx="34" cy="28" r="10" fill="#0284c7" fill-opacity="0.4" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="34" y="32" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">UI</text>
    <text x="58" y="27" fill="#f0f9ff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">Frontend Client</text>
    <text x="58" y="44" fill="#7dd3fc" font-family="system-ui, sans-serif" font-size="12">Vite + React (Port 5173)</text>

    <!-- Sub-components -->
    <g transform="translate(20, 80)">
      <rect width="260" height="74" rx="10" fill="#082f49" stroke="#0ea5e9" stroke-width="1"/>
      <text x="16" y="26" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Step 1: Upload &amp; Target</text>
      <text x="16" y="46" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Architecture diagram upload (PNG/JPG)</text>
      <text x="16" y="62" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Local path or GitHub repo selector</text>
    </g>

    <g transform="translate(20, 170)">
      <rect width="260" height="74" rx="10" fill="#082f49" stroke="#0ea5e9" stroke-width="1"/>
      <text x="16" y="26" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Step 2: Review Extraction</text>
      <text x="16" y="46" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Human-in-the-loop inspection</text>
      <text x="16" y="62" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Add/edit components &amp; connections</text>
    </g>

    <g transform="translate(20, 260)">
      <rect width="260" height="74" rx="10" fill="#082f49" stroke="#0ea5e9" stroke-width="1"/>
      <text x="16" y="26" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Step 3: Drift Findings</text>
      <text x="16" y="46" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Match / Mismatch / Undocumented</text>
      <text x="16" y="62" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Line-level evidence file viewer</text>
    </g>

    <g transform="translate(20, 350)">
      <rect width="260" height="74" rx="10" fill="#082f49" stroke="#0ea5e9" stroke-width="1"/>
      <text x="16" y="26" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Step 4: Issue Panel</text>
      <text x="16" y="46" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Review AI drafted issue narrative</text>
      <text x="16" y="62" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">1-click publish to GitHub via Octokit</text>
    </g>

    <!-- Footer tag -->
    <text x="150" y="460" fill="#0284c7" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">Tailwind CSS + Google Stitch Dark Theme</text>
  </g>

  <!-- Connector: Frontend -> Backend -->
  <path d="M 360 420 L 460 420" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowCyan)" />
  <rect x="375" y="396" width="70" height="20" rx="4" fill="#082f49" stroke="#0284c7"/>
  <text x="410" y="410" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">/api proxy</text>

  <!-- ================= TIER 2: BACKEND SERVER ================= -->
  <g transform="translate(470, 180)" filter="url(#cardGlowIndigo)">
    <rect width="400" height="490" rx="16" fill="url(#indigoCard)" stroke="#4f46e5" stroke-width="2"/>
    
    <!-- Header -->
    <rect width="400" height="56" rx="16" fill="#4338ca" fill-opacity="0.3"/>
    <circle cx="34" cy="28" r="10" fill="#4f46e5" fill-opacity="0.4" stroke="#818cf8" stroke-width="1.5"/>
    <text x="34" y="32" fill="#818cf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">API</text>
    <text x="58" y="27" fill="#eef2ff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">Backend Server (Node 20+ / ESM)</text>
    <text x="58" y="44" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="12">Express Core Engine (Port 3001)</text>

    <!-- Sub-components -->
    <g transform="translate(20, 75)">
      <rect width="360" height="66" rx="10" fill="#1e1b4b" stroke="#6366f1" stroke-width="1"/>
      <text x="16" y="24" fill="#818cf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">API Router (routes.js)</text>
      <text x="16" y="44" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">POST /api/extract  •  POST /api/scan</text>
      <text x="16" y="58" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">POST /api/issue/draft  •  POST /api/issue/publish</text>
    </g>

    <g transform="translate(20, 155)">
      <rect width="360" height="88" rx="10" fill="#1e1b4b" stroke="#6366f1" stroke-width="1"/>
      <text x="16" y="24" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Repository Fetcher (repoFetcher.js)</text>
      <text x="16" y="44" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Local filesystem reader (respects .gitignore)</text>
      <text x="16" y="60" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">GitHub Octokit REST API tree fetcher (in-memory)</text>
      <text x="16" y="76" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Never writes token or code to permanent disk</text>
    </g>

    <g transform="translate(20, 255)">
      <rect width="360" height="96" rx="10" fill="#1e1b4b" stroke="#10b981" stroke-width="1.5"/>
      <text x="16" y="24" fill="#34d399" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Pure Deterministic Scanner (scanner.js)</text>
      <text x="16" y="42" fill="#6ee7b7" font-family="system-ui, sans-serif" font-size="11" font-weight="bold">🔒 ZERO AI IN SCANNER — PURE &amp; REPRODUCIBLE</text>
      <text x="16" y="60" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Matches: package.json, docker-compose, .env, imports</text>
      <text x="16" y="74" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Rules Catalog: 16+ Signatures (Postgres, Redis, Auth0...)</text>
      <text x="16" y="88" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Returns: Exact file:line evidence + snippet</text>
    </g>

    <g transform="translate(20, 363)">
      <rect width="360" height="74" rx="10" fill="#1e1b4b" stroke="#6366f1" stroke-width="1"/>
      <text x="16" y="24" fill="#818cf8" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Issue Writer Engine (issueWriter.js)</text>
      <text x="16" y="44" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">AI drafts narrative from verified facts only</text>
      <text x="16" y="60" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">Code appends deterministic evidence table</text>
    </g>

    <!-- Footer tag -->
    <text x="200" y="464" fill="#6366f1" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">Strict Separation: Deterministic Verification vs AI</text>
  </g>

  <!-- Connectors: Backend -> External Services -->
  <path d="M 870 280 L 960 280" stroke="#c084fc" stroke-width="2.5" marker-end="url(#arrowPurple)" />
  <path d="M 870 540 L 960 540" stroke="#818cf8" stroke-width="2.5" marker-end="url(#arrowIndigo)" />

  <!-- ================= TIER 3: EXTERNAL SERVICES ================= -->
  <g transform="translate(970, 180)" filter="url(#cardGlowPurple)">
    <rect width="250" height="490" rx="16" fill="url(#purpleCard)" stroke="#9333ea" stroke-width="2"/>
    
    <!-- Header -->
    <rect width="250" height="56" rx="16" fill="#7e22ce" fill-opacity="0.3"/>
    <circle cx="34" cy="28" r="10" fill="#9333ea" fill-opacity="0.4" stroke="#c084fc" stroke-width="1.5"/>
    <text x="34" y="32" fill="#c084fc" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">☁️</text>
    <text x="58" y="27" fill="#faf5ff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">External Services</text>
    <text x="58" y="44" fill="#d8b4fe" font-family="system-ui, sans-serif" font-size="12">AI Vision, Text &amp; GitHub</text>

    <!-- Box A: Multimodal Vision -->
    <g transform="translate(18, 75)">
      <rect width="214" height="120" rx="10" fill="#2e1065" stroke="#a855f7" stroke-width="1"/>
      <text x="14" y="24" fill="#c084fc" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Gemma 4 / Gemini Vision</text>
      <text x="14" y="46" fill="#d8b4fe" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Visual Diagram Parser</text>
      <text x="14" y="66" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">• Input: PNG/JPG buffer</text>
      <text x="14" y="82" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">• Output: components JSON</text>
      <text x="14" y="98" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">• Output: connections JSON</text>
    </g>

    <!-- Box B: Narrative Generation -->
    <g transform="translate(18, 210)">
      <rect width="214" height="110" rx="10" fill="#2e1065" stroke="#a855f7" stroke-width="1"/>
      <text x="14" y="24" fill="#c084fc" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">Gemma 4 / Gemini Text</text>
      <text x="14" y="46" fill="#d8b4fe" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Issue Narrative Drafting</text>
      <text x="14" y="66" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">• Input: Verified scan finding</text>
      <text x="14" y="82" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">• Output: Title &amp; remediation</text>
      <text x="14" y="98" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">• No hallucinated facts</text>
    </g>

    <!-- Box C: GitHub API -->
    <g transform="translate(18, 335)">
      <rect width="214" height="110" rx="10" fill="#2e1065" stroke="#818cf8" stroke-width="1"/>
      <text x="14" y="24" fill="#a5b4fc" font-family="system-ui, sans-serif" font-size="13" font-weight="bold">GitHub REST API</text>
      <text x="14" y="46" fill="#c7d2fe" font-family="system-ui, sans-serif" font-size="11" font-weight="600">Octokit Integration</text>
      <text x="14" y="66" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">• Remote repo tree fetching</text>
      <text x="14" y="82" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">• Direct GitHub Issue creation</text>
      <text x="14" y="98" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11">• Zero token persistence</text>
    </g>

    <!-- Footer tag -->
    <text x="125" y="464" fill="#a855f7" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-anchor="middle">Secure HTTPS Integrations</text>
  </g>

  <!-- Legend in Footer -->
  <g transform="translate(60, 695)">
    <text x="0" y="16" fill="#64748b" font-family="system-ui, sans-serif" font-size="12">Key Design Principles:</text>
    
    <circle cx="160" cy="12" r="5" fill="#38bdf8"/>
    <text x="175" y="16" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Human-in-the-Loop Review</text>

    <circle cx="360" cy="12" r="5" fill="#10b981"/>
    <text x="375" y="16" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Deterministic Scanner (No AI Decisions)</text>

    <circle cx="630" cy="12" r="5" fill="#c084fc"/>
    <text x="645" y="16" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">AI Vision for Extraction Only</text>

    <circle cx="860" cy="12" r="5" fill="#f43f5e"/>
    <text x="875" y="16" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Zero Token / Secret Storage</text>
  </g>
</svg>
`;

// Helper to convert SVG to PNG using macOS built-in sips / qlmanage / or chromium
function renderSvgToPng(svgContent, targetPngPath) {
  const dir = path.dirname(targetPngPath);
  fs.mkdirSync(dir, { recursive: true });

  const targetSvgPath = targetPngPath.replace(/\.png$/, '.svg');
  fs.writeFileSync(targetSvgPath, svgContent);

  // We can convert SVG to high-res PNG
  const tempDir = path.dirname(targetPngPath);
  execSync(`qlmanage -t -s 2000 -o "${tempDir}" "${targetSvgPath}"`, { stdio: 'pipe' });

  const generatedThumbnail = `${targetSvgPath}.png`;
  if (fs.existsSync(generatedThumbnail)) {
    fs.copyFileSync(generatedThumbnail, targetPngPath);
    fs.unlinkSync(generatedThumbnail);
  }
  console.log(`Rendered: ${targetPngPath} (${fs.statSync(targetPngPath).size} bytes)`);
}

const docsPng = path.resolve(__dirname, '../../docs/architecture.png');
renderSvgToPng(fullArchitectureSvg, docsPng);

// Also copy to frontend public directory so it can be previewed or served
const frontendPublic = path.resolve(__dirname, '../../frontend/public/architecture.png');
fs.copyFileSync(docsPng, frontendPublic);
console.log(`Copied to frontend public: ${frontendPublic}`);
