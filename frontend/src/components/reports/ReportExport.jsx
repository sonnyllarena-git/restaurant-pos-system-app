import React, { useContext } from 'react';
import Button from '../common/Button';
import { NotificationContext } from '../../context/NotificationContext';

export default function ReportExport() {
  const { showInfo } = useContext(NotificationContext);

  const handleExport = () => showInfo('Export coming in backend integration phase');

  return (
    <div className="flex gap-3">
      <Button variant="secondary" size="sm" onClick={handleExport}>
        EXPORT PDF
      </Button>
      <Button variant="secondary" size="sm" onClick={handleExport}>
        EXPORT EXCEL
      </Button>
    </div>
  );
}
