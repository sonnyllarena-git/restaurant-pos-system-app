import React, { useState, useMemo } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';

function getStatus(item) {
  if (item.stock <= 0) return { label: '🔴 Out', variant: 'error' };
  if (item.stock <= item.min) return { label: '⚠ Low', variant: 'warning' };
  return { label: '✓ OK', variant: 'success' };
}

export default function InventoryTable({ items, onAdjust, onReorder }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  return (
    <div className="bg-white border border-slate-300 rounded">
      <div className="p-4 border-b border-slate-200">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory items..."
          className="w-full max-w-sm px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-slate-600">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Min</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const status = getStatus(item);
              return (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-900 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-slate-900">{item.stock}</td>
                  <td className="px-4 py-3 text-slate-600">{item.min}</td>
                  <td className="px-4 py-3 text-slate-600">{item.unit}</td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => onAdjust(item)}>
                        Adjust
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onReorder(item)}>
                        Reorder
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
