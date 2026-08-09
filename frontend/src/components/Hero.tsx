import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Hero() {
  const t = useTranslations('Hero');

  return (
    <section className="relative w-full h-[65vh] md:h-[85vh] flex">
      {/* Split Image Background */}
      <div className="w-1/2 h-full relative overflow-hidden">
        <Image 
          src="/hero1.png" 
          alt={t('leftImageAlt')}
          fill 
          className="object-cover object-center"
          priority
        />
      </div>
      <div className="w-1/2 h-full relative overflow-hidden">
        <Image 
          src="/hero2.png" 
          alt={t('rightImageAlt')}
          fill 
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[7rem] text-white font-serif mb-5 leading-tight drop-shadow-lg tracking-wide">
          {t('title')}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white/90 font-sans mb-8 max-w-lg mx-auto drop-shadow-md">
          {t('subtitle')}
        </p>
        <button className="bg-white/90 backdrop-blur-sm text-[#2C2A28] px-6 py-2.5 rounded-full text-sm tracking-widest font-sans uppercase hover:bg-white transition-colors duration-300">
          {t('shopNow')}
        </button>
      </div>
    </section>
  );
}
