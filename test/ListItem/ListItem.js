const {uuid} = require('uuidv4');
const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const app = require('../../server.js');
const agent = chai.request.agent(app);
const DatabaseUtils = require('../databaseUtils');
const ListItemUtils = require('./ListItemUtils');

const List = require('../../models/List');
const ListItem = require('../../models/ListItem');
const User = require('../../models/User');
const userCredentials = {username: 'Nahum', password: 'itay1234'};

function getListItemData() {
    return Object.assign({}, {_id: uuid(), author: 'Itay Ben Shmuel', text: 'Itay HaShamen.'});
}

describe('ListItem', () => {
    before(async () => {
        const user = new User(userCredentials);
        await DatabaseUtils.addItemToDatabase(user);
        await agent.post('/login').send(userCredentials);
    });

    after(async () => {
        await DatabaseUtils.dropUserAndSessionCollections();
    });

    let listUuid = uuid();
    beforeEach(async () => {
        await DatabaseUtils.dropListCollections();
        const listData = {
            _id: listUuid,
            name: 'Reshimat Kniyot',
            author: 'Itay Ben Shmuel',
            items: [],
            created_date: new Date().toString()
        };
        const list = new List(listData);
        await DatabaseUtils.addItemToDatabase(list)
    });

    describe('POST - /listItem/:listUuid', () => {
        describe('Success', () => {
            it('Should return a listItem', async () => {
                const listItemData = getListItemData();
                const res = await agent.post(`/listItem/${listUuid}`).send(listItemData);
                assert.equal(res.statusCode, 200);
                assert.equal(res.body._id, listItemData._id);
                assert.equal(res.body.author, listItemData.author);
                assert.equal(res.body.text, listItemData.text);
            });
        });

        describe('Failure', () => {
            it('Should return a validation error', async () => {
                const listItemData = getListItemData();
                const listItemDataWithoutUuid = {author: 'Itay Ben Shmuel', text: 'Itay HaShamen.'};
                const res1 = await agent.post(`/listItem/${12345}`).send(listItemData);
                assert.equal(res1.statusCode, 422);
                assert.equal(res1.text, '"listUuid" must be a valid GUID');
                const res2 = await agent.post(`/listItem/${listUuid}`).send(listItemDataWithoutUuid);
                assert.equal(res2.statusCode, 422);
                assert.equal(res2.text, '"_id" is required');
                const res3 = await agent.post(`/listItem/${listUuid}`).send(null);
                assert.equal(res3.statusCode, 422);
                assert.equal(res3.text, '"_id" is required, "author" is required, "text" is required');
            });

            it('Should return error, duplicated document.', async () => {
                const listItemData = getListItemData();
                await agent.post(`/listItem/${listUuid}`).send(listItemData);
                const res2 = await agent.post(`/listItem/${listUuid}`).send(listItemData);
                assert.equal(res2.statusCode, 400);
                assert.equal(res2.text, `Duplicated Key: {"_id":"${listItemData._id}"}`);
            });
        })
    });

    describe('GET - /listItems/:listId', () => {
        describe('Success', () => {
            it('Should return listItems', async () => {
                const listItemData = getListItemData();
                await agent.post(`/listItem/${listUuid}`).send(listItemData);
                const listItemData2 = getListItemData();
                listItemData2._id = uuid();
                listItemData2.text = 'Another list item';
                await agent.post(`/listItem/${listUuid}`).send(listItemData2);
                const res = await agent.get(`/listItems/${listUuid}`);
                assert.equal(res.statusCode, 200);
                const listItems = res.body;
                assert.deepInclude(listItems[1], listItemData); // We're using unshift instead of push.
                assert.deepInclude(listItems[0], listItemData2);
            });
        });

        describe('Failure', () => {
            it('Should return a validation error', async () => {
                const res = await agent.get(`/listItems/12345`);
                assert.equal(res.statusCode, 422);
                assert.equal(res.text, '"listUuid" must be a valid GUID');
            });

            it('Should return "List item Not Found" error.', async () => {
                const listUuid = uuid();
                const res = await agent.get(`/listItems/${listUuid}`);
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, `List not found. (_id: ${listUuid}`);
            });

        });
    });

    describe('GET - /listItem/:listItemUuid', () => {
        describe('Success', () => {
            it('Should return a listItem', async () => {
                const listItem = await ListItemUtils.addListItemToDatabase(userCredentials.username, 'This is a text.');
                const res = await agent.get(`/listItem/${listItem._id}`);
                assert.equal(res.statusCode, 200);
                assert.equal(res.body._id, listItem._id);
            });
        });

        describe('Failure', () => {
            it('Should return a validation error', async () => {
                const res = await agent.get(`/listItem/12345`);
                assert.equal(res.statusCode, 422);
                assert.equal(res.text, '"listItemUuid" must be a valid GUID');
            });

            it('Should return "List item Not Found" error.', async () => {
                const listUuid = uuid();
                const res = await agent.get(`/listItem/${listUuid}`);
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, `List item not found. (_id: ${listUuid}`);
            });

        });
    });

    describe('DELETE - /listItem', () => {
        describe('Success', () => {
            it('Should delete a listItem', async () => {
                // Should insert listItem to db.
                const listItemData = getListItemData();
                const insertListItemResponse = await agent.post(`/listItem/${listUuid}`).send(listItemData);
                assert.equal(insertListItemResponse.statusCode, 200);
                const res = await agent.delete(`/listItem/${listUuid}/${listItemData._id}`);
                assert.equal(res.statusCode, 200);
                const list = res.body;
                assert.equal(list.items.length, 0);
                const deletedItem = await DatabaseUtils.getItemFromDatabase(ListItem, listItemData._id);
                assert.isNull(deletedItem);
            });

            it('Should try to delete not exist listItem', async () => {
                const notExistListItemId = uuid();
                const res = await agent.delete(`/listItem/${listUuid}/${notExistListItemId}`);
                assert.equal(res.statusCode, 200);
            });
        });

        describe('Failure', () => {
            it('Should return a validation error', async () => {
                const res = await agent.delete(`/listItem/${listUuid}/12345`);
                assert.equal(res.statusCode, 422);
                assert.equal(res.text, '"listItemId" must be a valid GUID');
            });
        });
    });

    describe('PUT - /listItem', () => {
        describe('Success', () => {
            it('Should update a listItem', async () => {
                // Should insert listItem to db.
                const listItemData = getListItemData();
                const insertListItemResponse = await agent.post(`/listItem/${listUuid}`).send(listItemData);
                assert.equal(insertListItemResponse.statusCode, 200);
                listItemData.author = 'Shlomi Shabbat';
                listItemData.text = 'Sing the song: "Father"';
                const res = await agent.put(`/listItem`).send({...listItemData});
                assert.equal(res.statusCode, 200);
                const updatedItem = await DatabaseUtils.getItemFromDatabase(ListItem, listItemData._id);
                assert.deepInclude(updatedItem, listItemData);
            });
        });

        describe('Failure', () => {
            it('Should return a validation error', async () => {
                const notExistListItemData = getListItemData();
                const res = await agent.put(`/listItem`).send({...notExistListItemData, _id: 12345});
                assert.equal(res.statusCode, 422);
                assert.equal(res.text, '"_id" must be a string');
            });

            it('Should try to update not exist listItem', async () => {
                const notExistListItemData = getListItemData();
                const res = await agent.put(`/listItem`).send(notExistListItemData);
                assert.equal(res.statusCode, 400);
                assert.equal(res.text, `List item not found. (_id: ${notExistListItemData._id}`);
            });
        });
    });
});
