import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
  { path: '/pos', label: 'POS', roles: ['admin', 'cashier'] },
  { path: '/kitchen', label: 'Kitchen Display', roles: ['admin', 'kitchen'] },
  { path: '/inventory', label: 'Inventory', roles: ['admin', 'cashier'] },
  { path: '/reports', label: 'Reports', roles: ['admin', 'cashier', 'viewer'] },
  { path: '/order-history', label: 'Order History', roles: ['admin', 'cashier', 'viewer'] },
  { path: '/staff', label: 'Staff Management', roles: ['admin'] },
  { path: '/settings', label: 'Settings', roles: ['admin'] },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const visibleItems = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 h-full shrink-0">
      <nav className="p-4 space-y-2">
        {visibleItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded text-sm font-medium transition-colors ${
              location.pathname.startsWith(item.path)
                ? 'bg-orange-100 text-orange-700'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
