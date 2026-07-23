import React, { createContext, useState } from 'react';
import { SERVICE_TYPES } from '../utils/constants';

export const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [selectedTable, setSelectedTable] = useState(null);
  const [serviceType, setServiceType] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState(null);
  const [deliveryCompany, setDeliveryCompany] = useState(null);

  const resetOrder = () => {
    setSelectedTable(null);
    setServiceType(null);
    setOrderType(null);
    setDeliveryMethod(null);
    setDeliveryCompany(null);
  };

  return (
    <OrderContext.Provider
      value={{
        selectedTable,
        setSelectedTable,
        serviceType,
        setServiceType,
        orderType,
        setOrderType,
        deliveryMethod,
        setDeliveryMethod,
        deliveryCompany,
        setDeliveryCompany,
        resetOrder,
        SERVICE_TYPES,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
