/**
 * models/User.js – User schema for all roles (customer, host, admin)
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['customer', 'host', 'admin'], default: 'customer' },
    phone: { type: String, trim: true },
    avatar: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    // Host-specific fields
    hostApproved: { type: Boolean, default: false },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password helper
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
