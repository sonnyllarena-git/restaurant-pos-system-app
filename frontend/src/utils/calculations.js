// Tax is deliberately not charged -- Total is always just the sum of item prices.
// This ignores `rate` on purpose so the result is correct regardless of any
// persisted/configurable tax-rate setting, rather than depending on that setting
// happening to be zero.
export function calculateTax() {
  return 0;
}

export function calculateTotal(subtotal, tax, discount = 0) {
  return Math.max(0, subtotal + tax - discount);
}

export function calculateChange(received, due) {
  return Math.max(0, (Number(received) || 0) - (Number(due) || 0));
}
