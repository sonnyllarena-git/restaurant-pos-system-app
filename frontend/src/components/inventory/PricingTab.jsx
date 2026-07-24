import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import Button from '../common/Button';
import Loader from '../common/Loader';
import PriceHistoryModal from './PriceHistoryModal';
import AddItemModal from './AddItemModal';
import EditItemModal from './EditItemModal';
import { useAuth } from '../../hooks/useAuth';
import { UIContext } from '../../context/UIContext';
import { NotificationContext } from '../../context/NotificationContext';
import {
  getMenuItems,
  updateMenuItem,
  getPriceHistory,
  addMenuItem,
  deleteMenuItem,
  isMenuItemUsedInOrders,
} from '../../services/dbService';
import { formatCurrency } from '../../utils/formatters';
import { matchesMenuSearch } from '../../utils/menuSearch';
import { MENU_CATEGORIES } from '../../utils/seedData';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'price-asc', label: 'Price (Low→High)' },
  { value: 'price-desc', label: 'Price (High→Low)' },
  { value: 'created-desc', label: 'Recently Added' },
  { value: 'updated-desc', label: 'Recently Updated' },
];

function timeValue(timestamp) {
  if (!timestamp) return 0;
  const t = new Date(timestamp).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function sortItems(items, sortBy) {
  const copy = [...items];
  switch (sortBy) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'created-desc':
      return copy.sort((a, b) => timeValue(b.createdAt) - timeValue(a.createdAt));
    case 'updated-desc':
      return copy.sort((a, b) => timeValue(b.updatedAt) - timeValue(a.updatedAt));
    case 'name-asc':
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export default function PricingTab() {
  const { user } = useAuth();
  const { confirm } = useContext(UIContext);
  const { showSuccess, showError } = useContext(NotificationContext);

  const [items, setItems] = useState(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [historyFor, setHistoryFor] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadItems = useCallback(async () => {
    const all = await getMenuItems();
    setItems(all);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    if (items === null) return [];
    const term = search.trim();
    const base = term ? items : category === 'all' ? items : items.filter((i) => i.category === category);
    const matched = term ? base.filter((item) => matchesMenuSearch(item, term)) : base;
    return sortItems(matched, sortBy);
  }, [items, category, search, sortBy]);

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

  const handleSaveEdit = async (itemId, changes) => {
    const item = items.find((i) => i.id === itemId);
    const priceChanged = item && changes.price !== item.price;
    await updateMenuItem(itemId, changes, user?.fullName || user?.username);
    setEditingItem(null);
    await loadItems();
    showSuccess(priceChanged ? `Item updated — price changed to ${formatCurrency(changes.price)}` : 'Item updated');
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

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu items across all categories..."
          className="flex-1 min-w-[220px] px-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-sm"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-12">No items found.</p>
      ) : (
        <div className="border border-slate-300 rounded divide-y divide-slate-200">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-4 py-3">
              <div className="h-[50px] w-[50px] shrink-0 rounded border border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                {item.imageDataUrl ? (
                  <img src={item.imageDataUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl leading-none">{item.icon || '🍽️'}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.category}</p>
              </div>
              <span className="text-sm font-bold text-orange-500 w-24 text-right shrink-0">
                {formatCurrency(item.price)}
              </span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setEditingItem(item)}
                  className="text-orange-600 hover:underline text-sm font-medium"
                >
                  Edit ✎
                </button>
                <button
                  onClick={() => handleShowHistory(item)}
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  History
                </button>
                <button
                  onClick={() => handleDeleteItem(item)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {historyFor && (
        <PriceHistoryModal itemName={historyFor.itemName} history={historyFor.history} onClose={() => setHistoryFor(null)} />
      )}
      {showAddModal && (
        <AddItemModal existingItems={items} onAdd={handleAddItem} onClose={() => setShowAddModal(false)} />
      )}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          existingItems={items}
          onSave={handleSaveEdit}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
