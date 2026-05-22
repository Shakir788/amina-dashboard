const memory = {};

export function saveMemory(user, message) {

    if (!memory[user]) {

        memory[user] = [];
    }

    memory[user].push(message);

    // sirf last 10 messages rakho

    if (memory[user].length > 10) {

        memory[user].shift();
    }
}

export function getMemory(user) {

    return memory[user] || [];
}