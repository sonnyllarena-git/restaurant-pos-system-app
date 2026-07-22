import React from 'react';

export default function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-amber-100 text-amber-800 border-amber-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
    neutral: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <span
      className={`inline-block px-2 py-1 rounded text-xs font-medium border ${variants[variant] || variants.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
