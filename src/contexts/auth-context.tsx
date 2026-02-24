'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User, UserRole, Student, Teacher, Parent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useUserManagement } from './user-management-context';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_STORAGE_KEY = 'ecd-unhcr-auth-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { students, teachers, parents } = useUserManagement();

  useEffect(() => {
    // Check for a logged-in user in session storage
    try {
      const storedUser = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Could not parse user from session storage', e);
      sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }

      const lowerCaseEmail = email.toLowerCase();
      
      let foundUser: (Student | Teacher | Parent) | undefined;
      let userRole: UserRole | undefined;

      const allUsers = [
        ...teachers.map(t => ({...t, role: (t.email.toLowerCase() === 'admin@test.com' ? 'admin' : 'teacher') as UserRole})),
        ...students.map(s => ({...s, role: 'student' as UserRole})),
        ...parents.map(p => ({...p, role: 'parent' as UserRole})),
      ]

      const userAccount = allUsers.find(u => u.email.toLowerCase() === lowerCaseEmail);

      if (!userAccount) {
        throw new Error('Account not found.');
      }

      // Special admin password check
      if (userAccount.role === 'admin' && password !== 'magdisalih') {
        throw new Error('Invalid password for admin account.');
      } else if (userAccount.role !== 'admin' && userAccount.password !== password) {
         throw new Error('Invalid password.');
      }
      
      if (userAccount.role === 'student' && 'status' in userAccount && userAccount.status === 'pending') {
          router.push(`/approve?email=${encodeURIComponent(userAccount.email)}`);
          throw new Error('Your account is pending approval. Please enter the code from your administrator.');
      }
      
      foundUser = userAccount;
      userRole = userAccount.role;

      const authenticatedUser: User = {
        uid: foundUser.id,
        email: foundUser.email,
        displayName: foundUser.name,
        role: userRole,
      };

      setUser(authenticatedUser);
      // Save user to session storage
      try {
        sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
      } catch (e) {
        console.error('Could not save user to session storage', e);
      }


      toast({ title: 'Login Successful' });
      if (window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register') || window.location.pathname.startsWith('/approve')) {
        router.push('/');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    // Remove user from session storage
    try {
        sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    } catch (e) {
        console.error('Could not remove user from session storage', e);
    }
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
