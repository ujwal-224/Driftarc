import React, { useState } from 'react';
import {
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  Route
} from 'lucide-react';

export default function Results({
  findings = [],
  summary = { total: 0, match: 0, mismatch: 0, undocumented: 0, unknown: 0 },
  connectionsCheck = [],
  diagramPreview = null,
  filesScanned = 0,
  repoUrl = '',
  branch = 'main',
  onProceedToIssues,
  onBack,
  loading = false
}) {
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const filteredFindings = findings.filter((f) => {
    if (filter === 'all') return true;
    return f.status === filter;
  });

  const handleCopyMarkdown = () => {
    let md = `# DriftCheck Architecture Audit Report\n\n`;
    md += `**Target:** \`${repoUrl}\` (${branch})\n`;
    md += `**Files Scanned:** ${filesScanned}\n`;
    md += `**Summary:** ${summary.match} Matched | ${summary.mismatch} Mismatches | ${summary.undocumented} Undocumented | ${summary.unknown} Unknown\n\n`;
    md += `## Detailed Findings\n\n`;

    findings.forEach((f) => {
      const icon = f.status === 'match' ? '✅' : f.status === 'mismatch' ? '❌' : f.status === 'undocumented' ? '⚠️' : '❓';
      md += `### ${icon} ${f.name} (${f.status.toUpperCase()})\n`;
      md += `*${f.reason}*\n\n`;
      if (f.evidence && f.evidence.length > 0) {
        md += `| File | Line | Snippet |\n|---|---|---|\n`;
        f.evidence.forEach((ev) => {
          md += `| \`${ev.file}\` | \`${ev.line}\` | \`${ev.snippet.replace(/\|/g, '\\|')}\` |\n`;
        });
        md += `\n`;
      }
    });

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'match':
        return {
          label: 'MATCH',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          accent: '#10B981'
        };
      case 'mismatch':
        return {
          label: 'MISMATCH',
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          accent: '#F43F5E'
        };
      case 'undocumented':
        return {
          label: 'UNDOCUMENTED',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          accent: '#F59E0B'
        };
      default:
        return {
          label: 'UNKNOWN',
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          accent: '#A855F7'
        };
    }
  };

  return (
    <main className="w-full max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Architecture Scan Results
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Audit results for <code className="text-sky-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{repoUrl}</code> ({filesScanned} files scanned).
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyMarkdown}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy Markdown Report'}</span>
        </button>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Matches */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
            Matched
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono">{summary.match || 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">Found in diagram &amp; code</p>
          </div>
        </div>

        {/* Mismatches */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
            Mismatches
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          </span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-rose-400 font-mono">{summary.mismatch || 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">In diagram, missing in code</p>
          </div>
        </div>

        {/* Undocumented */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
            Undocumented
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          </span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-amber-400 font-mono">{summary.undocumented || 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">In code, missing from diagram</p>
          </div>
        </div>

        {/* Unknown */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
            Unknown
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          </span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-purple-400 font-mono">{summary.unknown || 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">Uncataloged technologies</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'all'
              ? 'bg-sky-500 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          All Signals ({findings.length})
        </button>
        <button
          onClick={() => setFilter('match')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'match'
              ? 'bg-emerald-500 text-white'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
          }`}
        >
          Matches ({summary.match || 0})
        </button>
        <button
          onClick={() => setFilter('mismatch')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'mismatch'
              ? 'bg-rose-500 text-white'
              : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
          }`}
        >
          Mismatches ({summary.mismatch || 0})
        </button>
        <button
          onClick={() => setFilter('undocumented')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'undocumented'
              ? 'bg-amber-500 text-white'
              : 'text-slate-400 hover:text-amber-400 hover:bg-slate-900'
          }`}
        >
          Undocumented ({summary.undocumented || 0})
        </button>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding, idx) => {
          const badge = getStatusBadge(finding.status);

          return (
            <div
              key={idx}
              className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3.5 transition-all"
              style={{ borderLeft: `3px solid ${badge.accent}` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-semibold text-white">{finding.name}</h3>
                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
                {finding.evidence && finding.evidence.length > 0 && (
                  <span className="text-xs text-slate-500 font-mono">
                    {finding.evidence.length} evidence point{finding.evidence.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {finding.reason}
              </p>

              {/* Code Evidence Table */}
              {finding.evidence && finding.evidence.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-[11px] font-mono">
                        <th className="py-2 px-3 font-normal">File</th>
                        <th className="py-2 px-3 font-normal">Line</th>
                        <th className="py-2 px-3 font-normal">Matched Snippet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {finding.evidence.map((ev, eIdx) => (
                        <tr key={eIdx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-2 px-3 text-sky-400">{ev.file}</td>
                          <td className="py-2 px-3 text-slate-500">L{ev.line}</td>
                          <td className="py-2 px-3 text-slate-300">
                            <code className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {ev.snippet}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Heuristic Connections Verification (if present) */}
      {connectionsCheck && connectionsCheck.length > 0 && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Route className="w-4 h-4 text-sky-400" />
            Topology Connections Check
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {connectionsCheck.map((conn, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between"
              >
                <div className="font-mono text-slate-300">
                  <span>{conn.from}</span>
                  <span className="text-slate-500 mx-1.5">➔</span>
                  <span>{conn.to}</span>
                </div>
                <span className="text-slate-400 text-[11px]">{conn.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </button>

        <button
          type="button"
          onClick={onProceedToIssues}
          className="px-7 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
        >
          <span>Draft GitHub Issues with Gemma 4</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}
