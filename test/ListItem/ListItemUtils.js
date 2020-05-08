const mongo = require('../../services/mongo');
const {uuid} = require('uuidv4');
const ListItem = require('../../models/ListItem');

async function addListItemToDatabase(username, text) {
    await mongo.connect();
    const listItemData = {
        _id: uuid(),
        author: username,
        created_date: new Date().toISOString(),
        text
    };
    const listItem = new ListItem(listItemData);
    await listItem.save();
    return listItem;
}

async function getListItemFromDatabase(listItemId) {
    await mongo.connect();
    const listItemDocument = await ListItem.findOne({_id: listItemId});
    if (!listItemDocument) return listItemDocument;
    return listItemDocument.toObject();
}

module.exports = {
    addListItemToDatabase,
    getListItemFromDatabase
};
