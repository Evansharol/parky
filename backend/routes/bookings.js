/**
 * routes/bookings.js – Booking routes
 */
const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getHostBookings, updateBookingStatus, cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createBooking);
router.get('/my', protect, authorize('customer'), getMyBookings);
router.get('/host', protect, authorize('host'), getHostBookings);
router.put('/:id/status', protect, authorize('host'), updateBookingStatus);
router.put('/:id/cancel', protect, authorize('customer'), cancelBooking);

module.exports = router;
