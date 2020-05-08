mongoose = require('mongoose');
const {isUuid} = require('uuidv4');

const ListItemSchema = new mongoose.Schema({
    _id: {type: String, validate: isUuid, required: true},
    author: {type: String, required: true},
    created_date: {type: Date, required: true},
    text: {type: String, required: true}
});

const ListItem = mongoose.model('ListItem', ListItemSchema);

module.exports = ListItem;
