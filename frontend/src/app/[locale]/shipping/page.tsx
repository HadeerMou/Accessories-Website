import HelpLayout from '@/components/HelpLayout';
import { useTranslations } from 'next-intl';

export default function ShippingPage() {
  const t = useTranslations('Shipping');
  const help = useTranslations('Help');

  return (
    <HelpLayout title={help('shippingTitle')}>
      <p>{t('intro')}</p>
      <h3 className="font-serif text-2xl text-[#2C2A28] mt-8 mb-4">{t('domesticTitle')}</h3>
      <p>{t('domesticText')}</p>
      <h3 className="font-serif text-2xl text-[#2C2A28] mt-8 mb-4">{t('internationalTitle')}</h3>
      <p>{t('internationalText')}</p>
    </HelpLayout>
  );
}
