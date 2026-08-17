// ============================================================
// Controller: Tasks (CRUD, assignment, status updates)
// ============================================================
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// Helper: create a notification row
const createNotification = async (userId, message, type, referenceId) => {
  if (!userId) return;
  await Notification.create({ user_id: userId, message, type, reference_id: referenceId });
};

const shapeTask = async (t) => {
  const project = await Project.findById(t.project_id).select('name');
  const assignedTo = t.assigned_to ? await User.findById(t.assigned_to).select('name') : null;
  const createdBy = await User.findById(t.created_by).select('name');
  return {
    id: t._id.toString(),
    project_id: t.project_id.toString(),
    project_name: project ? project.name : null,
    title: t.title,
    description: t.description,
    assigned_to: t.assigned_to ? t.assigned_to.toString() : null,
    assigned_to_name: assignedTo ? assignedTo.name : null,
    created_by: t.created_by.toString(),
    created_by_name: createdBy ? createdBy.name : null,
    priority: t.priority,
    status: t.status,
    due_date: t.due_date,
    created_at: t.createdAt
  };
};

// @route  POST /api/tasks
// @access Private (Admin, Team Lead)
const createTask = async (req, res, next) => {
  try {
    const { project_id, title, description, assigned_to, priority, status, due_date } = req.body;

    // Team leads can only assign tasks to members of their own team
    if (req.user.role === 'team_lead' && assigned_to) {
      const assignee = await User.findById(assigned_to);
      if (!assignee || String(assignee.team_id) !== String(req.user.team_id)) {
        return res.status(403).json({
          success: false,
          message: 'You can only assign tasks to members of your own team'
        });
      }
    }

    // Admins can only assign tasks to team leads
    if (req.user.role === 'admin' && assigned_to) {
      const assignee = await User.findById(assigned_to);
      if (!assignee || assignee.role !== 'team_lead') {
        return res.status(403).json({
          success: false,
          message: 'Admins can only assign tasks to a team lead'
        });
      }
    }

    const task = await Task.create({
      project_id,
      title,
      description: description || null,
      assigned_to: assigned_to || null,
      created_by: req.user.id,
      priority: priority || 'Medium',
      status: status || 'Pending',
      due_date: due_date || null
    });

    if (assigned_to) {
      await createNotification(assigned_to, `You have been assigned a new task: "${title}"`, 'task_assigned', task.id);
    }

    res.status(201).json({ success: true, message: 'Task created successfully', data: { id: task.id } });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/tasks
// @access Private (Admin: all, Team Lead: their team's tasks, User: own tasks)
const getAllTasks = async (req, res, next) => {
  try {
    const { project_id, status, priority } = req.query;
    const filter = {};

    if (req.user.role === 'team_lead') {
      const teamUserIds = await User.find({ team_id: req.user.team_id }).distinct('_id');
      filter.assigned_to = { $in: teamUserIds };
    } else if (req.user.role !== 'admin') {
      filter.assigned_to = req.user.id;
    }
    if (project_id) filter.project_id = project_id;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter).sort({ due_date: 1, createdAt: -1 });
    const data = await Promise.all(tasks.map(shapeTask));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Non-admins may only view tasks assigned to them (or their team, for leads)
    if (req.user.role === 'user' && String(task.assigned_to) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied to this task' });
    }
    if (req.user.role === 'team_lead') {
      const assignee = task.assigned_to ? await User.findById(task.assigned_to) : null;
      if (!assignee || String(assignee.team_id) !== String(req.user.team_id)) {
        return res.status(403).json({ success: false, message: 'Access denied to this task' });
      }
    }

    const comments = await Comment.find({ task_id: req.params.id }).sort({ createdAt: 1 });
    const commentsWithNames = await Promise.all(
      comments.map(async (c) => {
        const user = await User.findById(c.user_id).select('name');
        return { id: c.id, task_id: c.task_id.toString(), user_id: c.user_id.toString(), user_name: user ? user.name : null, comment: c.comment, created_at: c.createdAt };
      })
    );

    const shaped = await shapeTask(task);
    res.json({ success: true, data: { ...shaped, comments: commentsWithNames } });
  } catch (err) {
    next(err);
  }
};

// @route  PUT /api/tasks/:id
// @access Private (Admin, Team Lead)
const updateTask = async (req, res, next) => {
  try {
    const { title, description, assigned_to, priority, status, due_date, project_id } = req.body;

    const existing = await Task.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Team leads can only assign tasks to members of their own team
    if (req.user.role === 'team_lead' && assigned_to) {
      const assignee = await User.findById(assigned_to);
      if (!assignee || String(assignee.team_id) !== String(req.user.team_id)) {
        return res.status(403).json({
          success: false,
          message: 'You can only assign tasks to members of your own team'
        });
      }
    }

    // Admins can only assign tasks to team leads
    if (req.user.role === 'admin' && assigned_to) {
      const assignee = await User.findById(assigned_to);
      if (!assignee || assignee.role !== 'team_lead') {
        return res.status(403).json({
          success: false,
          message: 'Admins can only assign tasks to a team lead'
        });
      }
    }

    existing.title = title ?? existing.title;
    existing.description = description ?? existing.description;
    const oldAssignedTo = existing.assigned_to ? existing.assigned_to.toString() : null;
    existing.assigned_to = assigned_to ?? existing.assigned_to;
    existing.priority = priority ?? existing.priority;
    existing.status = status ?? existing.status;
    existing.due_date = due_date ?? existing.due_date;
    existing.project_id = project_id ?? existing.project_id;
    await existing.save();

    if (assigned_to && assigned_to !== oldAssignedTo) {
      await createNotification(
        assigned_to,
        `You have been assigned to task: "${title || existing.title}"`,
        'task_assigned',
        existing.id
      );
    }

    res.json({ success: true, message: 'Task updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @route  PATCH /api/tasks/:id/status
// @access Private (assigned user, team lead, or admin)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (req.user.role === 'user' && String(task.assigned_to) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this task' });
    }

    task.status = status;
    await task.save();

    if (String(task.created_by) !== String(req.user.id)) {
      await createNotification(
        task.created_by,
        `Task "${task.title}" was updated to "${status}" by ${req.user.name}`,
        'task_updated',
        task.id
      );
    }

    res.json({ success: true, message: 'Task status updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/tasks/:id
// @access Private (Admin)
const deleteTask = async (req, res, next) => {
  try {
    const result = await Task.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
};
