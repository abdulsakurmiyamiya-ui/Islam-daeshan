import React, { useState, useMemo } from 'react';
import { DICTIONARY_TERMS } from '../data/dictionaryData';
import { DictionaryTerm } from '../types';
import {
  GraduationCap,
  Search,
  Volume2,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';

interface DictionaryScreenProps {
  onBack: () => void;
  initialTerm?: string | null;
}

export const DictionaryScreen: React.FC<DictionaryScreenProps> = ({
  onBack,
  initialTerm = null,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialTerm || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<DictionaryTerm | null>(() => {
    if (initialTerm) {
      return (
        DICTIONARY_TERMS.find(
          (item) =>
            item.term.toLowerCase() === initialTerm.toLowerCase() ||
            item.arabicScript === initialTerm
        ) || DICTIONARY_TERMS[0]
      );
    }
    return DICTIONARY_TERMS[0];
  });

  const categories = useMemo(() => {
    const set = new Set(DICTIONARY_TERMS.map((item) => item.category));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredTerms = useMemo(() => {
    return DICTIONARY_TERMS.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.term.toLowerCase().includes(q) ||
        item.arabicScript.includes(q) ||
        item.transliteration.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const pronounceTerm = (term: DictionaryTerm) => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(term.arabicScript);
        utter.lang = 'ar-SA';
        window.speechSynthesis.speak(utter);
      }
    } catch (e) {
      console.warn('Pronunciation error:', e);
    }
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
              <GraduationCap className="w-5 h-5 text-emerald-600" />
              इस्लामिक शब्दावली तथा कोष (Dictionary)
            </h1>
            <p className="text-[11px] font-book text-stone-500 dark:text-stone-400">
              मूल अरबी शब्द, शाब्दिक अर्थ र दार्शनिक सन्दर्भ
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Search Bar & Categories */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="शब्द खोज्नुहोस् (उदा. तौहीद, जिहाद, काफिर, तक्वा, हलाल)..."
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
                {cat === 'all' ? 'सबै शब्दावली' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Terms List */}
          <div className="md:col-span-5 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filteredTerms.map((term) => {
              const isSelected = selectedTerm?.id === term.id;
              return (
                <div
                  key={term.id}
                  onClick={() => setSelectedTerm(term)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#064e3b] text-[#fef3c7] border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm">
                        {term.term}
                      </span>
                      <span
                        className={`text-[11px] font-book px-1.5 py-0.2 rounded ${
                          isSelected ? 'bg-white/20 text-[#fde68a]' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                        }`}
                      >
                        {term.transliteration}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 line-clamp-1 font-book ${
                        isSelected ? 'text-[#fef3c7]/80' : 'text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {term.meaning}
                    </p>
                  </div>

                  <span
                    dir="rtl"
                    className={`text-lg font-arabic font-semibold ${
                      isSelected ? 'text-[#fbbf24]' : 'text-emerald-800 dark:text-emerald-400'
                    }`}
                  >
                    {term.arabicScript}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed View */}
          <div className="md:col-span-7">
            {selectedTerm ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border-2 border-amber-500/40 shadow-sm sticky top-20">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-heading font-extrabold text-stone-900 dark:text-stone-100">
                        {selectedTerm.term}
                      </h2>
                      <button
                        onClick={() => pronounceTerm(selectedTerm)}
                        title="अरबी उच्चारण सुन्नुहोस्"
                        className="p-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-stone-500 font-book">
                      लिप्यन्तरण: {selectedTerm.transliteration} • श्रेणी: {selectedTerm.category}
                    </span>
                  </div>

                  <div dir="rtl" className="text-3xl font-arabic text-emerald-800 dark:text-emerald-400 font-bold">
                    {selectedTerm.arabicScript}
                  </div>
                </div>

                {/* Literal Meaning Card */}
                <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border-l-4 border-amber-600">
                  <span className="text-xs font-heading font-bold text-amber-900 dark:text-amber-400 block mb-0.5">
                    शाब्दिक तथा मौलिक अर्थ:
                  </span>
                  <p className="text-sm font-book font-medium text-stone-800 dark:text-stone-200">
                    {selectedTerm.meaning}
                  </p>
                </div>

                {/* Detailed Conceptual Explanation */}
                <div className="mb-4">
                  <span className="text-xs font-heading font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    दार्शनिक तथा व्यावहारिक व्याख्या:
                  </span>
                  <p className="text-xs sm:text-sm font-book text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                    {selectedTerm.detailedExplanation}
                  </p>
                </div>

                {/* Quranic References */}
                {selectedTerm.references && (
                  <div className="p-3.5 rounded-xl bg-emerald-700/5 dark:bg-emerald-950/20 border border-emerald-600/30">
                    <span className="text-xs font-heading font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      कुरआन तथा प्रमाणिक सन्दर्भ
                    </span>
                    <p className="text-xs sm:text-sm font-book italic text-stone-800 dark:text-stone-200">
                      {selectedTerm.references}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-stone-400 font-book border border-dashed rounded-2xl">
                शब्दावली विवरण हेर्न सूचीबाट कुनै शब्द छान्नुहोस्।
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
