const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const businessSchema = new Schema({
    businessName: {
        type: String,
        required: true
    },
    businessLogo: {
        type: String,
        required: false
    },
    businessIndustry: {
        type: String,
        enum: [
            'Fashion',
            'Electronics',
            'Health & Beauty',
            'Home & Garden',
            'Food & Beverage',
            'Groceries',
            'Services',
            'Real Estate',
            'Automotive',
            'Hotels',
            'Travel',
            'Home & Furniture',
            'Sports & Fitness',
            'Books & Stationery',
            'Health & Wellness'
        ],
        required: true
    },
    businessDescription: {
        type: String,
        required: true
    },
    businessOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Business', businessSchema)