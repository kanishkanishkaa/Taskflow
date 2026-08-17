// ============================================================
// Routes: /api/tasks
// ============================================================
const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadFile, getFilesForTask, deleteFile } = require('../controllers/taskFileController');

const router = express.Router();

router.use(protect);

const taskValidation = [
  body('project_id').notEmpty().withMessage('A valid project_id is required'),
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('priority').optional().isIn(['High', 'Medium', 'Low']).withMessage('Invalid priority'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status')
];

router.get('/', getAllTasks);
router.get('/:id', getTaskById);

router.post('/', authorize('admin', 'team_lead'), taskValidation, validate, createTask);
router.put('/:id', authorize('admin', 'team_lead'), updateTask);
router.patch(
  '/:id/status',
  [body('status').isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status')],
  validate,
  updateTaskStatus
);
router.delete('/:id', authorize('admin'), deleteTask);

router.post('/:id/files', upload.single('file'), uploadFile);
router.get('/:id/files', getFilesForTask);
router.delete('/files/:fileId', deleteFile);

module.exports = router;
