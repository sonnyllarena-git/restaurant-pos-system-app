import React from 'react';
import { useKeyboard } from '../../hooks/useKeyboard';

export default function Modal({ children, onClose, title = null, size = 'md', className = '' }) {
  useKeyboard('Escape', () => onClose && onClose(), Boolean(onClose));

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`bg-white border border-slate-300 rounded w-full ${sizes[size] || sizes.md} max-h-[90vh] overflow-y-auto ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-900 text-xl leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
