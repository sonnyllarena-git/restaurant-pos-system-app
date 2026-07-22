import React, { createContext, useState, useContext, useMemo } from 'react';
import { SettingsContext } from './SettingsContext';
import { calculateTax, calculateTotal } from '../utils/calculations';
import { generateId } from '../utils/helpers';

export const CartContext = createContext();

function computeLineTotal(menuItem, quantity, selectedModifiers) {
  const modifierTotal = (selectedModifiers || []).reduce((sum, m) => sum + (m.priceDelta || 0), 0);
  return (menuItem.price + modifierTotal) * quantity;
}

export function CartProvider({ children }) {
  const { settings } = useContext(SettingsContext);
  const [items, setItems] = useState([]);

  const addToCart = (menuItem, quantity = 1, selectedModifiers = [], specialNotes = '') => {
    setItems((prev) => [
      ...prev,
      {
        cartItemId: generateId(),
        menuItem,
        quantity,
        selectedModifiers,
        specialNotes,
        lineTotal: computeLineTotal(menuItem, quantity, selectedModifiers),
      },
    ]);
  };

  const updateQuantity = (cartItemId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((item) => item.cartItemId !== cartItemId);
      return prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity, lineTotal: computeLineTotal(item.menuItem, quantity, item.selectedModifiers) }
          : item
      );
    });
  };

  const removeItem = (cartItemId) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.lineTotal, 0), [items]);
  const tax = useMemo(() => calculateTax(subtotal, settings.taxRate), [subtotal, settings.taxRate]);
  const total = useMemo(() => calculateTotal(subtotal, tax, 0), [subtotal, tax]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeItem, clearCart, subtotal, tax, total }}
    >
      {children}
    </CartContext.Provider>
  );
}
