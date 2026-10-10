/**
 * Frontend API client communicating via the Vite proxy to DriftCheck backend.
 */

export async function checkHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function extractDiagram(imageFile, imageBase64) {
  let res;
  if (imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    res = await fetch('/api/diagram/extract', {
      method: 'POST',
      body: formData
    });
  } else if (imageBase64) {
    res = await fetch('/api/diagram/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });
  } else {
    throw new Error('No image provided');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to extract architecture diagram');
  }
  return data;
}

export async function runScan({ repoUrl, branch, localPath, components, connections, token }) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['x-github-token'] = token;
  }

  const res = await fetch('/api/scan', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      repoUrl,
      branch,
      localPath,
      components,
      connections
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Repository scan failed');
  }
  return data;
}

export async function draftIssues({ findings, repoName }) {
  const res = await fetch('/api/issues/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ findings, repoName })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to draft GitHub issues');
  }
  return data.drafts || [];
}

export async function createIssue({ repoUrl, issue, dryRun, token }) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['x-github-token'] = token;
  }

  const res = await fetch('/api/issues/create', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      repoUrl,
      issue,
      dryRun
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create GitHub issue');
  }
  return data;
}
