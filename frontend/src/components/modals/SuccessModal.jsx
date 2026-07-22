import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function SuccessModal({ title = 'Success', message, onClose, children }) {
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <div className="text-center mb-4">
        <div className="text-5xl text-green-500 mb-2">✓</div>
        {message && <p className="text-base text-slate-900">{message}</p>}
      </div>
      {children}
      <Button className="w-full mt-4" onClick={onClose}>
        DONE
      </Button>
    </Modal>
  );
}
