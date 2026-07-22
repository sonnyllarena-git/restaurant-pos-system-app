import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';

const SUPPLIERS = ['Batangas Fresh Produce Co.', 'Southern Tagalog Meats', 'Coastal Seafood Traders', 'Metro Beverage Distributors'];

export default function ReorderForm({ item, onConfirm, onClose }) {
  const [supplier, setSupplier] = useState(SUPPLIERS[0]);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setError('Enter a valid quantity');
      return;
    }
    onConfirm({ itemId: item.id, supplier, quantity: qty });
  };

  return (
    <Modal title={`Reorder: ${item.name}`} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            {SUPPLIERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity ({item.unit})</label>
          <Input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            PLACE ORDER
          </Button>
        </div>
      </div>
    </Modal>
  );
}
