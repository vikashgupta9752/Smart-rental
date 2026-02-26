const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Graph = require('../dsa/Graph');
const FraudDetection = require('../dsa/FraudDetection');
const { protect, authorize } = require('../middleware/auth');

// Customer Dashboard Stats
router.get('/customer', protect, authorize('customer', 'admin'), async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.user._id })
            .populate('property')
            .sort({ createdAt: -1 });

        const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const activeRentals = bookings.filter(b => b.status === 'confirmed' && (b.checkOut || b.end) > Date.now()).length;

        // Spending grouped by day-of-week from real bookings
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const spendingByDay = dayNames.map(name => ({ name, spend: 0 }));
        bookings.forEach(b => {
            const day = new Date(b.createdAt).getDay();
            spendingByDay[day].spend += b.totalPrice;
        });

        // Booking type distribution from real data
        const typeDistribution = {};
        let totalTypeCount = 0;
        bookings.forEach(b => {
            if (b.property) {
                const type = b.property.type || 'Other';
                typeDistribution[type] = (typeDistribution[type] || 0) + 1;
                totalTypeCount++;
            }
        });

        // Convert to percentages
        const typeBreakdown = Object.entries(typeDistribution).map(([type, count]) => ({
            type,
            count,
            percentage: totalTypeCount > 0 ? Math.round((count / totalTypeCount) * 100) : 0
        })).sort((a, b) => b.percentage - a.percentage);

        // Total hours booked
        const totalHours = bookings.reduce((sum, b) => {
            const checkIn = b.checkIn || b.start;
            const checkOut = b.checkOut || b.end;
            const hours = (checkOut - checkIn) / (1000 * 60 * 60);
            return sum + (hours > 0 ? hours : 0);
        }, 0);

        // Unique properties visited
        const uniqueProperties = new Set(bookings.map(b => b.property?._id?.toString()).filter(Boolean)).size;

        // Simple recommendation: most frequent type
        const typeCounts = {};
        bookings.forEach(b => {
            if (b.property) {
                typeCounts[b.property.type] = (typeCounts[b.property.type] || 0) + 1;
            }
        });
        const favType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0];
        const recommendations = favType ? await Property.find({ type: favType }).limit(4) : await Property.find().limit(4);

        // Format bookings for frontend
        const formattedBookings = bookings.map(b => ({
            _id: b._id,
            id: `BK-${b._id.toString().slice(-4).toUpperCase()}`,
            property: b.property?.title || 'Deleted Property',
            propertyId: b.property?._id,
            type: b.property?.type || 'Unknown',
            location: b.property?.location?.id || 'N/A',
            date: new Date(b.createdAt).toISOString().split('T')[0],
            startTime: new Date(b.checkIn || b.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
            endTime: new Date(b.checkOut || b.end).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
            status: b.status,
            price: b.totalPrice,
            createdAt: b.createdAt
        }));

        // Fetch review and wishlist counts
        const reviewsGiven = await Review.countDocuments({ user: req.user._id });
        const wishlistCount = req.user.wishlist?.length || 0;

        res.json({
            totalBookings: bookings.length,
            totalSpent,
            activeRentals,
            totalHours: Math.round(totalHours * 10) / 10,
            uniqueProperties,
            spendingByDay,
            typeBreakdown,
            bookings: formattedBookings,
            recommendations,
            wallet: req.user.wallet,
            reviewsGiven,
            wishlistCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Seller Dashboard Stats
router.get('/seller', protect, authorize('seller', 'admin'), async (req, res) => {
    try {
        const properties = await Property.find({ owner: req.user._id });
        const propertyIds = properties.map(p => p._id);
        const bookings = await Booking.find({ property: { $in: propertyIds } });

        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const occupancyRate = properties.length > 0 ? (bookings.length / (properties.length * 10)) : 0;

        const peakHours = { '10-12': 30, '14-16': 45, '18-20': 25 };

        res.json({
            totalRevenue,
            activeListings: properties.length,
            occupancyRate,
            peakHours,
            properties
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Dashboard & Fraud Graph
router.get('/admin', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.countDocuments();
        const properties = await Property.countDocuments();
        const bookings = await Booking.find().populate('customer').populate('property');

        // Only confirmed or completed bookings count towards revenue
        const revenue = bookings.reduce((sum, b) => {
            if (['confirmed', 'completed'].includes(b.status)) {
                return sum + Math.max(0, b.totalPrice || 0);
            }
            return sum;
        }, 0);

        const g = new Graph();
        bookings.forEach(b => {
            if (b.customer && b.property) {
                g.addNode(b.customer._id.toString(), 0, 0);
                g.addNode(b.property._id.toString(), 0, 0);
                g.addEdge(b.customer._id.toString(), b.property._id.toString(), 1);
            }
        });

        const fraudData = FraudDetection.detectAnomalies(g);

        // Get all reviews for admin overview
        const Review = require('../models/Review');
        const reviews = await Review.find().populate('user', 'name avatar').populate('property', 'title').sort({ createdAt: -1 });

        res.json({
            metrics: {
                totalUsers: users,
                totalSpaces: properties,
                totalTransactions: bookings.length,
                revenue
            },
            bookings: bookings.sort((a, b) => b.createdAt - a.createdAt),
            reviews,
            fraud: fraudData,
            graphData: g.adjacencyList
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
