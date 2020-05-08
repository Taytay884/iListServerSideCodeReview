const Routes = require('./Routes');
const ListItemLogic = require('../logic/ListItemLogic');

class ListItemRoutes extends Routes {
    constructor(app) {
        super();
        this.init(app);
    }

    init(app) {
        app.get('/listItems/:listUuid', this.checkAuthenticatedMiddleware, this.RequestParamsSchemaValidator.validate(true), async (req, res) => {
            try {
                const listItems = await ListItemLogic.getListItems(req.params.listUuid);
                res.json(listItems);
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.get('/listItem/:listItemUuid', this.checkAuthenticatedMiddleware, this.RequestParamsSchemaValidator.validate(true), async (req, res) => {
            try {
                const listItem = await ListItemLogic.getListItem(req.params.listItemUuid, req.session.username);
                res.json(listItem);
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.post('/listItem/:listUuid', this.checkAuthenticatedMiddleware, this.RequestParamsSchemaValidator.validate(true), this.RequestBodySchemaValidator.validate(true), async (req, res) => {
            try {
                const listItem = await ListItemLogic.addListItem(req.body, req.params.listUuid);
                res.json(listItem);
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.delete('/listItem/:listId/:listItemId', this.checkAuthenticatedMiddleware, this.RequestParamsSchemaValidator.validate(true), async (req, res) => {
            try {
                const updatedList = await ListItemLogic.removeListItem({
                    listId: req.params.listId,
                    listItemId: req.params.listItemId
                });
                res.json(updatedList);
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.put('/listItem', this.checkAuthenticatedMiddleware, this.RequestBodySchemaValidator.validate(true), async (req, res) => {
            try {
                await ListItemLogic.updateListItem(req.body);
                res.status(200).send();
            } catch (err) {
                this.respondError(res, err);
            }
        });
    }
}

module.exports = (app) => new ListItemRoutes(app);
