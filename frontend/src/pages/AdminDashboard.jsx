import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { 
  Shield, LogOut, Users, Phone, Activity, Trash2, Edit, 
  Plus, Search, AlertCircle, Download, RefreshCw, Eye, Menu, X,
  LayoutDashboard, FileText, Settings, HelpCircle, Bell
} from 'lucide-react';
import { contactsAPI, logsAPI, activitiesAPI, panicAlertsAPI } from '../services/api';
import AddContactModal from '../components/AddContactModal';
import socketService from '../services/socket';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminUser, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState('contacts');
  const [contacts, setContacts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalLogs: 0,
    categoryCounts: {},
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panicAlerts, setPanicAlerts] = useState([]);
  const [userCategorySelections, setUserCategorySelections] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'contacts') {
        const response = await contactsAPI.getAll();
        setContacts(response.data);
        calculateStats(response.data);
      } else if (activeTab === 'logs') {
        const response = await logsAPI.getAll();
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const calculateStats = useCallback((contactsData) => {
    const categoryCounts = {};
    contactsData.forEach(contact => {
      categoryCounts[contact.category] = (categoryCounts[contact.category] || 0) + 1;
    });

    setStats({
      totalContacts: contactsData.length,
      totalLogs: logs.length,
      categoryCounts,
    });
  }, [logs.length]);

  useEffect(() => {
    fetchData();
    
    // Connect to Socket.IO (only once)
    if (!socketService.socket) {
      socketService.connect();
    }
  }, [fetchData]); // Re-fetch data when fetchData changes

  const fetchPanicAlerts = async () => {
    try {
      const response = await panicAlertsAPI.getAll({ status: 'active', limit: 50 });
      const alerts = response.data.data || [];
      
      // Transform database alerts to match the expected format
      const formattedAlerts = alerts.map(alert => ({
        id: alert._id,
        message: alert.message,
        timestamp: alert.createdAt,
        user: alert.user,
        location: alert.location,
      }));
      
      setPanicAlerts(formattedAlerts);
      console.log('Loaded panic alerts from database:', formattedAlerts.length);
    } catch (error) {
      console.error('Error fetching panic alerts:', error);
    }
  };

  useEffect(() => {
    // Connect to Socket.IO first
    console.log('AdminDashboard: Setting up socket connection...');
    if (!socketService.socket) {
      socketService.connect();
    }
    
    // Wait a moment for socket to connect
    setTimeout(() => {
      console.log('Socket status:', socketService.socket?.connected ? 'Connected' : 'Not connected');
      console.log('Socket ID:', socketService.socket?.id);
    }, 1000);
    
    fetchUserActivities();
    fetchPanicAlerts();

    // Listen for panic alerts
    const handlePanicAlert = (data) => {
      console.log('🚨 PANIC ALERT RECEIVED IN ADMIN DASHBOARD:', data);
      const alert = {
        id: Date.now(),
        message: data.message,
        timestamp: data.timestamp,
        user: data.user || {
          name: 'Unknown User',
          email: 'No email',
          id: 'unknown'
        },
        location: data.location || null,
      };
      console.log('Adding panic alert to state:', alert);
      setPanicAlerts(prev => {
        const updated = [alert, ...prev];
        console.log('Updated panic alerts:', updated);
        return updated;
      });
      
      // Play alert sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk2CBlou+3nnk0QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBAC');
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Audio creation failed:', e);
      }
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        const userName = data.user?.name || 'Unknown User';
        const locationInfo = data.location?.address || 'Location unavailable';
        new Notification('🚨 EMERGENCY MODE ACTIVATED!', {
          body: `PANIC ALERT: ${userName} has pressed the panic button!\nLocation: ${locationInfo}\n⚠️ Immediate attention required!`,
          icon: '/favicon.ico',
          tag: 'panic-alert',
          requireInteraction: true,
        });
      }
    };

    socketService.onPanicAlert(handlePanicAlert);

    // Listen for user category selections
    const handleUserCategorySelected = (data) => {
      console.log('User category selected:', data);
      const selection = {
        id: Date.now(),
        userName: data.user.name,
        userEmail: data.user.email,
        userId: data.user.id,
        category: data.category,
        timestamp: data.timestamp,
        location: data.location,
      };
      setUserCategorySelections(prev => [selection, ...prev].slice(0, 50)); // Keep last 50
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`User Activity: ${data.user.name}`, {
          body: `Selected ${data.category} category`,
          icon: '/favicon.ico',
          tag: 'user-category',
        });
      }
    };

    socketService.onUserCategorySelected(handleUserCategorySelected);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      socketService.offPanicAlert(handlePanicAlert);
      socketService.offUserCategorySelected(handleUserCategorySelected);
    };
  }, []); // Run only once on mount

  const fetchUserActivities = async () => {
    try {
      const response = await activitiesAPI.getAll({ limit: 50 });
      const activities = response.data.activities || [];
      
      // Transform database activities to match the expected format
      const formattedActivities = activities.map(activity => ({
        id: activity._id,
        userName: activity.userName,
        userEmail: activity.userEmail,
        userId: activity.userId,
        category: activity.category,
        timestamp: activity.timestamp,
        location: activity.location,
      }));
      
      setUserCategorySelections(formattedActivities);
      console.log('Loaded user activities from database:', formattedActivities.length);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsAPI.delete(id);
        fetchData();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        alert('Failed to delete contact: ' + errorMessage);
      }
    }
  };

  const handleEditContact = (contact) => {
    setEditContact(contact);
    setIsModalOpen(true);
  };

  const handleAddContact = async (contactData) => {
    try {
      if (editContact) {
        await contactsAPI.update(editContact._id, contactData);
      } else {
        await contactsAPI.create(contactData);
      }
      fetchData();
      setEditContact(null);
    } catch (error) {
      alert('Failed to save contact: ' + error.message);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(activeTab === 'contacts' ? contacts : logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}-${new Date().toISOString()}.json`;
    link.click();
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    contact.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logs.filter(log =>
    log.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.contactPhone?.includes(searchTerm)
  );

  return (
    <div className="admin-page-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">P</div>
          <span className="admin-sidebar-title">People Hub</span>
        </div>
        
        <nav className="admin-sidebar-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Phone className="admin-nav-icon" />
            <span>Emergency Contacts</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <Activity className="admin-nav-icon" />
            <span>Activity Logs</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'user-activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-activity')}
          >
            <Users className="admin-nav-icon" />
            <span>User Activity</span>
          </button>
          <button className="admin-nav-item" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard className="admin-nav-icon" />
            <span>User Dashboard</span>
          </button>
          <button className="admin-nav-item" onClick={handleLogout}>
            <LogOut className="admin-nav-icon" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main-content">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <button 
              className="admin-mobile-menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="admin-menu-icon" /> : <Menu className="admin-menu-icon" />}
            </button>
            <h1 className="admin-page-title">
              {activeTab === 'contacts' ? 'Emergency Contacts List' : 
               activeTab === 'logs' ? 'Activity Logs' : 'User Activity'}
            </h1>
          </div>
          <div className="admin-header-right">
            {/* Notification Dropdown */}
            <div className="admin-notification-dropdown-wrapper">
              <button 
                className={`admin-notification-bell ${panicAlerts.length > 0 ? 'has-alerts' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell className="admin-bell-icon" />
                {panicAlerts.length > 0 && (
                  <span className="admin-notification-count">
                    {panicAlerts.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifications && (
                <div className="admin-notification-dropdown">
                  <div className="admin-notification-dropdown-header">
                    <h3>Notifications</h3>
                    {panicAlerts.length > 0 && (
                      <button 
                        onClick={() => setPanicAlerts([])}
                        className="admin-clear-all-btn"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  <div className="admin-notification-list">
                    {panicAlerts.length === 0 ? (
                      <div className="admin-no-notifications">
                        <Bell className="admin-no-notif-icon" />
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      <>
                        {panicAlerts.slice(0, 5).map((alert) => (
                          <div key={alert.id} className="admin-notification-item">
                            <div className="admin-notif-icon-wrapper emergency">
                              <AlertCircle className="admin-notif-icon" />
                            </div>
                            <div className="admin-notif-content">
                              <p className="admin-notif-title">🚨 EMERGENCY ALERT!</p>
                              <p className="admin-notif-user">
                                <strong>User:</strong> {alert.user?.name || 'Unknown User'}
                              </p>
                              {alert.user?.email && (
                                <p className="admin-notif-email">
                                  <strong>Email:</strong> {alert.user.email}
                                </p>
                              )}
                              {alert.location?.address && (
                                <p className="admin-notif-location">
                                  <strong>📍 Location:</strong> {alert.location.address}
                                </p>
                              )}
                              <p className="admin-notif-time">
                                🕐 {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPanicAlerts(prev => prev.filter(a => a.id !== alert.id));
                              }}
                              className="admin-notif-dismiss"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {panicAlerts.length > 5 && (
                          <div className="admin-notification-footer">
                            <button className="admin-view-all-btn">
                              + {panicAlerts.length - 5} more alerts
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="admin-user-info">
              <div className="admin-user-avatar">
                {adminUser?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="admin-user-details">
                <span className="admin-user-name">{adminUser?.username || 'Admin'}</span>
                <span className="admin-user-role">Security Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Notification Bar for Panic Alerts */}
        {panicAlerts.length > 0 && (
          <div className="admin-notification-bar">
            <div className="admin-notification-content">
              <div className="admin-notification-icon-wrapper">
                <AlertCircle className="admin-notification-icon animate-pulse" />
              </div>
              <div className="admin-notification-text">
                <strong>🚨 EMERGENCY ALERT!</strong>
                <span className="admin-notification-message">
                  {panicAlerts.length} panic button{panicAlerts.length > 1 ? 's' : ''} pressed! 
                  Latest: {panicAlerts[0].user?.name || 'Unknown User'} - {panicAlerts[0].location?.address || 'Location unavailable'}
                </span>
              </div>
              <button
                onClick={() => {
                  // Scroll to panic alerts section
                  document.querySelector('.admin-content-container')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="admin-notification-button"
              >
                View Details
              </button>
              <button
                onClick={() => setPanicAlerts([])}
                className="admin-notification-close"
                title="Dismiss all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="admin-content-container">
          {/* Panic Alerts Banner */}
          {panicAlerts.length > 0 && (
            <div className="mb-6">
              {panicAlerts.slice(0, 3).map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-red-50 border-l-4 border-red-600 p-4 mb-3 rounded-r-lg shadow-md animate-fade-in-up flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-red-600 text-white p-2 rounded-full animate-pulse">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-red-600 text-white px-3 py-2 rounded-md mb-2 inline-block font-bold text-sm emergency-mode-badge">
                        🚨 EMERGENCY MODE ACTIVATED 🚨
                      </div>
                      <h3 className="text-red-800 font-bold text-lg">{alert.message}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-red-700 font-semibold">
                          👤 User: {alert.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-red-600 text-sm">
                          📧 Email: {alert.user?.email || 'No email'}
                        </p>
                        {alert.location && (
                          <p className="text-red-600 text-sm">
                            📍 Location: {alert.location.address}
                          </p>
                        )}
                        {alert.location && (
                          <p className="text-red-600 text-sm">
                            🗺️ Coordinates: {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                          </p>
                        )}
                        <p className="text-red-600 text-sm">
                          🕐 Time: {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-red-700 text-sm mt-3 font-semibold">
                        ⚠️ Immediate attention required!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPanicAlerts(prev => prev.filter(a => a.id !== alert.id))}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Dismiss"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {panicAlerts.length > 3 && (
                <p className="text-sm text-gray-600 text-center">
                  + {panicAlerts.length - 3} more alert(s)
                </p>
              )}
            </div>
          )}

          <div className="admin-content-header">
            <div>
              <h2 className="admin-content-title">
                {activeTab === 'contacts' ? 'Emergency Contacts' : 'Activity Logs'}
              </h2>
              <p className="admin-contact-count">
                Total: {activeTab === 'contacts' ? filteredContacts.length : filteredLogs.length} {activeTab === 'contacts' ? 'emergency contacts' : 'logs'}
              </p>
            </div>
            {activeTab === 'contacts' && (
              <button
                onClick={() => {
                  setEditContact(null);
                  setIsModalOpen(true);
                }}
                className="admin-add-button"
              >
                <Plus className="admin-plus-icon" />
                Add Emergency Contact
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="admin-loading">
              <div className="admin-loading-spinner"></div>
              <p className="admin-loading-text">Loading {activeTab}...</p>
            </div>
          ) : activeTab === 'contacts' ? (
            <div className="admin-table-wrapper">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Contact Type</th>
                      <th>Category Type</th>
                      <th>Contact Number</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact._id}>
                        <td className="admin-table-name">{contact.name}</td>
                        <td className="admin-table-type">Emergency Contacts</td>
                        <td className="admin-table-category">{contact.category}</td>
                        <td className="admin-table-phone">{contact.phone}</td>
                        <td>
                          <div className="admin-table-actions">
                            <button
                              onClick={() => handleEditContact(contact)}
                              className="admin-table-action-link admin-action-edit"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact._id)}
                              className="admin-table-action-link admin-action-delete"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredContacts.length === 0 && (
                  <div className="admin-empty-state">
                    <AlertCircle className="admin-empty-icon" />
                    <p className="admin-empty-text">No contacts found</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'logs' ? (
            <div className="admin-table-wrapper">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>Contact</th>
                      <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>Phone</th>
                      <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>Location</th>
                      <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontWeight: 600, fontSize: '0.8125rem' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log._id}>
                        <td style={{ textAlign: 'left', padding: '1rem 1.5rem', verticalAlign: 'middle', fontWeight: 500 }}>{log.contactName}</td>
                        <td style={{ textAlign: 'left', padding: '1rem 1.5rem', verticalAlign: 'middle', fontFamily: 'Courier New, monospace' }}>{log.contactPhone}</td>
                        <td style={{ textAlign: 'left', padding: '1rem 1.5rem', verticalAlign: 'middle' }}>{log.userLocation?.address || 'N/A'}</td>
                        <td style={{ textAlign: 'left', padding: '1rem 1.5rem', verticalAlign: 'middle', fontSize: '0.8125rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLogs.length === 0 && (
                  <div className="admin-empty-state">
                    <Activity className="admin-empty-icon" />
                    <p className="admin-empty-text">No logs found</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Category Selected</th>
                      <th>Location</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userCategorySelections.map((selection) => (
                      <tr key={selection.id}>
                        <td className="admin-table-name">{selection.userName}</td>
                        <td className="admin-table-email">{selection.userEmail}</td>
                        <td className="admin-table-category-badge">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selection.category === 'police' ? 'bg-blue-100 text-blue-800' :
                            selection.category === 'fire' ? 'bg-red-100 text-red-800' :
                            selection.category === 'medical' ? 'bg-green-100 text-green-800' :
                            selection.category === 'ambulance' ? 'bg-orange-100 text-orange-800' :
                            selection.category === 'disaster' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {selection.category.toUpperCase()}
                          </span>
                        </td>
                        <td className="admin-table-location">
                          {selection.location?.address || 'Location unavailable'}
                        </td>
                        <td className="admin-table-time">
                          {new Date(selection.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {userCategorySelections.length === 0 && (
                  <div className="admin-empty-state">
                    <Users className="admin-empty-icon" />
                    <p className="admin-empty-text">No user activity yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      User category selections will appear here in real-time
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      <AddContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditContact(null);
        }}
        onSubmit={handleAddContact}
        editContact={editContact}
      />
    </div>
  );
};

export default AdminDashboard;
