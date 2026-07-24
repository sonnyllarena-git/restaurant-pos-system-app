import React from 'react';
import Card from './Card';

export default function SelectableCard({ icon, label, description, isSelected, onClick, className = '' }) {
  return (
    <Card
      hoverable
      onClick={onClick}
      className={`relative text-center py-8 border-2 transition-colors ${
        isSelected ? 'border-orange-500 bg-orange-50' : 'hover:border-orange-500'
      } ${className}`}
    >
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-900">{label}</h3>
      {description && <p className="text-xs text-slate-600 mt-1">{description}</p>}
      {isSelected && (
        <span className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          ✓
        </span>
      )}
    </Card>
  );
}
