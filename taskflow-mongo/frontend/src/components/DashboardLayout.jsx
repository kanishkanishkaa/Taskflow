// ============================================================
// DashboardLayout - shared shell for all authenticated pages
// ============================================================
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ title, children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-panel">
        <Navbar title={title} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
