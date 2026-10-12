import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEFAULT_USER = {
  id: 'usr-101',
  name: 'Rahul Patil',
  email: 'rahul.patil@coep.ac.in',
  phone: '+91 98223 34455',
  college: 'COEP Technological University, Pune',
  hostel: 'Hostel Block B, Room 304, Shivajinagar',
  dietaryPref: 'Pure Veg',
  joinedDate: 'August 2026',
  studentId: 'COEP-CS-2023-89',
  avatar: 'RP',
  isAuthenticated: true
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('messmap_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  useEffect(() => {
    localStorage.setItem('messmap_user', JSON.stringify(user));
  }, [user]);

  const login = (email, password) => {
    // Mock login logic
    const loggedUser = {
      ...DEFAULT_USER,
      email: email || DEFAULT_USER.email,
      name: email.includes('@') ? email.split('@')[0].replace('.', ' ') : 'Student User',
      isAuthenticated: true
    };
    setUser(loggedUser);
    return { success: true };
  };

  const register = (formData) => {
    const newUser = {
      id: 'usr-' + Date.now(),
      name: formData.name || 'New Student',
      email: formData.email,
      phone: formData.phone || '+91 98000 00000',
      college: formData.college || 'Pune University Affiliated College',
      hostel: formData.hostel || 'Hostel Campus',
      dietaryPref: formData.dietaryPref || 'Pure Veg',
      studentId: formData.studentId || 'MM-' + Math.floor(1000 + Math.random() * 9000),
      joinedDate: 'October 2026',
      avatar: formData.name ? formData.name.substring(0, 2).toUpperCase() : 'ST',
      isAuthenticated: true
    };
    setUser(newUser);
    return { success: true };
  };

  const updateProfile = (data) => {
    setUser((prev) => ({
      ...prev,
      ...data,
      avatar: (data.name || prev.name).substring(0, 2).toUpperCase()
    }));
    return { success: true };
  };

  const logout = () => {
    setUser((prev) => ({
      ...prev,
      isAuthenticated: false
    }));
  };

  const demoLogin = () => {
    setUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user?.isAuthenticated,
        login,
        register,
        updateProfile,
        logout,
        demoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
