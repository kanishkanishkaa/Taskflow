// ============================================================
// Routes: /api/projects
// ============================================================
const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required')
];

router.get('/', getAllProjects);
router.get('/:id', getProjectById);

router.post('/', authorize('admin'), projectValidation, validate, createProject);
router.put('/:id', authorize('admin'), projectValidation, validate, updateProject);
router.delete('/:id', authorize('admin'), deleteProject);

router.post('/:id/members', authorize('admin'), addProjectMember);
router.delete('/:id/members/:userId', authorize('admin'), removeProjectMember);

module.exports = router;
