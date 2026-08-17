// ============================================================
// Routes: /api/users
// ============================================================
const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getTeamMembers
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect); // all routes below require authentication

router.get('/team/members', getTeamMembers); // any logged-in user - team collaboration list

router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
