import { useState, useCallback, useEffect, useRef } from 'react';
import { Download, Zap, FileSearch, Milestone, Lock, ChevronDown, Upload, FileJson, FileText, Clipboard, FileDown, Share2 } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import MobileSidebar from '@/components/MobileSidebar';
import IngestZone from '@/components/IngestZone';
import BacklogTable from '@/components/BacklogTable';
import ProgressBar from '@/components/ProgressBar';
import PaywallOverlay from '@/components/PaywallOverlay';
import JiraSyncModal from '@/components/JiraSyncModal';
import { FREE_STORY_LIMIT } from '@/lib/stripe-tiers';
import { supabase } from '@/integrations/supabase/client';
import { parseDocumentWithAI, aiResponseToRawTasks } from '@/lib/parse-document-ai';
import { exportToJSON, exportToMarkdown, exportToJiraMarkdown, exportToLinearMarkdown, copyToClipboardTable, downloadFile } from '@/lib/export-utils';
import { toast } from '@/hooks/use-toast';
import {
  AgileItem,
  ParseResult,
  DocumentType,
  parseMPPToAgile,
  parseCSVToAgile,
  parseTextContent,
  classifyDocument,
  extractMilestones,
  exportToJiraCSV,
} from '@/lib/mpp-parser';

const LOCAL_ACCESS_KEY = 'ab_checkout_success';
const LOCAL_ACCESS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — matches shortest tier (Sprint Pass)

const hasRecentLocalAccess = () => {
  if (typeof window === 'undefined') return false;

  const stored = window.localStorage.getItem(LOCAL_ACCESS_KEY);
  if (!stored) return false;

  const timestamp = Number(stored);
  if (!Number.isFinite(timestamp)) {
    window.localStorage.removeItem(LOCAL_ACCESS_KEY);
    return false;
  }

  if (Date.now() - timestamp > LOCAL_ACCESS_TTL_MS) {
    window.localStorage.removeItem(LOCAL_ACCESS_KEY);
    return false;
  }

  return true;
};

