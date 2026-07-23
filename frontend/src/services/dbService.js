import { generateId } from '../utils/helpers';

// IndexedDB is used instead of the spec's literal `better-sqlite3` because this app
// runs in a plain Vite/browser context with no Node/Electron process to host a native
// module. Function names/signatures mirror what a real SQLite service would expose,
// so swapping the storage engine later is a drop-in change, not a call-site rewrite.

const DB_NAME = 'pos_system';
const DB_VERSION = 1;
const ORDERS_STORE = 'orders';
const MENU_ITEMS_STORE = 'menu_items';

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ORDERS_STORE)) {
        db.createObjectStore(ORDERS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(MENU_ITEMS_STORE)) {
        db.createObjectStore(MENU_ITEMS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function withStore(storeName, mode, callback) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const result = callback(store);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAll(storeName) {
  return withStore(storeName, 'readonly', (store) => requestToPromise(store.getAll())).then((r) => r);
}

export async function getAllOrders() {
  return getAll(ORDERS_STORE).then((orders) => orders || []);
}

export async function getOrderById(orderId) {
  return withStore(ORDERS_STORE, 'readonly', (store) => requestToPromise(store.get(orderId))).then(
    (r) => r || null
  );
}

export async function saveOrder(orderData) {
  const existingOrders = await getAllOrders();
  const orderNumber = existingOrders.length + 1;
  const order = {
    id: orderData.id || generateId(),
    orderNumber,
    customerName: orderData.customerName || '',
    customerPhone: orderData.customerPhone || '',
    orderType: orderData.orderType || 'regular',
    orderSource: orderData.orderSource || null,
    serviceType: orderData.serviceType || null,
    tableNumber: orderData.tableNumber ?? null,
    items: orderData.items || [],
    subtotal: orderData.subtotal || 0,
    tax: orderData.tax || 0,
    total: orderData.total || 0,
    status: orderData.status || 'pending',
    orderDate: orderData.orderDate || null,
    orderTime: orderData.orderTime || null,
    createdAt: orderData.createdAt || new Date().toISOString(),
    completedAt: orderData.completedAt || null,
    cancelledAt: orderData.cancelledAt || null,
    cancelReason: orderData.cancelReason || null,
    cancelledBy: orderData.cancelledBy || null,
    notes: orderData.notes || '',
  };
  await withStore(ORDERS_STORE, 'readwrite', (store) => store.put(order));
  return order;
}

export async function getOrdersByCustomer(name, phone) {
  const orders = await getAllOrders();
  const normalizedName = (name || '').trim().toLowerCase();
  const normalizedPhone = (phone || '').trim();
  return orders.filter((order) => {
    const matchesName = normalizedName && order.customerName?.trim().toLowerCase() === normalizedName;
    const matchesPhone = normalizedPhone && order.customerPhone?.trim() === normalizedPhone;
    return matchesName || matchesPhone;
  });
}

export async function updateOrderStatus(orderId, status) {
  const order = await getOrderById(orderId);
  if (!order) return null;
  const updated = { ...order, status };
  if (status === 'completed') updated.completedAt = new Date().toISOString();
  if (status === 'cancelled') updated.cancelledAt = new Date().toISOString();
  await withStore(ORDERS_STORE, 'readwrite', (store) => store.put(updated));
  return updated;
}

export async function cancelOrder(orderId, reason, cancelledBy) {
  const order = await getOrderById(orderId);
  if (!order) return null;
  const updated = {
    ...order,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelReason: reason || null,
    cancelledBy: cancelledBy || null,
  };
  await withStore(ORDERS_STORE, 'readwrite', (store) => store.put(updated));
  return updated;
}

export async function getAllPendingAdvanceOrders() {
  const orders = await getAllOrders();
  return orders.filter((order) => order.orderType === 'advance' && order.status === 'pending');
}

export async function updateOrderServiceType(orderId, serviceType) {
  const order = await getOrderById(orderId);
  if (!order) return null;
  const updated = { ...order, serviceType };
  await withStore(ORDERS_STORE, 'readwrite', (store) => store.put(updated));
  return updated;
}

export async function updateOrderItemStatus(orderId, itemId, status) {
  const order = await getOrderById(orderId);
  if (!order) return null;
  const items = order.items.map((item) => (item.id === itemId ? { ...item, status } : item));
  const updated = { ...order, items };
  await withStore(ORDERS_STORE, 'readwrite', (store) => store.put(updated));
  return updated;
}

export async function getOrderHistory(filters = {}) {
  const orders = await getAllOrders();
  const { customerName, customerPhone, status, dateFrom, dateTo } = filters;
  return orders.filter((order) => {
    if (customerName && !order.customerName?.toLowerCase().includes(customerName.toLowerCase())) return false;
    if (customerPhone && !order.customerPhone?.includes(customerPhone)) return false;
    if (status && order.status !== status) return false;
    if (dateFrom && new Date(order.createdAt) < new Date(dateFrom)) return false;
    if (dateTo && new Date(order.createdAt) > new Date(dateTo)) return false;
    return true;
  });
}

export async function getMenuItems() {
  return getAll(MENU_ITEMS_STORE).then((items) => items || []);
}

export async function seedMenuItemsIfEmpty(seedArray) {
  const existing = await getMenuItems();
  if (existing.length > 0) return existing;
  await withStore(MENU_ITEMS_STORE, 'readwrite', (store) => {
    seedArray.forEach((item) => store.put(item));
  });
  return getMenuItems();
}
