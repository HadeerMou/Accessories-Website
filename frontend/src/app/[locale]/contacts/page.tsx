import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslations } from 'next-intl';

export default function ContactsPage() {
  const t = useTranslations('Contacts');

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      
      <section className="w-full max-w-4xl mx-auto px-8 py-24">
        <h1 className="text-5xl md:text-7xl font-serif text-[#2C2A28] mb-12 text-center">{t('title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-serif text-[#2C2A28] mb-6">{t('locationTitle')}</h2>
            <p className="font-sans text-[#2C2A28]/80 leading-relaxed mb-8">
              {t('addressLine1')}<br />
              {t('addressLine2')}
            </p>
            <h2 className="text-2xl font-serif text-[#2C2A28] mb-6">{t('infoTitle')}</h2>
            <p className="font-sans text-[#2C2A28]/80 leading-relaxed">
              {t('emailLabel')}: hello@aura-accessories.com<br />
              {t('phoneLabel')}: +62 812 3456 7890
            </p>
          </div>
          
          <form className="flex flex-col space-y-6 font-sans">
            <div>
              <label htmlFor="contact-name" className="block text-sm uppercase tracking-widest text-[#2C2A28] mb-2">{t('name')}</label>
              <input id="contact-name" type="text" className="w-full border-b border-[#2C2A28]/30 bg-transparent py-2 outline-none focus:border-[#2C2A28] transition-colors" />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm uppercase tracking-widest text-[#2C2A28] mb-2">{t('email')}</label>
              <input id="contact-email" type="email" className="w-full border-b border-[#2C2A28]/30 bg-transparent py-2 outline-none focus:border-[#2C2A28] transition-colors" />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm uppercase tracking-widest text-[#2C2A28] mb-2">{t('message')}</label>
              <textarea id="contact-message" rows={4} className="w-full border-b border-[#2C2A28]/30 bg-transparent py-2 outline-none focus:border-[#2C2A28] transition-colors resize-none"></textarea>
            </div>
            <button type="button" className="bg-[#2C2A28] text-[#FAF8F5] py-3 px-8 uppercase tracking-widest text-sm hover:bg-[#3c362a] transition-colors self-start mt-4">
              {t('sendMessage')}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
