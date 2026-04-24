/**
 * routes/parking.js – Parking space routes
 */
const express = require('express');
const router = express.Router();
const {
  getSpaces, getSpaceById, createSpace, updateSpace, deleteSpace, getMySpaces,
} = require('../controllers/parkingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getSpaces);                                         // Public
router.get('/host/mine', protect, authorize('host'), getMySpaces); // Host only
router.get('/:id', getSpaceById);                                   // Public
router.post('/', protect, authorize('host'), createSpace);          // Host only
router.put('/:id', protect, authorize('host'), updateSpace);        // Host only
router.delete('/:id', protect, authorize('host'), deleteSpace);     // Host only

module.exports = router;
