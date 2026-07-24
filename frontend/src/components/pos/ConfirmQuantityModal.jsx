import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function ConfirmQuantityModal({ itemName, quantity, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm Large Quantity" onClose={onCancel} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          You're about to add <span className="font-semibold">{quantity}</span> × {itemName}. Is this correct?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            CANCEL
          </Button>
          <Button className="flex-1" onClick={onConfirm}>
            CONFIRM
          </Button>
        </div>
      </div>
    </Modal>
  );
}
