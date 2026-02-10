
import { GoogleGenAI, Type } from "@google/genai";
import { SummaryResult, NavStep } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Summarization Engine
 * Uses Gemini 3 Flash. High context, low cost.
 */
export const summarizePage = async (distilledMap: any, mode: 'full' | 'short' | 'eli5'): Promise<SummaryResult> => {
  try {
    const prompt = `
      Based on this distilled page data:
      ${JSON.stringify(distilledMap)}
      
      Generate a ${mode} summary.
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
            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "content", "keyTakeaways"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (err: any) {
    throw new Error(`Summarization Failed: ${err.message}`);
  }
};

/**
 * Repurpose Content Engine
 * Uses Gemini 3 Flash to transform content into different formats such as tweets, blogs, or articles.
 * Added to fix the missing export error in SummarizeTab.
 */
export const repurposeContent = async (pageContent: any, format: 'tweet' | 'blog' | 'article'): Promise<string> => {
  try {
    const prompt = `Repurpose the following page content into a ${format}:\n\n${JSON.stringify(pageContent)}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "";
  } catch (err: any) {
    throw new Error(`Repurposing Failed: ${err.message}`);
  }
};

/**
 * Navigation Engine (Maximum Precision)
 * Uses Gemini 3 Pro with thinkingBudget to handle complex logic.
 */
export const generateNavGuide = async (goal: string, distilledMap: any): Promise<NavStep[]> => {
  try {
    const prompt = `
      USER GOAL: "${goal}"
      CURRENT PAGE: ${distilledMap.url}
      
      INTERACTIVE MAP:
      ${JSON.stringify(distilledMap.interactiveElements)}

      Generate a step-by-step navigation path. 
      Only use selectors found in the provided interactive map.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }, // Enable deep reasoning for utmost accuracy
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

    return JSON.parse(response.text || '[]');
  } catch (err: any) {
    throw new Error(`Navigation Failure: ${err.message}`);
  }
};

export const chatWithContext = async (query: string, distilledMap: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `CONTEXT:\n${JSON.stringify(distilledMap)}\n\nUSER QUERY: ${query}`,
    config: {
      systemInstruction: 'You are ShadowLight. Help the user navigate or understand this page using the provided distilled map.',
      maxOutputTokens: 800,
    }
  });
  return response.text || "I couldn't generate a response.";
};
