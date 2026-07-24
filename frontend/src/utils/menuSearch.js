export function matchesMenuSearch(item, term) {
  const trimmed = (term || '').trim().toLowerCase();
  if (!trimmed) return true;
  return item.name.toLowerCase().includes(trimmed);
}
