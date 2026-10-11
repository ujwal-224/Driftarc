import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGitHubUrl, fetchGitHubRepo } from '../src/services/repoFetcher.js';

test('GitHub Repo Fetcher', async (t) => {
  await t.test('parseGitHubUrl correctly parses diverse GitHub URLs and slugs', () => {
    assert.deepEqual(parseGitHubUrl('https://github.com/ujwal-224/MetrX'), {
      owner: 'ujwal-224',
      repo: 'MetrX'
    });
    assert.deepEqual(parseGitHubUrl('https://github.com/owner/repo.git'), {
      owner: 'owner',
      repo: 'repo'
    });
    assert.deepEqual(parseGitHubUrl('ujwal-224/MetrX'), {
      owner: 'ujwal-224',
      repo: 'MetrX'
    });
    assert.equal(parseGitHubUrl('invalid-url-format'), null);
    assert.equal(parseGitHubUrl(''), null);
  });

  await t.test('fetchGitHubRepo downloads and extracts public repo files via rate-limit-free tarball', async () => {
    const files = await fetchGitHubRepo({
      owner: 'ujwal-224',
      repo: 'MetrX',
      branch: 'main'
    });

    assert.ok(Array.isArray(files), 'Files should be an array');
    assert.ok(files.length > 0, 'Should find scannable files in repo');

    // Verify key files in MetrX
    const paths = files.map(f => f.path);
    assert.ok(paths.some(p => p.includes('package.json') || p.includes('.env.example') || p.includes('db.js')), 'Should contain code files');
    
    // Verify each file has path and string content
    const sample = files[0];
    assert.ok(sample.path, 'Each item should have path');
    assert.equal(typeof sample.content, 'string', 'Content should be a string');
  });
});
