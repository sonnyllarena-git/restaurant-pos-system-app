import React, { useState, useContext } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import DuplicateWarningModal from './DuplicateWarningModal';
import { useCart } from '../../hooks/useCart';
import { useOrder } from '../../hooks/useOrder';
import { useDuplicateCheck } from '../../hooks/useDuplicateCheck';
import { UIContext } from '../../context/UIContext';
import { NotificationContext } from '../../context/NotificationContext';
import { saveOrder } from '../../services/dbService';
import { formatCurrency } from '../../utils/formatters';
import { ORDER_TYPES, ORDER_SOURCES } from '../../utils/constants';

const SOURCE_OPTIONS = [
  { value: ORDER_SOURCES.PHONE, label: 'Phone Call' },
  { value: ORDER_SOURCES.SMS, label: 'SMS Message' },
  { value: ORDER_SOURCES.FACEBOOK, label: 'Facebook' },
  { value: ORDER_SOURCES.WHATSAPP, label: 'WhatsApp' },
  { value: ORDER_SOURCES.WALK_IN, label: 'Walk-in' },
];

function todayISO() {
  // Built from local date components, not toISOString(), which reports the UTC
  // calendar day and can be a day ahead/behind local time near midnight.
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdvanceOrderModal({ onClose }) {
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { selectedTable, serviceType } = useOrder();
  const { confirm } = useContext(UIContext);
  const { showSuccess, showError } = useContext(NotificationContext);
  const { checkDuplicateOrder, checkRecentSubmission } = useDuplicateCheck();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderSource, setOrderSource] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderTime, setOrderTime] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [duplicateOrder, setDuplicateOrder] = useState(null);

  const buildOrderPayload = () => ({
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    orderType: ORDER_TYPES.ADVANCE,
    orderSource,
    serviceType: serviceType || null,
    tableNumber: selectedTable || null,
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
    orderDate,
    orderTime,
    createdAt: new Date().toISOString(),
    notes: '',
  });

  const validate = () => {
    const fieldErrors = {};
    if (!customerName.trim()) fieldErrors.customerName = 'Customer name is required';
    if (!customerPhone.trim()) fieldErrors.customerPhone = 'Customer phone is required';
    if (!orderSource) fieldErrors.orderSource = 'Order source is required';
    if (!orderDate) fieldErrors.orderDate = 'Order date is required';
    if (!orderTime) fieldErrors.orderTime = 'Pickup time is required';
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const finalizeSave = async () => {
    setSaving(true);
    try {
      await saveOrder(buildOrderPayload());
      clearCart();
      showSuccess('Advance order created');
      onClose();
    } catch (err) {
      showError('Failed to save advance order');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const submittedRecently = await checkRecentSubmission(customerPhone.trim());
      if (submittedRecently) {
        showError('Order was just submitted. Please wait.');
        setSaving(false);
        return;
      }

      const duplicate = await checkDuplicateOrder(customerName.trim(), customerPhone.trim());
      if (duplicate) {
        setDuplicateOrder(duplicate);
        setSaving(false);
        return;
      }

      await finalizeSave();
    } catch (err) {
      showError('Failed to save advance order');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    confirm({
      title: 'Cancel Advance Order',
      message: 'Cancel this advance order? Any entered details will be lost.',
      confirmLabel: 'Discard',
      danger: true,
      onConfirm: onClose,
    });
  };

  return (
    <>
      <Modal title="Create Advance Order" onClose={handleCancel} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Juan Dela Cruz"
              error={errors.customerName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Phone</label>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="09XX XXX XXXX"
              error={errors.customerPhone}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Order Source</label>
            <select
              value={orderSource}
              onChange={(e) => setOrderSource(e.target.value)}
              className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 ${
                errors.orderSource ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value="">Select source...</option>
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.orderSource && <p className="text-sm text-red-500 mt-1">{errors.orderSource}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Order Date</label>
              <Input
                type="date"
                min={todayISO()}
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                error={errors.orderDate}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Time</label>
              <Input
                type="time"
                value={orderTime}
                onChange={(e) => setOrderTime(e.target.value)}
                error={errors.orderTime}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Order Summary</h4>
            <div className="border border-slate-300 rounded p-3 space-y-1 bg-slate-50">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total</span>
                <span className="text-orange-500">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={handleCancel} disabled={saving}>
              CANCEL
            </Button>
            <Button className="flex-1" onClick={handleSubmit} loading={saving}>
              SUBMIT
            </Button>
          </div>
        </div>
      </Modal>

      {duplicateOrder && (
        <DuplicateWarningModal
          existingOrder={duplicateOrder}
          onClose={() => setDuplicateOrder(null)}
          onCreateNew={() => {
            setDuplicateOrder(null);
            finalizeSave();
          }}
        />
      )}
    </>
  );
}
