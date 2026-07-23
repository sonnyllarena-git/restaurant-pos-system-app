import React, { useMemo, useState } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Input from '../common/Input';
import Loader from '../common/Loader';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending', label: 'Pending' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'payment', label: 'Payment' },
];

const COLUMNS = [
  { key: 'orderNumber', label: 'Order #' },
  { key: 'customerName', label: 'Customer' },
  { key: 'itemCount', label: 'Items' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
  { key: 'completedAt', label: 'Completed Time' },
  { key: 'serviceType', label: 'Service Type' },
];

const PAGE_SIZE = 10;

function statusBadgeVariant(status) {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'error';
  if (status === 'pending') return 'warning';
  if (status === 'preparing') return 'warning';
  if (status === 'ready') return 'success';
  if (status === 'payment') return 'info';
  return 'neutral';
}

function sortValue(order, key) {
  if (key === 'itemCount') return order.items?.length || 0;
  if (key === 'completedAt') return order.completedAt ? new Date(order.completedAt).getTime() : 0;
  const value = order[key];
  return typeof value === 'string' ? value.toLowerCase() : value ?? 0;
}

function downloadCsv(rows) {
  const header = ['Order #', 'Customer', 'Items', 'Total', 'Status', 'Completed Time', 'Service Type'];
  const lines = rows.map((r) => [
    r.orderNumber,
    r.customerName || '',
    r.items?.length || 0,
    r.total,
    r.status,
    r.completedAt ? new Date(r.completedAt).toLocaleString('en-PH') : '',
    r.serviceType || '',
  ]);
  const csv = [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orders-summary-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SummaryTab({ orders, loading }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('completedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch = !term || o.customerName?.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  if (loading) return <Loader label="Loading orders..." />;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="w-64">
          <Input
            placeholder="Search by customer name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <Button variant="secondary" size="sm" onClick={() => downloadCsv(sorted)} disabled={sorted.length === 0}>
          EXPORT CSV
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-12">No orders found for this period.</p>
      ) : (
        <>
          <div className="overflow-x-auto border border-slate-300 rounded">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700 text-left">
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 cursor-pointer select-none hover:bg-slate-200"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {sortKey === col.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((order) => (
                  <tr key={order.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-slate-900 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-900">{order.customerName || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{order.items?.length || 0}</td>
                    <td className="px-4 py-3 text-slate-900">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeVariant(order.status)}>{order.status.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {order.completedAt ? `${formatDate(order.completedAt)} ${formatTime(order.completedAt)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{order.serviceType || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages} · {sorted.length} orders
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
