import HelpLayout from '@/components/HelpLayout';
import { useTranslations } from 'next-intl';

export default function ReturnsPage() {
  const t = useTranslations('Returns');
  const help = useTranslations('Help');

  return (
    <HelpLayout title={help('returnsTitle')}>
      <p>{t('intro')}</p>
      <h3 className="font-serif text-2xl text-[#2C2A28] mt-8 mb-4">{t('conditions')}</h3>
      <ul className="list-disc ps-5 space-y-2">
        <li>{t('unworn')}</li>
        <li>{t('finalSale')}</li>
        <li>{t('earrings')}</li>
      </ul>
    </HelpLayout>
  );
}
