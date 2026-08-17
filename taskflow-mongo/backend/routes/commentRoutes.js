// ============================================================
// Routes: /api/comments
// ============================================================
const express = require('express');
const { body } = require('express-validator');
const { addComment, getCommentsForTask, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('task_id').notEmpty().withMessage('A valid task_id is required'),
    body('comment').trim().notEmpty().withMessage('Comment text is required')
  ],
  validate,
  addComment
);

router.get('/task/:taskId', getCommentsForTask);
router.delete('/:id', deleteComment);

module.exports = router;
