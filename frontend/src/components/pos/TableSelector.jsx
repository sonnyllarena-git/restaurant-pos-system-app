import React, { useState, useEffect } from 'react';
import { useOrder } from '../../hooks/useOrder';
import Loader from '../common/Loader';
import { getAllTables, getOrderById } from '../../services/dbService';
import { TABLE_STATUSES } from '../../utils/constants';

const statusStyles = {
  [TABLE_STATUSES.AVAILABLE]: 'bg-green-100 border-green-400 text-green-900 hover:bg-green-200 cursor-pointer',
  [TABLE_STATUSES.OCCUPIED]: 'bg-red-100 border-red-400 text-red-900 cursor-not-allowed opacity-70',
};

export default function TableSelector() {
  const { setSelectedTable, setServiceType } = useOrder();
  const [tables, setTables] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const allTables = await getAllTables();
      const withOrderInfo = await Promise.all(
        allTables.map(async (table) => {
          if (table.status !== TABLE_STATUSES.OCCUPIED || !table.activeOrderIds?.length) {
            return { ...table, orderNumbers: [] };
          }
          const orders = await Promise.all(table.activeOrderIds.map((id) => getOrderById(id)));
          return { ...table, orderNumbers: orders.filter(Boolean).map((o) => o.orderNumber) };
        })
      );
      if (active) setTables(withOrderInfo);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSelectTable = (table) => {
    if (table.status !== TABLE_STATUSES.AVAILABLE) return;
    setSelectedTable(table.number);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Select a Table</h2>
      <p className="text-sm text-slate-600 mb-6">Choose an available table.</p>

      {tables === null ? (
        <Loader label="Loading tables..." />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {tables.map((table) => {
            const occupied = table.status === TABLE_STATUSES.OCCUPIED;
            return (
              <button
                key={table.number}
                onClick={() => handleSelectTable(table)}
                disabled={occupied}
                title={occupied ? `Occupied by order${table.orderNumbers.length > 1 ? 's' : ''} #${table.orderNumbers.join(', #')}` : ''}
                className={`h-24 w-24 border-2 rounded flex flex-col items-center justify-center font-semibold transition-colors ${statusStyles[table.status]}`}
              >
                <span className="text-lg">T{table.number}</span>
                <span className="text-xs capitalize">{table.status}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setServiceType(null)}
        className="text-sm text-slate-500 hover:text-slate-700 mt-8 underline"
      >
        ← Back
      </button>
    </div>
  );
}
