
import { GoogleGenAI, Type } from "@google/genai";
import { Mission, MissionCategory } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Génère des missions secrètes pour le jeu
 */
export async function generateMissions(count: number, context: string, difficulty: number): Promise<Mission[]> {
  const systemInstruction = `Tu es un Game Designer professionnel pour le jeu "Killer Party". 
  RÈGLES DE SÉCURITÉ : Pas d'actions illégales, dangereuses ou humiliantes.
  LANGUE : FRANÇAIS EXCLUSIVEMENT.`;

  const prompt = `Génère ${count} missions de furtivité sociale en français. Contexte : ${context}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              difficulty: { type: Type.INTEGER },
              category: { type: Type.STRING },
            },
            required: ["description", "difficulty", "category"],
          }
        },
      },
    });

    const missions: any[] = JSON.parse(response.text || "[]");
    return missions.map((m, i) => ({
      id: `ai-${Date.now()}-${i}`,
      description: m.description,
      difficulty: Math.min(3, Math.max(1, m.difficulty)) as any,
      category: MissionCategory.SOCIAL,
    }));
  } catch (error) {
    console.error("AI Generation failed:", error);
    return [];
  }
}

/**
 * Transforme une photo d'utilisateur en portrait d'agent secret
 */
export async function agentifyPhoto(base64Image: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/jpeg',
            },
          },
          {
            text: "Transform this person into a high-quality cinematic spy agent portrait. Professional lighting, dark suit or tactical gear, secret agent style, 1k resolution. Keep facial features recognizable but stylized for an action movie poster.",
          },
        ],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Agentification failed:", error);
    return null;
  }
}

/**
 * Génère un avatar d'espion fictif
 */
export async function generateFictionalSpy(): Promise<string | null> {
  try {
    const prompts = [
      "A mysterious female spy in a noir setting, cinematic lighting, ultra-realistic",
      "A sophisticated male secret agent in a tuxedo, Bond-style, hyper-detailed",
      "A tech-savvy hacker spy with neon light reflections, cyber-espionage style",
      "An elite undercover agent in a rainy city street, dramatic shadows"
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: randomPrompt }],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Fictional spy generation failed:", error);
    return null;
  }
}
