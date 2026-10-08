import React, { useState, useMemo } from 'react';
import { Chapter } from '../types';
import { StorageService } from '../services/storageService';
import { DAILY_AYAHS, DAILY_HADITHS, DAILY_THOUGHTS } from '../data/dailyData';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Bookmark,
  Heart,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  BookMarked,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';

interface TableOfContentsProps {
  chapters: Chapter[];
  onSelectChapter: (chapterId: string) => void;
  onOpenFAQ: () => void;
  onOpenDictionary: () => void;
  onOpenBookmarks: () => void;
  onOpenAdmin: () => void;
  onBackToCover: () => void;
  isAdmin?: boolean;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  chapters,
  onSelectChapter,
  onOpenFAQ,
  onOpenDictionary,
  onOpenBookmarks,
  onOpenAdmin,
  onBackToCover,
  isAdmin = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const readingProgress = StorageService.getReadingProgress();
  const bookmarks = StorageService.getBookmarks();
  const lastReadChapterId = StorageService.getLastReadChapterId();

  // Filter visible chapters: Regular readers only see published chapters.
  // Admins can see draft chapters and filter them.
  const visibleChapters = useMemo(() => {
    return chapters.filter(c => {
      if (!isAdmin) {
        return c.status === 'published';
      }
      if (statusFilter === 'published') return c.status === 'published';
      if (statusFilter === 'draft') return c.status === 'draft';
      return true;
    });
  }, [chapters, isAdmin, statusFilter]);

  const draftCount = useMemo(() => chapters.filter(c => c.status === 'draft').length, [chapters]);
  const publishedCount = useMemo(() => chapters.filter(c => c.status === 'published').length, [chapters]);

  const lastReadChapter = visibleChapters.find(c => c.id === lastReadChapterId) || visibleChapters[0];

  // Daily inspiration calculated based on day of month
  const today = new Date().getDate();
  const dailyAyah = DAILY_AYAHS[today % DAILY_AYAHS.length];
  const dailyHadith = DAILY_HADITHS[today % DAILY_HADITHS.length];
  const dailyThought = DAILY_THOUGHTS[today % DAILY_THOUGHTS.length];

  // Unique Series list from visible chapters
  const seriesList = useMemo(() => {
    const set = new Set(visibleChapters.map(c => c.series));
    return ['all', ...Array.from(set)];
  }, [visibleChapters]);

  // Filtered chapters
  const filteredChapters = useMemo(() => {
    return visibleChapters.filter(ch => {
      const matchesSearch =
        ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.arabicTitle.includes(searchQuery) ||
        `अध्याय ${ch.chapterNumber}`.includes(searchQuery) ||
        String(ch.chapterNumber).includes(searchQuery);

      const matchesSeries = selectedSeries === 'all' || ch.series === selectedSeries;

      return matchesSearch && matchesSeries;
    });
  }, [visibleChapters, searchQuery, selectedSeries]);

  // Calculate overall reading stats
  const completedCount = Object.values(readingProgress).filter(p => p.completed).length;
  const overallPercent = visibleChapters.length > 0 ? Math.round((completedCount / visibleChapters.length) * 100) : 0;

