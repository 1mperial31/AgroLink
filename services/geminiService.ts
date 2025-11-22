import { GoogleGenAI } from "@google/genai";

// NOTE: In a real production app, this key should be proxied via a backend.
// For this frontend-only demo, we assume the user might provide it or it's injected.
// Ideally, this comes from process.env.API_KEY
const API_KEY = process.env.API_KEY || ''; 

let aiClient: GoogleGenAI | null = null;

try {
    if (API_KEY) {
        aiClient = new GoogleGenAI({ apiKey: API_KEY });
    }
} catch (error) {
    console.error("Failed to initialize Gemini Client", error);
}

export const askAgroBot = async (prompt: string, contextRole: string): Promise<string> => {
  if (!aiClient) {
    return "AgroBot is currently offline (API Key missing). Please try again later.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are AgroBot, a helpful agricultural assistant for the AgroLink app. 
    You assist users who are either Farmers or Vendors. 
    Current User Role: ${contextRole}.
    Keep answers concise, practical, and easy to understand. 
    If asked about prices, give general market trends but state they vary.`;

    const response = await aiClient.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("AgroBot Error:", error);
    return "Sorry, I'm having trouble connecting to the satellite. Please try again.";
  }
};
