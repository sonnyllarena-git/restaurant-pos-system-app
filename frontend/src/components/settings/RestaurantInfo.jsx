import React, { useContext, useState } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import { NotificationContext } from '../../context/NotificationContext';
import Input from '../common/Input';
import Button from '../common/Button';

export default function RestaurantInfo() {
  const { settings, updateSettings } = useContext(SettingsContext);
  const { showSuccess } = useContext(NotificationContext);
  const [form, setForm] = useState({
    restaurantName: settings.restaurantName,
    address: settings.address,
    phone: settings.phone,
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(form);
    showSuccess('Restaurant information saved');
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md">
      <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">Restaurant Info</h3>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Restaurant Name</label>
        <Input value={form.restaurantName} onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <Button type="submit">SAVE</Button>
    </form>
  );
}
