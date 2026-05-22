const generateAIResponse =
    require('../src/services/ai');

const sendWhatsAppMessage =
    require('../src/services/whatsapp');

module.exports = async (req, res) => {

    // ========================================
    // WEBHOOK VERIFICATION
    // ========================================

    if (req.method === 'GET') {

        const mode =
            req.query['hub.mode'];

        const token =
            req.query['hub.verify_token'];

        const challenge =
            req.query['hub.challenge'];

        if (
            mode &&
            token === process.env.VERIFY_TOKEN
        ) {

            console.log(
                '✅ Webhook Verified'
            );

            return res.status(200).send(challenge);
        }

        return res.sendStatus(403);
    }

    // ========================================
    // RECEIVE WHATSAPP MESSAGE
    // ========================================

    if (req.method === 'POST') {

        try {

            console.log(
                '🔥 MESSAGE RECEIVED'
            );

            const body = req.body;

            if (
                body.object &&
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {

                const message =
                    body.entry[0]
                    .changes[0]
                    .value
                    .messages[0];

                const from =
                    message.from;

                const userMessage =
                    message.text?.body || '';

                if (!userMessage) {

                    return res.sendStatus(200);
                }

                console.log(
                    `📩 User: ${userMessage}`
                );

                // ====================================
                // AI RESPONSE
                // ====================================

                const aiReply =
                    await generateAIResponse(
                        userMessage
                    );

                console.log(
                    `🤖 AI: ${aiReply}`
                );

                // ====================================
                // SEND REPLY
                // ====================================

                await sendWhatsAppMessage(
                    from,
                    aiReply
                );

                console.log(
                    '✅ Reply Sent'
                );
            }

            return res.sendStatus(200);

        } catch (error) {

            console.log(
                '❌ WEBHOOK ERROR'
            );

            console.log(error);

            return res.sendStatus(500);
        }
    }

    return res.sendStatus(405);
};