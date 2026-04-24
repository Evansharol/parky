/**
 * controllers/aiController.js – Expose AI features as REST endpoints
 */
const aiService = require('../services/aiService');

// GET /api/ai/predict-availability?spaceId=&datetime=
exports.predictAvailability = async (req, res, next) => {
  try {
    const { spaceId, datetime } = req.query;
    if (!spaceId || !datetime) {
      return res.status(400).json({ success: false, message: 'spaceId and datetime required' });
    }
    const result = await aiService.predictAvailability({ spaceId, datetime });
    res.json({ success: true, prediction: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/ai/suggest-price?lat=&lng=&vehicleType=
exports.suggestPrice = async (req, res, next) => {
  try {
    const { lat, lng, vehicleType, radius } = req.query;
    const result = await aiService.suggestPrice({ lat, lng, vehicleType, radius });
    res.json({ success: true, pricing: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/ai/smart-search?q=
exports.smartSearch = (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, message: 'Query required' });
  const filters = aiService.smartSearch(q);
  res.json({ success: true, filters });
};
