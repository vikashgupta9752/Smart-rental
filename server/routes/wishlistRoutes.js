const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Toggle wishlist (add/remove)
router.post('/:propertyId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const propertyId = req.params.propertyId;
        const idx = user.wishlist.indexOf(propertyId);

        if (idx > -1) {
            user.wishlist.splice(idx, 1);
            await user.save();
            res.json({ wishlisted: false, wishlist: user.wishlist });
        } else {
            user.wishlist.push(propertyId);
            await user.save();
            res.json({ wishlisted: true, wishlist: user.wishlist });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user's wishlist (populated)
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            populate: { path: 'owner', select: 'name avatar' }
        });
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
