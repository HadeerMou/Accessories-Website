import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('Home');
  const format = useFormatter();

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      <Hero />
      <ProductGrid />
      
      {/* Decorative Text Section */}
      <section className="w-full py-10 sm:py-12 overflow-hidden">
        <h2 className="text-[5rem] md:text-[8rem] lg:text-[10rem] font-serif text-[#6C7A63] whitespace-nowrap opacity-80 -ml-10">
          {t('decorativeText')}
        </h2>
      </section>

      {/* Categories Split Section */}
      <section className="w-full max-w-[1400px] mx-auto px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-[70vh]">
        <div className="relative w-full min-h-[320px] md:h-full group overflow-hidden cursor-pointer">
          <Image src="/cat_rings.png" alt={t('ringsAlt')} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
          <div className="absolute bottom-12 inset-x-0 flex justify-center items-end">
            <h3 className="text-4xl md:text-6xl text-white font-serif tracking-wide drop-shadow-md">{t('rings')}</h3>
            <span className="text-white ms-2 mb-4 text-sm font-sans drop-shadow-md">({format.number(18)})</span>
          </div>
        </div>
        <div className="relative w-full min-h-[320px] md:h-full group overflow-hidden cursor-pointer">
          <Image src="/cat_necklaces.png" alt={t('necklacesAlt')} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
          <div className="absolute bottom-12 inset-x-0 flex justify-center items-end">
            <h3 className="text-4xl md:text-6xl text-white font-serif tracking-wide drop-shadow-md">{t('necklaces')}</h3>
            <span className="text-white ms-2 mb-4 text-sm font-sans drop-shadow-md">({format.number(22)})</span>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="w-full bg-[#2a2a22] text-[#FAF8F5] py-16 sm:py-20 px-6 sm:px-8 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif mb-6 sm:mb-8 leading-tight">{t('storyTitle')}</h2>
            <p className="font-sans opacity-80 max-w-md leading-relaxed text-sm sm:text-base">
              {t('storyText')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="aspect-square bg-[#FAF8F5]/10 rounded-sm"></div>
            <div className="aspect-square bg-[#FAF8F5]/20 rounded-sm"></div>
            <div className="aspect-square bg-[#FAF8F5]/5 rounded-sm"></div>
            <div className="aspect-square bg-[#FAF8F5]/15 rounded-sm"></div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
