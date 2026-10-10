import { describe, it } from 'node:test';
import assert from 'node:assert';
import { scan } from '../src/services/scanner.js';

describe('Synthetic Drift Scanner Verification', () => {
  it('detects all 3 planted architectural differences in simulated project', async () => {
    // In-memory files simulating a project with planted drift
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({
          dependencies: {
            react: '^18.2.0',
            express: '^4.19.2',
            stripe: '^15.1.0',
            mongoose: '^8.3.0',
            amqplib: '^0.10.4'
          }
        }, null, 2)
      },
      {
        path: 'docker-compose.yml',
        content: `
version: '3.8'
services:
  mongo:
    image: mongo:6.0
  queue:
    image: rabbitmq:3-management
`
      },
      {
        path: '.env.example',
        content: `
PORT=3000
MONGODB_URI=mongodb://localhost:27017/shop
RABBITMQ_URL=amqp://localhost:5672
STRIPE_SECRET_KEY=sk_test_12345
`
      },
      {
        path: 'src/index.js',
        content: `
import express from 'express';
import mongoose from 'mongoose';
import amqp from 'amqplib';
import Stripe from 'stripe';
`
      }
    ];

    // Architecture diagram declared components (5 boxes)
    const components = [
      { name: 'React' },
      { name: 'API' },
      { name: 'Postgres' },
      { name: 'Redis' },
      { name: 'Stripe' }
    ];

    const { findings, summary } = await scan({ files, components });

    // Matched components
    const reactFinding = findings.find(f => f.name === 'React');
    const apiFinding = findings.find(f => f.name === 'API');
    const stripeFinding = findings.find(f => f.name === 'Stripe');

    assert.strictEqual(reactFinding?.status, 'match', 'React should match');
    assert.strictEqual(apiFinding?.status, 'match', 'API should match');
    assert.strictEqual(stripeFinding?.status, 'match', 'Stripe should match');

    // --- Difference 1: No Redis anywhere (mismatch) ---
    const redisFinding = findings.find(f => f.name === 'Redis');
    assert.ok(redisFinding, 'Redis finding should exist');
    assert.strictEqual(redisFinding.status, 'mismatch', 'Redis must be flagged as mismatch');
    assert.strictEqual(redisFinding.evidence.length, 0, 'Redis must have zero evidence in repo');

    // --- Difference 2: MongoDB used instead of Postgres (Postgres mismatch + MongoDB undocumented) ---
    const postgresFinding = findings.find(f => f.name === 'Postgres');
    assert.ok(postgresFinding, 'Postgres finding should exist');
    assert.strictEqual(postgresFinding.status, 'mismatch', 'Postgres must be flagged as mismatch');

    const mongoFinding = findings.find(f => f.signatureId === 'mongodb');
    assert.ok(mongoFinding, 'MongoDB finding should exist');
    assert.strictEqual(mongoFinding.status, 'undocumented', 'MongoDB must be flagged as undocumented');
    assert.ok(mongoFinding.evidence.length > 0, 'MongoDB should have concrete code/docker evidence');

    // --- Difference 3: RabbitMQ used but not drawn (undocumented) ---
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
