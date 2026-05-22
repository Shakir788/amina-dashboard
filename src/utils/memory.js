const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = client.db();
    cachedClient = client;
    cachedDb = db;
    return { client, db };
}

async function saveMemory(userId, messageLine) {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('chat_history');

        // Automatic Sliding Window: Hamesha last 10 messages hi bachenge
        await collection.updateOne(
            { userId: userId },
            {
                $push: {
                    history: {
                        $each: [messageLine],
                        $slice: -10
                    }
                }
            },
            { upsert: true }
        );
    } catch (error) {
        console.log('❌ DB Save Memory Error:', error);
    }
}

async function getMemory(userId) {
    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('chat_history');

        const userDoc = await collection.findOne({ userId: userId });
        return userDoc && userDoc.history ? userDoc.history : [];
    } catch (error) {
        console.log('❌ DB Get Memory Error:', error);
        return [];
    }
}

module.exports = {
    saveMemory,
    getMemory
};