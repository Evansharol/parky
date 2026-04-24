/**
 * controllers/parkingController.js – CRUD for parking space listings
 */
const ParkingSpace = require('../models/ParkingSpace');
const Booking = require('../models/Booking');

// GET /api/parking – list approved spaces with filters
exports.getSpaces = async (req, res, next) => {
  try {
    const { vehicleType, minPrice, maxPrice, lat, lng, radius = 10, search } = req.query;

    let filter = { status: 'approved' };

    // Vehicle type filter
    if (vehicleType) filter.vehicleTypes = { $in: [vehicleType, 'both'] };

    // Price range filter
    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }

    // Text search on title/address
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    let spaces;

    // Geospatial search if lat/lng provided
    if (lat && lng) {
      spaces = await ParkingSpace.find({
        ...filter,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: Number(radius) * 1000, // convert km to meters
          },
        },
      }).populate('host', 'name avatar');
    } else {
      spaces = await ParkingSpace.find(filter)
        .populate('host', 'name avatar')
        .sort('-createdAt')
        .limit(50);
    }

    res.json({ success: true, count: spaces.length, spaces });
  } catch (err) {
    next(err);
  }
};

// GET /api/parking/:id
exports.getSpaceById = async (req, res, next) => {
  try {
    const space = await ParkingSpace.findById(req.params.id).populate('host', 'name email avatar phone');
    if (!space) return res.status(404).json({ success: false, message: 'Parking space not found' });
    res.json({ success: true, space });
  } catch (err) {
    next(err);
  }
};

// POST /api/parking – host creates listing
exports.createSpace = async (req, res, next) => {
  try {
    const { title, description, address, coordinates, pricePerHour, vehicleTypes, totalSlots, timeSlots } = req.body;

    const space = await ParkingSpace.create({
      host: req.user._id,
      title,
      description,
      address,
      location: { type: 'Point', coordinates }, // [lng, lat]
      pricePerHour,
      vehicleTypes,
      totalSlots,
      availableSlots: totalSlots,
      timeSlots,
      images: req.body.images || [],
      status: 'pending', // needs admin approval
    });

    res.status(201).json({ success: true, space });
  } catch (err) {
    next(err);
  }
};

// PUT /api/parking/:id
exports.updateSpace = async (req, res, next) => {
  try {
    let space = await ParkingSpace.findById(req.params.id);
    if (!space) return res.status(404).json({ success: false, message: 'Not found' });
    if (space.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    space = await ParkingSpace.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, space });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/parking/:id
exports.deleteSpace = async (req, res, next) => {
  try {
    const space = await ParkingSpace.findById(req.params.id);
    if (!space) return res.status(404).json({ success: false, message: 'Not found' });
    if (space.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await space.deleteOne();
    res.json({ success: true, message: 'Parking space removed' });
  } catch (err) {
    next(err);
  }
};

// GET /api/parking/host/mine – host's own listings
exports.getMySpaces = async (req, res, next) => {
  try {
    const spaces = await ParkingSpace.find({ host: req.user._id }).sort('-createdAt');
    res.json({ success: true, spaces });
  } catch (err) {
    next(err);
  }
};
