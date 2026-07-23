import React, { useState, useContext } from 'react';
import { useOrder } from '../../hooks/useOrder';
import { useCart } from '../../hooks/useCart';
import { NotificationContext } from '../../context/NotificationContext';
import TableSelector from './TableSelector';
import MenuBrowser from './MenuBrowser';
import CartSummary from './CartSummary';
import ItemCustomization from './ItemCustomization';
import OrderTypeModal from './OrderTypeModal';
import ServiceTypeModal from './ServiceTypeModal';
import { SERVICE_TYPES } from '../../utils/constants';

export default function POSScreen() {
  const { selectedTable, serviceType, orderType } = useOrder();
  const { addToCart } = useCart();
  const { showSuccess } = useContext(NotificationContext);
  const [customizingItem, setCustomizingItem] = useState(null);

  const handleSelectItem = (item) => {
    if (item.modifierGroups?.length > 0) {
      setCustomizingItem(item);
    } else {
      addToCart(item, 1, [], '');
      showSuccess(`${item.name} added to cart`);
    }
  };

  const handleConfirmCustomization = ({ quantity, selectedModifiers, notes }) => {
    addToCart(customizingItem, quantity, selectedModifiers, notes);
    showSuccess(`${customizingItem.name} added to cart`);
    setCustomizingItem(null);
  };

  if (!orderType) {
    return <OrderTypeModal />;
  }

  if (!serviceType) {
    return <ServiceTypeModal />;
  }

  if (serviceType === SERVICE_TYPES.DINE_IN && !selectedTable) {
    return <TableSelector />;
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0">
        <MenuBrowser onSelectItem={handleSelectItem} />
      </div>
      <CartSummary />
      {customizingItem && (
        <ItemCustomization
          item={customizingItem}
          onConfirm={handleConfirmCustomization}
          onClose={() => setCustomizingItem(null)}
        />
      )}
    </div>
  );
}
