import React from 'react';

export default function KitchenSettings({ nightMode, onToggle }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
      <input type="checkbox" checked={nightMode} onChange={onToggle} className="h-4 w-4" />
      Night Mode
    </label>
  );
}
