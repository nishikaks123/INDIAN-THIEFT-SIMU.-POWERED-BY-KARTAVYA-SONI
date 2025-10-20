
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateGdd(userInput: string): Promise<string> {
    try {
        const prompt = `
            You are a world-class AAA game designer and creative director, known for your work on legendary open-world games like Red Dead Redemption 2 and Grand Theft Auto V.
            Your task is to take the following raw game concept summary and expand it into a detailed, inspiring, and structured Game Design Document (GDD) section.
            Flesh out each point with creative ideas, specific mechanics, and evocative descriptions. Add new, complementary ideas that fit the theme and elevate the concept to a AAA level.

            **Input Game Concept:**
            \`\`\`
            ${userInput}
            \`\`\`

            **Output Instructions:**
            1.  Structure your response using Markdown.
            2.  Use a main heading for each major category from the input (e.g., "## 🧭 1. World & Environment"). Keep the original emoji and numbering.
            3.  Under each heading, use bullet points (*), nested if necessary, to detail the features with rich, professional-grade descriptions.
            4.  Maintain a professional, exciting, and creative tone throughout. Make it sound like a real, high-budget game pitch.
            5.  Do not include any introductory or concluding paragraphs outside of the structured sections. Go directly into the first section.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate Game Design Document from Gemini API.");
    }
}
