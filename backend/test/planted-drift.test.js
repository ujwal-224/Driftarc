import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchLocalRepo } from '../src/services/repoFetcher.js';
import { scan } from '../src/services/scanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Planted Drift Demo Fixture Scanner Verification', () => {
  it('detects all 3 planted architectural differences in demo/planted-drift', () => {
    const demoDir = path.resolve(__dirname, '../../demo/planted-drift');
    const files = fetchLocalRepo(demoDir);

    assert.ok(files.length > 0, 'Demo fixture should contain scannable files');

    // Architecture diagram declared components (5 boxes)
    const components = [
      { name: 'React' },
      { name: 'API' },
      { name: 'Postgres' },
      { name: 'Redis' },
      { name: 'Stripe' }
    ];

    const { findings, summary } = scan({ files, components });

    // Matched components
    const reactFinding = findings.find(f => f.name === 'React');
    const apiFinding = findings.find(f => f.name === 'API');
    const stripeFinding = findings.find(f => f.name === 'Stripe');

    assert.strictEqual(reactFinding?.status, 'match', 'React should match');
    assert.strictEqual(apiFinding?.status, 'match', 'API should match');
    assert.strictEqual(stripeFinding?.status, 'match', 'Stripe should match');

    // --- Planted Difference 1: No Redis anywhere (mismatch) ---
    const redisFinding = findings.find(f => f.name === 'Redis');
    assert.ok(redisFinding, 'Redis finding should exist');
    assert.strictEqual(redisFinding.status, 'mismatch', 'Redis must be flagged as mismatch');
    assert.strictEqual(redisFinding.evidence.length, 0, 'Redis must have zero evidence in repo');

    // --- Planted Difference 2: MongoDB used instead of Postgres (Postgres mismatch + MongoDB undocumented) ---
    const postgresFinding = findings.find(f => f.name === 'Postgres');
    assert.ok(postgresFinding, 'Postgres finding should exist');
    assert.strictEqual(postgresFinding.status, 'mismatch', 'Postgres must be flagged as mismatch');

    const mongoFinding = findings.find(f => f.signatureId === 'mongodb');
    assert.ok(mongoFinding, 'MongoDB finding should exist');
    assert.strictEqual(mongoFinding.status, 'undocumented', 'MongoDB must be flagged as undocumented');
    assert.ok(mongoFinding.evidence.length > 0, 'MongoDB should have concrete code/docker evidence');

    // --- Planted Difference 3: RabbitMQ used but not drawn (undocumented) ---
    const rabbitFinding = findings.find(f => f.signatureId === 'rabbitmq');
    assert.ok(rabbitFinding, 'RabbitMQ finding should exist');
    assert.strictEqual(rabbitFinding.status, 'undocumented', 'RabbitMQ must be flagged as undocumented');
    assert.ok(rabbitFinding.evidence.length > 0, 'RabbitMQ should have concrete code/docker evidence');

    // Summary validation
    assert.strictEqual(summary.match, 3, 'Exactly 3 components match (React, API, Stripe)');
    assert.strictEqual(summary.mismatch, 2, 'Exactly 2 mismatches (Redis, Postgres)');
    assert.strictEqual(summary.undocumented, 2, 'Exactly 2 undocumented technologies (MongoDB, RabbitMQ)');
  });
});
