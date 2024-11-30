const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

const shopSchema = new Schema({
    images: [ImageSchema],
    itemName: String,
    category: {
        type: String,
        enum: ['phones', 'computers', 'accessories', 'men', 'women', 'children', 'fruits', 'vegetables', 'dairy', '',],
        lowercase: true
    },
    uploadedUser: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        },],
    price: Number,
    description: String,
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Shop', shopSchema)