const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Graph = require('../dsa/Graph');
const Pathfinding = require('../dsa/Pathfinding');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// Build Graph from DB
const buildGraph = async () => {
    const properties = await Property.find();
    const g = new Graph();
    properties.forEach(p => {
        g.addNode(p.location.id, p.location.x, p.location.y);
    });
    for (let i = 0; i < properties.length; i++) {
        for (let j = i + 1; j < properties.length; j++) {
            const p1 = properties[i];
            const p2 = properties[j];
            const dist = Math.sqrt(Math.pow(p1.location.x - p2.location.x, 2) + Math.pow(p1.location.y - p2.location.y, 2));
            if (dist < 50) {
                g.addEdge(p1.location.id, p2.location.id, dist);
            }
        }
    }
    return g;
};

// Search with Pathfinding
router.post('/path', protect, async (req, res) => {
    const { startId, endId, algorithm } = req.body;
    try {
        const graph = await buildGraph();
        let result;
        if (algorithm === 'astar') {
            result = Pathfinding.aStar(startId, endId, graph);
        } else {
            result = Pathfinding.dijkstra(startId, endId, graph);
        }
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all properties with filters
router.get('/', async (req, res) => {
    try {
        const { type, minPrice, maxPrice, minRating, amenities, guests, location, sort } = req.query;
        const filter = {};

        if (type) filter.type = type;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (minRating) filter.rating = { $gte: Number(minRating) };
        if (guests) filter.maxGuests = { $gte: Number(guests) };
        if (amenities) {
            const amenityList = amenities.split(',');
            filter.amenities = { $all: amenityList };
        }
        if (location) {
            filter.$or = [
                { 'location.city': { $regex: location, $options: 'i' } },
                { 'location.address': { $regex: location, $options: 'i' } },
                { title: { $regex: location, $options: 'i' } }
            ];
        }

        let sortObj = { createdAt: -1 };
        if (sort === 'price_asc') sortObj = { price: 1 };
        else if (sort === 'price_desc') sortObj = { price: -1 };
        else if (sort === 'rating') sortObj = { rating: -1 };
        else if (sort === 'newest') sortObj = { createdAt: -1 };

        // Verification filter for public view
        if (req.user?.role !== 'admin') {
            const verificationFilter = [
                { verificationStatus: 'approved' },
                { verificationStatus: { $exists: false } }
            ];

            if (filter.$or) {
                // If we already have an $or (from location search), wrap it in $and
                const existingOr = filter.$or;
                delete filter.$or;
                filter.$and = [
                    { $or: existingOr },
                    { $or: verificationFilter }
                ];
            } else {
                filter.$or = verificationFilter;
            }
        }

        const properties = await Property.find(filter).sort(sortObj).populate('owner', 'name avatar');
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single property by ID
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner', 'name avatar email phone');
        if (!property) return res.status(404).json({ error: 'Property not found' });
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create property
router.post('/', protect, authorize('seller', 'admin'), async (req, res) => {
    try {
        const property = new Property({
            ...req.body,
            owner: req.user._id,
            pricingHistory: [{ price: req.body.price }],
            score: 0,
            verificationStatus: req.user.role === 'admin' ? 'approved' : 'pending'
        });
        await property.save();
        res.status(201).json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update property
router.put('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        // Allow admin or owner
        if (req.user.role !== 'admin' && String(property.owner) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const allowedFields = ['title', 'description', 'type', 'price', 'images', 'amenities', 'maxGuests', 'bedrooms', 'bathrooms', 'location', 'status'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) property[field] = req.body[field];
        });

        // Track price change
        if (req.body.price !== undefined && req.body.price !== property.price) {
            property.pricingHistory.push({ price: req.body.price });
        }

        await property.save();
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE property
router.delete('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        if (req.user.role !== 'admin' && String(property.owner) !== String(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await Property.findByIdAndDelete(req.params.id);
        res.json({ message: 'Property deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin verify property
router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const property = await Property.findByIdAndUpdate(req.params.id, { verificationStatus: status }, { new: true });
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
