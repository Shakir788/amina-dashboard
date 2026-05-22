const {
    generateAIResponse
} = require('../src/services/ai');

const sendWhatsAppMessage =
    require('../src/services/whatsapp');

const {
    enableHumanMode,
    isHumanMode
} = require('../src/services/takeover');

const {
    downloadWhatsAppMedia
} = require('../src/services/downloadMedia');

const {
    analyzeFashionImage
} = require('../src/services/imageAI');

// =========================
// DUPLICATE MESSAGE PROTECTION
// =========================

const processedMessages =
    new Set();

module.exports = async function handler(req, res) {

    // =========================
    // WEBHOOK VERIFICATION
    // =========================

    if (req.method === 'GET') {

        const mode =
            req.query['hub.mode'];

        const token =
            req.query['hub.verify_token'];

        const challenge =
            req.query['hub.challenge'];

        if (
            mode &&
            token &&
            mode === 'subscribe' &&
            token === process.env.VERIFY_TOKEN
        ) {

            console.log(
                '✅ WEBHOOK VERIFIED'
            );

            return res
                .status(200)
                .send(challenge);

        } else {

            return res
                .status(403)
                .end();
        }
    }

    // =========================
    // RECEIVE WHATSAPP MESSAGE
    // =========================

    if (req.method === 'POST') {

        try {

            const body = req.body;

            if (body.object) {

                const message =
                    body.entry?.[0]
                        ?.changes?.[0]
                        ?.value?.messages?.[0];

                // =========================
                // MESSAGE EXISTS
                // =========================

                if (message) {

                    const messageId =
                        message.id;

                    // =========================
                    // DUPLICATE PROTECTION
                    // =========================

                    if (
                        processedMessages.has(
                            messageId
                        )
                    ) {

                        console.log(
                            '⚠️ Duplicate message ignored'
                        );

                        return res
                            .status(200)
                            .end();
                    }

                    processedMessages.add(
                        messageId
                    );

                    setTimeout(() => {

                        processedMessages.delete(
                            messageId
                        );

                    }, 300000);

                    // =========================
                    // USER INFO
                    // =========================

                    const from =
                        message.from;

                    const businessNumber =
                        body.entry?.[0]
                            ?.changes?.[0]
                            ?.value?.metadata
                            ?.display_phone_number
                            ?.replace(/\D/g, '');

                    // =========================
                    // STOP SELF REPLY LOOP
                    // =========================

                    if (from === businessNumber) {

                        console.log(
                            '⚠️ Ignoring self message'
                        );

                        return res
                            .status(200)
                            .end();
                    }

                    // =========================
                    // CHECK HUMAN MODE
                    // =========================

                    if (isHumanMode(from)) {

                        console.log(
                            '🧑 Human mode active'
                        );

                        return res
                            .status(200)
                            .end();
                    }

                    // =========================
                    // IMAGE MESSAGE
                    // =========================

                    if (
                        message.type === 'image'
                    ) {

                        console.log(
                            '🖼️ Image received'
                        );

                        const mediaId =
                            message.image.id;

                        const mimeType =
                            message.image.mime_type;

                        const imageBase64 =
                            await downloadWhatsAppMedia(
                                mediaId
                            );

                        if (!imageBase64) {

                            await sendWhatsAppMessage(

                                from,

`Sorry love 💔
I couldn't process the image.`
                            );

                            return res
                                .status(200)
                                .end();
                        }

                        const imageReply =
                            await analyzeFashionImage(

                                imageBase64,
                                mimeType
                            );

                        console.log(
                            `🧠 Image AI: ${imageReply}`
                        );

                        await sendWhatsAppMessage(

                            from,
                            imageReply
                        );

                        return res
                            .status(200)
                            .end();
                    }

                    // =========================
                    // IGNORE NON-TEXT EVENTS
                    // =========================

                    if (
                        message.type !== 'text'
                    ) {

                        console.log(
                            '⚠️ Non-text event ignored'
                        );

                        return res
                            .status(200)
                            .end();
                    }

                    // =========================
                    // USER MESSAGE
                    // =========================

                    const userMessage =
                        message.text?.body || '';

                    if (!userMessage) {

                        return res
                            .status(200)
                            .end();
                    }

                    // =========================
                    // HUMAN TAKEOVER KEYWORDS
                    // =========================

                    const lowerMessage =
                        userMessage.toLowerCase();

                    const takeoverKeywords = [

                        'owner',
                        'human',
                        'agent',
                        'real person',
                        'support',
                        'call',
                        'problem',
                        'issue',
                        'complaint'
                    ];

                    const wantsHuman =
                        takeoverKeywords.some(
                            keyword =>
                                lowerMessage.includes(
                                    keyword
                                )
                        );

                    if (wantsHuman) {

                        enableHumanMode(from);

                        await sendWhatsAppMessage(

                            from,

`Of course love ✨
Our team will assist you personally very soon 🤍`
                        );

                        console.log(
                            '🧑 Human takeover enabled'
                        );

                        return res
                            .status(200)
                            .end();
                    }

                    console.log(
                        '🔥 MESSAGE RECEIVED'
                    );

                    console.log(
                        `📩 User: ${userMessage}`
                    );

                    // =========================
                    // AI RESPONSE
                    // =========================

                    const aiReply =
                        await generateAIResponse(
                            userMessage,
                            from
                        );

                    console.log(
                        `🤖 AI: ${aiReply}`
                    );

                    // =========================
                    // SEND WHATSAPP REPLY
                    // =========================

                    await sendWhatsAppMessage(
                        from,
                        aiReply
                    );

                    console.log(
                        '✅ WhatsApp Reply Sent'
                    );
                }

                return res
                    .status(200)
                    .end();
            }

            return res
                .status(404)
                .end();

        } catch (error) {

            console.log(
                '❌ WEBHOOK ERROR'
            );

            console.log(error);

            return res
                .status(500)
                .end();
        }
    }

    return res
        .status(405)
        .end();
}