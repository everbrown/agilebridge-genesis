import { supabase } from "@/integrations/supabase/client";
import { RawTask } from "./mpp-parser";

export interface ParseDocumentResponse {
  tasks?: RawTask[];
  content?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Extracts text from a PDF file client-side using pdfjs-dist.
 */
const extractPdfText = async (file: File): Promise<string> => {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(' ');
    pages.push(text);
  }

  return pages.join('\n\n');
};

/**
 * Extracts text from a DOCX file client-side using mammoth.
 */
const extractDocxText = async (file: File): Promise<string> => {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

/**
 * Extracts text from a file based on its extension.
 * Returns the text content for AI processing.
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return extractPdfText(file);
    case 'docx':
      return extractDocxText(file);
    case 'csv':
    case 'txt':
    case 'md':
      return file.text();
    default:
      // Try reading as text; will throw for true binary files
      return file.text();
  }
};

/**
 * Sends extracted text to the Lovable AI–powered parse-document edge function
 * and returns the structured JSON response.
 */
export const parseDocumentWithAI = async (file: File): Promise<ParseDocumentResponse> => {
  // Step 1: Extract text client-side
  const text = await extractTextFromFile(file);

  if (!text || text.trim().length < 10) {
    throw new Error('Could not extract readable text from this file. Try a different format.');
  }

  // Step 2: Send text to edge function for AI structuring
  const { data, error } = await supabase.functions.invoke('parse-document', {
    body: { text, filename: file.name },
  });

  if (error) {
    throw new Error(error.message || 'AI parsing failed');
  }

  return data as ParseDocumentResponse;
};

/**
 * Converts raw AI-parsed text content into RawTask[] format
 * by extracting structured items from the response.
 */
export const aiResponseToRawTasks = (response: ParseDocumentResponse): RawTask[] => {
  // If the API returned structured tasks directly
  if (response.tasks && Array.isArray(response.tasks)) {
    return response.tasks.map(t => ({
      ...t,
      percentComplete: t.percentComplete ?? 0,
    }));
  }

  // If the API returned text content, parse it into tasks
  const content = response.content || '';
  if (typeof content !== 'string' || content.length < 10) {
    return [];
  }

  const lines = content
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
