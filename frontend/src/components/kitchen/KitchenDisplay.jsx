import React, { useState, useEffect, useCallback, useContext } from 'react';
import StatusFilter from './StatusFilter';
import OrderQueue from './OrderQueue';
import KitchenSettings from './KitchenSettings';
import ServiceConfirmationModal from './ServiceConfirmationModal';
import Loader from '../common/Loader';
import PageHeader from '../common/PageHeader';
import Modal from '../common/Modal';
import PaymentCash from '../pos/PaymentCash';
import { NotificationContext } from '../../context/NotificationContext';
import {
  getAllOrders,
  updateOrderItemStatus,
  updateOrderStatus,
  updateOrderServiceType,
} from '../../services/dbService';
import { exportOrdersToExcel } from '../../utils/excelExport';

function deriveOrderStatus(items) {
  if (items.every((item) => item.status === 'ready')) return 'ready';
  if (items.some((item) => item.status === 'in_progress' || item.status === 'ready')) return 'in_progress';
  return 'pending';
}

function todayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isToday(dateStr) {
  // orderDate is a plain 'YYYY-MM-DD' string from a native date input (local calendar
  // day, no timezone). Comparing it as a string avoids `new Date(dateStr)` silently
  // reinterpreting it as UTC midnight and shifting it a day back in negative-UTC-offset zones.
  if (!dateStr) return false;
  return dateStr === todayDateString();
}

function sortQueueOrders(orders) {
  const regular = orders.filter((o) => o.orderType !== 'advance');
  const advance = orders.filter((o) => o.orderType === 'advance');
  regular.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  advance.sort((a, b) => (a.orderTime || '').localeCompare(b.orderTime || ''));
  return [...regular, ...advance];
}

export default function KitchenDisplay() {
  const [orders, setOrders] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [nightMode, setNightMode] = useState(false);
  const [completingOrder, setCompletingOrder] = useState(null);
  const [payingOrder, setPayingOrder] = useState(null);
  const [completing, setCompleting] = useState(false);
  const { showSuccess, showError, showInfo } = useContext(NotificationContext);

  const loadOrders = useCallback(async () => {
    const allOrders = await getAllOrders();
    const active = allOrders.filter((order) => {
      if (order.status === 'completed' || order.status === 'cancelled') return false;
      if (order.orderType === 'advance') return isToday(order.orderDate);
      return true;
    });
    setOrders(sortQueueOrders(active));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId, itemId, newStatus) => {
    if (itemId) {
      await updateOrderItemStatus(orderId, itemId, newStatus);
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        const items = order.items.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item));
        await updateOrderStatus(orderId, deriveOrderStatus(items));
      }
    } else {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        for (const item of order.items) {
          await updateOrderItemStatus(orderId, item.id, 'ready');
        }
        await updateOrderStatus(orderId, 'ready');
      }
    }
    await loadOrders();
  };

  const handleStartComplete = (order) => setCompletingOrder(order);

  const handleServiceConfirmed = async (serviceType) => {
    if (serviceType !== completingOrder.serviceType) {
      await updateOrderServiceType(completingOrder.id, serviceType);
    }
    setPayingOrder({ ...completingOrder, serviceType });
    setCompletingOrder(null);
  };

  const handleCompletePayment = async (_payment) => {
    setCompleting(true);
    try {
      await updateOrderStatus(payingOrder.id, 'completed');
      const allOrders = await getAllOrders();
      exportOrdersToExcel(allOrders, { onFallbackHint: showInfo });
      setPayingOrder(null);
      await loadOrders();
      showSuccess('Order completed');
    } catch (err) {
      showError('Failed to complete order');
    } finally {
      setCompleting(false);
    }
  };

  const filteredOrders = orders === null ? [] : activeFilter === 'all' ? orders : orders.filter((o) => o.status === activeFilter);

  return (
    <div className={`h-full flex flex-col ${nightMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <PageHeader title="Kitchen Display" dark={nightMode} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${nightMode ? 'text-white' : 'text-slate-900'}`}>
              Kitchen Display
            </h2>
            <p className={`text-sm ${nightMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {orders === null ? 'Loading...' : `${orders.length} active orders`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <StatusFilter activeFilter={activeFilter} onChange={setActiveFilter} />
            <KitchenSettings nightMode={nightMode} onToggle={() => setNightMode((v) => !v)} />
          </div>
        </div>
        {orders === null ? <Loader label="Loading orders..." /> : (
          <OrderQueue orders={filteredOrders} onStatusChange={handleStatusChange} onCompleteOrder={handleStartComplete} />
        )}
      </div>

      {completingOrder && (
        <ServiceConfirmationModal
          order={completingOrder}
          onClose={() => setCompletingOrder(null)}
          onContinue={handleServiceConfirmed}
        />
      )}

      {payingOrder && (
        <Modal title="Complete Order — Payment" onClose={() => !completing && setPayingOrder(null)} size="sm">
          <PaymentCash
            amountDue={payingOrder.total}
            onConfirm={handleCompletePayment}
            onCancel={() => setPayingOrder(null)}
            loading={completing}
          />
        </Modal>
      )}
    </div>
  );
}
