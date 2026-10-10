export type DocumentType = 'Project Charter' | 'Work Breakdown Structure' | 'Unknown';

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

export interface AcceptanceCriterion {
  given: string;
  when: string;
  then: string;
}

export interface AgileItem {
  id: string;
  type: 'Epic' | 'User Story';
  title: string;
  description: string; // "As a... I want... So that..."
  acceptanceCriteria: AcceptanceCriterion[];
  storyPoints: number;
  priority: 'High' | 'Medium' | 'Low';
  estimate: string;
  parentEpic?: string;
  outlineNumber: string;
  status: 'To Do' | 'In Progress' | 'Done';
}

export interface ParseResult {
  documentType: DocumentType;
  milestones: string[];
  items: AgileItem[];
}

// ─── Document Classification ─────────────────────────────────────────

const CHARTER_KEYWORDS = ['charter', 'objective', 'stakeholder', 'scope', 'goal', 'vision', 'sponsor', 'business case', 'success criteria', 'deliverable'];
const WBS_KEYWORDS = ['wbs', 'work breakdown', 'outline', 'task', 'subtask', 'milestone', 'phase', 'duration', 'predecessor'];

export const classifyDocument = (filename: string, content?: string): DocumentType => {
  const lower = filename.toLowerCase();
  if (lower.includes('charter')) return 'Project Charter';
  if (lower.includes('wbs') || lower.endsWith('.mpp')) return 'Work Breakdown Structure';

  if (content) {
    const lowerContent = content.toLowerCase();
    const charterScore = CHARTER_KEYWORDS.filter(k => lowerContent.includes(k)).length;
    const wbsScore = WBS_KEYWORDS.filter(k => lowerContent.includes(k)).length;
    if (charterScore > wbsScore && charterScore >= 2) return 'Project Charter';
    if (wbsScore > charterScore && wbsScore >= 2) return 'Work Breakdown Structure';
  }

  return 'Unknown';
};

// ─── Milestone Extraction ────────────────────────────────────────────

const MILESTONE_PATTERNS = [
  /milestone[:\s]+(.+)/gi,
  /deliverable[:\s]+(.+)/gi,
  /key date[:\s]+(.+)/gi,
  /deadline[:\s]+(.+)/gi,
  /phase\s*\d*[:\s]+(.+)/gi,
  /go[- ]live[:\s]+(.+)/gi,
];

export const extractMilestones = (content: string): string[] => {
  const milestones: string[] = [];
  for (const pattern of MILESTONE_PATTERNS) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(content)) !== null) {
      const m = match[1].trim().replace(/[,;.]$/, '');
      if (m.length > 3 && m.length < 200 && !milestones.includes(m)) {
        milestones.push(m);
      }
    }
  }
  return milestones;
};

// ─── INVEST Story Generation ─────────────────────────────────────────

const PERSONA_MAP: Record<string, string> = {
  'infrastructure': 'DevOps Engineer',
  'migration': 'System Administrator',
  'audit': 'Compliance Officer',
  'security': 'Security Engineer',
  'authentication': 'End User',
  'auth': 'End User',
  'sso': 'Enterprise User',
  'api': 'API Consumer',
  'testing': 'QA Engineer',
  'documentation': 'Developer',
  'design': 'Product Designer',
  'performance': 'Performance Engineer',
  'data': 'Data Engineer',
  'user': 'End User',
  'admin': 'Administrator',
  'report': 'Business Analyst',
  'dashboard': 'Manager',
  'onboarding': 'New User',
  'notification': 'End User',
  'integration': 'Integration Engineer',
  'deploy': 'DevOps Engineer',
  'ci/cd': 'DevOps Engineer',
  'pipeline': 'DevOps Engineer',
  'monitor': 'SRE',
  'access': 'Administrator',
  'role': 'Administrator',
};

