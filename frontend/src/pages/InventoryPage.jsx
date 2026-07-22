import React from 'react';
import InventoryDashboard from '../components/inventory/InventoryDashboard';
import PageHeader from '../components/common/PageHeader';

export default function InventoryPage() {
  return (
    <div>
      <PageHeader title="Inventory" />
      <InventoryDashboard />
    </div>
  );
}
