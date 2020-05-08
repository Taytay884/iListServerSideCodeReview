const Routes = require('./Routes');
const ListLogic = require('../logic/ListLogic');

class ListRoutes extends Routes {
    constructor(app) {
        super();
        this.init(app);
    }

    init(app) {
        app.get('/list/:listUuid', this.checkAuthenticatedMiddleware, this.RequestParamsSchemaValidator.validate(true), async (req, res) => {
            try {
                const list = await ListLogic.getList(req.params.listUuid);
                res.json(list);
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.post('/list', this.checkAuthenticatedMiddleware, this.RequestBodySchemaValidator.validate(true), async (req, res) => {
            try {
                const list = await ListLogic.addList(req.body, req.session.username);
                res.json(list);
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.get('/list', this.checkAuthenticatedMiddleware, async (req, res) => {
            try {
                const lists = await ListLogic.getLists(req.session.username);
                res.json(lists);
            } catch (err) {
                this.respondError(res, err);
            }
        });

        // delete the entire list as an owner.
        app.delete('/list/:listUuid', this.checkAuthenticatedMiddleware, this.RequestParamsSchemaValidator.validate(true), async (req, res) => {
            try {
                await ListLogic.deleteList(req.params.listUuid, req.session.username);
                res.send();
            } catch (err) {
                this.respondError(res, err);
            }
        });

        // stop collaborating to a list.
        app.delete('/list/collaborate/:listUuid', this.checkAuthenticatedMiddleware, this.RequestParamsSchemaValidator.validate(true), async (req, res) => {
            try {
                await ListLogic.removeListCollaborator(req.params.listUuid, req.session.username);
                res.send();
            } catch (err) {
                this.respondError(res, err);
            }
        });
    }
}

module.exports = (app) => new ListRoutes(app);
