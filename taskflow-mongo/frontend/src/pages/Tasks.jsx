// ============================================================
// Tasks page - assigned tasks, status updates, comments,
// and full task CRUD for admins
// ============================================================
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { PriorityBadge, StatusBadge, Loader, EmptyState, Modal } from '../components/Common';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const emptyForm = {
  project_id: '', title: '', description: '', assigned_to: '', priority: 'Medium', status: 'Pending', due_date: ''
};

const Tasks = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const canManageTasks = user.role === 'admin' || user.role === 'team_lead';
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('project_id') || '';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const [detailTask, setDetailTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [taskFiles, setTaskFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (projectFilter) params.project_id = projectFilter;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const { data } = await api.get('/tasks', { params });
      setTasks(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    const [projectsRes, membersRes] = await Promise.all([
      api.get('/projects'),
      api.get('/users/team/members')
    ]);
    setProjects(projectsRes.data.data);
    setMembers(membersRes.data.data);
  };

  useEffect(() => {
    fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFilter, statusFilter, priorityFilter]);

  const openCreateModal = () => {
    setForm({ ...emptyForm, project_id: projectFilter || '' });
    setEditingId(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setForm({
      project_id: task.project_id,
      title: task.title,
      description: task.description || '',
      assigned_to: task.assigned_to || '',
      priority: task.priority,
      status: task.status,
      due_date: task.due_date || ''
    });
    setEditingId(task.id);
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, assigned_to: form.assigned_to || null, due_date: form.due_date || null };
      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const handleStatusChange = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    fetchTasks();
    if (detailTask?.id === taskId) openDetail(taskId);
  };

  const openDetail = async (taskId) => {
    const { data } = await api.get(`/tasks/${taskId}`);
    setDetailTask(data.data);
    const filesRes = await api.get(`/tasks/${taskId}/files`);
    setTaskFiles(filesRes.data.data);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      await api.post(`/tasks/${detailTask.id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFile(null);
      const filesRes = await api.get(`/tasks/${detailTask.id}/files`);
      setTaskFiles(filesRes.data.data);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleFileDelete = async (fileId) => {
    await api.delete(`/tasks/files/${fileId}`);
    const filesRes = await api.get(`/tasks/${detailTask.id}/files`);
    setTaskFiles(filesRes.data.data);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await api.post('/comments', { task_id: detailTask.id, comment: commentText });
    setCommentText('');
    openDetail(detailTask.id);
  };

  return (
    <DashboardLayout title="Tasks">
      <div className="page-toolbar">
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        {canManageTasks && <button className="btn btn-primary" onClick={openCreateModal}>+ New Task</button>}
      </div>

      {loading ? (
        <Loader />
      ) : tasks.length === 0 ? (
        <EmptyState message="No tasks found." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="task-title-cell" onClick={() => openDetail(t.id)}>{t.title}</td>
                  <td>{t.project_name}</td>
                  <td>{t.assigned_to_name || '—'}</td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td>{t.due_date || '—'}</td>
                  <td>
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      className={`status-select status-${t.status.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </td>
                  <td>
                    {isAdmin && (
                      <div className="row-actions">
                        <button className="link-btn" onClick={() => openEditModal(t)}>Edit</button>
                        <button className="link-btn danger" onClick={() => handleDelete(t.id)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit Task' : 'New Task'} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label>Project</label>
            <select name="project_id" value={form.project_id} onChange={handleChange} required>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />

            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" />

            <div className="form-row">
              <div>
                <label>Assign To</label>
                <select name="assigned_to" value={form.assigned_to} onChange={handleChange}>
                  <option value="">Unassigned</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label>Due Date</label>
                <input type="date" name="due_date" value={form.due_date} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              {editingId ? 'Save Changes' : 'Create Task'}
            </button>
          </form>
        </Modal>
      )}

      {detailTask && (
        <Modal title={detailTask.title} onClose={() => setDetailTask(null)}>
          <div className="task-detail">
            <p className="task-detail-desc">{detailTask.description || 'No description.'}</p>
            <div className="task-detail-meta">
              <span><PriorityBadge priority={detailTask.priority} /></span>
              <span><StatusBadge status={detailTask.status} /></span>
              <span>Due: {detailTask.due_date || '—'}</span>
            </div>

            <h4>Files</h4>
            {uploadError && <div className="alert alert-error">{uploadError}</div>}
            <div className="comment-list">
              {taskFiles.length === 0 && <p className="empty-text">No files uploaded yet.</p>}
              {taskFiles.map((f) => (
                <div key={f.id} className="comment-item">
                  <a href={`http://localhost:5000/uploads/${f.file_path}`} target="_blank" rel="noreferrer">
                    {f.file_name}
                  </a>
                  <span className="comment-time"> — uploaded by {f.uploaded_by_name}</span>
                  <button className="link-btn danger" onClick={() => handleFileDelete(f.id)} style={{ marginLeft: '10px' }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleFileUpload} className="comment-form">
              <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
              <button type="submit" className="btn btn-primary">Upload</button>
            </form>

            <h4>Comments</h4>
            <div className="comment-list">
              {detailTask.comments.length === 0 && <p className="empty-text">No comments yet.</p>}
              {detailTask.comments.map((c) => (
                <div key={c.id} className="comment-item">
                  <strong>{c.user_name}</strong>
                  <p>{c.comment}</p>
                  <span className="comment-time">{new Date(c.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="comment-form">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
              />
              <button type="submit" className="btn btn-primary">Post</button>
            </form>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Tasks;
