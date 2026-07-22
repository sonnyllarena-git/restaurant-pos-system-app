export function calculateTax(subtotal, rate) {
  return Math.max(0, subtotal) * rate;
}

export function calculateTotal(subtotal, tax, discount = 0) {
  return Math.max(0, subtotal + tax - discount);
}

export function calculateChange(received, due) {
  return Math.max(0, (Number(received) || 0) - (Number(due) || 0));
}
