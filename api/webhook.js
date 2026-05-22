const {
    generateAIResponse
} = require('../src/services/ai');

const sendWhatsAppMessage =
    require('../src/services/whatsapp');

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

                if (message) {

                    const from =
                        message.from;

                    // =========================
                    // STOP SELF REPLY LOOP
                    // =========================

                    const businessNumber =
                        body.entry?.[0]
                            ?.changes?.[0]
                            ?.value?.metadata
                            ?.display_phone_number
                            ?.replace(/\D/g, '');

                    if (from === businessNumber) {

                        console.log(
                            '⚠️ Ignoring self message'
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