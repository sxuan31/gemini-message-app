import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-3-flash-preview';

// Lazy initialization to prevent crash on module import if process.env is undefined in browser
const getAi = () => {
  const apiKey = process.env.API_KEY;
  // Fallback to avoid crash if key is missing, though API calls will fail
  return new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
};

/**
 * Summarizes a long message for the user.
 */
export const summarizeMessage = async (content: string): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Summarize the following message in 2-3 concise sentences, capturing the key points and any required actions. Return ONLY the summary.\n\nMessage:\n${content}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Summarize Error:", error);
    return "Summary unavailable at this time.";
  }
};

/**
 * Drafts a formal announcement based on a short topic/intent.
 */
export const draftAnnouncement = async (topic: string, tone: 'formal' | 'friendly' | 'urgent'): Promise<{ subject: string; content: string }> => {
  try {
    const ai = getAi();
    const prompt = `Write a ${tone} internal announcement message about: "${topic}". 
    Format the output as a JSON object with two keys: "subject" (a catchy subject line) and "content" (the full message body, using Markdown for formatting).
    Do not include markdown code blocks around the JSON. Just return raw JSON.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Draft Error:", error);
    return {
      subject: `Announcement regarding ${topic}`,
      content: `Please be advised about the following topic: ${topic}. \n\n(AI Drafting failed, please write manually).`
    };
  }
};