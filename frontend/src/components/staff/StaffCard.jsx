import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

const roleVariant = {
  admin: 'info',
  cashier: 'success',
  kitchen: 'warning',
  viewer: 'neutral',
};

export default function StaffCard({ staff }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-base font-semibold text-slate-900">{staff.fullName}</h4>
        <span
          className={`h-2.5 w-2.5 rounded-full ${staff.activeSession ? 'bg-green-500' : 'bg-slate-300'}`}
          title={staff.activeSession ? 'Active session' : 'Off shift'}
        />
      </div>
      <Badge variant={roleVariant[staff.role] || 'neutral'}>{staff.role}</Badge>
      <p className="text-xs text-slate-500 mt-2">
        {staff.activeSession ? `On shift since ${staff.shiftStart}` : 'Not clocked in'}
      </p>
    </Card>
  );
}
