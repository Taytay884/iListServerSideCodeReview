'use strict';

const Logic = require('./Logic');
const User = require('../models/User');
const RequestError = require('../models/error/RequestError');
const dal = require('../dal/index');

class UserLogic extends Logic {
    async create({username, password}) {
        const user = new User({username, password});
        return await this.Dal.createUser(user);
    }

    async login({username, password}, sessionId) {
        const isAlreadyLoggedIn = await dal.checkIsUserLoggedIn(username, sessionId);
        if (isAlreadyLoggedIn) {
            return true; // If the user is logged in we would like to let him in.
        }
        const userDocument = await this.Dal.login(username);
        if (!userDocument) {
            throw new RequestError(`Wrong credentials.`); // We don't want to send the username, it can be a vulnerability.
        }
        const isCorrectPassword = await userDocument.comparePassword(password);
        if (!isCorrectPassword) {
            throw new RequestError(`Wrong credentials.`);
        }
        return await this.Dal.updateUserSessionId(username, sessionId);
    }

    async logout(username, sessionId) {
        await this.Dal.logout(username, sessionId);
    }

    async checkIsUserLoggedIn(username, sessionId) {
        return await this.Dal.checkIsUserLoggedIn(username, sessionId);
    }

    async getUserByUsername(username) {
        return await this.Dal.getUserByUsername(username);
    }
}

module.exports = new UserLogic;