  return (
    <div id="toc-main-view" className="min-h-screen bg-[#fcfaf4] dark:bg-[#021810] text-stone-900 dark:text-stone-100 flex flex-col font-book transition-colors">
      {/* Top App Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-[#021810]/85 border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCover}
            title="आवरण पृष्ठमा जानुहोस्"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#064e3b] to-[#022c22] border border-amber-500/50 flex items-center justify-center text-[#fbbf24] shadow-sm hover:scale-105 transition cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-emerald-950 dark:text-emerald-300">
              इस्लाम दर्शन
            </h1>
            <p className="text-[11px] font-book text-stone-500 dark:text-stone-400">
              प्रमाणिक अध्ययन, शंका समाधान र दार्शनिक विश्लेषण
            </p>
          </div>
        </div>

        {/* Action quick links */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
          <button
            onClick={onOpenFAQ}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">जिज्ञासा (FAQ)</span>
          </button>

          <button
            onClick={onOpenDictionary}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">शब्दकोश</span>
          </button>

          <button
            onClick={onOpenBookmarks}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">बुकमार्क ({bookmarks.length})</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 transition flex items-center gap-1 cursor-pointer text-[11px]"
            title="Admin Dashboard & CMS"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
            <span className="hidden lg:inline">व्यवस्थापक</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Continue Reading Banner */}
        {lastReadChapter && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#022c22] to-[#011a14] text-[#fef3c7] shadow-xl border-2 border-amber-500/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1 text-xs font-heading font-semibold text-[#f59e0b] tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                पढाइ जारी राख्नुहोस्
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold mt-1 text-[#fef08a]">
                अध्याय {lastReadChapter.chapterNumber}: {lastReadChapter.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#fef3c7]/80 mt-0.5 line-clamp-1">
                {lastReadChapter.subtitle}
              </p>
            </div>

            <button
              onClick={() => onSelectChapter(lastReadChapter.id)}
              className="relative z-10 px-5 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm bg-gradient-to-r from-[#fef08a] to-[#f59e0b] text-[#064e3b] hover:shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>अहिले पढ्नुहोस्</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Daily Inspiration Bar (Daily Ayah / Daily Hadith / Daily Thought) */}
        <section className="mb-8 p-5 rounded-2xl bg-amber-500/5 dark:bg-stone-900/50 border border-amber-500/30">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 mb-3">
            <span className="text-xs font-heading font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              दैनिक प्रेरणा (Daily Inspiration)
            </span>
            <span className="text-[11px] text-stone-500">
              आजको दिन {today}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Daily Ayah */}
            <div className="p-3 rounded-xl bg-white/60 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                दैनिक कुरआन आयत
              </span>
              <p className="font-book text-stone-800 dark:text-stone-200 italic line-clamp-3">
                "{dailyAyah.nepali}"
              </p>
              <span className="text-[10px] text-stone-500 block mt-1.5">
                — {dailyAyah.reference}
              </span>
            </div>

            {/* Daily Hadith */}
            <div className="p-3 rounded-xl bg-white/60 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1">
                दैनिक सहीह हदीस
              </span>
              <p className="font-book text-stone-800 dark:text-stone-200 italic line-clamp-3">
                "{dailyHadith.nepali}"
              </p>
              <span className="text-[10px] text-stone-500 block mt-1.5">
                — {dailyHadith.source} (हदीस नं. {dailyHadith.hadithNumber})
              </span>
            </div>

            {/* Daily Philosophical Thought */}
            <div className="p-3 rounded-xl bg-white/60 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800">
              <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-1">
                दैनिक दार्शनिक चिन्तन
              </span>
              <p className="font-book text-stone-800 dark:text-stone-200 line-clamp-3">
                "{dailyThought.reflection}"
              </p>
              <span className="text-[10px] text-stone-500 block mt-1.5">
                — {dailyThought.title}
              </span>
            </div>
          </div>
        </section>

        {/* Search & Series Filters */}
        <div className="mb-6 space-y-3">
          {/* Live Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="toc-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="अध्याय, शीर्षक, विषय वा अरबी शब्द खोज्नुहोस्..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm font-book text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d97706] shadow-xs"
            />
          </div>

          {/* Series Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-book scrollbar-none">
            <span className="text-stone-400 text-xs shrink-0 mr-1">शृङ्खला:</span>
            {seriesList.map((series) => (
              <button
                key={series}
                onClick={() => setSelectedSeries(series)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer shrink-0 ${
                  selectedSeries === series
                    ? 'bg-[#064e3b] text-[#fef3c7] font-semibold shadow-xs'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                {series === 'all' ? `सबै अध्यायहरू (${visibleChapters.length})` : series}
              </button>
            ))}
          </div>

          {/* Admin Draft vs Published Status Quick Filter */}
          {isAdmin && draftCount > 0 && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] shrink-0">व्यवस्थापक फिल्टर:</span>
              <div className="inline-flex rounded-lg bg-stone-200/60 dark:bg-stone-800 p-0.5 text-[11px]">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  सबै ({chapters.length})
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    statusFilter === 'published'
                      ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  प्रकाशित ({publishedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    statusFilter === 'draft'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'text-amber-700 dark:text-amber-400 font-medium'
                  }`}
                >
                  मस्यौदा ({draftCount})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chapter Overview Header */}
        <div className="flex items-center justify-between mb-4 text-xs font-book text-stone-500">
          <span>देखाउँदै: {filteredChapters.length} अध्याय</span>
          <span>समग्र अध्ययन प्रगति: {overallPercent}% ({completedCount}/{visibleChapters.length} पूरा)</span>
        </div>

        {/* Chapters Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChapters.map((chapter) => {
            const prog = readingProgress[chapter.id];
            const isCompleted = prog?.completed || (prog?.progressPercent || 0) >= 90;
            const isBookmarked = StorageService.isChapterBookmarked(chapter.id);
            const isFav = StorageService.isFavorite(chapter.id);
            const isDraft = chapter.status === 'draft';

            return (
              <motion.div
                key={chapter.id}
                whileHover={{ y: -2 }}
                onClick={() => onSelectChapter(chapter.id)}
                className={`p-5 rounded-2xl bg-white dark:bg-stone-900 border transition-all cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-md ${
                  isDraft
                    ? 'border-amber-400/80 dark:border-amber-500/50 bg-amber-500/[0.03]'
                    : 'border-stone-200 dark:border-stone-800 hover:border-amber-500/70 dark:hover:border-amber-500/50'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-heading font-semibold bg-emerald-700/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                        अध्याय {chapter.chapterNumber}
                      </span>
                      {isDraft && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-heading font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                          मस्यौदा (Draft)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      {isBookmarked && (
                        <Bookmark className="w-3.5 h-3.5 text-[#d97706] fill-[#d97706]" />
                      )}
                      {isFav && (
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      )}
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                  </div>

                  {/* Arabic Title */}
                  <div className="text-right text-xs font-arabic text-emerald-800 dark:text-emerald-400 font-semibold mb-1">
                    {chapter.arabicTitle}
                  </div>

                  {/* Chapter Title */}
                  <h3 className="font-heading font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                    {chapter.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="mt-1 text-xs font-book text-stone-600 dark:text-stone-400 line-clamp-2">
                    {chapter.subtitle}
                  </p>
                </div>

                {/* Footer stats & progress */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3 text-amber-600" />
                    {chapter.readTimeMinutes} मिनेट
                  </span>

                  <div className="flex items-center gap-2">
                    {prog && prog.progressPercent > 0 && (
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {prog.progressPercent}% पढियो
                      </span>
                    )}
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      पढ्नुहोस् →
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
