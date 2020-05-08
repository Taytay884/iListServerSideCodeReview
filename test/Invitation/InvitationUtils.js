const mongo = require('../../services/mongo');
const User = require('../../models/User');
const Invitation = require('../../models/Invitation');
const DatabaseUtils = require("../databaseUtils");
const ListUtils = require("../List/ListUtils");

async function addInvitationToDatabase(listId, sender, recipient) {
    await mongo.connect();
    const invitationData = {
        list: listId,
        sender: sender,
        recipient: recipient
    };
    const invitation = new Invitation(invitationData);
    await DatabaseUtils.addItemToDatabase(invitation);
    const UserDocument = await User.findOne({username: recipient});
    UserDocument.invitations.unshift(invitation);
    await UserDocument.save();
    const listDocument = await ListUtils.getListDocumentFromDatabase(listId);
    listDocument.invitations.push(invitation._id);
    await listDocument.save();
    return invitation.toObject();
}

async function getInvitationFromDatabase(sender, recipient) {
    await mongo.connect();
    const invitationDocument = await Invitation.findOne({sender, recipient});
    if (!invitationDocument) return invitationDocument;
    return invitationDocument.toObject();
}

async function removeAllInvitationsFromDatabase() {
    await mongo.connect();
    await Invitation.deleteMany({});
    const userDocuments = await User.find({});
    for (const userDocument of userDocuments) {
        userDocument.invitations = [];
        await userDocument.save();
    }
}

module.exports = {
    addInvitationToDatabase,
    getInvitationFromDatabase,
    removeAllInvitationsFromDatabase
};
