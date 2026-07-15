import { useFormatter, useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';

const products = [
  { id: 1, nameKey: "heartRing", price: 80, bg: "bg-[#e5e0d8]" },
  { id: 2, nameKey: "baliBuddhaPendant", price: 40, bg: "bg-[#f0ebe1]" },
  { id: 3, nameKey: "mariBracelet", price: 70, bg: "bg-[#e8e4db]" },
  { id: 4, nameKey: "starfishEarrings", price: 35, bg: "bg-[#f5f1e8]" }
];

export default function ProductGrid() {
  const t = useTranslations('Products');
  const format = useFormatter();

  return (
    <section className="w-full max-w-7xl mx-auto px-8 py-24">
      <div className="flex items-center justify-between border-t border-[#2C2A28]/20 pt-6 mb-12">
        <div className="flex space-x-8 rtl:space-x-reverse font-sans text-xs tracking-widest uppercase">
          <button className="flex items-center space-x-2 rtl:space-x-reverse text-[#2C2A28]">
            <span className="w-1.5 h-1.5 bg-[#2C2A28] rounded-full"></span>
            <span>{t('newArrivals')}</span>
          </button>
          <button className="text-[#2C2A28]/50 hover:text-[#2C2A28] transition-colors">
            {t('bestsellers')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group cursor-pointer">
            <div className={`relative w-full aspect-[4/5] ${product.bg} mb-4 overflow-hidden flex items-center justify-center`}>
              {/* Placeholder for actual product image */}
              <div className="text-[#2C2A28]/30 font-serif text-2xl group-hover:scale-105 transition-transform duration-700">
                Aura
              </div>
              <button aria-label={t('addToFavorites', {product: t(product.nameKey)})} className="absolute top-4 right-4 rtl:right-auto rtl:left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/50 p-2 rounded-full hover:bg-white">
                <Heart size={16} className="text-[#2C2A28]" />
              </button>
            </div>
            <div className="flex justify-between items-center text-sm font-sans">
              <h3 className="text-[#2C2A28]">{t(product.nameKey)}</h3>
              <span className="text-[#2C2A28]/70">{format.number(product.price, {style: 'currency', currency: 'USD', maximumFractionDigits: 0})}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-16">
        <button className="border border-[#2C2A28] text-[#2C2A28] px-10 py-3 rounded-full text-xs tracking-widest font-sans uppercase hover:bg-[#2C2A28] hover:text-[#FAF8F5] transition-colors duration-300">
          {t('shopAll')}
        </button>
      </div>
    </section>
  );
}
