// ============================================================
// Routes: /api/dashboard
// ============================================================
const express = require('express');
const { getStats, getReport } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/report', authorize('admin'), getReport);

module.exports = router;
