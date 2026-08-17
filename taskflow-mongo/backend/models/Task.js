// ============================================================
// Model: Task
// ============================================================
const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSONPlugin');

const taskSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    due_date: { type: String, default: null }
  },
  { timestamps: true }
);

taskSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Task', taskSchema);
