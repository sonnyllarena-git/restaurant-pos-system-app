import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

export default function RevenueChart({ data }) {
  return (
    <div className="bg-white border border-slate-300 rounded p-4">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-4">Revenue by Hour</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="hourLabel" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            tickFormatter={(v) => `₱${v}`}
          />
          <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: 4, borderColor: '#cbd5e1' }} />
          <Line type="monotone" dataKey="revenue" stroke="#FF8C3C" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
