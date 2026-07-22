'use client';

import { useEffect, useState } from 'react';
import { Heart, LoaderCircle, ShoppingBag, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_URL, customerToken, type StoreProduct } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { clearWishlist, getWishlistIds, removeWishlistItem } from '@/lib/wishlist';

export default function FavoritesPage() {
  const t = useTranslations('EmptyStates');
  const locale = useLocale();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const syncWishlist = () => setWishlistIds(getWishlistIds());
    syncWishlist();
    window.addEventListener('aura-wishlist-change', syncWishlist);
    window.addEventListener('storage', syncWishlist);
    return () => {
      window.removeEventListener('aura-wishlist-change', syncWishlist);
      window.removeEventListener('storage', syncWishlist);
    };
  }, []);

  useEffect(() => {
    if (!wishlistIds.length) {
      const emptyTimer = window.setTimeout(() => {
        setProducts([]);
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(emptyTimer);
    }

    const controller = new AbortController();
    const loadingTimer = window.setTimeout(() => setLoading(true), 0);
    Promise.all(
      wishlistIds.map(async (id) => {
        const response = await fetch(`${API_URL}/products/${id}`, { signal: controller.signal });
        if (!response.ok) return null;
        const body = await response.json();
        return (body.data ?? body) as StoreProduct;
      }),
    )
      .then((items) => {
        setProducts(items.filter((item): item is StoreProduct => item !== null));
        setError('');
      })
      .catch((cause) => {
        if (cause.name !== 'AbortError') setError(cause instanceof Error ? cause.message : 'Could not load wishlist');
      })
      .finally(() => setLoading(false));

    return () => {
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [wishlistIds]);

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2200);
  };

  const addToCart = async (product: StoreProduct) => {
    const token = customerToken();
    if (!token) {
      window.dispatchEvent(new Event('aura-open-auth'));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const body = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(body?.error ?? 'Could not add to bag');
      showMessage(locale === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to your bag');
    } catch (cause) {
      showMessage(cause instanceof Error ? cause.message : 'Could not add to bag');
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <section className="w-full max-w-6xl mx-auto px-8 py-16 md:py-24 flex-1">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-[#2C2A28]">{t('favoritesTitle')}</h1>
            <p className="mt-3 font-sans text-[#2C2A28]/70 max-w-2xl">{t('favoritesText')}</p>
          </div>
          {products.length > 0 && <button onClick={clearWishlist} className="text-xs font-semibold uppercase tracking-widest text-[#2C2A28]/60 underline underline-offset-4 hover:text-[#2C2A28]">{locale === 'ar' ? 'مسح الكل' : 'Clear all'}</button>}
        </div>

        {loading ? (
          <div className="mt-12 flex min-h-40 items-center justify-center rounded-2xl border border-black/10 bg-white/60"><LoaderCircle className="animate-spin text-[#26372f]" /></div>
        ) : error ? (
          <div className="mt-12 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-8 text-sm text-rose-700">{error}</div>
        ) : products.length ? (
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const image = product.images.find((item) => item.isPrimary) ?? product.images[0];
              const name = locale === 'ar' ? product.nameAr : product.nameEn;
              const price = Number(product.discountPrice ?? product.price);
              const soldOut = (product.stock ?? 0) < 1;
              return (
                <article key={product.id} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#e8e2d8]">
                    <Link href={`/product/${product.id}`} className="block h-full w-full">
                      {image ? <div className="h-full w-full bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${image.imageUrl})` }} /> : <div className="grid h-full place-items-center font-serif text-2xl text-black/20">Aura</div>}
                    </Link>
                    <button onClick={() => removeWishlistItem(product.id)} aria-label={`Remove ${name} from wishlist`} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-[#2C2A28] shadow-sm transition hover:bg-[#26372f] hover:text-white"><X size={16} /></button>
                    {product.discountPrice && <span className="absolute left-3 top-3 rounded-full bg-[#8b5140] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">Sale</span>}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <Link href={`/product/${product.id}`} className="min-w-0"><h2 className="text-sm font-semibold text-[#2C2A28]">{name}</h2><p className="mt-1 text-[10px] uppercase tracking-wider text-black/38">{locale === 'ar' ? product.category?.nameAr : product.category?.nameEn}</p></Link>
                    <div className="shrink-0 text-right text-sm text-[#2C2A28]">{new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price)}{product.discountPrice && <div className="mt-1 text-[10px] text-black/35 line-through">{Number(product.price).toFixed(0)}</div>}</div>
                  </div>
                  <button onClick={() => addToCart(product)} disabled={soldOut} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#26372f] px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#26372f] transition hover:bg-[#26372f] hover:text-white disabled:cursor-not-allowed disabled:border-black/15 disabled:text-black/35 disabled:hover:bg-transparent"><ShoppingBag size={14} />{soldOut ? (locale === 'ar' ? 'نفدت الكمية' : 'Sold out') : (locale === 'ar' ? 'أضف إلى السلة' : 'Add to bag')}</button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-black/15 bg-white/70 px-6 py-10 text-sm text-[#2C2A28]/70">
            <div className="flex items-center gap-2 font-semibold text-[#2C2A28]"><Heart size={16} />{locale === 'ar' ? 'لا توجد عناصر محفوظة بعد.' : 'No saved pieces yet.'}</div>
            <p className="mt-3 max-w-xl">{locale === 'ar' ? 'استخدم زر القلب على أي منتج لحفظه هنا.' : 'Use the heart button on any product to save it here.'}</p>
            <Link href="/women" className="mt-5 inline-flex rounded-full bg-[#26372f] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white">{locale === 'ar' ? 'تصفح المنتجات' : 'Browse products'}</Link>
          </div>
        )}
      </section>
      {message && <div className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-[#26372f] px-5 py-3 text-xs text-white shadow-xl">{message}</div>}
      <Footer />
    </main>
  );
}
