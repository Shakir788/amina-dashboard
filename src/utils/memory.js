const memoryStore = {};

function saveMemory(userId, userMessage, aiReply) {

    if (!memoryStore[userId]) {

        memoryStore[userId] = [];
    }

    memoryStore[userId].push({

        user: userMessage,
        ai: aiReply
    });

    // last 10 chats only

    if (memoryStore[userId].length > 10) {

        memoryStore[userId].shift();
    }
}

function getMemory(userId) {

    return memoryStore[userId] || [];
}

module.exports = {

    saveMemory,
    getMemory
};