import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Authenticate user with backend
    setLoading(true);
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login</h1>

        {error && (
          <div className="error-message">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password:
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter password"
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

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p className="forgot-password">
            Forgot{' '}
            <a href="#" className="forgot-link">
              Username / Password?
            </a>
          </p>
          <p className="signup-text">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="signup-link">
              Sign up
            </button>
          </p>
        </div>

        <div className="back-home">
          <button onClick={() => navigate('/')} className="back-home-link">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
