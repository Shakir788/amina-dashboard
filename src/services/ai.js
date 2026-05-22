const {
    GoogleGenerativeAI
} = require("@google/generative-ai");

const genAI =
    new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY
    );

const model =
    genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
    });

async function generateAIResponse(
    userMessage
) {

    try {

        const prompt = `
You are Amina,
a stylish Moroccan clothing brand sales assistant.

Rules:
- Talk naturally like a real girl
- Friendly and modern tone
- Keep replies short
- Never say you are AI
- Use elegant emojis
- Reply in English

Customer:
${userMessage}
`;

        const result =
            await model.generateContent(
                prompt
            );

        return result.response.text();

    } catch (error) {

        console.log(
            '❌ Gemini Error'
        );

        console.log(error);

        return "Sorry love, something went wrong 💔";
    }
}

module.exports =
    generateAIResponse;