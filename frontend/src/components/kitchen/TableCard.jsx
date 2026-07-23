import React from 'react';
import Button from '../common/Button';

export default function TableCard({ table, onDoneEating }) {
  const occupied = table.status === 'occupied';

  return (
    <div
      className={`border-2 rounded p-4 flex flex-col gap-2 ${
        occupied ? 'bg-orange-50 border-orange-400' : 'bg-green-50 border-green-400'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Table {table.number}</h3>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded border ${
            occupied ? 'bg-orange-100 text-orange-900 border-orange-300' : 'bg-green-100 text-green-900 border-green-300'
          }`}
        >
          {occupied ? 'OCCUPIED' : 'AVAILABLE'}
        </span>
      </div>

      {occupied ? (
        <>
          <p className="text-sm text-slate-700">
            {table.orderNumbers?.length || 0} active order{(table.orderNumbers?.length || 0) === 1 ? '' : 's'}
          </p>
          {table.orderNumbers?.length > 0 && (
            <p className="text-sm text-slate-600">Order #{table.orderNumbers.join(', #')}</p>
          )}
          <Button className="w-full mt-2" onClick={() => onDoneEating(table)}>
            DONE EATING
          </Button>
        </>
      ) : (
        <p className="text-sm text-slate-500">—</p>
      )}
    </div>
  );
}
