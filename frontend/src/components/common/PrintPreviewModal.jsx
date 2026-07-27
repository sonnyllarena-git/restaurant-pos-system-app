import React, { useContext, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { SettingsContext } from '../../context/SettingsContext';
import { NotificationContext } from '../../context/NotificationContext';
import { printReceipt } from '../../services/printerService';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

function serviceLabel(serviceType) {
  return (serviceType || '').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PrintPreviewModal({ order, onClose }) {
  const { settings } = useContext(SettingsContext);
  const { showInfo } = useContext(NotificationContext);
  const [printing, setPrinting] = useState(false);

  const orderLabel = order.tableNumber ? `Table ${order.tableNumber}` : serviceLabel(order.serviceType);

  const handlePrint = async () => {
    setPrinting(true);
    await printReceipt(order);
    setPrinting(false);
    showInfo('Receipt sent to printer');
  };

  return (
    <Modal title="Print Preview" onClose={onClose} size="sm">
      <div className="border border-slate-300 rounded p-4 font-mono text-xs text-slate-900 bg-slate-50">
        <div className="text-center mb-3">
          <p className="text-sm font-bold">{settings.restaurantName}</p>
          <p>{settings.address}</p>
          <p>{settings.phone}</p>
        </div>
        <div className="border-t border-dashed border-slate-400 my-2" />
        <p>Order #: {order.orderNumber ?? order.id}</p>
        {order.customerName && <p>{order.customerName}</p>}
        {orderLabel && <p>{orderLabel}</p>}
        {order.deliveryCompany && <p>Delivery: {order.deliveryCompany}</p>}
        <p>{formatDate(order.createdAt)} {formatTime(order.createdAt)}</p>
        <div className="border-t border-dashed border-slate-400 my-2" />
        {(order.items || []).map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span>{formatCurrency(item.total ?? item.quantity * item.unitPrice)}</span>
          </div>
        ))}
        <div className="border-t border-dashed border-slate-400 my-2" />
        <div className="flex justify-between font-bold text-sm">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        {order.amountReceived != null && (
          <>
            <div className="flex justify-between">
              <span>Cash</span>
              <span>{formatCurrency(order.amountReceived)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change</span>
              <span>{formatCurrency(order.change)}</span>
            </div>
          </>
        )}
        <div className="border-t border-dashed border-slate-400 my-2" />
        <p className="text-center">Thank you for dining with us!</p>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          CLOSE
        </Button>
        <Button className="flex-1" loading={printing} onClick={handlePrint}>
          PRINT
        </Button>
      </div>
    </Modal>
  );
}
