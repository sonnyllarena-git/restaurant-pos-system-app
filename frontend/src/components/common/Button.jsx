import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles = 'font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400 border border-slate-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-200',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm h-10',
    md: 'px-4 py-3 text-base h-12',
    lg: 'px-6 py-4 text-lg h-14',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
