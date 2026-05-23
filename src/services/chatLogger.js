const { MongoClient } =
    require('mongodb');

let client;
let db;

// =========================
// CONNECT DATABASE
// =========================

async function connectDB() {

    try {

        if (db) {

            return db;
        }

        client =
            new MongoClient(
                process.env.MONGODB_URI
            );

        await client.connect();

        db = client.db(
            'amina_clothing'
        );

        console.log(
            '✅ Chat Logger DB Connected'
        );

        return db;

    } catch (error) {

        console.log(
            '❌ Chat Logger DB Error'
        );

        console.log(error);
    }
}

// =========================
// SAVE CHAT MESSAGE
// =========================

async function saveChatMessage({

    userId,
    sender,
    message,
    type = 'text'

}) {

    try {

        const db =
            await connectDB();

        const collection =
            db.collection(
                'messages'
            );

        await collection.insertOne({

            userId,

            sender,

            message,

            type,

            timestamp:
                new Date()
        });

    } catch (error) {

        console.log(
            '❌ Save Chat Error'
        );

        console.log(error);
    }
}

module.exports = {

    saveChatMessage
};