import React, { useContext, useState } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import { NotificationContext } from '../../context/NotificationContext';
import Input from '../common/Input';
import Button from '../common/Button';

export default function PrinterConfig() {
  const { settings, updateSettings } = useContext(SettingsContext);
  const { showSuccess } = useContext(NotificationContext);
  const [form, setForm] = useState(settings.printer);

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({ printer: form });
    showSuccess('Printer configuration saved');
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md">
      <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">Printer Config</h3>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Printer Name</label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Paper Width</label>
        <select
          value={form.paperWidth}
          onChange={(e) => setForm({ ...form, paperWidth: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        >
          <option value="58mm">58mm</option>
          <option value="80mm">80mm</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.autoPrint}
          onChange={(e) => setForm({ ...form, autoPrint: e.target.checked })}
          className="h-4 w-4"
        />
        Auto-print receipt after payment
      </label>
      <Button type="submit">SAVE</Button>
    </form>
  );
}
