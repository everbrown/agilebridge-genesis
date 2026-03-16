import { useState, useCallback } from 'react';
import { Download, Zap } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import IngestZone from '@/components/IngestZone';
import BacklogTable from '@/components/BacklogTable';
import ProgressBar from '@/components/ProgressBar';
import {
  AgileItem,
  generateSampleMPPData,
  parseMPPToAgile,
  parseCSVToAgile,
  exportToJiraCSV,
} from '@/lib/mpp-parser';

const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<AgileItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileAccepted = useCallback((f: File) => {
    setFile(f);
    setItems([]);
    setProgress(0);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    // Simulate processing with progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 60));
      setProgress(i);
    }

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      const text = await file.text();
      setItems(parseCSVToAgile(text));
    } else {
      // For .mpp, .pdf, .docx — use sample data to demonstrate
      const sampleTasks = generateSampleMPPData();
      setItems(parseMPPToAgile(sampleTasks));
    }

    setIsProcessing(false);
  }, [file]);

  const handleExport = useCallback(() => {
    if (items.length === 0) return;
    const csv = exportToJiraCSV(items);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agilebridge-backlog.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const epics = items.filter(i => i.type === 'Epic').length;
  const stories = items.filter(i => i.type === 'User Story').length;

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
                onClick={handleExport}
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-medium px-4 py-2 rounded-sm text-sm transition-all hover:opacity-90 active:scale-95"
              >
                <Download className="w-4 h-4" />
                Export to Jira CSV
              </button>
            )}
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-8 py-8 space-y-6">
          <IngestZone
            onFileAccepted={handleFileAccepted}
            acceptedFile={file}
            onClear={() => { setFile(null); setItems([]); setProgress(0); }}
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
            <ProgressBar progress={progress} label="Parsing project structure..." />
          )}

          {items.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-4">
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
              </div>

              <BacklogTable items={items} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
