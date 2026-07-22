import React from 'react';

export default function Card({ children, className = '', onClick = null, hoverable = false }) {
  return (
    <div
      className={`
        bg-white border border-slate-300 p-4 rounded
        ${hoverable ? 'hover:shadow-md cursor-pointer transition-shadow' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
