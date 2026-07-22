import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useOrder } from '../../hooks/useOrder';
import { NotificationContext } from '../../context/NotificationContext';
import PaymentCash from './PaymentCash';
import OrderSuccess from './OrderSuccess';
import Input from '../common/Input';
import { generateId } from '../../utils/helpers';
import { saveOrder, getAllOrders } from '../../services/dbService';
import { exportOrdersToExcel } from '../../utils/excelExport';
import { ORDER_TYPES } from '../../utils/constants';

export default function PaymentScreen() {
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { selectedTable, serviceType, resetOrder } = useOrder();
  const { showError } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [completedOrder, setCompletedOrder] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  const orderLabel = selectedTable ? `Table ${selectedTable}` : serviceType === 'takeout' ? 'Takeout Order' : 'Delivery Order';

  const handleCancel = () => navigate('/pos');

  const handleConfirmPayment = async ({ amountReceived, change }) => {
    if (!customerName.trim()) {
      setNameError('Customer name is required');
      return;
    }
    setNameError('');
    setSaving(true);
    try {
      const savedOrder = await saveOrder({
        customerName: customerName.trim(),
        customerPhone: '',
        orderType: ORDER_TYPES.REGULAR,
        orderSource: null,
        serviceType,
        tableNumber: selectedTable || null,
        items: items.map((item) => ({
          id: item.cartItemId,
          name: item.menuItem.name,
          quantity: item.quantity,
          unitPrice: item.menuItem.price,
          total: item.lineTotal,
          specialRequests: item.specialNotes || '',
          status: 'ready',
        })),
        subtotal,
        tax,
        total,
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      const allOrders = await getAllOrders();
      exportOrdersToExcel(allOrders);

      setCompletedOrder({
        id: savedOrder.id,
        orderLabel,
        items,
        subtotal,
        tax,
        total,
        amountReceived,
        change,
        createdAt: savedOrder.createdAt,
      });
    } catch (err) {
      showError('Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const handleDone = () => {
    clearCart();
    resetOrder();
    navigate('/pos');
  };

  if (items.length === 0 && !completedOrder) {
    navigate('/pos');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Payment</h2>
      <p className="text-sm text-slate-600 mb-8">{orderLabel}</p>
      <div className="w-full max-w-sm mb-6">
        <label htmlFor="customerName" className="block text-sm font-medium text-slate-700 mb-2">
          Customer Name
        </label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Customer name"
          error={nameError}
        />
      </div>
      <PaymentCash amountDue={total} onConfirm={handleConfirmPayment} onCancel={handleCancel} loading={saving} />
      {completedOrder && <OrderSuccess order={completedOrder} onDone={handleDone} />}
    </div>
  );
}
