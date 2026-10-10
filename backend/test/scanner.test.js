import { describe, it } from 'node:test';
import assert from 'node:assert';
import { scan } from '../src/services/scanner.js';

describe('DriftCheck Deterministic Scanner', () => {
  // Test 1: Basic component matching
  it('identifies matched component when dependency exists in package.json', () => {
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0'
          }
        }, null, 2)
      }
    ];
    const components = [{ name: 'React' }];

    const result = scan({ files, components });

    const matchFinding = result.findings.find(f => f.name === 'React');
    assert.ok(matchFinding, 'Should have React finding');
    assert.strictEqual(matchFinding.status, 'match');
    assert.ok(matchFinding.evidence.length > 0, 'Should have evidence');
    assert.strictEqual(matchFinding.evidence[0].file, 'package.json');
  });

  // Test 2: Basic component mismatch
  it('flags mismatch when declared component is absent from codebase', () => {
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({
          dependencies: {
            express: '^4.18.2'
          }
        }, null, 2)
      }
    ];
    const components = [{ name: 'Redis' }];

    const result = scan({ files, components });

    const redisFinding = result.findings.find(f => f.name === 'Redis');
    assert.ok(redisFinding, 'Should have Redis finding');
    assert.strictEqual(redisFinding.status, 'mismatch');
    assert.strictEqual(redisFinding.evidence.length, 0);
  });

  // Test 3: docker-compose detection (Task 4)
  it('detects component from docker-compose.yml definition', () => {
    const files = [
      {
        path: 'docker-compose.yml',
        content: `
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
`
      }
    ];
    const components = [{ name: 'PostgreSQL' }];

    const result = scan({ files, components });

    const pgFinding = result.findings.find(f => f.name === 'PostgreSQL');
    assert.ok(pgFinding, 'Should find PostgreSQL from docker-compose');
    assert.strictEqual(pgFinding.status, 'match');
    assert.ok(pgFinding.evidence.some(e => e.file === 'docker-compose.yml'));
  });

  // Test 4: .env.example detection (Task 4)
  it('detects component from .env.example configuration keys', () => {
    const files = [
      {
        path: '.env.example',
        content: `
PORT=3000
STRIPE_SECRET_KEY=sk_test_12345
STRIPE_WEBHOOK_SECRET=whsec_12345
`
      }
    ];
    const components = [{ name: 'Stripe' }];

    const result = scan({ files, components });

    const stripeFinding = result.findings.find(f => f.name === 'Stripe');
    assert.ok(stripeFinding, 'Should find Stripe from .env.example');
    assert.strictEqual(stripeFinding.status, 'match');
    assert.ok(stripeFinding.evidence.some(e => e.file === '.env.example'));
  });

  // Test 5: require() import detection (Task 4)
  it('detects component from CommonJS require() import statement', () => {
    const files = [
      {
        path: 'src/server.cjs',
        content: `
const express = require('express');
const app = express();
module.exports = app;
`
      }
    ];
    const components = [{ name: 'Express' }];

    const result = scan({ files, components });

    const expressFinding = result.findings.find(f => f.name === 'Express');
    assert.ok(expressFinding, 'Should find Express from require statement');
    assert.strictEqual(expressFinding.status, 'match');
    assert.ok(expressFinding.evidence.some(e => e.type === 'import'));
  });

  // Test 6: Monorepo apps/api/package.json detection (Task 4)
  it('detects component inside monorepo subdirectory apps/api/package.json', () => {
    const files = [
      {
        path: 'apps/api/package.json',
        content: JSON.stringify({
          name: 'api-service',
          dependencies: {
            express: '^4.19.0'
          }
        }, null, 2)
      }
    ];
    const components = [{ name: 'API' }];

    const result = scan({ files, components });

    const apiFinding = result.findings.find(f => f.name === 'API');
    assert.ok(apiFinding, 'Should find API in monorepo subfolder');
    assert.strictEqual(apiFinding.status, 'match');
    assert.strictEqual(apiFinding.evidence[0].file, 'apps/api/package.json');
  });

  // Test 7: Component with no rule must be unknown, NEVER match (Task 4)
  it('marks unknown component without signature as unknown, never match', () => {
    const files = [
      {
        path: 'src/custom.js',
        content: 'console.log("RandomCustomWidget");'
      }
    ];
    const components = [{ name: 'QuantumTeleportationEngine' }];

    const result = scan({ files, components });

    const unknownFinding = result.findings.find(f => f.name === 'QuantumTeleportationEngine');
    assert.ok(unknownFinding, 'Should have unknown finding');
    assert.strictEqual(unknownFinding.status, 'unknown');
    assert.strictEqual(unknownFinding.evidence.length, 0);
  });

  // Test 8: Extended technologies (Task 4: Supabase, Prisma, Neon, Sentry, Auth0)
  it('detects extended signatures (Supabase, Prisma, Neon, Sentry, Auth0)', () => {
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({
          dependencies: {
            '@supabase/supabase-js': '^2.39.0',
            '@prisma/client': '^5.10.0',
            '@neondatabase/serverless': '^0.9.0',
            '@sentry/node': '^7.100.0',
            '@auth0/auth0-react': '^2.2.4'
          }
        }, null, 2)
      }
    ];
    const components = [
      { name: 'Supabase' },
      { name: 'Prisma' },
      { name: 'Neon' },
      { name: 'Sentry' },
      { name: 'Auth0' }
    ];

    const result = scan({ files, components });

    for (const comp of components) {
      const finding = result.findings.find(f => f.name === comp.name);
      assert.ok(finding, `Finding for ${comp.name} should exist`);
      assert.strictEqual(finding.status, 'match', `${comp.name} should match`);
    }
  });
});
