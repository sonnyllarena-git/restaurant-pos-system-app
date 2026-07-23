import { useState, useEffect, useMemo } from 'react';
import { getOrderHistory } from '../services/dbService';

export const PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_MONTH: 'this_month',
  SELECT_MONTH: 'select_month',
};

// Boundaries are built from local Y/M/D components, not date-only string parsing
// or toISOString() round-tripping, which reinterpret as UTC and can shift the
// calendar day in negative-UTC-offset zones (see KitchenDisplay/AdvanceOrderModal).
function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function getMonthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { value, label };
  });
}

export function useReportFilters() {
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const [period, setPeriod] = useState(PERIODS.TODAY);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const dateRange = useMemo(() => {
    const now = new Date();
    if (period === PERIODS.YESTERDAY) {
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      return { start: startOfLocalDay(yesterday), end: endOfLocalDay(yesterday) };
    }
    if (period === PERIODS.THIS_MONTH) {
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
        end: endOfLocalDay(now),
      };
    }
    if (period === PERIODS.SELECT_MONTH) {
      const [year, month] = selectedMonth.split('-').map(Number);
      return {
        start: new Date(year, month - 1, 1, 0, 0, 0, 0),
        end: new Date(year, month, 0, 23, 59, 59, 999),
      };
    }
    return { start: startOfLocalDay(now), end: endOfLocalDay(now) };
  }, [period, selectedMonth]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getOrderHistory({ dateFrom: dateRange.start.toISOString(), dateTo: dateRange.end.toISOString() }).then(
      (orders) => {
        if (!active) return;
        setFilteredOrders(orders);
        setLoading(false);
      }
    );
    return () => {
      active = false;
    };
  }, [dateRange]);

  return { period, setPeriod, selectedMonth, setSelectedMonth, monthOptions, dateRange, filteredOrders, loading };
}
