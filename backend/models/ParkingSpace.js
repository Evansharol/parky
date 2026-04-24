/**
 * models/ParkingSpace.js – Parking space listing schema
 */
const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], required: true },
  open: { type: String, required: true },   // "08:00"
  close: { type: String, required: true },  // "20:00"
});

const ParkingSpaceSchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, required: true },
    // GeoJSON location for geospatial queries
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    pricePerHour: { type: Number, required: true, min: 0 },
    vehicleTypes: {
      type: [String],
      enum: ['bike', 'car', 'both'],
      default: ['car'],
    },
    totalSlots: { type: Number, default: 1, min: 1 },
    availableSlots: { type: Number, default: 1, min: 0 },
    // Features
    isEVCharging: { type: Boolean, default: false },
    isSecurityGuard: { type: Boolean, default: false },
    images: [{ type: String }], // array of image URLs
    timeSlots: [TimeSlotSchema],
    // Admin approval status
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
    // Stats
    totalBookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create 2dsphere index for geospatial queries
ParkingSpaceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ParkingSpace', ParkingSpaceSchema);
