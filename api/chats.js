const { connectDB } = require('../src/utils/chatLogger');

module.exports = async function handler(req, res) {
    // CORS Headers for Dashboard connection
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = await connectDB();
        const collection = db.collection('messages');

        // Saare messages fetch karke purane se naye ki taraf sort karna
        const messages = await collection.find({}).sort({ timestamp: 1 }).toArray();

        return res.status(200).json(messages);
    } catch (error) {
        console.error('❌ Fetch Chats Error:', error);
        return res.status(500).json({ error: 'Failed to fetch chats' });
    }
}