const ListSchemas = require('./ListParamsRoutesSchemas');
const ListItemSchemas = require('./ListItemParamsRoutesSchemas');
const InvitationSchemas = require('./InvitationParamsRoutesSchemas');
const RequestSchemaValidator = require('../RequestSchemaValidator');
const schemas = {...ListSchemas, ...ListItemSchemas, ...InvitationSchemas};
module.exports = new RequestSchemaValidator(schemas, 'params');