const inferPersona = (title: string): string => {
  const actor = title.match(/^(?:the\s+)?(users?|customers?|administrators?|admins?|developers?|managers?)\b/i)?.[1]?.toLowerCase();
  if (actor) {
    if (actor.startsWith('admin')) return 'Administrator';
    if (actor.startsWith('developer')) return 'Developer';
    if (actor.startsWith('manager')) return 'Manager';
    if (actor.startsWith('customer')) return 'Customer';
    return 'End User';
  }
  const lower = title.toLowerCase();
  for (const [keyword, persona] of Object.entries(PERSONA_MAP)) {
    if (lower.includes(keyword)) return persona;
  }
  return 'Project Stakeholder';
};

const generateUserStoryDescription = (title: string, persona: string): string => {
  const cleanTitle = title.trim().replace(/[.!;]+$/, '');
  if (/^as an?\s.+,?\s+i want\b/i.test(cleanTitle)) return `${cleanTitle}.`;
  let action = cleanTitle
    .replace(/^(?:the\s+)?(?:users?|customers?|administrators?|admins?|developers?|managers?|system|application|platform)\s+(?:(?:must|should|shall)\s+(?:be able to\s+)?|(?:need|needs)\s+to\s+|can\s+|will\s+)/i, '')
    .replace(/^(?:must|should|shall)\s+(?:be able to\s+)?/i, '')
    .replace(/^to\s+/i, '')
    .replace(/\btheir\b/gi, 'my')
    .replace(/\bthemselves\b/gi, 'myself');
  action = action.charAt(0).toLowerCase() + action.slice(1);
  const isAction = /^(?:reset|log|sign|view|create|edit|delete|manage|receive|send|export|import|download|upload|search|filter|access|configure|enable|disable|track|approve|reject|update|add|remove|build|implement|define|set|audit|execute|evaluate|conduct|establish|deploy|migrate|integrate|monitor|test|validate|use|save|select|invite|assign|provide|support|allow|ensure|recover|register|change|see|review)\b/i.test(action);
  const benefit = inferBenefit(title);
  const article = /^[aeiou]/i.test(persona) ? 'an' : 'a';
  return `As ${article} ${persona}, I want ${isAction ? 'to ' : ''}${action}, so that ${benefit}.`;
};

const inferBenefit = (title: string): string => {
  const lower = title.toLowerCase();
  if (lower.includes('password')) return 'I can regain secure access to my account';
  if (lower.includes('audit') || lower.includes('security')) return 'the system meets compliance and security standards';
  if (lower.includes('migration') || lower.includes('migrate')) return 'the platform runs on modern, supported infrastructure';
  if (lower.includes('pipeline') || lower.includes('ci/cd') || lower.includes('deploy')) return 'code changes can be delivered reliably and frequently';
  if (lower.includes('sso') || lower.includes('authentication') || lower.includes('auth')) return 'users can securely access the system with minimal friction';
  if (lower.includes('role') || lower.includes('access') || lower.includes('rbac')) return 'permissions are properly enforced across the application';
  if (lower.includes('test') || lower.includes('testing')) return 'we can ensure quality and catch regressions early';
  if (lower.includes('api') || lower.includes('gateway')) return 'external consumers can reliably integrate with our services';
  if (lower.includes('documentation') || lower.includes('doc')) return 'developers can onboard quickly and reference accurate technical guides';
  if (lower.includes('performance') || lower.includes('optimization') || lower.includes('load')) return 'the system performs within acceptable latency and throughput targets';
  if (lower.includes('monitor') || lower.includes('observability')) return 'we can detect and respond to issues before users are impacted';
  if (lower.includes('rate limit')) return 'the API is protected from abuse and overuse';
  if (lower.includes('version')) return 'we can evolve the API without breaking existing consumers';
  return 'the project can proceed with reduced risk and clear outcomes';
};

