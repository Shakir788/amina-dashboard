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

async function analyzeFashionImage(
    imageBase64,
    mimeType
) {

    try {

        const result =
            await model.generateContent([

                {
                    inlineData: {

                        data: imageBase64,
                        mimeType
                    }
                },

                `
Analyze this fashion image.

Rules:
- Detect clothing type
- Detect color
- Detect fashion vibe
- Suggest similar elegant women outfits
- Reply short
- Feminine tone
- Human-like style
- French/Darija friendly
`
            ]);

        return result.response.text();

    } catch (error) {

        console.log(
            '❌ IMAGE AI ERROR'
        );

        console.log(error);

        return `
Sorry love 💔
I couldn't analyze the image.
`;
    }
}

module.exports = {
    analyzeFashionImage
};