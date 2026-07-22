import React, { useState, useEffect, useMemo } from 'react';
import StatCard from './StatCard';
import RevenueChart from './RevenueChart';
import TopItemsChart from './TopItemsChart';
import HourlyBreakdown from './HourlyBreakdown';
import ReportExport from './ReportExport';
import Loader from '../common/Loader';
import { getOrderStats, getHourlyBreakdown, getTopItems } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';
import { getAllOrders } from '../../services/dbService';

function isToday(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export default function DailyDashboard() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    getAllOrders().then((allOrders) => {
      const todaysCompleted = allOrders
        .filter((o) => o.status === 'completed' && isToday(o.createdAt))
        .map((o) => ({
          ...o,
          items: (o.items || []).map((item) => ({ ...item, price: item.unitPrice })),
        }));
      setOrders(todaysCompleted);
    });
  }, []);

  const stats = useMemo(() => (orders ? getOrderStats(orders) : { orderCount: 0, revenue: 0, guests: 0, avgOrderValue: 0 }), [orders]);
  const hourly = useMemo(() => (orders ? getHourlyBreakdown(orders) : []), [orders]);
  const topItems = useMemo(() => (orders ? getTopItems(orders, 5) : []), [orders]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Daily Dashboard</h2>
          <p className="text-sm text-slate-600">Snapshot of today's performance.</p>
        </div>
        <ReportExport />
      </div>

      {orders === null ? (
        <Loader label="Loading today's orders..." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard title="Orders" value={stats.orderCount} icon="🧾" />
            <StatCard title="Revenue" value={formatCurrency(stats.revenue)} icon="💰" />
            <StatCard title="Avg Order Value" value={formatCurrency(stats.avgOrderValue)} icon="📊" />
            <StatCard title="Guests" value={stats.guests} icon="👥" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <RevenueChart data={hourly} />
            <TopItemsChart data={topItems} />
          </div>

          <HourlyBreakdown data={hourly} />
        </>
      )}
    </div>
  );
}
