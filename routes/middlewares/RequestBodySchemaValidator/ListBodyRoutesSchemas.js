// load Joi module
const Joi = require('joi');

const uuid = Joi.string().guid({version: 'uuidv4'});
const username = Joi.string().min(4);

const addListSchema = Joi.object({
    _id: uuid.required(),
    name: username.required(),
});

// export the schemas
module.exports = {
    '/list': addListSchema,
};
