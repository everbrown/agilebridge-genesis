export interface RawTask {
  uid: string;
  name: string;
  outlineLevel: number;
  outlineNumber: string;
  duration: number; // minutes
  priority: number;
  startDate?: string;
  endDate?: string;
  percentComplete?: number;
  predecessors?: string[];
  resources?: string[];
}

export interface AgileItem {
  id: string;
  type: 'Epic' | 'User Story';
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  estimate: string;
  parentEpic?: string;
  outlineNumber: string;
  status: 'To Do' | 'In Progress' | 'Done';
}

export const parseMPPToAgile = (tasks: RawTask[]): AgileItem[] => {
  const epics = tasks.filter(t => t.outlineLevel === 1);
  
  return tasks.map(task => {
    const isEpic = task.outlineLevel === 1;
    const parentEpic = isEpic
      ? undefined
      : epics.find(e => task.outlineNumber.startsWith(e.outlineNumber.split('.')[0]))?.name;

    return {
      id: task.uid,
      type: isEpic ? 'Epic' : 'User Story',
      title: task.name,
      description: `Originating from WBS: ${task.outlineNumber}`,
      priority: task.priority > 700 ? 'High' : task.priority > 300 ? 'Medium' : 'Low',
      estimate: Math.ceil(task.duration / 480) + 'd',
      parentEpic,
      outlineNumber: task.outlineNumber,
      status: (task.percentComplete ?? 0) >= 100 ? 'Done' : (task.percentComplete ?? 0) > 0 ? 'In Progress' : 'To Do',
    };
  });
};

export const generateSampleMPPData = (): RawTask[] => [
  { uid: '1', name: 'Platform Migration', outlineLevel: 1, outlineNumber: '1', duration: 9600, priority: 800, percentComplete: 0 },
  { uid: '2', name: 'Audit existing infrastructure', outlineLevel: 2, outlineNumber: '1.1', duration: 2400, priority: 600, percentComplete: 0 },
  { uid: '3', name: 'Define migration strategy', outlineLevel: 2, outlineNumber: '1.2', duration: 1920, priority: 700, percentComplete: 0 },
  { uid: '4', name: 'Set up CI/CD pipelines', outlineLevel: 2, outlineNumber: '1.3', duration: 3360, priority: 800, percentComplete: 0 },
  { uid: '5', name: 'Execute data migration', outlineLevel: 2, outlineNumber: '1.4', duration: 1920, priority: 900, percentComplete: 0 },
  { uid: '6', name: 'User Authentication Overhaul', outlineLevel: 1, outlineNumber: '2', duration: 7200, priority: 900, percentComplete: 0 },
  { uid: '7', name: 'Evaluate OAuth providers', outlineLevel: 2, outlineNumber: '2.1', duration: 960, priority: 500, percentComplete: 0 },
  { uid: '8', name: 'Implement SSO integration', outlineLevel: 2, outlineNumber: '2.2', duration: 2880, priority: 800, percentComplete: 0 },
  { uid: '9', name: 'Build role-based access control', outlineLevel: 2, outlineNumber: '2.3', duration: 2400, priority: 900, percentComplete: 0 },
  { uid: '10', name: 'Security audit & penetration testing', outlineLevel: 2, outlineNumber: '2.4', duration: 960, priority: 700, percentComplete: 0 },
  { uid: '11', name: 'API Gateway Redesign', outlineLevel: 1, outlineNumber: '3', duration: 5760, priority: 700, percentComplete: 0 },
  { uid: '12', name: 'Define API versioning strategy', outlineLevel: 2, outlineNumber: '3.1', duration: 960, priority: 600, percentComplete: 0 },
  { uid: '13', name: 'Implement rate limiting', outlineLevel: 2, outlineNumber: '3.2', duration: 1920, priority: 800, percentComplete: 0 },
  { uid: '14', name: 'Set up API documentation', outlineLevel: 2, outlineNumber: '3.3', duration: 1440, priority: 500, percentComplete: 0 },
  { uid: '15', name: 'Load testing & optimization', outlineLevel: 2, outlineNumber: '3.4', duration: 1440, priority: 700, percentComplete: 0 },
];

export const parseCSVToAgile = (csvContent: string): AgileItem[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map((line, idx) => {
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });

    return {
      id: String(idx + 1),
      type: (row['type'] === 'Epic' ? 'Epic' : 'User Story') as 'Epic' | 'User Story',
      title: row['title'] || row['name'] || row['task'] || `Task ${idx + 1}`,
      description: row['description'] || row['desc'] || '',
      priority: (['High', 'Medium', 'Low'].includes(row['priority']) ? row['priority'] : 'Medium') as 'High' | 'Medium' | 'Low',
      estimate: row['estimate'] || row['duration'] || '1d',
      outlineNumber: row['wbs'] || String(idx + 1),
      status: 'To Do' as const,
    };
  });
};

export const exportToJiraCSV = (items: AgileItem[]): string => {
  const headers = ['Summary', 'Issue Type', 'Description', 'Priority', 'Original Estimate', 'Epic Link', 'Status'];
  const rows = items.map(item => [
    `"${item.title}"`,
    item.type === 'Epic' ? 'Epic' : 'Story',
    `"${item.description}"`,
    item.priority,
    item.estimate,
    item.parentEpic ? `"${item.parentEpic}"` : '',
    item.status,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
};
