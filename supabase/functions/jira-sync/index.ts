import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[JIRA-SYNC] ${step}${detailsStr}`);
};

interface JiraIssue {
  title: string;
  description: string;
  type: 'Epic' | 'User Story';
  priority: 'High' | 'Medium' | 'Low';
  storyPoints: number;
  parentEpic?: string;
  acceptanceCriteria: { given: string; when: string; then: string }[];
}

const PRIORITY_MAP: Record<string, string> = {
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { email: user.email });

    const { jiraDomain, jiraEmail, jiraApiToken, projectKey, items } = await req.json();

    if (!jiraDomain || !jiraEmail || !jiraApiToken || !projectKey || !items?.length) {
      throw new Error("Missing required fields: jiraDomain, jiraEmail, jiraApiToken, projectKey, items");
    }

    // Validate domain format
    const cleanDomain = jiraDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const jiraBaseUrl = `https://${cleanDomain}/rest/api/3`;

    const authString = btoa(`${jiraEmail}:${jiraApiToken}`);
    const headers = {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    // Verify connection first
    logStep("Verifying Jira connection");
    const projectRes = await fetch(`${jiraBaseUrl}/project/${projectKey}`, { headers });
    if (!projectRes.ok) {
      const err = await projectRes.text();
      throw new Error(`Jira connection failed (${projectRes.status}): ${err}`);
    }
    const project = await projectRes.json();
    logStep("Jira project found", { name: project.name, key: project.key });

    // Get issue types using the non-deprecated endpoint
    const metaRes = await fetch(`${jiraBaseUrl}/issue/createmeta/issuetypes?projectKeys=${projectKey}`, { headers });
    if (!metaRes.ok) {
      throw new Error(`Failed to fetch issue types: ${metaRes.status}`);
    }
    const issueTypes = await metaRes.json();
    const epicType = issueTypes.values?.find((t: any) => t.name === 'Epic') || issueTypes.find?.((t: any) => t.name === 'Epic');
    const storyType = issueTypes.values?.find((t: any) => t.name === 'Story') || issueTypes.values?.find((t: any) => t.name === 'Task') || issueTypes.find?.((t: any) => t.name === 'Story') || issueTypes.find?.((t: any) => t.name === 'Task');

    if (!storyType) throw new Error("No Story or Task issue type found in project");

    logStep("Issue types resolved", { epic: epicType?.name, story: storyType?.name });

    // Discover the story points custom field dynamically
    let storyPointsFieldId: string | null = null;
    const targetTypeId = storyType?.id || epicType?.id;
    if (targetTypeId) {
      const fieldsRes = await fetch(`${jiraBaseUrl}/issue/createmeta/${targetTypeId}/fields?projectKeys=${projectKey}`, { headers });
      if (fieldsRes.ok) {
        const fieldsData = await fieldsRes.json();
        const fieldsList = fieldsData.values || fieldsData || [];
        const spField = fieldsList.find((f: any) =>
          f.name === 'Story Points' || f.name === 'Story point estimate' || f.key === 'story_points'
        );
        if (spField) {
          storyPointsFieldId = spField.fieldId || spField.key;
          logStep("Story points field discovered", { fieldId: storyPointsFieldId, name: spField.name });
        } else {
          logStep("Story points field not found in project fields");
        }
      }
    }

    const results: { id: string; key: string; title: string; type: string }[] = [];
    const epicKeyMap: Record<string, string> = {};

    // Create epics first
    const epics = (items as JiraIssue[]).filter(i => i.type === 'Epic');
    for (const epic of epics) {
      const body: any = {
        fields: {
          project: { key: projectKey },
          summary: epic.title,
          description: {
            type: "doc",
            version: 1,
            content: [{ type: "paragraph", content: [{ type: "text", text: epic.description || "No description" }] }],
          },
          issuetype: { id: epicType?.id || storyType.id },
          priority: { name: PRIORITY_MAP[epic.priority] || "Medium" },
        },
      };

      const res = await fetch(`${jiraBaseUrl}/issue`, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.text();
        logStep("Failed to create epic", { title: epic.title, error: err });
        continue;
      }
      const created = await res.json();
      epicKeyMap[epic.title] = created.key;
      results.push({ id: created.id, key: created.key, title: epic.title, type: 'Epic' });
      logStep("Epic created", { key: created.key });
    }

    // Create stories
    const stories = (items as JiraIssue[]).filter(i => i.type === 'User Story');
    for (const story of stories) {
      const acText = story.acceptanceCriteria
        .map(ac => `Given ${ac.given}, When ${ac.when}, Then ${ac.then}`)
        .join('\n');

      const descriptionContent: any[] = [
        { type: "paragraph", content: [{ type: "text", text: story.description || "No description" }] },
      ];
      if (acText) {
        descriptionContent.push(
          { type: "paragraph", content: [{ type: "text", text: "Acceptance Criteria:", marks: [{ type: "strong" }] }] },
          { type: "paragraph", content: [{ type: "text", text: acText }] },
        );
      }
      descriptionContent.push({
        type: "paragraph",
        content: [
          { type: "text", text: "Generated with ", marks: [{ type: "em" }] },
          { type: "text", text: "AgileBridge.ai", marks: [{ type: "em" }, { type: "link", attrs: { href: "https://agilebridge.ai" } }] },
          { type: "text", text: " — Convert PRDs to Epics & User Stories in seconds.", marks: [{ type: "em" }] },
        ],
      });

      const body: any = {
        fields: {
          project: { key: projectKey },
          summary: story.title,
          description: { type: "doc", version: 1, content: descriptionContent },
          issuetype: { id: storyType.id },
          priority: { name: PRIORITY_MAP[story.priority] || "Medium" },
          ...(storyPointsFieldId && story.storyPoints ? { [storyPointsFieldId]: story.storyPoints } : {}),
        },
      };

      // Link to parent epic if available
      if (story.parentEpic && epicKeyMap[story.parentEpic]) {
        body.fields.parent = { key: epicKeyMap[story.parentEpic] };
      }

      const res = await fetch(`${jiraBaseUrl}/issue`, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.text();
        logStep("Failed to create story", { title: story.title, error: err });
        continue;
      }
      const created = await res.json();
      results.push({ id: created.id, key: created.key, title: story.title, type: 'Story' });
    }

    logStep("Sync complete", { total: results.length });

    return new Response(JSON.stringify({
      success: true,
      created: results.length,
      issues: results,
    }), {
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
