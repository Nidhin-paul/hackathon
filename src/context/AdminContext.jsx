import { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Check if admin is logged in on mount
  useEffect(() => {
    const adminData = localStorage.getItem('adminUser');
    if (adminData) {
      try {
        const user = JSON.parse(adminData);
        setAdminUser(user);
        setIsAdmin(true);
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  const login = (username, password) => {
    // Simple authentication - In production, use proper backend authentication
    const ADMIN_CREDENTIALS = {
      username: 'admin',
      password: 'admin123', // Change this in production!
    };

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const user = {
        username,
        role: 'admin',
        loginTime: new Date().toISOString(),
      };
      setAdminUser(user);
      setIsAdmin(true);
      localStorage.setItem('adminUser', JSON.stringify(user));
      return { success: true };
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setAdminUser(null);
    setIsAdmin(false);
    localStorage.removeItem('adminUser');
  };

  const value = {
    isAdmin,
    adminUser,
    login,
    logout,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
