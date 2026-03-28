import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import BrandLogo from '@/components/BrandLogo';

const MARKETING_OPT_IN_KEY = 'ab_marketing_opt_in';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Persist marketing consent from localStorage (set before OAuth redirect)
        const optIn = localStorage.getItem(MARKETING_OPT_IN_KEY) === 'true';
        if (optIn) {
          await supabase.from('profiles').update({ marketing_opt_in: true, updated_at: new Date().toISOString() }).eq('id', session.user.id);
          localStorage.removeItem(MARKETING_OPT_IN_KEY);
        }
        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get('returnTo') || '/dashboard';
        navigate(returnTo, { replace: true });
      }
    });

    // If already logged in, redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const params = new URLSearchParams(window.location.search);
        const returnTo = params.get('returnTo') || '/dashboard';
        navigate(returnTo, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    // Store opt-in preference before redirect
    localStorage.setItem(MARKETING_OPT_IN_KEY, String(marketingOptIn));
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err: any) {
      toast({
        title: "Sign in failed",
        description: err.message || "Could not sign in with Google.",
        variant: "destructive",
      });
      localStorage.removeItem(MARKETING_OPT_IN_KEY);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center">
          <BrandLogo size="md" />
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to unlock your full backlog and export features.
          </p>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 bg-card border border-border text-foreground font-medium px-6 py-3 rounded-sm transition-all hover:bg-muted active:scale-[0.98] disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="flex items-start gap-2 text-left">
          <Checkbox
            id="marketing"
            checked={marketingOptIn}
            onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
            className="mt-0.5"
          />
          <label htmlFor="marketing" className="text-sm text-muted-foreground cursor-pointer select-none leading-tight">
            Keep me updated on new AgileBridge features and templates.
          </label>
        </div>

        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <a href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Login;
