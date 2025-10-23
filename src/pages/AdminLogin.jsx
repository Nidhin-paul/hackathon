import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Shield, AlertCircle, Lock, User } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdmin();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const result = login(formData.username, formData.password);
    
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-icon-container">
          <div className="admin-icon-wrapper">
            <Shield className="w-12 h-12 text-red-600 animate-pulse-slow" />
          </div>
        </div>
        
        <h1 className="admin-login-title">
          Admin Login
        </h1>

        <p className="admin-login-subtitle">
          🔒 Restricted access - Administrators only
        </p>

        {error && (
          <div className="admin-error-message">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label className="admin-form-label">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Enter admin username"
              autoComplete="username"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="Enter admin password"
              autoComplete="current-password"
            />
            <div className="show-password-container">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="show-password-checkbox"
              />
              <label htmlFor="showPassword" className="show-password-label">
                Show Password
              </label>
            </div>
          </div>

          <button type="submit" className="admin-login-button">
            Sign In as Admin
          </button>
        </form>

        <div className="admin-credentials-info">
          <p>Default credentials:</p>
          <code className="admin-credentials-code">
            Username: admin | Password: admin123
          </code>
        </div>

        <div className="admin-back-home">
          <button onClick={() => navigate('/')} className="admin-back-link">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
