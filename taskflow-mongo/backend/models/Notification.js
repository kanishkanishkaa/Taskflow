// ============================================================
// Model: Notification
// ============================================================
const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSONPlugin');

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['task_assigned', 'task_updated', 'comment', 'project_update', 'general'],
      default: 'general'
    },
    reference_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    is_read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

notificationSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Notification', notificationSchema);
