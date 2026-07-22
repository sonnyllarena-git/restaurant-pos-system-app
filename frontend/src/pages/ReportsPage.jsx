import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';

export default function ReportsPage() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded text-sm font-medium transition-colors ${
      isActive ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }`;

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Reports" />
      <div className="flex gap-2 px-6 pt-6">
        <NavLink to="/reports" end className={linkClass}>
          Overview
        </NavLink>
        <NavLink to="/reports/daily" className={linkClass}>
          Daily
        </NavLink>
        <NavLink to="/reports/monthly" className={linkClass}>
          Monthly
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
