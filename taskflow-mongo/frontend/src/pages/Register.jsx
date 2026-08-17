// ============================================================
// Register page
// ============================================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel-brand">
        <span className="brand-mark large">TF</span>
        <h1>TaskFlow</h1>
        <p>Create your account and start collaborating with your team today.</p>
      </div>

      <div className="auth-panel-form">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="auth-subtitle">New accounts join as team members by default</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label>Full name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />

            <label>Email address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@company.com" />

            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="At least 6 characters" />

            <label>Confirm password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Re-enter password" />

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
