import React, { useState, useEffect, useMemo, useContext } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../hooks/useAuth';
import { NotificationContext } from '../../context/NotificationContext';
import { SettingsContext } from '../../context/SettingsContext';
import { editOrder, getMenuItems } from '../../services/dbService';
import { calculateTax, calculateTotal } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { generateId } from '../../utils/helpers';
import { SERVICE_TYPES } from '../../utils/constants';
import { DELIVERY_COMPANIES } from '../../utils/deliveryData';

const SERVICE_TYPE_OPTIONS = [
  { value: SERVICE_TYPES.DINE_IN, label: 'Dine In' },
  { value: SERVICE_TYPES.TAKEOUT, label: 'Takeout' },
  { value: SERVICE_TYPES.DELIVERY, label: 'Delivery' },
  { value: SERVICE_TYPES.PICKUP, label: 'Pickup' },
];

export default function EditOrderModal({ order, onClose, onSaved }) {
  const { user } = useAuth();
  const { settings } = useContext(SettingsContext);
  const { showSuccess, showError } = useContext(NotificationContext);

  const [customerName, setCustomerName] = useState(order.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone || '');
  const [serviceType, setServiceType] = useState(order.serviceType || SERVICE_TYPES.DINE_IN);
  const [tableNumber, setTableNumber] = useState(order.tableNumber || '');
  const [deliveryMethod, setDeliveryMethod] = useState(order.deliveryMethod || 'walk_in');
  const [deliveryCompany, setDeliveryCompany] = useState(order.deliveryCompany || '');
  const [editableItems, setEditableItems] = useState(order.items.map((item) => ({ ...item })));
  const [menuItems, setMenuItems] = useState([]);
  const [addItemId, setAddItemId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMenuItems().then(setMenuItems);
  }, []);

  const subtotal = useMemo(
    () => editableItems.reduce((sum, item) => sum + (item.total ?? item.quantity * item.unitPrice), 0),
    [editableItems]
  );
  const tax = useMemo(() => calculateTax(subtotal, settings.taxRate), [subtotal, settings.taxRate]);
  const total = useMemo(() => calculateTotal(subtotal, tax, 0), [subtotal, tax]);

  const handleRemoveItem = (id) => {
    setEditableItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    const menuItem = menuItems.find((m) => m.id === addItemId);
    if (!menuItem) return;
    setEditableItems((prev) => [
      ...prev,
      {
        id: generateId(),
        name: menuItem.name,
        quantity: 1,
        unitPrice: menuItem.price,
        total: menuItem.price,
        specialRequests: '',
        status: 'pending',
      },
    ]);
    setAddItemId('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await editOrder(
        order.id,
        {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          serviceType,
          tableNumber: serviceType === SERVICE_TYPES.DINE_IN ? (tableNumber ? Number(tableNumber) : null) : null,
          deliveryMethod: serviceType === SERVICE_TYPES.DELIVERY ? deliveryMethod : null,
          deliveryCompany:
            serviceType === SERVICE_TYPES.DELIVERY && deliveryMethod === 'company' ? deliveryCompany || null : null,
          items: editableItems,
        },
        user?.fullName || user?.username || 'Unknown'
      );
      showSuccess('Order updated');
      onSaved && onSaved();
    } catch (err) {
      showError('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Edit Order — ${order.customerName || 'Order'}`} onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Phone</label>
            <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            >
              {SERVICE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {serviceType === SERVICE_TYPES.DINE_IN && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Table Number</label>
              <Input type="number" min="1" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
            </div>
          )}

          {serviceType === SERVICE_TYPES.DELIVERY && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Method</label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="walk_in">Walk-in Customer</option>
                <option value="company">Company Delivery</option>
              </select>
            </div>
          )}
        </div>

        {serviceType === SERVICE_TYPES.DELIVERY && deliveryMethod === 'company' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Company</label>
            <select
              value={deliveryCompany}
              onChange={(e) => setDeliveryCompany(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            >
              <option value="">Select a delivery company...</option>
              {DELIVERY_COMPANIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Items</h4>
          <div className="space-y-2 mb-3">
            {editableItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center border border-slate-300 rounded px-3 py-2">
                <span className="text-sm text-slate-900">
                  {item.quantity}x {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    {formatCurrency(item.total ?? item.quantity * item.unitPrice)}
                  </span>
                  <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 text-sm">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {editableItems.length === 0 && <p className="text-sm text-slate-500">No items.</p>}
          </div>
          <div className="flex gap-2">
            <select
              value={addItemId}
              onChange={(e) => setAddItemId(e.target.value)}
              className="flex-1 px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            >
              <option value="">Add a menu item...</option>
              {menuItems.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {formatCurrency(m.price)}
                </option>
              ))}
            </select>
            <Button variant="secondary" disabled={!addItemId} onClick={handleAddItem}>
              ADD
            </Button>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-1">
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

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            CANCEL
          </Button>
          <Button className="flex-1" onClick={handleSave} loading={saving}>
            SAVE CHANGES
          </Button>
        </div>
      </div>
    </Modal>
  );
}
