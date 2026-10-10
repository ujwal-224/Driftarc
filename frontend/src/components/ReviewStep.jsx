import React, { useState } from 'react';
import { Plus, Trash2, ShieldCheck, ArrowRight, ArrowLeft, Network, Box } from 'lucide-react';

export default function ReviewStep({
  components,
  setComponents,
  connections,
  setConnections,
  onBack,
  onStartScan,
  loading
}) {
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState('service');

  const handleAddComponent = (e) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    setComponents([...components, { name: newCompName.trim(), type: newCompType }]);
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

  return (
    <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>
          Step 2: Review Extracted Architecture
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Gemma 4 extracted the components below from your diagram. You can adjust names or add components before running the deterministic scan.
        </p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '24px' }}>
        <ShieldCheck size={20} style={{ flexShrink: 0, color: 'var(--accent-cyan)' }} />
        <div>
          <strong>Deterministic Guarantee:</strong> The codebase scanner does <em>not</em> use AI. It uses pure pattern-matching across dependencies, imports, container configs, and environment variables.
        </div>
      </div>

      {/* Component List */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          Components ({components.length})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {components.map((comp, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <Box size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
                <input
                  type="text"
                  value={comp.name}
                  onChange={(e) => handleUpdateName(idx, e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '14px',
                    width: '100%',
                    outline: 'none'
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveComponent(idx)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
                title="Remove component"
              >
                <Trash2 size={15} style={{ color: '#f43f5e' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Component Inline */}
        <form onSubmit={handleAddComponent} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Add component name (e.g. Redis, MongoDB, Stripe)..."
            value={newCompName}
            onChange={(e) => setNewCompName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-secondary">
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      {/* Connections List (if any) */}
      {connections && connections.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Connections ({connections.length})
          </h3>
          <div className="connections-list">
            {connections.map((c, idx) => (
              <div key={idx} className="connection-item">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Network size={14} style={{ color: 'var(--accent-indigo)' }} />
                  <strong>{c.from}</strong> &rarr; <strong>{c.to}</strong>
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{c.label || 'Connection'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onStartScan}
          disabled={loading || components.length === 0}
        >
          {loading ? (
            <>Running Scanner...</>
          ) : (
            <>
              Scan Repository for Evidence <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
