// ============================================================
// Controller: Task Files (upload/list/delete attachments)
// ============================================================
const Task = require('../models/Task');
const TaskFile = require('../models/TaskFile');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @route  POST /api/tasks/:id/files
// @access Private (any logged-in user)
const uploadFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileDoc = await TaskFile.create({
      task_id: id,
      uploaded_by: req.user.id,
      file_name: req.file.originalname,
      file_path: req.file.filename
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded',
      data: { id: fileDoc.id, file_name: req.file.originalname }
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/tasks/:id/files
// @access Private
const getFilesForTask = async (req, res, next) => {
  try {
    const files = await TaskFile.find({ task_id: req.params.id }).sort({ createdAt: -1 });
    const data = await Promise.all(
      files.map(async (f) => {
        const uploader = await User.findById(f.uploaded_by).select('name');
        return {
          id: f.id,
          file_name: f.file_name,
          file_path: f.file_path,
          uploaded_at: f.createdAt,
          uploaded_by_name: uploader ? uploader.name : null
        };
      })
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/tasks/files/:fileId
// @access Private
const deleteFile = async (req, res, next) => {
  try {
    const fileDoc = await TaskFile.findById(req.params.fileId);
    if (!fileDoc) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const filePath = path.join(__dirname, '../uploads', fileDoc.file_path);
    fs.unlink(filePath, () => {}); // ignore errors if already missing

    await TaskFile.findByIdAndDelete(req.params.fileId);
    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadFile, getFilesForTask, deleteFile };
