import React from 'react';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';

export default function PriceHistoryModal({ itemName, history, onClose }) {
  return (
    <Modal title={`Price History — ${itemName}`} onClose={onClose} size="sm">
      {history.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">No price changes recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between border border-slate-200 rounded px-3 py-2">
              <span className="text-sm text-slate-600">
                {formatCurrency(entry.oldPrice)} → <span className="font-semibold text-slate-900">{formatCurrency(entry.newPrice)}</span>
              </span>
              <span className="text-xs text-slate-500">{new Date(entry.changedAt).toLocaleString('en-PH')}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
