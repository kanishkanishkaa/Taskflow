// ============================================================
// Model: TaskFile (attachments - documents, photos, anything)
// ============================================================
const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSONPlugin');

const taskFileSchema = new mongoose.Schema(
  {
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    file_name: { type: String, required: true },
    file_path: { type: String, required: true }
  },
  { timestamps: true }
);

taskFileSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('TaskFile', taskFileSchema);
