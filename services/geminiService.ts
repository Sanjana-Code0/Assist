
import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult, NavStep } from "../types";

/**
 * AI Controller: Core brain of the extension.
 * Using the required GoogleGenAI class and gemini-3 series models.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Summarization Engine
 * Uses Gemini 3 Flash for speed and efficiency.
 */
export const summarizePage = async (pageContent: string, mode: 'full' | 'short' | 'eli5'): Promise<SummaryResult> => {
  try {
    const prompt = `
      Summarize the following web content.
      Mode: ${mode === 'full' ? 'Comprehensive summary' : mode === 'short' ? 'Concise' : 'ELI5'}.
      
      CONTENT:
      ${pageContent}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "content", "keyTakeaways"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (err: any) {
    throw new Error(`Summarization Failed: ${err.message}`);
  }
};

/**
 * Navigation Engine (High Precision)
 * Uses Gemini 3 Pro for complex reasoning about page structures.
 */
export const generateNavGuide = async (goal: string, currentUrl: string, pageSchema: string): Promise<NavStep[]> => {
  try {
    const prompt = `
      You are an expert AI Navigation Assistant.
      USER GOAL: "${goal}"
      CURRENT LOCATION: ${currentUrl}
      SCHEMA: ${pageSchema}
      
      Generate a precise, step-by-step navigation path as a JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              selector: { type: Type.STRING },
              instruction: { type: Type.STRING },
              action: { type: Type.STRING, enum: ["click", "type", "hover"] },
              targetPage: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER }
            },
            required: ["selector", "instruction", "action", "targetPage", "confidenceScore"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (err: any) {
    throw new Error(`Navigation Failure: ${err.message}`);
  }
};

/**
 * Context-Aware Chat
 */
export const chatWithContext = async (query: string, context: string) => {
  const systemInstruction = `You are ShadowLight, a helpful web accessibility assistant. 
  You have the current page content as context. Respond clearly and concisely.
  
  PAGE CONTENT:
  ${context}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      systemInstruction,
      maxOutputTokens: 1000,
    }
  });

  return response.text || "I couldn't generate a response.";
};

/**
 * Content Repurposing
 */
export const repurposeContent = async (pageContent: string, format: 'tweet' | 'blog' | 'article'): Promise<string> => {
  const prompt = `Repurpose the following content into a ${format} format. 
  
  CONTENT:
  ${pageContent}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text || "No content generated.";
};
