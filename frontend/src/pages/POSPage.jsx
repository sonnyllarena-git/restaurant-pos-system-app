import React from 'react';
import { Outlet } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';

export default function POSPage() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Point of Sale" />
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
