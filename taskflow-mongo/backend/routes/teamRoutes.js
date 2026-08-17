// ============================================================
// Routes: /api/teams
// ============================================================
const express = require('express');
const {
  getAllTeams,
  getTeamDetail,
  createTeam,
  assignLead,
  addMember,
  removeMember
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllTeams);
router.get('/:id/members', getTeamDetail);
router.post('/', createTeam);
router.put('/:id/lead', assignLead);
router.put('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
