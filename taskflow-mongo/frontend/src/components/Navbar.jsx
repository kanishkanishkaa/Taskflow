// ============================================================
// Navbar - top bar with page title, notifications, and logout
// ============================================================
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    await api.patch('/notifications/read-all');
    fetchNotifications();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>

      <div className="navbar-actions">
        <div className="notification-wrapper" ref={dropdownRef}>
          <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="Notifications">
            🔔
            {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
          </button>
          {open && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <span>Notifications</span>
                <button className="link-btn" onClick={handleMarkAllRead}>Mark all read</button>
              </div>
              <div className="notification-list">
                {notifications.length === 0 && <p className="empty-text">No notifications yet</p>}
                {notifications.map((n) => (
                  <div key={n.id} className={`notification-item ${n.is_read ? '' : 'unread'}`}>
                    <p>{n.message}</p>
                    <span className="notification-time">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="navbar-user">
          <div className="avatar-circle">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user?.name}</span>
            <span className="navbar-user-role">{user?.role}</span>
          </div>
        </div>

        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
