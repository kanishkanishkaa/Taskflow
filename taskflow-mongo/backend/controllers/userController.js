// ============================================================
// Controller: Users (admin management + team lists)
// ============================================================
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Team = require('../models/Team');

// @route  GET /api/users
// @access Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    const teams = await Team.find().lean();
    const teamNameById = {};
    teams.forEach((t) => { teamNameById[t._id.toString()] = t.name; });

    const data = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      created_at: u.createdAt,
      team_id: u.team_id ? u.team_id.toString() : null,
      team_name: u.team_id ? teamNameById[u.team_id.toString()] || null : null
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/users/:id
// @access Private (Admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('id name email role createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/users/:id
// @access Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name;
    user.email = email;
    user.role = role;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();

    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/users/:id
// @access Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/users/team/members
// @access Private (Any authenticated user) - used for team collaboration list
// Admin -> sees team leads only. Team lead -> sees own team's members only.
const getTeamMembers = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'admin') {
      filter = { role: 'team_lead' };
    } else if (req.user.role === 'team_lead') {
      if (!req.user.team_id) {
        return res.json({ success: true, data: [] }); // not yet assigned to a team - show nobody
      }
      filter = { team_id: req.user.team_id };
    }

    const users = await User.find(filter).select('id name email role').sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser, getTeamMembers };
