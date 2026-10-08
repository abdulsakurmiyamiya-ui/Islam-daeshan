import React, { useState, useMemo } from 'react';
import { FAQ_LIST, FAQItem } from '../data/faqData';
import {
  HelpCircle,
  Search,
  BookOpen,
  History,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQScreenProps {
  onBack: () => void;
  onOpenChapter: (chapterId: string) => void;
}

export const FAQScreen: React.FC<FAQScreenProps> = ({
  onBack,
  onOpenChapter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(FAQ_LIST[0]?.id || null);

  const categories = useMemo(() => {
    const set = new Set(FAQ_LIST.map((item) => item.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredFAQs = useMemo(() => {
    return FAQ_LIST.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.question.toLowerCase().includes(q) ||
        item.shortAnswer.toLowerCase().includes(q) ||
        item.fullAnswer.toLowerCase().includes(q) ||
        item.scholarlyContext.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#021810] text-stone-900 dark:text-stone-100 flex flex-col font-book transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-[#021810]/85 border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              मनमा उठ्ने वास्तविक प्रश्नहरू (FAQ)
            </h1>
            <p className="text-[11px] font-book text-stone-500 dark:text-stone-400">
              संकोच विना गरिने प्रश्नहरूको सीधा, ऐतिहासिक र प्रमाणिक उत्तर
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Intro Message Card */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/15 via-[#064e3b]/10 to-amber-500/10 border border-[#d97706]/40">
          <p className="text-xs sm:text-sm font-book text-stone-800 dark:text-stone-200 leading-relaxed">
            <strong className="text-emerald-900 dark:text-emerald-300 font-heading">खुला मन र प्रमाणिक अध्ययन: </strong>
            यहाँ गैर-मुस्लिम पाठकहरूद्वारा प्रायः सोधिने सबैभन्दा संवेदनशील प्रश्नहरूको उत्तर कुरआन, सहीह हदीस र प्रामाणिक इतिहासको आधारमा संकलन गरिएको छ। कुनै पनि विषयमा शंका भए निर्धक्क भई प्रश्न सोध्न सक्नुहुन्छ।
          </p>
        </div>

        {/* Search & Category Tabs */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="प्रश्न वा विषय खोज्नुहोस् (उदा. तरबार, महिला अधिकार, जिहाद, बहुविवाह, विज्ञान)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-book text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d97706] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-book scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#064e3b] text-[#fef3c7] font-semibold shadow-xs'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                {cat === 'all' ? 'सबै प्रश्नहरू' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => {
            const isExpanded = expandedId === faq.id;

            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-xs transition-all"
              >
                {/* Header Question Bar */}
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-[#b45309] dark:text-[#fde68a] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div>
                      <h2 className="font-heading font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                        {faq.question}
                      </h2>
                      <span className="inline-block mt-1 text-[11px] font-book px-2 py-0.5 rounded bg-emerald-700/10 text-emerald-800 dark:text-emerald-300">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-1 rounded-full text-stone-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Collapsible Answer Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-stone-100 dark:border-stone-800 px-4 sm:px-6 py-5 space-y-4"
                    >
                      {/* Short summary */}
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border-l-4 border-amber-600 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-book font-medium leading-relaxed">
                        {faq.shortAnswer}
                      </div>

                      {/* Detailed explanation */}
                      <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-book leading-relaxed whitespace-pre-line">
                        {faq.fullAnswer}
                      </div>

                      {/* Quran Evidence */}
                      {faq.quranAyah && (
                        <div className="p-4 rounded-xl bg-emerald-700/5 dark:bg-emerald-950/20 border border-emerald-600/30">
                          <span className="text-xs font-heading font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                            कुरआनको प्रमाण
                          </span>
                          {faq.quranAyah.arabic && (
                            <div dir="rtl" className="text-lg font-arabic text-emerald-900 dark:text-emerald-300 my-1 text-right">
                              {faq.quranAyah.arabic}
                            </div>
                          )}
                          <p className="text-xs sm:text-sm font-book italic text-stone-800 dark:text-stone-200">
                            "{faq.quranAyah.translation}"
                          </p>
                          <span className="text-[11px] text-stone-500 block mt-1">
                            — {faq.quranAyah.surahName} [सूरह {faq.quranAyah.surahNumber}:{faq.quranAyah.ayahNumber}]
                          </span>
                        </div>
                      )}

                      {/* Hadith Reference */}
                      {faq.hadith && (
                        <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                          <span className="text-xs font-heading font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 mb-1">
                            <History className="w-3.5 h-3.5 text-amber-600" />
                            हदीसको प्रमाण: {faq.hadith.source} (हदीस नं. {faq.hadith.hadithNumber})
                          </span>
                          <p className="text-xs text-stone-600 dark:text-stone-300 font-book leading-relaxed italic">
                            "{faq.hadith.text}"
                          </p>
                        </div>
                      )}

                      {/* Scholars' View */}
                      {faq.scholarlyContext && (
                        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                          <span className="text-xs font-heading font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                            विद्वानहरूको सन्दर्भ र दृष्टिकोण
                          </span>
                          <p className="text-xs text-stone-700 dark:text-stone-300 font-book leading-relaxed">
                            {faq.scholarlyContext}
                          </p>
                        </div>
                      )}

                      {/* Open Related Chapter */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => onOpenChapter('ch-1')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] transition cursor-pointer"
                        >
                          <span>सम्बन्धित विस्तृत अध्याय पढ्नुहोस्</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
