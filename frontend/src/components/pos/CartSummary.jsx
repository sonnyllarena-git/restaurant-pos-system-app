import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useOrder } from '../../hooks/useOrder';
import { UIContext } from '../../context/UIContext';
import CartItem from './CartItem';
import Button from '../common/Button';
import AdvanceOrderModal from './AdvanceOrderModal';
import { formatCurrency } from '../../utils/formatters';

export default function CartSummary() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, tax, total } = useCart();
  const { selectedTable, serviceType, orderType } = useOrder();
  const { confirm } = useContext(UIContext);
  const navigate = useNavigate();
  const [showAdvanceOrder, setShowAdvanceOrder] = useState(false);

  const handleClear = () => {
    confirm({
      title: 'Clear Cart',
      message: 'Remove all items from the current order?',
      confirmLabel: 'CLEAR',
      danger: true,
      onConfirm: clearCart,
    });
  };

  const handlePrimaryAction = () => {
    if (orderType === 'advance') {
      setShowAdvanceOrder(true);
    } else {
      navigate('/pos/payment');
    }
  };

  const orderLabel = selectedTable
    ? `Table ${selectedTable}`
    : serviceType
    ? serviceType.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  return (
    <div className="flex flex-col h-full border-l border-slate-200 bg-white w-96 shrink-0">
      <div className="px-4 py-4 border-b border-slate-200">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">Current Order</h3>
        <p className="text-sm text-slate-600">{orderLabel}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">Cart is empty. Add items from the menu.</p>
        ) : (
          items.map((item) => (
            <CartItem key={item.cartItemId} item={item} onUpdateQuantity={updateQuantity} onRemove={removeItem} />
          ))
        )}
      </div>
      <div className="border-t border-slate-200 px-4 py-4 space-y-1">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-100">
          <span>Total</span>
          <span className="text-orange-500">{formatCurrency(total)}</span>
        </div>
      </div>
      <div className="p-4 flex gap-3">
        <Button variant="secondary" className="flex-1" disabled={items.length === 0} onClick={handleClear}>
          CLEAR
        </Button>
        <Button className="flex-1" disabled={items.length === 0} onClick={handlePrimaryAction}>
          {orderType === 'advance' ? 'SUBMIT ADVANCE ORDER' : 'CHECKOUT'}
        </Button>
      </div>
      {showAdvanceOrder && <AdvanceOrderModal onClose={() => setShowAdvanceOrder(false)} />}
    </div>
  );
}
