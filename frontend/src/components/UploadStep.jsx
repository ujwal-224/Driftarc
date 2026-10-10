import React, { useState } from 'react';
import { UploadCloud, FileCode2, ArrowRight, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
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
    // Pre-extracted components for instant testing of the planted demo
    const sampleComponents = [
      { name: 'React', type: 'frontend' },
      { name: 'API', type: 'service' },
      { name: 'Postgres', type: 'database' },
      { name: 'Redis', type: 'cache' },
      { name: 'Stripe', type: 'external' }
    ];
    const sampleConnections = [
      { from: 'React', to: 'API' },
      { from: 'API', to: 'Postgres' },
      { from: 'API', to: 'Redis' },
      { from: 'API', to: 'Stripe' }
    ];
    // Load demo diagram as SVG preview
    try {
      const res = await fetch('/demo-diagram.png');
      if (res.ok) {
        const blob = await res.blob();
        setDiagramImage(blob);
        setDiagramPreview(URL.createObjectURL(blob));
      }
    } catch {
      // Fallback preview
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
      // Rule: Surface the real error message in the UI
      setError(err.message || 'Diagram extraction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>
          Step 1: Upload Diagram &amp; Select Repository
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Gemma 4 vision extracts components and connections from your architecture diagram. Then our deterministic scanner compares them with your codebase.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Dropzone */}
        <div className="form-group">
          <label className="form-label">Architecture Diagram Image</label>
          <div
            className={`dropzone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('diagram-file-input').click()}
          >
            <input
              id="diagram-file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e.target.files[0])}
            />

            {diagramPreview ? (
              <div>
                <img
                  src={diagramPreview}
                  alt="Diagram Preview"
                  style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--border-subtle)' }}
                />
                <p style={{ color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: '600' }}>
                  Click or drop to replace image
                </p>
              </div>
            ) : (
              <div>
                <UploadCloud className="upload-icon" />
                <p style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                  Drop your architecture diagram image here, or browse
                </p>
                <p style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
                  Supports PNG, JPG, WebP (Draw.io, Mermaid, Excalidraw, whiteboard photos)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Demo Pre-fill */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={loadSampleDemo}
          >
            <Sparkles size={14} style={{ color: '#fbbf24' }} /> Load Planted-Drift Demo Setup
          </button>
        </div>

        {/* Repo URL */}
        <div className="form-group">
          <label className="form-label">GitHub Repository URL or Local Path</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. https://github.com/owner/repo or demo/planted-drift"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>Branch (Optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '11px' }}>GitHub Token (Optional / Private Repos)</label>
            <input
              type="password"
              className="input-field"
              placeholder="ghp_xxxxxxxx (Never stored)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px' }}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="health-dot" style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              Extracting Architecture with Gemma 4 Vision...
            </>
          ) : (
            <>
              Extract Components with Gemma 4 <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
