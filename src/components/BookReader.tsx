import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chapter, ReaderSettings } from '../types';
import { StorageService } from '../services/storageService';
import { AyahCard } from './AyahCard';
import { HadithCard } from './HadithCard';
import { AskQuestionBox } from './AskQuestionBox';
import { CommentSection } from './CommentSection';
import {
  Bookmark,
  BookmarkCheck,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Type,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowRight,
  Sparkles,
  Download,
  CheckCircle,
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { showToast } from '../utils/toast';

interface BookReaderProps {
  chapter: Chapter;
  totalChapters?: number;
  allChapters?: Chapter[];
  onSelectChapter: (chapterId: string) => void;
  onOpenDictionaryTerm: (term: string) => void;
  onBackToTOC: () => void;
  isAdmin?: boolean;
}

export const BookReader: React.FC<BookReaderProps> = ({
  chapter,
  totalChapters,
  allChapters = [],
  onSelectChapter,
  onOpenDictionaryTerm,
  onBackToTOC,
  isAdmin = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>(StorageService.getSettings());

  // Derive navigable chapters based on admin privileges and publication status
  const navigableChapters = React.useMemo(() => {
    if (!allChapters || allChapters.length === 0) return [chapter];
    return allChapters.filter(c => isAdmin || c.status === 'published');
  }, [allChapters, isAdmin, chapter]);

  const currentIndex = navigableChapters.findIndex(c => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? navigableChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < navigableChapters.length - 1 ? navigableChapters[currentIndex + 1] : null;

  // For Chapter 2, parse multi-line markdown content into structured blocks (headings, paragraphs, blockquotes, lists)
  // so that body text is not erroneously bundled into <h2> heading tags, normalizing the font size to standard body text
  // matching all other chapters without modifying any source content.
  const contentBlocks = useMemo(() => {
    if (chapter.chapterNumber === 2 || chapter.id === 'ch-2') {
      const blocks: string[] = [];
      chapter.content.forEach((item) => {
        const sections = item.split(/\n\s*\n/);
        sections.forEach((sec) => {
          const trimmed = sec.trim();
          if (!trimmed) return;
          const secLines = trimmed.split('\n');
          let currentAcc: string[] = [];

          const flush = () => {
            if (currentAcc.length > 0) {
              const joined = currentAcc.join('\n').trim();
              if (joined) blocks.push(joined);
              currentAcc = [];
            }
          };

          secLines.forEach((line) => {
            const lineTrim = line.trim();
            if (lineTrim === '---') {
              flush();
              blocks.push('---');
            } else if (lineTrim.startsWith('## ') || lineTrim.startsWith('### ')) {
              flush();
              blocks.push(lineTrim);
            } else if (/^\d+\.\s+/.test(lineTrim)) {
              flush();
              currentAcc.push(lineTrim);
            } else if (/^[*•-]\s+/.test(lineTrim)) {
              flush();
              currentAcc.push(lineTrim);
            } else if (lineTrim.startsWith('>')) {
              if (currentAcc.length > 0 && !currentAcc[0].trim().startsWith('>')) {
                flush();
              }
              currentAcc.push(lineTrim);
            } else {
              if (
                currentAcc.length > 0 &&
                (currentAcc[0].trim().startsWith('>') ||
                  /^\d+\.\s+/.test(currentAcc[0].trim()) ||
                  /^[*•-]\s+/.test(currentAcc[0].trim()))
              ) {
                // Continuation of a list item or quote
                currentAcc.push(line);
              } else {
                currentAcc.push(line);
              }
            }
          });
          flush();
        });
      });
      return blocks.filter(Boolean);
    }
    return chapter.content;
  }, [chapter.chapterNumber, chapter.id, chapter.content]);

  const hasPrev = prevChapter !== null;
  const hasNext = nextChapter !== null;

  const goToPrev = () => {
    if (prevChapter) onSelectChapter(prevChapter.id);
  };

  const goToNext = () => {
    if (nextChapter) onSelectChapter(nextChapter.id);
  };

  // Text-To-Speech (Audio Ready) state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);

  // Sync state on chapter change
  useEffect(() => {
    setIsBookmarked(StorageService.isChapterBookmarked(chapter.id));
    setIsFav(StorageService.isFavorite(chapter.id));
    setIsDownloaded(StorageService.isDownloaded(chapter.id));

    // Scroll to top on chapter change
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Stop speaking if active
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [chapter.id]);

  // Track scroll progress and update persistent reading progress
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const total = scrollHeight - clientHeight;
    const percent = total > 0 ? (scrollTop / total) * 100 : 0;
    setScrollProgress(percent);

    // Save to persistent progress
    StorageService.updateReadingProgress(chapter.id, percent);
  };

  const handleToggleBookmark = () => {
    const newState = StorageService.toggleBookmark(chapter, scrollProgress);
    setIsBookmarked(newState);
  };

  const handleToggleFavorite = () => {
    const newState = StorageService.toggleFavorite(chapter.id);
    setIsFav(newState);
  };

  const handleToggleDownload = () => {
    const newState = StorageService.toggleOfflineDownload(chapter.id);
    setIsDownloaded(newState);
  };

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `इस्लाम दर्शन - ${chapter.title}`,
          text: `अध्याय ${chapter.chapterNumber}: ${chapter.title} — ${chapter.subtitle}`,
          url: window.location.href,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(
          `इस्लाम दर्शन - अध्याय ${chapter.chapterNumber}: ${chapter.title}\n${window.location.href}`
        );
        showToast('अध्यायको लिंक कपी गरियो!', 'success');
      } else {
        showToast('लिंक सेयर गर्न सकिएन।', 'warning');
      }
    } catch {
      // User dismissed share dialog or clipboard permission denied
    }
  };

  // Audio Narration (Web Speech API)
  const toggleSpeech = () => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        showToast('तपाईंको ब्राउजरमा अडियो स्पिच सुविधा समर्थित छैन।', 'warning');
        return;
      }

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      // Prepare clean text for narration
      const fullText = `${chapter.title}. ${chapter.subtitle}. ${chapter.content.join('. ')}. ${chapter.reflection}`;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'ne-NP';
      utterance.rate = speechRate;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsSpeaking(false);
    }
  };

  // Theme styles
  const getThemeClass = () => {
    switch (settings.theme) {
      case 'darkEmerald':
        return 'bg-[#021810] text-[#e2e8f0]';
      case 'sepia':
        return 'bg-[#fbf0d9] text-[#433422]';
      case 'cream':
      default:
        return 'bg-[#fcfaf4] text-[#292524]';
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-base sm:text-lg';
      case 'large':
        return 'text-xl sm:text-2xl';
      case 'xlarge':
        return 'text-2xl sm:text-3xl';
      case 'medium':
      default:
        return 'text-lg sm:text-xl';
    }
  };

  const getLineHeightClass = () => {
    switch (settings.lineHeight) {
      case 'normal':
        return 'leading-normal';
      case 'loose':
        return 'leading-loose';
      case 'relaxed':
      default:
        return 'leading-relaxed';
    }
  };

  const updateSetting = (newSet: Partial<ReaderSettings>) => {
    const updated = { ...settings, ...newSet };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  // Interactive Islamic Terms list to highlight & make clickable
  const KEY_TERMS = ['तौहीद', 'ईमान', 'तक्वा', 'शिर्क', 'वही', 'वह्य', 'सुन्नत', 'हदीस', 'इस्लाम', 'मुस्लिम', 'सलाह', 'जकात', 'रोजा', 'हज', 'जिहाद', 'काफिर', 'हलाल', 'हराम', 'फितरह', 'आखिरत', 'कद्र', 'शरीअत', 'रसूल', 'नबी', 'तागूत', 'रब'];

  const renderFormattedText = (rawText: string) => {
    // Splits by bold syntax **...**
    const boldRegex = /(\*\*.*?\*\*)/g;
    const segments = rawText.split(boldRegex);

    return segments.map((seg, sIdx) => {
      const isBold = seg.startsWith('**') && seg.endsWith('**');
      const cleanText = isBold ? seg.slice(2, -2) : seg;

      const termRegex = new RegExp(`(${KEY_TERMS.join('|')})`, 'g');
      const parts = cleanText.split(termRegex);

      const content = parts.map((part, pIdx) => {
        if (KEY_TERMS.includes(part)) {
          return (
            <button
              key={`term-${sIdx}-${pIdx}`}
              onClick={() => onOpenDictionaryTerm(part)}
              title={`'${part}' को अर्थ र सन्दर्भ हेर्नुहोस्`}
              className="inline-block font-semibold text-emerald-800 dark:text-emerald-300 hover:text-amber-600 dark:hover:text-amber-300 underline decoration-amber-500/60 decoration-dotted underline-offset-4 cursor-pointer px-0.5 rounded transition"
            >
              {part}
            </button>
          );
        }
        return part;
      });

      if (isBold) {
        return (
          <strong key={`bold-${sIdx}`} className="font-bold text-stone-950 dark:text-stone-100">
            {content}
          </strong>
        );
      }
      return <span key={`norm-${sIdx}`}>{content}</span>;
    });
  };

  const renderParagraph = (text: string, pIdx: number) => {
    const trimmed = text.trim();

    if (trimmed === '---') {
      return (
        <hr key={pIdx} className="my-8 border-t border-amber-500/30 dark:border-amber-500/20" />
      );
    }

    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '');
      return (
        <h2 key={pIdx} className="text-xl sm:text-2xl font-heading font-bold text-emerald-950 dark:text-emerald-200 mt-8 mb-4 border-b border-amber-500/20 pb-2">
          {renderFormattedText(headingText)}
        </h2>
      );
    }

    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s+/, '');
      return (
        <h3 key={pIdx} className="text-lg sm:text-xl font-heading font-bold text-amber-900 dark:text-amber-300 mt-6 mb-3">
          {renderFormattedText(headingText)}
        </h3>
      );
    }

    if (trimmed.startsWith('>')) {
      const quoteLines = trimmed
        .split('\n')
        .map((l) => l.replace(/^>\s*/, ''))
        .filter(Boolean);
      return (
        <blockquote key={pIdx} className="my-5 pl-4 sm:pl-5 border-l-4 border-amber-600 bg-amber-500/5 dark:bg-amber-500/10 py-3.5 pr-4 rounded-r-xl font-serif text-base sm:text-lg text-stone-800 dark:text-stone-200 leading-relaxed italic shadow-xs">
          {quoteLines.map((ql, qIdx) => (
            <div key={qIdx} className={qIdx > 0 ? 'mt-1.5' : ''}>
              {renderFormattedText(ql)}
            </div>
          ))}
        </blockquote>
      );
    }

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const itemText = trimmed.replace(/^[*•-]\s+/, '');
      return (
        <div key={pIdx} className="flex items-start gap-2.5 mb-2.5 ml-2 sm:ml-4 font-book">
          <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 mt-2 shrink-0" />
          <div className="flex-1">{renderFormattedText(itemText)}</div>
        </div>
      );
    }

    const matchNumbered = trimmed.match(/^(\d+)\.\s+([\s\S]+)/);
    if (matchNumbered) {
      const num = matchNumbered[1];
      const itemText = matchNumbered[2];
      return (
        <div key={pIdx} className="flex items-start gap-2.5 mb-3.5 ml-1 sm:ml-3 font-book">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-[#b45309] dark:text-[#fde68a] text-xs font-bold shrink-0 mt-0.5">
            {num}
          </span>
          <div className="flex-1 leading-relaxed">{renderFormattedText(itemText)}</div>
        </div>
      );
    }

    return (
      <p key={pIdx} className="mb-5 font-book text-justify leading-relaxed">
        {renderFormattedText(text)}
      </p>
    );
  };

  // If chapter is draft and user is not admin, deny access
  if (chapter.status === 'draft' && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#fcfaf4] dark:bg-[#021810] text-stone-900 dark:text-stone-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-xl font-heading font-bold text-stone-900 dark:text-stone-100 mb-2">
            यो अध्याय मस्यौदा (Draft) अवस्थामा छ
          </h2>
          <p className="text-sm font-book text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
            यो अध्याय हाल अनुसन्धान तथा समीक्षाको क्रममा रहेकोले सार्वजनिक गरिएको छैन। व्यवस्थापकद्वारा स्वीकृत र प्रकाशित भएपछि मात्र यहाँ पढ्न उपलब्ध हुनेछ।
          </p>
          <button
            onClick={onBackToTOC}
            className="px-5 py-2.5 rounded-xl bg-[#064e3b] text-[#fef3c7] font-heading font-bold text-sm hover:bg-[#047857] transition cursor-pointer"
          >
            विषय-सूचीमा फर्कनुहोस्
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen flex flex-col ${getThemeClass()} transition-colors duration-300`}>
      {/* Admin Draft Ribbon */}
      {chapter.status === 'draft' && isAdmin && (
        <div className="bg-amber-500 text-stone-950 px-4 py-1.5 text-center text-xs font-heading font-bold flex items-center justify-center gap-2 shadow-xs z-40">
          <span>⚠️ मस्यौदा पूर्वावलोकन (Draft Preview):</span>
          <span className="font-book font-medium">
            यो अध्याय केवल व्यवस्थापकले हेर्न सक्नुहुन्छ। सामान्य पाठकहरूका लागि अझै प्रकाशित गरिएको छैन।
          </span>
        </div>
      )}

      {/* Sticky Top Reading Progress Bar */}
      <div className="sticky top-0 left-0 right-0 h-1.5 bg-stone-200/40 dark:bg-stone-800/60 z-30">
        <div
          className="h-full bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#047857] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Reader Toolbar */}
      <header className="sticky top-1.5 left-0 right-0 z-20 backdrop-blur-md bg-white/75 dark:bg-[#021810]/80 border-b border-stone-200/70 dark:border-stone-800/80 px-4 py-2.5 flex items-center justify-between shadow-xs">
        {/* Back to TOC */}
        <button
          onClick={onBackToTOC}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-book font-medium text-emerald-900 dark:text-emerald-300 hover:text-amber-600 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">विषय-सूची</span>
          <span className="sm:hidden">सूची</span>
        </button>

        {/* Chapter Title Badge */}
        <div className="text-center truncate px-2 max-w-[200px] sm:max-w-xs md:max-w-md">
          <span className="text-xs sm:text-sm font-heading font-bold text-stone-800 dark:text-stone-200 truncate block">
            अध्याय {chapter.chapterNumber}: {chapter.title}
          </span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Audio Narration Toggle */}
          <button
            onClick={toggleSpeech}
            title={isSpeaking ? 'वाचन रोक्नुहोस्' : 'नेपाली आवाजमा सुन्नुहोस्'}
            className={`p-2 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 ${
              isSpeaking
                ? 'bg-amber-500 text-white animate-pulse'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden md:inline text-[11px]">{isSpeaking ? 'सुन्दै...' : 'सुन्नुहोस्'}</span>
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={handleToggleBookmark}
            title={isBookmarked ? 'बुकमार्क हटाइयो' : 'बुकमार्क थप्नुहोस्'}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isBookmarked
                ? 'text-[#d97706] bg-amber-500/15'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={handleToggleFavorite}
            title="मनपर्ने सूची"
            className={`p-2 rounded-lg transition cursor-pointer ${
              isFav ? 'text-rose-500' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Offline Download Toggle */}
          <button
            onClick={handleToggleDownload}
            title={isDownloaded ? 'अफलाइन उपलब्ध छ' : 'अफलाइनका लागि डाउनलोड गर्नुहोस्'}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isDownloaded ? 'text-emerald-600' : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800'
            }`}
          >
            {isDownloaded ? <CheckCircle className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          </button>

          {/* Reader Settings Modal Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="पढाइ शैली परिवर्तन (Font / Theme)"
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            title="साझा गर्नुहोस्"
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Reader Settings Floating Dropdown */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 right-4 z-40 p-4 rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200 dark:border-stone-800 w-72 text-stone-900 dark:text-stone-100 font-book text-xs"
          >
            <div className="font-heading font-bold text-sm mb-3 text-emerald-950 dark:text-emerald-300 border-b pb-1.5 border-stone-200 dark:border-stone-800">
              पढाइ अनुकूलन (Reader Settings)
            </div>

            {/* Font Size */}
            <div className="mb-3">
              <label className="block text-stone-500 dark:text-stone-400 mb-1">अक्षरको आकार (Font Size)</label>
              <div className="grid grid-cols-4 gap-1">
                {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting({ fontSize: size })}
                    className={`py-1 rounded border text-center transition cursor-pointer ${
                      settings.fontSize === size
                        ? 'bg-[#064e3b] text-white border-[#064e3b]'
                        : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {size === 'small' ? 'सानो' : size === 'medium' ? 'मध्यम' : size === 'large' ? 'ठूलो' : 'विशाल'}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Theme */}
            <div className="mb-3">
              <label className="block text-stone-500 dark:text-stone-400 mb-1">पृष्ठभूमि रंग (Theme)</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => updateSetting({ theme: 'cream' })}
                  className={`py-1.5 rounded border text-xs text-stone-900 bg-[#fcfaf4] transition cursor-pointer ${
                    settings.theme === 'cream' ? 'ring-2 ring-amber-500 font-bold' : ''
                  }`}
                >
                  पार्चमेन्ट (Cream)
                </button>
                <button
                  onClick={() => updateSetting({ theme: 'sepia' })}
                  className={`py-1.5 rounded border text-xs text-[#433422] bg-[#fbf0d9] transition cursor-pointer ${
                    settings.theme === 'sepia' ? 'ring-2 ring-amber-500 font-bold' : ''
                  }`}
                >
                  सेपिया (Sepia)
                </button>
                <button
                  onClick={() => updateSetting({ theme: 'darkEmerald' })}
                  className={`py-1.5 rounded border text-xs text-[#fef3c7] bg-[#021810] transition cursor-pointer ${
                    settings.theme === 'darkEmerald' ? 'ring-2 ring-amber-500 font-bold' : ''
                  }`}
                >
                  इमराल्ड (Dark)
                </button>
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label className="block text-stone-500 dark:text-stone-400 mb-1">पंक्ति दूरी (Line Height)</label>
              <div className="grid grid-cols-3 gap-1">
                {(['normal', 'relaxed', 'loose'] as const).map((lh) => (
                  <button
                    key={lh}
                    onClick={() => updateSetting({ lineHeight: lh })}
                    className={`py-1 rounded border text-center transition cursor-pointer ${
                      settings.lineHeight === lh
                        ? 'bg-[#064e3b] text-white border-[#064e3b]'
                        : 'border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {lh === 'normal' ? 'सामान्य' : lh === 'relaxed' ? 'खुला' : 'फराकिलो'}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Book Text Container */}
      <main
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 lg:px-24 py-8 sm:py-12 max-w-4xl mx-auto w-full"
      >
        <article className="relative">
          {/* Ornate Top Chapter Header */}
          <div className="text-center mb-10 pb-6 border-b-2 border-[#d97706]/30">
            {/* Arabic Title */}
            <div className="text-2xl sm:text-3xl font-arabic text-emerald-800 dark:text-emerald-400 mb-2">
              {chapter.arabicTitle}
            </div>

            {/* Chapter Number Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-[#d97706]/40 text-[#b45309] dark:text-[#fde68a] text-xs font-heading font-bold mb-3">
              <span>अध्याय {chapter.chapterNumber}</span>
              <span>•</span>
              <span>{chapter.series}</span>
            </div>

            {/* Main Chapter Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
              {chapter.title}
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-base sm:text-lg font-book font-medium text-stone-600 dark:text-stone-300 italic max-w-2xl mx-auto">
              "{chapter.subtitle}"
            </p>

            {/* Reading stats */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs font-book text-stone-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                पढ्ने समय: करिब {chapter.readTimeMinutes} मिनेट
              </span>
              <span>•</span>
              <span>शब्द गणना: {chapter.wordCount}</span>
            </div>

            {/* Gold Geometric Ornament Divider */}
            <div className="mt-6 flex items-center justify-center gap-3 text-[#d97706]">
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-[#d97706]" />
              <span className="text-lg">۞ ۝ ۞</span>
              <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-[#d97706]" />
            </div>
          </div>

          {/* Chapter Intellectual Focus Card (if metadata exists) */}
          {chapter.intellectualMetadata && (
            <div className="mb-8 p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>केन्द्रीय दार्शनिक अनुसन्धान (Philosophical Inquiry)</span>
              </div>
              <div className="text-base sm:text-lg font-heading font-semibold text-stone-900 dark:text-stone-100 mb-2 leading-snug">
                "{chapter.intellectualMetadata.centralQuestion}"
              </div>
              <div className="text-sm font-book text-stone-600 dark:text-stone-300 leading-relaxed mb-3">
                <span className="font-semibold text-stone-800 dark:text-stone-200">मुख्य प्रतिपादन: </span>
                {chapter.intellectualMetadata.coreArgument}
              </div>
              {chapter.intellectualMetadata.keyConcepts && chapter.intellectualMetadata.keyConcepts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-amber-500/15">
                  {chapter.intellectualMetadata.keyConcepts.map((kc, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[11px] font-heading font-medium bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/20"
                    >
                      {kc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chapter Body Content with Typography & Clickable Terms */}
          <div className={`${getFontSizeClass()} ${getLineHeightClass()} text-stone-800 dark:text-stone-200`}>
            {contentBlocks.map((p, idx) => renderParagraph(p, idx))}
          </div>

          {/* Quranic Ayahs Section */}
          {chapter.ayahReferences.length > 0 && (
            <div className="my-8">
              <h2 className="text-base sm:text-lg font-heading font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-[#d97706]" />
                कुरआनबाट प्रमाणिक सन्दर्भ
              </h2>
              {chapter.ayahReferences.map((ayah) => (
                <AyahCard key={ayah.id} ayah={ayah} />
              ))}
            </div>
          )}

          {/* Sahih Hadith Section */}
          {chapter.hadithReferences.length > 0 && (
            <div className="my-8">
              <h2 className="text-base sm:text-lg font-heading font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#d97706]" />
                सहीह हदीसको आलोकमा
              </h2>
              {chapter.hadithReferences.map((hadith) => (
                <HadithCard key={hadith.id} hadith={hadith} />
              ))}
            </div>
          )}

          {/* Common Non-Muslim Question Answered in this Chapter */}
          {chapter.commonQuestionsAnswered.length > 0 && (
            <div className="my-8 p-5 sm:p-6 rounded-2xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800">
              <h3 className="text-base sm:text-lg font-heading font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-[#d97706]" />
                यस विषयमा प्रायः सोधिने प्रश्न
              </h3>
              <div className="space-y-4">
                {chapter.commonQuestionsAnswered.map((faq, idx) => (
                  <div key={idx} className="border-l-2 border-amber-600 pl-4">
                    <h4 className="font-heading font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      प्र: {faq.question}
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm font-book text-stone-700 dark:text-stone-300 leading-relaxed">
                      उ: {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deep Reflection Section */}
          <div className="my-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-emerald-900/10 to-amber-900/10 border-2 border-[#d97706]/40 shadow-xs">
            <h3 className="text-base sm:text-lg font-heading font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-2">
              <span className="text-xl">💡</span>
              आत्म-चिन्तन (Reflection)
            </h3>
            <p className="text-sm sm:text-base font-book text-stone-800 dark:text-stone-200 leading-relaxed italic">
              "{chapter.reflection}"
            </p>
          </div>

          {/* Next Chapter Teaser Hook Card */}
          {hasNext && nextChapter && (
            <div className="my-10 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] text-[#fef3c7] shadow-xl border border-amber-500/50">
              <span className="text-xs font-heading font-bold uppercase tracking-widest text-[#f59e0b]">
                अर्को अध्यायतर्फको उत्सुकता
              </span>
              <p className="mt-2 text-base sm:text-lg font-book leading-relaxed text-[#fef3c7]/90 italic">
                "{chapter.nextChapterTeaser || nextChapter.subtitle}"
              </p>
              <button
                onClick={goToNext}
                className="mt-5 w-full sm:w-auto px-6 py-3 rounded-xl font-heading font-bold text-sm sm:text-base bg-gradient-to-r from-[#fef08a] to-[#f59e0b] text-[#064e3b] hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>अध्याय {nextChapter.chapterNumber}: {nextChapter.title} पढ्नुहोस्</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dedicated Chapter-End Question Box (Point 6) */}
          <AskQuestionBox
            chapterId={chapter.id}
            chapterTitle={`अध्याय ${chapter.chapterNumber}: ${chapter.title}`}
          />

          {/* Dedicated Comment System (Point 7) */}
          <CommentSection chapterId={chapter.id} isAdmin={isAdmin} />
        </article>

        {/* Tactile Page Turn Navigation (Point 2) */}
        <nav className="my-10 pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4">
          <button
            onClick={goToPrev}
            disabled={!hasPrev}
            className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-heading font-semibold text-xs sm:text-sm transition cursor-pointer ${
              hasPrev
                ? 'border-stone-300 dark:border-stone-700 hover:bg-stone-200/50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200'
                : 'opacity-40 cursor-not-allowed border-stone-200 dark:border-stone-800 text-stone-400'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>अघिल्लो अध्याय</span>
          </button>

          <button
            onClick={onBackToTOC}
            title="विषय-सूचीमा फर्कनुहोस्"
            className="p-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-200/50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={goToNext}
            disabled={!hasNext}
            className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-heading font-semibold text-xs sm:text-sm transition cursor-pointer ${
              hasNext
                ? 'bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] border-emerald-600'
                : 'opacity-40 cursor-not-allowed border-stone-200 dark:border-stone-800 text-stone-400'
            }`}
          >
            <span>अर्को अध्याय</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </main>
    </div>
  );
};
