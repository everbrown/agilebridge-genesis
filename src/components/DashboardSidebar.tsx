import { LayoutDashboard, Upload, FileStack, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Upload, label: 'Ingest' },
  { icon: FileStack, label: 'Projects' },
  { icon: Settings, label: 'Settings' },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();

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

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            PM
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">PMO User</p>
            <p className="text-[10px] text-muted-foreground">Enterprise Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
