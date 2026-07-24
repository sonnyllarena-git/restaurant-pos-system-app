import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

export default function ItemCustomization({ item, initialQuantity = 1, onConfirm, onClose }) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selections, setSelections] = useState({});
  const [notes, setNotes] = useState('');

  const handleSingleSelect = (groupId, option) => {
    setSelections((prev) => ({ ...prev, [groupId]: [option] }));
  };

  const handleMultiToggle = (groupId, option) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      const exists = current.some((o) => o.id === option.id);
      const next = exists ? current.filter((o) => o.id !== option.id) : [...current, option];
      return { ...prev, [groupId]: next };
    });
  };

  const requiredGroups = (item.modifierGroups || []).filter((g) => g.type === 'single_select' && g.required);
  const missingRequired = requiredGroups.some((g) => !selections[g.id]?.length);

  const selectedModifiers = Object.values(selections).flat();
  const modifierTotal = selectedModifiers.reduce((sum, m) => sum + (m.priceDelta || 0), 0);
  const lineTotal = (item.price + modifierTotal) * quantity;

  const handleConfirm = () => {
    if (missingRequired) return;
    onConfirm({ quantity, selectedModifiers, notes });
  };

  return (
    <Modal title={item.name} onClose={onClose} size="md">
      <div className="space-y-6">
        <p className="text-sm text-slate-600">{item.description}</p>

        {(item.modifierGroups || []).map((group) => (
          <div key={group.id}>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">
              {group.name} {group.required && <span className="text-red-500">*</span>}
            </h4>
            <div className="space-y-2">
              {group.options.map((option) => {
                const isSelected = (selections[group.id] || []).some((o) => o.id === option.id);
                return (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between px-3 py-2 border rounded cursor-pointer ${
                      isSelected ? 'border-orange-500 bg-orange-50' : 'border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm text-slate-900">
                      <input
                        type={group.type === 'single_select' ? 'radio' : 'checkbox'}
                        name={group.id}
                        checked={isSelected}
                        onChange={() =>
                          group.type === 'single_select'
                            ? handleSingleSelect(group.id, option)
                            : handleMultiToggle(group.id, option)
                        }
                        className="h-4 w-4"
                      />
                      {option.label}
                    </span>
                    {option.priceDelta > 0 && (
                      <span className="text-sm text-slate-500">+{formatCurrency(option.priceDelta)}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Quantity</h4>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              −
            </Button>
            <span className="text-lg font-semibold text-slate-900 w-8 text-center">{quantity}</span>
            <Button variant="secondary" size="sm" onClick={() => setQuantity((q) => q + 1)}>
              +
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Special Instructions</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. no onions, extra spicy..."
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm"
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-sm text-slate-600">Item Total</span>
          <span className="text-lg font-bold text-orange-500">{formatCurrency(lineTotal)}</span>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button className="flex-1" disabled={missingRequired} onClick={handleConfirm}>
            ADD TO CART
          </Button>
        </div>
      </div>
    </Modal>
  );
}
