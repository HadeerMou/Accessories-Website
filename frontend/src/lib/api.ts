export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface StoreProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  price: string | number;
  discountPrice?: string | number | null;
  stock?: number | null;
  featured?: boolean | null;
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'ARCHIVED';
  category?: { nameEn: string; nameAr: string; slugEn?: string | null } | null;
  images: Array<{ id: string; imageUrl: string; altText?: string | null; isPrimary?: boolean | null }>;
  variants: Array<{ id: string; stock?: number | null; price?: string | number | null; color?: string | null; size?: string | null }>;
  reviews?: Array<{ id: string; rating: number; comment?: string | null; createdAt: string; user?: { fullName: string } | null }>;
}

export interface CustomerSession { id: string; fullName: string; email: string; role: 'ADMIN' | 'CUSTOMER' }

export function customerToken() { return typeof window === 'undefined' ? null : window.localStorage.getItem('aura_customer_token'); }
export function customerSession(): CustomerSession | null { if (typeof window === 'undefined') return null; try { const value = window.localStorage.getItem('aura_customer_user'); return value ? JSON.parse(value) as CustomerSession : null; } catch { return null; } }
export function saveCustomerSession(token: string, user: CustomerSession) { window.localStorage.setItem('aura_customer_token', token); window.localStorage.setItem('aura_customer_user', JSON.stringify(user)); window.dispatchEvent(new Event('aura-auth-change')); }
export function clearCustomerSession() { window.localStorage.removeItem('aura_customer_token'); window.localStorage.removeItem('aura_customer_user'); window.dispatchEvent(new Event('aura-auth-change')); }
