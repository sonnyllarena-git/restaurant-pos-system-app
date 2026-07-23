import React, { useContext, useState } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import { NotificationContext } from '../../context/NotificationContext';
import Button from '../common/Button';
import { formatDate, formatTime } from '../../utils/formatters';

export default function BackupSettings() {
  const { settings, updateSettings } = useContext(SettingsContext);
  const { showSuccess } = useContext(NotificationContext);
  const [form, setForm] = useState(settings.backup);

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({ backup: form });
    showSuccess('Backup settings saved');
  };

  const handleBackupNow = () => {
    const now = new Date().toISOString();
    setForm((prev) => ({ ...prev, lastBackup: now }));
    updateSettings({ backup: { ...form, lastBackup: now } });
    showSuccess('Backup completed');
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md">
      <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">Backup Settings</h3>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.autoBackup}
          onChange={(e) => setForm({ ...form, autoBackup: e.target.checked })}
          className="h-4 w-4"
        />
        Enable automatic backups
      </label>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
        <select
          value={form.frequency}
          onChange={(e) => setForm({ ...form, frequency: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <p className="text-sm text-slate-600">
        Last backup:{' '}
        {form.lastBackup ? `${formatDate(form.lastBackup)} ${formatTime(form.lastBackup)}` : 'Never'}
      </p>
      <div className="flex gap-3">
        <Button type="submit">SAVE</Button>
        <Button type="button" variant="secondary" onClick={handleBackupNow}>
          BACKUP NOW
        </Button>
      </div>
    </form>
  );
}
