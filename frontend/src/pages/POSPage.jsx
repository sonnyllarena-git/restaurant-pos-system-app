import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { useOrder } from '../hooks/useOrder';
import { SERVICE_TYPES } from '../utils/constants';

export default function POSPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderType, setOrderType, serviceType, setServiceType, selectedTable, setSelectedTable } = useOrder();

  // The order-taking wizard (order type -> service type -> table -> menu/cart) is all
  // state on a single /pos route, not separate history entries, so browser-history
  // back would skip over every step straight to whatever page preceded /pos. Step back
  // through the wizard state instead; /pos/payment is a real nested route, so its
  // default history-back (to /pos) is already correct and left alone.
  const isPaymentStep = location.pathname === '/pos/payment';

  const handleBack = isPaymentStep
    ? undefined
    : () => {
        if (!orderType) {
          navigate('/home');
        } else if (!serviceType) {
          setOrderType(null);
        } else if (serviceType === SERVICE_TYPES.DINE_IN && !selectedTable) {
          setServiceType(null);
        } else if (serviceType === SERVICE_TYPES.DINE_IN) {
          setSelectedTable(null);
        } else {
          setServiceType(null);
        }
      };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="Point of Sale" onBack={handleBack} />
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
