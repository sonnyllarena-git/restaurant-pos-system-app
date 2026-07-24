import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { getLastPriceUpdateTime } from '../../services/dbService';
import { MENU_CATEGORIES } from '../../utils/seedData';

export default function PriceCheckModal({ onDone, onGoToInventory }) {
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    getLastPriceUpdateTime().then(setLastUpdate);
  }, []);

  return (
    <Modal title="📋 Daily Price Check" onClose={onDone} size="sm">
      <div className="space-y-4">
        <div className="p-3 bg-slate-100 rounded">
          <p className="text-xs text-slate-600">Last price update</p>
          <p className="text-sm font-semibold text-slate-900">
            {lastUpdate ? new Date(lastUpdate).toLocaleString('en-PH') : 'No price changes recorded yet'}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 mb-3">Are today's prices up to date?</p>
          <div className="space-y-2">
            {MENU_CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-3 text-sm text-slate-700">
                <input type="checkbox" className="h-4 w-4" />
                {cat}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onDone}>
            DONE
          </Button>
          <Button className="flex-1" onClick={onGoToInventory}>
            GO TO INVENTORY
          </Button>
        </div>
      </div>
    </Modal>
  );
}
