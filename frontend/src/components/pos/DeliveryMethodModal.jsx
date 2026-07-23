import React, { useState } from 'react';
import { useOrder } from '../../hooks/useOrder';
import Card from '../common/Card';
import Button from '../common/Button';
import { DELIVERY_COMPANIES } from '../../utils/deliveryData';

export default function DeliveryMethodModal() {
  const { setServiceType, setDeliveryMethod, setDeliveryCompany } = useOrder();
  const [selected, setSelected] = useState(null);
  const [companyId, setCompanyId] = useState('');

  const handleSelectWalkIn = () => {
    setDeliveryCompany(null);
    setDeliveryMethod('walk_in');
  };

  const handleSelectCompany = () => setSelected('company');

  const handleConfirmCompany = () => {
    const company = DELIVERY_COMPANIES.find((c) => c.id === companyId);
    if (!company) return;
    setDeliveryCompany(company.name);
    setDeliveryMethod('company');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Delivery Method</h2>
      <p className="text-sm text-slate-600 mb-8">How will this order be delivered?</p>

      <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
        <Card
          hoverable
          onClick={handleSelectWalkIn}
          className="text-center py-8 border-2 hover:border-orange-500 transition-colors"
        >
          <div className="text-4xl mb-3">🚶</div>
          <h3 className="text-lg font-semibold text-slate-900">Walk-in Customer</h3>
        </Card>

        <Card
          hoverable
          onClick={handleSelectCompany}
          className={`text-center py-8 border-2 transition-colors ${
            selected === 'company' ? 'border-orange-500' : 'hover:border-orange-500'
          }`}
        >
          <div className="text-4xl mb-3">🚚</div>
          <h3 className="text-lg font-semibold text-slate-900">Company Delivery</h3>
        </Card>
      </div>

      {selected === 'company' && (
        <div className="w-full max-w-xl mt-6 border border-slate-300 rounded p-4 bg-slate-50">
          <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Company</label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 mb-4"
          >
            <option value="">Select a delivery company...</option>
            {DELIVERY_COMPANIES.map((company) => (
              <option key={company.id} value={company.id}>
                {company.icon} {company.name}
              </option>
            ))}
          </select>
          <Button className="w-full" disabled={!companyId} onClick={handleConfirmCompany}>
            CONTINUE
          </Button>
        </div>
      )}

      <button
        onClick={() => setServiceType(null)}
        className="text-sm text-slate-500 hover:text-slate-700 mt-8 underline"
      >
        ← Back
      </button>
    </div>
  );
}
