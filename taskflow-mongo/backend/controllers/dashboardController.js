// ============================================================
// Controller: Dashboard statistics & reports (Chart.js data)
// ============================================================
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @route  GET /api/dashboard/stats
// @access Private (Admin: global stats, User: personal stats)
const getStats = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const taskFilter = isAdmin ? {} : { assigned_to: req.user.id };

    let totalProjects;
    if (isAdmin) {
      totalProjects = await Project.countDocuments();
    } else {
      totalProjects = (await Task.find({ assigned_to: req.user.id }).distinct('project_id')).length;
    }

    const totalTasks = await Task.countDocuments(taskFilter);
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ ...taskFilter, status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ ...taskFilter, status: 'In Progress' });

    const priorityAgg = await Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const priorityBreakdown = priorityAgg.map((p) => ({ priority: p._id, count: p.count }));

    let extra = {};
    if (isAdmin) {
      const totalUsers = await User.countDocuments({ role: 'user' });
      const statusAgg = await Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      const projectStatusBreakdown = statusAgg.map((s) => ({ status: s._id, count: s.count }));
      extra = { totalUsers, projectStatusBreakdown };
    }

    res.json({
      success: true,
      data: { totalProjects, totalTasks, completedTasks, pendingTasks, inProgressTasks, priorityBreakdown, ...extra }
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/dashboard/report
// @access Private (Admin) - detailed report of all projects & task progress
const getReport = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    const projectReports = await Promise.all(
      projects.map(async (p) => {
        const totalTasks = await Task.countDocuments({ project_id: p._id });
        const completedTasks = await Task.countDocuments({ project_id: p._id, status: 'Completed' });
        const inProgressTasks = await Task.countDocuments({ project_id: p._id, status: 'In Progress' });
        const pendingTasks = await Task.countDocuments({ project_id: p._id, status: 'Pending' });
        return {
          id: p.id,
          name: p.name,
          status: p.status,
          start_date: p.start_date,
          end_date: p.end_date,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          in_progress_tasks: inProgressTasks,
          pending_tasks: pendingTasks
        };
      })
    );

    const users = await User.find({ role: 'user' });
    const userWorkload = await Promise.all(
      users.map(async (u) => {
        const totalAssigned = await Task.countDocuments({ assigned_to: u._id });
        const completed = await Task.countDocuments({ assigned_to: u._id, status: 'Completed' });
        return { id: u.id, name: u.name, total_assigned: totalAssigned, completed };
      })
    );

    res.json({ success: true, data: { projects: projectReports, userWorkload } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getReport };
