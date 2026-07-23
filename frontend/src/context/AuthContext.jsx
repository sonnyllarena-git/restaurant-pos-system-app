import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      if (!username || !password) {
        reject(new Error('Username and password are required'));
        return;
      }
      setTimeout(() => {
        // No real auth backend here, so role is inferred from the mock username so
        // QA can exercise role-gated UI without a schema/backend change.
        const lowerUsername = username.toLowerCase();
        let role = 'admin';
        if (lowerUsername.includes('cashier')) role = 'cashier';
        else if (lowerUsername.includes('kitchen')) role = 'kitchen';
        else if (lowerUsername.includes('viewer')) role = 'viewer';

        const mockUser = {
          id: '1',
          username,
          fullName: 'John Doe',
          role,
          loginTime: new Date().toISOString(),
        };
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(mockUser));
        resolve(mockUser);
      }, 600);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const hasRole = (role) => user?.role === role;

  const canAccess = (requiredRoles) => {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user?.role);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, hasRole, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}
