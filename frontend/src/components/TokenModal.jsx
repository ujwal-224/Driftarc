import React, { useState } from 'react';
import { Key, Eye, EyeOff, ShieldCheck, ExternalLink, X, Check } from 'lucide-react';

export default function TokenModal({ isOpen, onClose, token = '', onSave, onSaveAndRetry }) {
  const [val, setVal] = useState(token);
  const [showSecret, setShowSecret] = useState(false);

  if (!isOpen) return null;

  const handleSave = (retry = false) => {
    onSave(val.trim());
    if (retry && onSaveAndRetry) {
      onSaveAndRetry(val.trim());
    } else {
      onClose();
    }
  };

  const handleClear = () => {
    setVal('');
    onSave('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                GitHub Personal Access Token
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bypass rate limits &amp; access private repositories
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Personal Access Token (classic or fine-grained)
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="ghp_••••••••••••••••••••••••••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-white/[0.1] rounded-xl px-3.5 py-2.5 pr-10 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all placeholder:text-slate-400"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>100% Client-Side Privacy:</strong> Tokens are stored in your browser's local storage and forwarded strictly for scanning. Never saved on our database.
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[11px] text-slate-500">Need a token?</span>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=DriftArc-Scanner"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-medium"
              >
                Create GitHub Token <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-white/[0.06]">
          <div>
            {token && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
              >
                Remove Token
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            {onSaveAndRetry ? (
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Save &amp; Retry Scan
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Save Token
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
