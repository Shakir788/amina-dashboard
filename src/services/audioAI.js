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

async function transcribeAudio(
    audioBase64,
    mimeType
) {

    try {

        // WhatsApp sends:
        // audio/ogg; codecs=opus

        const cleanMimeType =
            mimeType.split(';')[0];

        const result =
            await model.generateContent([

                {
                    inlineData: {

                        data: audioBase64,

                        mimeType:
                            cleanMimeType
                    }
                },

                `
You are an expert multilingual transcription AI.

The user may speak:
- Moroccan Darija
- French
- English
- Mixed languages

Your task:
- Transcribe EXACTLY what is spoken
- Keep original language
- No translation
- No explanations
- No extra formatting
- If audio is empty/noise return only: ...
`
            ]);

        return result
            .response
            .text()
            ?.trim() || null;

    } catch (error) {

        console.log(
            '❌ AUDIO AI ERROR'
        );

        console.log(error);

        return null;
    }
}

module.exports = {
    transcribeAudio
};