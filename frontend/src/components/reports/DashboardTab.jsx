import React, { useMemo, useState } from 'react';
import StatCard from './StatCard';
import RevenueChart from './RevenueChart';
import OrdersByHourChart from './OrdersByHourChart';
import TopItemsChart from './TopItemsChart';
import HourlyBreakdown from './HourlyBreakdown';
import ReceiptOrderReport from './ReceiptOrderReport';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { getOrderStats, getHourlyBreakdown, getTopItems } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatters';

const PAGE_SIZE = 5;

export default function DashboardTab({ orders, loading }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const stats = useMemo(() => getOrderStats(orders), [orders]);
  const hourly = useMemo(() => getHourlyBreakdown(orders), [orders]);
  const topItems = useMemo(() => getTopItems(orders, 5), [orders]);

  const completedOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'completed' && o.completedAt)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)),
    [orders]
  );

  if (loading) return <Loader label="Loading report data..." />;

  const visibleOrders = completedOrders.slice(0, visibleCount);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Orders" value={stats.orderCount} icon="🧾" />
        <StatCard title="Revenue" value={formatCurrency(stats.revenue)} icon="💰" />
        <StatCard title="Avg Order Value" value={formatCurrency(stats.avgOrderValue)} icon="📊" />
        <StatCard title="Guests" value={stats.guests} icon="👥" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <RevenueChart data={hourly} />
        <OrdersByHourChart data={hourly} />
      </div>

      <div className="mb-6">
        <TopItemsChart data={topItems} />
      </div>

      <HourlyBreakdown data={hourly} />

      <div className="mt-6">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-3">Receipt Order Report</h3>
        {completedOrders.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8 bg-white border border-slate-300 rounded">
            No completed orders for this period.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {visibleOrders.map((order) => (
                <ReceiptOrderReport key={order.id} order={order} />
              ))}
            </div>
            {visibleCount < completedOrders.length && (
              <div className="flex justify-center mt-4">
                <Button variant="secondary" size="sm" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
