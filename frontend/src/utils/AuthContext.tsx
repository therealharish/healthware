import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'patient' | 'doctor' | null;
  userEmail: string | null;
  login: (userType: 'patient' | 'doctor', email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = (type: 'patient' | 'doctor', email: string) => {
    setIsAuthenticated(true);
    setUserType(type);
    setUserEmail(email);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
