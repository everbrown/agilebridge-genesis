import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const ONEMIN_AI_KEY = Deno.env.get('ONEMIN_AI_KEY');
  if (!ONEMIN_AI_KEY) {
    return new Response(
      JSON.stringify({ error: 'ONEMIN_AI_KEY is not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string || 'parse-document';

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the request to 1min.AI
    const apiFormData = new FormData();
    apiFormData.append('file', file, file.name);
    apiFormData.append('type', type);

    const response = await fetch('https://api.1min.ai/api/features', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ONEMIN_AI_KEY}`,
      },
      body: apiFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('1min.AI API error:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: `1min.AI API error [${response.status}]`, details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error parsing document:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
