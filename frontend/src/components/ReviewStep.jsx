import React, { useState } from 'react';

const CATEGORY_COLORS = {
  frontend: '#38BDF8',
  service: '#6366F1',
  database: '#10B981',
  cache: '#F43F5E',
  external: '#F59E0B',
  queue: '#A855F7'
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

  const handleAddComponent = (e) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    setComponents([
      ...components,
      {
        name: newCompName.trim(),
        type: newCompType,
        tier: newCompType === 'database' ? 'Primary Storage' : newCompType === 'cache' ? 'In-Memory Cache' : 'Service'
      }
    ]);
    setNewCompName('');
  };

  const handleRemoveComponent = (index) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const handleUpdateName = (index, newName) => {
    const updated = [...components];
    updated[index].name = newName;
    setComponents(updated);
  };

  const handleUpdateTier = (index, newTier) => {
    const updated = [...components];
    updated[index].tier = newTier;
    setComponents(updated);
  };

  return (
    <div class="flex-1 flex flex-col">
      {/* Sub-Header Workspace Context Rail */}
      <div class="w-full bg-surface-container-lowest border-b border-outline-variant px-space-md py-2 flex flex-wrap items-center justify-between gap-y-2">
        <div class="flex items-center gap-space-md text-mono-label font-mono-label">
          <span class="text-on-surface-variant">TARGET REPO:</span>
          <span class="text-primary font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">schema</span> {repoUrl || 'acme-corp/ecommerce'}
          </span>
          <span class="text-outline">::</span>
          <span class="text-on-surface-variant">BRANCH:</span>
          <span class="text-on-surface">{branch || 'main'}</span>
          <span class="text-outline">::</span>
          <span class="text-on-surface-variant">ENGINE:</span>
          <span class="text-tertiary">DETERMINISTIC SCANNER</span>
        </div>
        <div class="flex items-center gap-space-sm font-mono-label text-mono-label">
          <span class="text-on-surface-variant">RECOGNITION CONFIDENCE:</span>
          <span class="text-tertiary font-semibold">100% DETERMINISTIC</span>
        </div>
      </div>

      {/* Main Viewport Container */}
      <main class="flex-1 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Informational Notice Banner */}
        <div class="w-full bg-[#0D121F] border border-outline-variant p-4 flex items-start sm:items-center gap-3">
          <span class="material-symbols-outlined text-primary text-xl flex-shrink-0">shield</span>
          <div class="flex-1 text-body-sm font-body-sm">
            <span class="text-primary font-semibold font-mono-label text-mono-label mr-2">DETERMINISTIC GUARANTEE:</span>
            <span class="text-on-surface">The code scanner uses pure pattern matching (dependencies, imports, docker-compose, env vars). No AI decides matches vs mismatches.</span>
          </div>
          <div class="hidden md:flex items-center gap-1 text-outline font-mono-label text-mono-label flex-shrink-0">
            <span class="material-symbols-outlined text-sm">verified</span> RULESET VERIFIED
          </div>
        </div>

        {/* Title and Subtitle Block */}
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono-label text-mono-label text-primary px-1.5 py-0.5 border border-primary/40 bg-surface-container-lowest">
                STEP 02 / INSPECTION
              </span>
              <span class="font-mono-label text-mono-label text-outline-variant">// HUMAN-IN-THE-LOOP VERIFICATION</span>
            </div>
            <h1 class="text-headline-lg font-headline-lg text-on-surface tracking-tight">
              Review Extracted Components &amp; Topologies
            </h1>
            <p class="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Verify and refine the {components.length} architecture components recognized from diagram before repository pattern scan.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-mono-label text-mono-label text-on-surface-variant">EXTRACTED ENTITIES:</span>
            <span class="font-mono-metric text-headline-sm text-primary bg-[#12192B] px-2 py-0.5 border border-outline-variant">
              {String(components.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Section Heading & Category Legend */}
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-base">account_tree</span>
            <h2 class="text-headline-sm font-headline-sm text-on-surface">Architectural Nodes</h2>
            <span class="text-on-surface-variant font-mono-label text-mono-label">(Editable AST Anchors)</span>
          </div>
          <div class="flex items-center gap-1.5 font-mono-label text-mono-label text-on-surface-variant flex-wrap">
            <span class="w-2 h-2 bg-[#38BDF8]"></span> Frontend
            <span class="w-2 h-2 bg-[#6366F1] ml-2"></span> Service
            <span class="w-2 h-2 bg-[#10B981] ml-2"></span> Database
            <span class="w-2 h-2 bg-[#F43F5E] ml-2"></span> Cache
            <span class="w-2 h-2 bg-[#F59E0B] ml-2"></span> External
          </div>
        </div>

        {/* Component Cards Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="component-grid">
          {components.map((comp, idx) => {
            const catType = (comp.type || 'service').toLowerCase();
            const color = CATEGORY_COLORS[catType] || '#6366F1';

            return (
              <div
                key={idx}
                class="bg-[#12192B] border border-outline-variant p-4 flex flex-col justify-between relative group hover:border-primary transition-colors"
              >
                <div>
                  <div class="flex items-start justify-between gap-2 mb-3">
                    <span
                      class="px-2 py-0.5 border font-mono-label text-mono-label uppercase font-medium bg-[#07090E]"
                      style={{ borderColor: color, color: color }}
                    >
                      {comp.type || 'Service'}
                    </span>
                    <button
                      onClick={() => handleRemoveComponent(idx)}
                      class="text-outline-variant hover:text-[#F43F5E] p-1 transition-colors"
                      title="Remove Component"
                    >
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>

                  <div class="space-y-3">
                    <div>
                      <label class="block font-mono-label text-mono-label text-on-surface-variant mb-1">
                        NODE IDENTIFIER
                      </label>
                      <input
                        type="text"
                        class="w-full bg-[#0D121F] border border-outline-variant text-on-surface px-2.5 py-1.5 font-mono-code text-mono-code focus:border-[#38BDF8] focus:ring-0 focus:outline-none"
                        value={comp.name}
                        onChange={(e) => handleUpdateName(idx, e.target.value)}
                      />
                    </div>
                    <div>
                      <label class="block font-mono-label text-mono-label text-on-surface-variant mb-1">
                        TIER / CATEGORY
                      </label>
                      <input
                        type="text"
                        class="w-full bg-[#0D121F] border border-outline-variant text-on-surface px-2.5 py-1.5 font-mono-code text-mono-code focus:border-[#38BDF8] focus:ring-0 focus:outline-none"
                        value={comp.tier || comp.type || 'Service Node'}
                        onChange={(e) => handleUpdateTier(idx, e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-on-surface-variant">
                  <div class="flex items-center gap-1.5 font-mono-label text-mono-label">
                    <span class="material-symbols-outlined text-sm" style={{ color }}>tag</span>
                    <span class="text-on-surface-variant">{comp.name.toLowerCase()}</span>
                  </div>
                  <span class="text-[10px] font-mono-label text-outline uppercase">
                    DIAG-{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Card 6: + Add Component Card */}
          <div class="bg-[#0D121F] border border-dashed border-outline-variant p-4 flex flex-col justify-between hover:border-primary transition-colors">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2 py-0.5 border border-outline-variant text-on-surface-variant font-mono-label text-mono-label uppercase">
                  NEW COMPONENT
                </span>
                <span class="material-symbols-outlined text-primary text-lg">add_circle</span>
              </div>
              <div class="space-y-3">
                <div>
                  <label class="block font-mono-label text-mono-label text-on-surface-variant mb-1">NAME</label>
                  <input
                    type="text"
                    placeholder="Enter component name..."
                    class="w-full bg-[#07090E] border border-outline-variant text-on-surface placeholder:text-outline-variant px-2.5 py-1.5 font-mono-code text-mono-code focus:border-primary focus:ring-0 focus:outline-none"
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                  />
                </div>
                <div>
                  <label class="block font-mono-label text-mono-label text-on-surface-variant mb-1">TYPE</label>
                  <select
                    class="w-full bg-[#07090E] border border-outline-variant text-on-surface px-2.5 py-1.5 font-mono-code text-mono-code focus:border-primary focus:ring-0 focus:outline-none"
                    value={newCompType}
                    onChange={(e) => setNewCompType(e.target.value)}
                  >
                    <option value="service">Service</option>
                    <option value="database">Database</option>
                    <option value="cache">Cache</option>
                    <option value="queue">Queue</option>
                    <option value="frontend">Frontend</option>
                    <option value="external">External</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-3">
              <button
                type="button"
                onClick={handleAddComponent}
                class="w-full py-1.5 bg-[#12192B] hover:bg-[#18223B] text-primary border border-primary/40 font-mono-label text-mono-label font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <span class="material-symbols-outlined text-sm">add</span> + Add to Model
              </button>
            </div>
          </div>
        </div>

        {/* Extracted Directed Connections Card */}
        {connections && connections.length > 0 && (
          <div class="bg-[#0D121F] border border-outline-variant p-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant pb-3 mb-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-lg">sync_alt</span>
                <h3 class="text-headline-sm font-headline-sm text-on-surface">Extracted Directed Connections (Topological Flow)</h3>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono-label text-mono-label text-on-surface-variant">CONFIRMED EDGES:</span>
                <span class="font-mono-code text-mono-code text-primary bg-[#12192B] px-2 py-0.5 border border-outline-variant">
                  {connections.length} EDGES
                </span>
              </div>
            </div>
            <p class="text-body-sm font-body-sm text-on-surface-variant mb-4">
              The scanner will verify direct code couplings (API requests, client connections, database drivers) matching these diagrammed communication vectors:
            </p>

            {/* Flow Pills Grid */}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connections.map((conn, cIdx) => (
                <div key={cIdx} class="bg-[#12192B] border border-outline-variant p-3 flex items-center justify-between">
                  <div class="flex items-center gap-2 font-mono-code text-mono-code">
                    <span class="px-2 py-0.5 bg-[#07090E] border border-[#38BDF8] text-[#38BDF8] text-xs">
                      {conn.from}
                    </span>
                    <span class="material-symbols-outlined text-primary text-sm">arrow_forward</span>
                    <span class="px-2 py-0.5 bg-[#07090E] border border-[#6366F1] text-[#c0c1ff] text-xs">
                      {conn.to}
                    </span>
                  </div>
                  <span class="font-mono-label text-mono-label px-2 py-0.5 border border-outline-variant text-on-surface-variant bg-[#07090E]">
                    {conn.label || 'Direct Link'}
                  </span>
                </div>
              ))}
            </div>

            <div class="mt-4 pt-3 border-t border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-mono-label font-mono-label text-outline">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">terminal</span>
                <span>PARSER: AST Pattern Matching Engine v2.4 (strict no-eval mode)</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer Actions */}
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant mt-2 mb-8">
          <button
            type="button"
            onClick={onBack}
            class="w-full sm:w-auto px-5 py-2.5 bg-[#12192B] text-[#F8FAFC] border border-outline-variant font-mono-label text-mono-label hover:bg-[#18223B] transition-colors flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-base">arrow_back</span> Back to Upload
          </button>
          <button
            type="button"
            onClick={onStartScan}
            disabled={loading || components.length === 0}
            class="w-full sm:w-auto px-6 py-2.5 bg-[#38BDF8] hover:bg-[#0284C7] text-[#07090E] border border-[#38BDF8] font-headline-sm font-semibold text-headline-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Scanning Repository...</span>
            ) : (
              <>
                <span>Scan Repository for Evidence</span>
                <span class="material-symbols-outlined text-base">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
