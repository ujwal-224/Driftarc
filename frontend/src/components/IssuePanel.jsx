import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Eye, 
  ExternalLink,
  Code,
  ShieldCheck
} from 'lucide-react';
import { draftIssues, createIssue } from '../api.js';

export default function IssuePanel({
  findings = [],
  repoUrl = '',
  token = '',
  onBack
}) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dryRun, setDryRun] = useState(true);
  const [createdResults, setCreatedResults] = useState({});
  const [submittingIndex, setSubmittingIndex] = useState(null);

  // Load drafts on mount
  useEffect(() => {
    async function load() {
      const actionable = findings.filter(f => f.status === 'mismatch' || f.status === 'undocumented');
      if (actionable.length === 0) return;

      setLoading(true);
      setError(null);
      try {
        const results = await draftIssues({ findings: actionable, repoName: repoUrl });
        setDrafts(results);
      } catch (err) {
        setError(err.message || 'Failed to draft issues');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [findings, repoUrl]);

  const handleUpdateTitle = (index, val) => {
    const updated = [...drafts];
    updated[index].title = val;
    setDrafts(updated);
  };

  const handleUpdateBody = (index, val) => {
    const updated = [...drafts];
    updated[index].body = val;
    setDrafts(updated);
  };

  const handleSubmitIssue = async (index) => {
    const draft = drafts[index];
    if (!draft) return;

    setSubmittingIndex(index);
    setError(null);

    try {
      const result = await createIssue({
        repoUrl,
        issue: { title: draft.title, body: draft.body },
        dryRun,
        token
      });

      setCreatedResults(prev => ({
        ...prev,
        [index]: result
      }));
    } catch (err) {
      setError(err.message || 'Issue creation failed');
    } finally {
      setSubmittingIndex(null);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>
          Step 4: AI Issue Drafter &amp; Dispatcher
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Gemma 4 drafts narrative summaries from verified facts only. Deterministic scanner code appends file and line evidence to guarantee 100% accuracy.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>{error}</div>
        </div>
      )}

      {/* Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="dry-run-toggle"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="dry-run-toggle" style={{ fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Dry Run Mode <span style={{ color: 'var(--text-dim)', fontWeight: 'normal' }}>(Simulate without posting to GitHub)</span>
          </label>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          Target Repo: <strong>{repoUrl || 'None specified'}</strong>
        </div>
      </div>

      {loading ? (
        <div>
          <div className="skeleton skeleton-text" style={{ width: '50%', height: '20px' }}></div>
          <div className="skeleton skeleton-card" style={{ height: '220px', marginTop: '14px' }}></div>
        </div>
      ) : drafts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <ShieldCheck size={36} style={{ color: '#10b981', margin: '0 auto 12px' }} />
          <h3>No Architectural Drift Detected!</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>All components match cleanly. No issues need to be drafted.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {drafts.map((draft, idx) => {
            const result = createdResults[idx];
            const isSubmitting = submittingIndex === idx;

            return (
              <div key={idx} className="issue-preview">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className={`badge badge-${draft.finding?.status || 'mismatch'}`}>
                    {draft.finding?.status?.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Component: <strong>{draft.finding?.name}</strong>
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Issue Title</label>
                  <input
                    type="text"
                    className="issue-title-input"
                    value={draft.title}
                    onChange={(e) => handleUpdateTitle(idx, e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontSize: '11px' }}>Issue Description &amp; Appended Evidence</label>
                  <textarea
                    className="issue-body-textarea"
                    value={draft.body}
                    onChange={(e) => handleUpdateBody(idx, e.target.value)}
                  />
                </div>

                {result && (
                  <div className={`alert ${result.dryRun ? 'alert-info' : 'alert-success'}`} style={{ marginBottom: '16px' }}>
                    <CheckCircle size={18} style={{ flexShrink: 0 }} />
                    <div>
                      {result.dryRun ? (
                        <span>[Dry Run] Simulated issue creation successfully.</span>
                      ) : (
                        <span>
                          Issue created on GitHub: <a href={result.htmlUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>#{result.number} {result.title}</a>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitIssue(idx)}
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    {isSubmitting ? (
                      'Processing...'
                    ) : dryRun ? (
                      <>
                        <Eye size={15} /> Dry-Run Issue
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Create Real GitHub Issue
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Results
        </button>
      </div>
    </div>
  );
}
