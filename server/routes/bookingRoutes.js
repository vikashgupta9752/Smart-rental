const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const User = require('../models/User');
const Booking = require('../models/Booking');
const BookingScheduler = require('../dsa/BookingScheduler');
const DynamicPricing = require('../dsa/DynamicPricing');
const { protect, authorize } = require('../middleware/auth');

// POST create booking
router.post('/', protect, authorize('customer', 'admin'), async (req, res) => {
    const { propertyId, checkIn, checkOut, guests } = req.body;
    const customerId = req.user._id;
    try {
        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate <= checkInDate) {
            return res.status(400).json({ error: 'Check-out must be after check-in' });
        }

        if (guests && guests > property.maxGuests) {
            return res.status(400).json({ error: `Max guests allowed: ${property.maxGuests}` });
        }

        // Check for booking conflicts
        const existingBookings = await Booking.find({
            property: propertyId,
            status: { $in: ['confirmed', 'pending'] }
        });

        const hasConflict = existingBookings.some(b => {
            return checkInDate < b.checkOut && checkOutDate > b.checkIn;
        });

        if (hasConflict) {
            return res.status(400).json({ error: 'Property is already booked for these dates' });
        }

        // Calculate nights and total price (Simplified - no fees as per user request)
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 1;
        const totalPrice = property.price * nights;

        const booking = new Booking({
            property: propertyId,
            customer: customerId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guests || 1,
            totalPrice
        });
        await booking.save();

        // Update property demand/pricing
        property.score += 1;
        const newPrice = DynamicPricing.calculatePrice(property.price, property.score, 0.5);
        property.price = newPrice;
        property.pricingHistory.push({ price: newPrice });
        await property.save();

        const populated = await Booking.findById(booking._id).populate('property', 'title images location price');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user's bookings
router.get('/my', protect, async (req, res) => {
    try {
        const bookings = await Booking.find({ customer: req.user._id })
            .populate('property', 'title images location price type')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET availability for a property
router.get('/availability/:propertyId', async (req, res) => {
    try {
        const bookings = await Booking.find({
            property: req.params.propertyId,
            status: { $in: ['confirmed', 'pending'] },
            checkOut: { $gte: new Date() }
        }).select('checkIn checkOut');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update booking status
router.put('/:id/status', protect, async (req, res) => {
    const { status } = req.body;
    if (!['confirmed', 'cancelled', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    try {
        const booking = await Booking.findById(req.params.id).populate('property');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // Check ownership or admin
        const isAdmin = req.user.role === 'admin';
        const isOwner = booking.property?.owner?.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ error: 'Not authorized to update this booking' });
        }

        booking.status = status;
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
