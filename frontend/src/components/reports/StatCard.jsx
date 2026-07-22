import React from 'react';

export default function StatCard({ title, value, icon = null, trend = null, onClick = null }) {
  return (
    <div
      className={`bg-white border border-slate-300 p-6 rounded ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.up ? 'text-green-600' : 'text-red-600'}`}>
              {trend.up ? '↑' : '↓'} {trend.percent}%
            </p>
          )}
        </div>
        {icon && <div className="text-3xl opacity-50">{icon}</div>}
      </div>
    </div>
  );
}
