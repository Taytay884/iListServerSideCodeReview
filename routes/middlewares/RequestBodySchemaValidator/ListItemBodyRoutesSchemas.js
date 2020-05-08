// load Joi module
const Joi = require('joi');

const uuid = Joi.string().guid({version: 'uuidv4'});
const username = Joi.string().min(4);

const updateListItemSchema = Joi.object({
    _id: uuid.required(),
    author: username.required(),
    text: Joi.string().min(4).required()
});

// export the schemas
module.exports = {
    '/listItem/:listUuid': updateListItemSchema,
    '/listItem': updateListItemSchema
};
