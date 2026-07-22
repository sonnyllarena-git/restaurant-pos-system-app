import React, { useState } from 'react';

export default function MonthlyReport() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Monthly Report</h2>
      <p className="text-sm text-slate-600 mb-4">Summary for {month}.</p>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 mb-6"
      />
      <div className="bg-white border border-slate-300 rounded p-6">
        <p className="text-sm text-slate-500">
          Detailed monthly aggregates and comparisons will be available once the backend
          integration phase begins.
        </p>
      </div>
    </div>
  );
}
