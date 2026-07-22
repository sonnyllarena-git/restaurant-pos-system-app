import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { UIContext } from '../context/UIContext';
import { NotificationContext } from '../context/NotificationContext';
import { getOrderHistory, updateOrderStatus } from '../services/dbService';
import { formatCurrency } from '../utils/formatters';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function statusBadgeVariant(status) {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'error';
  if (status === 'pending') return 'warning';
  return 'neutral';
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { confirm } = useContext(UIContext);
  const { showSuccess } = useContext(NotificationContext);

  const loadOrders = useCallback(async () => {
    const history = await getOrderHistory();
    setOrders(history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.customerName?.toLowerCase().includes(term) ||
        order.customerPhone?.includes(term);
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesFrom = !dateFrom || new Date(order.createdAt) >= new Date(dateFrom);
      const matchesTo = !dateTo || new Date(order.createdAt) <= new Date(`${dateTo}T23:59:59`);
      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  const handleCancel = (order) => {
    confirm({
      title: 'Cancel Order',
      message: `Cancel order for ${order.customerName || 'this customer'}?`,
      confirmLabel: 'CANCEL ORDER',
      danger: true,
      onConfirm: async () => {
        await updateOrderStatus(order.id, 'cancelled');
        await loadOrders();
        showSuccess('Order cancelled');
      },
    });
  };

  return (
    <div>
      <PageHeader title="Order History" />
      <div className="p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="w-64">
            <Input
              placeholder="Search by name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </div>

        {orders === null ? (
          <Loader label="Loading order history..." />
        ) : filteredOrders.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">No orders found.</p>
        ) : (
          <div className="overflow-x-auto border border-slate-300 rounded">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700 text-left">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">{order.customerName || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{order.customerPhone || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{order.orderType}</td>
                    <td className="px-4 py-3 text-slate-600">{order.items?.length || 0}</td>
                    <td className="px-4 py-3 text-slate-900">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      {order.status === 'cancelled' ? (
                        <Badge variant="error">CANCELLED</Badge>
                      ) : (
                        <Badge variant={statusBadgeVariant(order.status)}>{order.status.toUpperCase()}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('en-PH') : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {order.orderType === 'advance' ? `${order.orderDate} ${order.orderTime}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'pending' && (
                        <Button variant="ghost" size="sm" onClick={() => handleCancel(order)}>
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
