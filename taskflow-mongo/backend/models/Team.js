// ============================================================
// Model: Team
// ============================================================
const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSONPlugin');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    team_lead_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

teamSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Team', teamSchema);