const generateAcceptanceCriteria = (title: string, type: 'Epic' | 'User Story'): AcceptanceCriterion[] => {
  const lower = title.toLowerCase();
  const criteria: AcceptanceCriterion[] = [];

  if (type === 'Epic') {
    criteria.push({
      given: `the ${title} initiative is approved`,
      when: 'all child stories are completed',
      then: 'the epic is marked as done and stakeholders are notified',
    });
    return criteria;
  }

  // Generate contextual AC based on keywords
  if (lower.includes('audit') || lower.includes('security')) {
    criteria.push(
      { given: 'the system is deployed', when: 'a security scan is executed', then: 'all critical vulnerabilities are identified and documented' },
      { given: 'vulnerabilities are found', when: 'remediation is applied', then: 'a follow-up scan shows zero critical findings' },
    );
  } else if (lower.includes('migration') || lower.includes('migrate')) {
    criteria.push(
      { given: 'source data is identified', when: 'migration scripts are executed', then: 'all records are transferred with zero data loss' },
      { given: 'migration is complete', when: 'data integrity checks run', then: 'checksums match between source and target systems' },
    );
  } else if (lower.includes('pipeline') || lower.includes('ci/cd') || lower.includes('deploy')) {
    criteria.push(
      { given: 'code is pushed to the main branch', when: 'the CI/CD pipeline triggers', then: 'all stages (build, test, deploy) pass within 15 minutes' },
      { given: 'a deployment fails', when: 'the rollback mechanism is triggered', then: 'the previous stable version is restored within 5 minutes' },
    );
  } else if (lower.includes('sso') || lower.includes('auth')) {
    criteria.push(
      { given: 'a user has valid SSO credentials', when: 'they attempt to log in', then: 'they are authenticated and redirected within 3 seconds' },
      { given: 'a user session expires', when: 'they perform an action', then: 'they are redirected to the login page with a clear message' },
    );
  } else if (lower.includes('role') || lower.includes('access') || lower.includes('rbac')) {
    criteria.push(
      { given: 'roles are configured in the system', when: 'a user without the required role attempts a restricted action', then: 'access is denied with a 403 response' },
      { given: 'an admin assigns a role to a user', when: 'the user next logs in', then: 'the updated permissions are reflected immediately' },
    );
  } else if (lower.includes('api') || lower.includes('rate limit') || lower.includes('version')) {
    criteria.push(
      { given: 'the API is deployed', when: 'a consumer sends a valid request', then: 'a correct response is returned within the SLA' },
      { given: 'the API documentation is published', when: 'a developer reads it', then: 'they can make a successful request without additional support' },
    );
  } else if (lower.includes('test') || lower.includes('load')) {
    criteria.push(
      { given: 'the test suite is configured', when: 'tests are executed', then: 'all tests pass with >90% code coverage on critical paths' },
      { given: 'a load test is run', when: 'traffic reaches 2x expected peak', then: 'response times remain under 500ms at p95' },
    );
  } else {
    criteria.push(
      { given: `the ${title.toLowerCase()} task is started`, when: 'all subtasks are completed', then: 'the definition of done is met and reviewed by the team' },
      { given: 'the work is complete', when: 'a peer review is conducted', then: 'no blocking issues remain and documentation is updated' },
    );
  }

  return criteria;
};

const estimateStoryPoints = (task: RawTask): number => {
  const days = Math.ceil(task.duration / 480);
  if (days <= 1) return 1;
  if (days <= 2) return 2;
  if (days <= 3) return 3;
  if (days <= 5) return 5;
  if (days <= 8) return 8;
  if (days <= 13) return 13;
  return 21; // Fibonacci scale
};

// ─── Main Parsers ────────────────────────────────────────────────────

/** Section labels describe document organization, not deliverable work. */
export const isGenericHeading = (value: string): boolean => {
  const label = value.trim()
    .replace(/^#{1,6}\s+/, '')
    .replace(/^(?:[-•*]\s+|\d+(?:\.\d+)*[.)]?\s+)/, '')
    .replace(/[*_]/g, '')
    .replace(/[:.\s]+$/, '')
    .toLowerCase();
  return /^(?:(?:functional|non[- ]functional|business|technical|project|key)\s+)?(?:requirements?|epics?|user stories|stories|tasks?|features?|items?|scope|objectives?|overview|introduction|acceptance criteria|milestones?|deliverables?|project charter|work breakdown structure|wbs)$/.test(label);
};

