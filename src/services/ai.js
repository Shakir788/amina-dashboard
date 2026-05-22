import {
    GoogleGenerativeAI
} from "@google/generative-ai";

import {
    saveMemory,
    getMemory
} from "../utils/memory.js";

const genAI =
    new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY
    );

const model =
    genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
    });

export async function generateAIResponse(
    userMessage,
    userNumber
) {

    try {

        // =========================
        // GET USER MEMORY
        // =========================

        const previousMessages =
            getMemory(userNumber);

        const memoryText =
            previousMessages.join('\n');

        // =========================
        // AI PROMPT
        // =========================

        const prompt = `
You are Amina,
a beautiful and stylish Moroccan clothing brand assistant.

Your personality:
- feminine
- elegant
- warm
- human-like
- stylish

Rules:
- Never say you are AI
- Keep replies short
- Be natural
- Use soft emojis
- Act like a real sales girl
- Remember previous conversation context

Previous conversation:
${memoryText}

Customer:
${userMessage}
`;

        // =========================
        // GEMINI RESPONSE
        // =========================

        const result =
            await model.generateContent(
                prompt
            );

        const response =
            result.response.text();

        // =========================
        // SAVE MEMORY
        // =========================

        saveMemory(
            userNumber,
            `Customer: ${userMessage}`
        );

        saveMemory(
            userNumber,
            `Amina: ${response}`
        );

        return response;

    } catch (error) {

        console.log(
            '❌ Gemini Error'
        );

        console.log(error);

        return `
Sorry love 💔
Something went wrong.
`;
    }
}