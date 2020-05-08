const Dal = require('./Dal');
const List = require('../models/List');
const ListItem = require('../models/ListItem');

class ListItemDal extends Dal {
    constructor() {
        super();
    }

    async addListItemToDatabase(listItem, listDocument) {
        let session;
        try {
            const db = await this.mongo.connect();
            session = await db.startSession();
            await session.startTransaction();
            const listItemDocument = await listItem.save({session});
            listDocument.items.unshift(listItemDocument);
            const updatedListDocument = await listDocument.save({session}); // This one can fail
            await session.commitTransaction();
            return updatedListDocument.items[0];
        } catch (err) {
            if (session) {
                await session.abortTransaction();
            }
            if (err.code === 11000) { // Duplicated Unique Key
                throw new this.RequestError(`Duplicated Key: ${JSON.stringify(err.keyValue)}`);
            }
            console.log(err);
            throw err;
        }
    }

    async getListItemsFromDatabase(listId) {
        try {
            await this.mongo.connect();
            const listDocument = await List.findOne({_id: listId});
            if (!listDocument) throw new this.RequestError(`List not found. (_id: ${listId}`);
            const populatedListDocument = await listDocument.populate('items').execPopulate();
            return populatedListDocument.items;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getListItemFromDatabase(listItemId, username) {
        try {
            await this.mongo.connect();
            const listItemDocument = await ListItem.findOne({_id: listItemId, author: username});
            if (!listItemDocument) throw new this.RequestError(`List item not found. (_id: ${listItemId}`);
            return listItemDocument;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async removeListItemFromDatabase(listItemId, listDocument) {
        let session;
        try {
            const db = await this.mongo.connect();
            session = await db.startSession();
            await session.startTransaction();
            await ListItem.deleteOne({_id: listItemId});
            listDocument.items = listDocument.items.filter((itemId) => itemId !== listItemId);
            const updatedListDocument = await listDocument.save();
            await session.commitTransaction();
            return updatedListDocument;
        } catch (err) {
            if (session) {
                await session.abortTransaction();
            }
            console.log(err);
            throw err;
        }
    }

    async updateListItem(listItemId, listItemData) {
        try {
            await this.mongo.connect();
            const updateResponse = await ListItem.updateOne({_id: listItemId}, listItemData);
            if (updateResponse.nModified !== 1) throw new this.RequestError(`List item not found. (_id: ${listItemId}`);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}

module.exports = new ListItemDal();
