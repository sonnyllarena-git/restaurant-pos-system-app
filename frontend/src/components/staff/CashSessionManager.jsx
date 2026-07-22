import React, { useState, useContext } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { NotificationContext } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

export default function CashSessionManager({ session, onOpenSession, onCloseSession, onClose }) {
  const { showSuccess } = useContext(NotificationContext);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const isOpen = Boolean(session?.open);

  const handleSubmit = () => {
    const value = parseFloat(amount);
    if (!value || value < 0) {
      setError('Enter a valid amount');
      return;
    }
    if (isOpen) {
      onCloseSession(value);
      showSuccess('Cash drawer closed');
    } else {
      onOpenSession(value);
      showSuccess('Cash drawer opened');
    }
    onClose();
  };

  return (
    <Modal title={isOpen ? 'Close Drawer' : 'Open Drawer'} onClose={onClose} size="sm">
      <div className="space-y-4">
        {isOpen && (
          <p className="text-sm text-slate-600">
            Opening balance: <span className="font-medium text-slate-900">{formatCurrency(session.openingBalance)}</span>
          </p>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {isOpen ? 'Closing Balance (Counted Cash)' : 'Opening Balance'}
          </label>
          <Input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            {isOpen ? 'CLOSE DRAWER' : 'OPEN DRAWER'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
