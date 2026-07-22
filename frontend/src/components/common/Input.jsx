import React from 'react';

export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border border-slate-300 rounded
          focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200
          disabled:bg-slate-100 disabled:text-slate-400
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
