import React, { createContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';
import { generateId } from '../utils/helpers';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const showSuccess = useCallback((message) => showNotification(message, 'success'), [showNotification]);
  const showError = useCallback((message) => showNotification(message, 'error'), [showNotification]);
  const showWarning = useCallback((message) => showNotification(message, 'warning'), [showNotification]);
  const showInfo = useCallback((message) => showNotification(message, 'info'), [showNotification]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 w-80 space-y-0">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
