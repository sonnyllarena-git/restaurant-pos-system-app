import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { MENU_CATEGORIES } from '../../utils/seedData';

export default function AddItemModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(MENU_CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState({});

  const handleAdd = () => {
    const fieldErrors = {};
    if (!name.trim()) fieldErrors.name = 'Item name is required';
    if (!price || Number(price) <= 0) fieldErrors.price = 'Enter a valid price';
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    onAdd({ name: name.trim(), category, price: Number(price) });
  };

  return (
    <Modal title="Add New Item" onClose={onClose} size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pork Barbeque" error={errors.name} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            {MENU_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Price (₱)</label>
          <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 150" error={errors.price} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button className="flex-1" onClick={handleAdd}>
            ADD ITEM
          </Button>
        </div>
      </div>
    </Modal>
  );
}
