import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import './RegisterPage.css';
import './LoginPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Register user
    setLoading(true);
    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        setSuccess('Registration successful! Redirecting...');
        
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Register</h1>

        {error && (
          <div className="error-message">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

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
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password:
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Confirm password"
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
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p className="login-text">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="login-link">
              Login
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

export default RegisterPage;
