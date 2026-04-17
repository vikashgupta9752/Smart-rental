const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');
const statsRoutes = require('./routes/statsRoutes');
const walletRoutes = require('./routes/walletRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const messageRoutes = require('./routes/messageRoutes');
const userRoutes = require('./routes/userRoutes');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Main entry point
app.get('/', (req, res) => {
    res.send('Smart Micro-Rental API is running...');
});

// Database connection
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        const adminEmail = 'vikashgupta67429@gmail.com';
        const existing = await User.findOne({ email: adminEmail });
        if (!existing) {
            await User.create({
                name: 'Vikash Gupta',
                email: adminEmail,
                password: 'Admin@123',
                role: 'admin'
            });
            console.log('Admin account seeded successfully');
        } else if (existing.role !== 'admin') {
            existing.role = 'admin';
            await existing.save();
            console.log('Admin role restored');
        }
    } catch (err) {
        console.error('Admin seed error:', err.message);
    }
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property_rental')
    .then(() => {
        console.log('MongoDB connected');
        seedAdmin();
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
