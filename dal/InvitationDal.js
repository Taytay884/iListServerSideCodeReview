const Dal = require('./Dal');
const User = require('../models/User');
const Invitation = require('../models/Invitation');

class InvitationDal extends Dal {
    constructor() {
        super();
    }

    async addInvitationToDatabase(invitation, userDocument) {
        let session;
        try {
            const db = await this.mongo.connect();
            session = await db.startSession();
            await session.startTransaction();
            const invitationDocument = await invitation.save();
            userDocument.invitations.unshift(invitationDocument);
            await userDocument.save();
            await session.commitTransaction();
            return invitationDocument;
        } catch (err) {
            if (session) {
                await session.abortTransaction();
            }
            if (err.code === 11000) { // Duplicated Unique Key
                throw new this.RequestError('You have already sent this invitation.');
            }
            console.log(err);
            throw err;
        }
    }

    async getInvitationsFromDatabase(username) {
        try {
            await this.mongo.connect();
            const userDocument = await User.findOne({username});
            if (!userDocument) throw new this.RequestError(`User not found. (username: ${username})`);
            const populatedUserDocument = await userDocument.populate({
                path: 'invitations',
                populate: {path: 'list'}
            }).execPopulate();
            return populatedUserDocument.invitations;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async acceptInvitation(username, invitationId) {
        let session;
        try {
            const db = await this.mongo.connect();
            session = await db.startSession();
            await session.startTransaction();

            const userDocument = await User.findOne({username});
            if (!userDocument) throw new this.RequestError(`User not found. (username: ${username})`);

            const invitationDocument = await Invitation.findOne({_id: invitationId});
            if (!invitationDocument) throw new this.RequestError(`Invitation not found. (id: ${invitationId})`);

            const populatedInvitationDocument = await invitationDocument.populate('list').execPopulate();
            const listDocument = populatedInvitationDocument.list;
            if (!listDocument) throw new this.RequestError(`List not found.`);

            listDocument.users.push(userDocument);
            await listDocument.save();

            userDocument.invitations = userDocument.invitations.filter((invitation) => invitation.toString() !== invitationId);
            userDocument.lists.unshift(listDocument);
            await userDocument.save();
            await Invitation.deleteOne({_id: invitationId});
            await session.commitTransaction();
        } catch (err) {
            if (session) {
                await session.abortTransaction();
            }
            console.log(err);
            throw err;
        }
    }

    async declineInvitation(username, invitationId) {
        let session;
        try {
            const db = await this.mongo.connect();
            session = await db.startSession();
            await session.startTransaction();

            const userDocument = await User.findOne({username});
            if (!userDocument) throw new this.RequestError(`User not found. (username: ${username})`);

            const invitationDocument = await Invitation.findOne({_id: invitationId});
            if (!invitationDocument) throw new this.RequestError(`Invitation not found. (id: ${invitationId})`);

            const populatedInvitationDocument = await invitationDocument.populate('list').execPopulate();
            const listDocument = populatedInvitationDocument.list;
            if (!listDocument) throw new this.RequestError(`List not found.`);

            userDocument.invitations = userDocument.invitations.filter((invitation) => invitation.toString() !== invitationId);
            await userDocument.save();
            await Invitation.deleteOne({_id: invitationId});
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

module.exports = new InvitationDal();
