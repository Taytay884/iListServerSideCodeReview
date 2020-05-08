const bcrypt = require('bcrypt');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const app = require('../../server.js');
let agent;
const DatabaseUtils = require('../databaseUtils');
const UserUtils = require('./UserUtils');

const User = require('../../models/User');

const userCredentials = {username: 'TestingIt', password: '123456'};

describe('User', () => {
    beforeEach(async () => {
        await UserUtils.dropUserCollection();
        agent = chai.request.agent(app);
    });

    describe('POST - /createUser', () => {
        describe('Success', () => {
            it('Should add new user to the database.', async () => {
                const response = await agent.post('/createUser').send(userCredentials);
                assert.equal(response.statusCode, 200);
                const user = await UserUtils.getUserFromDatabase(userCredentials.username);
                assert.equal(user.username, userCredentials.username);
                assert(bcrypt.compareSync(userCredentials.password, user.password));
            });
        });

        describe('Failure', () => {
            it('Should return validation error.', async () => {
                const response1 = await agent.post('/createUser').send(null);
                assert.equal(response1.statusCode, 422);
                assert.equal(response1.text, '"username" is required, "password" is required');
                const response2 = await agent.post('/createUser').send({username: 'ita', password: 'passw'});
                assert.equal(response2.statusCode, 422);
                assert.equal(response2.text, '"username" length must be at least 4 characters long, "password" length must be at least 6 characters long');
                const response3 = await agent.post('/createUser').send({username: 'itay884'});
                assert.equal(response2.statusCode, 422);
                assert.equal(response3.text, `"password" is required`);
            });

            it('Should return error, duplicated document.', async () => {
                const response1 = await agent.post('/createUser').send(userCredentials);
                assert.equal(response1.statusCode, 200);
                const response2 = await agent.post('/createUser').send(userCredentials);
                assert.equal(response2.statusCode, 400);
                assert.equal(response2.text, `Duplicated Key: {"username":"${userCredentials.username}"}`);
            });
        })
    });

    describe('POST - /login', () => {
        describe('Success', () => {
            it('Should return a user with cookies.', async () => {
                const user = new User(userCredentials);
                await DatabaseUtils.addItemToDatabase(user);
                const response = await agent.post('/login').send(userCredentials);
                const userFromDB = await UserUtils.getUserFromDatabase(userCredentials.username);
                expect(response).to.have.cookie('connect.sid');
                const sessionCookie = response.header['set-cookie'][0];
                assert.include(sessionCookie, (userFromDB.loggedInUserSessionId));
            });

            it('Trying to login twice- Should return logged in successfully', async () => {
                const user = new User(userCredentials);
                await DatabaseUtils.addItemToDatabase(user);
                await agent.post('/login').send(userCredentials);
                const response = await agent.post('/login').send(userCredentials);
                assert.equal(response.text, `"${userCredentials.username}"`);
            });

            it('Should change the logged in session id', async () => {
                // Log-in to the same user from different browsers
                // will change the user's sessionId and will not let them both use the user. (only the last one)
                const user = new User(userCredentials);
                await DatabaseUtils.addItemToDatabase(user);
                await agent.post('/login').send(userCredentials);
                const userFromDB1 = await UserUtils.getUserFromDatabase(userCredentials.username);
                agent = chai.request.agent(app);
                await agent.post('/login').send(userCredentials);
                const userFromDB2 = await UserUtils.getUserFromDatabase(userCredentials.username);
                assert.notEqual(userFromDB2.loggedInUserSessionId, userFromDB1.loggedInUserSessionId);
            })
        });

        describe('Failure', () => {
            it('Should return validation error.', async () => {
                const response1 = await agent.post('/login').send(null);
                assert.equal(response1.statusCode, 422);
                assert.equal(response1.text, '"username" is required, "password" is required');
                const response2 = await agent.post('/login').send({username: 'ita', password: 'passw'});
                assert.equal(response2.statusCode, 422);
                assert.equal(response2.text, '"username" length must be at least 4 characters long, "password" length must be at least 6 characters long');
                const response3 = await agent.post('/login').send({username: 'itay884'});
                assert.equal(response2.statusCode, 422);
                assert.equal(response3.text, `"password" is required`);
            });

            it('Wrong password - Should return wrong credentials message.', async () => {
                const user = new User(userCredentials);
                await DatabaseUtils.addItemToDatabase(user);
                const loginResponse = await agent.post('/login').send({...userCredentials, password: 'WrongPassword'});
                assert.equal(loginResponse.statusCode, 400);
                assert.equal(loginResponse.text, 'Wrong credentials.');
            });

            it('User not exist - Should return wrong credentials', async () => {
                const loginResponse = await agent.post('/login').send(userCredentials);
                assert.equal(loginResponse.statusCode, 400);
                assert.equal(loginResponse.text, 'Wrong credentials.');
            });
        })
    });

    describe('POST - /logout', () => {
        describe('Success', () => {
            beforeEach(async () => {
                const user = new User(userCredentials);
                await DatabaseUtils.addItemToDatabase(user);
                await agent.post('/login').send(userCredentials);
            });
            it('Should logout.', async () => {
                const logoutResponse = await agent.post('/logout').send({username: userCredentials.username});
                assert.equal(logoutResponse.statusCode, 200);
                const user = await UserUtils.getUserFromDatabase(userCredentials.username);
                assert.isNull(user.loggedInUserSessionId);
            });
        });

        describe('Failure', () => {
            it('Should return error, trying to log out from not logged in user.', async () => {
                const logoutResponse = await agent.post('/logout').send({username: userCredentials.username});
                assert.equal(logoutResponse.statusCode, 403);
                assert.equal(logoutResponse.text, 'User is not authenticated.');
            });
        });
    });
});
