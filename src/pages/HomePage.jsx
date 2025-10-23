import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { getCurrentLocation } from '../utils/geolocation';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const position = await getCurrentLocation();
      setLocation(position);
    } catch (err) {
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePanicClick = () => {
    // Navigate to main app with panic mode
    navigate('/dashboard?panic=true');
  };

  const handleServiceClick = (category) => {
    // Navigate to main app with selected category
    navigate(`/dashboard?category=${category}`);
  };

  const handleFindSafeZone = () => {
    if (location) {
      // Open Google Maps to find nearby safe zones (hospitals, police stations, etc.)
      const url = `https://www.google.com/maps/search/emergency+services/@${location.latitude},${location.longitude},15z`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="home-container animate-fade-in">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-content">
          <h1 className="home-header-title">Emergency Contact Hub</h1>
          <div className="home-header-buttons">
            <button
              onClick={() => navigate('/login')}
              className="home-header-button hover:scale-105 transition-transform duration-200"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="home-header-button hover:scale-105 transition-transform duration-200"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div className="home-hero">
          <h2 className="home-hero-title animate-fade-in-down">
            Emergency Contact Hub
          </h2>
          <p className="home-hero-subtitle animate-fade-in-up animation-delay-200">
            Quick Access to Emergency Services with Location Tagging
          </p>
        </div>

        {/* Panic Button */}
        <div className="panic-button-container animate-bounce-in animation-delay-400">
          <button
            onClick={handlePanicClick}
            className="panic-button animate-pulse-slow hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            PANIC 🚨
          </button>
        </div>

        {/* Service Buttons */}
        <div className="service-buttons">
          <button
            onClick={() => handleServiceClick('medical')}
            className="service-button medical hover:-translate-y-2 hover:scale-105 hover:shadow-xl active:translate-y-0 active:scale-95 transition-all duration-200"
          >
            <span className="service-button-icon animate-bounce-in">➕</span>
            Medical Help
          </button>
          <button
            onClick={() => handleServiceClick('fire')}
            className="service-button fire hover:-translate-y-2 hover:scale-105 hover:shadow-xl active:translate-y-0 active:scale-95 transition-all duration-200 animation-delay-100"
          >
            <span className="service-button-icon animate-bounce-in animation-delay-100">🔥</span>
            Fire
          </button>
          <button
            onClick={() => handleServiceClick('police')}
            className="service-button police hover:-translate-y-2 hover:scale-105 hover:shadow-xl active:translate-y-0 active:scale-95 transition-all duration-200 animation-delay-200"
          >
            <span className="service-button-icon animate-bounce-in animation-delay-200">🛡️</span>
            Police
          </button>
        </div>

        {/* Location Section */}
        <div className="location-section animate-fade-in-up animation-delay-600">
          <div className="location-content">
            <div className="location-info">
              <h3>Your Location</h3>
              {loading ? (
                <p className="location-loading animate-pulse">Loading location...</p>
              ) : location ? (
                <div className="animate-fade-in">
                  <p className="location-label">Latitude</p>
                  <p className="location-coordinates">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <p className="location-unavailable">Location not available</p>
              )}
            </div>
            <button
              onClick={handleFindSafeZone}
              disabled={!location}
              className="safe-zone-button hover:translate-x-2 hover:shadow-lg active:scale-95 transition-all duration-200 disabled:hover:translate-x-0"
            >
              <MapPin className="w-5 h-5" />
              Find Nearest Safe Zone 🚨
            </button>
          </div>
        </div>

        {/* Quick Access Link */}
        <div className="quick-access">
          <button
            onClick={() => navigate('/dashboard')}
            className="quick-access-link hover:scale-105 transition-transform duration-200"
          >
            Go to Full Dashboard →
          </button>
        </div>

        {/* Admin Access */}
        <div className="admin-access-wrapper">
          <button
            onClick={() => navigate('/admin/login')}
            className="admin-access-button"
          >
            <span className="admin-access-icon">🔒</span>
            <span>Admin Access</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
