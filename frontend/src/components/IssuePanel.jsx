import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Info,
  Send,
  Eye,
  ArrowLeft,
  AlertCircle,
  Loader2
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
    <main className="w-full max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Drafted GitHub Issues
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
            Gemma 4 generated issue narratives for {drafts.length} drift findings with verified code evidence attached.
          </p>
        </div>

        {/* Dry Run Toggle */}
        <label className="flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="w-4 h-4 rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-0"
          />
          <span>Dry Run Mode (Simulate)</span>
        </label>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-100 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-sky-600 dark:text-sky-400" />
          <span>Drafting issues with Gemma 4...</span>
        </div>
      ) : drafts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Actionable Drift Detected</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            All components match cleanly in your codebase. No issues need to be drafted.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {drafts.map((draft, idx) => {
            const result = createdResults[idx];
            const isSubmitting = submittingIndex === idx;
            const isMismatch = draft.finding?.status === 'mismatch';

            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm"
                style={{ borderLeft: `3px solid ${isMismatch ? '#F43F5E' : '#F59E0B'}` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border ${
                      isMismatch ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    }`}>
                      {draft.finding?.status?.toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {draft.finding?.name}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Issue Title</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl text-xs font-mono outline-none focus:border-sky-500"
                    value={draft.title}
                    onChange={(e) => handleUpdateTitle(idx, e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-400 mb-1">Issue Body &amp; Appended Evidence</label>
                  <textarea
                    rows={8}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-300 p-3.5 rounded-xl text-xs font-mono outline-none focus:border-sky-500 resize-y"
                    value={draft.body}
                    onChange={(e) => handleUpdateBody(idx, e.target.value)}
                  />
                </div>

                {result && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    result.dryRun
                      ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/30 text-sky-700 dark:text-sky-300'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {result.dryRun ? <Info className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    {result.dryRun ? (
                      <span>[Simulation]: {result.message}</span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Issue published:{' '}
                        <a href={result.htmlUrl} target="_blank" rel="noreferrer" className="underline font-bold flex items-center gap-1">
                          #{result.number} {result.title}
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmitIssue(idx)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-medium border border-slate-800 dark:border-slate-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : dryRun ? (
                      <Eye className="w-3.5 h-3.5" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isSubmitting ? 'Processing...' : dryRun ? 'Preview Simulation' : 'Publish to GitHub'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Back Navigation */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Scan Results
        </button>
      </div>
    </main>
  );
}
