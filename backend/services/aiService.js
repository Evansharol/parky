/**
 * services/aiService.js – Rule-based AI features
 *
 * Features:
 * 1. Availability Prediction – based on booking history for a slot
 * 2. Price Recommendation – based on nearby space averages + demand
 * 3. Smart Search – keyword extraction to structured filters
 * 4. Fraud Detection – scoring suspicious booking signals
 */
const Booking = require('../models/Booking');
const ParkingSpace = require('../models/ParkingSpace');

// ── 1. Availability Prediction ──────────────────────────────────────────────
/**
 * Predicts how busy a parking space will be at a given datetime.
 * Returns: { level: 'high'|'medium'|'low', confidence: 0-100, message }
 */
exports.predictAvailability = async ({ spaceId, datetime }) => {
  const targetDate = new Date(datetime);
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
  const hour = targetDate.getHours();

  // Count bookings on the same day-of-week & overlapping hour in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const historicalBookings = await Booking.countDocuments({
    parkingSpace: spaceId,
    status: { $in: ['confirmed', 'completed'] },
    createdAt: { $gte: thirtyDaysAgo },
    startTime: {
      $gte: new Date(targetDate.setHours(hour - 1)),
      $lte: new Date(targetDate.setHours(hour + 1)),
    },
  });

  // Simple demand tiers
  let level, confidence, message;
  if (historicalBookings >= 8) {
    level = 'high'; confidence = 90;
    message = 'Very busy at this time – book quickly!';
  } else if (historicalBookings >= 4) {
    level = 'medium'; confidence = 65;
    message = 'Moderate demand – available but filling up';
  } else {
    level = 'low'; confidence = 40;
    message = 'Usually quiet at this time – slots available';
  }

  return { level, confidence, message, historicalBookings };
};

// ── 2. Price Recommendation ─────────────────────────────────────────────────
/**
 * Suggests an optimal price per hour for a new listing.
 * Returns: { suggestedPrice, avgNearby, demandMultiplier, reasoning }
 */
exports.suggestPrice = async ({ lat, lng, vehicleType, radius = 5 }) => {
  let nearbySpaces = [];

  if (lat && lng) {
    nearbySpaces = await ParkingSpace.find({
      status: 'approved',
      vehicleTypes: { $in: [vehicleType || 'car', 'both'] },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius) * 1000,
        },
      },
    }).select('pricePerHour totalBookings');
  }

  if (nearbySpaces.length === 0) {
    return { suggestedPrice: vehicleType === 'bike' ? 20 : 50, avgNearby: null, reasoning: 'No nearby data. Using market baseline.' };
  }

  const avgPrice = nearbySpaces.reduce((sum, s) => sum + s.pricePerHour, 0) / nearbySpaces.length;
  const avgBookings = nearbySpaces.reduce((sum, s) => sum + s.totalBookings, 0) / nearbySpaces.length;

  // Demand multiplier: high demand in area → price up slightly
  let demandMultiplier = 1.0;
  if (avgBookings > 20) demandMultiplier = 1.15;
  else if (avgBookings > 10) demandMultiplier = 1.05;

  const suggestedPrice = Math.round(avgPrice * demandMultiplier);

  return {
    suggestedPrice,
    avgNearby: Math.round(avgPrice),
    demandMultiplier,
    nearbyCount: nearbySpaces.length,
    reasoning: `Based on ${nearbySpaces.length} nearby spaces averaging ₹${Math.round(avgPrice)}/hr with ${demandMultiplier > 1 ? 'high' : 'normal'} demand.`,
  };
};

// ── 3. Smart Search ─────────────────────────────────────────────────────────
/**
 * Parses a natural language query into structured filter parameters.
 * Example: "cheap bike parking near mall" → { vehicleType:'bike', sort:'price_asc', search:'mall' }
 */
exports.smartSearch = (query) => {
  const q = query.toLowerCase();
  const filters = {};

  // Price intent
  if (/cheap|budget|affordable|low cost|inexpensive/.test(q)) filters.sort = 'price_asc';
  if (/expensive|premium|luxury|high end/.test(q)) filters.sort = 'price_desc';

  // Vehicle type
  if (/bike|motorcycle|scooter|two.?wheel/.test(q)) filters.vehicleType = 'bike';
  else if (/car|four.?wheel|sedan|suv/.test(q)) filters.vehicleType = 'car';

  // Location extraction – extract keywords after "near" / "in" / "at"
  const locationMatch = q.match(/(?:near|in|at|around|close to)\s+([a-z\s]+?)(?:\s+parking|$)/i);
  if (locationMatch) filters.search = locationMatch[1].trim();

  // Time availability intent
  if (/24.?hour|overnight|all day|always open/.test(q)) filters.availability = '24h';
  if (/weekend/.test(q)) filters.availability = 'weekend';

  // Distance
  if (/within 1 km|very close|nearby/.test(q)) filters.radius = 1;
  else if (/within 5 km/.test(q)) filters.radius = 5;

  return filters;
};

// ── 4. Fraud Detection ──────────────────────────────────────────────────────
/**
 * Scores a booking for suspicious signals.
 * Returns: { score: 0-100, isFlagged: bool, reason }
 */
exports.checkFraud = async ({ customerId, createdAt, totalAmount }) => {
  let score = 0;
  const reasons = [];

  // Signal 1: Account very new (< 1 hour old)
  const accountAgeMs = Date.now() - new Date(createdAt).getTime();
  const accountAgeHours = accountAgeMs / (1000 * 60 * 60);
  if (accountAgeHours < 1) { score += 40; reasons.push('New account (< 1 hour old)'); }
  else if (accountAgeHours < 24) { score += 15; reasons.push('New account (< 24 hours old)'); }

  // Signal 2: Very high amount booking
  if (totalAmount > 5000) { score += 20; reasons.push('Unusually high booking amount'); }

  // Signal 3: Multiple bookings in last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await Booking.countDocuments({
    customer: customerId,
    createdAt: { $gte: tenMinutesAgo },
  });
  if (recentCount >= 3) { score += 30; reasons.push('Multiple rapid bookings detected'); }

  const isFlagged = score >= 50;
  return { score, isFlagged, reason: reasons.join('; ') || null };
};
