import { generateAIResponse } from '../src/services/ai.js';
import { sendWhatsAppMessage } from '../src/services/whatsapp.js';

export default async function handler(req, res) {

    // =========================
    // WEBHOOK VERIFICATION
    // =========================

    if (req.method === 'GET') {

        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (
            mode &&
            token &&
            mode === 'subscribe' &&
            token === process.env.VERIFY_TOKEN
        ) {

            console.log('✅ WEBHOOK VERIFIED');

            return res.status(200).send(challenge);

        } else {

            return res.sendStatus(403);
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

                    const from = message.from;

                    // ====================================
                    // STOP SELF REPLY LOOP 😈
                    // ====================================

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

                        return res.sendStatus(200);
                    }

                    // ====================================

                    const userMessage =
                        message.text?.body || '';

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

                return res.sendStatus(200);
            }

            return res.sendStatus(404);

        } catch (error) {

            console.log(
                '❌ WEBHOOK ERROR'
            );

            console.log(error);

            return res.sendStatus(500);
        }
    }

    return res.sendStatus(405);
}