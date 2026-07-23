import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useOrder } from '../../hooks/useOrder';
import { NotificationContext } from '../../context/NotificationContext';
import PaymentCash from './PaymentCash';
import OrderSuccess from './OrderSuccess';
import OrderConfirmationModal from './OrderConfirmationModal';
import Input from '../common/Input';
import { saveOrder, markTableOccupied } from '../../services/dbService';
import { ORDER_TYPES, SERVICE_TYPES } from '../../utils/constants';

export default function PaymentScreen() {
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { selectedTable, serviceType, deliveryMethod, deliveryCompany, resetOrder } = useOrder();
  const { showError } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [completedOrder, setCompletedOrder] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const orderLabel = selectedTable ? `Table ${selectedTable}` : serviceType === 'takeout' ? 'Takeout Order' : 'Delivery Order';

  const handleCancel = () => navigate('/pos');

  const handleReviewPayment = ({ amountReceived, change }) => {
    let hasError = false;
    if (!customerName.trim()) {
      setNameError('Customer name is required');
      hasError = true;
    } else {
      setNameError('');
    }
    if (!customerPhone.trim()) {
      setPhoneError('Customer phone is required');
      hasError = true;
    } else {
      setPhoneError('');
    }
    if (hasError) return;
    setPendingPayment({ amountReceived, change });
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    setSaving(true);
    try {
      const savedOrder = await saveOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType: ORDER_TYPES.REGULAR,
        orderSource: null,
        serviceType,
        tableNumber: selectedTable || null,
        deliveryMethod,
        deliveryCompany,
        items: items.map((item) => ({
          id: item.cartItemId,
          name: item.menuItem.name,
          quantity: item.quantity,
          unitPrice: item.menuItem.price,
          total: item.lineTotal,
          specialRequests: item.specialNotes || '',
          status: 'pending',
        })),
        subtotal,
        tax,
        total,
        status: 'pending',
        amountReceived: pendingPayment.amountReceived,
        change: pendingPayment.change,
        paymentMethod: 'cash',
      });

      if (serviceType === SERVICE_TYPES.DINE_IN && selectedTable) {
        await markTableOccupied(selectedTable, savedOrder.id);
      }

      setShowConfirmation(false);
      setCompletedOrder({
        id: savedOrder.id,
        orderLabel,
        items,
        subtotal,
        tax,
        total,
        amountReceived: pendingPayment.amountReceived,
        change: pendingPayment.change,
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
      <div className="w-full max-w-sm mb-6 space-y-4">
        <div>
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
        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-slate-700 mb-2">
            Customer Phone
          </label>
          <Input
            id="customerPhone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="09XX XXX XXXX"
            error={phoneError}
          />
        </div>
      </div>
      <PaymentCash amountDue={total} onConfirm={handleReviewPayment} onCancel={handleCancel} loading={saving} />

      {showConfirmation && (
        <OrderConfirmationModal
          orderType="regular"
          serviceType={serviceType}
          tableNumber={selectedTable}
          deliveryMethod={deliveryMethod}
          deliveryCompany={deliveryCompany}
          customerName={customerName}
          customerPhone={customerPhone}
          items={items}
          subtotal={subtotal}
          tax={tax}
          total={total}
          onBack={() => setShowConfirmation(false)}
          onCancel={handleCancel}
          onConfirm={handleConfirmOrder}
          saving={saving}
        />
      )}

      {completedOrder && <OrderSuccess order={completedOrder} onDone={handleDone} />}
    </div>
  );
}
