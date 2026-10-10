import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Planted drift diagram (5 boxes: React, API, Postgres, Redis, Stripe)
const plantedDriftSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="600" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1000" y2="600" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0f172a"/>
      <stop offset="1" stop-color="#1e1e38"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="200" y2="120" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1e293b"/>
      <stop offset="1" stop-color="#334155"/>
    </linearGradient>
    <filter id="shadow" x="-10" y="-10" width="220" height="140" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
    </marker>
  </defs>

  <!-- Background -->
  <rect width="1000" height="600" fill="url(#bg)"/>

  <!-- Title -->
  <text x="50" y="55" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold">System Architecture: Planned E-Commerce Stack</text>
  <text x="50" y="85" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="14">Intended target architecture before drift</text>

  <!-- Box 1: React -->
  <g transform="translate(60, 240)">
    <rect width="180" height="110" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="2" filter="url(#shadow)"/>
    <text x="90" y="48" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">React</text>
    <text x="90" y="75" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" text-anchor="middle">Client Frontend</text>
  </g>

  <!-- Box 2: API (Express) -->
  <g transform="translate(390, 240)">
    <rect width="180" height="110" rx="12" fill="#1e293b" stroke="#818cf8" stroke-width="2" filter="url(#shadow)"/>
    <text x="90" y="48" fill="#818cf8" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">API</text>
    <text x="90" y="75" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" text-anchor="middle">Express Backend</text>
  </g>

  <!-- Box 3: Postgres -->
  <g transform="translate(730, 90)">
    <rect width="180" height="110" rx="12" fill="#1e293b" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
    <text x="90" y="48" fill="#60a5fa" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">Postgres</text>
    <text x="90" y="75" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" text-anchor="middle">Relational Database</text>
  </g>

  <!-- Box 4: Redis -->
  <g transform="translate(730, 240)">
    <rect width="180" height="110" rx="12" fill="#1e293b" stroke="#ef4444" stroke-width="2" filter="url(#shadow)"/>
    <text x="90" y="48" fill="#f87171" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">Redis</text>
    <text x="90" y="75" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" text-anchor="middle">In-Memory Cache</text>
  </g>

  <!-- Box 5: Stripe -->
  <g transform="translate(730, 390)">
    <rect width="180" height="110" rx="12" fill="#1e293b" stroke="#a855f7" stroke-width="2" filter="url(#shadow)"/>
    <text x="90" y="48" fill="#c084fc" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">Stripe</text>
    <text x="90" y="75" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13" text-anchor="middle">Payments Gateway</text>
  </g>

  <!-- Connections -->
  <!-- React -> API -->
  <path d="M 240 295 L 380 295" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
  <text x="310" y="285" fill="#64748b" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">HTTP/REST</text>

  <!-- API -> Postgres -->
  <path d="M 570 270 L 720 150" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
  <!-- API -> Redis -->
  <path d="M 570 295 L 720 295" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
  <!-- API -> Stripe -->
  <path d="M 570 320 L 720 440" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow)" />
</svg>
`;

// 2. DriftCheck self-architecture diagram (React -> Express API -> Gemma 4 / GitHub API)
const selfArchSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1000" height="500" viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="selfBg" x1="0" y1="0" x2="1000" y2="500" gradientUnits="userSpaceOnUse">
      <stop stop-color="#090d16"/>
      <stop offset="1" stop-color="#141829"/>
    </linearGradient>
    <marker id="selfArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
    </marker>
  </defs>

  <rect width="1000" height="500" fill="url(#selfBg)"/>

  <text x="50" y="55" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold">DriftCheck Architecture</text>
  <text x="50" y="85" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="14">Frontend client and backend scanning service</text>

  <!-- Box 1: React -->
  <g transform="translate(80, 200)">
    <rect width="200" height="110" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="100" y="50" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">React</text>
    <text x="100" y="75" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">Vite Web Frontend</text>
  </g>

  <!-- Box 2: Express API -->
  <g transform="translate(420, 200)">
    <rect width="200" height="110" rx="12" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
    <text x="100" y="50" fill="#818cf8" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">API</text>
    <text x="100" y="75" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">Express Server</text>
  </g>

  <!-- Box 3: External Services (Gemma 4 & GitHub API) -->
  <g transform="translate(740, 200)">
    <rect width="200" height="110" rx="12" fill="#1e293b" stroke="#a855f7" stroke-width="2"/>
    <text x="100" y="50" fill="#c084fc" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">Gemma 4 / GitHub</text>
    <text x="100" y="75" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">AI Vision &amp; Issue API</text>
  </g>

  <!-- Connectors -->
  <path d="M 280 255 L 410 255" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#selfArrow)" />
  <text x="345" y="245" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">/api proxy</text>

  <path d="M 620 255 L 730 255" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#selfArrow)" />
  <text x="675" y="245" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">REST / HTTPS</text>
</svg>
`;

function renderSvgToPng(svgContent, targetPngPath) {
  const dir = path.dirname(targetPngPath);
  fs.mkdirSync(dir, { recursive: true });

  const tempSvgPath = targetPngPath.replace(/\.png$/, '.svg');
  fs.writeFileSync(tempSvgPath, svgContent);

  // Render via qlmanage
  const tempDir = path.dirname(tempSvgPath);
  execSync(`qlmanage -t -s 1200 -o "${tempDir}" "${tempSvgPath}"`, { stdio: 'pipe' });

  const generatedThumbnail = `${tempSvgPath}.png`;
  if (fs.existsSync(generatedThumbnail)) {
    fs.copyFileSync(generatedThumbnail, targetPngPath);
    fs.unlinkSync(generatedThumbnail);
  }
  console.log(`Generated: ${targetPngPath}`);
}

const docsPng = path.resolve(__dirname, '../../docs/architecture.png');
renderSvgToPng(selfArchSvg, docsPng);
