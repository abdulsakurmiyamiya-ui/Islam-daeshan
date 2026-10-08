import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Compass, ShieldCheck, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { showToast } from '../utils/toast';

interface CoverScreenProps {
  onOpenBook: () => void;
  onOpenTOC: () => void;
  onOpenFAQ: () => void;
}

export const CoverScreen: React.FC<CoverScreenProps> = ({
  onOpenBook,
  onOpenTOC,
  onOpenFAQ,
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();

  const handleInstall = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    if (isIOS) {
      showToast('Safari मा Share थिचेर “Add to Home Screen” छान्नुहोस्।', 'info');
    } else if (isAndroid) {
      showToast('Chrome/Edge को menu खोल्नुहोस् र “Install app” वा “Add to Home screen” छान्नुहोस्।', 'info');
    } else {
      showToast('Browser को menu बाट “Install app” वा “Add to Home screen” विकल्प प्रयोग गर्नुहोस्।', 'info');
    }
  };

  return (
    <div id="cover-screen-container" className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#021810] overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#047857]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#d97706]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Luxury Book Cover Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md sm:max-w-lg md:max-w-xl rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(217,119,6,0.2)] border-4 border-[#d97706]/70 bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#011a14] overflow-hidden text-center text-[#fef3c7]"
      >
        {/* Ornate Islamic Geometric Border Frame */}
        <div className="absolute inset-2 sm:inset-3 border border-[#f59e0b]/40 rounded-xl pointer-events-none z-20">
          {/* Corner geometric arabesque accents */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#fbbf24]" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#fbbf24]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#fbbf24]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#fbbf24]" />
        </div>

        {/* Book Spine Texture Shadow on the Left */}
        <div className="absolute top-0 left-0 bottom-0 w-4 sm:w-5 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-20 border-r border-amber-500/20" />

        {/* Hero Background Artwork */}
        <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
          <img
            src="/src/assets/images/islam_darshan_cover_1788419236162.jpg"
            alt="इस्लाम दर्शन आवरण कला"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-1000"
          />
          {/* Gradient Overlay for seamless blending with deep emerald */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-[#022c22]/50 to-transparent" />
          
          {/* Top Arabic Calligraphy Ribbon */}
          <div className="absolute top-4 left-0 right-0 z-10 flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-[#f59e0b]/50 shadow-lg">
              <span className="text-[#fbbf24] text-xl sm:text-2xl font-arabic tracking-wide">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>
            </div>
          </div>

          {/* Floating Calligraphy Symbol */}
          <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d97706] to-[#78350f] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#064e3b] flex items-center justify-center">
                <span className="text-xl sm:text-2xl text-[#fbbf24] font-arabic font-bold">اقرأ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 px-6 sm:px-8 py-6 sm:py-8 flex flex-col items-center">
          {/* Book Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-heading font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#fef08a] via-[#f59e0b] to-[#fde047] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
          >
            इस्लाम दर्शन
          </motion.h1>

          {/* Subtitle / Welcome */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-2 text-base sm:text-lg font-book font-medium text-[#fde68a] tracking-wider"
          >
            इस्लाम अध्ययनमा स्वागत छ
          </motion.p>

          {/* Decorative Gold Geometric Ornament Divider */}
          <div className="my-3 flex items-center justify-center gap-3 w-48 text-[#d97706]">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#f59e0b]" />
            <span className="text-sm">۞ ۝ ۞</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#f59e0b]" />
          </div>

          {/* Key Proposition Motto */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm sm:text-base font-book text-[#e2e8f0]/90 max-w-md leading-relaxed px-2 font-light"
          >
            "प्रश्न गर्नुहोस्। प्रमाण हेर्नुहोस्। अनि आफैं निर्णय गर्नुहोस्।"
          </motion.p>

          {/* Authority Credential Badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[#cbd5e1]/80">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#064e3b]/80 border border-[#047857]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#fbbf24]" />
              कुरआन र सही हदीसमा आधारित
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#064e3b]/80 border border-[#047857]">
              <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
              ३२ गहन शोध अध्यायहरू
            </span>
          </div>

          {/* Main Gold Start Reading Action Button */}
          <motion.button
            id="start-reading-cover-btn"
            onClick={onOpenBook}
            whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)' }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 w-full max-w-xs py-3.5 px-6 rounded-xl font-heading font-bold text-base sm:text-lg tracking-wide text-[#0f291e] bg-gradient-to-r from-[#fef08a] via-[#f59e0b] to-[#d97706] shadow-lg border border-[#fef3c7]/60 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
          >
            <BookOpen className="w-5 h-5 text-[#064e3b]" />
            <span>यहाँबाट सुरु गर्नुहोस् →</span>
          </motion.button>

          {/* Install App */}
          {!isInstalled && (
            <button
              id="install-app-cover-btn"
              onClick={handleInstall}
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#f59e0b]/50 bg-black/20 text-[#fde68a] hover:bg-[#064e3b] transition text-xs sm:text-sm font-heading"
            >
              <Download className="w-4 h-4 text-[#fbbf24]" />
              <span>{isInstallable ? 'एप Install गर्नुहोस्' : 'फोनमा Install गर्ने तरिका'}</span>
            </button>
          )}

          {/* Secondary Quick Access Links */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs sm:text-sm font-book text-[#fef3c7]/70">
            <button
              id="open-toc-cover-btn"
              onClick={onOpenTOC}
              className="hover:text-[#fde047] transition-colors underline decoration-amber-500/40 underline-offset-4 cursor-pointer"
            >
              विषय-सूची हेर्नुहोस् (TOC)
            </button>
            <span className="text-[#d97706]">•</span>
            <button
              id="open-faq-cover-btn"
              onClick={onOpenFAQ}
              className="hover:text-[#fde047] transition-colors underline decoration-amber-500/40 underline-offset-4 cursor-pointer flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              मनमा उठ्ने प्रश्नहरू (FAQ)
            </button>
          </div>
        </div>

        {/* Subtle Bottom Gold Trim */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#78350f] via-[#f59e0b] to-[#78350f]" />
      </motion.div>
    </div>
  );
};
