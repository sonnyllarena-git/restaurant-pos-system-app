import React, { useState } from 'react';
import { useOrder } from '../../hooks/useOrder';
import Button from '../common/Button';
import { TABLE_STATUSES, SERVICE_TYPES } from '../../utils/constants';

const MOCK_TABLES = [
  { number: 1, status: TABLE_STATUSES.AVAILABLE },
  { number: 2, status: TABLE_STATUSES.OCCUPIED },
  { number: 3, status: TABLE_STATUSES.AVAILABLE },
  { number: 4, status: TABLE_STATUSES.RESERVED },
  { number: 5, status: TABLE_STATUSES.AVAILABLE },
  { number: 6, status: TABLE_STATUSES.OCCUPIED },
  { number: 7, status: TABLE_STATUSES.AVAILABLE },
  { number: 8, status: TABLE_STATUSES.AVAILABLE },
  { number: 9, status: TABLE_STATUSES.RESERVED },
];

const statusStyles = {
  [TABLE_STATUSES.AVAILABLE]: 'bg-green-100 border-green-400 text-green-900 hover:bg-green-200 cursor-pointer',
  [TABLE_STATUSES.OCCUPIED]: 'bg-red-100 border-red-400 text-red-900 cursor-not-allowed opacity-70',
  [TABLE_STATUSES.RESERVED]: 'bg-amber-100 border-amber-400 text-amber-900 cursor-not-allowed opacity-70',
};

export default function TableSelector() {
  const { setSelectedTable, setServiceType } = useOrder();
  const [tables] = useState(MOCK_TABLES);

  const handleSelectTable = (table) => {
    if (table.status !== TABLE_STATUSES.AVAILABLE) return;
    setServiceType(SERVICE_TYPES.DINE_IN);
    setSelectedTable(table.number);
  };

  const handleQuickStart = (type) => {
    setServiceType(type);
    setSelectedTable(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Select a Table</h2>
      <p className="text-sm text-slate-600 mb-6">Choose an available table or start a takeout / delivery order.</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {tables.map((table) => (
          <button
            key={table.number}
            onClick={() => handleSelectTable(table)}
            className={`h-24 w-24 border-2 rounded flex flex-col items-center justify-center font-semibold transition-colors ${statusStyles[table.status]}`}
          >
            <span className="text-lg">T{table.number}</span>
            <span className="text-xs capitalize">{table.status}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <Button variant="secondary" size="lg" onClick={() => handleQuickStart(SERVICE_TYPES.TAKEOUT)}>
          TAKEOUT
        </Button>
        <Button variant="secondary" size="lg" onClick={() => handleQuickStart(SERVICE_TYPES.DELIVERY)}>
          DELIVERY
        </Button>
      </div>
    </div>
  );
}
