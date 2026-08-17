// ============================================================
// Sidebar - primary navigation, adapts links to user role
// ============================================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: '\u25A6',
  projects: '\u25A3',
  tasks: '\u2611',
  users: '\u25CF',
  reports: '\u25A4',
  team: '\u25C9',
  teams: '\u25C8'
};

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">TF</span>
        <span className="brand-name">TaskFlow</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-icon">{icons.dashboard}</span> Dashboard
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-icon">{icons.projects}</span> Projects
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-icon">{icons.tasks}</span> Tasks
        </NavLink>
        <NavLink to="/team" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-icon">{icons.team}</span> Team
        </NavLink>
        {isAdmin && (
          <>
            <NavLink to="/teams" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="sidebar-icon">{icons.teams}</span> Teams
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="sidebar-icon">{icons.users}</span> Users
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="sidebar-icon">{icons.reports}</span> Reports
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-role-tag">{isAdmin ? 'Administrator' : 'Team Member'}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
