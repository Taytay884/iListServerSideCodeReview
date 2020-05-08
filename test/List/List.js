const {uuid} = require('uuidv4');
const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const app = require('../../server.js');
const agent = chai.request.agent(app);
const DatabaseUtils = require('../databaseUtils');
const ListUtils = require('./ListUtils');
const UserUtils = require('../User/UserUtils');
const ListItemUtils = require('../ListItem/ListItemUtils');
const InvitationUtils = require('../Invitation/InvitationUtils');

const User = require('../../models/User');
const userCredentials = {username: 'Nahum', password: 'itay1234'};

describe('List', () => {
    before(async () => {

    });

    after(async () => {
        await DatabaseUtils.dropUserAndSessionCollections();
    });

    beforeEach(async () => {
        await DatabaseUtils.dropUserAndSessionCollections();
        await DatabaseUtils.dropListCollections();
        const user = new User(userCredentials);
        await DatabaseUtils.addItemToDatabase(user);
        await agent.post('/login').send(userCredentials);
    });

    describe('GET - /list/:listUuid', () => {
        describe('Success', () => {
            it('Should return a list', async () => {
                const list = await ListUtils.addListToDatabase(userCredentials.username, 'My List');
                const res = await agent.get(`/list/${list._id}`);
                assert.equal(res.statusCode, 200);
                assert.equal(res.body._id, list._id);
            });
        });

        describe('Failure', () => {
            it('Should return a validation error', async () => {
                const res = await agent.get(`/list/12345`);
                assert.equal(res.statusCode, 422);
                assert.equal(res.text, '"listUuid" must be a valid GUID');
            });

            it('Should return a "Not Found" error.', async () => {
                const listUuid = uuid();
                const res = await agent.get(`/list/${listUuid}`);
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, `List not found. (id: ${listUuid}`);
            });
        })
    });

    describe('POST - /list', () => {
        describe('Success', () => {
            it('Should add new list', async () => {
                const listData = {_id: uuid(), name: 'My New List'};
                const res = await agent.post(`/list`).send(listData);
                assert.equal(res.statusCode, 200);
                assert.equal(res.body._id, listData._id);
                assert.equal(res.body.name, listData.name);
                const user = await UserUtils.getUserFromDatabase(userCredentials.username);
                assert.equal(res.body.users[0].toString(), user._id.toString());
            });
        });

        describe('Failure', () => {
            it('Should return validation error.', async () => {
                const listData = {_id: 12345, author: 'Itay Ben Shmuel'};
                const listData2 = {author: 'Itay Ben Shmuel'};
                const res = await agent.post(`/list`).send(listData);
                assert.equal(res.statusCode, 422);
                assert.equal(res.text, '"_id" must be a string, "name" is required');
                const res2 = await agent.post(`/list`).send(listData2);
                assert.equal(res2.statusCode, 422);
                assert.equal(res2.text, '"_id" is required, "name" is required');
                const res3 = await agent.post(`/list`).send(null);
                assert.equal(res3.statusCode, 422);
                assert.equal(res3.text, '"_id" is required, "name" is required');
            });

            it('Should return error, duplicated document.', async () => {
                const listUuid = uuid();
                const listData = {_id: listUuid, name: 'My List'};
                const res = await agent.post(`/list`).send(listData);
                assert.equal(res.statusCode, 200);
                const res2 = await agent.post(`/list`).send(listData);
                assert.equal(res2.statusCode, 400);
                assert.equal(res2.text, `Duplicated Key: {"_id":"${listUuid}"}`);
            });

            it('Should return error, duplicated document.', async () => {
                const listUuid = uuid();
                const listData = {_id: listUuid, name: 'Bishgada List'};
                const res = await agent.post(`/list`).send(listData);
                assert.equal(res.statusCode, 200);
                const res2 = await agent.post(`/list`).send(listData);
                assert.equal(res2.statusCode, 400);
                assert.equal(res2.text, `Duplicated Key: {"_id":"${listUuid}"}`);
            });
        });
    });

    describe('DELETE - /list/:listUuid', () => {
        describe('Success', () => {
            let listItem1;
            let listItem2;
            let list;
            const anotherUserCredentials = {username: 'Yoram', password: '12345678'};
            beforeEach(async () => {
                listItem1 = await ListItemUtils.addListItemToDatabase(userCredentials.username, 'My First list item.');
                listItem2 = await ListItemUtils.addListItemToDatabase(userCredentials.username, 'My Second list item.');
                list = await ListUtils.addListToDatabase(userCredentials.username, 'My List', [listItem1, listItem2]);
                await DatabaseUtils.addItemToDatabase(new User(anotherUserCredentials));
                await InvitationUtils.addInvitationToDatabase(list._id, userCredentials.username, anotherUserCredentials.username);
            });
            it('Should delete a user\'s list', async () => {
                const res = await agent.delete(`/list/${list._id}`);
                assert.equal(res.statusCode, 200);
                const user = await UserUtils.getUserFromDatabase(userCredentials.username);
                const anotherUser = await UserUtils.getUserFromDatabase(anotherUserCredentials.username);
                assert.equal(user.lists.length, 0); // Remove list from user.
                assert.equal(await ListUtils.getListFromDatabase(list._id), null); // List removed from database.
                assert.equal(await ListItemUtils.getListItemFromDatabase(listItem1._id), null); // List Item removed from database.
                assert.equal(await ListItemUtils.getListItemFromDatabase(listItem2._id), null); // List Item removed from database.
                assert.equal(anotherUser.invitations.length, 0);
                assert.equal(await InvitationUtils.getInvitationFromDatabase(userCredentials.username, anotherUserCredentials.username), null); // remove the referenced invitations.
            });

            it('Should delete a list that 3 users own', async () => {
                const anotherUserCredentials = {username: 'Yoram', password: '12345678'};
                await ListUtils.addUserToList(list._id, anotherUserCredentials.username);
                let anotherUser = await UserUtils.getUserFromDatabase(anotherUserCredentials.username);
                assert.equal(anotherUser.lists.length, 1);

                const res = await agent.delete(`/list/${list._id}`);
                assert.equal(res.statusCode, 200);
                const user = await UserUtils.getUserFromDatabase(userCredentials.username);
                anotherUser = await UserUtils.getUserFromDatabase(anotherUserCredentials.username);
                assert.equal(user.lists.length, 0); // Remove list from user.
                assert.equal(anotherUser.lists.length, 0);
                assert.equal(await ListUtils.getListFromDatabase(list._id), null); // List removed from database.
                assert.equal(await ListItemUtils.getListItemFromDatabase(listItem1._id), null); // List Item removed from database.
                assert.equal(await ListItemUtils.getListItemFromDatabase(listItem2._id), null); // List Item removed from database.
            });
        });

        describe('Failure', () => {
            it('Should return validation error.', async () => {
                const res = await agent.delete(`/list/12345`);
                assert.equal(res.statusCode, 422);
                assert.equal(res.text, '"listUuid" must be a valid GUID');
            });

            it('Should return error, list not exists', async () => {
                const notExistListUuid = uuid();
                const res = await agent.delete(`/list/${notExistListUuid}`);
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, `List not found. (id: ${notExistListUuid}`);
            });

            it('Should return error, not the author of the list.', async () => {
                // Remember that we're logged in as userCredentials.username.
                const anotherUserCredentials = {username: 'Yoram', password: '12345678'};
                await DatabaseUtils.addItemToDatabase(new User(anotherUserCredentials));
                const list = await ListUtils.addListToDatabase(anotherUserCredentials.username, 'My List');
                const res = await agent.delete(`/list/${list._id}`);
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, `You are not allowed to delete a list that is not yours.`);
            });
        });
    });

    describe('DELETE - /list/collaborate/:listUuid', () => {
        describe('Success', () => {
            let list;
            const anotherUserCredentials = {username: 'Yoram', password: '12345678'};
            beforeEach(async () => {
                await DatabaseUtils.addItemToDatabase(new User(anotherUserCredentials));
                list = await ListUtils.addListToDatabase(anotherUserCredentials.username, 'My List');
            });

            it('Should delete a list that 3 users own', async () => {
                await ListUtils.addUserToList(list._id, userCredentials.username);
                let listCollaborator = await UserUtils.getUserFromDatabase(userCredentials.username);
                assert.equal(listCollaborator.lists.length, 1);

                const res = await agent.delete(`/list/collaborate/${list._id}`);
                assert.equal(res.statusCode, 200);
                const listCollaboratorAfterDelete = await UserUtils.getUserFromDatabase(userCredentials.username);
                const listOwnerAfterDelete = await UserUtils.getUserFromDatabase(anotherUserCredentials.username);
                assert.equal(listCollaboratorAfterDelete.lists.length, 0); // Remove list from user.
                assert.equal(listOwnerAfterDelete.lists.length, 1);
                const listAfterDelete = await ListUtils.getListFromDatabase(list._id);
                assert.deepEqual(listAfterDelete.users.length, 1); // List users is only 1 now.
            });
        });

        describe('Failure', () => {
            it('Should return validation error.', async () => {
                const res = await agent.delete(`/list/collaborate/12345`);
                assert.equal(res.statusCode, 422);
                assert.equal(res.text, '"listUuid" must be a valid GUID');
            });

            it('Should return error, you\'re not a collaborator of this list.', async () => {
                const anotherUserCredentials = {username: 'Yoram', password: '12345678'};
                await DatabaseUtils.addItemToDatabase(new User(anotherUserCredentials));
                const list = await ListUtils.addListToDatabase(anotherUserCredentials.username, 'My List');
                const res = await agent.delete(`/list/collaborate/${list._id}`);
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, 'You\'re not a collaborator of this list.');
            });
        });
    });
});
