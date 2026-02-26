const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

// POST create a review
router.post('/', protect, authorize('customer', 'admin'), async (req, res) => {
    try {
        const { propertyId, rating, comment } = req.body;
        if (!propertyId || !rating || !comment) {
            return res.status(400).json({ error: 'propertyId, rating, and comment are required' });
        }

        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        const review = new Review({
            property: propertyId,
            user: req.user._id,
            rating: Number(rating),
            comment
        });
        await review.save();

        // Update property rating aggregates
        const allReviews = await Review.find({ property: propertyId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        property.rating = Math.round(avgRating * 10) / 10;
        property.reviewCount = allReviews.length;
        await property.save();

        const populated = await Review.findById(review._id).populate('user', 'name avatar');
        res.status(201).json(populated);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'You have already reviewed this property' });
        }
        res.status(500).json({ error: error.message });
    }
});

// GET reviews for a property
router.get('/:propertyId', async (req, res) => {
    try {
        const reviews = await Review.find({ property: req.params.propertyId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all reviews (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name avatar')
            .populate('property', 'title')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
