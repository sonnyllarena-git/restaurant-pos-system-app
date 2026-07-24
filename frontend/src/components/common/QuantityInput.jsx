import React, { useState, useEffect } from 'react';

export default function QuantityInput({ value, onChange, min = 1, max = 9999 }) {
  // A local draft string tracks what's on screen while typing so the field can sit
  // briefly empty (e.g. after Backspace) without snapping back to `min` mid-edit --
  // clamping only that instant would make every clear-then-retype start from "1"
  // and append onto it instead of replacing it.
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const clamp = (n) => Math.min(max, Math.max(min, n));

  const handleTextChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    setText(digits);
    if (digits !== '') {
      onChange(clamp(Number(digits)));
    }
  };

  const handleBlur = () => {
    const digits = text.replace(/\D/g, '');
    if (digits === '') {
      setText(String(min));
      onChange(min);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="h-8 w-8 flex items-center justify-center border border-slate-300 rounded text-sm hover:bg-slate-100"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={text}
        onChange={handleTextChange}
        onBlur={handleBlur}
        className="h-8 w-14 text-center border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="h-8 w-8 flex items-center justify-center border border-slate-300 rounded text-sm hover:bg-slate-100"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
