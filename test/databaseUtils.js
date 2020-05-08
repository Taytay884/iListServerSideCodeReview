const mongo = require('../services/mongo');

const List = require('../models/List');
const ListItem = require('../models/ListItem');
const User = require('../models/User');
const SessionService = require('../services/Session');

async function addItemToDatabase(item) {
    await mongo.connect();
    try {
        return await item.save();
    } catch (err) {
        console.log(err);
    }
}

async function getItemFromDatabase(schema, _id) {
    await mongo.connect();
    try {
        return await schema.findOne({_id});
    } catch (err) {
        console.log(err);
    }
}

async function dropListCollections() {
    await mongo.connect();
    await List.deleteMany({});
    await ListItem.deleteMany({});
}

async function dropUserAndSessionCollections() {
    await mongo.connect();
    await User.deleteMany({});
    await SessionService.clearSessions();
}

module.exports = {
    addItemToDatabase,
    getItemFromDatabase,
    dropListCollections,
    dropUserAndSessionCollections
};
