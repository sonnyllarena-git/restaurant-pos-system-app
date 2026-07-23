import React, { useContext } from 'react';
import AuthLayout from '../layout/AuthLayout';
import LoginForm from './LoginForm';
import { SettingsContext } from '../../context/SettingsContext';
import Logo from '../common/Logo';

export default function LoginScreen() {
  const { settings } = useContext(SettingsContext);

  return (
    <AuthLayout>
      <div className="bg-white border border-slate-300 rounded p-8 flex flex-col items-center">
        <Logo size="h-16 w-16" alt={`${settings.restaurantName} logo`} className="mb-3" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{settings.restaurantName}</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Restaurant Point of Sale</p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-6">STAFF LOGIN</h2>
        <LoginForm />
      </div>
      <p className="text-center text-xs text-slate-400 mt-6">
        © {new Date().getFullYear()} {settings.restaurantName}. All rights reserved.
      </p>
    </AuthLayout>
  );
}
