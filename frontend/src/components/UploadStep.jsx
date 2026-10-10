import React, { useState } from 'react';
import {
  UploadCloud,
  FolderGit2,
  Image as ImageIcon,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileCode2,
  GitBranch,
  Layers,
  SearchCode,
  FileCheck2
} from 'lucide-react';
import { extractDiagram } from '../api.js';

export default function UploadStep({
  diagramImage,
  setDiagramImage,
  diagramPreview,
  setDiagramPreview,
  repoUrl,
  setRepoUrl,
  branch,
  setBranch,
  token,
  setToken,
  onExtracted
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFileChange = (file) => {
    if (!file) return;
    setError(null);
    setDiagramImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setDiagramPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const clearDiagram = () => {
    setDiagramImage(null);
    setDiagramPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagramImage && !diagramPreview) {
      setError('Please upload an architecture diagram image.');
      return;
    }
    if (!repoUrl) {
      setError('Please provide a repository URL or local folder path.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await extractDiagram(diagramImage, diagramPreview);
      onExtracted(result);
    } catch (err) {
      setError(err.message || 'Diagram extraction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium shadow-sm">
          <span>Multimodal Vision + Deterministic Code Scanner</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Audit Architecture Against Real Code
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Compare architecture diagrams with your GitHub repository to instantly discover phantom services, unmapped databases, and code drift.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-lg shadow-rose-950/20">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Main Studio Workbench Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Diagram Upload Zone */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>1. Architecture Diagram</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">PNG, JPG, SVG</span>
              </div>

              {!diagramPreview ? (
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group min-h-[220px] ${
                    dragActive
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10'
                      : 'border-slate-300 dark:border-slate-800 hover:border-sky-500/50 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('diagram-file-picker').click()}
                >
                  <input
                    id="diagram-file-picker"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-3 shadow-md group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Drop architecture diagram here
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    or <span className="text-sky-600 dark:text-sky-400 hover:underline font-medium">browse files</span> from your computer
                  </p>
                  <p className="text-[11px] text-slate-500 mt-3 font-mono">
                    Whiteboard photos, diagrams &amp; exports supported
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/[0.08] bg-slate-950/80 p-4 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {diagramImage?.name || 'diagram.png'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={clearDiagram}
                      className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-white/[0.04]"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Change</span>
                    </button>
                  </div>
                  <div className="w-full h-44 rounded-xl bg-black/60 flex items-center justify-center overflow-hidden border border-white/[0.06] p-2">
                    <img
                      src={diagramPreview}
                      alt="Uploaded Diagram"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Gemma 4 vision extracts components &amp; connections</span>
            </div>
          </div>

          {/* Card 2: Codebase Target Zone */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FolderGit2 className="w-3.5 h-3.5" />
                  </div>
                  <span>2. Target Repository</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Git AST Reader</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  GitHub URL or Local Path
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    <FileCode2 className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-slate-950/80 border border-slate-300 dark:border-white/[0.08] focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 text-slate-900 dark:text-white pl-10 pr-4 py-3 rounded-xl text-xs font-mono outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                    placeholder="e.g. https://github.com/owner/repo or ."
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                </div>

                {/* Quick Selection Chip */}
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[11px] text-slate-500">Current workspace:</span>
                  <button
                    type="button"
                    onClick={() => setRepoUrl('.')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-300 dark:border-white/[0.06] hover:border-sky-500/30 text-[11px] text-sky-600 dark:text-sky-300 hover:text-slate-900 dark:hover:text-white transition-all font-mono"
                  >
                    current directory (.)
                  </button>
                </div>
              </div>

              {/* Advanced Collapsible Settings */}
              <div className="border border-slate-200 dark:border-white/[0.06] rounded-xl bg-slate-50 dark:bg-slate-950/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-3.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                    <span>Branch &amp; GitHub Token</span>
                    <span className="text-[10px] text-slate-500">(Optional for private repos)</span>
                  </span>
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="p-4 pt-1 space-y-3.5 border-t border-white/[0.06]">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Branch</label>
                      <input
                        type="text"
                        className="w-full bg-slate-900 border border-white/[0.08] text-white px-3 py-2 rounded-lg text-xs font-mono outline-none focus:border-sky-500"
                        placeholder="main"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-slate-400">GitHub Personal Access Token (PAT)</label>
                        <span className="text-[10px] text-slate-500">Read-only scope</span>
                      </div>
                      <input
                        type="password"
                        className="w-full bg-slate-900 border border-white/[0.08] text-white px-3 py-2 rounded-lg text-xs font-mono outline-none focus:border-sky-500"
                        placeholder="ghp_••••••••••••••••••••••••••••••••"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Tokens are never stored or logged. Used strictly in-memory for repository reads.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero AI in scanner — pure deterministic verification</span>
            </div>
          </div>
        </div>

        {/* Integrated Primary Submit Action */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Step 1 of 4 • Vision extraction will take ~3-8 seconds
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Components with Gemma 4...</span>
              </>
            ) : (
              <>
                <span>Analyze Architecture</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Process Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel glass-card-interactive rounded-2xl p-5 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">1. Multimodal Vision</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Gemma 4 examines your architecture diagram to extract services, databases, queues, and communication vectors.
          </p>
        </div>

        <div className="glass-panel glass-card-interactive rounded-2xl p-5 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <SearchCode className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">2. Pure Deterministic Scanner</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            No AI in the scanner. Cross-references dependencies, docker manifests, .env, and source code with zero hallucinations.
          </p>
        </div>

        <div className="glass-panel glass-card-interactive rounded-2xl p-5 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">3. Automated Remediation</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Drafts concise GitHub issues for detected drift with concrete file and line evidence appended deterministically.
          </p>
        </div>
      </div>
    </main>
  );
}
