import React, { useState } from 'react';

export default function Results({
  findings = [],
  summary = {},
  connectionsCheck = [],
  diagramPreview,
  filesScanned = 0,
  repoUrl = '',
  branch = '',
  onProceedToIssues,
  onBack,
  loading
}) {
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  const filteredFindings = findings.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'match') return f.status === 'match';
    if (filter === 'mismatch') return f.status === 'mismatch';
    if (filter === 'undocumented') return f.status === 'undocumented';
    return true;
  });

  const handleCopyMarkdown = () => {
    const lines = [];
    lines.push('# 📋 DriftCheck Architecture Drift Audit Report');
    lines.push(`Audit generated on: ${new Date().toISOString()}`);
    lines.push(`Target: ${repoUrl || 'Local Repo'}`);
    lines.push(`Total Files Scanned: ${filesScanned}`);
    lines.push('');
    lines.push('## Summary');
    lines.push(`- **Matches (Verified)**: ${summary.match || 0}`);
    lines.push(`- **Mismatches (Missing)**: ${summary.mismatch || 0}`);
    lines.push(`- **Undocumented (Surprise)**: ${summary.undocumented || 0}`);
    lines.push(`- **Unknown**: ${summary.unknown || 0}`);
    lines.push('');
    lines.push('## Detailed Findings');

    findings.forEach(f => {
      const statusIcon = f.status === 'match' ? '✅' : f.status === 'mismatch' ? '❌' : f.status === 'undocumented' ? '⚠️' : '❓';
      lines.push(`### ${statusIcon} [${f.status.toUpperCase()}] ${f.name}`);
      lines.push(`- **Reason**: ${f.reason}`);

      if (f.evidence && f.evidence.length > 0) {
        lines.push('- **Code References**:');
        lines.push('| File | Line | Snippet | Type |');
        lines.push('| :--- | :---: | :--- | :--- |');
        f.evidence.forEach(e => {
          lines.push(`| \`${e.file}\` | \`${e.line}\` | \`${(e.snippet || '').replace(/\|/g, '\\|')}\` | *${e.type || 'code'}* |`);
        });
      } else {
        lines.push('- *No codebase evidence detected.*');
      }
      lines.push('');
    });

    if (connectionsCheck && connectionsCheck.length > 0) {
      lines.push('## Architecture Connections Check (Heuristic)');
      connectionsCheck.forEach(c => {
        lines.push(`- ${c.symbol} **${c.from}** &rarr; **${c.to}**: ${c.note}`);
      });
      lines.push('');
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div class="flex flex-col lg:flex-row gap-gutter-split items-start">
        {/* Left Sticky Sidebar (w-80) */}
        <aside class="w-full lg:w-80 lg:sticky lg:top-20 flex flex-col gap-space-md shrink-0">
          {/* Architecture Diagram Box */}
          <div class="bg-surface-container-low border border-outline-variant rounded p-space-sm flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-mono-label font-mono-label text-on-surface-variant uppercase tracking-wider">
                Reference Input
              </span>
              <span class="text-mono-label font-mono-label text-primary">v2.1 Architecture</span>
            </div>
            <div class="relative bg-surface-container-lowest border border-outline-variant rounded overflow-hidden group">
              {diagramPreview ? (
                <img
                  src={diagramPreview}
                  alt="Architecture Diagram"
                  class="w-full h-36 object-contain opacity-90 group-hover:opacity-100 transition-opacity p-2"
                />
              ) : (
                <div class="w-full h-36 flex items-center justify-center text-outline text-xs font-mono-code">
                  No preview available
                </div>
              )}
              <div class="absolute inset-0 bg-transparent flex items-end justify-between p-2">
                <span class="text-mono-code font-mono-code text-[11px] bg-surface-container-lowest px-1.5 py-0.5 rounded text-on-surface border border-outline-variant">
                  diagram.png
                </span>
              </div>
            </div>
          </div>

          {/* Scan Metadata Card */}
          <div class="bg-surface-container-low border border-outline-variant rounded p-space-md flex flex-col gap-space-sm">
            <div class="flex items-center justify-between border-b border-outline-variant pb-2">
              <span class="text-mono-label font-mono-label text-on-surface-variant uppercase tracking-wider">
                Engine Verification
              </span>
              <span class="px-1.5 py-0.5 rounded bg-surface-container text-mono-label font-mono-label text-primary border border-outline-variant">
                AST + Docker Engine
              </span>
            </div>
            <div class="flex flex-col gap-2">
              <div>
                <span class="text-mono-label font-mono-label text-on-surface-variant block">Target</span>
                <span class="font-mono-code text-mono-code text-on-surface font-semibold text-xs truncate block">
                  {repoUrl || 'Local Workspace'}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-2 pt-1 border-t border-outline-variant">
                <div>
                  <span class="text-mono-label font-mono-label text-on-surface-variant block">Branch</span>
                  <span class="font-mono-code text-mono-code text-on-surface text-xs">{branch || 'main'}</span>
                </div>
                <div>
                  <span class="text-mono-label font-mono-label text-on-surface-variant block">Mode</span>
                  <span class="font-mono-code text-mono-code text-primary text-xs">Deterministic</span>
                </div>
              </div>
              <div class="pt-1 border-t border-outline-variant flex items-center justify-between text-mono-label font-mono-label">
                <span class="text-on-surface-variant">Diagnostics:</span>
                <span class="text-[#10B981]">{filesScanned} files scanned</span>
              </div>
            </div>

            {/* Copy Markdown Report */}
            <button
              onClick={handleCopyMarkdown}
              class="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 border border-outline-variant rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-mono-label text-mono-label"
            >
              <span class="material-symbols-outlined text-sm">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown Report'}</span>
            </button>
          </div>

          {/* Filters by Status */}
          <div class="bg-surface-container-low border border-outline-variant rounded p-space-md">
            <span class="text-mono-label font-mono-label text-on-surface-variant uppercase tracking-wider block mb-3">
              Filter Scan Results
            </span>
            <div class="flex flex-col gap-1.5">
              <button
                onClick={() => setFilter('all')}
                class={`flex items-center justify-between px-2.5 py-1.5 rounded border text-mono-label font-mono-label ${
                  filter === 'all'
                    ? 'border-primary text-primary bg-surface-container font-semibold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  <span>All Verified Signals</span>
                </span>
                <span class="px-1.5 py-0.2 rounded bg-surface text-on-surface">{findings.length}</span>
              </button>

              <button
                onClick={() => setFilter('match')}
                class={`flex items-center justify-between px-2.5 py-1.5 rounded border text-mono-label font-mono-label ${
                  filter === 'match'
                    ? 'border-primary text-primary bg-surface-container font-semibold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  <span>Matches</span>
                </span>
                <span class="px-1.5 py-0.2 rounded bg-surface-container text-[#10B981]">{summary.match || 0}</span>
              </button>

              <button
                onClick={() => setFilter('mismatch')}
                class={`flex items-center justify-between px-2.5 py-1.5 rounded border text-mono-label font-mono-label ${
                  filter === 'mismatch'
                    ? 'border-primary text-primary bg-surface-container font-semibold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#F43F5E]"></span>
                  <span>Mismatches</span>
                </span>
                <span class="px-1.5 py-0.2 rounded bg-surface-container text-[#F43F5E]">{summary.mismatch || 0}</span>
              </button>

              <button
                onClick={() => setFilter('undocumented')}
                class={`flex items-center justify-between px-2.5 py-1.5 rounded border text-mono-label font-mono-label ${
                  filter === 'undocumented'
                    ? 'border-primary text-primary bg-surface-container font-semibold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
                  <span>Undocumented</span>
                </span>
                <span class="px-1.5 py-0.2 rounded bg-surface-container text-[#F59E0B]">{summary.undocumented || 0}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main Findings Area */}
        <section class="flex-1 w-full flex flex-col gap-space-lg">
          {/* Top 4 Prominent Metric Cards */}
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {/* Metric 1: Matched */}
            <div class="bg-surface-container-low border border-outline-variant rounded p-space-md flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <span class="text-mono-label font-mono-label text-on-surface-variant uppercase">Topology Matched</span>
                <span class="flex items-center justify-center w-6 h-6 rounded bg-[#10B981] text-surface-container-lowest">
                  <span class="material-symbols-outlined text-sm font-bold">check</span>
                </span>
              </div>
              <div>
                <div class="text-mono-metric font-mono-metric text-[#10B981]">{summary.match || 0} Matched</div>
                <p class="text-mono-label font-mono-label text-on-surface-variant mt-1">Verified in code &amp; Docker</p>
              </div>
            </div>

            {/* Metric 2: Mismatches */}
            <div class="bg-surface-container-low border border-outline-variant rounded p-space-md flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <span class="text-mono-label font-mono-label text-on-surface-variant uppercase">Missing In Repo</span>
                <span class="flex items-center justify-center w-6 h-6 rounded bg-[#F43F5E] text-surface-container-lowest">
                  <span class="material-symbols-outlined text-sm font-bold">close</span>
                </span>
              </div>
              <div>
                <div class="text-mono-metric font-mono-metric text-[#F43F5E]">{summary.mismatch || 0} Mismatches</div>
                <p class="text-mono-label font-mono-label text-on-surface-variant mt-1">In diagram, missing in repo</p>
              </div>
            </div>

            {/* Metric 3: Undocumented */}
            <div class="bg-surface-container-low border border-outline-variant rounded p-space-md flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <span class="text-mono-label font-mono-label text-on-surface-variant uppercase">Unmapped Artifacts</span>
                <span class="flex items-center justify-center w-6 h-6 rounded bg-[#F59E0B] text-surface-container-lowest">
                  <span class="material-symbols-outlined text-sm font-bold">warning</span>
                </span>
              </div>
              <div>
                <div class="text-mono-metric font-mono-metric text-[#F59E0B]">{summary.undocumented || 0} Undocumented</div>
                <p class="text-mono-label font-mono-label text-on-surface-variant mt-1">Found in repo, absent in diagram</p>
              </div>
            </div>

            {/* Metric 4: Unknown */}
            <div class="bg-surface-container-low border border-outline-variant rounded p-space-md flex flex-col justify-between">
              <div class="flex items-center justify-between mb-2">
                <span class="text-mono-label font-mono-label text-on-surface-variant uppercase">Opaque Nodes</span>
                <span class="flex items-center justify-center w-6 h-6 rounded bg-[#8B5CF6] text-surface-container-lowest">
                  <span class="material-symbols-outlined text-sm font-bold">help</span>
                </span>
              </div>
              <div>
                <div class="text-mono-metric font-mono-metric text-[#8B5CF6]">{summary.unknown || 0} Unknown</div>
                <p class="text-mono-label font-mono-label text-on-surface-variant mt-1">Uncataloged signals</p>
              </div>
            </div>
          </div>

          {/* Detailed Finding Cards */}
          <div class="flex flex-col gap-space-md">
            <div class="flex items-center justify-between">
              <h2 class="text-headline-sm font-headline-sm text-on-surface">Detected Architectural Drift Findings</h2>
              <span class="text-mono-label font-mono-label text-on-surface-variant">Showing {filteredFindings.length} findings</span>
            </div>

            {filteredFindings.map((finding, idx) => {
              const isMismatch = finding.status === 'mismatch';
              const isUndoc = finding.status === 'undocumented';
              const isMatch = finding.status === 'match';
              const borderColor = isMismatch ? '#F43F5E' : isUndoc ? '#F59E0B' : isMatch ? '#10B981' : '#8B5CF6';

              return (
                <div
                  key={idx}
                  class="bg-surface-container-low border border-outline-variant rounded overflow-hidden"
                  style={{ borderLeft: `3px solid ${borderColor}` }}
                >
                  <div class="p-space-md flex flex-col gap-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined" style={{ color: borderColor }}>
                          {isMismatch ? 'layers_clear' : isUndoc ? 'difference' : 'check_circle'}
                        </span>
                        <h3 class="text-headline-sm font-headline-sm text-on-surface">{finding.name}</h3>
                        <span
                          class="px-2 py-0.5 rounded text-mono-label font-mono-label font-semibold bg-surface-container border"
                          style={{ borderColor, color: borderColor }}
                        >
                          {finding.status.toUpperCase()}
                        </span>
                      </div>
                      <div class="flex items-center gap-2 text-mono-label font-mono-label text-on-surface-variant">
                        <span>Evidence Count:</span>
                        <code class="px-1.5 py-0.5 rounded bg-surface border border-outline-variant text-primary font-mono-code text-xs">
                          {finding.evidence ? `${finding.evidence.length} points` : '0 points'}
                        </code>
                      </div>
                    </div>

                    <p class="text-body-sm font-body-sm text-on-surface-variant">
                      {finding.reason}
                    </p>

                    {/* Evidence Table */}
                    {finding.evidence && finding.evidence.length > 0 ? (
                      <div class="border border-outline-variant rounded bg-surface-container-lowest overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                          <thead>
                            <tr class="border-b border-outline-variant bg-surface-container text-mono-label font-mono-label text-on-surface-variant">
                              <th class="py-2 px-3">File Path</th>
                              <th class="py-2 px-3">Line #</th>
                              <th class="py-2 px-3">Code Snippet Preview</th>
                              <th class="py-2 px-3">Match Type</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-outline-variant font-mono-code text-xs">
                            {finding.evidence.map((ev, eIdx) => (
                              <tr key={eIdx} class="hover:bg-surface-container-low transition-colors">
                                <td class="py-2.5 px-3 text-primary">{ev.file}</td>
                                <td class="py-2.5 px-3 text-on-surface-variant">L{ev.line}</td>
                                <td class="py-2.5 px-3 text-on-surface">
                                  <code class="bg-surface px-1.5 py-0.5 rounded border border-outline-variant text-on-surface">
                                    {ev.snippet}
                                  </code>
                                </td>
                                <td class="py-2.5 px-3">
                                  <span class="px-2 py-0.5 rounded text-mono-label font-mono-label border border-outline-variant bg-surface text-on-surface">
                                    {ev.type || 'code'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div class="bg-surface-container-lowest border border-outline-variant rounded p-3 text-xs font-mono-code text-outline">
                        Zero matches found across package.json, docker-compose.yml, .env.example, and source files.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Heuristic Connections Verification Card */}
          {connectionsCheck && connectionsCheck.length > 0 && (
            <div class="bg-surface-container-low border border-outline-variant rounded p-space-md flex flex-col gap-3">
              <div class="flex items-center justify-between border-b border-outline-variant pb-2">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">schema</span>
                  <h3 class="text-headline-sm font-headline-sm text-on-surface">Heuristic Topology Verification</h3>
                </div>
                <span class="text-mono-label font-mono-label text-on-surface-variant">Call Graph Resolution</span>
              </div>
              <div class="flex flex-col gap-2 font-mono-code text-xs">
                {connectionsCheck.map((conn, idx) => (
                  <div
                    key={idx}
                    class="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded bg-surface-container border border-outline-variant gap-2"
                    style={{ borderLeft: conn.status === 'verified' ? '2px solid #10B981' : '2px solid #F43F5E' }}
                  >
                    <div class="flex items-center gap-2">
                      <span
                        class="px-1.5 py-0.5 rounded bg-surface border text-mono-label font-mono-label font-semibold"
                        style={{
                          color: conn.status === 'verified' ? '#10B981' : '#F43F5E',
                          borderColor: conn.status === 'verified' ? '#10B981' : '#F43F5E'
                        }}
                      >
                        {conn.status === 'verified' ? '✓ VERIFIED' : '✗ UNVERIFIED'}
                      </span>
                      <span class="text-on-surface font-semibold">{conn.from}</span>
                      <span class="text-on-surface-variant">➔</span>
                      <span class="text-on-surface font-semibold">{conn.to}</span>
                    </div>
                    <div class="text-mono-label font-mono-label text-on-surface-variant">
                      {conn.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Bottom Action Bar */}
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded bg-surface-container-low border border-outline-variant mt-2">
            <button
              onClick={onBack}
              class="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-mono-label text-xs rounded transition-colors flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-sm">arrow_back</span>
              Back to Architecture Review
            </button>

            <button
              onClick={onProceedToIssues}
              class="w-full sm:w-auto px-5 py-2.5 rounded bg-[#38BDF8] text-[#07090E] border border-[#38BDF8] hover:bg-[#0284C7] hover:border-[#0284C7] font-semibold text-xs font-mono-label transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <span>Draft GitHub Issues with Gemma 4</span>
              <span class="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
