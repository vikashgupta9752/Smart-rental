const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'seller', 'customer'], default: 'customer' },
    wallet: { type: Number, default: 1000 },
    isBlocked: { type: Boolean, default: false },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    verificationStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    isFlagged: { type: Boolean, default: false },
    verificationData: {
        documentUrl: { type: String, default: '' },
        requestDate: { type: Date },
        notes: { type: String, default: '' }
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
