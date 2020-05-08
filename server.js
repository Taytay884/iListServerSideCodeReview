const express = require('express');
const RoutesInitializer = require('./routes/RoutesInitializer');
const bodyParser = require('body-parser'); // I don't know why we need it.
const SessionService = require('./services/Session');
let app = express();

async function init() {
    await SessionService.initializeSessionStore(app);
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    RoutesInitializer.initializeRoutes(app);
    app.listen(4040, () => console.log('Express server running on localhost:4040'));
}

init();

module.exports = app;
