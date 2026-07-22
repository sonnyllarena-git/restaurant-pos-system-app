import React, { useContext, useState } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import { NotificationContext } from '../../context/NotificationContext';
import Input from '../common/Input';
import Button from '../common/Button';

export default function TaxSettings() {
  const { settings, updateSettings } = useContext(SettingsContext);
  const { showSuccess } = useContext(NotificationContext);
  const [taxRatePercent, setTaxRatePercent] = useState((settings.taxRate * 100).toString());

  const handleSave = (e) => {
    e.preventDefault();
    const rate = Math.max(0, parseFloat(taxRatePercent) || 0) / 100;
    updateSettings({ taxRate: rate });
    showSuccess('Tax settings saved');
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md">
      <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">Tax Settings</h3>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
        <Input
          type="text"
          value={taxRatePercent}
          onChange={(e) => setTaxRatePercent(e.target.value.replace(/[^0-9.]/g, ''))}
        />
        <p className="text-xs text-slate-500 mt-1">Applied to every order subtotal at checkout.</p>
      </div>
      <Button type="submit">SAVE</Button>
    </form>
  );
}
