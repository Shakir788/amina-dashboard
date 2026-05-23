const express = require('express');
const router = express.Router();

const generateAIResponse = require('../services/ai');
const sendWhatsAppMessage = require('../services/whatsapp');

console.log('✅ WEBHOOK FILE LOADED');


// ========================================
// WEBHOOK VERIFICATION
// ========================================

router.get('/', (req, res) => {

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {

        if (
            mode === 'subscribe' &&
            token === process.env.VERIFY_TOKEN
        ) {

            console.log('✅ Meta Webhook Verified Successfully!');

            return res.status(200).send(challenge);

        } else {

            console.log('❌ Verification failed');

            return res.sendStatus(403);
        }
    }

    return res.send('Webhook endpoint working 🚀');
});


// ========================================
// RECEIVE WHATSAPP MESSAGES
// ========================================

router.post('/', async (req, res) => {

    try {

        console.log('🔥 MESSAGE RECEIVED FROM WHATSAPP');

        const body = req.body;

        // ========================================
        // CHECK MESSAGE EXISTS
        // ========================================

        if (
            body.object &&
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {

            const message =
                body.entry[0].changes[0].value.messages[0];

            const from =
                message.from;

            const userMessage =
                message.text?.body || '';

            // ========================================
            // IGNORE STATUS EVENTS
            // ========================================

            if (!userMessage) {

                return res.sendStatus(200);
            }

            // ========================================
            // IGNORE OWN MESSAGES
            // ========================================

            const businessPhoneNumberId =
                body.entry[0].changes[0].value.metadata.phone_number_id;

            if (
                message.from === businessPhoneNumberId
            ) {

                console.log('⚠️ Ignoring own message');

                return res.sendStatus(200);
            }

            console.log(`📩 User: ${userMessage}`);

            // ========================================
            // GENERATE AI RESPONSE
            // ========================================

            const aiReply =
                await generateAIResponse(userMessage);

            console.log(`🤖 AI: ${aiReply}`);

            // ========================================
            // SEND WHATSAPP REPLY
            // ========================================

            await sendWhatsAppMessage(
                from,
                aiReply
            );

            console.log('✅ Reply Sent Successfully');
        }

        return res.sendStatus(200);

    } catch (error) {

        console.log('❌ WEBHOOK ERROR');

        console.log(error);

        return res.sendStatus(500);
    }
});

module.exports = router;