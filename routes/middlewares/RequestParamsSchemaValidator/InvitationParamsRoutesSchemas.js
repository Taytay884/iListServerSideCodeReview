// load Joi module
const Joi = require('joi');

const uuid = Joi.string().guid({version: 'uuidv4'});

const invitationAcceptSchema = Joi.object({
    invitationId: uuid.required()
});

// export the schemas
module.exports = {
    '/invitation/accept': invitationAcceptSchema,
};
