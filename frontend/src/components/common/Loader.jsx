import React from 'react';

export default function Loader({ size = 'md', label = 'Loading...' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <div
        className={`${sizes[size]} rounded-full border-slate-300 border-t-orange-500 animate-spin-slow`}
      />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}
