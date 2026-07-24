import React, { useState } from 'react';
import { useOrder } from '../../hooks/useOrder';
import SelectableCard from '../common/SelectableCard';
import { DELIVERY_COMPANIES } from '../../utils/deliveryData';

export default function DeliveryMethodModal() {
  const { deliveryMethod, deliveryCompany, setDeliveryMethod, setDeliveryCompany } = useOrder();
  const [showCompanyPicker, setShowCompanyPicker] = useState(deliveryMethod === 'company');
  const [companyId, setCompanyId] = useState(
    () => DELIVERY_COMPANIES.find((c) => c.name === deliveryCompany)?.id || ''
  );

  const handleSelectWalkIn = () => {
    setDeliveryCompany(null);
    setDeliveryMethod('walk_in');
    setShowCompanyPicker(false);
  };

  // Only reveals the company dropdown -- deliveryMethod isn't committed to 'company'
  // in OrderContext until an actual company is chosen below, so the wizard's Next
  // button correctly stays blocked until a real company is picked, not just this card.
  const handleShowCompanyPicker = () => setShowCompanyPicker(true);

  const handleSelectCompany = (id) => {
    setCompanyId(id);
    const company = DELIVERY_COMPANIES.find((c) => c.id === id);
    if (!company) {
      setDeliveryCompany(null);
      setDeliveryMethod(null);
      return;
    }
    setDeliveryCompany(company.name);
    setDeliveryMethod('company');
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-slate-600 mb-6">How will this order be delivered?</p>

      <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
        <SelectableCard
          icon="🚶"
          label="Walk-in Customer"
          isSelected={deliveryMethod === 'walk_in'}
          onClick={handleSelectWalkIn}
        />
        <SelectableCard
          icon="🚚"
          label="Company Delivery"
          isSelected={deliveryMethod === 'company'}
          onClick={handleShowCompanyPicker}
        />
      </div>

      {showCompanyPicker && (
        <div className="w-full max-w-xl mt-6 border border-slate-300 rounded p-4 bg-slate-50">
          <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Company</label>
          <select
            value={companyId}
            onChange={(e) => handleSelectCompany(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            <option value="">Select a delivery company...</option>
            {DELIVERY_COMPANIES.map((company) => (
              <option key={company.id} value={company.id}>
                {company.icon} {company.name}
              </option>
            ))}
          </select>

          {deliveryCompany && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-xs text-slate-600">Selected Company</p>
              <p className="text-base font-bold text-orange-600">{deliveryCompany}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
