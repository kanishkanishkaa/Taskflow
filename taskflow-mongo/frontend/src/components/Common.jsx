// ============================================================
// Small reusable presentational components
// ============================================================
import React from 'react';

export const StatCard = ({ label, value, accent, icon }) => (
  <div className={`stat-card accent-${accent}`}>
    <div className="stat-card-icon">{icon}</div>
    <div>
      <p className="stat-card-value">{value}</p>
      <p className="stat-card-label">{label}</p>
    </div>
  </div>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`badge priority-${priority?.toLowerCase()}`}>{priority}</span>
);

export const StatusBadge = ({ status }) => (
  <span className={`badge status-${status?.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>
);

export const Loader = () => (
  <div className="loader-wrap">
    <div className="spinner" />
    <p>Loading...</p>
  </div>
);

export const EmptyState = ({ message }) => (
  <div className="empty-state">
    <p>{message}</p>
  </div>
);

export const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="icon-btn" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);
