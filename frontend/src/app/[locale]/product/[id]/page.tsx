'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, Heart, LoaderCircle, ShoppingBag, Star } from 'lucide-react';
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
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!product) return;
    const token = customerToken();
    if (!token) {
      window.dispatchEvent(new Event('aura-open-auth'));
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id, rating: reviewRating, comment: reviewComment }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? 'Could not submit review');
      
      // Update local product reviews
      setProduct({
        ...product,
        reviews: [body.data, ...(product.reviews || [])]
      });
      
      setReviewRating(5);
      setReviewComment('');
      setMessage(locale === 'ar' ? 'تمت إضافة تقييمك بنجاح' : 'Your review was submitted successfully');
      window.setTimeout(() => setMessage(''), 3000);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Could not submit review');
    } finally {
      setSubmittingReview(false);
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

      {/* Reviews Section */}
      <section className="mx-auto w-full max-w-6xl px-8 py-16 border-t border-black/10">
        <h2 className="text-2xl font-serif text-[#2C2A28] mb-8">{locale === 'ar' ? 'آراء العملاء' : 'Customer Reviews'}</h2>
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Reviews List */}
          <div className="space-y-6">
            {!product.reviews || product.reviews.length === 0 ? (
              <p className="text-sm text-[#2C2A28]/60">{locale === 'ar' ? 'لا توجد تقييمات حتى الآن. كن أول من يكتب تقييماً!' : 'No reviews yet. Be the first to review!'}</p>
            ) : (
              product.reviews.map((review: any) => (
                <div key={review.id} className="border-b border-black/5 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{review.user?.fullName || 'Customer'}</span>
                    <span className="text-xs text-[#2C2A28]/40">{new Date(review.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={14} fill={star <= review.rating ? "#d1ae68" : "none"} color={star <= review.rating ? "#d1ae68" : "#ccc"} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-[#2C2A28]/70">{review.comment}</p>}
                </div>
              ))
            )}
          </div>

          {/* Write Review Form */}
          <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm h-fit">
            <h3 className="text-lg font-serif mb-4">{locale === 'ar' ? 'اكتب تقييمك' : 'Write a Review'}</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-2">{locale === 'ar' ? 'التقييم' : 'Rating'}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star size={24} fill={star <= reviewRating ? "#d1ae68" : "none"} color={star <= reviewRating ? "#d1ae68" : "#ccc"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2">{locale === 'ar' ? 'تعليق (اختياري)' : 'Comment (Optional)'}</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-[#fdfcf9] px-4 py-3 text-sm outline-none focus:border-[#667d6b] resize-none"
                  rows={4}
                  placeholder={locale === 'ar' ? 'شارك رأيك حول هذا المنتج...' : 'Share your thoughts about this product...'}
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full rounded-full bg-[#26372f] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50"
              >
                {submittingReview ? (locale === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : (locale === 'ar' ? 'إرسال التقييم' : 'Submit Review')}
              </button>
              <p className="text-[10px] text-center text-black/40 mt-4">
                {locale === 'ar' ? 'يمكنك فقط تقييم المنتجات التي قمت بشرائها.' : 'You can only review products you have purchased.'}
              </p>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
