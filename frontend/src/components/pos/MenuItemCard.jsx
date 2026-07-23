import React from 'react';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

export default function MenuItemCard({ item, onSelect }) {
  return (
    <Card hoverable onClick={() => onSelect(item)} className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2">
          {item.icon && <span className="text-xl leading-none">{item.icon}</span>}
          <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-lg font-bold text-orange-500">{formatCurrency(item.price)}</span>
        {item.modifierGroups?.length > 0 && (
          <span className="text-xs text-slate-500">Customizable</span>
        )}
      </div>
    </Card>
  );
}
