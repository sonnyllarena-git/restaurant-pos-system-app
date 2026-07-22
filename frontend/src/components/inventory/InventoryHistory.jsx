import React from 'react';
import { formatDate, formatTime } from '../../utils/formatters';

export default function InventoryHistory({ transactions }) {
  const sorted = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="bg-white border border-slate-300 rounded mt-6">
      <div className="px-4 py-3 border-b border-slate-200">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {sorted.length === 0 && <p className="text-sm text-slate-500 px-4 py-6 text-center">No transactions yet.</p>}
        {sorted.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{tx.description}</p>
              <p className="text-xs text-slate-500">
                {formatDate(tx.timestamp)} {formatTime(tx.timestamp)}
              </p>
            </div>
            <span className={`text-sm font-semibold ${tx.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {tx.delta >= 0 ? '+' : ''}{tx.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
