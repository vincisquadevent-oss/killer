import { GoogleGenAI, Type } from "@google/genai";
import { Mission, MissionCategory } from "../types.ts";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY manquante - Le mode IA sera désactivé");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Génère des missions personnalisées via l'API Gemini
 */
export async function generateMissions(count: number, context: string, difficulty: number): Promise<Mission[]> {
  if (!ai) {
    console.error("❌ Impossible de générer des missions : API key manquante");
    return [];
  }

  const systemInstruction = `Tu es un Game Designer professionnel pour le jeu "Killer Party". 
  RÈGLES DE SÉCURITÉ STRICTES :
  - PAS d'actions illégales ou de cascades dangereuses.
  - PAS de tâches liées à l'alcool ou aux drogues.
  - PAS de contenu sexuel ou de contacts inappropriés.
  - PAS d'activités physiques à haut risque.
  - PAS de contenu humiliant ou portant atteinte à la réputation.
  - Les missions doivent être des tâches de "furtivité sociale" : actions discrètes, drôles ou créatives qui se fondent dans une fête.
  
  RÈGLE DE LANGUE :
  - TU DOIS RÉDIGER TOUTES LES MISSIONS EXCLUSIVEMENT EN FRANÇAIS.
  
  Niveau de difficulté demandé : ${difficulty}/3.
  Catégories à utiliser : Social, Physical (light), Creative, Logic, Humor, Stealth, Performance.`;

  const prompt = `Génère ${count} missions secrètes et créatives en français. 
  Contexte : ${context}.
  Chaque mission doit être une seule phrase commençant par un verbe à l'infinitif.`;

  try {
    console.log(`🎯 Génération de ${count} missions via Gemini AI...`);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
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
              difficulty: { type: Type.INTEGER, description: "1 à 3" },
              category: { type: Type.STRING, description: "Une des catégories fournies" },
            },
            required: ["description", "difficulty", "category"],
          }
        },
        temperature: 0.9,
        maxOutputTokens: 2048,
      },
    });

    const missions: any[] = JSON.parse(response.text || "[]");
    
    if (!Array.isArray(missions) || missions.length === 0) {
      throw new Error("Format de réponse invalide");
    }

    console.log(`✅ ${missions.length} missions générées avec succès`);

    return missions.map((m, i) => {
      let validDifficulty = m.difficulty;
      if (validDifficulty > 3) validDifficulty = 3;
      if (validDifficulty < 1) validDifficulty = 1;

      const validCategory = Object.values(MissionCategory).includes(m.category as MissionCategory)
        ? (m.category as MissionCategory)
        : MissionCategory.SOCIAL;

      return {
        id: `ai-${Date.now()}-${i}`,
        description: m.description.trim(),
        difficulty: validDifficulty as 1 | 2 | 3,
        category: validCategory,
      };
    });

  } catch (error) {
    console.error("❌ Erreur lors de la génération de missions IA:", error);
    return [];
  }
}

/**
 * Transforme une photo en style agent secret / espion
 */
export async function agentifyPhoto(photoBase64: string): Promise<string | null> {
  if (!ai) {
    console.error("❌ API key manquante pour agentifyPhoto");
    return null;
  }

  try {
    console.log("🎨 Transformation de la photo en style agent...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          parts: [
            { text: "Transform this photo into a spy/secret agent style image. Make it look professional, mysterious, and cinematic. Return the description of the transformed image." },
            { 
              inlineData: {
                mimeType: "image/jpeg",
                data: photoBase64.split(',')[1]
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    console.log("✅ Photo transformée avec succès");
    return response.text || null;

  } catch (error) {
    console.error("❌ Erreur lors de la transformation de la photo:", error);
    return null;
  }
}

/**
 * Génère un nom et une biographie d'espion fictif
 */
export async function generateFictionalSpy(): Promise<{ name: string; bio: string } | null> {
  if (!ai) {
    console.error("❌ API key manquante pour generateFictionalSpy");
    return null;
  }

  try {
    console.log("🕵️ Génération d'un profil d'espion fictif...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: "Generate a fictional spy character with a cool codename and a brief one-sentence bio. Make it mysterious and cinematic. Return ONLY a JSON object with 'name' and 'bio' fields in French.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nom de code de l'espion en français" },
            bio: { type: Type.STRING, description: "Biographie courte en français" },
          },
          required: ["name", "bio"],
        },
        temperature: 0.9,
        maxOutputTokens: 256,
      }
    });

    const spy = JSON.parse(response.text || "{}");
    
    if (!spy.name || !spy.bio) {
      throw new Error("Format de réponse invalide");
    }

    console.log(`✅ Espion fictif généré : ${spy.name}`);
    return spy;

  } catch (error) {
    console.error("❌ Erreur lors de la génération de l'espion fictif:", error);
    return null;
  }
}

/**
 * Teste la connexion à l'API Gemini
 */
export async function testGeminiConnection(): Promise<boolean> {
  if (!ai) {
    console.error("❌ API key manquante");
    return false;
  }

  try {
    console.log("🔍 Test de connexion à Gemini...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: "Réponds simplement: OK",
      config: {
        maxOutputTokens: 10,
      }
    });
    
    console.log("✅ Connexion Gemini OK:", response.text);
    return true;
  } catch (error) {
    console.error("❌ Échec du test de connexion:", error);
    return false;
  }
}
