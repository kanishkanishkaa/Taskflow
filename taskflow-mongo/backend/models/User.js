// ============================================================
// Model: User
// ============================================================
const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSONPlugin');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'team_lead', 'user'], default: 'user' },
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    avatar: { type: String, default: null }
  },
  { timestamps: true }
);

userSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('User', userSchema);
