import React from 'react';
import SettingsMain from '../components/settings/SettingsMain';
import PageHeader from '../components/common/PageHeader';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />
      <SettingsMain />
    </div>
  );
}
