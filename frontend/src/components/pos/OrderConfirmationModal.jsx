import React, { useContext } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { UIContext } from '../../context/UIContext';
import { formatCurrency } from '../../utils/formatters';

function serviceLabel(serviceType) {
  return (serviceType || '').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrderConfirmationModal({
  orderType = 'regular',
  serviceType,
  tableNumber,
  deliveryMethod,
  deliveryCompany,
  customerName,
  customerPhone,
  items,
  total,
  orderDate,
  orderTime,
  onBack,
  onCancel,
  onConfirm,
  saving = false,
}) {
  const { confirm } = useContext(UIContext);

  const handleCancel = () => {
    confirm({
      title: 'Cancel Order',
      message: 'Cancel this order? Any entered details will be lost.',
      confirmLabel: 'Discard',
      danger: true,
      onConfirm: onCancel,
    });
  };

  return (
    <Modal title="Confirm Order" onClose={onBack} size="md">
      <div className="space-y-4">
        <div className="bg-red-50 border-4 border-red-500 rounded p-4 text-center">
          <p className="text-xl font-extrabold text-red-600">📢 PLEASE READ TO CUSTOMER</p>
          <p className="text-sm text-red-700 mt-1">Confirm every detail below with the customer before submitting.</p>
        </div>

        <div className="border border-slate-300 rounded p-3 space-y-1 bg-slate-50">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Order Type</span>
            <span className="font-medium text-slate-900 capitalize">{orderType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Service Type</span>
            <span className="font-medium text-slate-900">{serviceLabel(serviceType)}</span>
          </div>
          {serviceType === 'dine_in' && tableNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Table</span>
              <span className="font-medium text-slate-900">Table {tableNumber}</span>
            </div>
          )}
          {serviceType === 'delivery' && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Delivery</span>
              <span className="font-medium text-slate-900">
                {deliveryMethod === 'company' ? deliveryCompany || 'Company Delivery' : 'Walk-in Customer'}
              </span>
            </div>
          )}
          {(orderDate || orderTime) && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Scheduled</span>
              <span className="font-medium text-slate-900">
                {orderDate} {orderTime}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Customer</span>
            <span className="font-medium text-slate-900">{customerName || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Phone</span>
            <span className="font-medium text-slate-900">{customerPhone || '—'}</span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Items</h4>
          <ul className="text-sm text-slate-700 space-y-1">
            {items.map((item) => (
              <li key={item.cartItemId || item.id} className="flex justify-between">
                <span>
                  {item.quantity}x {item.menuItem?.name || item.name}
                </span>
                <span>{formatCurrency(item.lineTotal ?? item.total)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <div className="flex justify-between text-base font-bold text-slate-900">
            <span>Total</span>
            <span className="text-orange-500">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onBack}
            disabled={saving}
            className="text-sm text-slate-500 hover:text-slate-700 underline mr-auto disabled:opacity-50"
          >
            ← Back
          </button>
          <Button variant="secondary" onClick={handleCancel} disabled={saving}>
            CANCEL
          </Button>
          <Button onClick={onConfirm} loading={saving}>
            CONFIRM
          </Button>
        </div>
      </div>
    </Modal>
  );
}
