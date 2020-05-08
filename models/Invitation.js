mongoose = require('mongoose');
const {isUuid} = require('uuidv4');
const User = require('../models/User');
const List = require('../models/List');

const InvitationSchema = new mongoose.Schema({
    list: {type: String, validate: isUuid, required: true, ref: 'List'},
    sender: {type: String, required: true},
    recipient: {type: String, required: true},
    created_date: {type: Date, default: new Date(), optional: true}
});

InvitationSchema.index({listId: 1, sender: 1, recipient: 1}, {unique: true});

InvitationSchema.pre('remove', async function () {
    await User.updateOne({username: this.recipient}, {$pull: {invitations: this._id}});
});

InvitationSchema.post('save', async function () {
    await List.updateOne({_id: this.list}, {$push: {invitations: this._id}});
});

const Invitation = mongoose.model('Invitation', InvitationSchema);

module.exports = Invitation;
