import * as XLSX from 'xlsx';

// No filesystem access is available in a plain browser tab, so the workbook is
// serialized to a Blob and downloaded via a temporary <a download> link — this
// lands in the browser's default Downloads location, standing in for a direct
// filesystem write until a future Electron shell can do that natively.

function toRow(order) {
  return {
    'Order ID': order.id,
    'Customer Name': order.customerName || '',
    Phone: order.customerPhone || '',
    'Order Type': order.orderType,
    'Order Source': order.orderSource || '',
    'Items Count': order.items?.length || 0,
    Subtotal: order.subtotal,
    Tax: order.tax,
    Total: order.total,
    Status: order.status,
    'Created Date/Time': order.createdAt ? new Date(order.createdAt).toLocaleString('en-PH') : '',
    'Order Date': order.orderDate || '',
    'Order Time': order.orderTime || '',
  };
}

export function exportOrdersToExcel(orders) {
  const rows = (orders || []).map(toRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  const arrayBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Orders_${today}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
