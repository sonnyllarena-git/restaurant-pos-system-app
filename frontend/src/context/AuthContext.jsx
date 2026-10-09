import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

// Demo accounts. There is no backend, so credentials are checked against this list.
const ACCOUNTS = [
  { id: '1', username: 'sonny', password: 'llarena', fullName: 'Sonny Llarena', role: 'admin' },
  { id: '2', username: 'cashier', password: 'cashier', fullName: 'Cashier', role: 'cashier' },
];

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
        const account = ACCOUNTS.find(
          (a) => a.username === username.trim().toLowerCase() && a.password === password
        );
        if (!account) {
          reject(new Error('Invalid username or password'));
          return;
        }

        const { password: _omit, ...safeAccount } = account;
        const loggedInUser = { ...safeAccount, loginTime: new Date().toISOString() };
        setUser(loggedInUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        resolve(loggedInUser);
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
