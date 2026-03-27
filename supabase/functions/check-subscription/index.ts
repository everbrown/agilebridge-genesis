import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const SPRINT_PASS_HOURS = 24;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Look up customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No customer found, checking recent checkout sessions by email");

      // Fallback: search for completed checkout sessions by email
      // This handles the edge case where Stripe customer search has a brief delay
      const recentSessions = await stripe.checkout.sessions.list({ limit: 20 });
      const matchingSession = recentSessions.data.find(
        s => s.customer_email === user.email && s.payment_status === "paid"
      );

      if (matchingSession) {
        logStep("Found paid session via email fallback", { sessionId: matchingSession.id, mode: matchingSession.mode });

        if (matchingSession.mode === "subscription") {
          // Re-fetch the customer that was created during checkout
          const customerId = matchingSession.customer as string;
          if (customerId) {
            const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
            if (subs.data.length > 0) {
              const sub = subs.data[0];
              const productId = sub.items.data[0].price.product;
              return new Response(JSON.stringify({
                subscribed: true,
                hasAccess: true,
                product_id: productId,
                subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              });
            }
          }
        }

        if (matchingSession.mode === "payment") {
          const purchasedAt = new Date((matchingSession as any).created * 1000);
          const expiresAt = new Date(purchasedAt.getTime() + SPRINT_PASS_HOURS * 60 * 60 * 1000);
          if (new Date() < expiresAt) {
            return new Response(JSON.stringify({
              subscribed: false,
              hasAccess: true,
              payment_type: "one_time",
              expires_at: expiresAt.toISOString(),
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        }
      }

      logStep("No paid sessions found for this email");
      return new Response(JSON.stringify({ subscribed: false, hasAccess: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // 1. Check active subscriptions first
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      const productId = sub.items.data[0].price.product;
      logStep("Active subscription found", { productId });
      return new Response(JSON.stringify({
        subscribed: true,
        hasAccess: true,
        product_id: productId,
        subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 2. Check for completed one-time payment (Sprint Pass)
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 10,
    });

    // Find the most recent paid one-time payment
    const completedPayment = sessions.data.find(
      s => s.mode === "payment" && s.payment_status === "paid"
    );

    if (completedPayment) {
      const purchasedAt = new Date((completedPayment as any).created * 1000);
      const expiresAt = new Date(purchasedAt.getTime() + SPRINT_PASS_HOURS * 60 * 60 * 1000);
      const now = new Date();

      if (now < expiresAt) {
        logStep("Sprint Pass active", { purchasedAt: purchasedAt.toISOString(), expiresAt: expiresAt.toISOString() });
        return new Response(JSON.stringify({
          subscribed: false,
          hasAccess: true,
          payment_type: "one_time",
          expires_at: expiresAt.toISOString(),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        logStep("Sprint Pass expired", { expiresAt: expiresAt.toISOString() });
      }
    }

    logStep("No active access found");
    return new Response(JSON.stringify({ subscribed: false, hasAccess: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
