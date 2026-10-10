import { draftIssueText } from './gemma.js';

/**
 * Builds a deterministic evidence markdown block from scan findings.
 * Keeps strict AI / non-AI split: LLM never fabricates code references.
 */
export function formatEvidenceMarkdown(finding) {
  const lines = [];

  lines.push('\n\n---');
  lines.push('### 🔍 Verified Scanner Evidence (Deterministic)');
  lines.push(`- **Component:** \`${finding.name}\``);
  lines.push(`- **Finding Classification:** **${(finding.status || '').toUpperCase()}**`);
  lines.push(`- **Audit Timestamp:** ${new Date().toISOString()}`);

  if (finding.status === 'mismatch') {
    lines.push('\n> **Finding Summary:** This component was present in the architecture diagram, but exhaustive scanning across dependencies, container definitions, and source files revealed **0 matches**.');
  } else if (finding.status === 'undocumented') {
    lines.push('\n> **Finding Summary:** This technology was discovered actively used in the repository, but is **missing from the architecture diagram**.');
  }

  if (Array.isArray(finding.evidence) && finding.evidence.length > 0) {
    lines.push('\n#### Code References:');
    lines.push('| File | Line | Snippet | Type |');
    lines.push('| :--- | :---: | :--- | :--- |');

    for (const item of finding.evidence) {
      const file = item.file || 'unknown';
      const line = item.line || '-';
      const snippet = (item.snippet || '').replace(/\|/g, '\\|');
      const type = item.type || 'code';
      lines.push(`| \`${file}\` | \`${line}\` | \`${snippet}\` | *${type}* |`);
    }
  } else {
    lines.push('\n*No codebase references were found.*');
  }

  lines.push('\n*Generated deterministically by DriftArc.*');
  return lines.join('\n');
}

/**
 * Creates a complete GitHub issue draft by combining AI-generated prose
 * with pure deterministic evidence appended by code.
 */
export async function draftIssue({ finding, repoName }) {
  if (!finding) {
    throw new Error('Finding object is required to draft an issue');
  }

  // 1. Model drafts narrative title & description from verified facts
  const { title, description } = await draftIssueText({ finding, repoName });

  // 2. Deterministic code appends factual evidence block
  const evidenceBlock = formatEvidenceMarkdown(finding);
  const fullBody = `${description}\n${evidenceBlock}`;

  return {
    title,
    body: fullBody,
    finding
  };
}