export const parseMPPToAgile = (tasks: RawTask[]): AgileItem[] => {
  const meaningfulTasks = tasks.filter(t => t.name.trim() && !isGenericHeading(t.name));
  const epics = meaningfulTasks.filter(t => t.outlineLevel === 1);

  return meaningfulTasks.map(task => {
    const isEpic = task.outlineLevel === 1;
    const parentEpic = isEpic
      ? undefined
      : epics.find(e => task.outlineNumber.startsWith(e.outlineNumber.split('.')[0]))?.name;
    const type = isEpic ? 'Epic' as const : 'User Story' as const;
    const persona = inferPersona(task.name);
    const sp = estimateStoryPoints(task);

    return {
      id: task.uid,
      type,
      title: task.name,
      description: generateUserStoryDescription(task.name, persona),
      acceptanceCriteria: generateAcceptanceCriteria(task.name, type),
      storyPoints: sp,
      priority: task.priority > 700 ? 'High' as const : task.priority > 300 ? 'Medium' as const : 'Low' as const,
      estimate: Math.ceil(task.duration / 480) + 'd',
      parentEpic,
      outlineNumber: task.outlineNumber,
      status: (task.percentComplete ?? 0) >= 100 ? 'Done' as const : (task.percentComplete ?? 0) > 0 ? 'In Progress' as const : 'To Do' as const,
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

export const generateSampleCharterData = (): RawTask[] => [
  { uid: '1', name: 'Digital Transformation Initiative', outlineLevel: 1, outlineNumber: '1', duration: 19200, priority: 900, percentComplete: 0 },
  { uid: '2', name: 'Stakeholder alignment & kickoff', outlineLevel: 2, outlineNumber: '1.1', duration: 480, priority: 800, percentComplete: 0 },
  { uid: '3', name: 'Define success criteria & KPIs', outlineLevel: 2, outlineNumber: '1.2', duration: 960, priority: 700, percentComplete: 0 },
  { uid: '4', name: 'Legacy System Modernization', outlineLevel: 1, outlineNumber: '2', duration: 14400, priority: 800, percentComplete: 0 },
  { uid: '5', name: 'Inventory all legacy systems', outlineLevel: 2, outlineNumber: '2.1', duration: 1920, priority: 600, percentComplete: 0 },
  { uid: '6', name: 'Prioritize systems for migration', outlineLevel: 2, outlineNumber: '2.2', duration: 960, priority: 700, percentComplete: 0 },
  { uid: '7', name: 'Deploy cloud-native replacements', outlineLevel: 2, outlineNumber: '2.3', duration: 4800, priority: 900, percentComplete: 0 },
  { uid: '8', name: 'Team Enablement', outlineLevel: 1, outlineNumber: '3', duration: 4800, priority: 700, percentComplete: 0 },
  { uid: '9', name: 'Conduct Agile training workshops', outlineLevel: 2, outlineNumber: '3.1', duration: 1440, priority: 600, percentComplete: 0 },
  { uid: '10', name: 'Establish communities of practice', outlineLevel: 2, outlineNumber: '3.2', duration: 960, priority: 500, percentComplete: 0 },
];

export const parseCSVToAgile = (csvContent: string): AgileItem[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  return lines.slice(1).map((line, idx) => {
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });

    const type = (row['type'] === 'Epic' ? 'Epic' : 'User Story') as 'Epic' | 'User Story';
    const title = row['title'] || row['name'] || row['task'] || `Task ${idx + 1}`;
    const persona = inferPersona(title);
    const durationDays = parseInt(row['duration'] || row['estimate'] || '2', 10) || 2;

    return {
      id: String(idx + 1),
      type,
      title,
      description: row['description'] || generateUserStoryDescription(title, persona),
      acceptanceCriteria: generateAcceptanceCriteria(title, type),
      storyPoints: durationDays <= 1 ? 1 : durationDays <= 3 ? 3 : durationDays <= 5 ? 5 : 8,
      priority: (['High', 'Medium', 'Low'].includes(row['priority']) ? row['priority'] : 'Medium') as 'High' | 'Medium' | 'Low',
      estimate: row['estimate'] || row['duration'] || '1d',
      outlineNumber: row['wbs'] || String(idx + 1),
      status: 'To Do' as const,
    };
  }).filter(item => !isGenericHeading(item.title));
};

export const parseTextContent = (content: string, filename: string): ParseResult => {
  const documentType = classifyDocument(filename, content);
  const milestones = extractMilestones(content);

  // Only explicit, meaningful epic/phase labels create hierarchy.
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 5 && !isGenericHeading(l));
  const requirementLines = lines.filter(l =>
    /^[-•*]\s/.test(l) ||
    /^\d+[\.\)]\s/.test(l) ||
    /^(req|requirement|task|feature|story|item|epic|phase)\b/i.test(l)
  );

  let epicNumber = 0;
  let storyNumber = 0;
  const rawTasks: RawTask[] = (requirementLines.length > 0 ? requirementLines : lines.filter(l => !/^#|:$/.test(l)).slice(0, 20)).map((line, idx) => {
    const stripped = line.replace(/^(?:[-•*]\s+|\d+(?:\.\d+)*[.)]?\s+)/, '').trim();
    const isEpic = /^(?:epic|phase)\s*:\s*\S/i.test(stripped);
    const cleanLine = stripped.replace(/^(?:epic|phase|requirement|req|task|feature|story|item)\s*(?:\d+\s*)?:\s*/i, '').replace(/[*_]/g, '').trim();
    if (isEpic) { epicNumber++; storyNumber = 0; }
    else { storyNumber++; }
    return {
      uid: String(idx + 1),
      name: cleanLine,
      outlineLevel: isEpic ? 1 : 2,
      outlineNumber: isEpic ? String(epicNumber) : epicNumber > 0 ? `${epicNumber}.${storyNumber}` : `0.${storyNumber}`,
      duration: 960 + Math.floor(Math.random() * 3840),
      priority: 400 + Math.floor(Math.random() * 500),
      percentComplete: 0,
    };
  });

  return {
    documentType,
    milestones,
    items: parseMPPToAgile(rawTasks),
  };
};

