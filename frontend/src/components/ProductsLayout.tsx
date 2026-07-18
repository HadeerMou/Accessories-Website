'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StoreProductGrid from '@/components/StoreProductGrid';
import { useTranslations } from 'next-intl';

export default function ProductsLayout({ collection }: { collection: 'women' | 'men' | 'sale' }) {
  const t = useTranslations('Catalog');
  return <main className="flex min-h-screen flex-col bg-[#FAF8F5]"><Header/><section className="mx-auto w-full max-w-7xl flex-1 px-8 py-16"><div className="mb-12 flex flex-wrap items-end justify-between gap-5"><div><div className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[#927345]">Aura collection</div><h1 className="font-serif text-5xl capitalize text-[#2C2A28] md:text-7xl">{t(`${collection}Title`)}</h1></div><p className="max-w-xs text-xs leading-5 text-black/42">Objects of intention, designed in Cairo and made to become part of your everyday ritual.</p></div><StoreProductGrid collection={collection}/></section><Footer/></main>;
}
