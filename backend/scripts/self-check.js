import path from 'path';
import { fileURLToPath } from 'url';
import { fetchLocalRepo } from '../src/services/repoFetcher.js';
import { scan } from '../src/services/scanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSelfCheck() {
  console.log('=== DriftCheck Self-Check Architecture Audit ===');
  const repoRoot = path.resolve(__dirname, '../../');
  console.log(`Scanning DriftCheck repository at: ${repoRoot}`);

  const files = fetchLocalRepo(repoRoot);
  console.log(`Fetched ${files.length} repository files for analysis.`);

  // Self architecture declaration from docs/architecture.png
  const components = [
    { name: 'React' },
    { name: 'API' }
  ];

  const connections = [
    { from: 'React', to: 'API' }
  ];

  const { findings, summary, connectionsCheck } = scan({ files, components, connections });

  console.log('\nAudit Findings:');
  for (const f of findings) {
    const symbol = f.status === 'match' ? '✅' : f.status === 'mismatch' ? '❌' : f.status === 'undocumented' ? '⚠️' : '❓';
    console.log(`  ${symbol} [${f.status.toUpperCase()}] ${f.name} - ${f.reason || 'Verified'}`);
    if (f.evidence && f.evidence.length > 0) {
      console.log(`     Evidence: ${f.evidence[0].file}:${f.evidence[0].line} ("${f.evidence[0].snippet}")`);
    }
  }

  if (connectionsCheck && connectionsCheck.length > 0) {
    console.log('\nConnections Check (heuristic):');
    for (const c of connectionsCheck) {
      console.log(`  ${c.symbol} ${c.from} -> ${c.to}: ${c.note}`);
    }
  }

  console.log('\nSummary:');
  console.log(`  Matches     : ${summary.match}`);
  console.log(`  Mismatches  : ${summary.mismatch}`);
  console.log(`  Undocumented: ${summary.undocumented}`);
  console.log(`  Unknown     : ${summary.unknown}`);

  if (summary.mismatch > 0) {
    console.error(`\n❌ Self-check FAILED: ${summary.mismatch} architectural mismatch(es) detected.`);
    process.exit(1);
  }

  console.log('\n✅ Self-check PASSED: 0 architectural mismatches detected.');
  process.exit(0);
}

runSelfCheck();
