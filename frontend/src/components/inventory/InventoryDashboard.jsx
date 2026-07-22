import React, { useState, useContext } from 'react';
import LowStockAlerts from './LowStockAlerts';
import InventoryTable from './InventoryTable';
import InventoryHistory from './InventoryHistory';
import StockAdjustment from './StockAdjustment';
import ReorderForm from './ReorderForm';
import { NotificationContext } from '../../context/NotificationContext';
import { generateId } from '../../utils/helpers';

const INITIAL_ITEMS = [
  { id: 'inv1', name: 'Milkfish (Bangus)', stock: 12, min: 10, unit: 'kg' },
  { id: 'inv2', name: 'Pork Belly', stock: 8, min: 15, unit: 'kg' },
  { id: 'inv3', name: 'Ribeye Steak', stock: 6, min: 8, unit: 'kg' },
  { id: 'inv4', name: 'Chicken Thighs', stock: 25, min: 15, unit: 'kg' },
  { id: 'inv5', name: 'Jasmine Rice', stock: 40, min: 20, unit: 'kg' },
  { id: 'inv6', name: 'Calamansi', stock: 3, min: 5, unit: 'kg' },
  { id: 'inv7', name: 'Cooking Oil', stock: 18, min: 10, unit: 'L' },
  { id: 'inv8', name: 'Soft Drinks', stock: 0, min: 24, unit: 'bottles' },
];

export default function InventoryDashboard() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [transactions, setTransactions] = useState([]);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [reorderingItem, setReorderingItem] = useState(null);
  const { showSuccess } = useContext(NotificationContext);

  const handleAdjustConfirm = ({ itemId, delta, reason }) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, stock: Math.max(0, item.stock + delta) } : item)));
    const item = items.find((i) => i.id === itemId);
    setTransactions((prev) => [
      ...prev,
      { id: generateId(), description: `${item.name}: ${reason}`, delta, timestamp: new Date().toISOString() },
    ]);
    setAdjustingItem(null);
    showSuccess('Stock adjusted successfully');
  };

  const handleReorderConfirm = ({ itemId, supplier, quantity }) => {
    const item = items.find((i) => i.id === itemId);
    setTransactions((prev) => [
      ...prev,
      {
        id: generateId(),
        description: `Reorder placed with ${supplier} for ${item.name} (${quantity} ${item.unit})`,
        delta: 0,
        timestamp: new Date().toISOString(),
      },
    ]);
    setReorderingItem(null);
    showSuccess('Reorder submitted');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Inventory</h2>
      <p className="text-sm text-slate-600 mb-4">Track stock levels and manage reorders.</p>
      <LowStockAlerts items={items} />
      <InventoryTable items={items} onAdjust={setAdjustingItem} onReorder={setReorderingItem} />
      <InventoryHistory transactions={transactions} />
      {adjustingItem && (
        <StockAdjustment item={adjustingItem} onConfirm={handleAdjustConfirm} onClose={() => setAdjustingItem(null)} />
      )}
      {reorderingItem && (
        <ReorderForm item={reorderingItem} onConfirm={handleReorderConfirm} onClose={() => setReorderingItem(null)} />
      )}
    </div>
  );
}
