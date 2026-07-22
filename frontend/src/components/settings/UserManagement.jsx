import React, { useState, useContext } from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import CreateUser from './CreateUser';
import { NotificationContext } from '../../context/NotificationContext';
import { generateId } from '../../utils/helpers';

const INITIAL_STAFF = [
  { id: 'u1', fullName: 'Maria Santos', username: 'msantos', role: 'admin' },
  { id: 'u2', fullName: 'Jose Reyes', username: 'jreyes', role: 'cashier' },
  { id: 'u3', fullName: 'Ana Cruz', username: 'acruz', role: 'kitchen' },
  { id: 'u4', fullName: 'Pedro Ramos', username: 'pramos', role: 'viewer' },
];

const roleVariant = {
  admin: 'info',
  cashier: 'success',
  kitchen: 'warning',
  viewer: 'neutral',
};

export default function UserManagement() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [showCreate, setShowCreate] = useState(false);
  const { showSuccess } = useContext(NotificationContext);

  const handleCreate = (newUser) => {
    setStaff((prev) => [...prev, { id: generateId(), ...newUser }]);
    setShowCreate(false);
    showSuccess(`${newUser.fullName} added as ${newUser.role}`);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">Users</h3>
        <Button onClick={() => setShowCreate(true)}>ADD STAFF</Button>
      </div>
      <div className="bg-white border border-slate-300 rounded divide-y divide-slate-100">
        {staff.map((member) => (
          <div key={member.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{member.fullName}</p>
              <p className="text-xs text-slate-500">@{member.username}</p>
            </div>
            <Badge variant={roleVariant[member.role] || 'neutral'}>{member.role}</Badge>
          </div>
        ))}
      </div>
      {showCreate && <CreateUser onConfirm={handleCreate} onClose={() => setShowCreate(false)} />}
    </div>
  );
}
