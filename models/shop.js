const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryEnum = [
    'smartphones', 'laptops', 'televisions', 'cameras', 'audio-devices', // Electronics
    "mens-wear", "womens-wear", "kids-wear", "footwear", "accessories", // Fashion
    'fresh-fruits', 'fresh-vegetables', 'dairy-products', 'beverages', 'snacks', // Groceries
    'cleaning-services', 'home-repairs', 'personal-care', 'pet-care', 'consulting', // Services
    'residential', 'commercial', 'land', 'rental-properties', 'property-management', // Real Estate
    'cars', 'spare-parts', 'motorcycles', 'car-accessories', 'car-services', // Automotive
    'budget-hotels', 'luxury-hotels', 'beach-resorts', 'business-hotels', 'family-friendly', // Hotels
    'flights', 'tour-packages', 'cruise-trips', 'adventure-travel', 'visa-services', // Travel
    'furniture', 'kitchenware', 'decor', 'bedding', 'appliances', // Home & Furniture
    'fitness-equipment', 'team-sports', 'outdoor-gear', 'yoga', 'cycling', // Sports & Fitness
    'fiction', 'non-fiction', 'educational', 'office-supplies', 'art-supplies', // Books & Stationery
    'fitness', 'personal-care', 'nutrition', 'medical-supplies', 'wellness-products' // Health & Wellness
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
        enum: categoryEnum, // Use the array defined above
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