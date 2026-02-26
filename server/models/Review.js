const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 }
}, { timestamps: true });

// Prevent duplicate reviews from same user on same property
reviewSchema.index({ property: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
