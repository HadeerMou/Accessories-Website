"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Heart, LogOut, ShoppingBag, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AuthModal from './AuthModal';
import { clearCustomerSession, customerSession, type CustomerSession } from '@/lib/api';
import { wishlistCount } from '@/lib/wishlist';

export default function Header() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [authOpen,setAuthOpen]=useState(false);
  const [customer,setCustomer]=useState<CustomerSession|null>(null);
  const [favoritesCount,setFavoritesCount]=useState(0);
  useEffect(()=>{const sync=()=>setCustomer(customerSession());const syncWishlist=()=>setFavoritesCount(wishlistCount());const open=()=>setAuthOpen(true);const timer=window.setTimeout(()=>{sync();syncWishlist();},0);window.addEventListener('aura-auth-change',sync);window.addEventListener('aura-open-auth',open);window.addEventListener('aura-wishlist-change',syncWishlist);window.addEventListener('storage',syncWishlist);return()=>{window.clearTimeout(timer);window.removeEventListener('aura-auth-change',sync);window.removeEventListener('aura-open-auth',open);window.removeEventListener('aura-wishlist-change',syncWishlist);window.removeEventListener('storage',syncWishlist);};},[]);

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
          <Link href="/favorites" aria-label={t('favorites')} className="relative hover:opacity-70 transition-opacity"><Heart size={18} />{favoritesCount>0&&<span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#8b5140] px-1 text-[9px] font-semibold text-white">{favoritesCount}</span>}</Link>
          <Link href="/cart" aria-label={t('cart')} className="hover:opacity-70 transition-opacity"><ShoppingBag size={18} /></Link>
          {customer ? <div className="group relative"><Link href="/profile" className="flex items-center gap-2 text-xs"><span className="grid size-8 place-items-center rounded-full bg-[#26372f] text-[10px] font-bold text-white">{customer.fullName.split(' ').map(v => v[0]).join('').slice(0, 2)}</span></Link><div className="invisible absolute right-0 top-full w-48 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 rtl:left-0 rtl:right-auto"><div className="rounded-xl border border-black/8 bg-[#faf8f5] p-3 shadow-xl"><div className="truncate text-xs font-semibold">{customer.fullName}</div><div className="mt-1 truncate text-[10px] text-black/40">{customer.email}</div><Link href="/profile" className="mt-3 block text-[11px] font-semibold text-[#2C2A28] hover:text-[#121912]">My account</Link><button onClick={clearCustomerSession} className="mt-3 flex w-full items-center gap-2 border-t border-black/7 pt-3 text-[11px] text-black/55"><LogOut size={13}/> Sign out</button></div></div></div> : <button onClick={() => setAuthOpen(true)} aria-label="Sign in" className="hover:opacity-65"><UserRound size={18} /></button>}
        </div>
      </div>
      {authOpen && createPortal(<AuthModal close={() => setAuthOpen(false)} />, document.body)}
    </header>
  );
}
