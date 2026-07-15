import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('About');

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <section className="w-full max-w-4xl mx-auto px-8 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-[#2C2A28] mb-8">{t('title')}</h1>
        <p className="text-lg md:text-xl font-sans text-[#2C2A28]/80 leading-relaxed mb-16">
          {t('intro')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="aspect-[3/4] bg-[#e5e0d8] relative overflow-hidden flex items-center justify-center">
            <span className="font-serif text-[#2C2A28]/30 text-2xl">{t('craftsmanship')}</span>
          </div>
          <div className="flex flex-col justify-center text-start">
            <h2 className="text-3xl font-serif text-[#2C2A28] mb-6">{t('processTitle')}</h2>
            <p className="font-sans text-[#2C2A28]/80 leading-relaxed">
              {t('processText')}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
