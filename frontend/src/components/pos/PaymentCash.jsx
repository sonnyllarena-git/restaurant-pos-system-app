import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';

export default function PaymentCash({ amountDue, onConfirm, onCancel, loading = false }) {
  const [cashReceived, setCashReceived] = useState('');
  const [change, setChange] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const amount = parseFloat(cashReceived) || 0;
    setChange(Math.max(0, amount - amountDue));
  }, [cashReceived, amountDue]);

  const handleCashInput = (e) => {
    let value = e.target.value.replace(/[^0-9.]/g, '');
    if ((value.match(/\./g) || []).length > 1) {
      value = value.replace(/\.(?=.*\.)/, '');
    }
    setCashReceived(value);
  };

  const isValidPayment = parseFloat(cashReceived) >= amountDue && amountDue > 0;

  const handleConfirm = () => {
    const amount = parseFloat(cashReceived);
    if (!amount) {
      setError('Please enter cash amount');
      return;
    }
    if (amount < amountDue) {
      setError('Insufficient cash');
      return;
    }
    setError('');
    onConfirm({ amountReceived: amount, change, paymentMethod: 'cash' });
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Amount Due</label>
        <div className="text-3xl font-bold text-orange-500">₱{amountDue.toFixed(2)}</div>
      </div>
      <div>
        <label htmlFor="cashInput" className="block text-sm font-medium text-slate-700 mb-2">
          Cash Received
        </label>
        <Input
          id="cashInput"
          type="text"
          value={cashReceived}
          onChange={handleCashInput}
          placeholder="0.00"
          autoFocus
          className="text-lg text-center"
          error={error}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Change</label>
        <div className={`text-2xl font-bold ${change > 0 ? 'text-green-500' : 'text-slate-400'}`}>
          ₱{change.toFixed(2)}
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>
          CANCEL
        </Button>
        <Button className="flex-1" disabled={!isValidPayment || loading} loading={loading} onClick={handleConfirm}>
          CONFIRM PAYMENT
        </Button>
      </div>
    </div>
  );
}
