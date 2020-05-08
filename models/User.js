const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    loggedInUserSessionId: {type: String, optional: true},
    lists: {type: [{type: String, required: true, ref: 'List'}], default: []},
    invitations: {type: [{ type: Schema.Types.ObjectId, ref: 'Invitation' }], default: []}
});

UserSchema.pre('save', async function () {
    return new Promise((resolve, reject) => {
        const user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return resolve();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) return reject(err);

            // hash the password using our new salt
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return reject(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                resolve();
            });
        });
    });
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
            if (err) return reject(err);
            return resolve(isMatch);
        });
    });
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
