import React from 'react';
import AuthLayout from '../layout/AuthLayout';
import LoginForm from './LoginForm';

export default function LoginScreen() {
  return (
    <AuthLayout>
      <div className="bg-white border border-slate-300 rounded p-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Batangas Grill House</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Restaurant Point of Sale</p>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-6">STAFF LOGIN</h2>
        <LoginForm />
      </div>
      <p className="text-center text-xs text-slate-400 mt-6">
        © {new Date().getFullYear()} Batangas Grill House. All rights reserved.
      </p>
    </AuthLayout>
  );
}
