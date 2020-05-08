const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const sinon = require('sinon');
const PushNotifications = require('../../services/PushNotifications');
const sendNotificationStub = sinon.stub(PushNotifications, 'sendNotificationToUser');

const app = require('../../server.js');
const agent = chai.request.agent(app);
const DatabaseUtils = require('../databaseUtils');
const UserUtils = require('../User/UserUtils');
const InvitationUtils = require('./InvitationUtils');
const ListUtils = require('../List/ListUtils');

const User = require('../../models/User');

const userCredentials = {username: 'TestingIt', password: '123456'};
const invitedUserCredentials = {username: 'inviteMe', password: '123456'};

describe('Invitation', () => {
    beforeEach(async () => {
        await UserUtils.dropUserCollection();
        const user = new User(userCredentials);
        await DatabaseUtils.addItemToDatabase(user);
        const invitedUser = new User(invitedUserCredentials);
        await DatabaseUtils.addItemToDatabase(invitedUser);
        await DatabaseUtils.dropListCollections();
        await InvitationUtils.removeAllInvitationsFromDatabase();
    });

    describe('POST - /invite - Invite user to your list', () => {
        beforeEach(async () => {
            await agent.post('/login').send(userCredentials);
        });
        describe('Success', () => {
            it('Should invite user to a list', async () => {
                // add list to db.
                const list = await ListUtils.addListToDatabase(userCredentials.username, 'Just a list');
                const res = await agent.post('/invite').send({
                    invitedUsername: invitedUserCredentials.username,
                    listId: list._id
                });
                assert.equal(res.statusCode, 200);
                const invitation = await InvitationUtils.getInvitationFromDatabase(userCredentials.username, invitedUserCredentials.username);
                assert.equal(invitation.sender, userCredentials.username);
                assert.equal(invitation.recipient, invitedUserCredentials.username);
                const invitedUser = await UserUtils.getUserFromDatabase(invitedUserCredentials.username);
                assert.equal(invitedUser.invitations.length, 1);
                assert.equal(sendNotificationStub.lastCall.args[0], invitedUserCredentials.username);
                assert.deepEqual(sendNotificationStub.lastCall.args[1],
                    {
                        content: `${userCredentials.username} invited you to his list "${list.name}".`,
                        title: 'List Invitation'
                    }
                );
            });
        });
        describe('Failure', function () {
            it('Should fail because you are not the author of the list', async () => {
                const list = await ListUtils.addListToDatabase(invitedUserCredentials.username, 'Just a list');
                const res = await agent.post('/invite').send({
                    invitedUsername: invitedUserCredentials.username,
                    listId: list._id
                });
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, 'You cannot invite to a list that is not yours.');
            });

            it('Should fail because the user you want to invite is not exist.', async () => {
                await UserUtils.removeUserFromDatabase(invitedUserCredentials.username);
                const list = await ListUtils.addListToDatabase(userCredentials.username, 'Just a list');
                const res = await agent.post('/invite').send({
                    invitedUsername: invitedUserCredentials.username,
                    listId: list._id
                });
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, `User not found. (username: ${invitedUserCredentials.username})`);
            });

            it('Should fail because of validation.', async () => {
                const res = await agent.post('/invite').send({
                    invitedUsername: invitedUserCredentials.username,
                    listId: '123-22-33'
                });
                assert.equal(res.statusCode, 422);
                assert.equal(res.text, '"listId" must be a valid GUID');
                const res2 = await agent.post('/invite').send({});
                assert.equal(res2.statusCode, 422);
                assert.include(res2.text, '"listId" is required');
                assert.include(res2.text, '"invitedUsername" is required');
            });

            it('Should fail because of sending the same invitation', async () => {
                const list = await ListUtils.addListToDatabase(userCredentials.username, 'Just a list');
                await agent.post('/invite').send({invitedUsername: invitedUserCredentials.username, listId: list._id});
                const res = await agent.post('/invite').send({
                    invitedUsername: invitedUserCredentials.username,
                    listId: list._id
                });
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, 'You have already sent this invitation.');
            });

            it('Should fail because the recipient is already a collaborator of this list', async () => {
                const list = await ListUtils.addListToDatabase(userCredentials.username, 'Just a list');
                await ListUtils.addUserToList(list._id, invitedUserCredentials.username);
                const res = await agent.post('/invite').send({
                    invitedUsername: invitedUserCredentials.username,
                    listId: list._id
                });
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, `inviteMe is already a collaborator of Just a list.`);
            });
        });
    });

    describe('POST - /invitation/accept - Accept Invitation', () => {
        beforeEach(async () => {
            await agent.post('/login').send(invitedUserCredentials);
        });
        describe('Success', () => {
            it('Should accept invitation', async () => {
                // add list and invitation.
                const list = await ListUtils.addListToDatabase(userCredentials.username, 'Just a list');
                const invitation = await InvitationUtils.addInvitationToDatabase(list._id, userCredentials.username, invitedUserCredentials.username);
                const res = await agent.post('/invitation/accept').send( {invitationId: invitation._id});
                assert.equal(res.statusCode, 200);
                const invitationAfterAccept = await InvitationUtils.getInvitationFromDatabase(userCredentials.username, invitedUserCredentials.username);
                assert.equal(invitationAfterAccept, null);
                const invitedUser = await UserUtils.getUserFromDatabase(invitedUserCredentials.username);
                assert.equal(invitedUser.invitations.length, 0);
                assert.equal(invitedUser.lists[0], list._id);
                const listAfterAccept = await ListUtils.getListFromDatabase(list._id);
                assert.equal(listAfterAccept.users[1].toString(), invitedUser._id.toString());
            });
        });
        describe('Failure', function () {
            it('Should fail because of validation error', async () => {
                const res = await agent.post('/invitation/accept').send({invitationId: '12345'});
                assert.equal(res.status, 422);
                assert.equal(res.text, '"invitationId" with value "12345" fails to match the required pattern: /^[0-9a-fA-F]{24}$/');
                const res2 = await agent.post('/invitation/accept').send(null);
                assert.equal(res2.status, 422);
                assert.equal(res2.text, '"invitationId" is required');
            });

            it('Should fail because you don\'t have invitation.', async () => {
                // add list and invitation.
                const res = await agent.post('/invitation/accept').send( {invitationId: '507f1f77bcf86cd799439011'});
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, 'Invitation not found. (id: 507f1f77bcf86cd799439011)');
            });

            it('Should fail because list doesn\'t exist.', async () => {
                // add list and invitation.
                const list = await ListUtils.addListToDatabase(userCredentials.username, 'Just a list');
                const invitation = await InvitationUtils.addInvitationToDatabase(list._id, userCredentials.username, invitedUserCredentials.username);
                await DatabaseUtils.dropListCollections();
                const res = await agent.post('/invitation/accept').send( {invitationId: invitation._id});
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, 'List not found.');
            });
        });
    });

    describe('POST - /invitation/decline - Decline Invitation', () => {
        beforeEach(async () => {
            await agent.post('/login').send(invitedUserCredentials);
        });
        describe('Success', () => {
            it('Should decline invitation', async () => {
                // add list and invitation.
                const list = await ListUtils.addListToDatabase(userCredentials.username, 'Just a list');
                const invitation = await InvitationUtils.addInvitationToDatabase(list._id, userCredentials.username, invitedUserCredentials.username);
                const res = await agent.post('/invitation/decline').send( {invitationId: invitation._id});
                assert.equal(res.statusCode, 200);
                const invitationAfterAccept = await InvitationUtils.getInvitationFromDatabase(userCredentials.username, invitedUserCredentials.username);
                assert.equal(invitationAfterAccept, null);
                const invitedUser = await UserUtils.getUserFromDatabase(invitedUserCredentials.username);
                assert.equal(invitedUser.invitations.length, 0);
            });
        });
        describe('Failure', function () {
            it('Should fail because of validation error', async () => {
                const res = await agent.post('/invitation/decline').send({invitationId: '12345'});
                assert.equal(res.status, 422);
                assert.equal(res.text, '"invitationId" with value "12345" fails to match the required pattern: /^[0-9a-fA-F]{24}$/');
                const res2 = await agent.post('/invitation/decline').send(null);
                assert.equal(res2.status, 422);
                assert.equal(res2.text, '"invitationId" is required');
            });

            it('Should fail because you don\'t have invitation.', async () => {
                // add list and invitation.
                const res = await agent.post('/invitation/accept').send( {invitationId: '507f1f77bcf86cd799439011'});
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, 'Invitation not found. (id: 507f1f77bcf86cd799439011)');
            });

            it('Should fail because list doesn\'t exist.', async () => {
                // add list and invitation.
                const list = await ListUtils.addListToDatabase(userCredentials.username, 'Just a list');
                const invitation = await InvitationUtils.addInvitationToDatabase(list._id, userCredentials.username, invitedUserCredentials.username);
                await DatabaseUtils.dropListCollections();
                const res = await agent.post('/invitation/decline').send( {invitationId: invitation._id});
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, 'List not found.');
            });
        });
    });
});
