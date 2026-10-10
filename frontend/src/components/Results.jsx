import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  Copy, 
  Check, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Network
} from 'lucide-react';

export default function Results({
  findings = [],
  summary = {},
  connectionsCheck = [],
  diagramPreview,
  filesScanned = 0,
  onProceedToIssues,
  onBack,
  loading
}) {
  const [copied, setCopied] = useState(false);

  // Generate complete Markdown report
  const handleCopyMarkdown = () => {
    const lines = [];
    lines.push('# 📋 DriftCheck Architecture Drift Audit Report');
    lines.push(`Audit generated on: ${new Date().toISOString()}`);
    lines.push(`Total Files Scanned: ${filesScanned}`);
    lines.push('');
    lines.push('## Summary');
    lines.push(`- **Matches (Verified)**: ${summary.match || 0}`);
    lines.push(`- **Mismatches (Missing)**: ${summary.mismatch || 0}`);
    lines.push(`- **Undocumented (Surprise)**: ${summary.undocumented || 0}`);
    lines.push(`- **Unknown (No Signature)**: ${summary.unknown || 0}`);
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

    lines.push('*Report generated deterministically by DriftCheck.*');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton skeleton-text" style={{ width: '40%', height: '24px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '24px' }}></div>
        <div className="stats-grid">
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
          <div className="skeleton skeleton-card"></div>
        </div>
        <div className="skeleton skeleton-card" style={{ height: '200px' }}></div>
      </div>
    );
  }

  return (
    <div className="results-layout">
      {/* Sidebar: Diagram Thumbnail (Task 5) */}
      <div className="thumbnail-panel">
        <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Architecture Diagram
        </h4>
        {diagramPreview ? (
          <img src={diagramPreview} alt="Diagram" className="diagram-thumb" />
        ) : (
          <div style={{ height: '160px', background: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            No image preview
          </div>
        )}
        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          <div><strong>Files Scanned:</strong> {filesScanned}</div>
          <div><strong>Engine:</strong> Deterministic JS Pattern Matcher</div>
        </div>

        {/* Copy Markdown Report Button (Task 5) */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleCopyMarkdown}
          style={{ width: '100%', marginTop: '16px', fontSize: '13px' }}
        >
          {copied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
          {copied ? 'Copied to Clipboard!' : 'Copy Markdown Report'}
        </button>
      </div>

      {/* Main Results Container */}
      <div>
        {/* Metric Cards (Task 5) */}
        <div className="stats-grid">
          <div className="stat-card match">
            <span className="stat-title">Matched</span>
            <span className="stat-value">{summary.match || 0}</span>
          </div>
          <div className="stat-card mismatch">
            <span className="stat-title">Mismatch</span>
            <span className="stat-value">{summary.mismatch || 0}</span>
          </div>
          <div className="stat-card undocumented">
            <span className="stat-title">Undocumented</span>
            <span className="stat-value">{summary.undocumented || 0}</span>
          </div>
          <div className="stat-card unknown">
            <span className="stat-title">Unknown</span>
            <span className="stat-value">{summary.unknown || 0}</span>
          </div>
        </div>

        {/* Header with actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Inspection Findings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Detailed code references and drift diagnosis
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onProceedToIssues}
          >
            <Sparkles size={16} /> Draft GitHub Issues with Gemma 4 <ArrowRight size={16} />
          </button>
        </div>

        {/* Findings List */}
        <div className="findings-container">
          {findings.map((f, idx) => (
            <div key={idx} className={`finding-card status-${f.status}`}>
              <div className="finding-header">
                <div className="finding-name">
                  {f.status === 'match' && <CheckCircle2 size={18} style={{ color: '#10b981' }} />}
                  {f.status === 'mismatch' && <XCircle size={18} style={{ color: '#f43f5e' }} />}
                  {f.status === 'undocumented' && <AlertTriangle size={18} style={{ color: '#f59e0b' }} />}
                  {f.status === 'unknown' && <HelpCircle size={18} style={{ color: '#8b5cf6' }} />}
                  {f.name}
                </div>
                <span className={`badge badge-${f.status}`}>
                  {f.status}
                </span>
              </div>

              <div className="finding-reason">
                {f.reason}
              </div>

              {/* Evidence table */}
              {f.evidence && f.evidence.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table className="evidence-table">
                    <thead>
                      <tr>
                        <th>File</th>
                        <th style={{ width: '60px', textAlign: 'center' }}>Line</th>
                        <th>Evidence Snippet</th>
                        <th style={{ width: '80px' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {f.evidence.map((ev, eIdx) => (
                        <tr key={eIdx}>
                          <td><span className="code-badge">{ev.file}</span></td>
                          <td style={{ textAlign: 'center' }}><code>{ev.line}</code></td>
                          <td><span className="snippet-text">{ev.snippet}</span></td>
                          <td><span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{ev.type}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Connections Check (Task 6 heuristic) */}
        {connectionsCheck && connectionsCheck.length > 0 && (
          <div className="card" style={{ marginTop: '24px', padding: '20px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={18} style={{ color: 'var(--accent-cyan)' }} />
              Connections Check <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 'normal' }}>(Heuristic)</span>
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '14px' }}>
              Evaluates whether connecting components both exist and show signs of integration.
            </p>
            <div className="connections-list">
              {connectionsCheck.map((c, idx) => (
                <div key={idx} className="connection-item">
                  <span>
                    <strong style={{ marginRight: '6px' }}>{c.symbol}</strong>
                    <strong>{c.from}</strong> &rarr; <strong>{c.to}</strong>
                  </span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{c.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Architecture Review
          </button>
        </div>
      </div>
    </div>
  );
}
