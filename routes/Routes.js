const RequestBodySchemaValidator = require('./middlewares/RequestBodySchemaValidator/RequestBodySchemaValidator');
const RequestParamsSchemaValidator = require('./middlewares/RequestParamsSchemaValidator/RequestParamsSchemaValidator');
const checkAuthenticatedMiddleware = require('./middlewares/authMiddleware');
const {respondError} = require('./RoutesUtils');

class Routes {
    constructor() {
        this.RequestBodySchemaValidator = RequestBodySchemaValidator;
        this.RequestParamsSchemaValidator = RequestParamsSchemaValidator;
        this.checkAuthenticatedMiddleware = checkAuthenticatedMiddleware;
        this.respondError = respondError;
    }
}

module.exports = Routes;
