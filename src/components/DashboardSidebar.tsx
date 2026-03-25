import { LayoutDashboard, Upload, FileStack, Settings, ArrowLeft, LogOut, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Upload, label: 'Ingest' },
  { icon: FileStack, label: 'Projects' },
  { icon: Settings, label: 'Settings' },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast({
        title: "Could not open billing portal",
        description: err.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const initials = userEmail
    ? userEmail.split('@')[0].slice(0, 2).toUpperCase()
    : '??';

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-border bg-sidebar flex flex-col">
      <div className="p-5 border-b border-border">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Back to site
        </button>
        <h2 className="mt-3 text-lg font-bold tracking-tighter text-foreground">
          Agile<span className="text-primary">Bridge</span>
        </h2>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">{userEmail ?? 'Loading...'}</p>
          </div>
        </div>
        <button
          onClick={handleManageSubscription}
          disabled={portalLoading}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <CreditCard className="w-3.5 h-3.5" />
          {portalLoading ? 'Opening...' : 'Manage Subscription'}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-sm text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
