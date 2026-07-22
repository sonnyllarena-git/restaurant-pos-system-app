import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function AlertModal({ title = 'Notice', message, onClose }) {
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <p className="text-base text-slate-900 mb-6">{message}</p>
      <Button className="w-full" onClick={onClose}>
        OK
      </Button>
    </Modal>
  );
}
