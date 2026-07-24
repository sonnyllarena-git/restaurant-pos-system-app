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
  const { selectedTable, setSelectedTable } = useOrder();
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
    <div className="flex flex-col items-center">
      <p className="text-sm text-slate-600 mb-6">Choose an available table.</p>

      {tables === null ? (
        <Loader label="Loading tables..." />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {tables.map((table) => {
            const occupied = table.status === TABLE_STATUSES.OCCUPIED;
            const isSelected = table.number === selectedTable;
            return (
              <button
                key={table.number}
                onClick={() => handleSelectTable(table)}
                disabled={occupied}
                title={occupied ? `Occupied by order${table.orderNumbers.length > 1 ? 's' : ''} #${table.orderNumbers.join(', #')}` : ''}
                className={`relative h-24 w-24 border-2 rounded flex flex-col items-center justify-center font-semibold transition-colors ${statusStyles[table.status]} ${
                  isSelected ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500' : ''
                }`}
              >
                <span className="text-lg">T{table.number}</span>
                <span className="text-xs capitalize">{table.status}</span>
                {isSelected && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
