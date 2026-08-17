// ============================================================
// Reports page (Admin) - project progress & team workload report
// ============================================================
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Loader, EmptyState } from '../components/Common';
import api from '../api/axios';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard/report');
        setReport(data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !report) {
    return (
      <DashboardLayout title="Reports">
        <Loader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Reports">
      <h3 className="section-heading">Project Progress</h3>
      {report.projects.length === 0 ? (
        <EmptyState message="No project data yet." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th><th>Status</th><th>Total Tasks</th><th>Completed</th><th>In Progress</th><th>Pending</th><th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {report.projects.map((p) => {
                const pct = p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0;
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.status}</td>
                    <td>{p.total_tasks}</td>
                    <td>{p.completed_tasks}</td>
                    <td>{p.in_progress_tasks}</td>
                    <td>{p.pending_tasks}</td>
                    <td>
                      <div className="progress-bar small">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="progress-label">{pct}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="section-heading">Team Workload</h3>
      {report.userWorkload.length === 0 ? (
        <EmptyState message="No workload data yet." />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Team Member</th><th>Assigned Tasks</th><th>Completed</th></tr>
            </thead>
            <tbody>
              {report.userWorkload.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.total_assigned}</td>
                  <td>{u.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reports;
