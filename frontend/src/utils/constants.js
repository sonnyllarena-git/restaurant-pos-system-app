export const DEFAULT_TAX_RATE = 0.08;

export const CURRENCY = 'PHP';

export const ROLES = ['admin', 'cashier', 'kitchen', 'viewer'];

export const SERVICE_TYPES = {
  DINE_IN: 'dine_in',
  TAKEOUT: 'takeout',
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
};

export const ORDER_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const ORDER_TYPES = {
  REGULAR: 'regular',
  ADVANCE: 'advance',
};

export const ORDER_SOURCES = {
  PHONE: 'phone',
  SMS: 'sms',
  FACEBOOK: 'facebook',
  WHATSAPP: 'whatsapp',
  WALK_IN: 'walk_in',
};

export const TABLE_STATUSES = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
};

export const KDS_URGENT_MINUTES = 15;
