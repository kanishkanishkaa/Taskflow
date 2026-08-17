// ============================================================
// Users page (Admin) - view all users grouped by team, edit role, delete
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Loader, EmptyState, Modal } from '../components/Common';
import api from '../api/axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '' });
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, role: u.role, password: '' });
    setEditingUser(u);
    setError('');
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await api.put(`/users/${editingUser.id}`, payload);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this user permanently?')) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  const term = search.trim().toLowerCase();
  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
  );

  const admins = filtered.filter((u) => u.role === 'admin');
  const unassigned = filtered.filter((u) => u.role === 'user' && !u.team_id);

  // Build one group per team that has a lead or members present in the filtered list
  const teamIds = [...new Set(filtered.filter((u) => u.team_id).map((u) => u.team_id))];
  const teamGroups = teamIds.map((teamId) => {
    const usersInTeam = filtered.filter((u) => u.team_id === teamId);
    const lead = usersInTeam.find((u) => u.role === 'team_lead');
    const members = usersInTeam.filter((u) => u.role === 'user');
    const teamName = usersInTeam[0]?.team_name || 'Team';
    return { teamId, teamName, lead, members };
  });

  const renderUserRow = (u) => (
    <tr key={u.id}>
      <td>{u.name}</td>
      <td>{u.email}</td>
      <td><span className={`badge role-${u.role}`}>{u.role}</span></td>
      <td>{new Date(u.created_at).toLocaleDateString()}</td>
      <td>
        <div className="row-actions">
          <button className="link-btn" onClick={() => openEdit(u)}>Edit</button>
          <button className="link-btn danger" onClick={() => handleDelete(u.id)}>Delete</button>
        </div>
      </td>
    </tr>
  );

  return (
    <DashboardLayout title="Users">
      <div className="page-toolbar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '320px' }}
        />
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState message="No users found." />
      ) : (
        <>
          {admins.length > 0 && (
            <div className="table-wrapper" style={{ marginBottom: '24px' }}>
              <h3>Admins</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
                </thead>
                <tbody>{admins.map(renderUserRow)}</tbody>
              </table>
            </div>
          )}

          {teamGroups.map((group) => (
            <div className="table-wrapper" key={group.teamId} style={{ marginBottom: '24px' }}>
              <h3>{group.teamName}</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
                </thead>
                <tbody>
                  {group.lead && renderUserRow(group.lead)}
                  {group.members.map(renderUserRow)}
                </tbody>
              </table>
            </div>
          ))}

          {unassigned.length > 0 && (
            <div className="table-wrapper" style={{ marginBottom: '24px' }}>
              <h3>Unassigned</h3>
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
                </thead>
                <tbody>{unassigned.map(renderUserRow)}</tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editingUser && (
        <Modal title={`Edit ${editingUser.name}`} onClose={() => setEditingUser(null)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="team_lead">Team Lead</option>
              <option value="admin">Admin</option>
            </select>
            <label>Reset Password (optional)</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
            <button type="submit" className="btn btn-primary btn-block">Save Changes</button>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Users;
