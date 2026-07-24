import React, { useState } from 'react';
import RestaurantInfo from './RestaurantInfo';
import PrinterConfig from './PrinterConfig';
import BackupSettings from './BackupSettings';
import UserManagement from './UserManagement';
import DatabaseSettings from './DatabaseSettings';

const SECTIONS = [
  { key: 'restaurant', label: 'Restaurant Info', component: RestaurantInfo },
  { key: 'printer', label: 'Printer', component: PrinterConfig },
  { key: 'backup', label: 'Backup', component: BackupSettings },
  { key: 'users', label: 'Users', component: UserManagement },
  { key: 'database', label: 'Database', component: DatabaseSettings },
];

export default function SettingsMain() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].key);
  const ActiveComponent = SECTIONS.find((s) => s.key === activeSection)?.component || RestaurantInfo;

  return (
    <div className="flex h-full">
      <aside className="w-56 border-r border-slate-200 p-4 space-y-1 shrink-0">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            className={`w-full text-left px-4 py-3 rounded text-sm font-medium transition-colors ${
              activeSection === section.key
                ? 'bg-orange-100 text-orange-700'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {section.label}
          </button>
        ))}
      </aside>
      <div className="flex-1 p-6 overflow-y-auto">
        <ActiveComponent />
      </div>
    </div>
  );
}
