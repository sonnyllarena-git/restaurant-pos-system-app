import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

export default function DuplicateWarningModal({ existingOrder, onCreateNew, onClose }) {
  const navigate = useNavigate();

  const handleViewExisting = () => {
    onClose();
    navigate('/order-history');
  };

  return (
    <Modal title="Possible Duplicate Order" onClose={onClose} size="sm">
      <p className="text-sm text-slate-700 mb-4">
        This customer already has a pending order on file:
      </p>
      <div className="border border-slate-300 rounded p-4 space-y-1 mb-6 bg-slate-50">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Phone</span>
          <span className="font-medium text-slate-900">{existingOrder.customerPhone}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Items</span>
          <span className="font-medium text-slate-900">{existingOrder.items?.length || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Total</span>
          <span className="font-medium text-slate-900">{formatCurrency(existingOrder.total)}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={handleViewExisting}>
          View Existing
        </Button>
        <Button className="flex-1" onClick={onCreateNew}>
          Create New Order
        </Button>
      </div>
    </Modal>
  );
}
