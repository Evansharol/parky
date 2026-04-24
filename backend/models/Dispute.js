/**
 * models/Dispute.js – Dispute raised by customer or host on a booking
 */
const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['open', 'under_review', 'resolved', 'closed'], default: 'open' },
    adminNote: { type: String, trim: true },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', DisputeSchema);
