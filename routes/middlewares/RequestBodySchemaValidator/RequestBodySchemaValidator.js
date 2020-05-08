const InvitationSchemas = require('./InvitationBodyRoutesSchemas');
const ListSchemas = require('./ListBodyRoutesSchemas');
const ListItemSchemas = require('./ListItemBodyRoutesSchemas');
const UserSchemas = require('./UserBodyRoutesSchemas');
const RequestSchemaValidator = require('../RequestSchemaValidator');
const schemas = {...InvitationSchemas, ...ListSchemas, ...ListItemSchemas, ...UserSchemas};
module.exports = new RequestSchemaValidator(schemas, 'body');
