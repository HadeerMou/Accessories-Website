import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('Footer');
  const navigation = useTranslations('Navigation');
  
  return (
    <footer className="w-full bg-[#3c362a] text-[#FAF8F5] py-12 md:py-16 px-6 sm:px-8 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif uppercase tracking-widest">Aura</h2>
          <p className="font-sans text-sm sm:text-base opacity-80 max-w-sm">
            {t('description')}
          </p>
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest opacity-60">{t('newsletter')}</span>
            <div className="flex flex-col gap-3 border-b border-[#FAF8F5]/30 pb-2 sm:flex-row sm:items-center">
              <input type="email" placeholder={t('email')} aria-label={t('email')} className="bg-transparent border-none outline-none flex-1 text-sm placeholder:text-[#FAF8F5]/40" />
              <button className="text-xs uppercase tracking-widest text-[#FAF8F5] hover:text-white transition-colors">
                {t('send')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 font-sans text-sm">
          <h3 className="font-serif text-lg">{t('shop')}</h3>
          <Link href="/women" className="opacity-80 hover:opacity-100 transition-opacity">{navigation('women')}</Link>
          <Link href="/men" className="opacity-80 hover:opacity-100 transition-opacity">{navigation('men')}</Link>
          <Link href="/sale" className="opacity-80 hover:opacity-100 transition-opacity">{navigation('sale')}</Link>
        </div>

        <div className="flex flex-col space-y-4 font-sans text-sm">
          <h3 className="font-serif text-lg">{t('help')}</h3>
          <Link href="/shipping" className="opacity-80 hover:opacity-100 transition-opacity">{t('shipping')}</Link>
          <Link href="/returns" className="opacity-80 hover:opacity-100 transition-opacity">{t('returns')}</Link>
          <Link href="/size-guide" className="opacity-80 hover:opacity-100 transition-opacity">{t('sizeGuide')}</Link>
          <Link href="/product-care" className="opacity-80 hover:opacity-100 transition-opacity">{t('productCare')}</Link>
          <Link href="/contacts" className="opacity-80 hover:opacity-100 transition-opacity">{t('contactUs')}</Link>
          <Link href="/cart" className="opacity-80 hover:opacity-100 transition-opacity">{navigation('cart')}</Link>
          <Link href="/favorites" className="opacity-80 hover:opacity-100 transition-opacity">{navigation('favorites')}</Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#FAF8F5]/20 flex flex-col gap-3 md:flex-row md:justify-between md:items-center text-xs opacity-60 font-sans">
        <p>{t('copyright')}</p>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Link href="/privacy" className="opacity-80 hover:opacity-100 transition-opacity">{t('privacy')}</Link>
          <Link href="/terms" className="opacity-80 hover:opacity-100 transition-opacity">{t('terms')}</Link>
        </div>
      </div>
    </footer>
  );
}
