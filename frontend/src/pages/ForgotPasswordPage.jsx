import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { authAPI } from '../services/api';
import './LoginPage.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.forgotPassword({ email });

      if (response.data.success) {
        setSuccess('Password reset instructions have been sent to your email. Please check your inbox.');
        setEmail('');
        
        // Redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Mail size={48} style={{ color: '#1e88a8', margin: '0 auto' }} />
        </div>
        <h1 className="login-title">Forgot Password</h1>
        <p style={{ textAlign: 'center', color: '#4a5568', marginBottom: '1.5rem' }}>
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        {error && (
          <div className="error-message">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '0.375rem',
            color: '#155724',
            marginBottom: '1rem'
          }}>
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              disabled={loading || success}
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading || success}
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="login-footer">
          <p className="signup-text">
            Remember your password?{' '}
            <button onClick={() => navigate('/login')} className="signup-link">
              Back to Login
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

export default ForgotPasswordPage;
