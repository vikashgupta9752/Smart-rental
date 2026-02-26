const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Property = require('../models/Property');
const { protect, admin } = require('../middleware/auth');

// POST submit a report (Any authenticated user)
router.post('/', protect, async (req, res) => {
    try {
        const report = new Report({
            ...req.body,
            reporter: req.user._id
        });
        await report.save();

        if (req.body.targetType === 'Property') {
            await Property.findByIdAndUpdate(req.body.targetId, { isFlagged: true });
        }

        res.status(201).json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET all reports (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('reporter', 'name email')
            .populate('targetId')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT resolve a report (Admin only)
router.put('/:id/resolve', protect, admin, async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(req.params.id, {
            status: req.body.status,
            resolutionNotes: req.body.resolutionNotes,
            resolvedBy: req.user._id
        }, { new: true });

        // If dismissed, we might want to unflag the property if no other pending reports exist
        if (req.body.status === 'dismissed' || req.body.status === 'resolved') {
            const pendingReports = await Report.countDocuments({
                targetId: report.targetId,
                status: 'pending'
            });
            if (pendingReports === 0) {
                if (report.targetType === 'Property') {
                    await Property.findByIdAndUpdate(report.targetId, { isFlagged: false });
                }
            }
        }

        res.json(report);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
