const sendWhatsAppMessage = require('../src/services/whatsapp');
// 👇 Path updated from 'logger' to 'chatLogger' 👇
const { saveChatMessage } = require('../src/utils/chatLogger');
const { enableHumanMode } = require('../src/services/takeover');

module.exports = async function handler(req, res) {
    // CORS Headers for Dashboard connection
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: 'Missing userId or message' });
        }

        // 1. AI ko bypass karo (Human Mode ON)
        enableHumanMode(userId);

        // 2. WhatsApp par direct send karo
        await sendWhatsAppMessage(userId, message);

        // 3. Database mein 'owner' tag ke sath save karo
        await saveChatMessage({
            userId: userId,
            sender: 'owner',
            message: message,
            type: 'text'
        });

        return res.status(200).json({ success: true, message: 'Reply sent from Dashboard!' });
    } catch (error) {
        console.error('❌ Send Reply Error:', error);
        return res.status(500).json({ error: 'Failed to send reply' });
    }
}