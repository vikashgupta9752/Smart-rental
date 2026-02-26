const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property_rental');
        const user = await User.findOne({ email: 'vikashgupta67429@gmail.com' });
        if (user) {
            console.log('User found:', {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            console.log('User NOT found: vikashgupta67429@gmail.com');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
