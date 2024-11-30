const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

const feedSchema = new Schema({
    images: [ImageSchema],
    itemName: String,
    uploadedUser: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    price: Number,
    description: String,
    comments: [
        { type: Schema.Types.ObjectId, ref: 'Comment' }
    ],
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now // Automatically set createdAt to the current date/time
    }
})

module.exports = mongoose.model('Feed', feedSchema)