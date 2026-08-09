import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('Terms');

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <section className="w-full max-w-5xl mx-auto px-8 py-24">
        <h1 className="text-5xl md:text-7xl font-serif text-[#2C2A28] mb-10">{t('title')}</h1>
        <div className="space-y-10 text-[#2C2A28]/90 font-sans">
          <p>{t('intro')}</p>

          <div>
            <h2 className="text-2xl font-serif text-[#2C2A28] mb-4">{t('useTitle')}</h2>
            <p>{t('useText')}</p>
          </div>

          <div>
            <h2 className="text-2xl font-serif text-[#2C2A28] mb-4">{t('ordersTitle')}</h2>
            <p>{t('ordersText')}</p>
          </div>

          <div>
            <h2 className="text-2xl font-serif text-[#2C2A28] mb-4">{t('liabilityTitle')}</h2>
            <p>{t('liabilityText')}</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
