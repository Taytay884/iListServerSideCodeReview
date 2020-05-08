const UserLogic = require("../../logic/UserLogic");

async function checkAuthenticatedMiddleware(req, res, next) {
    const respondNotAuthenticated = () => {
        req.session.destroy();
        res.status(403).send('User is not authenticated.');
    };
    if (!req.session || !req.session.username) return respondNotAuthenticated();
    if (req.session.username) {
        const isUserLoggedIn = await UserLogic.checkIsUserLoggedIn(req.session.username, req.sessionID);
        if (!isUserLoggedIn) return respondNotAuthenticated();
        next();
    }
}

module.exports = checkAuthenticatedMiddleware;
