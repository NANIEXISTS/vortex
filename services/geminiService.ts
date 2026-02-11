
import { GoogleGenAI, Type } from "@google/genai";
import { BookItem, School, AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Converts a File object to a Base64 string.
 */
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes a document (Image/PDF) to extract school book lists.
 */
export const analyzeDocument = async (file: File, validPublishers: string[]): Promise<AnalysisResult> => {
  const modelName = 'gemini-2.5-flash-image'; 
  const filePart = await fileToGenerativePart(file);

  const publisherListString = validPublishers.join('", "');

  const prompt = `
    You are Vortex Data Ingestion Engine. 
    Analyze the uploaded document.
    
    Extract the following information in RAW JSON format:
    {
      "schoolName": "...",
      "items": [
        {
          "title": "...",
          "publisher": "...",
          "grade": "...",
          "quantity": 123,
          "subject": "..."
        }
      ]
    }

    STRICT NORMALIZATION RULES FOR PUBLISHERS:
    You MUST map every publisher found in the image to one of the following strings EXACTLY:
    ["${publisherListString}"]
    
    If a publisher on the list is "OUP" or "Oxford", map it to the closest match in the list above.
    If the publisher is NOT in the allowed list, map it to "Other".
    
    IMPORTANT: Return ONLY the JSON object. No markdown.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [filePart, { text: prompt }]
    }
  });

  let text = response.text || "{}";
  text = text.trim();
  if (text.startsWith("```json")) {
    text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (text.startsWith("```")) {
    text = text.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(text) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse Vortex response", e, "Raw text:", text);
    throw new Error("Vortex Engine failed to structure this document. Clearer input required.");
  }
};

/**
 * Chat agent that has access to the current database state to answer user queries.
 */
export const queryAgent = async (
  query: string, 
  currentData: { schools: School[], items: BookItem[] }
): Promise<string> => {
  const modelName = 'gemini-3-flash-preview';

  const dbContext = JSON.stringify({
    stats: {
      totalSchools: currentData.schools.length,
      totalItems: currentData.items.length
    },
    schools: currentData.schools.map(s => s.name),
    sampleItems: currentData.items.slice(0, 50)
  });

  const systemPrompt = `
    You are 'Vortex Agent', a hyper-efficient logistics assistant.
    You have access to the current warehouse and order state.
    
    STATE SUMMARY:
    ${dbContext}
    
    Answer user queries with precision and professional clarity.
    - Aggregate data instantly when asked for totals.
    - Provide insights into publisher concentrations.
    - Maintain the Vortex brand voice: Efficient, Intelligent, Reliable.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'user', parts: [{ text: query }] }
    ]
  });

  return response.text || "Vortex connection timed out.";
};
