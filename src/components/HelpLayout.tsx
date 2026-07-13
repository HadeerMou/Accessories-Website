"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link, usePathname } from '@/i18n/routing';
import React from 'react';
import { useTranslations } from 'next-intl';

const helpLinks = [
  { href: '/shipping', labelKey: 'shippingTitle' },
  { href: '/returns', labelKey: 'returnsTitle' },
  { href: '/size-guide', labelKey: 'sizeGuideTitle' },
  { href: '/product-care', labelKey: 'productCareTitle' },
];

export default function HelpLayout({ title, children }: { title: string, children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('Help');

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      
      <section className="w-full max-w-7xl mx-auto px-8 py-24 flex flex-col md:flex-row gap-16">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <h2 className="text-sm font-sans uppercase tracking-widest text-[#2C2A28] mb-8 border-b border-[#2C2A28]/20 pb-4">
            {t('center')}
          </h2>
          <nav className="flex flex-col space-y-4 font-sans text-sm">
            {helpLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`${isActive ? 'text-[#2C2A28] font-medium' : 'text-[#2C2A28]/60 hover:text-[#2C2A28]'} transition-colors`}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <article className="flex-1 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2C2A28] mb-12">{title}</h1>
          <div className="font-sans text-[#2C2A28]/80 leading-relaxed space-y-6">
            {children}
          </div>
        </article>
      </section>

      <Footer />
    </main>
  );
}
