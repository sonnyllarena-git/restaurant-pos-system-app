import { generateId } from '../utils/helpers';
import { calculateTax, calculateTotal } from '../utils/calculations';
import { get as getFromStorage } from './storageService';
import { DEFAULT_TAX_RATE } from '../utils/constants';

// IndexedDB is used instead of the spec's literal `better-sqlite3` because this app
// runs in a plain Vite/browser context with no Node/Electron process to host a native
// module. Function names/signatures mirror what a real SQLite service would expose,
// so swapping the storage engine later is a drop-in change, not a call-site rewrite.

const DB_NAME = 'pos_system';
// Bump this whenever a new object store is added. `onupgradeneeded` only fires when
// the requested version is higher than what's already stored for this origin — a
// browser that already opened the DB at v1 (e.g. any existing dev/test profile) will
// silently keep only the v1 stores forever if this isn't bumped, and every call
// against a newer store (e.g. `tables`) will throw.
const DB_VERSION = 3;
const ORDERS_STORE = 'orders';
const MENU_ITEMS_STORE = 'menu_items';
const TABLES_STORE = 'tables';
const PRICE_HISTORY_STORE = 'price_history';

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
      if (!db.objectStoreNames.contains(TABLES_STORE)) {
        db.createObjectStore(TABLES_STORE, { keyPath: 'number' });
      }
      if (!db.objectStoreNames.contains(PRICE_HISTORY_STORE)) {
        db.createObjectStore(PRICE_HISTORY_STORE, { keyPath: 'id' });
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
    deliveryMethod: orderData.deliveryMethod || null,
    deliveryCompany: orderData.deliveryCompany || null,
    amountReceived: orderData.amountReceived ?? null,
    change: orderData.change ?? null,
    paymentMethod: orderData.paymentMethod || null,
    editHistory: orderData.editHistory || [],
    lastEditedAt: orderData.lastEditedAt || null,
    lastEditedBy: orderData.lastEditedBy || null,
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

export async function recordOrderPayment(orderId, { amountReceived, change, paymentMethod }) {
  const order = await getOrderById(orderId);
  if (!order) return null;
  const updated = {
    ...order,
    amountReceived: amountReceived ?? order.amountReceived,
    change: change ?? order.change,
    paymentMethod: paymentMethod || order.paymentMethod,
    status: 'completed',
    completedAt: new Date().toISOString(),
  };
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

export async function clearAllOrders() {
  await withStore(ORDERS_STORE, 'readwrite', (store) => store.clear());
  const tables = await getAllTables();
  await withStore(TABLES_STORE, 'readwrite', (store) => {
    tables.forEach((table) => store.put({ ...table, status: 'available', activeOrderIds: [] }));
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

export async function getMenuItemById(itemId) {
  return withStore(MENU_ITEMS_STORE, 'readonly', (store) => requestToPromise(store.get(itemId))).then(
    (r) => r || null
  );
}

export async function addMenuItem(itemData) {
  const now = new Date().toISOString();
  const item = {
    id: generateId(),
    name: itemData.name,
    category: itemData.category,
    price: itemData.price,
    description: itemData.description || '',
    icon: itemData.icon || '🍽️',
    // Uploaded images are stored as base64 data URLs on the item record itself,
    // not written to a /public/menu-images/ folder -- a browser app has no
    // filesystem/Electron process available to save real files to.
    imageDataUrl: itemData.imageDataUrl || null,
    createdAt: now,
    updatedAt: now,
  };
  await withStore(MENU_ITEMS_STORE, 'readwrite', (store) => store.put(item));
  return item;
}

export async function deleteMenuItem(itemId) {
  await withStore(MENU_ITEMS_STORE, 'readwrite', (store) => store.delete(itemId));
}

export async function isMenuItemUsedInOrders(itemName) {
  const orders = await getAllOrders();
  return orders.some((order) => (order.items || []).some((item) => item.name === itemName));
}

export async function updateMenuItemPrice(itemId, newPrice, changedBy) {
  const item = await getMenuItemById(itemId);
  if (!item) return null;
  const oldPrice = item.price;
  const updatedItem = { ...item, price: newPrice };
  await withStore(MENU_ITEMS_STORE, 'readwrite', (store) => store.put(updatedItem));

  const historyEntry = {
    id: generateId(),
    itemId,
    oldPrice,
    newPrice,
    changedAt: new Date().toISOString(),
    changedBy: changedBy || null,
  };
  await withStore(PRICE_HISTORY_STORE, 'readwrite', (store) => store.put(historyEntry));

  return updatedItem;
}

const EDITABLE_MENU_ITEM_FIELDS = ['name', 'category', 'imageDataUrl', 'description'];

export async function updateMenuItem(itemId, changes, changedBy) {
  const item = await getMenuItemById(itemId);
  if (!item) return null;

  const now = new Date().toISOString();
  const fieldChanges = {};
  EDITABLE_MENU_ITEM_FIELDS.forEach((field) => {
    if (changes[field] !== undefined) fieldChanges[field] = changes[field];
  });

  let updatedItem = { ...item, ...fieldChanges, updatedAt: now };
  await withStore(MENU_ITEMS_STORE, 'readwrite', (store) => store.put(updatedItem));

  // Editing name/category/image must never create a price_history entry -- only
  // route through updateMenuItemPrice (which always logs) when price actually changed.
  if (changes.price !== undefined && changes.price !== item.price) {
    updatedItem = await updateMenuItemPrice(itemId, changes.price, changedBy);
    updatedItem = { ...updatedItem, updatedAt: now };
    await withStore(MENU_ITEMS_STORE, 'readwrite', (store) => store.put(updatedItem));
  }

  return updatedItem;
}

export async function getPriceHistory(itemId) {
  const all = await getAll(PRICE_HISTORY_STORE);
  return (all || [])
    .filter((entry) => entry.itemId === itemId)
    .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
}

export async function getLastPriceUpdateTime() {
  const all = await getAll(PRICE_HISTORY_STORE);
  if (!all || all.length === 0) return null;
  return all.reduce((latest, entry) => (entry.changedAt > latest ? entry.changedAt : latest), all[0].changedAt);
}

function currentTaxRate() {
  const settings = getFromStorage('pos_settings', null);
  return settings?.taxRate ?? DEFAULT_TAX_RATE;
}

const EDITABLE_ORDER_FIELDS = [
  'customerName',
  'customerPhone',
  'serviceType',
  'tableNumber',
  'deliveryMethod',
  'deliveryCompany',
];

export async function editOrder(orderId, changes, editedByName) {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const now = new Date().toISOString();
  const editHistory = Array.isArray(order.editHistory) ? [...order.editHistory] : [];
  const updated = { ...order };

  const recordChange = (fieldChanged, oldValue, newValue) => {
    if (JSON.stringify(oldValue ?? null) === JSON.stringify(newValue ?? null)) return;
    editHistory.push({ fieldChanged, oldValue: oldValue ?? null, newValue: newValue ?? null, editedBy: editedByName || null, editedAt: now });
  };

  EDITABLE_ORDER_FIELDS.forEach((field) => {
    if (changes[field] !== undefined) {
      recordChange(field, order[field], changes[field]);
      updated[field] = changes[field];
    }
  });

  if (changes.items !== undefined) {
    recordChange('items', order.items, changes.items);
    updated.items = changes.items;
    const subtotal = changes.items.reduce((sum, item) => sum + (item.total ?? item.quantity * item.unitPrice), 0);
    const tax = calculateTax(subtotal, currentTaxRate());
    updated.subtotal = subtotal;
    updated.tax = tax;
    updated.total = calculateTotal(subtotal, tax, 0);
  }

  updated.editHistory = editHistory;
  updated.lastEditedAt = now;
  updated.lastEditedBy = editedByName || null;

  await withStore(ORDERS_STORE, 'readwrite', (store) => store.put(updated));
  return updated;
}

export async function getAllTables() {
  return getAll(TABLES_STORE).then((tables) => (tables || []).sort((a, b) => a.number - b.number));
}

export async function getTableByNumber(tableNumber) {
  return withStore(TABLES_STORE, 'readonly', (store) => requestToPromise(store.get(tableNumber))).then(
    (r) => r || null
  );
}

export async function seedTablesIfEmpty(count = 9) {
  const existing = await getAllTables();
  if (existing.length > 0) return existing;
  const seedArray = Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    status: 'available',
    activeOrderIds: [],
  }));
  await withStore(TABLES_STORE, 'readwrite', (store) => {
    seedArray.forEach((table) => store.put(table));
  });
  return getAllTables();
}

export async function removeOrderFromTable(tableNumber, orderId) {
  if (!tableNumber) return null;
  const table = await getTableByNumber(tableNumber);
  if (!table) return null;
  const activeOrderIds = (table.activeOrderIds || []).filter((id) => id !== orderId);
  const updated = { ...table, activeOrderIds, status: activeOrderIds.length > 0 ? 'occupied' : 'available' };
  await withStore(TABLES_STORE, 'readwrite', (store) => store.put(updated));
  return updated;
}

export async function markTableOccupied(tableNumber, orderId) {
  const table = await getTableByNumber(tableNumber);
  if (!table) return null;
  const activeOrderIds = table.activeOrderIds?.includes(orderId)
    ? table.activeOrderIds
    : [...(table.activeOrderIds || []), orderId];
  const updated = { ...table, status: 'occupied', activeOrderIds };
  await withStore(TABLES_STORE, 'readwrite', (store) => store.put(updated));
  return updated;
}

export async function markTableDoneEating(tableNumber) {
  const table = await getTableByNumber(tableNumber);
  if (!table) return { ok: false, reason: 'Table not found.' };
  const orders = await Promise.all((table.activeOrderIds || []).map((id) => getOrderById(id)));
  const allDone = orders.every((o) => o && (o.status === 'completed' || o.status === 'cancelled'));
  if (!allDone) {
    return { ok: false, reason: 'Not all orders for this table are completed yet.' };
  }
  const updated = { ...table, status: 'available', activeOrderIds: [] };
  await withStore(TABLES_STORE, 'readwrite', (store) => store.put(updated));
  return { ok: true, table: updated };
}
