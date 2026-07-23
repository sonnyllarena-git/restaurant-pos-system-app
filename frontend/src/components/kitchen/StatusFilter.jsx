import React from 'react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'New' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'payment', label: 'Payment' },
];

export default function StatusFilter({ activeFilter, onChange }) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onChange(filter.key)}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            activeFilter === filter.key
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
