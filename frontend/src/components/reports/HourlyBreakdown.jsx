import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function HourlyBreakdown({ data }) {
  return (
    <div className="bg-white border border-slate-300 rounded mt-6">
      <div className="px-4 py-3 border-b border-slate-200">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Hourly Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left text-slate-600">
              <th className="px-4 py-3 font-medium">Hour</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.hour} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-900">{row.hour}</td>
                <td className="px-4 py-3 text-slate-600">{row.orders}</td>
                <td className="px-4 py-3 text-slate-900 font-medium">{formatCurrency(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
