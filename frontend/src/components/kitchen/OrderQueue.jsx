import React from 'react';
import OrderCard from './OrderCard';

export default function OrderQueue({ orders, onStatusChange, onCompleteOrder }) {
  const sorted = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (sorted.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-16">No orders in this view.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sorted.map((order) => (
        <OrderCard key={order.id} order={order} onStatusChange={onStatusChange} onCompleteOrder={onCompleteOrder} />
      ))}
    </div>
  );
}
