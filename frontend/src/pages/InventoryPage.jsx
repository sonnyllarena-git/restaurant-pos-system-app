import React, { useState } from 'react';
import InventoryDashboard from '../components/inventory/InventoryDashboard';
import PricingTab from '../components/inventory/PricingTab';
import PageHeader from '../components/common/PageHeader';

const TABS = [
  { value: 'stock', label: 'Stock Management' },
  { value: 'pricing', label: 'Pricing Management' },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('stock');

  return (
    <div>
      <PageHeader title="Inventory" />
      <div className="flex gap-2 px-6 pt-6">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === tab.value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'stock' ? (
        <InventoryDashboard />
      ) : (
        <div className="p-6">
          <PricingTab />
        </div>
      )}
    </div>
  );
}
