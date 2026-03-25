import { supabase } from "@/integrations/supabase/client";
import { RawTask } from "./mpp-parser";

export interface ParseDocumentResponse {
  tasks?: RawTask[];
  content?: string;
  error?: string;
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

/**
 * Converts raw AI-parsed text content into RawTask[] format
 * by extracting structured items from the response.
 */
export const aiResponseToRawTasks = (response: ParseDocumentResponse): RawTask[] => {
  // If the API returned structured tasks directly
  if (response.tasks && Array.isArray(response.tasks)) {
    return response.tasks;
  }

  // If the API returned text content, parse it into tasks
  const content = response.content || response.text || response.result || '';
  if (typeof content !== 'string' || content.length < 10) {
    return [];
  }

  // Parse text content into requirement lines
  const lines = (content as string)
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 5);

  const requirementLines = lines.filter(l =>
    /^[-•*]\s/.test(l) ||
    /^\d+[\.\)]\s/.test(l) ||
    /^(req|requirement|task|feature|story|item|phase|milestone|epic)/i.test(l)
  );

  const sourceLines = requirementLines.length > 0 ? requirementLines : lines.slice(0, 30);

  return sourceLines.map((line, idx) => {
    const cleanLine = line.replace(/^[-•*\d.\)]+\s*/, '').trim();
    const isTopLevel = /^(phase|epic|milestone|section|module)/i.test(cleanLine) || idx % 5 === 0;

    return {
      uid: String(idx + 1),
      name: cleanLine,
      outlineLevel: isTopLevel ? 1 : 2,
      outlineNumber: isTopLevel
        ? String(Math.floor(idx / 5) + 1)
        : `${Math.floor(idx / 5) + 1}.${(idx % 5)}`,
      duration: 960 + Math.floor(Math.random() * 3840),
      priority: 400 + Math.floor(Math.random() * 500),
      percentComplete: 0,
    };
  });
};
