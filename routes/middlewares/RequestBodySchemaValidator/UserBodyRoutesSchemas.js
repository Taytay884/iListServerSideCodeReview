// load Joi module
const Joi = require('joi');

const uuid = Joi.string().guid({version: 'uuidv4'});
const username = Joi.string().min(4);

const createUserSchema = Joi.object({
    username: username.required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    username: username.required(),
    password: Joi.string().min(6).required()
});

// export the schemas
module.exports = {
    '/createUser': createUserSchema,
    '/login': loginSchema,
};
