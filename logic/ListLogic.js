'use strict';

const Logic = require('./Logic');
const List = require('../models/List');
const RequestError = require('../models/error/RequestError');

class ListLogic extends Logic {
    async getList(listUuid) {
        return await this.Dal.getListFromDatabase(listUuid);
    }

    async addList({_id, name}, username) {
        const userDocument = await this.Dal.getUserByUsername(username);
        const list = new List({
            _id,
            author: username,
            name,
            items: [],
            created_date: new Date(),
            users: [userDocument._id]
        });
        list.validateSync();
        if (list.errors) {
            throw new RequestError('Invalid List properties.');
        }
        return await this.Dal.addListToDatabase(list, username);
    }

    async getLists(username) {
        return await this.Dal.getListsFromDatabase(username);
    }

    async deleteList(listId, username) {
        const listDocument = await this.Dal.getListFromDatabase(listId);
        const list = listDocument.toObject();
        if (list.author !== username) throw new RequestError(`You are not allowed to delete a list that is not yours.`);
        const userDocument = await this.Dal.getUserByUsername(username); // We're validating userDocument on the authenticatingMiddleware
        await this.Dal.deleteListFromDatabase(listDocument, userDocument);
    }

    async removeListCollaborator(listId, username) {
        const userDocument = await this.Dal.getUserByUsername(username); // We're validating userDocument on the authenticatingMiddleware
        if (!userDocument.lists.includes(listId)) {
            throw new RequestError('You\'re not a collaborator of this list.');
        }
        const listDocument = await this.Dal.getListFromDatabase(listId);
        await this.Dal.removeUserFromList(listDocument, userDocument);
    }
}

module.exports = new ListLogic;
