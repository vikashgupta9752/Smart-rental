const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['room', 'shop', 'parking', 'land', 'apartment', 'house', 'villa', 'studio', 'loft'], required: true },
    location: {
        id: { type: String, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        city: { type: String, default: '' },
        address: { type: String, default: '' }
    },
    price: { type: Number, required: true },
    images: [{ type: String }],
    amenities: [{ type: String }],
    maxGuests: { type: Number, default: 2 },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    pricingHistory: [{
        price: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['available', 'rented'], default: 'available' },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved' // Existing properties are approved by default
    },
    isFlagged: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    matchScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
