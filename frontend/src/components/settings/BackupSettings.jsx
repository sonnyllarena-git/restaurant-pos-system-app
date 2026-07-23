import React, { useContext, useState, useEffect } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import { NotificationContext } from '../../context/NotificationContext';
import Button from '../common/Button';
import { formatDate, formatTime } from '../../utils/formatters';
import { connectOrdersFile, getConnectedFileName, isFileSystemAccessSupported } from '../../utils/excelExport';

export default function BackupSettings() {
  const { settings, updateSettings } = useContext(SettingsContext);
  const { showSuccess, showError } = useContext(NotificationContext);
  const [form, setForm] = useState(settings.backup);
  const [connectedFile, setConnectedFile] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const supported = isFileSystemAccessSupported();

  useEffect(() => {
    getConnectedFileName().then(setConnectedFile);
  }, []);

  const handleConnectFile = async () => {
    // showSaveFilePicker() must be the first await here — no work may precede it in
    // this handler or Chromium drops the user-gesture requirement it needs.
    setConnecting(true);
    try {
      const handle = await connectOrdersFile();
      setConnectedFile(handle.name);
      showSuccess(`Connected to ${handle.name}. All future order exports will update this file.`);
    } catch (err) {
      if (err?.name === 'AbortError') {
        // User dismissed the native picker — not an error worth surfacing.
      } else if (err?.message === 'NOT_SUPPORTED') {
        showError('This browser does not support connecting a single Excel file. Orders will download individually instead.');
      } else {
        showError('Could not connect the Excel file');
      }
    } finally {
      setConnecting(false);
    }
  };

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

      <div className="border-t border-slate-200 pt-4 mt-2">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">Data Export</h3>
        <p className="text-sm text-slate-600 mb-3">
          {connectedFile
            ? `Connected: ${connectedFile} — every order export updates this file in place.`
            : 'Not connected — using per-order downloads.'}
        </p>
        {!supported && (
          <p className="text-sm text-amber-700 mb-3">
            This browser doesn't support connecting a single file. Orders will continue to download individually.
          </p>
        )}
        <Button type="button" variant="secondary" onClick={handleConnectFile} disabled={!supported} loading={connecting}>
          Connect Orders.xlsx
        </Button>
      </div>
    </form>
  );
}
