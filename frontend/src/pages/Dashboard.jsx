import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Phone, Home } from 'lucide-react';
import EmergencyCard from '../components/EmergencyCard';
import LocationTracker from '../components/LocationTracker';
import Notification from '../components/Notification';
import { contactsAPI, logsAPI } from '../services/api';
import { getCurrentLocation, getAddressFromCoordinates } from '../utils/geolocation';
import socketService from '../services/socket';

function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notifications, setNotifications] = useState([]);

  const categories = [
    { value: 'all', label: 'All', icon: '📱' },
    { value: 'police', label: 'Police', icon: '🚓' },
    { value: 'fire', label: 'Fire', icon: '🚒' },
    { value: 'medical', label: 'Medical', icon: '🏥' },
    { value: 'ambulance', label: 'Ambulance', icon: '🚑' },
    { value: 'disaster', label: 'Disaster', icon: '⚠️' },
    { value: 'other', label: 'Other', icon: '📞' },
  ];

  // Add notification helper
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    fetchContacts();
    
    // Check for URL parameters
    const category = searchParams.get('category');
    const panic = searchParams.get('panic');
    
    if (category) {
      setSelectedCategory(category);
    }
    
    if (panic === 'true') {
      // Show all emergency contacts in panic mode
      setSelectedCategory('all');
      
      // Get user info and location for panic alert
      const sendPanicAlert = async () => {
        // Get user info from localStorage
        const userStr = localStorage.getItem('user');
        let user = null;
        if (userStr) {
          try {
            user = JSON.parse(userStr);
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }
        
        // Get current location
        let location = null;
        let address = 'Location unavailable';
        try {
          location = await getCurrentLocation();
          address = await getAddressFromCoordinates(location.latitude, location.longitude);
        } catch (err) {
          console.error('Error getting location:', err);
        }
        
        // Emit panic alert to admin with user info
        const panicData = {
          message: 'PANIC BUTTON PRESSED!',
          timestamp: new Date().toISOString(),
          user: user ? {
            name: user.name || 'Unknown User',
            email: user.email || 'No email',
            id: user._id || user.id || 'unknown'
          } : {
            name: 'Guest User',
            email: 'Not logged in',
            id: 'guest'
          },
          location: location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            address: address
          } : null
        };
        console.log('🚨 EMITTING PANIC ALERT:', panicData);
        socketService.emitPanicAlert(panicData);
      };
      
      sendPanicAlert();
      
      addNotification('🚨 Emergency mode activated! All contacts displayed.', 'error');
    }

    // Connect to Socket.IO
    socketService.connect();

    // Set up real-time listeners
    const handleContactCreated = (contact) => {
      console.log('Contact created:', contact);
      setContacts(prev => [contact, ...prev]);
      addNotification(`New contact "${contact.name}" added`, 'success');
    };

    const handleContactUpdated = (contact) => {
      console.log('Contact updated:', contact);
      setContacts(prev => prev.map(c => c._id === contact._id ? contact : c));
      addNotification(`Contact "${contact.name}" updated`, 'info');
    };

    const handleContactDeleted = (data) => {
      console.log('Contact deleted:', data);
      setContacts(prev => {
        const deletedContact = prev.find(c => c._id === data._id);
        if (deletedContact) {
          addNotification(`Contact "${deletedContact.name}" deleted`, 'info');
        }
        return prev.filter(c => c._id !== data._id);
      });
    };

    socketService.onContactCreated(handleContactCreated);
    socketService.onContactUpdated(handleContactUpdated);
    socketService.onContactDeleted(handleContactDeleted);

    // Cleanup
    return () => {
      socketService.offContactCreated(handleContactCreated);
      socketService.offContactUpdated(handleContactUpdated);
      socketService.offContactDeleted(handleContactDeleted);
    };
  }, [searchParams]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, selectedCategory]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getAll();
      setContacts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load emergency contacts. Please check if the backend server is running.');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((contact) => contact.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone.includes(searchTerm) ||
          contact.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  };

  // Handle category button click
  const handleCategoryClick = async (categoryValue) => {
    setSelectedCategory(categoryValue);
    
    // Skip tracking for 'all' category
    if (categoryValue === 'all') {
      return;
    }
    
    // Get user info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Get current location
        let location = null;
        let address = 'Location unavailable';
        try {
          location = await getCurrentLocation();
          address = await getAddressFromCoordinates(location.latitude, location.longitude);
        } catch (err) {
          console.error('Error getting location:', err);
        }
        
        // Ensure socket is connected
        if (!socketService.socket || !socketService.socket.connected) {
          console.log('Socket not connected, connecting now...');
          socketService.connect();
          // Wait a bit for connection
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const activityData = {
          user: {
            name: user.name,
            email: user.email,
            id: user._id || user.id
          },
          category: categoryValue,
          timestamp: new Date().toISOString(),
          location: location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            address: address
          } : null
        };
        
        console.log('Emitting user:category-selected:', activityData);
        
        // Emit category selection to admin dashboard
        socketService.emit('user:category-selected', activityData);
        
        addNotification(`Selected ${categoryValue} category`, 'info');
      } catch (err) {
        console.error('Error sending category selection:', err);
      }
    }
  };

  // Edit and delete functions removed - admin only

  const handleCallContact = async (contact) => {
    try {
      // Get current location
      const location = await getCurrentLocation();
      const address = await getAddressFromCoordinates(location.latitude, location.longitude);

      // Log the emergency call
      await logsAPI.create({
        contactId: contact._id,
        contactName: contact.name,
        contactPhone: contact.phone,
        userLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: address,
        },
      });

      // Initiate phone call
      window.location.href = `tel:${contact.phone}`;
    } catch (err) {
      console.error('Error logging call:', err);
      // Still allow the call even if logging fails
      window.location.href = `tel:${contact.phone}`;
    }
  };

  return (
    <div className="dashboard-background animate-fade-in">
      {/* Header */}
      <header className="dashboard-header animate-slide-in-down">
        <div className="dashboard-header-container">
          <div className="dashboard-header-content">
            <div className="dashboard-logo-section">
              {/* <AlertCircle className="dashboard-logo-icon" /> */}
              <div className="dashboard-title-section">
                <h1>Emergency Contact Hub</h1>
                <p>Quick access to emergency services</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="back-to-home-button"
            >
              <Home className="back-to-home-icon" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Location Tracker */}
        <div className="location-tracker-wrapper">
          <LocationTracker />
        </div>

        {/* Search and Filter */}
        <div className="search-filter-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Search className="search-icon" />
          </div>
          <div className="category-buttons-container">
            {categories.map((category, index) => (
              <button
                key={category.value}
                onClick={() => handleCategoryClick(category.value)}
                className={`category-button ${
                  selectedCategory === category.value
                    ? `category-button-${category.value}`
                    : 'category-button-inactive'
                }`}
              >
                <span className="category-icon">
                  {category.icon}
                </span>
                <span className="category-label">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <div className="error-content">
              <AlertCircle className="error-icon" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading emergency contacts...</p>
          </div>
        )}

        {/* Contacts Grid */}
        {!loading && filteredContacts.length > 0 && (
          <div className="contacts-grid">
            {filteredContacts.map((contact, index) => (
              <div key={contact._id} className="stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <EmergencyCard
                  contact={contact}
                  onCall={handleCallContact}
                />
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredContacts.length === 0 && !error && (
          <div className="no-results">
            <Phone className="no-results-icon" />
            <h3 className="no-results-title">No contacts found</h3>
            <p className="no-results-text">Try adjusting your search or add a new contact.</p>
          </div>
        )}
      </main>

      {/* Real-time Notifications */}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

export default Dashboard;
