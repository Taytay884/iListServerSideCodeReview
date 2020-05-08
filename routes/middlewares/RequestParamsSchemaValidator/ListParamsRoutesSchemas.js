// load Joi module
const Joi = require('joi');

const uuid = Joi.string().guid({version: 'uuidv4'});

const getDeleteListSchema = Joi.object({
    listUuid: uuid.required(),
});

// export the schemas
module.exports = {
    '/list/:listUuid': getDeleteListSchema,
    '/list/collaborate/:listUuid': getDeleteListSchema,
    '/list': getDeleteListSchema
};
