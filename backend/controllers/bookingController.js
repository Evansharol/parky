/**
 * controllers/bookingController.js – Booking lifecycle management
 */
const Booking = require('../models/Booking');
const ParkingSpace = require('../models/ParkingSpace');
const aiService = require('../services/aiService');

// POST /api/bookings – customer creates a booking
exports.createBooking = async (req, res, next) => {
  try {
    const { parkingSpaceId, startTime, endTime, vehicleType, vehicleNumber } = req.body;

    const space = await ParkingSpace.findById(parkingSpaceId);
    if (!space) return res.status(404).json({ success: false, message: 'Parking space not found' });
    if (space.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Space is not available for booking' });
    }
    if (space.availableSlots <= 0) {
      return res.status(400).json({ success: false, message: 'No slots available' });
    }

    // Calculate total hours and amount
    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalHours = Math.ceil((end - start) / (1000 * 60 * 60));
    if (totalHours <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid time range' });
    }
    const totalAmount = totalHours * space.pricePerHour;

    // Run fraud detection
    const fraudResult = await aiService.checkFraud({
      customerId: req.user._id,
      createdAt: req.user.createdAt,
      totalAmount,
    });

    const booking = await Booking.create({
      customer: req.user._id,
      parkingSpace: parkingSpaceId,
      host: space.host,
      startTime: start,
      endTime: end,
      totalHours,
      totalAmount,
      vehicleType,
      vehicleNumber,
      isFlagged: fraudResult.isFlagged,
      flagReason: fraudResult.reason,
      fraudScore: fraudResult.score,
    });

    // Decrement available slots
    await ParkingSpace.findByIdAndUpdate(parkingSpaceId, { $inc: { availableSlots: -1 } });

    const populated = await Booking.findById(booking._id)
      .populate('parkingSpace', 'title address pricePerHour')
      .populate('host', 'name email');

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my – customer's booking history
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('parkingSpace', 'title address images pricePerHour')
      .populate('host', 'name email phone')
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/host – host's incoming requests
exports.getHostBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ host: req.user._id })
      .populate('parkingSpace', 'title address')
      .populate('customer', 'name email phone avatar')
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id/status – host accepts or rejects
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const allowedStatuses = ['confirmed', 'rejected', 'completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Restore slot if rejected
    if (status === 'rejected' && booking.status !== 'rejected') {
      await ParkingSpace.findByIdAndUpdate(booking.parkingSpace, { $inc: { availableSlots: 1 } });
    }

    booking.status = status;
    if (rejectionReason) booking.rejectionReason = rejectionReason;

    // Track revenue for host on completion
    if (status === 'completed') {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, { $inc: { totalEarnings: booking.totalAmount } });
      await ParkingSpace.findByIdAndUpdate(booking.parkingSpace, {
        $inc: { totalBookings: 1, totalRevenue: booking.totalAmount },
      });
    }

    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// PUT /api/bookings/:id/cancel – customer cancels
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Restore slot
    await ParkingSpace.findByIdAndUpdate(booking.parkingSpace, { $inc: { availableSlots: 1 } });

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};