/**
 * RFC 4180-compliant CSV field escaping.
 */
const escapeCSVField = (value: string): string => {
  const stripped = value.replace(/<[^>]*>/g, '');
  if (stripped.includes(',') || stripped.includes('"') || stripped.includes('\n') || stripped.includes('\r')) {
    return `"${stripped.replace(/"/g, '""')}"`;
  }
  return stripped;
};

/**
 * Exports backlog to a simple 4-column CSV: Summary, Description, Priority, Issue Type.
 * User Story + Acceptance Criteria are merged into Description.
 */
export const exportToJiraCSV = (items: AgileItem[]): string => {
  const BOM = '\uFEFF';
  const headers = ['Summary', 'Description', 'Priority', 'Issue Type'];

  const rows = items.map(item => {
    const acLines = item.acceptanceCriteria
      .map((ac, i) => `${i + 1}. Given ${ac.given}, When ${ac.when}, Then ${ac.then}`)
      .join('\n');

    const description = `${item.description}\n\nAcceptance Criteria:\n${acLines}\n\n— Generated with AgileBridge.ai — Convert PRDs to Epics & User Stories in seconds. https://agilebridge.ai`;

    return [
      escapeCSVField(item.title),
      escapeCSVField(description),
      escapeCSVField(item.priority),
      escapeCSVField(item.type === 'Epic' ? 'Epic' : 'Story'),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n');
};
