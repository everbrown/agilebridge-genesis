import { useState, useCallback, useEffect } from 'react';
import { Download, Zap, FileSearch, Milestone, Lock } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import IngestZone from '@/components/IngestZone';
import BacklogTable from '@/components/BacklogTable';
import ProgressBar from '@/components/ProgressBar';
import PaywallOverlay from '@/components/PaywallOverlay';
import { FREE_STORY_LIMIT } from '@/lib/stripe-tiers';
import { supabase } from '@/integrations/supabase/client';
import {
  AgileItem,
  ParseResult,
  DocumentType,
  generateSampleMPPData,
  generateSampleCharterData,
  parseMPPToAgile,
  parseCSVToAgile,
  parseTextContent,
  classifyDocument,
  extractMilestones,
  exportToJiraCSV,
} from '@/lib/mpp-parser';

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<AgileItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [docType, setDocType] = useState<DocumentType | null>(null);
  const [milestones, setMilestones] = useState<string[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  // Check if user has paid access
  const checkAccess = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setHasAccess(false);
        return;
      }
      setCheckingAccess(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (!error && data?.hasAccess) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch {
      setHasAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  }, []);

  useEffect(() => {
    checkAccess();

    // Re-check on focus (user returns from checkout)
    const handleFocus = () => checkAccess();
    window.addEventListener('focus', handleFocus);

    // Check on URL params (checkout=success)
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      // Small delay to let Stripe process
      setTimeout(checkAccess, 2000);
      // Clean URL
      window.history.replaceState({}, '', '/dashboard');
    }

    return () => window.removeEventListener('focus', handleFocus);
  }, [checkAccess]);

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
      detectedType = classifyDocument(file.name);
      const isCharter = detectedType === 'Project Charter' || file.name.toLowerCase().includes('charter');
      for (let i = 20; i <= 60; i += 5) {
        await new Promise(r => setTimeout(r, 40));
        setProgress(i);
      }
      const sampleTasks = isCharter ? generateSampleCharterData() : generateSampleMPPData();
      detectedType = isCharter ? 'Project Charter' : 'Work Breakdown Structure';
      parsedItems = parseMPPToAgile(sampleTasks);
      detectedMilestones = isCharter
        ? ['Stakeholder alignment complete', 'Legacy systems inventoried', 'Cloud migration go-live', 'Agile training rollout']
        : ['Infrastructure audit complete', 'CI/CD pipelines operational', 'SSO integration live', 'API Gateway v2 deployed'];
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
  }, [file]);

  const handleExport = useCallback(() => {
    if (items.length === 0 || !hasAccess) return;
    const csv = exportToJiraCSV(items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agilebridge-backlog.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [items, hasAccess]);

  const visibleItems = hasAccess ? items : items.slice(0, FREE_STORY_LIMIT);
  const isLocked = items.length > FREE_STORY_LIMIT && !hasAccess;

  const epics = items.filter(i => i.type === 'Epic').length;
  const stories = items.filter(i => i.type === 'User Story').length;
  const totalSP = items.reduce((sum, i) => sum + i.storyPoints, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md px-8 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Dashboard / Ingest</p>
              <h1 className="text-xl font-bold tracking-tight text-foreground mt-0.5">
                Generate Backlog
              </h1>
            </div>
            {items.length > 0 && (
              <button
                onClick={hasAccess ? handleExport : undefined}
                disabled={!hasAccess}
                className={`inline-flex items-center gap-2 font-medium px-4 py-2 rounded-sm text-sm transition-all ${
                  hasAccess
                    ? 'bg-accent text-accent-foreground hover:opacity-90 active:scale-95'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {hasAccess ? (
                  <Download className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                Download CSV
              </button>
            )}
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">
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
              <div className="grid grid-cols-4 gap-4">
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

              <BacklogTable items={visibleItems} />

              {isLocked && <PaywallOverlay itemCount={items.length} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
