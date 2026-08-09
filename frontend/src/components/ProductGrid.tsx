'use client';

import { useTranslations } from 'next-intl';
import StoreProductGrid from './StoreProductGrid';
import { Link } from '@/i18n/routing';

export default function ProductGrid() {
  const t = useTranslations('Products');
  return <section className="mx-auto w-full max-w-7xl px-4 sm:px-8 py-16 sm:py-24"><div className="mb-12 flex items-center justify-between border-t border-[#2C2A28]/20 pt-6"><div className="flex items-center gap-2 text-xs uppercase tracking-widest"><span className="size-1.5 rounded-full bg-[#2C2A28]"/>{t('newArrivals')}</div></div><StoreProductGrid limit={4} compact/><div className="mt-12 flex justify-center"><Link href="/women" className="rounded-full border border-[#2C2A28] px-10 py-3 text-xs uppercase tracking-widest transition hover:bg-[#2C2A28] hover:text-[#FAF8F5]">{t('shopAll')}</Link></div></section>;
}
