import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-slate-100">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{item.menuItem.name}</p>
        {item.selectedModifiers?.length > 0 && (
          <p className="text-xs text-slate-500">
            {item.selectedModifiers.map((m) => m.label).join(', ')}
          </p>
        )}
        {item.specialNotes && <p className="text-xs text-slate-500 italic">"{item.specialNotes}"</p>}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
            className="h-6 w-6 flex items-center justify-center border border-slate-300 rounded text-sm"
          >
            −
          </button>
          <span className="text-sm text-slate-900 w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
            className="h-6 w-6 flex items-center justify-center border border-slate-300 rounded text-sm"
          >
            +
          </button>
          <button
            onClick={() => onRemove(item.cartItemId)}
            className="text-xs text-red-500 hover:text-red-700 ml-2"
          >
            Remove
          </button>
        </div>
      </div>
      <span className="text-sm font-bold text-orange-500 whitespace-nowrap">
        {formatCurrency(item.lineTotal)}
      </span>
    </div>
  );
}
