import React, { useState, useMemo, useEffect } from 'react';
import MenuItemCard from './MenuItemCard';
import Loader from '../common/Loader';
import { getMenuItems } from '../../services/dbService';
import { MENU_CATEGORIES } from '../../utils/seedData';
import { matchesMenuSearch } from '../../utils/menuSearch';

const CATEGORIES = MENU_CATEGORIES;

export default function MenuBrowser({ onSelectItem }) {
  const [menuItems, setMenuItems] = useState(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMenuItems().then(setMenuItems);
  }, []);

  // While searching, matches come from every category, not just the active tab --
  // the tab then jumps to reflect where the first match actually lives so it never
  // looks like results are missing.
  useEffect(() => {
    const term = search.trim();
    if (!term || !menuItems) return;
    const firstMatch = menuItems.find((item) => matchesMenuSearch(item, term));
    if (firstMatch) setActiveCategory(firstMatch.category);
  }, [search, menuItems]);

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    const term = search.trim();
    if (!term) {
      return menuItems.filter((item) => item.category === activeCategory);
    }
    return menuItems.filter((item) => matchesMenuSearch(item, term));
  }, [menuItems, activeCategory, search]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="w-full px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>
      <div className="flex gap-2 px-4 py-3 border-b border-slate-200 overflow-x-auto">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {menuItems === null ? (
          <Loader label="Loading menu..." />
        ) : (
          <div>
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onSelect={onSelectItem} />
            ))}
            {filteredItems.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">No items found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
