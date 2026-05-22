const memory = {};

function saveMemory(user, message) {

    if (!memory[user]) {

        memory[user] = [];
    }

    memory[user].push(message);

    if (memory[user].length > 10) {

        memory[user].shift();
    }
}

function getMemory(user) {

    return memory[user] || [];
}

module.exports = {
    saveMemory,
    getMemory
};