// ============================================================
// Teams page (Admin) - create teams, assign leads, group members
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Loader, EmptyState, Modal } from '../components/Common';
import api from '../api/axios';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const [detailTeam, setDetailTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedLead, setSelectedLead] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [error, setError] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teams');
      setTeams(data.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    const { data } = await api.get('/users');
    setAllUsers(data.data);
  };

  useEffect(() => {
    fetchTeams();
    fetchAllUsers();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/teams', { name: newTeamName });
      setNewTeamName('');
      setShowCreate(false);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const openTeamDetail = async (team) => {
    setDetailTeam(team);
    setError('');
    setSelectedLead('');
    setSelectedMember('');
    const { data } = await api.get(`/teams/${team.id}/members`);
    setTeamMembers(data.data);
  };

  const refreshDetail = async (team) => {
    const { data } = await api.get(`/teams/${team.id}/members`);
    setTeamMembers(data.data);
    fetchTeams();
    fetchAllUsers();
  };

  const handleAssignLead = async () => {
    if (!selectedLead) return;
    setError('');
    try {
      await api.put(`/teams/${detailTeam.id}/lead`, { user_id: selectedLead });
      setSelectedLead('');
      refreshDetail(detailTeam);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleAddMember = async () => {
    if (!selectedMember) return;
    setError('');
    try {
      await api.put(`/teams/${detailTeam.id}/members`, { user_id: selectedMember });
      setSelectedMember('');
      refreshDetail(detailTeam);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleRemoveMember = async (userId) => {
    await api.delete(`/teams/${detailTeam.id}/members/${userId}`);
    refreshDetail(detailTeam);
  };

  // Users not yet on any team, and not already a lead elsewhere
  const unassignedUsers = allUsers.filter((u) => u.role === 'user' && !u.team_id);

  return (
    <DashboardLayout title="Teams">
      <div className="page-toolbar">
        <div />
        <button className="btn btn-primary" onClick={() => { setShowCreate(true); setError(''); }}>
          + New Team
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : teams.length === 0 ? (
        <EmptyState message="No teams yet." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Team Lead</th>
                <th>Members</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.team_lead_name || '— not assigned —'}</td>
                  <td>{t.member_count}</td>
                  <td>
                    <button className="link-btn" onClick={() => openTeamDetail(t)}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="New Team" onClose={() => setShowCreate(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleCreateTeam}>
            <label>Team Name</label>
            <input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required />
            <button type="submit" className="btn btn-primary btn-block">Create Team</button>
          </form>
        </Modal>
      )}

      {detailTeam && (
        <Modal title={`Manage: ${detailTeam.name}`} onClose={() => setDetailTeam(null)}>
          {error && <div className="alert alert-error">{error}</div>}

          <h4>Team Lead</h4>
          <div className="form-row">
            <select value={selectedLead} onChange={(e) => setSelectedLead(e.target.value)}>
              <option value="">Select a user to make lead</option>
              {allUsers.filter((u) => u.role === 'user').map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleAssignLead}>Assign</button>
          </div>

          <h4>Members</h4>
          <div className="comment-list">
            {teamMembers.filter((m) => m.role === 'user').length === 0 && (
              <p className="empty-text">No members yet.</p>
            )}
            {teamMembers.filter((m) => m.role === 'user').map((m) => (
              <div key={m.id} className="comment-item">
                <strong>{m.name}</strong> ({m.email})
                <button className="link-btn danger" onClick={() => handleRemoveMember(m.id)} style={{ marginLeft: '10px' }}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="form-row">
            <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
              <option value="">Select a user to add</option>
              {unassignedUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleAddMember}>Add</button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default Teams;
