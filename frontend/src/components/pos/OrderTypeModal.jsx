import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import Card from '../common/Card';
import { ORDER_TYPES } from '../../utils/constants';

const OPTIONS = [
  { type: ORDER_TYPES.REGULAR, icon: '🛒', label: 'Regular Order', desc: 'Walk-in order served now.' },
  { type: ORDER_TYPES.ADVANCE, icon: '📅', label: 'Advance Order', desc: 'Scheduled for a future date/time.' },
];

export default function OrderTypeModal() {
  const { setOrderType } = useOrder();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">New Order</h2>
      <p className="text-sm text-slate-600 mb-8">What kind of order is this?</p>

      <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
        {OPTIONS.map((opt) => (
          <Card
            key={opt.type}
            hoverable
            onClick={() => setOrderType(opt.type)}
            className="text-center py-8 border-2 hover:border-orange-500 transition-colors"
          >
            <div className="text-4xl mb-3">{opt.icon}</div>
            <h3 className="text-lg font-semibold text-slate-900">{opt.label}</h3>
            <p className="text-sm text-slate-600 mt-1">{opt.desc}</p>
          </Card>
        ))}
      </div>

      <button
        onClick={() => navigate('/home')}
        className="text-sm text-slate-500 hover:text-slate-700 mt-8 underline"
      >
        Cancel
      </button>
    </div>
  );
}
