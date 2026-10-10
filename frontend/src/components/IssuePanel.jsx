import React, { useState, useEffect } from 'react';
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
    <main class="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div class="space-y-6">
        {/* Header Block */}
        <div class="border-b border-outline-variant pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono-label text-mono-label text-primary px-1.5 py-0.5 border border-primary/40 bg-surface-container-lowest">
                STEP 04 / ISSUE DISPATCH
              </span>
              <span class="font-mono-label text-mono-label text-outline-variant">// VERIFIED REMEDIATION TICKETS</span>
            </div>
            <h1 class="text-headline-lg font-headline-lg text-on-surface tracking-tight">
              AI Issue Drafter &amp; GitHub Dispatcher
            </h1>
            <p class="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Gemma 4 drafts narrative titles and summaries from verified facts only. Concrete file and line evidence is appended deterministically by code.
            </p>
          </div>
          <div class="flex items-center gap-2 font-mono-label text-mono-label">
            <span class="text-on-surface-variant">ACTIONABLE DRIFTS:</span>
            <span class="font-mono-metric text-headline-sm text-primary bg-[#12192B] px-2 py-0.5 border border-outline-variant">
              {String(drafts.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {error && (
          <div class="p-3 bg-error-container/30 border border-error text-error text-xs font-mono-code rounded flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">warning</span>
            <span>{error}</span>
          </div>
        )}

        {/* Control Bar */}
        <div class="bg-surface-container-low border border-outline-variant p-space-md rounded flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer font-mono-label text-mono-label text-on-surface">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                class="w-4 h-4 rounded bg-surface-container border-outline-variant text-primary-container focus:ring-0 focus:outline-none"
              />
              <span>Dry Run Mode</span>
            </label>
            <span class="text-outline text-xs">•</span>
            <span class="text-mono-label font-mono-label text-outline text-xs">
              Simulates creation locally without publishing to GitHub
            </span>
          </div>

          <div class="flex items-center gap-2 font-mono-label text-mono-label text-xs">
            <span class="text-on-surface-variant">Target Repo:</span>
            <code class="px-2 py-0.5 rounded bg-surface-container text-primary border border-outline-variant">
              {repoUrl || 'Local Repo'}
            </code>
          </div>
        </div>

        {loading ? (
          <div class="space-y-4">
            <div class="h-6 w-1/3 bg-surface-container rounded skeleton-shimmer"></div>
            <div class="h-64 bg-surface-container rounded skeleton-shimmer"></div>
          </div>
        ) : drafts.length === 0 ? (
          <div class="bg-surface-container-low border border-outline-variant rounded p-12 text-center">
            <span class="material-symbols-outlined text-4xl text-[#10B981] mb-2">verified</span>
            <h3 class="text-headline-sm font-headline-sm text-on-surface">Zero Architectural Drift Detected</h3>
            <p class="text-body-sm font-body-sm text-on-surface-variant mt-1">
              All declared components match cleanly in your codebase. No issues need to be drafted.
            </p>
          </div>
        ) : (
          <div class="space-y-6">
            {drafts.map((draft, idx) => {
              const result = createdResults[idx];
              const isSubmitting = submittingIndex === idx;
              const isMismatch = draft.finding?.status === 'mismatch';
              const borderColor = isMismatch ? '#F43F5E' : '#F59E0B';

              return (
                <div
                  key={idx}
                  class="bg-surface-container-low border border-outline-variant rounded overflow-hidden p-space-md space-y-4"
                  style={{ borderLeft: `3px solid ${borderColor}` }}
                >
                  <div class="flex items-center justify-between border-b border-outline-variant pb-3">
                    <div class="flex items-center gap-2">
                      <span
                        class="px-2 py-0.5 rounded text-mono-label font-mono-label font-semibold border"
                        style={{ borderColor, color: borderColor }}
                      >
                        {draft.finding?.status?.toUpperCase()}
                      </span>
                      <span class="text-headline-sm font-headline-sm text-on-surface">
                        {draft.finding?.name}
                      </span>
                    </div>
                    <span class="text-mono-label font-mono-label text-outline text-xs">
                      TICKET-0{idx + 1}
                    </span>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-mono-label font-mono-label text-on-surface-variant">
                      Issue Title
                    </label>
                    <input
                      type="text"
                      class="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary-container text-on-surface px-3 py-2 rounded font-mono-code text-xs outline-none"
                      value={draft.title}
                      onChange={(e) => handleUpdateTitle(idx, e.target.value)}
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-mono-label font-mono-label text-on-surface-variant">
                      Markdown Body &amp; Appended Code Evidence
                    </label>
                    <textarea
                      rows={10}
                      class="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary-container text-on-surface p-3 rounded font-mono-code text-xs outline-none resize-y"
                      value={draft.body}
                      onChange={(e) => handleUpdateBody(idx, e.target.value)}
                    />
                  </div>

                  {result && (
                    <div
                      class={`p-3 rounded border text-xs font-mono-code flex items-center gap-2 ${
                        result.dryRun
                          ? 'bg-surface-container border-primary text-primary'
                          : 'bg-surface-container border-[#10B981] text-[#10B981]'
                      }`}
                    >
                      <span class="material-symbols-outlined text-sm">
                        {result.dryRun ? 'info' : 'check_circle'}
                      </span>
                      {result.dryRun ? (
                        <span>[Dry-Run Simulation Succeeded]: {result.message}</span>
                      ) : (
                        <span>
                          GitHub Issue Created: <a href={result.htmlUrl} target="_blank" rel="noreferrer" class="underline font-bold">#{result.number} {result.title}</a>
                        </span>
                      )}
                    </div>
                  )}

                  <div class="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitIssue(idx)}
                      class="px-5 py-2 rounded bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-semibold text-xs font-mono-label transition-colors flex items-center gap-2"
                    >
                      <span class="material-symbols-outlined text-base">
                        {dryRun ? 'visibility' : 'send'}
                      </span>
                      <span>
                        {isSubmitting ? 'Processing...' : dryRun ? 'Dry-Run Issue' : 'Create Real GitHub Issue'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back Action */}
        <div class="pt-4 border-t border-outline-variant">
          <button
            onClick={onBack}
            class="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-mono-label text-xs rounded transition-colors flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Back to Scan Findings
          </button>
        </div>
      </div>
    </main>
  );
}
