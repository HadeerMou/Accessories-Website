import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('Footer');
  const navigation = useTranslations('Navigation');
  
  return (
    <footer className="w-full bg-[#3c362a] text-[#FAF8F5] py-16 px-8 mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-4xl font-serif mb-6 uppercase tracking-widest">Aura</h2>
          <p className="font-sans text-sm opacity-70 mb-8 max-w-sm">
            {t('description')}
          </p>
          <div className="flex flex-col space-y-4">
            <span className="text-xs uppercase tracking-widest opacity-50">{t('newsletter')}</span>
            <div className="flex border-b border-[#FAF8F5]/30 pb-2">
              <input type="email" placeholder={t('email')} aria-label={t('email')} className="bg-transparent border-none outline-none flex-grow text-sm placeholder:text-[#FAF8F5]/30" />
              <button className="text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">{t('send')}</button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 font-sans text-sm">
          <h3 className="font-serif text-lg mb-2">{t('shop')}</h3>
          <Link href="/women" className="opacity-70 hover:opacity-100 transition-opacity">{navigation('women')}</Link>
          <Link href="/men" className="opacity-70 hover:opacity-100 transition-opacity">{navigation('men')}</Link>
          <Link href="/sale" className="opacity-70 hover:opacity-100 transition-opacity">{navigation('sale')}</Link>
        </div>

        <div className="flex flex-col space-y-4 font-sans text-sm">
          <h3 className="font-serif text-lg mb-2">{t('help')}</h3>
          <Link href="/shipping" className="opacity-70 hover:opacity-100 transition-opacity">{t('shipping')}</Link>
          <Link href="/returns" className="opacity-70 hover:opacity-100 transition-opacity">{t('returns')}</Link>
          <Link href="/size-guide" className="opacity-70 hover:opacity-100 transition-opacity">{t('sizeGuide')}</Link>
          <Link href="/product-care" className="opacity-70 hover:opacity-100 transition-opacity">{t('productCare')}</Link>
          <Link href="/contacts" className="opacity-70 hover:opacity-100 transition-opacity">{t('contactUs')}</Link>
          <Link href="/cart" className="opacity-70 hover:opacity-100 transition-opacity">{navigation('cart')}</Link>
          <Link href="/favorites" className="opacity-70 hover:opacity-100 transition-opacity">{navigation('favorites')}</Link>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#FAF8F5]/20 flex flex-col md:flex-row justify-between items-center text-xs opacity-50 font-sans">
        <p>{t('copyright')}</p>
        <div className="flex space-x-6 rtl:space-x-reverse mt-4 md:mt-0">
          <Link href="/">{t('privacy')}</Link>
          <Link href="/">{t('terms')}</Link>
        </div>
      </div>
    </footer>
  );
}
