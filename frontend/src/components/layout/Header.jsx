import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import LogoutModal from '../auth/LogoutModal';

export default function Header() {
  const { user } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6">
      <div className="flex-1">
        <h1 className="text-lg font-bold text-slate-900">Restaurant POS</h1>
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
