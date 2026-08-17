// ============================================================
// Controller: Task Comments (team collaboration)
// ============================================================
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @route  POST /api/comments
// @access Private
const addComment = async (req, res, next) => {
  try {
    const { task_id, comment } = req.body;

    const task = await Task.findById(task_id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const newComment = await Comment.create({ task_id, user_id: req.user.id, comment });

    // Notify the other party (assignee <-> creator) about the new comment
    const isAssignee = String(req.user.id) === String(task.assigned_to);
    const notifyUserId = isAssignee ? task.created_by : task.assigned_to;
    if (notifyUserId && String(notifyUserId) !== String(req.user.id)) {
      await Notification.create({
        user_id: notifyUserId,
        message: `${req.user.name} commented on task "${task.title}"`,
        type: 'comment',
        reference_id: task_id
      });
    }

    res.status(201).json({ success: true, message: 'Comment added successfully', data: { id: newComment.id } });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/comments/task/:taskId
// @access Private
const getCommentsForTask = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task_id: req.params.taskId }).sort({ createdAt: 1 });
    const data = await Promise.all(
      comments.map(async (c) => {
        const user = await User.findById(c.user_id).select('name');
        return { ...c.toJSON(), user_name: user ? user.name : null };
      })
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/comments/:id
// @access Private (comment author or admin)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    if (req.user.role !== 'admin' && String(comment.user_id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own comments' });
    }
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { addComment, getCommentsForTask, deleteComment };
