const Dal = require('./Dal');
const List = require('../models/List');
const ListItem = require('../models/ListItem');
const User = require('../models/User');
const Invitation = require('../models/Invitation');

class ListDal extends Dal {
    constructor() {
        super();
    }

    async addListToDatabase(list, username) {
        let session;
        try {
            const db = await this.mongo.connect();
            session = await db.startSession();
            await session.startTransaction();
            const listDocument = await list.save();
            const userDocument = await User.findOne({username});
            userDocument.lists.unshift(listDocument);
            await userDocument.save();
            await session.commitTransaction();
            return listDocument;
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

    async getListFromDatabase(listId) {
        try {
            await this.mongo.connect();
            const listDocument = await List.findOne({_id: listId});
            if (!listDocument) throw new this.RequestError(`List not found. (id: ${listId}`);
            return listDocument;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getListsFromDatabase(username) {
        try {
            await this.mongo.connect();
            const userDocument = await User.findOne({username});
            if (!userDocument) throw new this.RequestError(`User not found. (username: ${username})`);
            const populatedUserDocument = await userDocument.populate('lists').execPopulate();
            return populatedUserDocument.lists;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async deleteListFromDatabase(listDocument) {
        let session;
        try {
            const db = await this.mongo.connect();
            session = await db.startSession();
            await session.startTransaction();
            await listDocument.remove();
            await session.commitTransaction();
        } catch (err) {
            if (session) {
                await session.abortTransaction();
            }
            console.log(err);
            throw err;
        }
    }

    async removeUserFromList(listDocument, userDocument) {
        let session;
        try {
            const db = await this.mongo.connect();
            session = await db.startSession();
            await session.startTransaction();
            listDocument.users = listDocument.users.filter((userId) => userId.toString() !== userDocument._id.toString());
            userDocument.lists = userDocument.lists.filter((listId) => listId.toString() !== listDocument._id.toString());
            await listDocument.save();
            await userDocument.save();
            await session.commitTransaction();
        } catch (err) {
            if (session) {
                await session.abortTransaction();
            }
            console.log(err);
            throw err;
        }
    }
}

module.exports = new ListDal();
