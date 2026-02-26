const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, admin } = require('../middleware/auth');

// GET active announcements (Public)
router.get('/active', async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all announcements (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create announcement (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const announcement = new Announcement({
            ...req.body,
            createdBy: req.user._id
        });
        await announcement.save();
        res.status(201).json(announcement);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update announcement (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(announcement);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE announcement (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
