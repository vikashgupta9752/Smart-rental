const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Add funds to wallet
router.post('/add', protect, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        const user = await User.findById(req.user._id);
        user.wallet += amount;
        await user.save();

        res.json({ wallet: user.wallet, message: `₹${amount} added successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get wallet balance
router.get('/balance', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ wallet: user.wallet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
