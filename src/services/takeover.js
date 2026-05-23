const humanModeUsers =
    new Set();

function enableHumanMode(user) {

    humanModeUsers.add(user);
}

function disableHumanMode(user) {

    humanModeUsers.delete(user);
}

function isHumanMode(user) {

    return humanModeUsers.has(user);
}

module.exports = {

    enableHumanMode,
    disableHumanMode,
    isHumanMode
};