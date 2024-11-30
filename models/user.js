const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    accountType: {
        type: String,
        required: true,
        enum: ['user', 'seller', 'admin'],
        default: 'user'
    },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);