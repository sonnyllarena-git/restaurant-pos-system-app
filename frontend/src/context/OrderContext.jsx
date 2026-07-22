import React, { createContext, useState } from 'react';
import { SERVICE_TYPES } from '../utils/constants';

export const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [serviceType, setServiceType] = useState(null);

  const resetOrder = () => {
    setSelectedTable(null);
    setServiceType(null);
  };

  return (
    <OrderContext.Provider
      value={{ selectedTable, setSelectedTable, serviceType, setServiceType, resetOrder, SERVICE_TYPES }}
    >
      {children}
    </OrderContext.Provider>
  );
}
