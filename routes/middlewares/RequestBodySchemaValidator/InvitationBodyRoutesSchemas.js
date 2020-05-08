// load Joi module
const Joi = require('joi');

const mongoObjectID =Joi.string().regex(/^[0-9a-fA-F]{24}$/);
const uuid = Joi.string().guid({version: 'uuidv4'});
const username = Joi.string().min(4);

const inviteUserToListSchema = Joi.object({
    listId: uuid.required(),
    invitedUsername: username.required(),
});

const invitationAcceptDeclineSchema = Joi.object({
    invitationId: mongoObjectID.required()
});

// export the schemas
module.exports = {
    '/invite': inviteUserToListSchema,
    '/invitation/accept': invitationAcceptDeclineSchema,
    '/invitation/decline': invitationAcceptDeclineSchema,
};
