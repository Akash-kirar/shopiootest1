
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getImageDescription = async (base64Image: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        const prompt = "Describe this product for a search index. Use 3-5 distinct keywords focusing ONLY on item type, color, and pattern. Do not use sentences. Example: 'blue striped t-shirt'. Another example: 'black leather boots'.";

        const textPart = {
            text: prompt,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const description = response.text.trim().toLowerCase();
        if (!description) {
            throw new Error("Gemini API returned an empty description.");
        }
        return description;

    } catch (error) {
        console.error("Error generating image description with Gemini:", error);
        throw new Error("Failed to analyze image. Please ensure your API key is configured correctly.");
    }
};
