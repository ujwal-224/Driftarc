import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ArrowRightLeft,
  Loader2,
  X
} from 'lucide-react';

const CATEGORY_STYLES = {
  frontend: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  service: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  database: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  cache: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  queue: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  external: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' }
};

export default function ReviewStep({
  components,
  setComponents,
  connections,
  setConnections,
  repoUrl,
  branch,
  onBack,
  onStartScan,
  loading
}) {
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState('service');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddComponent = (e) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    setComponents([
      ...components,
      {
        name: newCompName.trim(),
        type: newCompType
      }
    ]);
    setNewCompName('');
    setShowAddForm(false);
  };

  const handleRemoveComponent = (index) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleUpdateName = (index, newName) => {
    const updated = [...components];
    updated[index].name = newName;
    setComponents(updated);
  };

  const handleRemoveConnection = (index) => {
    setConnections(connections.filter((_, i) => i !== index));
  };

  return (
    <main className="w-full max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Review Extracted Architecture
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Gemma 4 identified {components.length} components from your diagram. You can refine or add items before the code scan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Target: <code className="text-sky-400 font-mono bg-slate-900 px-2 py-1 rounded-md border border-slate-800">{repoUrl}</code>
          </span>
        </div>
      </div>

      {/* Components Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            Components ({components.length})
          </h2>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Component
            </button>
          )}
        </div>

        {/* Add Component Inline Box */}
        {showAddForm && (
          <form
            onSubmit={handleAddComponent}
            className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/5 flex flex-wrap items-center gap-3"
          >
            <input
              type="text"
              placeholder="Component name (e.g. Redis, MongoDB)"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:border-sky-400"
              autoFocus
            />
            <select
              value={newCompType}
              onChange={(e) => setNewCompType(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:border-sky-400"
            >
              <option value="service">Service</option>
              <option value="database">Database</option>
              <option value="cache">Cache</option>
              <option value="frontend">Frontend</option>
              <option value="queue">Queue</option>
              <option value="external">External</option>
            </select>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1.5"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Components Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {components.map((comp, idx) => {
            const style = CATEGORY_STYLES[(comp.type || 'service').toLowerCase()] || CATEGORY_STYLES.service;

            return (
              <div
                key={idx}
                className="bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-3 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}>
                      {comp.type || 'Service'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={comp.name}
                    onChange={(e) => handleUpdateName(idx, e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-sky-400 text-white font-medium text-sm outline-none pb-0.5 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveComponent(idx)}
                  className="opacity-40 group-hover:opacity-100 hover:text-rose-400 text-slate-400 p-1 transition-all"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connections Flow Section */}
      {connections && connections.length > 0 && (
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
            Connections ({connections.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {connections.map((conn, cIdx) => (
              <div
                key={cIdx}
                className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 font-mono truncate">
                  <span className="text-slate-200 font-semibold truncate">{conn.from}</span>
                  <span className="text-slate-500">➔</span>
                  <span className="text-sky-300 font-semibold truncate">{conn.to}</span>
                  {conn.label && (
                    <span className="text-[10px] text-slate-500 font-sans ml-1">
                      ({conn.label})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveConnection(cIdx)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Upload
        </button>

        <button
          type="button"
          onClick={onStartScan}
          disabled={loading || components.length === 0}
          className="px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scanning Repository...</span>
            </>
          ) : (
            <>
              <span>Scan Codebase for Drift</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </main>
  );
}
