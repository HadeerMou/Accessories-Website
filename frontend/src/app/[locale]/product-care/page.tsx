import HelpLayout from '@/components/HelpLayout';
import { useTranslations } from 'next-intl';

export default function ProductCarePage() {
  const t = useTranslations('ProductCare');
  const help = useTranslations('Help');

  return (
    <HelpLayout title={help('productCareTitle')}>
      <p>{t('intro')}</p>
      <h3 className="font-serif text-2xl text-[#2C2A28] mt-8 mb-4">{t('jewelryTitle')}</h3>
      <p>{t('jewelryText')}</p>
      <h3 className="font-serif text-2xl text-[#2C2A28] mt-8 mb-4">{t('cleaningTitle')}</h3>
      <p>{t('cleaningText')}</p>
    </HelpLayout>
  );
}
