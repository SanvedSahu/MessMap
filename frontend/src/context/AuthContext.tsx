import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'guest' | 'student' | 'owner' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isAuthenticated: boolean;
  college?: string;
  hostel?: string;
  dietaryPref?: string;
  avatar?: string;
  messId?: string;
  messName?: string;
}

export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@messmap.com', password: 'admin', label: 'Admin' },
  owner: { email: 'rajesh.sharma@annapurnamess.com', password: 'owner', label: 'Mess Owner' },
  student: { email: 'rahul.patil@coep.ac.in', password: 'student', label: 'Student' }
};

const DEFAULT_GUEST: AuthUser = {
  id: 'guest',
  name: 'Guest User',
  email: '',
  role: 'guest',
  isAuthenticated: false,
};

interface AuthContextType {
  user: AuthUser;
  isAuthenticated: boolean;
  role: UserRole;
  login: (role: UserRole, email: string, password?: string) => { success: boolean; error?: string };
  registerStudent: (data: { name: string; email: string; phone?: string; college?: string }) => void;
  registerOwner: (data: { name: string; email: string; phone?: string; messName?: string; messId?: string }) => void;
  logout: () => void;
  demoLogin: (role: 'student' | 'owner' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem('messmap_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isAuthenticated === 'boolean') {
          return parsed;
        }
      }
    } catch {
      // fallback to guest
    }
    return DEFAULT_GUEST;
  });

  useEffect(() => {
    try {
      localStorage.setItem('messmap_auth_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  const login = (role: UserRole, email: string, password?: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();

    if (role === 'admin') {
      // Admin authentication validation
      if (
        (trimmedEmail === 'admin@messmap.com' || trimmedEmail === 'admin') &&
        (password === 'admin' || password === 'admin123' || !password)
      ) {
        const adminUser: AuthUser = {
          id: 'adm-001',
          name: 'Chief Admin',
          email: 'admin@messmap.com',
          role: 'admin',
          isAuthenticated: true,
          avatar: 'CA',
        };
        setUser(adminUser);
        return { success: true };
      }
      return { success: false, error: 'Invalid admin credentials. Use admin@messmap.com / admin' };
    }

    if (role === 'owner') {
      const ownerUser: AuthUser = {
        id: 'own-101',
        name: trimmedEmail.includes('@') ? trimmedEmail.split('@')[0].replace('.', ' ') : 'Mess Owner',
        email: trimmedEmail || 'rajesh.sharma@annapurnamess.com',
        phone: '+91 98231 44550',
        role: 'owner',
        isAuthenticated: true,
        messId: 'MESS-101',
        messName: 'Annapurna Deluxe Dining',
        avatar: 'RS',
      };
      setUser(ownerUser);
      return { success: true };
    }

    // Default to student
    const studentUser: AuthUser = {
      id: 'stu-101',
      name: trimmedEmail.includes('@') ? trimmedEmail.split('@')[0].replace('.', ' ') : 'Student User',
      email: trimmedEmail || 'rahul.patil@coep.ac.in',
      phone: '+91 98223 34455',
      role: 'student',
      college: 'COEP Technological University, Pune',
      hostel: 'Block B, Shivajinagar',
      dietaryPref: 'Pure Veg',
      isAuthenticated: true,
      avatar: 'RP',
    };
    setUser(studentUser);
    return { success: true };
  };

  const registerStudent = (data: { name: string; email: string; phone?: string; college?: string }) => {
    const newStudent: AuthUser = {
      id: 'stu-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone || '+91 98000 00000',
      role: 'student',
      college: data.college || 'Pune University Campus',
      hostel: 'Hostel Campus',
      dietaryPref: 'Pure Veg',
      isAuthenticated: true,
      avatar: data.name.substring(0, 2).toUpperCase(),
    };
    setUser(newStudent);
  };

  const registerOwner = (data: { name: string; email: string; phone?: string; messName?: string; messId?: string }) => {
    const newOwner: AuthUser = {
      id: 'own-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone || '+91 98000 00000',
      role: 'owner',
      messId: data.messId || 'MESS-' + Date.now(),
      messName: data.messName || 'My Mess',
      isAuthenticated: true,
      avatar: data.name.substring(0, 2).toUpperCase(),
    };
    setUser(newOwner);
  };

  const logout = () => {
    setUser(DEFAULT_GUEST);
    try {
      localStorage.removeItem('messmap_auth_user');
    } catch {
      // ignore
    }
  };

  const demoLogin = (role: 'student' | 'owner' | 'admin') => {
    const cred = DEMO_CREDENTIALS[role];
    login(role, cred.email, cred.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user.isAuthenticated,
        role: user.role,
        login,
        registerStudent,
        registerOwner,
        logout,
        demoLogin,
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
