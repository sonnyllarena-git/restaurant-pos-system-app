import React, { useState, useEffect, useCallback, useContext } from 'react';
import Button from '../common/Button';
import Loader from '../common/Loader';
import PriceHistoryModal from './PriceHistoryModal';
import AddItemModal from './AddItemModal';
import { useAuth } from '../../hooks/useAuth';
import { UIContext } from '../../context/UIContext';
import { NotificationContext } from '../../context/NotificationContext';
import {
  getMenuItems,
  updateMenuItemPrice,
  getPriceHistory,
  addMenuItem,
  deleteMenuItem,
  isMenuItemUsedInOrders,
} from '../../services/dbService';
import { formatCurrency } from '../../utils/formatters';
import { MENU_CATEGORIES } from '../../utils/seedData';

export default function PricingTab() {
  const { user } = useAuth();
  const { confirm } = useContext(UIContext);
  const { showSuccess, showError } = useContext(NotificationContext);

  const [items, setItems] = useState(null);
  const [category, setCategory] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [historyFor, setHistoryFor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadItems = useCallback(async () => {
    const all = await getMenuItems();
    setItems(all.sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = items === null ? [] : category === 'all' ? items : items.filter((i) => i.category === category);

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditingPrice(String(item.price));
  };

  const handleSavePrice = async (item) => {
    const numPrice = parseFloat(editingPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      showError('Enter a valid price');
      return;
    }
    const oldPrice = item.price;
    await updateMenuItemPrice(item.id, numPrice, user?.fullName || user?.username);
    setEditingId(null);
    await loadItems();
    showSuccess(`Price updated: ${formatCurrency(oldPrice)} → ${formatCurrency(numPrice)}`);
  };

  const handleShowHistory = async (item) => {
    const history = await getPriceHistory(item.id);
    setHistoryFor({ itemName: item.name, history });
  };

  const handleAddItem = async (itemData) => {
    await addMenuItem(itemData);
    setShowAddModal(false);
    await loadItems();
    showSuccess(`Item added: ${itemData.name}`);
  };

  const handleDeleteItem = (item) => {
    confirm({
      title: 'Delete Item',
      message: `Delete "${item.name}" from the menu? This cannot be undone.`,
      confirmLabel: 'DELETE',
      danger: true,
      onConfirm: async () => {
        const used = await isMenuItemUsedInOrders(item.name);
        if (used) {
          showError('Cannot delete — this item already appears in past orders.');
          return;
        }
        await deleteMenuItem(item.id);
        await loadItems();
        showSuccess('Item deleted');
      },
    });
  };

  if (items === null) return <Loader label="Loading menu items..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            category === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          View All
        </button>
        {MENU_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              category === cat ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          + ADD NEW ITEM
        </Button>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-12">No items in this category.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-300 rounded">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700 text-left">
              <tr>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Current Price</th>
                <th className="px-4 py-3 text-center">History</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.icon} {item.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.category}</td>
                  <td className="px-4 py-3 text-right">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(e.target.value)}
                          autoFocus
                          className="w-24 px-2 py-1 border border-orange-500 rounded text-right focus:outline-none"
                        />
                        <button onClick={() => handleSavePrice(item)} className="text-green-600 hover:text-green-700 font-bold" aria-label="Save price">
                          ✓
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-700 font-bold" aria-label="Cancel">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleStartEdit(item)} className="font-bold text-orange-600 hover:underline">
                        {formatCurrency(item.price)}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleShowHistory(item)} className="text-blue-600 hover:underline text-sm font-medium">
                      History
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDeleteItem(item)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {historyFor && (
        <PriceHistoryModal itemName={historyFor.itemName} history={historyFor.history} onClose={() => setHistoryFor(null)} />
      )}
      {showAddModal && <AddItemModal onAdd={handleAddItem} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
