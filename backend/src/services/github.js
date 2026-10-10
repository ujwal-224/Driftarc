/**
 * GitHub API service for creating issues.
 * Never stores or logs GitHub tokens.
 */

export async function createGitHubIssue({ owner, repo, title, body, token, dryRun = false }) {
  if (dryRun) {
    return {
      dryRun: true,
      message: 'Dry-run successful. No issue created on GitHub.',
      issue: {
        owner,
        repo,
        title,
        body
      }
    };
  }

  if (!token) {
    throw new Error('GitHub personal access token is required to create real issues');
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'DriftCheck-IssueWriter'
    },
    body: JSON.stringify({ title, body })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return {
    dryRun: false,
    id: result.id,
    number: result.number,
    htmlUrl: result.html_url,
    title: result.title
  };
}
