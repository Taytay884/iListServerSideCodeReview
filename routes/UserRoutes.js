const Routes = require('./Routes');
const UserLogic = require('../logic/UserLogic');

class UserRoutes extends Routes {
    constructor(app) {
        super();
        this.init(app);
    }

    init(app) {
        app.post('/createUser', this.RequestBodySchemaValidator.validate(true), async (req, res) => {
            try {
                await UserLogic.create(req.body);
                res.status(200).send();
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.post('/login', this.RequestBodySchemaValidator.validate(true), async (req, res) => {
            try {
                await UserLogic.login(req.body, req.sessionID);
                req.session.username = req.body.username;
                res.json(req.body.username);
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.post('/logout', this.checkAuthenticatedMiddleware, async (req, res) => {
            const sessionId = req.sessionID;
            const username = req.session.username;
            req.session.username = null;
            req.session.destroy(); // Should remove the user's cookie.
            await UserLogic.logout(username, sessionId);
            res.status(200).send();
        });

        app.get('/loginWithSession', this.checkAuthenticatedMiddleware, async (req, res) => {
            res.status(200).send(req.session.username);
        });
    }
}

module.exports = (app) => new UserRoutes(app);
