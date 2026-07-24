import React, { useContext } from 'react';
import { SettingsContext } from '../../context/SettingsContext';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';

export default function ReceiptPreview({ order }) {
  const { settings } = useContext(SettingsContext);

  return (
    <div className="border border-slate-300 rounded p-4 font-mono text-xs text-slate-900 bg-slate-50">
      <div className="text-center mb-3">
        <p className="text-sm font-bold">{settings.restaurantName}</p>
        <p>{settings.address}</p>
        <p>{settings.phone}</p>
      </div>
      <div className="border-t border-dashed border-slate-400 my-2" />
      <p>Order #: {order.id}</p>
      <p>{order.orderLabel}</p>
      <p>{formatDate(order.createdAt)} {formatTime(order.createdAt)}</p>
      <div className="border-t border-dashed border-slate-400 my-2" />
      {order.items.map((item) => (
        <div key={item.cartItemId} className="flex justify-between">
          <span>
            {item.quantity}x {item.menuItem.name}
          </span>
          <span>{formatCurrency(item.lineTotal)}</span>
        </div>
      ))}
      <div className="border-t border-dashed border-slate-400 my-2" />
      <div className="flex justify-between font-bold text-sm">
        <span>Total</span>
        <span>{formatCurrency(order.total)}</span>
      </div>
      <div className="flex justify-between">
        <span>Cash</span>
        <span>{formatCurrency(order.amountReceived)}</span>
      </div>
      <div className="flex justify-between">
        <span>Change</span>
        <span>{formatCurrency(order.change)}</span>
      </div>
      <div className="border-t border-dashed border-slate-400 my-2" />
      <p className="text-center">Thank you for dining with us!</p>
    </div>
  );
}
