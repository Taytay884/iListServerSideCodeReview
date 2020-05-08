const mongo = require('../../services/mongo');
const UserUtils = require('../User/UserUtils');
const DatabaseUtils = require('../databaseUtils');
const {uuid} = require('uuidv4');
const List = require('../../models/List');
const User = require('../../models/User');

async function addListToDatabase(username, listName, listItems = []) {
    const listItemIds = listItems.map((listItem) => listItem._id);
    await mongo.connect();
    const userDocument = await User.findOne({username});
    const listData = {
        _id: uuid(),
        name: listName,
        author: username,
        items: listItemIds,
        created_date: new Date().toISOString(),
        users: [userDocument._id.toString()],
    };
    const list = new List(listData);
    await DatabaseUtils.addItemToDatabase(list);
    userDocument.lists.unshift(list._id);
    await userDocument.save();
    return list.toObject();
}

async function getListFromDatabase(listId) {
    await mongo.connect();
    const listDocument = await List.findOne({_id: listId});
    if (!listDocument) return listDocument;
    return listDocument.toObject();
}

async function getListDocumentFromDatabase(listId) {
    await mongo.connect();
    const listDocument = await List.findOne({_id: listId});
    if (!listDocument) return listDocument;
    return listDocument;
}

async function addUserToList(listId, username) {
    await mongo.connect();
    const listDocument = await List.findOne({_id: listId});
    const userDocument = await User.findOne({username});
    listDocument.users.push(userDocument._id);
    await listDocument.save();
    userDocument.lists.unshift(listId);
    await userDocument.save();
}

module.exports = {
    addListToDatabase,
    getListFromDatabase,
    getListDocumentFromDatabase,
    addUserToList
};
