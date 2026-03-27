import { Lock, CreditCard, Star, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TIERS } from '@/lib/stripe-tiers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PaywallOverlayProps {
  itemCount: number;
}

const PaywallOverlay = ({ itemCount }: PaywallOverlayProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUnlock = async (tierKey: keyof typeof TIERS) => {
    const tier = TIERS[tierKey];
    setLoading(tierKey);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login?returnTo=/dashboard');
        return;
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Checkout request timed out. Please try again.')), 15000)
      );

      const checkoutPromise = supabase.functions.invoke('create-checkout', {
        body: {
          priceId: tier.price_id,
          mode: tier.mode,
        },
      });

      const { data, error } = await Promise.race([checkoutPromise, timeoutPromise]) as any;

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL returned. Please try again.');
      }
    } catch (err: any) {
      toast({
        title: "Checkout error",
        description: err.message || "Could not start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
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
            onClick={() => handleUnlock('sprint_pass')}
            disabled={loading !== null}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded-sm text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            {loading === 'sprint_pass' ? 'Opening checkout...' : `Unlock Full Backlog — $${TIERS.sprint_pass.price}`}
          </button>
          <p className="text-xs text-muted-foreground">
            One-time payment · 24-hour full access · Up to 3 documents
          </p>

          {/* Tier upsells */}
          <div className="w-full border-t border-border pt-4 mt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Or go unlimited
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleUnlock('professional')}
                disabled={loading !== null}
                className="flex items-start gap-3 p-3 rounded-sm border border-border bg-background text-left transition-all hover:border-primary/40 hover:bg-muted/50 disabled:opacity-50"
              >
                <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{TIERS.professional.name} — ${TIERS.professional.price}/mo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{TIERS.professional.description}</p>
                </div>
              </button>
              <button
                onClick={() => handleUnlock('enterprise')}
                disabled={loading !== null}
                className="flex items-start gap-3 p-3 rounded-sm border border-border bg-background text-left transition-all hover:border-primary/40 hover:bg-muted/50 disabled:opacity-50"
              >
                <Building2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{TIERS.enterprise.name} — ${TIERS.enterprise.price}/mo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{TIERS.enterprise.description}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaywallOverlay;
