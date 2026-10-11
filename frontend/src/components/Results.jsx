import React, { useState } from 'react';
import {
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  Route,
  Zap,
  Cpu,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle
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

  const perf = summary?.performance || null;

  const handleCopyMarkdown = () => {
    let md = `# DriftArc Architecture Audit Report\n\n`;
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-medium mb-2">
            <Zap className="w-3 h-3" />
            <span>4-Pillar Optimized Architecture Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Architecture Scan Results
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
            <span>Audit results for</span>
            <code 
              title={repoUrl}
              className="text-sky-600 dark:text-sky-400 font-mono text-xs bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 inline-block whitespace-nowrap max-w-[260px] sm:max-w-md truncate align-middle"
            >
              {repoUrl}
            </code>
            <span>({filesScanned} files scanned).</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyMarkdown}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy Markdown Report'}</span>
        </button>
      </div>

      {/* Optimized Telemetry Strip (Pillars 1-4) */}
      {perf && (
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Optimized Architecture Engine:</span>
            <span className="text-slate-600 dark:text-slate-400">Dynamic Synthesis • Polyglot AST • Flow Tracer • Hash Cache</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-500" />
              {perf.scanDurationMs}ms latency
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              ⚡ {perf.hitRatio} cache hit
            </span>
            <span>•</span>
            <span>{perf.filesScanned} files</span>
          </div>
        </div>
      )}

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Matches */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
            Matched
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{summary.match || 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">Found in diagram &amp; code</p>
          </div>
        </div>

        {/* Mismatches */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
            Mismatches
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 font-mono">{summary.mismatch || 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">In diagram, missing in code</p>
          </div>
        </div>

        {/* Undocumented */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
            Undocumented
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono">{summary.undocumented || 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">In code, missing from diagram</p>
          </div>
        </div>

        {/* Unknown */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
            Unknown
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </span>
          <div className="mt-2">
            <span className="text-3xl font-bold text-purple-600 dark:text-purple-400 font-mono">{summary.unknown || 0}</span>
            <p className="text-xs text-slate-500 mt-0.5">Uncataloged technologies</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'all'
              ? 'bg-sky-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          All Signals ({findings.length})
        </button>
        <button
          onClick={() => setFilter('match')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'match'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          Matches ({summary.match || 0})
        </button>
        <button
          onClick={() => setFilter('mismatch')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'mismatch'
              ? 'bg-rose-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          Mismatches ({summary.mismatch || 0})
        </button>
        <button
          onClick={() => setFilter('undocumented')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filter === 'undocumented'
              ? 'bg-amber-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-900'
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
              className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 transition-all shadow-sm"
              style={{ borderLeft: `3px solid ${badge.accent}` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{finding.name}</h3>
                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  {finding.synthesized && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5" />
                      Synthesized Rule
                    </span>
                  )}
                </div>
                {finding.evidence && finding.evidence.length > 0 && (
                  <span className="text-xs text-slate-500 font-mono">
                    {finding.evidence.length} evidence point{finding.evidence.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {finding.reason}
              </p>

              {/* Code Evidence Table */}
              {finding.evidence && finding.evidence.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] font-mono">
                        <th className="py-2 px-3 font-normal">File</th>
                        <th className="py-2 px-3 font-normal">Line</th>
                        <th className="py-2 px-3 font-normal">Matched Snippet</th>
                        <th className="py-2 px-3 font-normal">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-[11px]">
                      {finding.evidence.map((ev, eIdx) => (
                        <tr key={eIdx} className="hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-2 px-3 text-sky-600 dark:text-sky-400">{ev.file}</td>
                          <td className="py-2 px-3 text-slate-500">L{ev.line}</td>
                          <td className="py-2 px-3 text-slate-800 dark:text-slate-300">
                            <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                              {ev.snippet}
                            </code>
                          </td>
                          <td className="py-2 px-3 text-slate-400 capitalize">{ev.type || 'code'}</td>
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

      {/* Pillar 3: Real Call-Graph Connection Verification */}
      {connectionsCheck && connectionsCheck.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Route className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Call-Graph Flow Verification (Pillar 3)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">AST &amp; Client Invocations</span>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs">
            {connectionsCheck.map((conn, idx) => {
              const isVerified = conn.status === 'flow-verified';
              const isBroken = conn.status === 'broken-flow';

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{conn.from}</span>
                      <span className="text-sky-500">➔</span>
                      <span>{conn.to}</span>
                      {conn.label && (
                        <span className="text-[11px] font-normal text-slate-500">({conn.label})</span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase flex items-center gap-1 ${
                        isVerified
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : isBroken
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      }`}
                    >
                      {isVerified ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : isBroken ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {conn.status.replace('-', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">{conn.note}</p>

                  {/* Isolated Call Site Snippets */}
                  {conn.callSites && conn.callSites.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 font-mono text-[11px]">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Isolated Call Sites:</span>
                      {conn.callSites.slice(0, 3).map((cs, cIdx) => (
                        <div key={cIdx} className="flex items-center justify-between text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800">
                          <span className="text-sky-600 dark:text-sky-400">{cs.file}:L{cs.line}</span>
                          <code className="text-slate-700 dark:text-slate-200 truncate max-w-md">{cs.snippet}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </button>

        <button
          type="button"
          onClick={onProceedToIssues}
          className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <span>Draft GitHub Issues with Gemma 4</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}
