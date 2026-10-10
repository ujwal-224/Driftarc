import React from 'react';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  SearchCode,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  GitPullRequest,
  Terminal,
  Zap,
  Lock,
  Workflow
} from 'lucide-react';
import ThreeHeroScene from './ThreeHeroScene.jsx';

export default function LandingPage({ onLaunchStudio }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col relative z-10 overflow-hidden">
      {/* ================= HERO SECTION WITH 3D WEBGL SCENE ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-10 pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Hero Content (7 Cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>World's First Multimodal Architecture Drift Detector</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Your architecture diagram is{' '}
              <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
                lying.
              </span>
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-white bg-clip-text text-transparent">
                DriftCheck uncovers the truth.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              Compare intended architecture diagrams against your actual GitHub codebase. 
              Multimodal AI extracts the blueprint; a <strong>pure deterministic scanner</strong> verifies the code with <strong>zero hallucinations</strong>.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onLaunchStudio}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 ring-1 ring-white/20 transition-all flex items-center gap-2.5 group"
              >
                <span>Launch DriftCheck Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.1] text-slate-200 text-sm font-semibold transition-all hover:border-slate-600 shadow-sm"
              >
                Explore How It Works
              </button>
            </div>

            {/* Value Highlights Pill Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero AI in Scanner</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Cpu className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Gemma 4 Multimodal</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Zero Secret Persistence</span>
              </div>
            </div>
          </div>

          {/* Right 3D Scene Viewport (5 Cols) */}
          <div className="lg:col-span-5 relative w-full h-[460px] sm:h-[540px] flex items-center justify-center">
            {/* Ambient Back Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-indigo-500/10 to-purple-500/20 rounded-3xl filter blur-3xl opacity-70 pointer-events-none"></div>

            {/* Glass Container Framing 3D Canvas */}
            <div className="relative w-full h-full rounded-3xl glass-panel p-2 overflow-hidden flex flex-col justify-between shadow-2xl">
              {/* Scene Top Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-white/[0.1] text-[11px] text-slate-300 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Interactive 3D Microservice Mesh</span>
              </div>

              {/* Drift Alert Badge */}
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/90 border border-rose-500/40 text-[11px] text-rose-300 font-mono shadow-lg backdrop-blur-md">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>[Redis: Mismatch Detected]</span>
              </div>

              {/* Three.js Interactive WebGL Component */}
              <ThreeHeroScene />
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE ARCHITECTURE SIMULATOR ================= */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Workflow className="w-3.5 h-3.5" />
            <span>The Deterministic Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How DriftCheck Solves Architectural Erosion
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Most teams update code but forget diagrams. DriftCheck creates a continuous feedback loop between visual documentation and source repositories.
          </p>
        </div>

        {/* 3 Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass-panel glass-card-interactive rounded-3xl p-7 space-y-4 relative group">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 text-xl font-bold shadow-lg shadow-sky-500/10">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Visual Blueprint Parsing</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Drop an architecture diagram (PNG, JPG, SVG, whiteboard photo). Gemma 4 visual vision reads all microservice boxes, databases, and network connections into structured JSON.
            </p>
            <div className="pt-2 text-xs font-mono text-sky-400 flex items-center gap-1.5">
              <span>Output: &#123; components, connections &#125;</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glass-panel glass-card-interactive rounded-3xl p-7 space-y-4 relative group border-emerald-500/20">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold shadow-lg shadow-emerald-500/10">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Deterministic AST Code Scan</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>Strictly Zero AI in the scanner.</strong> The engine scans <code>package.json</code>, <code>docker-compose.yml</code>, <code>.env</code>, and source imports against verified technology signatures.
            </p>
            <div className="pt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Exact file:line evidence points</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glass-panel glass-card-interactive rounded-3xl p-7 space-y-4 relative group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl font-bold shadow-lg shadow-purple-500/10">
              3
            </div>
            <h3 className="text-lg font-bold text-white">1-Click GitHub Remediation</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Identified mismatches and undocumented services are drafted into concise GitHub issues. Evidence tables are attached deterministically by code without hallucinations.
            </p>
            <div className="pt-2 text-xs font-mono text-purple-400 flex items-center gap-1.5">
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Direct GitHub Octokit dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ARCHITECTURE DRIFT EXAMPLE COMPARISON ================= */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-xs font-mono text-rose-400 uppercase tracking-wider font-semibold">
                Real-World Drift Example
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                "We thought we were using Redis and Postgres."
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                In real engineering teams, architecture diagrams lag behind reality. A developer replaces Postgres with MongoDB, or removes Redis caching, but nobody updates the confluence diagram.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span><strong>Redis:</strong> Documented in diagram, 0 code references (Mismatch).</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span><strong>MongoDB:</strong> Active in Docker, absent from diagram (Undocumented).</span>
                </div>
              </div>
            </div>

            {/* Code Audit Terminal Mockup */}
            <div className="lg:col-span-7 bg-slate-950/90 rounded-2xl border border-white/[0.1] p-5 font-mono text-xs shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-slate-400 ml-2">driftcheck-audit.log</span>
                </div>
                <span>git: main</span>
              </div>

              <div className="space-y-1.5 text-slate-300 pt-1">
                <p className="text-sky-400">$ driftcheck scan --diagram ./arch.png --repo ./backend</p>
                <p className="text-slate-400">Scanning repository: 34 source files, 3 package manifests...</p>
                <p className="text-emerald-400">  [MATCH] React Client ➔ frontend/package.json:L8</p>
                <p className="text-emerald-400">  [MATCH] Express API   ➔ backend/package.json:L9</p>
                <p className="text-rose-400">  [MISMATCH] Redis Cache ➔ 0 occurrences across all manifests</p>
                <p className="text-amber-400">  [UNDOCUMENTED] MongoDB ➔ docker-compose.yml:L17 (image: mongo:6.0)</p>
                <p className="text-slate-400 pt-2 border-t border-white/[0.08]">
                  Audit Verdict: <span className="text-rose-400 font-bold">1 Mismatch</span>, <span className="text-amber-400 font-bold">1 Undocumented</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CONVERSION HERO CTA ================= */}
      <section className="py-20 px-6 max-w-4xl mx-auto w-full text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ready to eliminate architectural debt?
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Upload any architecture diagram now and audit your repository in under 10 seconds.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onLaunchStudio}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-base shadow-2xl shadow-sky-500/30 ring-1 ring-white/20 transition-all inline-flex items-center gap-3 group"
          >
            <span>Launch DriftCheck Studio</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </section>
    </div>
  );
}
