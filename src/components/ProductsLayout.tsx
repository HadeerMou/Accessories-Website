import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

const filters = ["All", "Rings", "Necklaces", "Bracelets", "Earrings"];

const generateProducts = (category: string) => {
  return Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    name: `${category} Item ${i + 1}`,
    price: `$${(Math.random() * 100 + 20).toFixed(0)}`,
    bg: i % 2 === 0 ? "bg-[#e5e0d8]" : "bg-[#f5f1e8]"
  }));
};

export default function ProductsLayout({ title, category }: { title: string, category: string }) {
  const products = generateProducts(category);

  return (
    <main className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />
      
      <section className="w-full max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-5xl md:text-7xl font-serif text-[#2C2A28] mb-12 capitalize">{title}</h1>
        
        {/* Simple Filters */}
        <div className="flex space-x-8 rtl:space-x-reverse mb-12 border-b border-[#2C2A28]/20 pb-4 overflow-x-auto whitespace-nowrap">
          {filters.map((filter, index) => (
            <button 
              key={filter} 
              className={`text-sm font-sans uppercase tracking-widest ${index === 0 ? 'text-[#2C2A28]' : 'text-[#2C2A28]/50 hover:text-[#2C2A28]'} transition-colors`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer mb-8">
              <div className={`relative w-full aspect-[4/5] ${product.bg} mb-4 overflow-hidden flex items-center justify-center`}>
                <div className="text-[#2C2A28]/30 font-serif text-2xl group-hover:scale-105 transition-transform duration-700">
                  Aura
                </div>
                <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/50 p-2 rounded-full hover:bg-white">
                  <Heart size={16} className="text-[#2C2A28]" />
                </button>
              </div>
              <div className="flex justify-between items-center text-sm font-sans">
                <h3 className="text-[#2C2A28]">{product.name}</h3>
                <span className="text-[#2C2A28]/70">{product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
