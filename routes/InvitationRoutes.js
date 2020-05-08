const Routes = require('./Routes');
const InvitationLogic = require('../logic/InvitationLogic');

class InvitationRoutes extends Routes {
    constructor(app) {
        super();
        this.init(app);
    }

    init(app) {
        // Invitation
        app.post('/invite', this.checkAuthenticatedMiddleware, this.RequestBodySchemaValidator.validate(true), async (req, res) => {
            try {
                const {invitedUsername, listId} = req.body;
                await InvitationLogic.inviteUserToList(req.session.username, invitedUsername, listId);
                res.status(200).send();
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.get('/invitations', this.checkAuthenticatedMiddleware, async (req, res) => {
            try {
                const {username} = req.session;
                const invitations = await InvitationLogic.getInvitations(username);
                res.json(invitations);
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.post('/invitation/accept', this.checkAuthenticatedMiddleware, this.RequestBodySchemaValidator.validate(true), async (req, res) => {
            try {
                const {username} = req.session;
                const {invitationId} = req.body;
                await InvitationLogic.acceptInvitation(username, invitationId);
                res.status(200).send();
            } catch (err) {
                this.respondError(res, err);
            }
        });

        app.post('/invitation/decline', this.checkAuthenticatedMiddleware, this.RequestBodySchemaValidator.validate(true), async (req, res) => {
            try {
                const {username} = req.session;
                const {invitationId} = req.body;
                await InvitationLogic.declineInvitation(username, invitationId);
                res.status(200).send();
            } catch (err) {
                this.respondError(res, err);
            }
        });
    }
}

module.exports = (app) => new InvitationRoutes(app);
