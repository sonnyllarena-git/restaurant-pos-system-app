import React from 'react';

export default function LowStockAlerts({ items }) {
  const lowStock = items.filter((item) => item.stock <= item.min);

  if (lowStock.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded p-4 mb-4">
      <p className="text-sm font-semibold text-amber-900 mb-1">⚠ Low Stock Alert</p>
      <p className="text-sm text-amber-800">
        {lowStock.map((item) => item.name).join(', ')} {lowStock.length === 1 ? 'is' : 'are'} at or below minimum stock level.
      </p>
    </div>
  );
}
