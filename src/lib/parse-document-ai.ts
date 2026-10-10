import { supabase } from "@/integrations/supabase/client";
import { RawTask, isGenericHeading, parseTextContent } from "./mpp-parser";

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
    return response.tasks.filter(t => !isGenericHeading(t.name)).map(t => ({
      ...t,
      percentComplete: t.percentComplete ?? 0,
    }));
  }

  // If the API returned text content, parse it into tasks
  const content = response.content || '';
  if (typeof content !== 'string' || content.length < 10) {
    return [];
  }

  return parseTextContent(content, '').items.map(item => ({
    uid: item.id,
    name: item.title,
    outlineLevel: item.type === 'Epic' ? 1 : 2,
    outlineNumber: item.outlineNumber,
    duration: Number.parseInt(item.estimate, 10) * 480,
    priority: item.priority === 'High' ? 800 : item.priority === 'Medium' ? 500 : 200,
    percentComplete: 0,
  }));
};
