import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { Bookmark, Chapter } from '../types';
import {
  BookmarkCheck,
  ArrowLeft,
  Trash2,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  HardDriveDownload
} from 'lucide-react';

interface BookmarksScreenProps {
  chapters: Chapter[];
  onBack: () => void;
  onOpenChapter: (chapterId: string) => void;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({
  chapters,
  onBack,
  onOpenChapter,
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(StorageService.getBookmarks());
  const progressMap = StorageService.getReadingProgress();
  const offlineDownloads = StorageService.getOfflineChapters();

  const handleRemove = (chapterId: string) => {
    const ch = chapters.find(c => c.id === chapterId);
    if (ch) {
      StorageService.toggleBookmark(ch);
      setBookmarks(StorageService.getBookmarks());
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
              <BookmarkCheck className="w-5 h-5 text-amber-600" />
              बुकमार्क तथा अध्ययन प्रगति
            </h1>
            <p className="text-[11px] font-book text-stone-500 dark:text-stone-400">
              तपाईंले सुरक्षित गर्नुभएका स्थानहरू र अफलाइन पुस्तकालय
            </p>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Saved Bookmarks Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-heading font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-amber-600" />
              सुरक्षित गरिएका बुकमार्कहरू ({bookmarks.length})
            </h2>
          </div>

          {bookmarks.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50">
              <BookmarkCheck className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
              <p className="text-sm text-stone-500 font-book">
                कुनै पनि बुकमार्क सुरक्षित गरिएको छैन। पढ्दै गर्दा माथिको रिबनमा ट्याप गरी बुकमार्क गर्न सक्नुहुन्छ।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bm) => {
                const chapter = chapters.find(c => c.id === bm.chapterId);
                return (
                  <div
                    key={bm.id}
                    className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex items-center justify-between gap-4 hover:border-amber-500/50 transition"
                  >
                    <div
                      onClick={() => onOpenChapter(bm.chapterId)}
                      className="cursor-pointer flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-heading font-semibold text-emerald-700 dark:text-emerald-400">
                          अध्याय {bm.chapterNumber}
                        </span>
                        <span className="text-[10px] text-stone-400 font-book">
                          सुरक्षित मिति: {bm.createdAt}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 mt-0.5">
                        {bm.chapterTitle}
                      </h3>
                      {chapter && (
                        <p className="text-xs text-stone-500 font-book line-clamp-1 mt-0.5">
                          {chapter.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenChapter(bm.chapterId)}
                        className="px-3 py-1.5 rounded-lg text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>खोल्नुहोस्</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRemove(bm.chapterId)}
                        title="बुकमार्क हटाउनुहोस्"
                        className="p-2 rounded-lg text-stone-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Offline Ready Chapters List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-heading font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <HardDriveDownload className="w-4 h-4 text-emerald-600" />
              अफलाइन सुरक्षित अध्यायहरू ({offlineDownloads.length})
            </h2>
            <span className="text-xs text-stone-500">
              इन्टरनेट नहुँदा पनि उपलब्ध
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {offlineDownloads.map((chId) => {
              const ch = chapters.find(c => c.id === chId);
              if (!ch) return null;
              return (
                <div
                  key={chId}
                  onClick={() => onOpenChapter(chId)}
                  className="p-3.5 rounded-xl bg-emerald-700/5 dark:bg-emerald-950/20 border border-emerald-600/30 flex items-center justify-between cursor-pointer hover:border-emerald-600 transition"
                >
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                      अध्याय {ch.chapterNumber}
                    </span>
                    <h3 className="font-heading font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
                      {ch.title}
                    </h3>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
