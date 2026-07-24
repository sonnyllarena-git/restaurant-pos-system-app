import React, { useState, useMemo, useContext } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SelectableCard from '../common/SelectableCard';
import Input from '../common/Input';
import TableSelector from './TableSelector';
import DeliveryMethodModal from './DeliveryMethodModal';
import MenuBrowser from './MenuBrowser';
import CartItem from './CartItem';
import ItemCustomization from './ItemCustomization';
import PaymentCash from './PaymentCash';
import OrderConfirmationModal from './OrderConfirmationModal';
import OrderSuccess from './OrderSuccess';
import DuplicateWarningModal from './DuplicateWarningModal';
import { useOrder } from '../../hooks/useOrder';
import { useCart } from '../../hooks/useCart';
import { useDuplicateCheck } from '../../hooks/useDuplicateCheck';
import { UIContext } from '../../context/UIContext';
import { NotificationContext } from '../../context/NotificationContext';
import { SettingsContext } from '../../context/SettingsContext';
import { saveOrder, markTableOccupied } from '../../services/dbService';
import { formatCurrency } from '../../utils/formatters';
import { ORDER_TYPES, ORDER_SOURCES, SERVICE_TYPES } from '../../utils/constants';

const REGULAR_SERVICE_OPTIONS = [
  { type: SERVICE_TYPES.DINE_IN, icon: '🍽️', label: 'Dine In' },
  { type: SERVICE_TYPES.TAKEOUT, icon: '🥡', label: 'Takeout' },
  { type: SERVICE_TYPES.DELIVERY, icon: '🚚', label: 'Delivery' },
];

const ADVANCE_SERVICE_OPTIONS = [
  { type: SERVICE_TYPES.DINE_IN, icon: '🍽️', label: 'Dine In' },
  { type: SERVICE_TYPES.PICKUP, icon: '🛍️', label: 'Pickup' },
  { type: SERVICE_TYPES.DELIVERY, icon: '🚚', label: 'Delivery' },
];

const SOURCE_OPTIONS = [
  { value: ORDER_SOURCES.PHONE, label: 'Phone Call' },
  { value: ORDER_SOURCES.SMS, label: 'SMS Message' },
  { value: ORDER_SOURCES.FACEBOOK, label: 'Facebook' },
  { value: ORDER_SOURCES.WHATSAPP, label: 'WhatsApp' },
  { value: ORDER_SOURCES.WALK_IN, label: 'Walk-in' },
];

