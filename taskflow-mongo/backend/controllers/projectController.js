// ============================================================
// Controller: Projects (CRUD + member assignment)
// ============================================================
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const shapeProject = async (p) => {
  const createdBy = await User.findById(p.created_by).select('name');
  const taskCount = await Task.countDocuments({ project_id: p._id });
  const completedCount = await Task.countDocuments({ project_id: p._id, status: 'Completed' });
  return {
    id: p._id.toString(),
    name: p.name,
    description: p.description,
    start_date: p.start_date,
    end_date: p.end_date,
    status: p.status,
    created_by: p.created_by.toString(),
    created_by_name: createdBy ? createdBy.name : null,
    created_at: p.createdAt,
    task_count: taskCount,
    completed_count: completedCount
  };
};

// @route  POST /api/projects
// @access Private (Admin)
const createProject = async (req, res, next) => {
  try {
    const { name, description, start_date, end_date, status, member_ids } = req.body;

    const project = await Project.create({
      name,
      description: description || null,
      start_date,
      end_date,
      status: status || 'Not Started',
      created_by: req.user.id,
      member_ids: Array.isArray(member_ids) ? member_ids : []
    });

    res.status(201).json({ success: true, message: 'Project created successfully', data: { id: project.id } });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/projects
// @access Private (all authenticated users see projects they're part of; admin sees all)
const getAllProjects = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      projects = await Project.find().sort({ createdAt: -1 });
    } else {
      // Projects where the user is a member, OR has a task assigned in that project
      const taskProjectIds = await Task.find({ assigned_to: req.user.id }).distinct('project_id');
      projects = await Project.find({
        $or: [{ member_ids: req.user.id }, { _id: { $in: taskProjectIds } }]
      }).sort({ createdAt: -1 });
    }

    const data = await Promise.all(projects.map(shapeProject));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/projects/:id
// @access Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const members = await User.find({ _id: { $in: project.member_ids } }).select('id name email');
    const shaped = await shapeProject(project);

    res.json({ success: true, data: { ...shaped, members } });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/projects/:id
// @access Private (Admin)
const updateProject = async (req, res, next) => {
  try {
    const { name, description, start_date, end_date, status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, start_date, end_date, status },
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, message: 'Project updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/projects/:id
// @access Private (Admin)
const deleteProject = async (req, res, next) => {
  try {
    const result = await Project.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/projects/:id/members
// @access Private (Admin)
const addProjectMember = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    await Project.findByIdAndUpdate(req.params.id, { $addToSet: { member_ids: user_id } });
    res.json({ success: true, message: 'Member added to project' });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/projects/:id/members/:userId
// @access Private (Admin)
const removeProjectMember = async (req, res, next) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, { $pull: { member_ids: req.params.userId } });
    res.json({ success: true, message: 'Member removed from project' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember
};
