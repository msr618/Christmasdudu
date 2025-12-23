import { GoogleGenAI } from "@google/genai";

export const generateRomanticWish = async (tone: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      You are a romantic poet. Write a short, heartwarming, and deeply romantic Christmas wish for my girlfriend.
      Tone: ${tone}.
      Length: Max 2 sentences.
      Style: Elegant, sincere, and magical.
      Do not include any introductory text, just the wish itself.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Merry Christmas to the one who makes my life magical.";
  } catch (error) {
    console.error("Error generating wish:", error);
    return "Even when technology fails, my love for you remains perfect. Merry Christmas, my love.";
  }
};