import React, { useState } from 'react';
import Button from '../common/Button';
import QuantityInput from '../common/QuantityInput';
import ConfirmQuantityModal from './ConfirmQuantityModal';
import { formatCurrency } from '../../utils/formatters';

const LARGE_QUANTITY_THRESHOLD = 100;

export default function MenuItemCard({ item, onSelect }) {
  const [quantity, setQuantity] = useState(1);
  const [pendingQuantity, setPendingQuantity] = useState(null);

  const commitAdd = (qty) => {
    onSelect(item, qty);
    setQuantity(1);
  };

  const handleAddClick = () => {
    if (quantity > LARGE_QUANTITY_THRESHOLD) {
      setPendingQuantity(quantity);
      return;
    }
    commitAdd(quantity);
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-200">
      <div className="h-[50px] w-[50px] shrink-0 rounded border border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
        {item.imageDataUrl ? (
          <img src={item.imageDataUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl leading-none">{item.icon || '🍽️'}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
        <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
        {item.modifierGroups?.length > 0 && (
          <span className="text-xs text-slate-500">Customizable</span>
        )}
      </div>

      <span className="text-sm font-bold text-orange-500 w-20 text-right shrink-0">
        {formatCurrency(item.price)}
      </span>

      <div className="shrink-0">
        <QuantityInput value={quantity} onChange={setQuantity} min={1} max={9999} />
      </div>

      <Button size="sm" onClick={handleAddClick} className="shrink-0">
        Add
      </Button>

      {pendingQuantity !== null && (
        <ConfirmQuantityModal
          itemName={item.name}
          quantity={pendingQuantity}
          onConfirm={() => {
            commitAdd(pendingQuantity);
            setPendingQuantity(null);
          }}
          onCancel={() => setPendingQuantity(null)}
        />
      )}
    </div>
  );
}
