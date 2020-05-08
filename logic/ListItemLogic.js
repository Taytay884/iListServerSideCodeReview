'use strict';

const LogicUtils = require('./LogicUtils');
const Logic = require('./Logic');
const ListItem = require('../models/ListItem');
const RequestError = require('../models/error/RequestError');

class ListItemLogic extends Logic {
    async getListItems(listUuid) {
        return await this.Dal.getListItemsFromDatabase(listUuid);
    }

    async getListItem(listUuid, username) {
        return await this.Dal.getListItemFromDatabase(listUuid, username);
    }

    async addListItem({_id, author, text}, listUuid) {
        if (!LogicUtils.validateUuid(listUuid)) {
            throw new RequestError('Invalid List _id.');
        }
        const listItem = new ListItem({_id, author, text, created_date: new Date()});
        listItem.validateSync();
        if (listItem.errors) {
            throw new RequestError('Invalid ListItem properties.');
        }
        const listDocument = await this.Dal.getListFromDatabase(listUuid);
        return await this.Dal.addListItemToDatabase(listItem, listDocument);
    }

    async removeListItem({listItemId, listId}) {
        if (!LogicUtils.validateUuid(listItemId) || !LogicUtils.validateUuid(listId)) {
            throw new RequestError('Invalid List or List item _id.');
        }
        const listDocument = await this.Dal.getListFromDatabase(listId);
        return await this.Dal.removeListItemFromDatabase(listItemId, listDocument);
    }

    async updateListItem({_id, author, text}) {
        const listItem = new ListItem({_id, author, text, created_date: new Date()});
        listItem.validateSync();
        if (listItem.errors) {
            throw new RequestError('Invalid ListItem properties.');
        }
        return await this.Dal.updateListItem(_id, {author, text});
    }
}

module.exports = new ListItemLogic;
