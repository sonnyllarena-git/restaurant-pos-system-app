import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ReceiptPreview from './ReceiptPreview';
import { printReceipt } from '../../services/printerService';
import { NotificationContext } from '../../context/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';
import { ORDER_TYPES } from '../../utils/constants';

export default function OrderSuccess({ order, orderType, onDone }) {
  const { showInfo } = useContext(NotificationContext);
  const { canAccess } = useAuth();
  const navigate = useNavigate();
  const [printing, setPrinting] = useState(false);

  const isRegular = orderType !== ORDER_TYPES.ADVANCE;
  const canViewKitchen = canAccess(['admin', 'kitchen']);

  const handlePrint = async () => {
    setPrinting(true);
    await printReceipt(order);
    setPrinting(false);
    showInfo('Receipt sent to printer');
  };

  const handleGoHome = () => {
    onDone();
    navigate('/home');
  };

  const handleGoToKitchen = () => {
    onDone();
    navigate('/kitchen');
  };

  return (
    <Modal title={isRegular ? 'Payment Successful' : 'Order Submitted'} onClose={onDone} size="sm">
      <div className="text-center mb-4">
        <div className="text-5xl text-green-500 mb-2">✓</div>
        <p className="text-base text-slate-900">
          {isRegular
            ? 'Order placed successfully.'
            : 'Advance order saved. Payment will be collected at pickup/serving time.'}
        </p>
      </div>

      {isRegular ? (
        <ReceiptPreview order={order} />
      ) : (
        <div className="border border-slate-300 rounded p-4 bg-slate-50 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Order</span>
            <span className="font-medium text-slate-900">{order.orderLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Items</span>
            <span className="font-medium text-slate-900">{order.items.length}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-1 border-t border-slate-200">
            <span>Total</span>
            <span className="text-orange-500">{formatCurrency(order.total)}</span>
          </div>
        </div>
      )}

      <div className="space-y-2 mt-6">
        {isRegular && (
          <Button className="w-full" variant="secondary" loading={printing} onClick={handlePrint}>
            PRINT RECEIPT
          </Button>
        )}
        {canViewKitchen && (
          <Button className="w-full" variant="secondary" onClick={handleGoToKitchen}>
            GO TO KITCHEN
          </Button>
        )}
        <Button className="w-full" onClick={handleGoHome}>
          HOME
        </Button>
      </div>
    </Modal>
  );
}
