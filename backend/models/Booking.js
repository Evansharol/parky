/**
 * models/Booking.js – Booking schema linking customer ↔ parking space ↔ host
 */
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parkingSpace: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpace', required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalHours: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    vehicleType: { type: String, enum: ['bike', 'car'], required: true },
    vehicleNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    // Fraud detection flags
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String },
    fraudScore: { type: Number, default: 0 }, // 0-100
    // Host rejection reason
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
