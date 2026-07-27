import React, { useState } from 'react';
import Button from '../common/Button';
import PrintPreviewModal from '../common/PrintPreviewModal';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { getOrderDurationMinutes } from '../../services/reportService';

export default function ReceiptOrderReport({ order }) {
  const duration = getOrderDurationMinutes(order);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="bg-white border border-slate-300 rounded p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
        <div>
          <p className="font-semibold text-slate-900">Order #{order.orderNumber}</p>
          <p className="text-sm text-slate-600">
            {order.customerName || 'Walk-in'}
            {order.customerPhone ? ` · ${order.customerPhone}` : ''}
          </p>
        </div>
        <div className="text-right text-sm text-slate-600">
          <p className="capitalize">
            {order.serviceType || '—'}
            {order.tableNumber ? ` · Table ${order.tableNumber}` : ''}
            {order.deliveryCompany ? ` · 🚚 ${order.deliveryCompany}` : ''}
          </p>
          <p>
            Ordered {formatTime(order.createdAt)} · Completed{' '}
            {order.completedAt ? formatTime(order.completedAt) : '—'}
          </p>
          {duration !== null && <p className="font-medium text-slate-900">{duration} min</p>}
        </div>
      </div>

      <ul className="text-sm text-slate-700 space-y-1 mb-3">
        {(order.items || []).map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.quantity} x {item.name}
            </span>
            <span>{formatCurrency(item.total ?? item.quantity * item.unitPrice)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-end gap-6 text-sm border-t border-slate-100 pt-3">
        <span className="text-slate-600">
          Total <span className="text-slate-900 font-bold">{formatCurrency(order.total)}</span>
        </span>
        <Button variant="secondary" size="sm" onClick={() => setShowPreview(true)}>
          PRINT RECEIPT
        </Button>
      </div>

      {showPreview && <PrintPreviewModal order={order} onClose={() => setShowPreview(false)} />}
    </div>
  );
}
