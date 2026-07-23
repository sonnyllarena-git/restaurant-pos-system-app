import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import TableCard from './TableCard';
import Loader from '../common/Loader';
import { UIContext } from '../../context/UIContext';
import { NotificationContext } from '../../context/NotificationContext';
import { getAllTables, getOrderById, markTableDoneEating } from '../../services/dbService';

const REFRESH_INTERVAL_MS = 5000;

export default function TableManagementTab() {
  const [tables, setTables] = useState(null);
  const { confirm } = useContext(UIContext);
  const { showSuccess, showError } = useContext(NotificationContext);
  const intervalRef = useRef(null);

  const loadTables = useCallback(async () => {
    const allTables = await getAllTables();
    const withOrderInfo = await Promise.all(
      allTables.map(async (table) => {
        if (table.status !== 'occupied' || !table.activeOrderIds?.length) {
          return { ...table, orderNumbers: [] };
        }
        const orders = await Promise.all(table.activeOrderIds.map((id) => getOrderById(id)));
        return { ...table, orderNumbers: orders.filter(Boolean).map((o) => o.orderNumber) };
      })
    );
    setTables(withOrderInfo);
  }, []);

  useEffect(() => {
    loadTables();
    intervalRef.current = setInterval(loadTables, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [loadTables]);

  const handleDoneEating = (table) => {
    confirm({
      title: 'Mark Table Done?',
      message: `All orders for Table ${table.number} must be completed before it can be freed. Continue?`,
      confirmLabel: 'Done Eating',
      onConfirm: async () => {
        const result = await markTableDoneEating(table.number);
        if (!result.ok) {
          showError(result.reason || 'Not all orders for this table are completed yet.');
          return;
        }
        showSuccess(`Table ${table.number} is now available`);
        await loadTables();
      },
    });
  };

  if (tables === null) return <Loader label="Loading tables..." />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {tables.map((table) => (
        <TableCard key={table.number} table={table} onDoneEating={handleDoneEating} />
      ))}
    </div>
  );
}
