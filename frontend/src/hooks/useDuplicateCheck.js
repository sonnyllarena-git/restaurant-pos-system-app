import { getOrdersByCustomer } from '../services/dbService';

export function useDuplicateCheck() {
  const checkDuplicateOrder = async (name, phone) => {
    const matches = await getOrdersByCustomer(name, phone);
    return matches.find((order) => order.status === 'pending') || null;
  };

  const checkRecentSubmission = async (phone, withinSeconds = 10) => {
    const matches = await getOrdersByCustomer('', phone);
    const cutoff = Date.now() - withinSeconds * 1000;
    return matches.some((order) => new Date(order.createdAt).getTime() >= cutoff);
  };

  return { checkDuplicateOrder, checkRecentSubmission };
}
