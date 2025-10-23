import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './Notification.css';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle className="notification-icon" />,
    error: <AlertCircle className="notification-icon" />,
    info: <Info className="notification-icon" />,
  };

  return (
    <div className={`notification notification-${type} ${isVisible ? 'notification-visible' : 'notification-hidden'}`}>
      <div className="notification-content">
        {icons[type]}
        <span className="notification-message">{message}</span>
      </div>
      <button onClick={handleClose} className="notification-close">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Notification;
