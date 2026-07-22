import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TopItemsChart({ data }) {
  return (
    <div className="bg-white border border-slate-300 rounded p-4">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-4">Top 5 Items</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <Tooltip contentStyle={{ borderRadius: 4, borderColor: '#cbd5e1' }} />
          <Bar dataKey="quantity" fill="#FF8C3C" radius={[0, 2, 2, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
