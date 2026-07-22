import React, { useContext, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ReceiptPreview from './ReceiptPreview';
import { printReceipt } from '../../services/printerService';
import { NotificationContext } from '../../context/NotificationContext';

export default function OrderSuccess({ order, onDone }) {
  const { showInfo } = useContext(NotificationContext);
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    await printReceipt(order);
    setPrinting(false);
    showInfo('Receipt sent to printer');
  };

  return (
    <Modal title="Payment Successful" onClose={onDone} size="sm">
      <div className="text-center mb-4">
        <div className="text-5xl text-green-500 mb-2">✓</div>
        <p className="text-base text-slate-900">Order placed successfully.</p>
      </div>
      <ReceiptPreview order={order} />
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" className="flex-1" loading={printing} onClick={handlePrint}>
          PRINT RECEIPT
        </Button>
        <Button className="flex-1" onClick={onDone}>
          DONE
        </Button>
      </div>
    </Modal>
  );
}
