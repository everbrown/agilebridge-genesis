import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { text, filename } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'No usable text content provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Truncate to ~12k chars to stay within token limits
    const truncated = text.slice(0, 12000);

    const systemPrompt = `You are a project management document parser. Given extracted text from a project document (${filename || 'unknown'}), identify tasks, requirements, user stories, epics, phases, or milestones.

Return a JSON object with this structure:
{
  "tasks": [
    {
      "uid": "1",
      "name": "Task name",
      "outlineLevel": 1,
      "outlineNumber": "1",
      "duration": 960,
      "priority": 500,
      "percentComplete": 0
    }
  ],
  "content": "brief summary of the document"
}

Rules:
- outlineLevel 1 = Epic/Phase, outlineLevel 2 = User Story/Task
- duration is in minutes (480 = 1 day)
- priority ranges from 100 (low) to 900 (high)
- Extract as many meaningful tasks as possible
- Group related tasks under epics using outlineNumber (e.g. "1", "1.1", "1.2", "2", "2.1")`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: truncated },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_tasks',
              description: 'Extract structured tasks from a project document',
              parameters: {
                type: 'object',
                properties: {
                  tasks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        uid: { type: 'string' },
                        name: { type: 'string' },
                        outlineLevel: { type: 'number' },
                        outlineNumber: { type: 'string' },
                        duration: { type: 'number' },
                        priority: { type: 'number' },
                        percentComplete: { type: 'number' },
                      },
                      required: ['uid', 'name', 'outlineLevel', 'outlineNumber', 'duration', 'priority'],
                    },
                  },
                  content: { type: 'string' },
                },
                required: ['tasks'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'extract_tasks' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limited, please try again in a moment' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds in Settings > Workspace > Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      return new Response(
        JSON.stringify({ error: `AI processing failed (${response.status})` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback: return the raw content
    const content = aiData.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({ content, tasks: [] }), {
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
