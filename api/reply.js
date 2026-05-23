const sendWhatsAppMessage = require('../src/services/whatsapp');
const { saveChatMessage } = require('../src/utils/logger');
const { enableHumanMode } = require('../src/services/takeover');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: 'Missing userId or message' });
        }

        // 1. AI ko rok do (Takeover ON)
        enableHumanMode(userId);

        // 2. WhatsApp par bhej do
        await sendWhatsAppMessage(userId, message);

        // 3. Database mein Owner ke naam se save kar do
        await saveChatMessage({
            userId: userId,
            sender: 'owner',
            message: message,
            type: 'text'
        });

        return res.status(200).json({ success: true, message: 'Reply sent perfectly!' });
    } catch (error) {
        console.error('❌ Send Reply Error:', error);
        return res.status(500).json({ error: 'Failed to send reply' });
    }
}