import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuthState, UserRole } from '../types';
import { getStaff } from '../store';

interface AuthContextType {
  auth: AuthState;
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isKitchen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'hotel_auth_state';

function getStoredAuth(): AuthState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return { isLoggedIn: false, role: null, username: '' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(getStoredAuth);

  const login = useCallback((username: string, password: string, role: UserRole): boolean => {
    const staffList = getStaff();
    const staffMember = staffList.find((s) => s.username === username && s.password === password && s.active);

    if (staffMember && staffMember.role === role) {
      const newState: AuthState = { isLoggedIn: true, role: staffMember.role, username: staffMember.username };
      setAuth(newState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    const newState: AuthState = { isLoggedIn: false, role: null, username: '' };
    setAuth(newState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAdmin: auth.role === 'admin', isKitchen: auth.role === 'kitchen' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
