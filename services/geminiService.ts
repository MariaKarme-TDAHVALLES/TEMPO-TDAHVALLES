
import { GoogleGenAI, Type } from "@google/genai";
import { ProfileType, RewardSuggestion, TaskStep, Language, Recipe } from "../types";

export const getRewardSuggestions = async (profile: ProfileType, taskTitle: string, lang: Language): Promise<RewardSuggestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isWeekend = [0, 6].includes(new Date().getDay());
  
  const screenTimeWarning = isWeekend 
    ? "You MAY suggest screen-related rewards (video games, TV, etc.)." 
    : "CRITICAL: Do NOT suggest any screen-related rewards (video games, phone, TV, YouTube). Today is a weekday. Suggest physical or social activities instead.";

  const healthConstraint = "MANDATORY: All suggested rewards must be HEALTHY and beneficial for well-being (e.g., healthy snack, walk outside, deep breathing, hydration, playing a physical instrument, stretching).";

  const systemInstructions = {
    [ProfileType.CHILD]: `You are a fun, encouraging companion for a child with ADHD. Suggest simple, immediate rewards in the language: ${lang}. ${screenTimeWarning} ${healthConstraint}`,
    [ProfileType.TEEN]: `You are a cool mentor for a teenager with ADHD. Suggest rewards in the language: ${lang}. ${screenTimeWarning} ${healthConstraint}`,
    [ProfileType.ADULT]: `You are a professional productivity coach for adults with ADHD. Suggest rewards in the language: ${lang}. ${screenTimeWarning} ${healthConstraint}`
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user just finished the task: "${taskTitle}". Suggest 3 rewards appropriate for someone in the ${profile} profile. Respond in the language associated with code: ${lang}.`,
      config: {
        systemInstruction: systemInstructions[profile],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              icon: { type: Type.STRING, description: "A single emoji representating the reward" }
            },
            required: ["text", "icon"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return [
      { text: "Drink Water", icon: "💧" },
      { text: "Eat an Apple", icon: "🍎" },
      { text: "Stretch", icon: "🧘" }
    ];
  }
};

export const getQuickRecipes = async (taskTitle: string, lang: Language): Promise<Recipe[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user wants to: "${taskTitle}". Suggest 3 very quick and healthy recipes (max 10 mins prep) in the language: ${lang}.`,
      config: {
        systemInstruction: "You are a fast-cooking nutritionist helper.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              time: { type: Type.STRING, description: "Preparation time e.g. 5 min" },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "time", "ingredients"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};

export const getPositivePhrase = async (profile: ProfileType, lang: Language): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate one short, very punchy positive reinforcement phrase for an ADHD ${profile} who just finished a task. Language: ${lang}. Do not use quotes. Max 6 words.`,
    });
    return response.text?.trim() || "¡Buen trabajo!";
  } catch {
    return "¡Lo has logrado!";
  }
};

// Returns steps AND estimated time
export const analyzeTask = async (profile: ProfileType, taskTitle: string, lang: Language): Promise<{ steps: TaskStep[], estimatedMinutes: number, feedback: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstructions = {
    [ProfileType.CHILD]: `You are a helpful teacher. Break down tasks for a child. Estimate time realistically. Language: ${lang}.`,
    [ProfileType.TEEN]: `You are a productivity coach. Break down tasks for a teen. Estimate time. Language: ${lang}.`,
    [ProfileType.ADULT]: `You are an executive assistant. Break down tasks for an ADHD adult. Estimate time. Language: ${lang}.`
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this task: "${taskTitle}" for a ${profile}. 
      1. Break it down into small steps (max 6).
      2. Estimate how many minutes it realistically takes for someone with ADHD.
      3. Provide a short feedback sentence about the time (e.g. "This usually takes about X minutes").
      Respond in JSON. Language: ${lang}.`,
      config: {
        systemInstruction: systemInstructions[profile],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                   text: { type: Type.STRING }
                }
              }
            },
            estimatedMinutes: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          },
          required: ["steps", "estimatedMinutes", "feedback"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    const steps = (data.steps || []).map((s: { text: string }, index: number) => ({
      id: `${Date.now()}-${index}`,
      text: s.text,
      completed: false
    }));

    return {
      steps,
      estimatedMinutes: data.estimatedMinutes || 15,
      feedback: data.feedback || ""
    };

  } catch (error) {
    console.error("Error analyzing task:", error);
    return {
      steps: [{ id: '1', text: "Start task", completed: false }],
      estimatedMinutes: 15,
      feedback: "Could not estimate time."
    };
  }
};

// Deprecated wrapper to maintain compatibility if needed, but we prefer analyzeTask
export const getTaskSteps = async (profile: ProfileType, taskTitle: string, lang: Language): Promise<TaskStep[]> => {
  const result = await analyzeTask(profile, taskTitle, lang);
  return result.steps;
};
