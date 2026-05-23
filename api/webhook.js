const { generateAIResponse } = require('../src/services/ai');
const sendWhatsAppMessage = require('../src/services/whatsapp');
const { enableHumanMode, isHumanMode } = require('../src/services/takeover');
const { downloadWhatsAppMedia } = require('../src/services/downloadMedia');
const { analyzeFashionImage } = require('../src/services/imageAI');
const { transcribeAudio } = require('../src/services/audioAI');

// 👇 DATABASE LOGGER IMPORT 👇
const { saveChatMessage } = require('../src/utils/chatLogger');

// =========================
// DUPLICATE MESSAGE PROTECTION
// =========================
const processedMessages = new Set();

module.exports = async function handler(req, res) {

    // =========================
    // WEBHOOK VERIFICATION
    // =========================
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode && token && mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
            console.log('✅ WEBHOOK VERIFIED');
            return res.status(200).send(challenge);
        } else {
            return res.status(403).end();
        }
    }

    // =========================
    // RECEIVE WHATSAPP MESSAGE
    // =========================
    if (req.method === 'POST') {
        try {
            const body = req.body;

            if (body.object) {
                const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

                if (message) {
                    const messageId = message.id;

                    // =========================
                    // DUPLICATE PROTECTION
                    // =========================
                    if (processedMessages.has(messageId)) {
                        console.log('⚠️ Duplicate message ignored');
                        return res.status(200).end();
                    }

                    processedMessages.add(messageId);
                    setTimeout(() => {
                        processedMessages.delete(messageId);
                    }, 300000);

                    // =========================
                    // USER INFO
                    // =========================
                    const from = message.from;
                    const businessNumber = body.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number?.replace(/\D/g, '');

                    // =========================
                    // STOP SELF REPLY LOOP
                    // =========================
                    if (from === businessNumber) {
                        console.log('⚠️ Ignoring self message');
                        return res.status(200).end();
                    }

                    // =========================
                    // CHECK HUMAN MODE
                    // =========================
                    if (isHumanMode(from)) {
                        console.log('🧑 Human mode active');
                        return res.status(200).end();
                    }

                    // =========================
                    // 1. IMAGE MESSAGE BLOCK
                    // =========================
                    if (message.type === 'image') {
                        console.log('🖼️ Image received');
                        const mediaId = message.image.id;
                        const mimeType = message.image.mime_type;

                        // 📝 LOG: USER SENT IMAGE
                        await saveChatMessage({ userId: from, sender: 'user', message: '[Image Received]', type: 'image' });

                        const imageBase64 = await downloadWhatsAppMedia(mediaId);

                        if (!imageBase64) {
                            const errorMsg = `Sorry love 💔\nI couldn't process the image.`;
                            // 📝 LOG: AI ERROR REPLY
                            await saveChatMessage({ userId: from, sender: 'ai', message: errorMsg, type: 'text' });
                            await sendWhatsAppMessage(from, errorMsg);
                            return res.status(200).end();
                        }

                        const imageReply = await analyzeFashionImage(imageBase64, mimeType);
                        console.log(`🧠 Image AI: ${imageReply}`);

                        // 📝 LOG: AI IMAGE REPLY
                        await saveChatMessage({ userId: from, sender: 'ai', message: imageReply, type: 'text' });

                        // HUMAN TYPING DELAY
                        const typingDelay = Math.floor(Math.random() * 3000) + 1500;
                        await new Promise(resolve => setTimeout(resolve, typingDelay));

                        await sendWhatsAppMessage(from, imageReply);
                        return res.status(200).end();
                    }

                    // =========================
                    // 2. AUDIO / VOICE NOTE BLOCK
                    // =========================
                    if (message.type === 'audio') {
                        console.log('🎤 Voice Note received');
                        const mediaId = message.audio.id;
                        const mimeType = message.audio.mime_type;

                        const audioBase64 = await downloadWhatsAppMedia(mediaId);

                        if (!audioBase64) {
                            const errorMsg = `Sorry love 💔\nI couldn't hear your voice note properly.`;
                            // 📝 LOG: AI ERROR REPLY
                            await saveChatMessage({ userId: from, sender: 'ai', message: errorMsg, type: 'text' });
                            await sendWhatsAppMessage(from, errorMsg);
                            return res.status(200).end();
                        }

                        const transcribedText = await transcribeAudio(audioBase64, mimeType);
                        console.log(`🗣️ Transcribed Text: ${transcribedText}`);

                        // 📝 LOG: USER SENT AUDIO (With Transcription)
                        await saveChatMessage({ userId: from, sender: 'user', message: transcribedText || '[Unclear Audio]', type: 'audio' });

                        if (!transcribedText || transcribedText === '...') {
                            const errorMsg = `I didn't quite catch that, love 🤍\nCould you type it for me?`;
                            // 📝 LOG: AI FALLBACK REPLY
                            await saveChatMessage({ userId: from, sender: 'ai', message: errorMsg, type: 'text' });
                            await sendWhatsAppMessage(from, errorMsg);
                            return res.status(200).end();
                        }

                        const aiReply = await generateAIResponse(`(Voice Note Transcript): ${transcribedText}`, from);
                        console.log(`🤖 AI (Audio): ${aiReply}`);

                        // 📝 LOG: AI AUDIO REPLY
                        await saveChatMessage({ userId: from, sender: 'ai', message: aiReply, type: 'text' });

                        // SMART HUMAN TYPING DELAY
                        const messageLength = aiReply.length;
                        let typingDelay = 800;
                        if (messageLength > 80) { typingDelay = 1800; }
                        if (messageLength > 150) { typingDelay = 2500; }

                        await new Promise(resolve => setTimeout(resolve, typingDelay));

                        await sendWhatsAppMessage(from, aiReply);
                        return res.status(200).end();
                    }

                    // =========================
                    // IGNORE NON-TEXT EVENTS
                    // =========================
                    if (message.type !== 'text') {
                        console.log('⚠️ Non-text event ignored');
                        return res.status(200).end();
                    }

                    // =========================
                    // 3. TEXT MESSAGE BLOCK
                    // =========================
                    const userMessage = message.text?.body || '';

                    if (!userMessage) {
                        return res.status(200).end();
                    }

                    // 📝 LOG: USER SENT TEXT
                    await saveChatMessage({ userId: from, sender: 'user', message: userMessage, type: 'text' });

                    // =========================
                    // HUMAN TAKEOVER KEYWORDS
                    // =========================
                    const lowerMessage = userMessage.toLowerCase();
                    const takeoverKeywords = ['owner', 'human', 'agent', 'real person', 'support', 'call', 'problem', 'issue', 'complaint'];

                    const wantsHuman = takeoverKeywords.some(keyword => lowerMessage.includes(keyword));

                    if (wantsHuman) {
                        enableHumanMode(from);
                        const takeoverMsg = `Of course love ✨\nOur team will assist you personally very soon 🤍`;
                        
                        // 📝 LOG: AI TAKEOVER REPLY
                        await saveChatMessage({ userId: from, sender: 'ai', message: takeoverMsg, type: 'text' });
                        
                        await sendWhatsAppMessage(from, takeoverMsg);
                        console.log('🧑 Human takeover enabled');
                        return res.status(200).end();
                    }

                    console.log('🔥 MESSAGE RECEIVED');
                    console.log(`📩 User: ${userMessage}`);

                    // =========================
                    // AI RESPONSE
                    // =========================
                    const aiReply = await generateAIResponse(userMessage, from);
                    console.log(`🤖 AI: ${aiReply}`);

                    // 📝 LOG: AI TEXT REPLY
                    await saveChatMessage({ userId: from, sender: 'ai', message: aiReply, type: 'text' });

                    // =========================
                    // HUMAN TYPING DELAY
                    // =========================
                    const textTypingDelay = Math.floor(Math.random() * 3000) + 1500;
                    await new Promise(resolve => setTimeout(resolve, textTypingDelay));

                    // =========================
                    // SEND WHATSAPP REPLY
                    // =========================
                    await sendWhatsAppMessage(from, aiReply);
                    console.log('✅ WhatsApp Reply Sent');
                }

                return res.status(200).end();
            }

            return res.status(404).end();

        } catch (error) {
            console.log('❌ WEBHOOK ERROR');
            console.log(error);
            return res.status(500).end();
        }
    }

    return res.status(405).end();
}