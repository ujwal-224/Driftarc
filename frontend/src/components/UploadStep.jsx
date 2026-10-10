import React, { useState } from 'react';
import {
  Sparkles,
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
  AlertCircle
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

  const loadSampleDemo = async () => {
    setError(null);
    setRepoUrl('demo/planted-drift');
    setBranch('main');
    setDiagramPreview('/demo-diagram.png');

    const sampleComponents = [
      { name: 'React', type: 'frontend' },
      { name: 'API', type: 'service' },
      { name: 'Postgres', type: 'database' },
      { name: 'Redis', type: 'cache' },
      { name: 'Stripe', type: 'external' }
    ];
    const sampleConnections = [
      { from: 'React', to: 'API', label: 'HTTP/REST' },
      { from: 'API', to: 'Postgres', label: 'Queries' },
      { from: 'API', to: 'Redis', label: 'Cache' },
      { from: 'API', to: 'Stripe', label: 'Payments' }
    ];

    try {
      const res = await fetch('/demo-diagram.png');
      if (res.ok) {
        const blob = await res.blob();
        setDiagramImage(blob);
      }
    } catch {
      // Continue with preview
    }

    onExtracted({ components: sampleComponents, connections: sampleConnections });
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
    <main className="w-full max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Clean Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Compare Architecture vs Codebase
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
            Upload an architecture diagram and select your codebase to spot missing services, unmapped databases, and architectural drift.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSampleDemo}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-sky-500/50 hover:bg-slate-800 text-sky-400 text-xs font-medium transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Demo Sample</span>
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two Balanced Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Diagram Upload Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                Architecture Diagram
              </span>
              <span className="text-xs text-slate-500">PNG, JPG, SVG</span>
            </div>

            {!diagramPreview ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-sky-400 bg-sky-500/10'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
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
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-sky-400 mb-3 shadow-inner">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  Drop diagram image here
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  or <span className="text-sky-400 hover:underline">browse files</span> from your computer
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-200 font-medium truncate">
                      {diagramImage?.name || 'diagram.png'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearDiagram}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Change
                  </button>
                </div>
                <div className="w-full h-44 rounded-lg bg-black/40 flex items-center justify-center overflow-hidden border border-slate-800/60">
                  <img
                    src={diagramPreview}
                    alt="Uploaded Diagram"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            Parsed visually via Gemma 4 multimodal vision
          </div>
        </div>

        {/* Right: Codebase Target Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-sky-400" />
                Target Codebase
              </span>
              <span className="text-xs text-slate-500">Local or GitHub</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Repository Path or URL
              </label>
              <input
                type="text"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-mono outline-none transition-colors"
                placeholder="e.g. demo/planted-drift or owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-slate-500">Quick fill:</span>
                <button
                  type="button"
                  onClick={() => setRepoUrl('demo/planted-drift')}
                  className="text-[11px] text-slate-400 hover:text-sky-300 underline"
                >
                  demo/planted-drift
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setRepoUrl('.')}
                  className="text-[11px] text-slate-400 hover:text-sky-300 underline"
                >
                  current repo (.)
                </button>
              </div>
            </div>

            {/* Collapsible Advanced Settings */}
            <div className="border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span className="font-medium">
                  Branch &amp; GitHub Token (Optional)
                </span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showAdvanced && (
                <div className="p-3.5 pt-0 space-y-3 border-t border-slate-800/60 mt-1">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target Branch</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-mono outline-none focus:border-sky-500"
                      placeholder="main"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-slate-400">GitHub Personal Access Token</label>
                      <span className="text-[10px] text-slate-500">Private repos only</span>
                    </div>
                    <input
                      type="password"
                      className="w-full bg-slate-900 border border-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-mono outline-none focus:border-sky-500"
                      placeholder="ghp_••••••••••••••••••••••••••••••••"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Tokens are never saved or stored. Used solely for in-memory reads.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            Zero AI in repository scanner — pure deterministic audit
          </div>
        </div>
      </div>

      {/* Prominent Action Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Diagram with Gemma 4...</span>
            </>
          ) : (
            <>
              <span>Analyze Architecture</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </main>
  );
}
