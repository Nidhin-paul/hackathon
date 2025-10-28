import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { getCurrentLocation, getAddressFromCoordinates, openInMaps } from '../utils/geolocation';
import './LocationTracker.css';

const LocationTracker = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLocation = async () => {
    setLoading(true);
    setError('');
    try {
      const position = await getCurrentLocation();
      setLocation(position);
      const addr = await getAddressFromCoordinates(position.latitude, position.longitude);
      setAddress(addr);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <div className="location-tracker">
      <div className="location-tracker-header">
        <div className="location-tracker-title-wrapper">
          <MapPin className="location-tracker-icon" />
          <h2 className="location-tracker-title">Your Location</h2>
        </div>
        <button
          onClick={fetchLocation}
          disabled={loading}
          className="location-tracker-refresh-button"
        >
          <Navigation className="w-4 h-4" />
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="location-tracker-error">
          <p className="location-tracker-error-text">{error}</p>
        </div>
      )}

      {location && (
        <div className="location-tracker-content">
          <div className="location-tracker-address-card">
            <p className="location-tracker-address-label">Address</p>
            <p className="location-tracker-address-text">{address || 'Fetching address...'}</p>
          </div>
          
          <div className="location-tracker-coordinates">
            <div className="location-tracker-coordinate-card">
              <p className="location-tracker-coordinate-label">Latitude</p>
              <p className="location-tracker-coordinate-value">{location.latitude.toFixed(6)}</p>
            </div>
            <div className="location-tracker-coordinate-card">
              <p className="location-tracker-coordinate-label">Longitude</p>
              <p className="location-tracker-coordinate-value">{location.longitude.toFixed(6)}</p>
            </div>
          </div>

          <button
            onClick={() => openInMaps(location.latitude, location.longitude)}
            className="location-tracker-maps-button"
          >
            <MapPin className="w-5 h-5" />
            Open in Maps
          </button>
        </div>
      )}

      {!location && !loading && !error && (
        <div className="location-tracker-empty">
          <MapPin className="location-tracker-empty-icon" />
          <p className="location-tracker-empty-text">Location not available</p>
        </div>
      )}
    </div>
  );
};

export default LocationTracker;
