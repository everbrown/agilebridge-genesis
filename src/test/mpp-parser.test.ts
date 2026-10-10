import { describe, expect, it } from 'vitest';
import { parseTextContent, parseMPPToAgile, parseCSVToAgile } from '../lib/mpp-parser';

describe('requirement-to-story conversion', () => {
  it('converts an actor and modal requirement into a first-person action', () => {
    const { items } = parseTextContent('Requirements:\n- Users must be able to reset their password.', 'charter.txt');
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('User Story');
    expect(items[0].description).toBe('As an End User, I want to reset my password, so that I can regain secure access to my account.');
  });
  it('ignores generic headings without manufacturing periodic epics', () => {
    const { items } = parseTextContent('# Requirements\nFunctional Requirements:\n- View reports\n- Export reports\nAcceptance Criteria:\n- Create accounts\n- Edit accounts\n- Delete accounts', 'requirements.md');
    expect(items.map(i => i.title)).toEqual(['View reports', 'Export reports', 'Create accounts', 'Edit accounts', 'Delete accounts']);
    expect(items.every(i => i.type === 'User Story')).toBe(true);
  });
  it('retains explicit substantive epics and their child relationships', () => {
    const { items } = parseTextContent('Requirements:\nEpic: Account management\n- Users can reset their password\nEpic: Reporting\n- Managers should view reports', 'wbs.txt');
    expect(items.filter(i => i.type === 'Epic').map(i => i.title)).toEqual(['Account management', 'Reporting']);
    expect(items[1].parentEpic).toBe('Account management');
    expect(items[3].parentEpic).toBe('Reporting');
  });
  it('preserves already written user stories', () => {
    const description = 'As a customer, I want to view my orders, so that I can track delivery.';
    expect(parseTextContent(`- ${description}`, 'stories.txt').items[0].description).toBe(description);
  });
  it('does not prepend an infinitive to a noun phrase', () => {
    expect(parseTextContent('- Role-based access control', 'stories.txt').items[0].description).toContain('I want role-based access control,');
  });
  it('filters section headings from AI task structures', () => {
    expect(parseMPPToAgile([{ uid: '1', name: 'Requirements:', outlineLevel: 1, outlineNumber: '1', duration: 960, priority: 500 }])).toEqual([]);
  });
  it('filters section headings from CSV rows', () => {
    expect(parseCSVToAgile('title,type\nRequirements,Epic\nView reports,Story').map(i => i.title)).toEqual(['View reports']);
  });
});