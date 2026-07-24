import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { MENU_CATEGORIES } from '../../utils/seedData';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

export default function EditItemModal({ item, existingItems, onSave, onClose }) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [price, setPrice] = useState(String(item.price));
  const [imageDataUrl, setImageDataUrl] = useState(item.imageDataUrl || null);
  const [errors, setErrors] = useState({});
  const [imageError, setImageError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageError('');

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Only JPG or PNG images are allowed.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be 2MB or smaller.');
      return;
    }

    // Stored as a base64 data URL on the item record rather than written to a
    // /public/menu-images/ folder -- a plain browser app has no filesystem/Electron
    // process to save a real file to.
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result);
    reader.onerror = () => setImageError('Failed to read image file.');
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const fieldErrors = {};
    const trimmedName = name.trim();
    if (!trimmedName) fieldErrors.name = 'Item name is required';
    if (!price || Number(price) < 0) fieldErrors.price = 'Enter a valid price';

    const isDuplicate = (existingItems || []).some(
      (i) => i.id !== item.id && i.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) fieldErrors.name = 'An item with this name already exists';

    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    onSave(item.id, {
      name: trimmedName,
      category,
      price: Number(price),
      imageDataUrl,
    });
  };

  return (
    <Modal title="Edit Item" onClose={onClose} size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
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
          <Input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
          <div className="flex items-center gap-3">
            <div className="h-[50px] w-[50px] shrink-0 rounded border border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
              {imageDataUrl ? (
                <img src={imageDataUrl} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl leading-none">{item.icon || '🍽️'}</span>
              )}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="text-sm text-slate-600"
            />
          </div>
          {imageError && <p className="text-sm text-red-500 mt-1">{imageError}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            CANCEL
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            SAVE
          </Button>
        </div>
      </div>
    </Modal>
  );
}
