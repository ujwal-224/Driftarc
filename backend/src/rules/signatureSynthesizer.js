import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local cache file location
const CACHE_DIR = path.resolve(__dirname, '../../../.driftarc');
const CACHE_FILE = path.join(CACHE_DIR, 'signatures.json');

/**
 * Ensures the cache directory and file exist.
 */
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Loads cached dynamically-synthesized signatures.
 */
export function loadCachedSignatures() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[SignatureSynthesizer] Failed to read signature cache:', err.message);
  }
  return [];
}

/**
 * Saves a synthesized signature into the local cache.
 */
export function saveCachedSignature(sig) {
  try {
    ensureCacheDir();
    const existing = loadCachedSignatures();
    const filtered = existing.filter(s => s.id !== sig.id);
    filtered.push(sig);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(filtered, null, 2), 'utf8');
  } catch (err) {
    console.warn('[SignatureSynthesizer] Failed to save signature to cache:', err.message);
  }
}

/**
 * Deterministic heuristic signature builder (offline fallback).
 */
export function buildHeuristicSignature(componentName) {
  const cleanName = componentName.trim();
  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const tokens = cleanName.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const primaryToken = tokens[0] || slug;

  return {
    id: slug,
    name: cleanName,
    aliases: Array.from(new Set([cleanName.toLowerCase(), slug, primaryToken])),
    dependencies: [slug, primaryToken, `${slug}js`, `${slug}-node`, `${slug}-client`, `${slug}-driver`],
    manifestKeys: {
      npm: [slug, primaryToken, `${slug}js`, `${slug}-node`, `${slug}-client`],
      python: [slug, primaryToken, `${slug}-python`, `aiokafka`, `confluent-${slug}`],
      go: [slug, primaryToken, `${slug}-go`],
      rust: [slug, primaryToken, `rd${slug}`]
    },
    envPatterns: [
      new RegExp(`${primaryToken.toUpperCase()}_`, 'i'),
      new RegExp(`${slug.toUpperCase()}_URL`, 'i'),
      new RegExp(`${slug.toUpperCase()}_BROKER`, 'i')
    ],
    dockerPatterns: [new RegExp(`image:\\s*.*${primaryToken}`, 'i')],
    importPatterns: [
      new RegExp(`(?:from\\s+['"][^'"]*${primaryToken}['"]|require\\(\\s*['"][^'"]*${primaryToken}['"]\\))`, 'i')
    ],
    filePatterns: [new RegExp(`${primaryToken}\\.(?:js|ts|py|go|rs)$`, 'i')],
    codePatterns: [
      new RegExp(`(?:new\\s+${primaryToken}|create${primaryToken}|${primaryToken}Client)`, 'i')
    ],
    synthesized: true,
    source: 'heuristic'
  };
}

/**
 * Compiles serialized string patterns from cache/JSON into native RegExp instances.
 */
export function hydrateSignature(rawSig) {
  const toRegex = (pattern) => {
    if (pattern instanceof RegExp) return pattern;
    if (typeof pattern === 'string') {
      try {
        return new RegExp(pattern, 'i');
      } catch {
        return null;
      }
    }
    return null;
  };

  return {
    ...rawSig,
    envPatterns: (rawSig.envPatterns || []).map(toRegex).filter(Boolean),
    dockerPatterns: (rawSig.dockerPatterns || []).map(toRegex).filter(Boolean),
    importPatterns: (rawSig.importPatterns || []).map(toRegex).filter(Boolean),
    filePatterns: (rawSig.filePatterns || []).map(toRegex).filter(Boolean),
    codePatterns: (rawSig.codePatterns || []).map(toRegex).filter(Boolean)
  };
}

/**
 * Pillar 1: Synthesizes a new signature dynamically using LLM, with deterministic validation & local caching.
 */
export async function synthesizeSignature(componentName, callLlmFn = null) {
  if (!componentName || typeof componentName !== 'string') return null;
  const normalized = componentName.trim();
  const slug = normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // 1. Check local rule cache first
  const cached = loadCachedSignatures().find(s => s.id === slug || s.aliases?.includes(normalized.toLowerCase()));
  if (cached) {
    return hydrateSignature(cached);
  }

  // 2. Synthesize with LLM if provider is active
  if (config.llm.apiKey && typeof callLlmFn === 'function') {
    const prompt = `You are a software dependency and architecture rule generator.
Given the technology/component name: "${normalized}"

Return ONLY a valid JSON object matching this schema:
{
  "id": "${slug}",
  "name": "${normalized}",
  "aliases": ["lowercase common names and variations"],
  "dependencies": ["npm package names"],
  "manifestKeys": {
    "npm": ["npm package names"],
    "python": ["pip package names"],
    "go": ["go module names"],
    "rust": ["crate names"]
  },
  "envPatterns": ["REGEX strings for environment variables, e.g. KAFKA_BROKER"],
  "dockerPatterns": ["REGEX strings for docker image names, e.g. image:.*kafka"],
  "importPatterns": ["REGEX strings for code import statements"],
  "codePatterns": ["REGEX strings for client initialization or method calls"]
}
Keep regex simple and safe. Never include markdown fences.`;

    try {
      const response = await callLlmFn({ prompt });
      if (response && response.name) {
        const synthesizedSig = {
          id: response.id || slug,
          name: response.name || normalized,
          aliases: Array.isArray(response.aliases) ? response.aliases : [normalized.toLowerCase()],
          dependencies: Array.isArray(response.dependencies) ? response.dependencies : [],
          manifestKeys: response.manifestKeys || {},
          envPatterns: Array.isArray(response.envPatterns) ? response.envPatterns : [],
          dockerPatterns: Array.isArray(response.dockerPatterns) ? response.dockerPatterns : [],
          importPatterns: Array.isArray(response.importPatterns) ? response.importPatterns : [],
          codePatterns: Array.isArray(response.codePatterns) ? response.codePatterns : [],
          synthesized: true,
          source: 'llm'
        };

        saveCachedSignature(synthesizedSig);
        return hydrateSignature(synthesizedSig);
      }
    } catch (err) {
      console.warn(`[SignatureSynthesizer] LLM synthesis failed for "${normalized}":`, err.message);
    }
  }

  // 3. Fallback to deterministic heuristic synthesis
  const heuristicSig = buildHeuristicSignature(normalized);
  saveCachedSignature({
    ...heuristicSig,
    envPatterns: heuristicSig.envPatterns.map(r => r.source),
    dockerPatterns: heuristicSig.dockerPatterns.map(r => r.source),
    importPatterns: heuristicSig.importPatterns.map(r => r.source),
    filePatterns: heuristicSig.filePatterns.map(r => r.source),
    codePatterns: heuristicSig.codePatterns.map(r => r.source)
  });

  return heuristicSig;
}
