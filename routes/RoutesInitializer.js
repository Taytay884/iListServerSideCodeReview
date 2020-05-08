const ListRoutes = require('./ListRoutes');
const ListItemRoutes = require('./ListItemRoutes');
const UserRoutes = require('./UserRoutes');
const InvitationRoutes = require('./InvitationRoutes');

function initializeRoutes(app) {
    ListRoutes(app);
    ListItemRoutes(app);
    UserRoutes(app);
    InvitationRoutes(app);
}

module.exports = {
    initializeRoutes
};
