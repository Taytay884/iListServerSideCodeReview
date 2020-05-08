const session = require('express-session');
const MongoStore = require("connect-mongo")(session);
const mongo = require("./mongo");
let sessionStore;

async function initializeSessionStore(app) {
    const mongooseConnection = await mongo.connect();
    sessionStore = new MongoStore({
        mongooseConnection,
        ttl: 24 * 60 * 60, // 1 Day
        secret: 'Another Shhhsh.',
    });
    app.use(session({
        'secret': 'Session secret FUN is fun.',
        saveUninitialized: false,
        resave: false,
        cookie: {secure: false, maxAge: 3600000}, // hour = 3600000
        store: sessionStore
    }));
}

function getSession(sessionId) {
    return new Promise((resolve, reject) => {
        sessionStore.get(sessionId, (error, session) => {
            if (error) reject(error);
            resolve(session);
        })
    });
}

function destroySession(sessionId) {
    return new Promise((resolve, reject) => {
        sessionStore.destroy(sessionId, (error) => {
            if (error) reject(error);
            resolve();
        })
    });
}

function clearSessions() {
    return new Promise((resolve, reject) => {
        sessionStore.clear((error) => {
            if (error) reject(error);
            resolve();
        })
    });
}


module.exports = {
    initializeSessionStore,
    getSession,
    destroySession,
    clearSessions
};
