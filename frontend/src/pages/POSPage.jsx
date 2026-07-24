import React from 'react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import WizardModalContainer from '../components/pos/WizardModalContainer';
import { useOrder } from '../hooks/useOrder';
import { useCart } from '../hooks/useCart';
import { ORDER_TYPES } from '../utils/constants';

const ORDER_TYPE_OPTIONS = [
  { type: ORDER_TYPES.REGULAR, icon: '🛒', label: 'Regular Order', desc: 'Walk-in order served now.' },
  { type: ORDER_TYPES.ADVANCE, icon: '📅', label: 'Advance Order', desc: 'Scheduled for a future date/time.' },
];

export default function POSPage() {
  const { orderType, setOrderType, resetOrder } = useOrder();
  const { clearCart } = useCart();

  const handleWizardClose = () => {
    resetOrder();
    clearCart();
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Point of Sale" />
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">New Order</h2>
        <p className="text-sm text-slate-600 mb-8">What kind of order is this?</p>

        <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
          {ORDER_TYPE_OPTIONS.map((opt) => (
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
      </div>

      {orderType && <WizardModalContainer orderType={orderType} onClose={handleWizardClose} />}
    </div>
  );
}
