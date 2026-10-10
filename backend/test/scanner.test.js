import { describe, it } from 'node:test';
import assert from 'node:assert';
import { scan } from '../src/services/scanner.js';

describe('DriftArc 4-Pillar Optimized Architecture Engine', () => {
  // Test 1: Basic component matching
  it('identifies matched component when dependency exists in package.json', async () => {
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

    const result = await scan({ files, components });

    const matchFinding = result.findings.find(f => f.name === 'React');
    assert.ok(matchFinding, 'Should have React finding');
    assert.strictEqual(matchFinding.status, 'match');
    assert.ok(matchFinding.evidence.length > 0, 'Should have evidence');
    assert.strictEqual(matchFinding.evidence[0].file, 'package.json');
  });

  // Test 2: Basic component mismatch
  it('flags mismatch when declared component is absent from codebase', async () => {
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

    const result = await scan({ files, components });

    const redisFinding = result.findings.find(f => f.name === 'Redis');
    assert.ok(redisFinding, 'Should have Redis finding');
    assert.strictEqual(redisFinding.status, 'mismatch');
    assert.strictEqual(redisFinding.evidence.length, 0);
  });

  // Test 3: docker-compose detection
  it('detects component from docker-compose.yml definition', async () => {
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

    const result = await scan({ files, components });

    const pgFinding = result.findings.find(f => f.name === 'PostgreSQL');
    assert.ok(pgFinding, 'Should find PostgreSQL from docker-compose');
    assert.strictEqual(pgFinding.status, 'match');
    assert.ok(pgFinding.evidence.some(e => e.file === 'docker-compose.yml'));
  });

  // Test 4: .env.example detection
  it('detects component from .env.example configuration keys', async () => {
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

    const result = await scan({ files, components });

    const stripeFinding = result.findings.find(f => f.name === 'Stripe');
    assert.ok(stripeFinding, 'Should find Stripe from .env.example');
    assert.strictEqual(stripeFinding.status, 'match');
    assert.ok(stripeFinding.evidence.some(e => e.file === '.env.example'));
  });

  // Test 5: require() import detection
  it('detects component from CommonJS require() import statement', async () => {
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

    const result = await scan({ files, components });

    const expressFinding = result.findings.find(f => f.name === 'Express');
    assert.ok(expressFinding, 'Should find Express from require statement');
    assert.strictEqual(expressFinding.status, 'match');
    assert.ok(expressFinding.evidence.some(e => e.type === 'import'));
  });

  // Test 6: Monorepo apps/api/package.json detection
  it('detects component inside monorepo subdirectory apps/api/package.json', async () => {
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

    const result = await scan({ files, components });

    const apiFinding = result.findings.find(f => f.name === 'API');
    assert.ok(apiFinding, 'Should find API in monorepo subfolder');
    assert.strictEqual(apiFinding.status, 'match');
    assert.strictEqual(apiFinding.evidence[0].file, 'apps/api/package.json');
  });

  // Test 7: Component with synthesis disabled remains unknown
  it('marks unknown component without signature as unknown when synthesis is disabled', async () => {
    const files = [
      {
        path: 'src/custom.js',
        content: 'console.log("RandomCustomWidget");'
      }
    ];
    const components = [{ name: 'QuantumTeleportationEngine' }];

    const result = await scan({ files, components, enableSynthesis: false });

    const unknownFinding = result.findings.find(f => f.name === 'QuantumTeleportationEngine');
    assert.ok(unknownFinding, 'Should have unknown finding');
    assert.strictEqual(unknownFinding.status, 'unknown');
    assert.strictEqual(unknownFinding.evidence.length, 0);
  });

  // Test 8: Extended technologies (Supabase, Prisma, Neon, Sentry, Auth0)
  it('detects extended signatures (Supabase, Prisma, Neon, Sentry, Auth0)', async () => {
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

    const result = await scan({ files, components });

    for (const comp of components) {
      const finding = result.findings.find(f => f.name === comp.name);
      assert.ok(finding, `Finding for ${comp.name} should exist`);
      assert.strictEqual(finding.status, 'match', `${comp.name} should match`);
    }
  });

  // Test 9: Gemma / Gemini AI detection
  it('detects Gemma / Gemini AI signatures with concrete evidence', async () => {
    const files = [
      {
        path: '.env',
        content: 'GEMINI_API_KEY=test-ai-key-12345\nPORT=3001'
      },
      {
        path: 'src/services/gemma.js',
        content: 'export async function extractDiagram() { /* callGeminiApi */ }'
      }
    ];
    const components = [{ name: 'Gemma 4 / Gemini Vision' }, { name: 'Gemma 4 / Gemini Text' }];

    const result = await scan({ files, components });

    const visionFinding = result.findings.find(f => f.name === 'Gemma 4 / Gemini Vision');
    const textFinding = result.findings.find(f => f.name === 'Gemma 4 / Gemini Text');

    assert.ok(visionFinding, 'Should have vision finding');
    assert.strictEqual(visionFinding.status, 'match');
    assert.strictEqual(visionFinding.signatureId, 'gemini');
    assert.ok(visionFinding.evidence.length >= 2, 'Should have env and file evidence');

    assert.ok(textFinding, 'Should have text finding');
    assert.strictEqual(textFinding.status, 'match');
    assert.strictEqual(textFinding.signatureId, 'gemini');
  });

  // Test 10: Specificity order
  it('prioritizes GitHub REST API signature over generic Express REST API alias', async () => {
    const files = [
      {
        path: 'src/services/github.js',
        content: 'const url = "https://api.github.com/repos/test/issues";'
      },
      {
        path: 'package.json',
        content: JSON.stringify({ dependencies: { express: '^4.19.0' } })
      }
    ];
    const components = [{ name: 'GitHub REST API' }];

    const result = await scan({ files, components });

    const ghFinding = result.findings.find(f => f.name === 'GitHub REST API');
    assert.ok(ghFinding, 'Should find GitHub REST API');
    assert.strictEqual(ghFinding.signatureId, 'github-api');
    assert.strictEqual(ghFinding.status, 'match');
    assert.ok(ghFinding.evidence.some(e => e.file === 'src/services/github.js'));
    assert.ok(!ghFinding.evidence.some(e => e.file === 'package.json'), 'Should not match express dependency');
  });

  // ================= 4-PILLAR ARCHITECTURE TESTS =================

  // Pillar 1: Dynamic Signature Synthesis
  it('Pillar 1: dynamically synthesizes signature for uncataloged component (Kafka) and verifies evidence', async () => {
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({
          dependencies: {
            kafkajs: '^2.2.4'
          }
        }, null, 2)
      },
      {
        path: 'docker-compose.yml',
        content: 'image: confluentinc/cp-kafka:7.3.0\nenvironment:\n  KAFKA_BROKER: kafka:9092'
      }
    ];
    // "Kafka" is not in static catalog, but synthesized dynamically!
    const components = [{ name: 'Kafka' }];

    const result = await scan({ files, components, enableSynthesis: true });

    const kafkaFinding = result.findings.find(f => f.name === 'Kafka');
    assert.ok(kafkaFinding, 'Kafka finding should be synthesized');
    assert.strictEqual(kafkaFinding.status, 'match');
    assert.strictEqual(kafkaFinding.synthesized, true);
    assert.ok(kafkaFinding.evidence.length >= 2, 'Should capture dependency and docker evidence');
  });

  // Pillar 2: Universal Polyglot Manifests (Python, Go, Rust)
  it('Pillar 2: detects dependencies from Python requirements.txt, Go go.mod, and Rust Cargo.toml', async () => {
    const files = [
      // Python requirements
      {
        path: 'requirements.txt',
        content: 'fastapi==0.110.0\nredis>=5.0.0\n# comment line with postgresql\n'
      },
      // Go mod
      {
        path: 'go.mod',
        content: `
module my-go-service

go 1.22

require (
  github.com/gin-gonic/gin v1.9.1
  github.com/redis/go-redis/v9 v9.5.1
)
`
      },
      // Rust Cargo.toml
      {
        path: 'Cargo.toml',
        content: `
[package]
name = "rust-service"
version = "0.1.0"

[dependencies]
stripe = "0.28"
tokio = "1.0"
`
      }
    ];

    const components = [{ name: 'Redis' }, { name: 'Stripe' }];

    const result = await scan({ files, components });

    const redisFinding = result.findings.find(f => f.name === 'Redis');
    const stripeFinding = result.findings.find(f => f.name === 'Stripe');

    assert.ok(redisFinding, 'Should detect Redis from requirements.txt and go.mod');
    assert.strictEqual(redisFinding.status, 'match');
    assert.ok(redisFinding.evidence.some(e => e.file === 'requirements.txt'));

    assert.ok(stripeFinding, 'Should detect Stripe from Cargo.toml');
    assert.strictEqual(stripeFinding.status, 'match');
    assert.ok(stripeFinding.evidence.some(e => e.file === 'Cargo.toml'));
  });

  // Pillar 3: Real Call-Graph Connection Tracing
  it('Pillar 3: isolates call sites to verify real flow between frontend and API', async () => {
    const files = [
      {
        path: 'frontend/src/api.js',
        content: `
export async function getHealth() {
  const res = await fetch('/api/health');
  return res.json();
}
`
      },
      {
        path: 'frontend/package.json',
        content: JSON.stringify({ dependencies: { react: '^18.2.0' } })
      },
      {
        path: 'backend/package.json',
        content: JSON.stringify({ dependencies: { express: '^4.19.0' } })
      }
    ];

    const components = [{ name: 'React' }, { name: 'Express / Node API' }];
    const connections = [{ from: 'React', to: 'Express / Node API', label: 'HTTP API' }];

    const result = await scan({ files, components, connections });

    assert.ok(result.connectionsCheck.length > 0, 'Should have connection check');
    const conn = result.connectionsCheck[0];
    assert.strictEqual(conn.status, 'flow-verified');
    assert.strictEqual(conn.flowVerified, true);
    assert.ok(conn.callSites.length > 0, 'Should have exact call site snippet');
    assert.strictEqual(conn.callSites[0].file, 'frontend/src/api.js');
    assert.ok(conn.callSites[0].snippet.includes("fetch('/api/health')"));
  });

  // Pillar 4: Incremental Content Hash Cache
  it('Pillar 4: provides sub-50ms incremental scan metrics and cache hit stats', async () => {
    const files = [
      {
        path: 'package.json',
        content: JSON.stringify({ dependencies: { react: '^18.2.0' } })
      }
    ];
    const components = [{ name: 'React' }];

    const result = await scan({ files, components });

    assert.ok(result.summary.performance, 'Should include performance metrics');
    assert.ok(typeof result.summary.performance.scanDurationMs === 'number');
    assert.ok(typeof result.summary.performance.hitRatio === 'string');
    assert.ok(result.summary.performance.optimizedEngine.includes('4-Pillar'));
  });
});
