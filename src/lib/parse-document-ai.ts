import { supabase } from "@/integrations/supabase/client";

export interface ParseDocumentResponse {
  [key: string]: unknown;
}

/**
 * Sends a file to the 1min.AI parse-document edge function
 * and returns the structured JSON response.
 */
export const parseDocumentWithAI = async (file: File): Promise<ParseDocumentResponse> => {
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('type', 'parse-document');

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || anonKey;

  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/parse-document`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': anonKey,
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Parse failed (${res.status})`);
  }

  return res.json();
};
