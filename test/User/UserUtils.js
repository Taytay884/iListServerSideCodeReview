const mongo = require('../../services/mongo');
const User = require('../../models/User');

async function dropUserCollection() {
    await mongo.connect();
    await User.deleteMany({});
}

async function getUserFromDatabase(username) {
    await mongo.connect();
    const user = await User.findOne({username});
    return user.toObject();
}

async function removeUserFromDatabase(username) {
    await mongo.connect();
    const res = await User.remove({username});
    return res.deletedCount === 1;
}

module.exports = {
    dropUserCollection,
    getUserFromDatabase,
    removeUserFromDatabase
};
