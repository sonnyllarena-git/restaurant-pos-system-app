import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

export default function PageHeader({ title, dark = false, onBack }) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <div
      className={`flex items-center justify-between px-6 py-4 border-b ${
        dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}
    >
      <Button variant="ghost" size="sm" onClick={handleBack}>
        ← Back
      </Button>
      <h2 className={`text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
        🏠 Home
      </Button>
    </div>
  );
}
