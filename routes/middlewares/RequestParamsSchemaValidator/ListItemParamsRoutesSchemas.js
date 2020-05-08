// load Joi module
const Joi = require('joi');

const uuid = Joi.string().guid({version: 'uuidv4'});

const getListItemsSchema = Joi.object({
    listUuid: uuid.required()
});

const getListItemSchema = Joi.object({
    listItemUuid: uuid.required()
});

const addListItemSchema = Joi.object({
    listUuid: uuid.required()
});

const deleteListItemSchema = Joi.object({
    listId: uuid.required(),
    listItemId: uuid.required()
});


// export the schemas
module.exports = {
    '/listItems/:listUuid': getListItemsSchema,
    '/listItem/:listItemUuid': getListItemSchema,
    '/listItem/:listUuid': addListItemSchema,
    '/listItem/:listId/:listItemId': deleteListItemSchema,
};
