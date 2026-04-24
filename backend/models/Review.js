/**
 * models/Review.js – Review schema linked to a completed booking
 */
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parkingSpace: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpace', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', ReviewSchema);
