'use strict';

const Logic = require('./Logic');
const RequestError = require('../models/error/RequestError');
const Invitation = require('../models/Invitation');
const UserLogic = require('./UserLogic');
const ListLogic = require('./ListLogic');
const PushNotifications = require('../services/PushNotifications');

class InvitationLogic extends Logic {
    async addInvitation(invitedUserDocument, sender, list) {
        if (invitedUserDocument.lists.includes(list._id)) {
            throw new RequestError(`${invitedUserDocument.username} is already a collaborator of ${list.name}.`);
        }
        const invitation = new Invitation({
            sender,
            recipient: invitedUserDocument.username,
            list
        });
        invitation.validateSync();
        if (invitation.errors) {
            throw new RequestError('Invalid Invitation properties.');
        }
        return await this.Dal.addInvitationToDatabase(invitation, invitedUserDocument);
    }

    async inviteUserToList(listAuthor, invitedUsername, listId) {
        // find the list.
        const listDocument = await ListLogic.getList(listId);
        const list = listDocument.toObject();
        // validate that the author owns the list.
        if (list.author !== listAuthor) {
            throw new RequestError(`You cannot invite to a list that is not yours.`);
        }
        // find the invited user.
        const invitedUserDocument = await UserLogic.getUserByUsername(invitedUsername);
        // add an invitation to this user.
        await this.addInvitation(invitedUserDocument, listAuthor, list);
        // send him a push notification.
        const message = PushNotifications.createNotificationMessage(`${listAuthor} invited you to his list "${list.name}".`, 'List Invitation');
        await PushNotifications.sendNotificationToUser(invitedUsername, message);
    }

    async getInvitations(username) {
        return await this.Dal.getInvitationsFromDatabase(username);
    }

    async acceptInvitation(username, invitationId) {
        return await this.Dal.acceptInvitation(username, invitationId);
    }

    async declineInvitation(username, invitationId) {
        return await this.Dal.declineInvitation(username, invitationId);
    }
}

module.exports = new InvitationLogic;
