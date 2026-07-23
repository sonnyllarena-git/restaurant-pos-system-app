import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SettingsContext } from '../context/SettingsContext';
import Header from '../components/layout/Header';

const HOME_TILES = [
  { path: '/pos', label: 'POS', icon: '🛒', color: '#BFDBFE', roles: ['admin', 'cashier'] },
  { path: '/kitchen', label: 'Kitchen', icon: '🍳', color: '#BBFBDC', roles: ['admin', 'kitchen'] },
  { path: '/inventory', label: 'Inventory', icon: '📦', color: '#FEF08A', roles: ['admin', 'cashier'] },
  { path: '/reports', label: 'Reports', icon: '📊', color: '#E9D5FF', roles: ['admin', 'cashier', 'viewer'] },
  { path: '/staff', label: 'Staff', icon: '👥', color: '#FBCFE8', roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: '⚙️', color: '#FEDA75', roles: ['admin'] },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useContext(SettingsContext);

  const visibleTiles = HOME_TILES.filter((tile) => tile.roles.includes(user?.role));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <div className="relative flex-1 flex flex-col">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/logo.png)', backgroundSize: '500px' }}
          aria-hidden="true"
        />
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{settings.restaurantName}</h1>
          {settings.establishedYear && (
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Est. {settings.establishedYear}</p>
          )}
          <p className="text-sm text-slate-600 mb-10">
            {user?.fullName} • <span className="capitalize">{user?.role}</span>
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-w-2xl">
            {visibleTiles.map((tile) => (
              <button
                key={tile.path}
                onClick={() => navigate(tile.path)}
                style={{ backgroundColor: tile.color }}
                className="aspect-square rounded flex flex-col items-center justify-center gap-2 border border-slate-300 transition-transform hover:scale-105 hover:shadow-lg"
              >
                <span className="text-4xl">{tile.icon}</span>
                <span className="text-base font-semibold text-slate-900">{tile.label}</span>
              </button>
            ))}
          </div>
        </div>
        <footer className="relative text-center text-xs text-slate-500 py-4">
          © {new Date().getFullYear()} {settings.restaurantName}. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
