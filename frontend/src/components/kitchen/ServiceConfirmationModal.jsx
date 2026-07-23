import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

function alternateServiceType(order) {
  const pickupOrTakeout = order.orderType === 'advance' ? 'pickup' : 'takeout';
  if (order.serviceType === 'dine_in') return pickupOrTakeout;
  if (order.serviceType === pickupOrTakeout) return 'dine_in';
  return null;
}

function label(serviceType) {
  return (serviceType || '').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ServiceConfirmationModal({ order, onClose, onContinue }) {
  const alternate = alternateServiceType(order);
  const [selected, setSelected] = useState(order.serviceType);

  return (
    <Modal title="Confirm Fulfillment" onClose={onClose} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Confirm how this order is being completed{alternate ? ', or switch it below.' : '.'}
        </p>

        <div className="space-y-2">
          <label className="flex items-center gap-3 border border-slate-300 rounded px-4 py-3 cursor-pointer has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
            <input
              type="radio"
              name="serviceType"
              checked={selected === order.serviceType}
              onChange={() => setSelected(order.serviceType)}
            />
            <span className="font-medium text-slate-900">{label(order.serviceType)}</span>
          </label>

          {alternate && (
            <label className="flex items-center gap-3 border border-slate-300 rounded px-4 py-3 cursor-pointer has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
              <input
                type="radio"
                name="serviceType"
                checked={selected === alternate}
                onChange={() => setSelected(alternate)}
              />
              <span className="font-medium text-slate-900">{label(alternate)}</span>
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button className="flex-1" onClick={() => onContinue(selected)}>
            CONTINUE
          </Button>
        </div>
      </div>
    </Modal>
  );
}
