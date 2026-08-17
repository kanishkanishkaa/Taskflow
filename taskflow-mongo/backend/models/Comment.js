// ============================================================
// Model: Comment
// ============================================================
const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSONPlugin');

const commentSchema = new mongoose.Schema(
  {
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true }
  },
  { timestamps: true }
);

commentSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Comment', commentSchema);
