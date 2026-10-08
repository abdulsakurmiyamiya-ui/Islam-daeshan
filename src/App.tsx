import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import { Chapter } from './types';
import { CoverScreen } from './components/CoverScreen';
import { TableOfContents } from './components/TableOfContents';
import { BookReader } from './components/BookReader';
import { FAQScreen } from './components/FAQScreen';
import { DictionaryScreen } from './components/DictionaryScreen';
import { BookmarksScreen } from './components/BookmarksScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ToastContainer } from './components/Toast';
import { AnimatePresence, motion } from 'motion/react';

type AppView = 'cover' | 'toc' | 'reader' | 'faq' | 'dictionary' | 'bookmarks' | 'admin';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('cover');
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    try {
      return StorageService.getChapters();
    } catch (e) {
      console.warn('Failed to initialize chapters:', e);
      return [];
    }
  });
  const [activeChapterId, setActiveChapterId] = useState<string>(() => {
    try {
      return StorageService.getLastReadChapterId() || 'ch-1';
    } catch {
      return 'ch-1';
    }
  });
  const [selectedDictionaryTerm, setSelectedDictionaryTerm] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(true);

  useEffect(() => {
    try {
      const loadedChapters = StorageService.getChapters();
      if (loadedChapters.length > 0) {
        setChapters(loadedChapters);
      }
      const lastRead = StorageService.getLastReadChapterId();
      if (lastRead) {
        setActiveChapterId(lastRead);
      }
    } catch (e) {
      console.error('Error in App initial effect:', e);
    }
  }, []);

  const refreshChapters = () => {
    setChapters(StorageService.getChapters());
  };

  const handleOpenBook = () => {
    const targetId = StorageService.getLastReadChapterId() || 'ch-1';
    setActiveChapterId(targetId);
    setCurrentView('reader');
  };

  const handleSelectChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setCurrentView('reader');
  };

  const handleOpenDictionaryTerm = (term: string) => {
    setSelectedDictionaryTerm(term);
    setCurrentView('dictionary');
  };

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  return (
    <div className="min-h-screen w-full bg-[#021810] selection:bg-amber-400 selection:text-emerald-950 font-book flex flex-col">
      <AnimatePresence mode="wait">
        {currentView === 'cover' && (
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col w-full"
          >
            <CoverScreen
              onOpenBook={handleOpenBook}
              onOpenTOC={() => setCurrentView('toc')}
              onOpenFAQ={() => setCurrentView('faq')}
            />
          </motion.div>
        )}

        {currentView === 'toc' && (
          <motion.div
            key="toc"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col w-full"
          >
            <TableOfContents
              chapters={chapters}
              isAdmin={isAdmin}
              onSelectChapter={handleSelectChapter}
              onOpenFAQ={() => setCurrentView('faq')}
              onOpenDictionary={() => {
                setSelectedDictionaryTerm(null);
                setCurrentView('dictionary');
              }}
              onOpenBookmarks={() => setCurrentView('bookmarks')}
              onOpenAdmin={() => setCurrentView('admin')}
              onBackToCover={() => setCurrentView('cover')}
            />
          </motion.div>
        )}

        {currentView === 'reader' && activeChapter && (
          <motion.div
            key={`reader-${activeChapter.id}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 flex flex-col w-full"
          >
            <BookReader
              chapter={activeChapter}
              allChapters={chapters}
              totalChapters={chapters.length}
              onSelectChapter={handleSelectChapter}
              onOpenDictionaryTerm={handleOpenDictionaryTerm}
              onBackToTOC={() => setCurrentView('toc')}
              isAdmin={isAdmin}
            />
          </motion.div>
        )}

        {currentView === 'faq' && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col w-full"
          >
            <FAQScreen
              onBack={() => setCurrentView('toc')}
              onOpenChapter={handleSelectChapter}
            />
          </motion.div>
        )}

        {currentView === 'dictionary' && (
          <motion.div
            key="dictionary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col w-full"
          >
            <DictionaryScreen
              onBack={() => setCurrentView('toc')}
              initialTerm={selectedDictionaryTerm}
            />
          </motion.div>
        )}

        {currentView === 'bookmarks' && (
          <motion.div
            key="bookmarks"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col w-full"
          >
            <BookmarksScreen
              chapters={chapters}
              onBack={() => setCurrentView('toc')}
              onOpenChapter={handleSelectChapter}
            />
          </motion.div>
        )}

        {currentView === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col w-full"
          >
            <AdminDashboard
              chapters={chapters}
              onRefreshChapters={refreshChapters}
              onBackToApp={() => setCurrentView('toc')}
              onOpenChapter={handleSelectChapter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer />
      <OfflineIndicator />
    </div>
  );
}
