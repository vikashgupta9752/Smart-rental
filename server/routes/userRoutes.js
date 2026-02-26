const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all users (for admin panel)
// @route   GET /api/users
// @access  Admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc    Update user verification status
// @route   PUT /api/users/:id/verify
// @access  Admin only
router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
    try {
        const { status, notes } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.verificationStatus = status; // 'verified', 'rejected', 'pending'
        if (notes) user.verificationData.notes = notes;
        await user.save();

        res.json({ message: `User verification marked as ${status}`, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc    Toggle user block status
// @route   PUT /api/users/:id/block
// @access  Admin only
router.put('/:id/block', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc    Toggle user flagged status
// @route   PUT /api/users/:id/flag
// @access  Admin only
router.put('/:id/flag', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.isFlagged = !user.isFlagged;
        await user.save();

        res.json({ message: `User ${user.isFlagged ? 'flagged' : 'unflagged'}`, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
