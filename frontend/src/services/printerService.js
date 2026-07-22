export function printReceipt(order) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[printerService] Printing receipt for order', order?.id ?? order);
      resolve({ success: true, printedAt: new Date().toISOString() });
    }, 800);
  });
}
