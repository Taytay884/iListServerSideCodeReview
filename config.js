let mongoUri;
if (process.env.ENV === 'TEST') {
    const dbUser = 'itay';
    const dbPassword = '1234';
    const databaseName = 'iList';
    mongoUri = `mongodb://${dbUser}:${dbPassword}@localhost:27017/${databaseName}`;
} else {
    const dbUser = 'itay';
    const dbPassword = 'd4oS6ckKzZXw03aN';
    const databaseName = 'iList';
    mongoUri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0-px0px.mongodb.net/${databaseName}?retryWrites=true&w=majority`
}

module.exports = {
    mongoUri
};
