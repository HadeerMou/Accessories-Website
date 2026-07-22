const WISHLIST_STORAGE_KEY = 'aura_wishlist';

function saveWishlist(ids: string[]) {
  const uniqueIds = [...new Set(ids.filter((id) => typeof id === 'string' && id.trim()))];
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(uniqueIds));
  window.dispatchEvent(new Event('aura-wishlist-change'));
  return uniqueIds;
}

export function getWishlistIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const value = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!value) return [];

    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())))]
      : [];
  } catch {
    return [];
  }
}

export function isWishlistItem(productId: string) {
  return getWishlistIds().includes(productId);
}

export function toggleWishlistItem(productId: string) {
  if (typeof window === 'undefined') return false;

  const current = getWishlistIds();
  const exists = current.includes(productId);
  const next = exists ? current.filter((id) => id !== productId) : [...current, productId];
  saveWishlist(next);

  return !exists;
}

export function removeWishlistItem(productId: string) {
  if (typeof window === 'undefined') return;
  saveWishlist(getWishlistIds().filter((id) => id !== productId));
}

export function clearWishlist() {
  if (typeof window === 'undefined') return;
  saveWishlist([]);
}

export function wishlistCount() {
  return getWishlistIds().length;
}
