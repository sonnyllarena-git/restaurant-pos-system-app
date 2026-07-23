import React from 'react';
import { useOrder } from '../../hooks/useOrder';
import Card from '../common/Card';
import { SERVICE_TYPES, ORDER_TYPES } from '../../utils/constants';

const REGULAR_OPTIONS = [
  { type: SERVICE_TYPES.DINE_IN, icon: '🍽️', label: 'Dine In' },
  { type: SERVICE_TYPES.TAKEOUT, icon: '🥡', label: 'Takeout' },
  { type: SERVICE_TYPES.DELIVERY, icon: '🚚', label: 'Delivery' },
];

const ADVANCE_OPTIONS = [
  { type: SERVICE_TYPES.DINE_IN, icon: '🍽️', label: 'Dine In' },
  { type: SERVICE_TYPES.PICKUP, icon: '🛍️', label: 'Pickup' },
  { type: SERVICE_TYPES.DELIVERY, icon: '🚚', label: 'Delivery' },
];

export default function ServiceTypeModal() {
  const { orderType, setOrderType, setServiceType } = useOrder();
  const options = orderType === ORDER_TYPES.ADVANCE ? ADVANCE_OPTIONS : REGULAR_OPTIONS;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Service Type</h2>
      <p className="text-sm text-slate-600 mb-8">
        How will this {orderType === ORDER_TYPES.ADVANCE ? 'advance' : 'regular'} order be fulfilled?
      </p>

      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
        {options.map((opt) => (
          <Card
            key={opt.type}
            hoverable
            onClick={() => setServiceType(opt.type)}
            className="text-center py-8 border-2 hover:border-orange-500 transition-colors"
          >
            <div className="text-4xl mb-3">{opt.icon}</div>
            <h3 className="text-lg font-semibold text-slate-900">{opt.label}</h3>
          </Card>
        ))}
      </div>

      <button
        onClick={() => setOrderType(null)}
        className="text-sm text-slate-500 hover:text-slate-700 mt-8 underline"
      >
        ← Back
      </button>
    </div>
  );
}
