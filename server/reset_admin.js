const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const reset = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property_rental');
        const user = await User.findOne({ email: 'vikashgupta67429@gmail.com' });
        if (user) {
            user.password = 'Admin@123';
            await user.save();
            console.log('Password successfully reset for vikashgupta67429@gmail.com to Admin@123');
        } else {
            console.log('User not found. Creating a new admin user...');
            const newUser = new User({
                name: 'Vikash',
                email: 'vikashgupta67429@gmail.com',
                password: 'Admin@123',
                role: 'admin'
            });
            await newUser.save();
            console.log('Admin user created successfully.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

reset();
