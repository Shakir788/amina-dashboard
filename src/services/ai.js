const { GoogleGenerativeAI } = require("@google/generative-ai");

const {
    saveMemory,
    getMemory
} = require("../utils/memory");

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

async function generateAIResponse(
    userMessage,
    userNumber
) {

    try {

        const previousMessages =
            getMemory(userNumber);

        const memoryText =
            previousMessages.join("\n");

        const prompt = `
You are Amina,
a stylish Moroccan clothing brand sales assistant.

Rules:
- Talk naturally
- Feminine elegant tone
- Keep replies short
- Never say you are AI
- Remember previous context

Previous conversation:
${memoryText}

Customer:
${userMessage}
`;

        const result =
            await model.generateContent(prompt);

        const response =
            result.response.text();

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

        console.log("❌ Gemini Error");

        console.log(error);

        return "Sorry love 💔 Something went wrong.";
    }
}

module.exports = {
    generateAIResponse
};