mongoose = require('mongoose');
const {isUuid} = require('uuidv4');
const Schema = mongoose.Schema;
const User = require('../models/User');
const ListItem = require('../models/ListItem');

const ListSchema = new Schema({
    _id: {type: String, validate: isUuid, required: true},
    name: {type: String, required: true},
    author: {type: String, required: true},
    items: {type: [{type: String, ref: 'ListItem'}], default: []},
    created_date: {type: Date, required: true},
    users: {type: [{type: Schema.Types.ObjectId, ref: 'User'}], required: true},
    invitations: {type: [{type: Schema.Types.ObjectId, ref: 'Invitation'}], default: []}
});

ListSchema.pre('remove', async function () {
    const populatedListDocument = await this.populate('invitations').execPopulate();
    await User.updateMany({_id: {$in: this.users}}, {$pull: {lists: this._id}});
    await ListItem.deleteMany({_id: {$in: this.items}});
    for (const index in populatedListDocument.invitations) {
        if (populatedListDocument.invitations.hasOwnProperty(index)) {
            const invitationDocument = populatedListDocument.invitations[index];
            await invitationDocument.remove();
        }
    }
});

const List = mongoose.model('List', ListSchema);

module.exports = List;
