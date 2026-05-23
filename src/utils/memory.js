const { MongoClient } =
    require('mongodb');

let client;
let db;

// =========================
// CONNECT DATABASE
// =========================

async function connectToDatabase() {

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
            '✅ MongoDB Connected'
        );

        return db;

    } catch (error) {

        console.log(
            '❌ MongoDB Connection Error'
        );

        console.log(error);
    }
}

// =========================
// SAVE MEMORY
// =========================

async function saveMemory(
    userId,
    messageLine
) {

    try {

        const db =
            await connectToDatabase();

        const collection =
            db.collection(
                'chat_history'
            );

        await collection.updateOne(

            {
                userId
            },

            {
                $push: {

                    history: {

                        $each: [messageLine],

                        $slice: -10
                    }
                }
            },

            {
                upsert: true
            }
        );

    } catch (error) {

        console.log(
            '❌ DB Save Memory Error'
        );

        console.log(error);
    }
}

// =========================
// GET MEMORY
// =========================

async function getMemory(
    userId
) {

    try {

        const db =
            await connectToDatabase();

        const collection =
            db.collection(
                'chat_history'
            );

        const userDoc =
            await collection.findOne({

                userId
            });

        return userDoc?.history || [];

    } catch (error) {

        console.log(
            '❌ DB Get Memory Error'
        );

        console.log(error);

        return [];
    }
}

module.exports = {

    saveMemory,
    getMemory
};