const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const commentSchema = new Schema({
    body: String,
    uploadedUser: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Comment', commentSchema)