const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

const UserSchema = new Schema({
    profilePicture: [ImageSchema],
    email: {
        type: String,
        required: true,
        unique: true
    },
    accountType: {
        type: String,
        required: true,
        enum: ['user', 'business', 'admin'],
        default: 'user'
    },
    address: {
        type: String
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);