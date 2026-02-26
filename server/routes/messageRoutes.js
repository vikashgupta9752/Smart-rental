const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// POST send a message
router.post('/', protect, async (req, res) => {
    try {
        const { receiverId, content, bookingId, propertyId } = req.body;
        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Receiver and content are required' });
        }

        const message = new Message({
            sender: req.user._id,
            receiver: receiverId,
            booking: bookingId,
            property: propertyId,
            content
        });

        await message.save();
        const populated = await Message.findById(message._id)
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar')
            .populate('property', 'title');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET conversation with a specific user
router.get('/:userId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user._id }
            ]
        })
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all conversations for the current user (Alternative endpoint for frontend)
router.get('/', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        })
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar')
            .sort({ createdAt: -1 });

        const conversations = {};
        messages.forEach(m => {
            if (!m.sender || !m.receiver) return;
            const otherUser = m.sender._id.toString() === req.user._id.toString() ? m.receiver : m.sender;
            const otherUserId = otherUser._id.toString();
            if (!conversations[otherUserId]) {
                conversations[otherUserId] = {
                    participant: otherUser,
                    lastMessage: {
                        content: m.content,
                        createdAt: m.createdAt
                    },
                    _id: otherUserId // Use otherUserId as key for frontend mapping
                };
            }
        });

        res.json(Object.values(conversations));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/conversations/all', protect, async (req, res) => {
    // Keep this for compatibility, but it will now return the new format
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        })
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar')
            .sort({ createdAt: -1 });

        const conversations = {};
        messages.forEach(m => {
            if (!m.sender || !m.receiver) return;
            const otherUser = m.sender._id.toString() === req.user._id.toString() ? m.receiver : m.sender;
            const otherUserId = otherUser._id.toString();
            if (!conversations[otherUserId]) {
                conversations[otherUserId] = {
                    participant: otherUser,
                    lastMessage: {
                        content: m.content,
                        createdAt: m.createdAt
                    },
                    _id: otherUserId
                };
            }
        });

        res.json(Object.values(conversations));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
