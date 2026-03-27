import type { AgileItem } from './mpp-parser';

/** Export backlog as JSON file */
export function exportToJSON(items: AgileItem[]): string {
  const data = items.map(item => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    acceptanceCriteria: item.acceptanceCriteria.map(ac => ({
      given: ac.given,
      when: ac.when,
      then: ac.then,
    })),
    storyPoints: item.storyPoints,
    priority: item.priority,
    estimate: item.estimate,
    parentEpic: item.parentEpic || null,
    status: item.status,
  }));
  return JSON.stringify(data, null, 2);
}

/** Export backlog as Markdown */
export function exportToMarkdown(items: AgileItem[]): string {
  const lines: string[] = ['# AgileBridge Backlog\n'];

  const epics = items.filter(i => i.type === 'Epic');
  const stories = items.filter(i => i.type === 'User Story');

  for (const epic of epics) {
    lines.push(`## 🏔 ${epic.title}`);
    lines.push('');
    lines.push(`> ${epic.description}`);
    lines.push('');
    lines.push(`**Priority:** ${epic.priority} · **Points:** ${epic.storyPoints}`);
    lines.push('');

    const children = stories.filter(s => s.parentEpic === epic.title);
    for (const story of children) {
      lines.push(`### 📖 ${story.title}`);
      lines.push('');
      lines.push(story.description);
      lines.push('');
      lines.push(`**Priority:** ${story.priority} · **Points:** ${story.storyPoints} · **Estimate:** ${story.estimate}`);
      if (story.acceptanceCriteria.length > 0) {
        lines.push('');
        lines.push('**Acceptance Criteria:**');
        for (const ac of story.acceptanceCriteria) {
          lines.push(`- **Given** ${ac.given} **When** ${ac.when} **Then** ${ac.then}`);
        }
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  // Orphan stories (no parent epic)
  const orphans = stories.filter(s => !epics.some(e => e.title === s.parentEpic));
  if (orphans.length > 0) {
    lines.push('## Other Stories\n');
    for (const story of orphans) {
      lines.push(`### 📖 ${story.title}`);
      lines.push('');
      lines.push(story.description);
      lines.push('');
      lines.push(`**Priority:** ${story.priority} · **Points:** ${story.storyPoints} · **Estimate:** ${story.estimate}`);
      if (story.acceptanceCriteria.length > 0) {
        lines.push('');
        lines.push('**Acceptance Criteria:**');
        for (const ac of story.acceptanceCriteria) {
          lines.push(`- **Given** ${ac.given} **When** ${ac.when} **Then** ${ac.then}`);
        }
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

/** Copy backlog as tab-separated table (pastes into Google Sheets / Notion) */
export function copyToClipboardTable(items: AgileItem[]): string {
  const header = ['Type', 'Title', 'Description', 'Priority', 'Story Points', 'Status'].join('\t');
  const rows = items.map(item =>
    [item.type, item.title, item.description.replace(/\n/g, ' '), item.priority, item.storyPoints, item.status].join('\t')
  );
  return [header, ...rows].join('\n');
}

/** Trigger a file download from a string */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const bom = mimeType.includes('csv') ? '\uFEFF' : '';
  const blob = new Blob([bom + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
