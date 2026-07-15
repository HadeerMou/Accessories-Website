import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslations } from 'next-intl';

export default function CartPage() {
  const t = useTranslations('EmptyStates');

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <section className="w-full max-w-6xl mx-auto px-8 py-24 flex-1">
        <h1 className="text-4xl md:text-5xl font-serif text-[#2C2A28] mb-8">{t('cartTitle')}</h1>
        <p className="font-sans text-[#2C2A28]/70 max-w-2xl">
          {t('cartText')}
        </p>
      </section>

      <Footer />
    </main>
  );
}
