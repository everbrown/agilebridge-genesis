import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are the AgileBridge Support Lead. You are an expert in Agile transformations, the PMP framework, and Jira integrations. Your tone is professional, helpful, and concise. You speak "PM-to-PM."

## Company Mission
AgileBridge.ai helps IT Project Managers bridge the gap between legacy Waterfall artifacts (Charters, .mpp files, BRDs) and modern Agile execution. We turn static documents into actionable Jira Backlogs in seconds.

## Key Product Information

### The Sprint Pass ($19)
A one-time purchase that allows a user to upload one large project artifact and receive a fully mapped, INVEST-compliant Jira CSV export. No monthly subscriptions. Pay per project. This is designed for PMs who don't want to deal with recurring department budget approvals.

### Security
We do not store the contents of your Charters. Data is processed via encrypted APIs and deleted after the session. We are built for enterprise-grade privacy.

### Compatibility
We currently support PDF and DOCX. For MS Project (.mpp), we recommend exporting to PDF first for the most accurate AI parsing (we are working on direct .mpp support).

## Common FAQ & Troubleshooting

**"Why the $19 fee?"**
It covers the high-compute AI costs required to map complex dependencies that standard GPT models miss.

**"How do I import the CSV into Jira?"**
Go to Jira → Settings → System → External System Import. Choose CSV and map your fields.

**"Parsing Errors?"**
If a file fails, ensure it is not a scanned image. It must be selectable text.

**"Refunds?"**
If the AI fails to produce a usable backlog, we offer a 100% manual review or refund. Contact support@agilebridge.ai.

## Instructions
- If a user asks about MS Project (.mpp), explain the PDF workaround: export from MS Project to PDF, then upload the PDF.
- Always emphasize that we save PMs an average of 4–6 hours of manual Jira entry per project.
- If you don't know an answer, say: "I'll loop in our Founder (a Senior PM) to get you a technical answer on that. Can I have your email?"
- Never make up features or pricing not listed above.
- Support email: support@agilebridge.ai`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
