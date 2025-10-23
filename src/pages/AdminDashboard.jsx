import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { 
  Shield, LogOut, Users, Phone, Activity, Trash2, Edit, 
  Plus, Search, AlertCircle, Download, RefreshCw, Eye, Menu, X,
  LayoutDashboard, FileText, Settings, HelpCircle
} from 'lucide-react';
import { contactsAPI, logsAPI, activitiesAPI } from '../services/api';
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

  useEffect(() => {
    fetchData();
    
    // Connect to Socket.IO (only once)
    if (!socketService.socket) {
      socketService.connect();
    }
  }, [activeTab]); // Re-fetch data when tab changes

  useEffect(() => {
    fetchUserActivities();

    // Listen for panic alerts
    const handlePanicAlert = (data) => {
      console.log('Panic alert received:', data);
      const alert = {
        id: Date.now(),
        message: data.message,
        timestamp: data.timestamp,
      };
      setPanicAlerts(prev => [alert, ...prev]);
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 PANIC ALERT!', {
          body: 'A user has pressed the panic button!',
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

  const fetchData = async () => {
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
  };

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

  const calculateStats = (contactsData) => {
    const categoryCounts = {};
    contactsData.forEach(contact => {
      categoryCounts[contact.category] = (categoryCounts[contact.category] || 0) + 1;
    });

    setStats({
      totalContacts: contactsData.length,
      totalLogs: logs.length,
      categoryCounts,
    });
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
        alert('Failed to delete contact: ' + error.message);
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
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="admin-page-title">
              {activeTab === 'contacts' ? 'Emergency Contacts List' : 
               activeTab === 'logs' ? 'Activity Logs' : 'User Activity'}
            </h1>
          </div>
          <div className="admin-header-right">
            {/* Panic Alert Badge */}
            {panicAlerts.length > 0 && (
              <div className="relative">
                <button 
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all animate-pulse"
                  title={`${panicAlerts.length} panic alert(s)`}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {panicAlerts.length}
                  </span>
                </button>
              </div>
            )}
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
                    <div>
                      <h3 className="text-red-800 font-bold text-lg">🚨 {alert.message}</h3>
                      <p className="text-red-600 text-sm mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                      <p className="text-red-700 text-sm mt-2">
                        A user has activated the emergency panic button. Immediate attention required!
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
                <Plus className="w-4 h-4" />
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
                      <th>Name</th>
                      <th>Contact Type</th>
                      <th>Category Type</th>
                      <th>Contact Number</th>
                      <th>Action</th>
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
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="admin-table-action-link"
                          >
                            Edit
                          </button>
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
                      <th>Contact</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log._id}>
                        <td className="admin-table-name">{log.contactName}</td>
                        <td className="admin-table-phone">{log.contactPhone}</td>
                        <td className="admin-table-category">{log.userLocation?.address || 'N/A'}</td>
                        <td className="admin-table-type">{new Date(log.createdAt).toLocaleString()}</td>
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
                        <td className="admin-table-phone">{selection.userEmail}</td>
                        <td>
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
                        <td className="admin-table-category">
                          {selection.location?.address || 'Location unavailable'}
                        </td>
                        <td className="admin-table-type">
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