function serviceLabel(type) {
  return (type || '').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function todayISO() {
  // Built from local date components, not toISOString(), which reports the UTC
  // calendar day and can be a day ahead/behind local time near midnight.
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function WizardModalContainer({ orderType, onClose }) {
  const {
    serviceType,
    setServiceType,
    selectedTable,
    setSelectedTable,
    deliveryMethod,
    setDeliveryMethod,
    deliveryCompany,
    setDeliveryCompany,
    resetOrder,
  } = useOrder();
  const { items, addToCart, updateQuantity, removeItem, clearCart, subtotal, tax, total } = useCart();
  const { confirm } = useContext(UIContext);
  const { showError, showSuccess } = useContext(NotificationContext);
  const { settings } = useContext(SettingsContext);
  const { checkDuplicateOrder, checkRecentSubmission } = useDuplicateCheck();

  const [stepIndex, setStepIndex] = useState(0);
  const [customizingItem, setCustomizingItem] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderSource, setOrderSource] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderTime, setOrderTime] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [cashState, setCashState] = useState({ raw: '', amountReceived: 0, change: 0, isValid: false });
  const [cashError, setCashError] = useState('');
  const [pendingPayment, setPendingPayment] = useState(null);

  const [saving, setSaving] = useState(false);
  const [duplicateOrder, setDuplicateOrder] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const steps = useMemo(() => {
    const list = [{ key: 'service', title: 'Service Type' }];
    if (serviceType === SERVICE_TYPES.DINE_IN) {
      list.push({ key: 'table', title: 'Table' });
    } else if (serviceType === SERVICE_TYPES.DELIVERY) {
      list.push({ key: 'delivery', title: 'Delivery Method' });
    }
    list.push({ key: 'menu', title: 'Menu' });
    // Advance orders collect scheduling/customer info now; payment is deliberately
    // deferred to pickup/serving time via the Kitchen Display's PAYMENT button, not
    // taken at booking time — do not add a cash step here for advance orders.
    list.push(
      orderType === ORDER_TYPES.ADVANCE
        ? { key: 'details', title: 'Customer Details' }
        : { key: 'payment', title: 'Payment' }
    );
    return list;
  }, [serviceType, orderType]);

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const isLastStep = stepIndex === steps.length - 1;
  const totalKnown = stepIndex > 0 || Boolean(serviceType);

  const orderLabel = selectedTable ? `Table ${selectedTable}` : serviceLabel(serviceType);

  const handleSelectServiceType = (type) => {
    setSelectedTable(null);
    setDeliveryMethod(null);
    setDeliveryCompany(null);
    setServiceType(type);
  };

  const handleSelectItem = (item) => {
    if (item.modifierGroups?.length > 0) {
      setCustomizingItem(item);
    } else {
      addToCart(item, 1, [], '');
      showSuccess(`${item.name} added to cart`);
    }
  };

  const handleConfirmCustomization = ({ quantity, selectedModifiers, notes }) => {
    addToCart(customizingItem, quantity, selectedModifiers, notes);
    showSuccess(`${customizingItem.name} added to cart`);
    setCustomizingItem(null);
  };

  const handleClearCart = () => {
    confirm({
      title: 'Clear Cart',
      message: 'Remove all items from the current order?',
      confirmLabel: 'CLEAR',
      danger: true,
      onConfirm: clearCart,
    });
  };

  const handleBack = () => {
    if (stepIndex === 0) return;
    setStepIndex((i) => i - 1);
  };

  const handleCancelClick = () => {
    confirm({
      title: 'Cancel Order',
      message: 'Cancel this order? Any entered details will be lost.',
      confirmLabel: 'Discard',
      danger: true,
      onConfirm: () => {
        clearCart();
        resetOrder();
        onClose();
      },
    });
  };

  const validateAdvanceDetails = () => {
    const errs = {};
    if (!customerName.trim()) errs.customerName = 'Customer name is required';
    if (!customerPhone.trim()) errs.customerPhone = 'Customer phone is required';
    if (!orderSource) errs.orderSource = 'Order source is required';
    if (!orderDate) errs.orderDate = 'Order date is required';
    if (!orderTime) errs.orderTime = 'Pickup time is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReviewAdvance = async () => {
    if (!validateAdvanceDetails()) return;
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
      setSaving(false);
      setShowConfirmation(true);
    } catch (err) {
      showError('Failed to save advance order');
      setSaving(false);
    }
  };

  const handleReviewRegular = () => {
    const errs = {};
    if (!customerName.trim()) errs.customerName = 'Customer name is required';
    if (!customerPhone.trim()) errs.customerPhone = 'Customer phone is required';
    setFieldErrors(errs);

    let cashOk = true;
    if (!cashState.raw) {
      setCashError('Please enter cash amount');
      cashOk = false;
    } else if (!cashState.isValid) {
      setCashError('Insufficient cash');
      cashOk = false;
    } else {
      setCashError('');
    }

    if (Object.keys(errs).length > 0 || !cashOk) return;

    setPendingPayment({ amountReceived: cashState.amountReceived, change: cashState.change });
    setShowConfirmation(true);
  };

  const handleNext = () => {
    switch (currentStep.key) {
      case 'service':
        if (!serviceType) {
          showError('Select a service type first');
          return;
        }
        setStepIndex((i) => i + 1);
        return;
      case 'table':
        if (!selectedTable) {
          showError('Select a table first');
          return;
        }
        setStepIndex((i) => i + 1);
        return;
      case 'delivery':
        if (!deliveryMethod) {
          showError('Select a delivery method first');
          return;
        }
        setStepIndex((i) => i + 1);
        return;
      case 'menu':
        if (items.length === 0) {
          showError('Add at least one item to the cart');
          return;
        }
        setStepIndex((i) => i + 1);
        return;
      case 'payment':
        handleReviewRegular();
        return;
      case 'details':
        handleReviewAdvance();
        return;
      default:
        return;
    }
  };

  const buildItemsPayload = () =>
    items.map((item) => ({
      id: item.cartItemId,
      name: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.menuItem.price,
      total: item.lineTotal,
      specialRequests: item.specialNotes || '',
      status: 'pending',
    }));

  const buildRegularPayload = () => ({
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    orderType: ORDER_TYPES.REGULAR,
    orderSource: null,
    serviceType,
    tableNumber: selectedTable || null,
    deliveryMethod,
    deliveryCompany,
    items: buildItemsPayload(),
    subtotal,
    tax,
    total,
    status: 'pending',
    amountReceived: pendingPayment?.amountReceived ?? null,
    change: pendingPayment?.change ?? null,
    paymentMethod: 'cash',
  });

  const buildAdvancePayload = () => ({
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    orderType: ORDER_TYPES.ADVANCE,
    orderSource,
    serviceType: serviceType || null,
    tableNumber: selectedTable || null,
    deliveryMethod,
    deliveryCompany,
    items: buildItemsPayload(),
    subtotal,
    tax,
    total,
    status: 'pending',
    orderDate,
    orderTime,
    createdAt: new Date().toISOString(),
    notes: '',
  });

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const payload = orderType === ORDER_TYPES.ADVANCE ? buildAdvancePayload() : buildRegularPayload();
      const savedOrder = await saveOrder(payload);
      if (serviceType === SERVICE_TYPES.DINE_IN && selectedTable) {
        await markTableOccupied(selectedTable, savedOrder.id);
      }
      setCompletedOrder({
        id: savedOrder.id,
        orderLabel,
        items,
        subtotal,
        tax,
        total,
        amountReceived: pendingPayment?.amountReceived ?? null,
        change: pendingPayment?.change ?? null,
        createdAt: savedOrder.createdAt,
      });
      clearCart();
      setShowConfirmation(false);
    } catch (err) {
      showError(orderType === ORDER_TYPES.ADVANCE ? 'Failed to save advance order' : 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelFromConfirmation = () => {
    clearCart();
    resetOrder();
    onClose();
  };

  const handleDoneSuccess = () => {
    resetOrder();
    onClose();
  };

  const stepNumberLabel = totalKnown ? `Step ${stepIndex + 1} of ${steps.length}` : `Step ${stepIndex + 1}`;
  const progressPct = ((stepIndex + 1) / steps.length) * 100;
  // A nested overlay (item customization, order confirmation, duplicate warning,
  // success receipt) is itself a Modal with its own Escape handler. Leaving this
  // outer Modal's Escape handler active too would pop a second "Cancel Order?"
  // dialog on top of whichever nested overlay the user is actually looking at.
  const hasNestedOverlay = Boolean(customizingItem || showConfirmation || duplicateOrder || completedOrder);

  function renderStepContent() {
    switch (currentStep.key) {
      case 'service': {
        const options = orderType === ORDER_TYPES.ADVANCE ? ADVANCE_SERVICE_OPTIONS : REGULAR_SERVICE_OPTIONS;
        return (
          <div className="flex flex-col items-center">
            <p className="text-sm text-slate-600 mb-6">
              How will this {orderType === ORDER_TYPES.ADVANCE ? 'advance' : 'regular'} order be fulfilled?
            </p>
            <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
              {options.map((opt) => (
                <SelectableCard
                  key={opt.type}
                  icon={opt.icon}
                  label={opt.label}
                  isSelected={serviceType === opt.type}
                  onClick={() => handleSelectServiceType(opt.type)}
                />
              ))}
            </div>
          </div>
        );
      }
      case 'table':
        return <TableSelector />;
      case 'delivery':
        return <DeliveryMethodModal />;
      case 'menu':
        return (
          <div className="flex h-[65vh]">
            <div className="flex-1 min-w-0 overflow-hidden border border-slate-200 rounded-l">
              <MenuBrowser onSelectItem={handleSelectItem} />
            </div>
            <div className="w-96 shrink-0 border border-l-0 border-slate-200 rounded-r flex flex-col h-full">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-base font-semibold text-slate-900">Current Order</h4>
                <button
                  onClick={handleClearCart}
                  disabled={items.length === 0}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-12">Cart is empty. Add items from the menu.</p>
                ) : (
                  items.map((item) => (
                    <CartItem
                      key={item.cartItemId}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))
                )}
              </div>
              <div className="border-t border-slate-200 px-4 py-3 space-y-1">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-orange-500">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
            {customizingItem && (
              <ItemCustomization
                item={customizingItem}
                onConfirm={handleConfirmCustomization}
                onClose={() => setCustomizingItem(null)}
              />
            )}
          </div>
        );
      case 'payment':
        return (
          <div className="max-w-sm mx-auto space-y-4">
            <p className="text-sm text-slate-600 text-center">{orderLabel}</p>
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-slate-700 mb-2">Customer Name</label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                error={fieldErrors.customerName}
              />
            </div>
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-slate-700 mb-2">Customer Phone</label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="09XX XXX XXXX"
                error={fieldErrors.customerPhone}
              />
            </div>
            <PaymentCash amountDue={total} onChange={setCashState} showActions={false} />
            {cashError && <p className="text-sm text-red-500">{cashError}</p>}
          </div>
        );
      case 'details':
        return (
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Juan Dela Cruz"
                error={fieldErrors.customerName}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Phone</label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="09XX XXX XXXX"
                error={fieldErrors.customerPhone}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Order Source</label>
              <select
                value={orderSource}
                onChange={(e) => setOrderSource(e.target.value)}
                className={`w-full px-4 py-3 border rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 ${
                  fieldErrors.orderSource ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select source...</option>
                {SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {fieldErrors.orderSource && <p className="text-sm text-red-500 mt-1">{fieldErrors.orderSource}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Order Date</label>
                <Input
                  type="date"
                  min={todayISO()}
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  error={fieldErrors.orderDate}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Time</label>
                <Input
                  type="time"
                  value={orderTime}
                  onChange={(e) => setOrderTime(e.target.value)}
                  error={fieldErrors.orderTime}
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
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Modal onClose={hasNestedOverlay ? undefined : handleCancelClick} size={currentStep.key === 'menu' ? 'xl' : 'lg'}>
        <div className="-m-6">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                {settings.restaurantName} — Order Wizard
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                {stepNumberLabel}: {currentStep.title}
              </h3>
            </div>
            <button
              onClick={handleCancelClick}
              className="text-slate-500 hover:text-slate-900 text-xl leading-none px-2"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="h-1 bg-slate-200">
            <div
              className="h-1 bg-orange-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="p-6">{renderStepContent()}</div>

          <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
            <Button variant="ghost" onClick={handleBack} disabled={stepIndex === 0}>
              ← Back
            </Button>
            <Button variant="secondary" className="ml-auto" onClick={handleCancelClick}>
              CANCEL
            </Button>
            <Button onClick={handleNext} loading={saving}>
              {isLastStep ? 'REVIEW ORDER' : 'NEXT →'}
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
            setShowConfirmation(true);
          }}
        />
      )}

      {showConfirmation && (
        <OrderConfirmationModal
          orderType={orderType}
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
          orderDate={orderType === ORDER_TYPES.ADVANCE ? orderDate : undefined}
          orderTime={orderType === ORDER_TYPES.ADVANCE ? orderTime : undefined}
          onBack={() => setShowConfirmation(false)}
          onCancel={handleCancelFromConfirmation}
          onConfirm={handleConfirmSave}
          saving={saving}
        />
      )}

      {completedOrder && <OrderSuccess order={completedOrder} onDone={handleDoneSuccess} />}
    </>
  );
}
