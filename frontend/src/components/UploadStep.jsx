import React, { useState } from 'react';
import { extractDiagram } from '../api.js';

export default function UploadStep({
  diagramImage,
  setDiagramImage,
  diagramPreview,
  setDiagramPreview,
  repoUrl,
  setRepoUrl,
  branch,
  setBranch,
  token,
  setToken,
  onExtracted
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(true);

  const handleFileChange = (file) => {
    if (!file) return;
    setError(null);
    setDiagramImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setDiagramPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const loadSampleDemo = async () => {
    setError(null);
    setRepoUrl('demo/planted-drift');
    setBranch('main');
    setDiagramPreview('/demo-diagram.png');

    const sampleComponents = [
      { name: 'React', type: 'frontend', tier: 'SPA Client' },
      { name: 'API', type: 'service', tier: 'Core Backend' },
      { name: 'Postgres', type: 'database', tier: 'Primary Storage' },
      { name: 'Redis', type: 'cache', tier: 'In-Memory Cache' },
      { name: 'Stripe', type: 'external', tier: 'Payment Gateway' }
    ];
    const sampleConnections = [
      { from: 'React', to: 'API', label: 'HTTP/REST' },
      { from: 'API', to: 'Postgres', label: 'ORM / Queries' },
      { from: 'API', to: 'Redis', label: 'Session Cache' },
      { from: 'API', to: 'Stripe', label: 'Webhook & Checkout' }
    ];

    try {
      const res = await fetch('/demo-diagram.png');
      if (res.ok) {
        const blob = await res.blob();
        setDiagramImage(blob);
      }
    } catch {
      // Continue with preview
    }

    onExtracted({ components: sampleComponents, connections: sampleConnections });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagramImage && !diagramPreview) {
      setError('Please select or drop an architecture diagram image.');
      return;
    }
    if (!repoUrl) {
      setError('Please provide a GitHub repository URL or local path.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await extractDiagram(diagramImage, diagramPreview);
      onExtracted(result);
    } catch (err) {
      setError(err.message || 'Diagram extraction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main class="w-full max-w-5xl mx-auto p-space-lg overflow-y-auto">
      <div class="space-y-space-lg">
        {/* Headline & Subtitle */}
        <section class="border-b border-outline-variant pb-space-md">
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded bg-surface-container text-primary-container text-mono-label font-mono-label border border-outline-variant">
              STAGE 01 / INITIALIZATION
            </span>
            <span class="text-mono-label font-mono-label text-outline">Gemma 4 Multimodal Vision Parser</span>
          </div>
          <h1 class="text-headline-lg font-headline-lg text-on-surface tracking-tight">
            Step 1: Upload Architecture Diagram &amp; Connect Repository
          </h1>
          <p class="text-body-sm font-body-sm text-on-surface-variant mt-1">
            Automated drift detection continuously compares intended microservice architectures against live Git AST models, detecting undocumented APIs, orphaned databases, and missing message brokers.
          </p>
        </section>

        {error && (
          <div class="p-3 bg-error-container/30 border border-error text-error text-xs font-mono-code rounded flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">warning</span>
            <span>{error}</span>
          </div>
        )}

        {/* Two-Column Workbench Split Layout */}
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          {/* LEFT COLUMN: Diagram Source */}
          <div class="rounded bg-surface-container-low border border-outline-variant p-space-md flex flex-col justify-between space-y-space-md">
            <div class="space-y-space-md">
              {/* Header for Source */}
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary-container text-[20px]">account_tree</span>
                  <h2 class="text-headline-sm font-headline-sm text-on-surface">Diagram Source</h2>
                </div>
                <span class="text-mono-label font-mono-label text-outline">Target Node: A1</span>
              </div>

              {/* Upload Area */}
              <div
                class={`border border-dashed ${
                  dragActive ? 'border-primary bg-surface-container' : 'border-primary-container'
                } rounded bg-surface-container-lowest p-space-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors hover:bg-surface-container`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('diagram-file-picker').click()}
              >
                <input
                  id="diagram-file-picker"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
                <div class="w-12 h-12 rounded bg-surface-container border border-outline-variant flex items-center justify-center text-primary-container mb-space-sm">
                  <span class="material-symbols-outlined text-[26px]">cloud_upload</span>
                </div>
                <p class="text-body-sm font-body-sm text-on-surface font-medium">
                  Drop architecture diagram here or click to browse
                </p>
                <p class="text-mono-label font-mono-label text-outline mt-1">
                  Accepted schematic formats:
                </p>
                <div class="flex flex-wrap gap-1.5 justify-center mt-space-sm">
                  <span class="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-mono-label font-mono-label text-on-surface-variant">.PNG</span>
                  <span class="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-mono-label font-mono-label text-on-surface-variant">.SVG</span>
                  <span class="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-mono-label font-mono-label text-on-surface-variant">.Excalidraw</span>
                  <span class="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-mono-label font-mono-label text-on-surface-variant">.Mermaid</span>
                  <span class="px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-mono-label font-mono-label text-on-surface-variant">Whiteboard Photos</span>
                </div>
              </div>

              {/* Uploaded Thumbnail & Component Breakdown Card */}
              {diagramPreview && (
                <div class="rounded bg-surface-container border border-outline-variant p-space-sm space-y-space-sm">
                  <div class="flex items-center justify-between pb-space-xs border-b border-outline-variant">
                    <div class="flex items-center gap-2 truncate">
                      <span class="material-symbols-outlined text-primary-container text-[18px]">image</span>
                      <span class="text-mono-label font-mono-label text-on-surface truncate">
                        {diagramImage?.name || 'diagram.png'}
                      </span>
                    </div>
                    <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high border border-tertiary text-mono-label font-mono-label text-tertiary whitespace-nowrap">
                      <span class="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Ready for Extraction</span>
                    </div>
                  </div>

                  <div class="bg-surface-container-lowest border border-outline-variant rounded p-2 overflow-hidden flex items-center justify-center">
                    <img
                      src={diagramPreview}
                      alt="Architecture Diagram Preview"
                      class="max-h-48 w-auto object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            <div class="pt-2 border-t border-outline-variant flex items-center justify-between text-mono-label font-mono-label text-outline">
              <span>OCR Layer: Active</span>
              <span>Model: Gemma 4 Vision</span>
            </div>
          </div>

          {/* RIGHT COLUMN: GitHub Repository Target */}
          <div class="rounded bg-surface-container-low border border-outline-variant p-space-md flex flex-col justify-between space-y-space-md">
            <div class="space-y-space-md">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary-container text-[20px]">code_blocks</span>
                  <h2 class="text-headline-sm font-headline-sm text-on-surface">Target Codebase</h2>
                </div>
                <span class="text-mono-label font-mono-label text-outline">Target Mode: Git AST</span>
              </div>

              {/* Repository URL Input */}
              <div class="space-y-1.5">
                <label class="block text-mono-label font-mono-label text-on-surface">
                  GitHub Repository URL or Local Path
                </label>
                <div class="relative flex items-center">
                  <div class="absolute left-3 flex items-center pointer-events-none text-on-surface-variant">
                    <span class="material-symbols-outlined text-[18px]">hub</span>
                  </div>
                  <input
                    class="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary-container text-on-surface pl-10 pr-4 py-2 rounded font-mono-code text-mono-code outline-none transition-colors"
                    placeholder="https://github.com/owner/repo or demo/planted-drift"
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* Demo Quick-Load CTA */}
              <div>
                <button
                  type="button"
                  onClick={loadSampleDemo}
                  class="w-full flex items-center justify-center gap-2 py-2 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded border border-outline-variant font-mono-label text-mono-label transition-colors"
                >
                  <span class="material-symbols-outlined text-primary-container text-[16px]">auto_awesome</span>
                  <span>Load Planted-Drift Demo Setup</span>
                </button>
              </div>

              {/* Expandable Accordion */}
              <div class="border border-outline-variant rounded bg-surface-container-lowest p-space-sm space-y-space-sm">
                <div
                  class="flex items-center justify-between pb-space-xs border-b border-outline-variant cursor-pointer"
                  onClick={() => setAccordionOpen(!accordionOpen)}
                >
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-primary-container text-[18px]">tune</span>
                    <span class="text-mono-label font-mono-label text-on-surface font-semibold">
                      Repository Auth &amp; Branch Configuration
                    </span>
                  </div>
                  <span class="material-symbols-outlined text-outline text-[18px]">
                    {accordionOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </div>

                {accordionOpen && (
                  <div class="space-y-3 pt-1">
                    <div class="space-y-1">
                      <label class="block text-mono-label font-mono-label text-outline">Target Branch / Commit SHA</label>
                      <div class="relative flex items-center">
                        <div class="absolute left-2.5 text-on-surface-variant flex items-center">
                          <span class="material-symbols-outlined text-[16px]">call_split</span>
                        </div>
                        <input
                          class="w-full bg-surface-container border border-outline-variant focus:border-primary-container text-on-surface pl-8 pr-3 py-1.5 rounded font-mono-code text-mono-code outline-none text-xs"
                          placeholder="main or commit SHA"
                          type="text"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div class="space-y-1">
                      <div class="flex items-center justify-between">
                        <label class="block text-mono-label font-mono-label text-outline">
                          GitHub Personal Access Token (PAT)
                        </label>
                        <span class="text-mono-label font-mono-label text-outline text-[10px]">Read-only repo scope</span>
                      </div>
                      <div class="relative flex items-center">
                        <div class="absolute left-2.5 text-on-surface-variant flex items-center">
                          <span class="material-symbols-outlined text-[16px]">key</span>
                        </div>
                        <input
                          class="w-full bg-surface-container border border-outline-variant focus:border-primary-container text-on-surface pl-8 pr-3 py-1.5 rounded font-mono-code text-mono-code outline-none text-xs tracking-widest"
                          placeholder="ghp_••••••••••••••••••••••••••••••••"
                          type="password"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                        />
                      </div>
                    </div>

                    <div class="flex items-start gap-2 p-2 rounded bg-surface-container border border-outline-variant">
                      <span class="material-symbols-outlined text-primary-container text-[16px] mt-0.5">verified_user</span>
                      <p class="text-mono-label font-mono-label text-outline text-[11px] leading-normal">
                        Tokens are never stored or logged. Used strictly for ephemeral repository reads.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div class="pt-2 border-t border-outline-variant flex items-center justify-between text-mono-label font-mono-label text-outline">
              <span>Security: Pure ephemeral AST</span>
              <span>Rate Limit: Monitored</span>
            </div>
          </div>
        </section>

        {/* Primary Action Footer */}
        <section class="rounded bg-surface-container-low border border-outline-variant p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div class="flex items-center gap-space-sm text-left">
            <div class="w-8 h-8 rounded bg-surface-container flex items-center justify-center border border-outline-variant text-primary-container shrink-0">
              <span class="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div>
              <p class="font-headline-sm text-headline-sm text-on-surface">Ready to parse multimodal topology</p>
              <p class="text-mono-label font-mono-label text-outline">Extracts nodes, edges, and dependencies using multimodal vision parser.</p>
            </div>
          </div>

          <div class="w-full sm:w-auto shrink-0">
            <button
              onClick={handleSubmit}
              disabled={loading}
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-space-lg py-2.5 rounded bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-headline-sm text-headline-sm font-semibold transition-colors duration-150 border border-primary-container"
            >
              {loading ? (
                <span>Extracting with Gemma 4...</span>
              ) : (
                <>
                  <span>Extract Components with Gemma 4 Vision</span>
                  <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
