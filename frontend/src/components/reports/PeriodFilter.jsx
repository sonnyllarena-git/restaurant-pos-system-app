import React from 'react';
import { PERIODS } from '../../hooks/useReportFilters';

const PERIOD_BUTTONS = [
  { value: PERIODS.TODAY, label: 'Today' },
  { value: PERIODS.YESTERDAY, label: 'Yesterday' },
  { value: PERIODS.THIS_MONTH, label: 'This Month' },
];

export default function PeriodFilter({ period, setPeriod, selectedMonth, setSelectedMonth, monthOptions }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-6 pt-6">
      {PERIOD_BUTTONS.map((btn) => (
        <button
          key={btn.value}
          onClick={() => setPeriod(btn.value)}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            period === btn.value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {btn.label}
        </button>
      ))}
      <select
        value={selectedMonth}
        onChange={(e) => {
          setSelectedMonth(e.target.value);
          setPeriod(PERIODS.SELECT_MONTH);
        }}
        className={`px-4 py-2 rounded text-sm font-medium border transition-colors focus:outline-none ${
          period === PERIODS.SELECT_MONTH
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
        }`}
      >
        {monthOptions.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
