import React, { useState } from 'react';
import StaffCard from './StaffCard';
import CashSessionManager from './CashSessionManager';
import CashReconciliation from './CashReconciliation';
import Button from '../common/Button';

const MOCK_STAFF = [
  { id: 's1', fullName: 'Maria Santos', role: 'admin', activeSession: true, shiftStart: '8:00 AM' },
  { id: 's2', fullName: 'Jose Reyes', role: 'cashier', activeSession: true, shiftStart: '10:00 AM' },
  { id: 's3', fullName: 'Ana Cruz', role: 'kitchen', activeSession: false, shiftStart: null },
  { id: 's4', fullName: 'Pedro Ramos', role: 'viewer', activeSession: false, shiftStart: null },
];

export default function StaffDashboard() {
  const [session, setSession] = useState({ open: false, openingBalance: 0, closingBalance: null, salesTotal: 0 });
  const [showSessionModal, setShowSessionModal] = useState(false);

  const handleOpenSession = (openingBalance) => {
    setSession({ open: true, openingBalance, closingBalance: null, salesTotal: 4850 });
  };

  const handleCloseSession = (closingBalance) => {
    setSession((prev) => ({ ...prev, open: false, closingBalance }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Staff Management</h2>
          <p className="text-sm text-slate-600">
            Cash drawer: {session.open ? 'Open' : 'Closed'}
          </p>
        </div>
        <Button onClick={() => setShowSessionModal(true)}>
          {session.open ? 'CLOSE DRAWER' : 'OPEN DRAWER'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {MOCK_STAFF.map((staff) => (
          <StaffCard key={staff.id} staff={staff} />
        ))}
      </div>

      <CashReconciliation session={session} />

      {showSessionModal && (
        <CashSessionManager
          session={session}
          onOpenSession={handleOpenSession}
          onCloseSession={handleCloseSession}
          onClose={() => setShowSessionModal(false)}
        />
      )}
    </div>
  );
}
