import type { AgileItem } from './mpp-parser';

export const ATTRIBUTION_URL = 'https://agilebridge.ai';
export const ATTRIBUTION_TEXT = 'Generated with AgileBridge.ai — Convert PRDs to Epics & User Stories in seconds.';
export const ATTRIBUTION_MARKDOWN = `_Generated with [AgileBridge.ai](${ATTRIBUTION_URL}) — Convert PRDs to Epics & User Stories in seconds._`;
/** Plain-text attribution used inside CSV / Jira description fields */
export const ATTRIBUTION_PLAIN = `${ATTRIBUTION_TEXT} ${ATTRIBUTION_URL}`;

const acLine = (ac: AgileItem['acceptanceCriteria'][number]) =>
  `**Given** ${ac.given} **When** ${ac.when} **Then** ${ac.then}`;

/** Export backlog as JSON file */
export function exportToJSON(items: AgileItem[]): string {
  const data = items.map(item => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    acceptanceCriteria: item.acceptanceCriteria.map(ac => ({ given: ac.given, when: ac.when, then: ac.then })),
    storyPoints: item.storyPoints,
    priority: item.priority,
    estimate: item.estimate,
    parentEpic: item.parentEpic || null,
    status: item.status,
  }));
  return JSON.stringify({ generatedWith: ATTRIBUTION_URL, items: data }, null, 2);
}

const storyBlock = (story: AgileItem, lines: string[]) => {
  lines.push(`### 📖 ${story.title}`, '', story.description, '');
  lines.push(`**Priority:** ${story.priority} · **Points:** ${story.storyPoints} · **Estimate:** ${story.estimate}`);
  if (story.acceptanceCriteria.length > 0) {
    lines.push('', '**Acceptance Criteria:**');
    for (const ac of story.acceptanceCriteria) lines.push(`- ${acLine(ac)}`);
  }
  lines.push('', '---', '');
};

/** Export backlog as Markdown (with attribution footer) */
export function exportToMarkdown(items: AgileItem[]): string {
  const lines: string[] = ['# AgileBridge Backlog\n'];
  const epics = items.filter(i => i.type === 'Epic');
  const stories = items.filter(i => i.type === 'User Story');

  for (const epic of epics) {
    lines.push(`## 🏔 ${epic.title}`, '', `> ${epic.description}`, '');
    lines.push(`**Priority:** ${epic.priority} · **Points:** ${epic.storyPoints}`, '');
    stories.filter(s => s.parentEpic === epic.title).forEach(s => storyBlock(s, lines));
  }

  const orphans = stories.filter(s => !epics.some(e => e.title === s.parentEpic));
  if (orphans.length > 0) {
    lines.push('## Other Stories\n');
    orphans.forEach(s => storyBlock(s, lines));
  }

  lines.push('', ATTRIBUTION_MARKDOWN);
  return lines.join('\n');
}

/** Jira-flavoured markdown: one block per issue, attribution in each description footer */
export function exportToJiraMarkdown(items: AgileItem[]): string {
  const blocks = items.map(item => {
    const lines = [
      `h2. [${item.type === 'Epic' ? 'Epic' : 'Story'}] ${item.title}`,
      '',
      item.description,
      '',
      `*Priority:* ${item.priority} | *Story Points:* ${item.storyPoints} | *Estimate:* ${item.estimate}`,
    ];
    if (item.acceptanceCriteria.length > 0) {
      lines.push('', '*Acceptance Criteria:*');
      item.acceptanceCriteria.forEach(ac => lines.push(`# *Given* ${ac.given} *When* ${ac.when} *Then* ${ac.then}`));
    }
    lines.push('', `_${ATTRIBUTION_TEXT}_ [AgileBridge.ai|${ATTRIBUTION_URL}]`);
    return lines.join('\n');
  });
  return blocks.join('\n\n----\n\n');
}

/** Linear-flavoured markdown: one block per issue, attribution in each description footer */
export function exportToLinearMarkdown(items: AgileItem[]): string {
  const blocks = items.map(item => {
    const lines = [
      `## ${item.title}`,
      '',
      `\`${item.type === 'Epic' ? 'Project' : 'Issue'}\` · Priority: ${item.priority} · Estimate: ${item.storyPoints} pts`,
      '',
      item.description,
    ];
    if (item.acceptanceCriteria.length > 0) {
      lines.push('', '**Acceptance Criteria**');
      item.acceptanceCriteria.forEach(ac => lines.push(`- [ ] ${acLine(ac)}`));
    }
    lines.push('', ATTRIBUTION_MARKDOWN);
    return lines.join('\n');
  });
  return blocks.join('\n\n---\n\n');
}

/** Copy backlog as tab-separated table (pastes into Google Sheets / Notion) */
export function copyToClipboardTable(items: AgileItem[]): string {
  const header = ['Type', 'Title', 'Description', 'Priority', 'Story Points', 'Status'].join('\t');
  const rows = items.map(item =>
    [item.type, item.title, item.description.replace(/\n/g, ' '), item.priority, item.storyPoints, item.status].join('\t')
  );
  return [header, ...rows, '', ATTRIBUTION_PLAIN].join('\n');
}

/** Trigger a file download from a string */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const bom = mimeType.includes('csv') && !content.startsWith('\uFEFF') ? '\uFEFF' : '';
  const blob = new Blob([bom + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
