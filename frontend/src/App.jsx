import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import { UIProvider } from './context/UIContext';
import AppRouter from './router';
import { seedMenuItemsIfEmpty } from './services/dbService';
import { SEED_MENU_ITEMS } from './utils/seedData';

export default function App() {
  useEffect(() => {
    seedMenuItemsIfEmpty(SEED_MENU_ITEMS);
  }, []);

  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <OrderProvider>
            <CartProvider>
              <UIProvider>
                <AppRouter />
              </UIProvider>
            </CartProvider>
          </OrderProvider>
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
