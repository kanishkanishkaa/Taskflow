// ============================================================
// Projects page - CRUD for admins, read-only list for users
// ============================================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { StatusBadge, Loader, EmptyState, Modal } from '../components/Common';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const emptyForm = { name: '', description: '', start_date: '', end_date: '', status: 'Not Started' };

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setForm({
      name: project.name,
      description: project.description || '',
      start_date: project.start_date,
      end_date: project.end_date,
      status: project.status
    });
    setEditingId(project.id);
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, form);
      } else {
        await api.post('/projects', form);
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all of its tasks?')) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  return (
    <DashboardLayout title="Projects">
      <div className="page-toolbar">
        <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreateModal}>+ New Project</button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : projects.length === 0 ? (
        <EmptyState message="No projects yet. Create one to get started." />
      ) : (
        <div className="card-grid">
          {projects.map((p) => (
            <div key={p.id} className="project-card" onClick={() => navigate(`/tasks?project_id=${p.id}`)}>
              <div className="project-card-header">
                <h3>{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="project-desc">{p.description || 'No description provided.'}</p>
              <div className="project-meta">
                <span>{p.start_date} → {p.end_date}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${p.task_count > 0 ? Math.round((p.completed_count / p.task_count) * 100) : 0}%` }}
                />
              </div>
              <p className="progress-label">{p.completed_count}/{p.task_count} tasks completed</p>

              {isAdmin && (
                <div className="project-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="link-btn" onClick={() => openEditModal(p)}>Edit</button>
                  <button className="link-btn danger" onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit Project' : 'New Project'} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label>Project Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" />

            <div className="form-row">
              <div>
                <label>Start Date</label>
                <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
              </div>
              <div>
                <label>End Date</label>
                <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
              </div>
            </div>

            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option>Not Started</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>On Hold</option>
            </select>

            <button type="submit" className="btn btn-primary btn-block">
              {editingId ? 'Save Changes' : 'Create Project'}
            </button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Projects;
