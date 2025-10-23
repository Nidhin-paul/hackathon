import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
  };

  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClasses[size]}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
