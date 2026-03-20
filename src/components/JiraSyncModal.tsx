import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { AgileItem } from '@/lib/mpp-parser';

interface JiraSyncModalProps {
  open: boolean;
  onClose: () => void;
  items: AgileItem[];
}

const JiraSyncModal = ({ open, onClose, items }: JiraSyncModalProps) => {
  const [jiraDomain, setJiraDomain] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraApiToken, setJiraApiToken] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; created?: number; error?: string } | null>(null);

  const handleSync = async () => {
    if (!jiraDomain || !jiraEmail || !jiraApiToken || !projectKey) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    setSyncing(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", description: "Please sign in first.", variant: "destructive" });
        return;
      }

      const payload = items.map(item => ({
        title: item.title,
        description: item.description,
        type: item.type,
        priority: item.priority,
        storyPoints: item.storyPoints,
        parentEpic: item.parentEpic,
        acceptanceCriteria: item.acceptanceCriteria,
      }));

      const { data, error } = await supabase.functions.invoke('jira-sync', {
        body: { jiraDomain, jiraEmail, jiraApiToken, projectKey, items: payload },
      });

      if (error) throw error;

      if (data?.success) {
        setResult({ success: true, created: data.created });
      } else {
        setResult({ success: false, error: data?.error || "Unknown error" });
      }
    } catch (err: any) {
      setResult({ success: false, error: err.message || "Sync failed" });
    } finally {
      setSyncing(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-card border border-border rounded-sm p-6 shadow-xl z-10"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>

          <h2 className="text-lg font-bold text-foreground mb-1">Push to Jira</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Create {items.length} issues directly in your Jira Cloud project.
          </p>

          {result ? (
            <div className="space-y-4">
              <div className={`flex items-start gap-3 p-4 rounded-sm border ${result.success ? 'border-accent bg-accent/5' : 'border-destructive bg-destructive/5'}`}>
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {result.success ? `${result.created} issues created!` : 'Sync failed'}
                  </p>
                  {result.error && (
                    <p className="text-xs text-muted-foreground mt-1">{result.error}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setResult(null); onClose(); }}
                className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-sm text-sm hover:opacity-90 active:scale-95"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Jira Domain</label>
                <input
                  type="text"
                  placeholder="yourcompany.atlassian.net"
                  value={jiraDomain}
                  onChange={e => setJiraDomain(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Jira Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={jiraEmail}
                  onChange={e => setJiraEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">API Token</label>
                <input
                  type="password"
                  placeholder="Paste your Jira API token"
                  value={jiraApiToken}
                  onChange={e => setJiraApiToken(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Generate at{' '}
                  <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener" className="text-primary underline">
                    id.atlassian.com
                  </a>
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Project Key</label>
                <input
                  type="text"
                  placeholder="e.g. PROJ"
                  value={projectKey}
                  onChange={e => setProjectKey(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-2.5 rounded-sm text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Pushing to Jira...
                  </>
                ) : (
                  `Push ${items.length} Issues to Jira`
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JiraSyncModal;