const markLocalAccessGranted = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_ACCESS_KEY, String(Date.now()));
};

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<AgileItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [docType, setDocType] = useState<DocumentType | null>(null);
  const [milestones, setMilestones] = useState<string[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [jiraModalOpen, setJiraModalOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Check if user has paid access
  const checkAccess = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setHasAccess(false);
        return;
      }

      setUserEmail(session.user?.email ?? null);
      setCheckingAccess(true);

      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data?.hasAccess) {
        markLocalAccessGranted();
        setHasAccess(true);
      } else if (hasRecentLocalAccess()) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch {
      if (!hasRecentLocalAccess()) {
        setHasAccess(false);
      }
    } finally {
      setCheckingAccess(false);
    }
  }, []);

  useEffect(() => {
    // Restore persisted stories from sessionStorage (survives checkout redirect)
    try {
      const savedItems = sessionStorage.getItem('ab_items');
      const savedDocType = sessionStorage.getItem('ab_docType');
      const savedMilestones = sessionStorage.getItem('ab_milestones');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
        setProgress(100);
      }
      if (savedDocType) setDocType(savedDocType as DocumentType);
      if (savedMilestones) setMilestones(JSON.parse(savedMilestones));
    } catch { /* ignore */ }

    // Check on URL params (checkout=success)
    const params = new URLSearchParams(window.location.search);
    const isCheckoutReturn = params.get('checkout') === 'success';

    if (isCheckoutReturn) {
      // User just paid — grant immediate access, don't race with API check
      markLocalAccessGranted();
      setHasAccess(true);
      window.history.replaceState({}, '', '/dashboard');
      toast({
        title: "Payment received!",
        description: "Your full backlog is now unlocked.",
      });
      // Delay API verification to let Stripe finalize (avoids race condition)
      const delayedCheck = setTimeout(() => void checkAccess(), 5000);
      return () => clearTimeout(delayedCheck);
    }

    // Normal page load — verify access immediately
    void checkAccess();

    // Re-check on focus (user returns from checkout in another tab)
    const handleFocus = () => {
      void checkAccess();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_ACCESS_KEY && hasRecentLocalAccess()) {
        setHasAccess(true);
      }
    };

    // Periodic re-check every 60s to pick up Stripe confirmation
    const interval = setInterval(() => void checkAccess(), 60_000);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [checkAccess]);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileAccepted = useCallback((f: File) => {
    setFile(f);
    setItems([]);
    setProgress(0);
    setDocType(null);
    setMilestones([]);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    const ext = file.name.split('.').pop()?.toLowerCase();

    // Phase 1: Classification (0-20%)
    for (let i = 0; i <= 20; i += 4) {
      await new Promise(r => setTimeout(r, 40));
      setProgress(i);
    }

    let detectedType: DocumentType;
    let detectedMilestones: string[] = [];
    let parsedItems: AgileItem[] = [];

    if (ext === 'csv') {
      const text = await file.text();
      detectedType = classifyDocument(file.name, text);
      detectedMilestones = extractMilestones(text);
      for (let i = 20; i <= 60; i += 5) {
        await new Promise(r => setTimeout(r, 40));
        setProgress(i);
      }
      parsedItems = parseCSVToAgile(text);
    } else if (ext === 'txt' || ext === 'md') {
      const text = await file.text();
      for (let i = 20; i <= 60; i += 5) {
        await new Promise(r => setTimeout(r, 40));
        setProgress(i);
      }
      const result: ParseResult = parseTextContent(text, file.name);
      detectedType = result.documentType;
      detectedMilestones = result.milestones;
      parsedItems = result.items;
    } else {
      // For PDF, DOCX, MPP — extract text client-side, then use Lovable AI to structure
      detectedType = classifyDocument(file.name);
      try {
        const aiResponse = await parseDocumentWithAI(file);
        for (let i = 20; i <= 50; i += 5) {
          await new Promise(r => setTimeout(r, 40));
          setProgress(i);
        }

        // Extract text content for milestone detection
        const textContent = (aiResponse.content || aiResponse.text || aiResponse.result || '') as string;
        if (textContent) {
          detectedMilestones = extractMilestones(textContent);
          detectedType = classifyDocument(file.name, textContent);
        }

        // Convert AI response to raw tasks then to agile items
        const rawTasks = aiResponseToRawTasks(aiResponse);
        for (let i = 50; i <= 60; i += 5) {
          await new Promise(r => setTimeout(r, 40));
          setProgress(i);
        }

        if (rawTasks.length > 0) {
          parsedItems = parseMPPToAgile(rawTasks);
        } else if (textContent) {
          // Fallback: parse the text content directly
          const result: ParseResult = parseTextContent(textContent, file.name);
          detectedType = result.documentType;
          detectedMilestones = result.milestones.length > 0 ? result.milestones : detectedMilestones;
          parsedItems = result.items;
        }
      } catch (err: any) {
        console.error('AI parsing failed, falling back to text extraction:', err);
        toast({
          title: "AI parsing unavailable",
          description: "Using basic text extraction instead. For best results, try a CSV or text file.",
          variant: "destructive",
        });
        // Fallback: try reading as text
        try {
          const text = await file.text();
          const result: ParseResult = parseTextContent(text, file.name);
          detectedType = result.documentType;
          detectedMilestones = result.milestones;
          parsedItems = result.items;
        } catch {
          // Binary file we can't read — show error
          setIsProcessing(false);
          toast({
            title: "Could not parse file",
            description: "This file format couldn't be processed. Please try a PDF, CSV, or text file.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Phase 3: INVEST story generation (60-100%)
    for (let i = 60; i <= 100; i += 4) {
      await new Promise(r => setTimeout(r, 30));
      setProgress(i);
    }

    setDocType(detectedType);
    setMilestones(detectedMilestones);
    setItems(parsedItems);
    setIsProcessing(false);

    // Persist to sessionStorage so data survives checkout redirect
    try {
      sessionStorage.setItem('ab_items', JSON.stringify(parsedItems));
      sessionStorage.setItem('ab_docType', detectedType || '');
      sessionStorage.setItem('ab_milestones', JSON.stringify(detectedMilestones));
    } catch { /* quota exceeded — ignore */ }
  }, [file]);

  const handleExportCSV = useCallback(() => {
    if (items.length === 0 || !hasAccess) return;
    const csv = exportToJiraCSV(items);
    downloadFile(csv, 'agilebridge-backlog.csv', 'text/csv');
  }, [items, hasAccess]);

  const handleExportJSON = useCallback(() => {
    if (items.length === 0 || !hasAccess) return;
    const json = exportToJSON(items);
    downloadFile(json, 'agilebridge-backlog.json', 'application/json');
  }, [items, hasAccess]);

  const handleExportMarkdown = useCallback(() => {
    if (items.length === 0 || !hasAccess) return;
    const md = exportToMarkdown(items);
    downloadFile(md, 'agilebridge-backlog.md', 'text/markdown');
  }, [items, hasAccess]);

  const handleCopyToClipboard = useCallback(async () => {
    if (items.length === 0 || !hasAccess) return;
    const table = copyToClipboardTable(items);
    await navigator.clipboard.writeText(table);
    toast({ title: 'Copied to clipboard', description: 'Paste into Google Sheets, Notion, or any spreadsheet app.' });
  }, [items, hasAccess]);

  const handleCopyJiraMarkdown = useCallback(async () => {
    if (items.length === 0 || !hasAccess) return;
    await navigator.clipboard.writeText(exportToJiraMarkdown(items));
    toast({ title: 'Copied as Jira Markdown', description: 'Paste into any Jira issue description.' });
  }, [items, hasAccess]);

  const handleCopyLinearMarkdown = useCallback(async () => {
    if (items.length === 0 || !hasAccess) return;
    await navigator.clipboard.writeText(exportToLinearMarkdown(items));
    toast({ title: 'Copied as Linear Markdown', description: 'Paste into any Linear issue or project.' });
  }, [items, hasAccess]);

  const visibleItems = hasAccess ? items : items.slice(0, FREE_STORY_LIMIT);
  const isLocked = items.length > FREE_STORY_LIMIT && !hasAccess;

  const [sharing, setSharing] = useState(false);
  const handleShare = useCallback(async () => {
    if (visibleItems.length === 0 || sharing) return;
    setSharing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in to share.');
      const title = file?.name?.replace(/\.[^.]+$/, '') || visibleItems.find(i => i.type === 'Epic')?.title || 'Backlog breakdown';
      const { data, error } = await supabase
        .from('shared_breakdowns')
        .insert({ title, content_json: { items: visibleItems, docType, milestones } as any, created_by: session.user.id })
        .select('id')
        .single();
      if (error) throw error;
      const url = `${window.location.origin}/share/${data.id}`;
      try { await navigator.clipboard.writeText(url); } catch { /* clipboard blocked */ }
      toast({ title: 'Share link copied! Anyone with the link can view.', description: url });
    } catch (err: any) {
      toast({ title: 'Could not create share link', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSharing(false);
    }
  }, [visibleItems, sharing, file, docType, milestones]);

  const epics = items.filter(i => i.type === 'Epic').length;
  const stories = items.filter(i => i.type === 'User Story').length;
  const totalSP = items.reduce((sum, i) => sum + i.storyPoints, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <DashboardSidebar hasAccess={hasAccess} />
      </div>

      <main id="dashboard-main" className="flex-1 min-w-0">
        <header id="section-dashboard" className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-8 py-3 sm:py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MobileSidebar hasAccess={hasAccess} />
              <div>
                <h2 className="text-sm font-bold tracking-tighter text-foreground lg:hidden mb-0.5">
                  Agile<span className="text-primary">Bridge</span>
                </h2>
                <p className="text-xs text-muted-foreground hidden sm:block">Dashboard / Ingest</p>
                <h1 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                  Generate Backlog
                </h1>
              </div>
            </div>
            {items.length > 0 && (
              <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                disabled={sharing}
                className="inline-flex items-center gap-2 border border-border bg-card text-foreground font-medium px-3 sm:px-4 py-2 rounded-sm text-sm transition-all hover:bg-muted active:scale-95 disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{sharing ? 'Creating link...' : 'Share Breakdown'}</span>
              </button>
              {hasAccess ? (
                <div className="relative" ref={exportRef}>
                  <button
                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                    className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-medium px-4 py-2 rounded-sm text-sm transition-all hover:opacity-90 active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Export
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {exportMenuOpen && (
                    <div className="absolute right-0 mt-1 w-56 bg-card border border-border rounded-sm shadow-lg z-30">
                      <button
                        onClick={() => { handleCopyJiraMarkdown(); setExportMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                      >
                        <Clipboard className="w-4 h-4 text-muted-foreground" />
                        Copy as Jira Markdown
                      </button>
                      <button
                        onClick={() => { handleCopyLinearMarkdown(); setExportMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left border-t border-border"
                      >
                        <Clipboard className="w-4 h-4 text-muted-foreground" />
                        Copy as Linear Markdown
                      </button>
                      <button
                        onClick={() => { handleExportCSV(); setExportMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left border-t border-border"
                      >
                        <FileDown className="w-4 h-4 text-muted-foreground" />
                        Export Jira CSV
                      </button>
                      <button
                        onClick={() => { handleExportJSON(); setExportMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left border-t border-border"
                      >
                        <FileJson className="w-4 h-4 text-muted-foreground" />
                        Download JSON
                      </button>
                      <button
                        onClick={() => { handleExportMarkdown(); setExportMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left border-t border-border"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        Download Markdown
                      </button>
                      <button
                        onClick={() => { handleCopyToClipboard(); setExportMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left border-t border-border"
                      >
                        <Clipboard className="w-4 h-4 text-muted-foreground" />
                        Copy to Clipboard
                      </button>
                      <button
                        onClick={() => { setJiraModalOpen(true); setExportMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left border-t border-border"
                      >
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        Push to Jira Cloud
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 bg-muted text-muted-foreground cursor-not-allowed font-medium px-4 py-2 rounded-sm text-sm"
                >
                  <Lock className="w-4 h-4" />
                  Export
                </button>
              )}
              </div>
            )}
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
          <div id="section-ingest" />
          <IngestZone
            onFileAccepted={handleFileAccepted}
            acceptedFile={file}
            onClear={() => { setFile(null); setItems([]); setProgress(0); setDocType(null); setMilestones([]); }}
          />

          {file && items.length === 0 && !isProcessing && (
            <button
              onClick={handleGenerate}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-3 rounded-sm transition-all hover:opacity-90 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              Generate Backlog
            </button>
          )}

          {isProcessing && (
            <ProgressBar
              progress={progress}
              label={
                progress <= 20
                  ? 'Classifying document type...'
                  : progress <= 60
                  ? 'Extracting requirements & milestones...'
                  : 'Generating INVEST user stories...'
              }
            />
          )}

          {items.length > 0 && (
            <>
              {/* Document Classification Banner */}
              {docType && (
                <div className="surface-elevated rounded-sm p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                    <FileSearch className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Document classified as</p>
                    <p className="text-sm font-semibold text-foreground">{docType}</p>
                  </div>
                </div>
              )}

              {/* Milestones */}
              {milestones.length > 0 && (
                <div className="surface-elevated rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Milestone className="w-4 h-4 text-primary" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Milestones</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {milestones.map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-muted text-xs font-medium text-foreground border border-border">
                        <span className="w-4 h-4 rounded-sm bg-primary/10 text-primary text-[9px] font-bold inline-flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="surface-elevated rounded-sm p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Items</p>
                  <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{items.length}</p>
                </div>
                <div className="surface-elevated rounded-sm p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Epics</p>
                  <p className="text-2xl font-bold tabular-nums text-primary mt-1">{epics}</p>
                </div>
                <div className="surface-elevated rounded-sm p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">User Stories</p>
                  <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{stories}</p>
                </div>
                <div className="surface-elevated rounded-sm p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Story Points</p>
                  <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{totalSP}</p>
                </div>
              </div>

              {/* Hint */}
              <p className="text-xs text-muted-foreground">
                {hasAccess
                  ? 'Click any row to expand its INVEST user story, description, and acceptance criteria.'
                  : `Showing ${FREE_STORY_LIMIT} of ${items.length} stories for free. Unlock the full backlog below.`}
              </p>

              <div id="section-projects" />
              <BacklogTable items={visibleItems} />

              {isLocked && <PaywallOverlay itemCount={items.length} />}
            </>
          )}
          <div id="section-settings" className="pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Settings</h3>

            {/* Account Info */}
            <div className="surface-elevated rounded-sm p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {userEmail ? userEmail.split('@')[0].slice(0, 2).toUpperCase() : '??'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{userEmail ?? 'Loading...'}</p>
                  <p className="text-xs text-muted-foreground">Signed in via Google</p>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="surface-elevated rounded-sm p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subscription</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {hasAccess ? 'Active' : 'Free Tier'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasAccess
                      ? 'You have full access to all features.'
                      : `You can preview up to ${FREE_STORY_LIMIT} stories for free.`}
                  </p>
                </div>
                {hasAccess ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-primary/10 text-primary text-xs font-medium">Active</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted text-muted-foreground text-xs font-medium">Free</span>
                )}
              </div>
            </div>

            {/* Support */}
            <div className="surface-elevated rounded-sm p-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Support</p>
              <p className="text-xs text-muted-foreground">
                Need help? Reach us at{' '}
                <a href="mailto:support@agilebridge.ai" className="text-primary hover:underline">support@agilebridge.ai</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <JiraSyncModal open={jiraModalOpen} onClose={() => setJiraModalOpen(false)} items={items} />
    </div>
  );
};

export default Dashboard;
