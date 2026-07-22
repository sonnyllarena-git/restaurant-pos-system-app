import React, { useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import { NotificationContext } from '../../context/NotificationContext';
import { UIContext } from '../../context/UIContext';
import Button from '../common/Button';

export default function DatabaseSettings() {
  const { settings } = useContext(SettingsContext);
  const { showSuccess } = useContext(NotificationContext);
  const { confirm } = useContext(UIContext);

  const handleClearLocalData = () => {
    confirm({
      title: 'Clear Local Data',
      message: 'This will remove all locally stored POS data (settings, cart, user session) from this device.',
      confirmLabel: 'CLEAR DATA',
      danger: true,
      onConfirm: () => {
        localStorage.clear();
        showSuccess('Local data cleared');
      },
    });
  };

  return (
    <div className="space-y-4 max-w-md">
      <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">Database</h3>
      <div className="bg-white border border-slate-300 rounded p-4 space-y-2 text-sm">
        <p className="text-slate-600">
          Storage Mode: <span className="font-medium text-slate-900">{settings.database.location}</span>
        </p>
        <p className="text-slate-600">
          Schema Version: <span className="font-medium text-slate-900">{settings.database.version}</span>
        </p>
        <p className="text-slate-500">
          This build stores all data locally in the browser. Cloud/server sync will be added during
          backend integration.
        </p>
      </div>
      <Button variant="danger" onClick={handleClearLocalData}>
        CLEAR LOCAL DATA
      </Button>
    </div>
  );
}
