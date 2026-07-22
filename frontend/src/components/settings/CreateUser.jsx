import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { ROLES } from '../../utils/constants';

export default function CreateUser({ onConfirm, onClose }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState(ROLES[1]);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!fullName.trim() || !username.trim()) {
      setError('Full name and username are required');
      return;
    }
    onConfirm({ fullName, username, role });
  };

  return (
    <Modal title="Add Staff" onClose={onClose} size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Dela Cruz" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jdelacruz" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            CREATE
          </Button>
        </div>
      </div>
    </Modal>
  );
}
