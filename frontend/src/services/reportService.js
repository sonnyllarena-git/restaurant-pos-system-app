export function getOrderStats(orders) {
  const orderCount = orders.length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const guests = orders.reduce((sum, o) => sum + (o.guests || 1), 0);
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;
  return { orderCount, revenue, guests, avgOrderValue };
}

export function getHourlyBreakdown(orders) {
  const buckets = {};
  orders.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    const key = `${hour.toString().padStart(2, '0')}:00`;
    if (!buckets[key]) buckets[key] = { hour: key, orders: 0, revenue: 0 };
    buckets[key].orders += 1;
    buckets[key].revenue += o.total;
  });
  return Object.values(buckets).sort((a, b) => a.hour.localeCompare(b.hour));
}

export function getTopItems(orders, limit = 5) {
  const tally = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      if (!tally[item.name]) tally[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      tally[item.name].quantity += item.quantity;
      tally[item.name].revenue += item.quantity * item.price;
    });
  });
  return Object.values(tally)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}
