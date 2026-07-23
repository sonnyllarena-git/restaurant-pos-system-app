import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OrdersByHourChart({ data }) {
  return (
    <div className="bg-white border border-slate-300 rounded p-4">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-4">Orders by Hour</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="hourLabel" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 4, borderColor: '#cbd5e1' }} />
          <Bar dataKey="orders" fill="#4CAF50" radius={[2, 2, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
