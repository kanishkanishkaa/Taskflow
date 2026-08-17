// ============================================================
// Controller: Teams (admin creates teams, assigns leads/members)
// ============================================================
const Team = require('../models/Team');
const User = require('../models/User');

// @route  GET /api/teams
// @access Private (Admin)
const getAllTeams = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ name: 1 }).lean();

    const data = await Promise.all(
      teams.map(async (t) => {
        const lead = t.team_lead_id ? await User.findById(t.team_lead_id).select('name') : null;
        const memberCount = await User.countDocuments({ team_id: t._id });
        return {
          id: t._id.toString(),
          name: t.name,
          team_lead_id: t.team_lead_id ? t.team_lead_id.toString() : null,
          team_lead_name: lead ? lead.name : null,
          member_count: memberCount
        };
      })
    );

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/teams/:id/members
// @access Private (Admin)
const getTeamDetail = async (req, res, next) => {
  try {
    const members = await User.find({ team_id: req.params.id })
      .select('id name email role')
      .sort({ name: 1 });
    res.json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/teams
// @access Private (Admin)
const createTeam = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Team name is required' });
    }
    const team = await Team.create({ name: name.trim() });
    res.status(201).json({ success: true, message: 'Team created', data: { id: team.id } });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/teams/:id/lead
// @access Private (Admin)
const assignLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If that user was leading a different team before, demote them there first
    await Team.updateMany({ team_lead_id: user_id }, { team_lead_id: null });

    await Team.findByIdAndUpdate(id, { team_lead_id: user_id });
    await User.findByIdAndUpdate(user_id, { role: 'team_lead', team_id: id });

    res.json({ success: true, message: 'Team lead assigned' });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/teams/:id/members
// @access Private (Admin)
const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role !== 'user') {
      return res.status(400).json({ success: false, message: 'Only regular users can be added as members' });
    }

    user.team_id = id;
    await user.save();
    res.json({ success: true, message: 'Member added to team' });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/teams/:id/members/:userId
// @access Private (Admin)
const removeMember = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { team_id: null });
    res.json({ success: true, message: 'Member removed from team' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTeams, getTeamDetail, createTeam, assignLead, addMember, removeMember };
