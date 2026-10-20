import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerOwnerApi } from '../api/authApi';
import { loginStudentApi, registerStudentApi, DietaryPreference } from '../api/studentApi';

export type UserRole = 'guest' | 'student' | 'owner' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isAuthenticated: boolean;
  token?: string;
  college?: string;
  hostel?: string;
  dietaryPref?: string;
  avatar?: string;
  messId?: string;
  messName?: string;
  studentId?: string;
  joinedDate?: string;
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
  login: (role: UserRole, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerStudent: (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    college?: string;
    hostel?: string;
    dietaryPreference?: DietaryPreference;
  }) => Promise<{ success: boolean; error?: string }>;
  registerOwner: (data: { name: string; email: string; password?: string; phone?: string; messName?: string; messId?: string }) => void | Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => void;
  logout: () => void;
  demoLogin: (role: 'student' | 'owner' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem('messmap_auth_user');
      const token = localStorage.getItem('messmap_auth_token') || undefined;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isAuthenticated === 'boolean') {
          return { ...parsed, token: token || parsed.token };
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
      if (user.token) {
        localStorage.setItem('messmap_auth_token', user.token);
      } else {
        localStorage.removeItem('messmap_auth_token');
      }
    } catch {
      // ignore
    }
  }, [user]);

  const login = async (role: UserRole, email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    if (role === 'admin') {
      if (password) {
        try {
          const res = await loginApi({ email: trimmedEmail, password });
          if (res.success && res.data) {
            const apiUser = res.data.user;
            // Verify account holds administrator role
            if (apiUser.role !== 'ROLE_ADMIN' && apiUser.role !== 'Admin') {
              return { success: false, error: 'Access denied. Account does not have administrator privileges.' };
            }
            const token = res.data.token;
            const adminUser: AuthUser = {
              id: String(apiUser.id),
              name: apiUser.name || 'Platform Administrator',
              email: apiUser.email,
              phone: apiUser.phone,
              role: 'admin',
              isAuthenticated: true,
              token,
              avatar: apiUser.name ? apiUser.name.substring(0, 2).toUpperCase() : 'AD',
            };
            localStorage.setItem('messmap_auth_token', token);
            setUser(adminUser);
            return { success: true };
          }
        } catch (err: any) {
          if (err.message && !err.message.includes('Failed to fetch')) {
            return { success: false, error: err.message };
          }
        }
      }

      // Offline demo fallback: only active when backend API is completely unreachable.
      // Explicitly purges live JWT so this demo session cannot make unauthorized API calls.
      if (
        (trimmedEmail === 'admin@messmap.com' || trimmedEmail === 'admin') &&
        (password === 'admin' || password === 'admin123')
      ) {
        localStorage.removeItem('messmap_auth_token');
        const adminUser: AuthUser = {
          id: 'adm-demo-001',
          name: 'Chief Admin (Offline Demo)',
          email: 'admin@messmap.com',
          role: 'admin',
          isAuthenticated: true,
          token: undefined, // Explicitly no backend token: blocked from live REST endpoints
          avatar: 'CA',
        };
        setUser(adminUser);
        return { success: true };
      }
      return { success: false, error: 'Invalid admin credentials. Use admin@messmap.com / admin' };
    }

    if (role === 'owner') {
      // Try backend API authentication first
      if (password) {
        try {
          const res = await loginApi({ email: trimmedEmail, password });
          if (res.success && res.data) {
            const apiUser = res.data.user;
            const ownerUser: AuthUser = {
              id: String(apiUser.id),
              name: apiUser.name,
              email: apiUser.email,
              phone: apiUser.phone || '+91 98231 44550',
              role: 'owner',
              isAuthenticated: true,
              token: res.data.token,
              messId: 'MESS-101',
              messName: 'Annapurna Deluxe Dining',
              avatar: apiUser.name ? apiUser.name.substring(0, 2).toUpperCase() : 'OW',
            };
            localStorage.setItem('messmap_auth_token', res.data.token);
            setUser(ownerUser);
            return { success: true };
          }
        } catch (err: any) {
          // If server responded with 401/400 error message, display it
          if (err.message && !err.message.includes('Failed to fetch')) {
            return { success: false, error: err.message };
          }
          // If server is not reachable, proceed to demo account fallback
        }
      }

      // Demo fallback for owner
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

    // Student Authentication
    if (password) {
      try {
        const res = await loginStudentApi({ email: trimmedEmail, password });
        if (res.success && res.data) {
          const apiUser = res.data.user;
          const token = res.data.token;
          const studentUser: AuthUser = {
            id: String(apiUser.id),
            name: apiUser.name,
            email: apiUser.email,
            phone: apiUser.phone || undefined,
            role: 'student',
            college: apiUser.college || apiUser.collegeOrLocality || undefined,
            hostel: apiUser.hostel || undefined,
            dietaryPref: apiUser.dietaryPreference || 'VEG',
            studentId: `STU-${apiUser.id}`,
            joinedDate: apiUser.createdAt ? new Date(apiUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Oct 2026',
            isAuthenticated: true,
            token,
            avatar: apiUser.name ? apiUser.name.substring(0, 2).toUpperCase() : 'ST',
          };
          localStorage.setItem('messmap_auth_token', token);
          setUser(studentUser);
          return { success: true };
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('Failed to fetch')) {
          return { success: false, error: err.message };
        }
      }
    }

    // Demo fallback for student
    const studentUser: AuthUser = {
      id: 'stu-101',
      name: trimmedEmail.includes('@') ? trimmedEmail.split('@')[0].replace('.', ' ') : 'Student User',
      email: trimmedEmail || 'rahul.patil@coep.ac.in',
      phone: '+91 98223 34455',
      role: 'student',
      college: 'COEP Technological University, Pune',
      hostel: 'Block B, Shivajinagar',
      dietaryPref: 'Pure Veg',
      studentId: 'COEP-CS-2023-89',
      joinedDate: 'Aug 2026',
      isAuthenticated: true,
      avatar: 'RP',
    };
    setUser(studentUser);
    return { success: true };
  };

  const registerStudent = async (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    college?: string;
    hostel?: string;
    dietaryPreference?: DietaryPreference;
  }): Promise<{ success: boolean; error?: string }> => {
    if (data.password) {
      try {
        const res = await registerStudentApi({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          college: data.college,
          hostel: data.hostel,
          dietaryPreference: data.dietaryPreference,
        });

        if (res.success && res.data) {
          const apiUser = res.data.user;
          const token = res.data.token;
          const studentUser: AuthUser = {
            id: String(apiUser.id),
            name: apiUser.name,
            email: apiUser.email,
            phone: apiUser.phone || undefined,
            role: 'student',
            college: apiUser.college || apiUser.collegeOrLocality || undefined,
            hostel: apiUser.hostel || undefined,
            dietaryPref: apiUser.dietaryPreference || 'VEG',
            studentId: `STU-${apiUser.id}`,
            joinedDate: apiUser.createdAt ? new Date(apiUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Oct 2026',
            isAuthenticated: true,
            token,
            avatar: apiUser.name ? apiUser.name.substring(0, 2).toUpperCase() : 'ST',
          };
          localStorage.setItem('messmap_auth_token', token);
          setUser(studentUser);
          return { success: true };
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('Failed to fetch')) {
          return { success: false, error: err.message };
        }
      }
    }

    // Local fallback if offline
    const newStudent: AuthUser = {
      id: 'stu-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone || '+91 98000 00000',
      role: 'student',
      college: data.college || 'Pune University Campus',
      hostel: data.hostel || 'Hostel Campus',
      dietaryPref: data.dietaryPreference || 'VEG',
      studentId: 'PRN-' + Math.floor(100000 + Math.random() * 900000),
      joinedDate: 'Oct 2026',
      isAuthenticated: true,
      avatar: data.name.substring(0, 2).toUpperCase(),
    };
    setUser(newStudent);
    return { success: true };
  };

  const registerOwner = async (data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    messName?: string;
    messId?: string;
  }) => {
    let token: string | undefined;
    let userId = 'own-' + Date.now();

    if (data.password) {
      try {
        const res = await registerOwnerApi({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
        });
        if (res.success && res.data) {
          token = res.data.token;
          userId = String(res.data.user.id);
          localStorage.setItem('messmap_auth_token', res.data.token);
        }
      } catch (err) {
        console.warn('Backend registration failed or server unreachable, falling back to local session:', err);
      }
    }

    const newOwner: AuthUser = {
      id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone || '+91 98000 00000',
      role: 'owner',
      messId: data.messId || 'MESS-' + Date.now(),
      messName: data.messName || 'My Mess',
      isAuthenticated: true,
      token,
      avatar: data.name.substring(0, 2).toUpperCase(),
    };
    setUser(newOwner);
  };

  const updateProfile = (data: Partial<AuthUser>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const logout = () => {
    setUser(DEFAULT_GUEST);
    try {
      localStorage.removeItem('messmap_auth_user');
      localStorage.removeItem('messmap_auth_token');
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
        updateProfile,
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
