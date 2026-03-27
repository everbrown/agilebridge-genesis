import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import DashboardSidebar from '@/components/DashboardSidebar';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const MobileSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden>
          <div onClick={() => setOpen(false)}>
            <DashboardSidebar />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileSidebar;
