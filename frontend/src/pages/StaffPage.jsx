import React from 'react';
import StaffDashboard from '../components/staff/StaffDashboard';
import PageHeader from '../components/common/PageHeader';

export default function StaffPage() {
  return (
    <div>
      <PageHeader title="Staff Management" />
      <StaffDashboard />
    </div>
  );
}
