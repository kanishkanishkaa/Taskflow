// ============================================================
// Dashboard - overview statistics and charts (Chart.js)
// ============================================================
import React, { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import DashboardLayout from '../components/DashboardLayout';
import { StatCard, Loader } from '../components/Common';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Register the Chart.js pieces used by the Doughnut & Bar charts below
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !stats) {
    return (
      <DashboardLayout title="Dashboard">
        <Loader />
      </DashboardLayout>
    );
  }

  const statusData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [stats.completedTasks, stats.inProgressTasks, stats.pendingTasks],
        backgroundColor: ['#2FBF89', '#F5A524', '#E5484D']
      }
    ]
  };

  const priorityLabels = stats.priorityBreakdown.map((p) => p.priority);
  const priorityValues = stats.priorityBreakdown.map((p) => p.count);
  const priorityData = {
    labels: priorityLabels,
    datasets: [
      {
        label: 'Tasks by Priority',
        data: priorityValues,
        backgroundColor: '#3D5AF1'
      }
    ]
  };

  return (
    <DashboardLayout title={`Welcome back, ${user.name.split(' ')[0]}`}>
      <div className="stat-grid">
        <StatCard label="Total Projects" value={stats.totalProjects} accent="indigo" icon="📁" />
        <StatCard label="Completed Tasks" value={stats.completedTasks} accent="green" icon="✅" />
        <StatCard label="In Progress" value={stats.inProgressTasks} accent="amber" icon="🔄" />
        <StatCard label="Pending Tasks" value={stats.pendingTasks} accent="red" icon="⏳" />
        {user.role === 'admin' && (
          <StatCard label="Team Members" value={stats.totalUsers} accent="teal" icon="👥" />
        )}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Task Status Breakdown</h3>
          <Doughnut data={statusData} />
        </div>
        <div className="chart-card">
          <h3>Tasks by Priority</h3>
          <Bar data={priorityData} options={{ plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
