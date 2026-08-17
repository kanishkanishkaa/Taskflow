// ============================================================
// Model: Project (member_ids replaces the old project_members table)
// ============================================================
const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSONPlugin');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    start_date: { type: String, default: null },
    end_date: { type: String, default: null },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
      default: 'Not Started'
    },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

projectSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Project', projectSchema);
