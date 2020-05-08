const Dal = require('./Dal');
const User = require('../models/User');
const SessionService = require('../services/Session');

class UserDal extends Dal {
    constructor() {
        super();
    }

    async createUser(user) {
        try {
            await this.mongo.connect();
            await user.save();
            return null; // We don't need to return the user details.
        } catch (err) {
            if (err.code === 11000) { // Duplicated Unique Key
                throw new this.RequestError(`Duplicated Key: ${JSON.stringify(err.keyValue)}`);
            }
            console.log(err);
            throw err;
        }
    }

    async login(username) {
        try {
            await this.mongo.connect();
            return await User.findOne({username});
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async checkIsUserLoggedIn(username, sessionId) {
        try {
            await this.mongo.connect();
            const session = await SessionService.getSession(sessionId);
            if (!session) return false;
            const userDocument = await User.findOne({username, loggedInUserSessionId: sessionId});
            return Boolean(userDocument); // If we found a user document the user is logged in, if not the user is not.
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async updateUserSessionId(username, sessionId) {
        try {
            await this.mongo.connect();
            await User.updateOne({username}, {loggedInUserSessionId: sessionId});
            return true;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async logout(username, sessionId) {
        try {
            await this.mongo.connect();
            await User.updateOne({username}, {loggedInUserSessionId: null});
            await SessionService.destroySession(sessionId);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async getUserByUsername(username) {
        try {
            await this.mongo.connect();
            const userDocument = await User.findOne({username});
            if (!userDocument) throw new this.RequestError(`User not found. (username: ${username})`);
            return userDocument;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

}

module.exports = new UserDal();
