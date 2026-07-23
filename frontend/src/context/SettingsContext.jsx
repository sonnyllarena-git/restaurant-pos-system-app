import React, { createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_TAX_RATE, CURRENCY } from '../utils/constants';

export const SettingsContext = createContext();

const defaultSettings = {
  restaurantName: "Jayden's Grill & Restaurant",
  establishedYear: 2022,
  address: '',
  phone: '',
  taxRate: DEFAULT_TAX_RATE,
  currency: CURRENCY,
  printer: {
    name: 'Default Receipt Printer',
    paperWidth: '80mm',
    autoPrint: true,
  },
  backup: {
    autoBackup: true,
    frequency: 'daily',
    lastBackup: null,
  },
  database: {
    location: 'local',
    version: '1.0.0',
  },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('pos_settings', defaultSettings);

  const updateSettings = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
