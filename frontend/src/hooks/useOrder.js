import { useContext } from 'react';
import { OrderContext } from '../context/OrderContext';

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
}
