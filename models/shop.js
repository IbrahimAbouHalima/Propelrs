const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryEnum = [
    'smartphones', 'laptops', 'televisions', 'cameras', 'audio-devices',
    "mens-wear", "womens-wear", "kids-wear", "footwear", "accessories",
    'fresh-fruits', 'fresh-vegetables', 'dairy-products', 'beverages', 'snacks',
    'cleaning-services', 'home-repairs', 'personal-care', 'pet-care', 'consulting',
    'residential', 'commercial', 'land', 'rental-properties', 'property-management',
    'cars', 'spare-parts', 'motorcycles', 'car-accessories', 'car-services',
    'budget-hotels', 'luxury-hotels', 'beach-resorts', 'business-hotels', 'family-friendly',
    'flights', 'tour-packages', 'cruise-trips', 'adventure-travel', 'visa-services',
    'furniture', 'kitchenware', 'decor', 'bedding', 'appliances',
    'fitness-equipment', 'team-sports', 'outdoor-gear', 'yoga', 'cycling',
    'fiction', 'non-fiction', 'educational', 'office-supplies', 'art-supplies',
    'fitness', 'personal-care', 'nutrition', 'medical-supplies', 'wellness-products'
];

const ImageSchema = new Schema({
    url: String,
    filename: String
})

const shopSchema = new Schema({
    images: [ImageSchema],
    itemName: String,
    category: {
        type: String,
        enum: categoryEnum,
        required: true,
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