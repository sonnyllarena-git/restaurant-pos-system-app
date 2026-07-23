import React, { useState } from 'react';

export default function Logo({ size = 'h-10 w-10', alt = 'Restaurant logo', className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`${size} ${className} inline-flex items-center justify-center rounded-full bg-slate-900 text-white text-lg shrink-0`}
        role="img"
        aria-label={alt}
      >
        🔥
      </span>
    );
  }

  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`${size} ${className} object-contain shrink-0`}
      onError={() => setFailed(true)}
    />
  );
}
