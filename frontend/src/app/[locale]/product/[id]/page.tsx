'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, Heart, LoaderCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_URL, customerToken, type StoreProduct } from '@/lib/api';
import { getWishlistIds, toggleWishlistItem } from '@/lib/wishlist';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const locale = useLocale();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!params?.id) return;

    const controller = new AbortController();
    const loadingTimer = window.setTimeout(() => setLoading(true), 0);
    fetch(`${API_URL}/products/${params.id}`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error ?? body?.detail ?? 'Could not load product');
        setProduct(body.data ?? body);
        setError('');
      })
      .catch((cause) => {
        if (cause.name !== 'AbortError') {
          setError(cause instanceof Error ? cause.message : 'Could not load product');
        }
      })
      .finally(() => setLoading(false));

    return () => {
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [params?.id]);

  useEffect(() => {
    if (!params?.id) return;
    const syncWishlist = () => {
      if (typeof window === 'undefined') return;
      setWishlist(getWishlistIds().includes(params.id));
    };

    syncWishlist();
    window.addEventListener('aura-wishlist-change', syncWishlist);
    window.addEventListener('storage', syncWishlist);
    return () => { window.removeEventListener('aura-wishlist-change', syncWishlist); window.removeEventListener('storage', syncWishlist); };
  }, [params?.id]);

  const handleWishlist = () => {
    if (!product) return;
    const added = toggleWishlistItem(product.id);
    setWishlist(added);
    setMessage(added ? (locale === 'ar' ? 'تمت الإضافة إلى المفضلة' : 'Added to favorites') : (locale === 'ar' ? 'تمت إزالة المنتج من المفضلة' : 'Removed from favorites'));
    window.setTimeout(() => setMessage(''), 2200);
  };

  const handleAddToBag = async () => {
    if (!product) return;
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
      setMessage(locale === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to your bag');
      window.setTimeout(() => setMessage(''), 2200);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Could not add to bag');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
        <Header />
        <section className="flex flex-1 items-center justify-center">
          <LoaderCircle className="animate-spin text-[#26372f]" />
        </section>
        <Footer />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
        <Header />
        <section className="mx-auto flex max-w-6xl flex-1 flex-col justify-center px-8 py-24">
          <p className="text-sm text-rose-700">{error || 'Product not found.'}</p>
          <Link href="/women" className="mt-4 inline-flex w-fit rounded-full bg-[#26372f] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white">Back to shop</Link>
        </section>
        <Footer />
      </main>
    );
  }

  const image = product.images.find((item) => item.isPrimary) ?? product.images[0];
  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const description = locale === 'ar' ? product.descriptionAr : product.descriptionEn;
  const price = Number(product.discountPrice ?? product.price);

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-8 py-24 lg:flex-row lg:items-start">
        <div className="w-full lg:w-[45%]">
          <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#e8e2d8]">
            {image ? <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${image.imageUrl})` }} /> : <div className="grid h-full place-items-center font-serif text-3xl text-black/20">Aura</div>}
          </div>
        </div>
        <div className="w-full lg:w-[55%]">
          <Link href="/women" className="mb-6 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-[#2C2A28]/60">
            <ArrowLeft size={16} /> {locale === 'ar' ? 'العودة للتسوق' : 'Back to shop'}
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif text-[#2C2A28]">{name}</h1>
              <p className="mt-2 text-sm uppercase tracking-[0.3em] text-[#2C2A28]/45">{locale === 'ar' ? product.category?.nameAr : product.category?.nameEn}</p>
            </div>
            <button onClick={handleWishlist} className={`rounded-full p-3 ${wishlist ? 'bg-[#26372f] text-white' : 'border border-black/10 bg-white text-[#2C2A28]'}`}>
              <Heart size={18} fill={wishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="mt-6 text-sm leading-7 text-[#2C2A28]/70">{description || (locale === 'ar' ? 'لا يوجد وصف متاح.' : 'No description available.')}</p>
          <div className="mt-8 flex items-center gap-4">
            <div className="text-2xl font-semibold text-[#2C2A28]">${price.toFixed(2)}</div>
            {product.discountPrice && <div className="text-sm text-black/40 line-through">${Number(product.price).toFixed(2)}</div>}
          </div>
          <button onClick={handleAddToBag} className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#26372f] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white">
            <ShoppingBag size={16} /> {locale === 'ar' ? 'أضف إلى السلة' : 'Add to bag'}
          </button>
          {message ? <p className="mt-4 text-sm text-[#26372f]">{message}</p> : null}
        </div>
      </section>
      <Footer />
    </main>
  );
}
