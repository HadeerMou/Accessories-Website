"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Heart, ShoppingBag } from 'lucide-react';

export default function Header() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  return (
    <header className="w-full px-8 py-6 sticky top-0 bg-[#FAF8F5]/80 backdrop-blur-md z-50 animate-fade-in border-b border-[#2C2A28]/10">
      <div className="relative flex items-center justify-between">
        <nav className="flex space-x-8 rtl:space-x-reverse text-sm font-sans tracking-wide">
          <Link href="/women" className="hover:opacity-70 transition-opacity">{t('women')}</Link>
          <Link href="/men" className="hover:opacity-70 transition-opacity">{t('men')}</Link>
          <Link href="/sale" className="hover:opacity-70 transition-opacity">{t('sale')}</Link>
        </nav>

        <div className="absolute left-1/2 -translate-x-1/2 text-3xl font-serif tracking-widest uppercase">
          <Link href="/">Aura</Link>
        </div>

        <div className="flex items-center space-x-6 rtl:space-x-reverse text-sm font-sans tracking-wide">
          <Link href="/about" className="hover:opacity-70 transition-opacity hidden md:block">{t('about')}</Link>
          <Link href="/contacts" className="hover:opacity-70 transition-opacity hidden md:block">{t('contacts')}</Link>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Link href={pathname} locale="en" className="hover:opacity-70 transition-opacity">EN</Link>
            <span className="opacity-30">|</span>
            <Link href={pathname} locale="ar" className="hover:opacity-70 transition-opacity">AR</Link>
          </div>
          <Link href="/favorites" aria-label={t('favorites')} className="hover:opacity-70 transition-opacity"><Heart size={18} /></Link>
          <Link href="/cart" aria-label={t('cart')} className="hover:opacity-70 transition-opacity"><ShoppingBag size={18} /></Link>
        </div>
      </div>
    </header>
  );
}
