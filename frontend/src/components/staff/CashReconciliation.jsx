import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function CashReconciliation({ session }) {
  if (!session?.closingBalance && session?.closingBalance !== 0) return null;

  const expected = session.openingBalance + (session.salesTotal || 0);
  const discrepancy = session.closingBalance - expected;

  return (
    <div className="bg-white border border-slate-300 rounded p-4 mt-4">
      <h4 className="text-sm font-semibold text-slate-900 mb-3">Cash Reconciliation</h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Opening Balance</span>
          <span>{formatCurrency(session.openingBalance)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Sales (Cash)</span>
          <span>{formatCurrency(session.salesTotal || 0)}</span>
        </div>
        <div className="flex justify-between text-slate-900 font-medium border-t border-slate-100 pt-1">
          <span>Expected Cash</span>
          <span>{formatCurrency(expected)}</span>
        </div>
        <div className="flex justify-between text-slate-900 font-medium">
          <span>Counted Cash</span>
          <span>{formatCurrency(session.closingBalance)}</span>
        </div>
        <div className={`flex justify-between font-bold ${discrepancy === 0 ? 'text-slate-900' : discrepancy > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <span>Discrepancy</span>
          <span>{discrepancy >= 0 ? '+' : ''}{formatCurrency(discrepancy)}</span>
        </div>
      </div>
    </div>
  );
}
