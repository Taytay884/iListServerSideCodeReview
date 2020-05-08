const config = require('../config');
mongoose = require('mongoose');

let connection = null;
let connectionRequest = null;

function connect() {
    return new Promise((resolve, reject) => {
        if (connection) {
            resolve(connection);
            return;
        }
        if (!connectionRequest) {
            connectionRequest = mongoose.connect(config.mongoUri, {useNewUrlParser: true});
        }
        const db = mongoose.connection;
        db.on('error', () => {
            console.error.bind(console, 'connection error:');
            reject(new Error('Connection failed.'));
        });
        db.on('open', () => {
            connection = db;
            resolve(db);
        });
    });
}

module.exports = {
    connect,
};
