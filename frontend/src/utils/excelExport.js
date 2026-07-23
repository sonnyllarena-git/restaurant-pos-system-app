import * as XLSX from 'xlsx';

// Separate tiny IndexedDB database (rather than reusing dbService's `pos_system` DB)
// so this file has no import-time dependency on dbService's schema/versioning —
// a FileSystemFileHandle is structured-cloneable and can be put()/get() directly,
// it just needs *some* object store to live in.
const HANDLE_DB_NAME = 'pos_system_handles';
const HANDLE_DB_VERSION = 1;
const HANDLE_STORE = 'app_handles';
const ORDERS_FILE_HANDLE_KEY = 'ordersFile';

let handleDbPromise = null;

function openHandleDb() {
  if (handleDbPromise) return handleDbPromise;
  handleDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(HANDLE_DB_NAME, HANDLE_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(HANDLE_STORE)) {
        db.createObjectStore(HANDLE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return handleDbPromise;
}

function getStoredHandle() {
  return openHandleDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(HANDLE_STORE, 'readonly');
        const request = tx.objectStore(HANDLE_STORE).get(ORDERS_FILE_HANDLE_KEY);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      })
  );
}

function putStoredHandle(handle) {
  return openHandleDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(HANDLE_STORE, 'readwrite');
        tx.objectStore(HANDLE_STORE).put(handle, ORDERS_FILE_HANDLE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
  );
}

export function isFileSystemAccessSupported() {
  return typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';
}

// Must be invoked as the very first `await` inside a click handler — Chromium only
// honors showSaveFilePicker() while it can still see the original user gesture, so no
// awaited work (or even a synchronous check routed through another async function)
// may precede this call in the caller's event handler.
export async function connectOrdersFile() {
  if (!isFileSystemAccessSupported()) {
    throw new Error('NOT_SUPPORTED');
  }
  const handle = await window.showSaveFilePicker({
    suggestedName: 'Orders.xlsx',
    types: [
      {
        description: 'Excel Workbook',
        accept: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
      },
    ],
  });
  await putStoredHandle(handle);
  return handle;
}

export async function getConnectedFileName() {
  const handle = await getStoredHandle();
  return handle ? handle.name : null;
}

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

function buildWorkbookArrayBuffer(orders) {
  const rows = (orders || []).map(toRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
}

function downloadWorkbook(orders) {
  const arrayBuffer = buildWorkbookArrayBuffer(orders);
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

const SESSION_HINT_KEY = 'excelExportHintShown';

function maybeShowConnectHint() {
  try {
    if (sessionStorage.getItem(SESSION_HINT_KEY)) return null;
    sessionStorage.setItem(SESSION_HINT_KEY, '1');
    return 'Tip: visit Settings > Backup to connect a single Orders.xlsx file instead of per-order downloads.';
  } catch (e) {
    return null;
  }
}

// Re-checking/re-requesting permission on an already-approved handle is allowed by the
// spec without a fresh user gesture as long as it's the same origin+handle, so this can
// safely run inside the async save flow rather than a click handler.
async function hasWritePermission(handle) {
  const opts = { mode: 'readwrite' };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  if ((await handle.requestPermission(opts)) === 'granted') return true;
  return false;
}

export async function exportOrdersToExcel(orders, { onFallbackHint } = {}) {
  const handle = await getStoredHandle().catch(() => null);

  if (handle) {
    try {
      const granted = await hasWritePermission(handle);
      if (granted) {
        const arrayBuffer = buildWorkbookArrayBuffer(orders);
        const writable = await handle.createWritable();
        await writable.write(arrayBuffer);
        await writable.close();
        return { mode: 'file', fileName: handle.name };
      }
    } catch (err) {
      // Fall through to the per-order download fallback below on any failure
      // (permission revoked, file moved/deleted, user cancelled a re-prompt, etc.)
    }
  }

  downloadWorkbook(orders);
  const hint = maybeShowConnectHint();
  if (hint && onFallbackHint) onFallbackHint(hint);
  return { mode: 'download' };
}
