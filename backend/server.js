/**
 * server.js – Entry point for the Parky backend
 * Configures Express, connects to MongoDB, and mounts all API routes.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const parkingRoutes = require('./routes/parking');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/uploads');

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: '*' }));           // Allow all origins in dev
app.use(morgan('dev'));                   // Request logging
app.use(express.json());                  // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Serve uploaded and static images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Parky API running 🚗' }));

// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Parky server running on port ${PORT}`));
