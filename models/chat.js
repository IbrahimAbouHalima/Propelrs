const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    ],
    messages: [
        {
            sender: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            body: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

module.exports = mongoose.model('Chat', chatSchema);
