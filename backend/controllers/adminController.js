/**
 * controllers/adminController.js – Admin dashboard and moderation
 */
const User = require('../models/User');
const ParkingSpace = require('../models/ParkingSpace');
const Booking = require('../models/Booking');
const Dispute = require('../models/Dispute');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalHosts, totalSpaces, totalBookings, disputes] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'host' }),
      ParkingSpace.countDocuments(),
      Booking.countDocuments(),
      Dispute.countDocuments({ status: 'open' }),
    ]);

    // Revenue calculation
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly booking trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTrend = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } },
    ]);

    // Pending listings count
    const pendingListings = await ParkingSpace.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      stats: { totalUsers, totalHosts, totalSpaces, totalBookings, totalRevenue, openDisputes: disputes, pendingListings },
      monthlyTrend,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/listings
exports.getAllListings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const listings = await ParkingSpace.find(filter)
      .populate('host', 'name email')
      .sort('-createdAt');
    res.json({ success: true, listings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/listings/:id/approve
exports.approveListing = async (req, res, next) => {
  try {
    const space = await ParkingSpace.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!space) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, space });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/listings/:id/reject
exports.rejectListing = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const space = await ParkingSpace.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );
    if (!space) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, space });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, flagged } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (flagged === 'true') filter.isFlagged = true;

    const bookings = await Booking.find(filter)
      .populate('customer', 'name email')
      .populate('host', 'name email')
      .populate('parkingSpace', 'title address')
      .sort('-createdAt')
      .limit(100);

    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/disputes
exports.getAllDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find()
      .populate('raisedBy', 'name email')
      .populate('booking')
      .sort('-createdAt');
    res.json({ success: true, disputes });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/disputes/:id
exports.resolveDispute = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, resolvedBy: req.user._id, resolvedAt: new Date() },
      { new: true }
    );
    if (!dispute) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, dispute });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort('-createdAt');
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/ban
exports.banUser = async (req, res, next) => {
  try {
    const { isBanned } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/listings/:id/flag
exports.flagListing = async (req, res, next) => {
  try {
    const { flagReason } = req.body;
    const space = await ParkingSpace.findByIdAndUpdate(
      req.params.id,
      { isFlagged: true, flagReason },
      { new: true }
    );
    res.json({ success: true, space });
  } catch (err) {
    next(err);
  }
};
