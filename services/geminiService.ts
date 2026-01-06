
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const solveChemistryProblem = async (
  prompt: string,
  base64Image?: string
): Promise<string> => {
  const ai = getAIClient();
  const model = "gemini-3-flash-preview";
  
  const contents: any[] = [{ text: prompt }];
  if (base64Image) {
    contents.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: { parts: contents.map(c => typeof c === 'string' ? { text: c } : c) },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return response.text || "Uzr, javobni aniqlay olmadim.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.";
  }
};

export const startChemistryChat = (history: { role: 'user' | 'model', parts: any[] }[]) => {
  const ai = getAIClient();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    history: history,
  });
};
