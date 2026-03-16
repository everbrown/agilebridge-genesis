import { Lock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { TIERS } from '@/lib/stripe-tiers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface PaywallOverlayProps {
  itemCount: number;
}

const PaywallOverlay = ({ itemCount }: PaywallOverlayProps) => {
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Sign in required",
          description: "Please sign in to unlock the full backlog.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: TIERS.sprint_pass.price_id,
          mode: TIERS.sprint_pass.mode,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast({
        title: "Checkout error",
        description: err.message || "Could not start checkout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-sm overflow-hidden"
    >
      {/* Blurred preview hint */}
      <div className="h-32 bg-gradient-to-b from-transparent to-background/95 pointer-events-none" />

      {/* Lock banner */}
      <div className="surface-elevated rounded-sm border border-border p-6 -mt-16 relative z-10">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              {itemCount - 3} more stories generated
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Your full backlog is ready! Unlock all stories and CSV export with a Sprint Pass — just ${TIERS.sprint_pass.price}.
            </p>
          </div>
          <button
            onClick={handleUnlock}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded-sm text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            {loading ? 'Opening checkout...' : `Unlock Full Backlog — $${TIERS.sprint_pass.price}`}
          </button>
          <p className="text-xs text-muted-foreground">
            One-time payment · 24-hour full access · Up to 3 documents
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PaywallOverlay;
