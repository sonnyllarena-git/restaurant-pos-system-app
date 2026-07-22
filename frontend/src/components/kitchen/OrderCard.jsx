import React from 'react';
import Button from '../common/Button';
import OrderTimer from './OrderTimer';

export default function OrderCard({ order, onStatusChange }) {
  const getStatusColor = (status) =>
    ({
      pending: 'bg-red-100 text-red-900 border-red-300',
      in_progress: 'bg-amber-100 text-amber-900 border-amber-300',
      ready: 'bg-green-100 text-green-900 border-green-300',
    }[status] || 'bg-slate-100');

  const isAdvance = order.orderType === 'advance';
  const label = order.tableNumber
    ? `TABLE ${order.tableNumber}`
    : order.serviceType
    ? order.serviceType.replace('_', ' ').toUpperCase()
    : 'ORDER';

  return (
    <OrderTimer createdAt={order.createdAt}>
      {(elapsedTime, isUrgent) => (
        <div className={`border-2 rounded p-4 space-y-3 ${isUrgent ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}>
          <div className="flex justify-between items-start">
            <div>
              {isAdvance && (
                <span className="inline-block mb-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                  📅 ADVANCE ORDER
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900">{label}</h3>
              {order.customerName && <p className="text-sm text-slate-600">{order.customerName}</p>}
              {isAdvance ? (
                <p className="text-sm font-medium text-blue-700">
                  {order.orderDate} • {order.orderTime}
                </p>
              ) : (
                <p className="text-sm text-slate-500">{order.createdAt}</p>
              )}
            </div>
            <div className="text-right">
              <div className={`inline-block px-3 py-1 rounded text-sm font-medium border ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </div>
              <div className={`text-2xl font-bold mt-2 ${isUrgent ? 'text-red-600' : 'text-slate-600'}`}>
                ⏱ {elapsedTime}m
              </div>
            </div>
          </div>
          <div className="space-y-2 border-t border-b border-slate-300 py-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900">
                    {item.quantity}x {item.name}
                  </p>
                  {item.specialRequests && <p className="text-xs text-slate-500 italic">{item.specialRequests}</p>}
                </div>
                <select
                  value={item.status}
                  onChange={(e) => onStatusChange(order.id, item.id, e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="ready">Ready</option>
                </select>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={() => onStatusChange(order.id, null, 'ready')}>
            MARK ENTIRE ORDER READY
          </Button>
        </div>
      )}
    </OrderTimer>
  );
}
