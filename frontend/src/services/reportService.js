const BUSINESS_HOURS = { start: 11, end: 20 };

function formatHourLabel(hour) {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

export function getOrderStats(orders) {
  const orderCount = orders.length;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const guests = orders.reduce((sum, o) => sum + (o.guests || 1), 0);
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;
  return { orderCount, revenue, guests, avgOrderValue };
}

export function getTopItems(orders, limit = 5) {
  const tally = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const price = item.unitPrice ?? item.price ?? 0;
      if (!tally[item.name]) tally[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      tally[item.name].quantity += item.quantity;
      tally[item.name].revenue += item.quantity * price;
    });
  });
  return Object.values(tally)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export function getHourlyBreakdown(orders, { startHour = BUSINESS_HOURS.start, endHour = BUSINESS_HOURS.end } = {}) {
  const buckets = {};
  for (let hour = startHour; hour <= endHour; hour++) {
    buckets[hour] = {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      hourLabel: formatHourLabel(hour),
      orders: 0,
      revenue: 0,
      itemsCount: 0,
      avgOrderValue: 0,
      topItems: [],
    };
  }

  const itemTallyByHour = {};
  orders.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    if (!buckets[hour]) return;
    buckets[hour].orders += 1;
    buckets[hour].revenue += o.total;
    buckets[hour].itemsCount += (o.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

    if (!itemTallyByHour[hour]) itemTallyByHour[hour] = {};
    (o.items || []).forEach((item) => {
      itemTallyByHour[hour][item.name] = (itemTallyByHour[hour][item.name] || 0) + (item.quantity || 0);
    });
  });

  return Object.keys(buckets)
    .map(Number)
    .sort((a, b) => a - b)
    .map((hour) => {
      const bucket = buckets[hour];
      bucket.avgOrderValue = bucket.orders > 0 ? bucket.revenue / bucket.orders : 0;
      bucket.topItems = Object.entries(itemTallyByHour[hour] || {})
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3);
      return bucket;
    });
}

export function getOrderDurationMinutes(order) {
  if (!order?.completedAt || !order?.createdAt) return null;
  const ms = new Date(order.completedAt) - new Date(order.createdAt);
  if (Number.isNaN(ms)) return null;
  // Instant-checkout orders can have completedAt stamped a few ms before createdAt
  // (two separate Date.now() calls straddling the saveOrder boundary) — clamp
  // rather than hide the duration entirely.
  return Math.max(0, Math.round(ms / 60000));
}
