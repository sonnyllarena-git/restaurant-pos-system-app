import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeliveryCompanyChart({ data }) {
  return (
    <div className="bg-white border border-slate-300 rounded p-4">
      <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-4">Orders by Delivery Company</h3>
      {data.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-16">No company deliveries in this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid stroke="#e2e8f0" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <Tooltip contentStyle={{ borderRadius: 4, borderColor: '#cbd5e1' }} />
            <Bar dataKey="count" fill="#FF8C3C" radius={[0, 2, 2, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
