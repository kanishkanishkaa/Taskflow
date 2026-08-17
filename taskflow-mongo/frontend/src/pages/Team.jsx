// ============================================================
// Team page - collaboration: view all team members
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Loader, EmptyState } from '../components/Common';
import api from '../api/axios';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/users/team/members');
        setMembers(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout title="Team">
      {loading ? (
        <Loader />
      ) : members.length === 0 ? (
        <EmptyState message="No team members found." />
      ) : (
        <div className="card-grid">
          {members.map((m) => (
            <div key={m.id} className="team-member-card">
              <div className="avatar-circle large">{m.name.charAt(0).toUpperCase()}</div>
              <h4>{m.name}</h4>
              <p className="team-email">{m.email}</p>
              <span className={`badge role-${m.role}`}>{m.role}</span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Team;
