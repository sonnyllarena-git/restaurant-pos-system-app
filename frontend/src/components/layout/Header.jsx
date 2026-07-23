import React, { useState, useContext } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Logo from '../common/Logo';
import LogoutModal from '../auth/LogoutModal';
import { SettingsContext } from '../../context/SettingsContext';

export default function Header() {
  const { user } = useAuth();
  const { settings } = useContext(SettingsContext);
  const [showLogout, setShowLogout] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6">
      <div className="flex-1 flex items-center gap-3">
        <Logo alt={`${settings.restaurantName} logo`} />
        <h1 className="text-lg font-bold text-slate-900">{settings.restaurantName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">{user?.fullName} • {user?.role}</span>
        <Button variant="secondary" size="sm" onClick={() => setShowLogout(true)}>
          Logout
        </Button>
      </div>
      {showLogout && <LogoutModal onClose={() => setShowLogout(false)} />}
    </header>
  );
}
