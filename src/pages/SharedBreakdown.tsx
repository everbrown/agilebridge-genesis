import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import BrandLogo from '@/components/BrandLogo';
import type { AgileItem } from '@/lib/mpp-parser';

interface Shared {
  title: string;
  created_at: string;
  content_json: { items?: AgileItem[] };
}

const SharedBreakdown = () => {
  const { id } = useParams();
  const [data, setData] = useState<Shared | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing'>('loading');

  useEffect(() => {
    if (!id) return;
    supabase
      .from('shared_breakdowns')
      .select('title, created_at, content_json')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) setStatus('missing');
        else { setData(data as unknown as Shared); setStatus('ok'); }
      });
  }, [id]);

  const items = data?.content_json?.items ?? [];
  const epics = items.filter(i => i.type === 'Epic');
  const stories = items.filter(i => i.type === 'User Story');
  const orphans = stories.filter(s => !epics.some(e => e.title === s.parentEpic));

  const Story = ({ s }: { s: AgileItem }) => (
    <div className="surface-elevated rounded-sm p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground">{s.title}</h3>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">{s.priority}</span>
          <span className="px-2 py-0.5 rounded-sm bg-primary/10 text-primary font-medium">{s.storyPoints} SP</span>
        </div>
      </div>
      <p className="text-sm italic text-foreground/90 leading-relaxed">{s.description}</p>
      {s.acceptanceCriteria?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Acceptance Criteria</p>
          <ol className="space-y-1.5 text-sm text-foreground list-decimal pl-5">
            {s.acceptanceCriteria.map((ac, i) => (
              <li key={i}>
                <span className="text-muted-foreground font-medium">Given </span>{ac.given}
                <span className="text-muted-foreground font-medium">, When </span>{ac.when}
                <span className="text-muted-foreground font-medium">, Then </span>{ac.then}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="border-b border-border px-4 sm:px-8 py-4 flex justify-center">
        <Link to="/"><BrandLogo /></Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {status === 'loading' && <p className="text-muted-foreground text-center">Loading breakdown...</p>}
        {status === 'missing' && (
          <p className="text-muted-foreground text-center">This shared breakdown doesn't exist or was removed.</p>
        )}
        {status === 'ok' && data && (
          <>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Shared breakdown · read-only</p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{data.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {epics.length} epics · {stories.length} user stories · {new Date(data.created_at).toLocaleDateString()}
              </p>
            </div>
            {epics.map(epic => (
              <section key={epic.id} className="space-y-3">
                <div className="border-l-2 border-primary pl-3">
                  <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Epic</p>
                  <h2 className="text-lg font-bold text-foreground">{epic.title}</h2>
                  <p className="text-sm text-muted-foreground">{epic.description}</p>
                </div>
                {stories.filter(s => s.parentEpic === epic.title).map(s => <Story key={s.id} s={s} />)}
              </section>
            ))}
            {orphans.length > 0 && (
              <section className="space-y-3">
                {epics.length > 0 && <h2 className="text-lg font-bold text-foreground">Other Stories</h2>}
                {orphans.map(s => <Story key={s.id} s={s} />)}
              </section>
            )}
          </>
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-foreground text-center sm:text-left">
            Created with <span className="font-semibold">AgileBridge.ai</span>. Want to turn your own documents into Epics & User Stories?
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2 rounded-sm text-sm whitespace-nowrap hover:opacity-90"
          >
            Try AgileBridge Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedBreakdown;
