import HelpLayout from '@/components/HelpLayout';
import { useTranslations } from 'next-intl';

export default function SizeGuidePage() {
  const t = useTranslations('SizeGuide');
  const help = useTranslations('Help');

  return (
    <HelpLayout title={help('sizeGuideTitle')}>
      <p>{t('intro')}</p>
      <h3 className="font-serif text-2xl text-[#2C2A28] mt-8 mb-4">{t('ringsTitle')}</h3>
      <p>{t('ringsText')}</p>
      <h3 className="font-serif text-2xl text-[#2C2A28] mt-8 mb-4">{t('necklacesTitle')}</h3>
      <p>{t('necklacesText')}</p>
    </HelpLayout>
  );
}
