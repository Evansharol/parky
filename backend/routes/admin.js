/**
 * routes/admin.js – Admin-only routes
 */
const express = require('express');
const router = express.Router();
const {
  getDashboard, getAllListings, approveListing, rejectListing,
  getAllBookings, getAllDisputes, resolveDispute, getAllUsers, banUser, flagListing,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/listings', getAllListings);
router.put('/listings/:id/approve', approveListing);
router.put('/listings/:id/reject', rejectListing);
router.put('/listings/:id/flag', flagListing);
router.get('/bookings', getAllBookings);
router.get('/disputes', getAllDisputes);
router.put('/disputes/:id', resolveDispute);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', banUser);

module.exports = router;
