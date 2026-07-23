import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import PeriodFilter from '../components/reports/PeriodFilter';
import DashboardTab from '../components/reports/DashboardTab';
import SummaryTab from '../components/reports/SummaryTab';
import { useReportFilters } from '../hooks/useReportFilters';

const TABS = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'summary', label: 'Summary' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { period, setPeriod, selectedMonth, setSelectedMonth, monthOptions, filteredOrders, loading } =
    useReportFilters();

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <PageHeader title="Reports" />

      <PeriodFilter
        period={period}
        setPeriod={setPeriod}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        monthOptions={monthOptions}
      />

      <div className="flex gap-2 px-6 pt-4">
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

      {activeTab === 'dashboard' ? (
        <DashboardTab orders={filteredOrders} loading={loading} />
      ) : (
        <SummaryTab orders={filteredOrders} loading={loading} />
      )}
    </div>
  );
}
