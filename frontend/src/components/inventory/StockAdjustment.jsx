import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

export default function StockAdjustment({ item, onConfirm, onClose }) {
  const [direction, setDirection] = useState('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const qty = parseInt(amount, 10);
    if (!qty || qty <= 0) {
      setError('Enter a valid quantity');
      return;
    }
    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }
    const delta = direction === 'add' ? qty : -qty;
    onConfirm({ itemId: item.id, delta, reason });
  };

  return (
    <Modal title={`Adjust Stock: ${item.name}`} onClose={onClose} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Current stock: {item.stock} {item.unit}</p>
        <div className="flex gap-3">
          <Button
            variant={direction === 'add' ? 'primary' : 'secondary'}
            className="flex-1"
            onClick={() => setDirection('add')}
          >
            + ADD
          </Button>
          <Button
            variant={direction === 'remove' ? 'danger' : 'secondary'}
            className="flex-1"
            onClick={() => setDirection('remove')}
          >
            − REMOVE
          </Button>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
          <Input type="text" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
          <Input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. delivery received, spoilage..." />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            SAVE
          </Button>
        </div>
      </div>
    </Modal>
  );
}
