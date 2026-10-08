import React, { useState } from 'react';
import { Chapter, Question, Comment, AppNotification, ChapterIntellectualMetadata } from '../types';
import { StorageService } from '../services/storageService';
import { CHAPTER_METADATA_REGISTRY, validateChapterNovelty } from '../data/chapterMetadataRegistry';
import { showToast } from '../utils/toast';
import {
  SlidersHorizontal,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Bell,
  ArrowLeft,
  Search,
  Send,
  Flag,
  Save,
  X,
  Database,
  Download,
  Upload,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCcw,
  BookOpen,
  Sparkles,
  Compass,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface AdminDashboardProps {
  chapters: Chapter[];
  onRefreshChapters: () => void;
  onBackToApp: () => void;
  onOpenChapter: (chapterId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  chapters,
  onRefreshChapters,
  onBackToApp,
  onOpenChapter,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'architecture' | 'questions' | 'comments' | 'notifications' | 'backup'>('overview');

  // Novelty validator test bench state
  const [testChapterNum, setTestChapterNum] = useState<number>(16);
  const [testQuestion, setTestQuestion] = useState<string>('स्वर्ग र नर्कको भौतिक स्वरूप कि आत्मिक सन्तुष्टि र पीडाको शाश्वत यथार्थ?');
  const [testArgument, setTestArgument] = useState<string>('स्वर्ग र नर्क केवल सांसारिक भय वा लोभका विम्ब होइनन्, बरु मानवीय चेतना र कर्मको गुणात्मक रूपान्तरणको शाश्वत ईश्वरीय न्याय हुन्।');
  const [testTheme, setTestTheme] = useState<string>('स्वर्ग (जन्नत) र नर्क (जहन्नम) को यथार्थ');
  const [testPerspective, setTestPerspective] = useState<string>('सांसारिक सुखको तुच्छता र शाश्वत आनन्दको मनोवैज्ञानिक एवं दार्शनिक विश्लेषण।');
  const [testConcepts, setTestConcepts] = useState<string>('जन्नत, जहन्नम, आत्मिक सुख, शाश्वत न्याय, नैतिक सन्तुलन');
  const [testValidationResult, setTestValidationResult] = useState<{ passed: boolean; score: number; feedback: string[] } | null>(null);

  const handleRunNoveltyAudit = () => {
    const candidate: ChapterIntellectualMetadata = {
      chapterNumber: testChapterNum,
      centralQuestion: testQuestion,
      coreArgument: testArgument,
      mainTheme: testTheme,
      evidenceUsed: ['सूरह अल-वाकिआ ५६:११-२६', 'सहीह अल-बुखारी'],
      keyConcepts: testConcepts.split(',').map(c => c.trim()).filter(Boolean),
      uniquePerspective: testPerspective,
      reasoningStyle: 'तुलनात्मक एवं आत्मिक-दार्शनिक विश्लेषण'
    };
    const result = validateChapterNovelty(candidate, testChapterNum);
    setTestValidationResult({
      passed: result.pass,
      score: result.score,
      feedback: [...result.warnings, ...result.insights]
    });
  };

  // Questions state
  const [questions, setQuestions] = useState<Question[]>(StorageService.getQuestions());
  const [replyingQId, setReplyingQId] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState('');

  // Comments state
  const [allComments, setAllComments] = useState<Comment[]>(StorageService.getComments());

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(StorageService.getNotifications());
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  // Chapter editing/creating modal
  const [editingChapter, setEditingChapter] = useState<Partial<Chapter> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Chapter filter & search state in Admin Dashboard
  const [chapterStatusFilter, setChapterStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [chapterSearch, setChapterSearch] = useState('');

  // Backup / Import / Export state
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Stats calculation
  const totalChapters = chapters.length;
  const publishedCount = chapters.filter(c => c.status === 'published').length;
  const draftCount = chapters.filter(c => c.status === 'draft').length;
  const pendingQuestions = questions.filter(q => q.status === 'pending').length;
  const totalComments = allComments.length;
  const reportedComments = allComments.filter(c => c.reportsCount > 0).length;

  const handleToggleChapterStatus = (ch: Chapter) => {
    const newStatus = ch.status === 'published' ? 'draft' : 'published';
    StorageService.updateChapter(ch.id, { status: newStatus });
    onRefreshChapters();
  };

  const handleExportJSON = () => {
    const data = StorageService.exportChaptersJSON();
    const blob = new Blob([data], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `islam_darshan_chapters_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    const data = StorageService.exportChaptersJSON();
    navigator.clipboard.writeText(data).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const handleImportJSON = () => {
    setImportError(null);
    setImportSuccess(null);
    if (!importText.trim()) {
      setImportError('कृपया आयात गर्नका लागि JSON डेटा प्रविष्ट गर्नुहोस्।');
      return;
    }
    const res = StorageService.importChaptersJSON(importText.trim());
    if (!res.success) {
      setImportError(res.error || 'JSON आयात गर्न असफल भयो।');
    } else {
      setImportSuccess(`सफलतापूर्वक ${res.count} वटा अध्यायहरू अद्यावधिक गरियो! एप rebuild नगरिकनै नयाँ सामग्री पाठकहरूका लागि तयार भयो।`);
      setImportText('');
      onRefreshChapters();
    }
  };

  const handleResetToBaseline = () => {
    try {
      if (typeof window === 'undefined' || window.confirm('के तपाईं सबै अध्यायहरूलाई आधिकारिक मूल ३२ अध्यायको ढाँचामा पुनःस्थापना गर्न चाहनुहुन्छ? तपाईंले थप्नुभएका मस्यौदा अध्यायहरू रिसेट हुनेछन्।')) {
        StorageService.resetToDefaultChapters();
        onRefreshChapters();
        showToast('आधिकारिक ३२ अध्यायहरू सफलतापूर्वक पुनःस्थापित गरियो!', 'success');
      }
    } catch {
      StorageService.resetToDefaultChapters();
      onRefreshChapters();
      showToast('आधिकारिक ३२ अध्यायहरू पुनःस्थापित गरियो।', 'success');
    }
  };

  const handleAnswerQuestion = (qId: string) => {
    if (!answerDraft.trim()) return;
    StorageService.answerQuestion(qId, answerDraft.trim());
    setQuestions(StorageService.getQuestions());
    setReplyingQId(null);
    setAnswerDraft('');
    showToast('उत्तर सफलतापूर्वक प्रकाशित गरियो!', 'success');
  };

  const handleDeleteComment = (cId: string) => {
    try {
      if (typeof window === 'undefined' || window.confirm('के तपाईं यो टिप्पणी मेटाउन निश्चित हुनुहुन्छ?')) {
        StorageService.deleteComment(cId);
        setAllComments(StorageService.getComments());
        showToast('टिप्पणी मेटाइयो।', 'info');
      }
    } catch {
      StorageService.deleteComment(cId);
      setAllComments(StorageService.getComments());
    }
  };

  const handleSendNotification = () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      showToast('कृपया शीर्षक र सन्देश प्रविष्ट गर्नुहोस्।', 'warning');
      return;
    }
    StorageService.addNotification({
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: 'announcement'
    });
    setNotifications(StorageService.getNotifications());
    setNotifTitle('');
    setNotifMessage('');
    showToast('सूचना सफलतापूर्वक पठाइयो!', 'success');
  };

  const handleSaveChapter = () => {
    if (!editingChapter?.title || !editingChapter.content) {
      showToast('कृपया अध्यायको शीर्षक र विषयवस्तु भर्नुहोस्।', 'warning');
      return;
    }

    if (isCreatingNew) {
      StorageService.addChapter({
        chapterNumber: editingChapter.chapterNumber || chapters.length + 1,
        title: editingChapter.title,
        subtitle: editingChapter.subtitle || '',
        arabicTitle: editingChapter.arabicTitle || 'الباب',
        series: editingChapter.series || 'अन्वेषण शृङ्खला',
        readTimeMinutes: editingChapter.readTimeMinutes || 10,
        wordCount: 1500,
        content: typeof editingChapter.content === 'string'
          ? (editingChapter.content as string).split('\n\n')
          : editingChapter.content,
        summary: editingChapter.summary || editingChapter.subtitle || '',
        status: editingChapter.status || 'draft',
        ayahReferences: editingChapter.ayahReferences || [],
        hadithReferences: editingChapter.hadithReferences || [],
        commonQuestionsAnswered: editingChapter.commonQuestionsAnswered || [],
        reflection: editingChapter.reflection || 'आत्म-चिन्तन गर्नुहोस्।',
        nextChapterTeaser: editingChapter.nextChapterTeaser || 'अर्को अध्यायमा थप रहस्य उद्घाटन हुनेछ।'
      });
    } else if (editingChapter.id) {
      StorageService.updateChapter(editingChapter.id, {
        ...editingChapter,
        content: typeof editingChapter.content === 'string'
          ? (editingChapter.content as string).split('\n\n')
          : editingChapter.content,
      });
    }

    onRefreshChapters();
    setEditingChapter(null);
    setIsCreatingNew(false);
    showToast('अध्याय सफलतापूर्वक सुरक्षित भयो!', 'success');
  };

  const handleDeleteChapter = (id: string) => {
    try {
      if (typeof window === 'undefined' || window.confirm('के तपाईं यो अध्याय हटाउन चाहनुहुन्छ?')) {
        StorageService.deleteChapter(id);
        onRefreshChapters();
        showToast('अध्याय हटाइयो।', 'info');
      }
    } catch {
      StorageService.deleteChapter(id);
      onRefreshChapters();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#021810] text-stone-900 dark:text-stone-100 flex flex-col font-book">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/90 dark:bg-[#021810]/90 border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToApp}
            className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-heading font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>एपमा फर्कनुहोस्</span>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-heading font-extrabold text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-600" />
              व्यवस्थापक नियन्त्रण कक्ष (Admin Dashboard & CMS)
            </h1>
            <p className="text-[11px] text-stone-500 font-book">
              सामग्री सम्पादन, प्रश्नोत्तर व्यवस्थापन र पाठक प्रतिक्रिया नियन्त्रण
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsCreatingNew(true);
              setEditingChapter({
                chapterNumber: chapters.length + 1,
                title: '',
                subtitle: '',
                arabicTitle: 'الفصل الجديد',
                series: 'खोज र अस्तित्व शृङ्खला',
                content: ['पहिलो अनुच्छेद यहाँ लेख्नुहोस्...', 'दोस्रो अनुच्छेद यहाँ लेख्नुहोस्...'],
                reflection: 'यस अध्यायको चिन्तन...',
                nextChapterTeaser: 'अर्को अध्यायको जिज्ञासा...',
                status: 'draft'
              });
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>नयाँ अध्याय लेख्नुहोस्</span>
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 flex items-center gap-4 text-xs font-heading font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-emerald-700 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <span>सिंहावलोकन (Overview)</span>
        </button>

        <button
          onClick={() => setActiveTab('chapters')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'chapters'
              ? 'border-emerald-700 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <span>अध्याय सम्पादन ({totalChapters})</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'architecture'
              ? 'border-emerald-700 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-500" />
          <span>दार्शनिक वास्तुकला र नवीनता (DNA)</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'questions'
              ? 'border-emerald-700 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <span>पाठकका प्रश्नहरू ({questions.length})</span>
          {pendingQuestions > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingQuestions}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'comments'
              ? 'border-emerald-700 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <span>टिप्पणी समीक्षा ({totalComments})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'notifications'
              ? 'border-emerald-700 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>सूचना प्रसारण</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'backup'
              ? 'border-emerald-700 text-emerald-800 dark:text-emerald-300'
              : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-500" />
          <span>सामग्री सिङ्क तथा ब्याकअप</span>
        </button>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                <span className="text-xs font-book text-stone-500">कुल अध्याय संख्या</span>
                <div className="text-3xl font-heading font-extrabold text-emerald-800 dark:text-emerald-300 mt-1">
                  {totalChapters}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
                  {publishedCount} प्रकाशित • {draftCount} मस्यौदा
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                <span className="text-xs font-book text-stone-500">पाठकका जिज्ञासा (Questions)</span>
                <div className="text-3xl font-heading font-extrabold text-amber-600 mt-1">
                  {questions.length}
                </div>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 block">{pendingQuestions} वटा अनुत्तरित प्रश्न</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                <span className="text-xs font-book text-stone-500">कुल पाठक प्रतिक्रिया</span>
                <div className="text-3xl font-heading font-extrabold text-stone-800 dark:text-stone-200 mt-1">
                  {totalComments}
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">अध्यायगत छलफल</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                <span className="text-xs font-book text-stone-500">रिपोर्ट गरिएका टिप्पणी</span>
                <div className="text-3xl font-heading font-extrabold text-rose-600 mt-1">
                  {reportedComments}
                </div>
                <span className="text-[11px] text-rose-600 mt-1 block">स्पाम फिल्टर सक्रिय</span>
              </div>
            </div>

            {/* Quick Action & Security Status */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#064e3b]/10 to-amber-500/10 border border-[#d97706]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-base text-emerald-950 dark:text-emerald-300">
                  सामग्री व्यवस्थापन (No-Rebuild Content Architecture)
                </h3>
                <p className="text-xs sm:text-sm font-book text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
                  नयाँ अध्यायहरू थप्न, सम्पादन गर्न वा परीक्षण गर्नका लागि एपलाई पुनः rebuild वा re-publish गरिरहनु पर्दैन। मस्यौदा (Draft) मा राखेर पहिले परीक्षण गर्नुहोस् र तयार भएपछि प्रकाशित (Publish) गर्नुहोस्।
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('chapters')}
                  className="px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] transition cursor-pointer"
                >
                  अध्याय सम्पादन ({totalChapters})
                </button>
                <button
                  onClick={() => setActiveTab('backup')}
                  className="px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 transition cursor-pointer flex items-center gap-1"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>सिङ्क/ब्याकअप</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CHAPTERS CMS TAB */}
        {activeTab === 'chapters' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-heading font-bold text-stone-900 dark:text-stone-100">
                  अध्याय सूची र सम्पादन ({chapters.length})
                </h2>
                <p className="text-xs text-stone-500 font-book">
                  अध्यायहरू मस्यौदा (Draft) मा राख्दा सामान्य पाठकहरूबाट लुक्छन्। परीक्षणपछि मात्र प्रकाशित गर्नुहोस्।
                </p>
              </div>

              {/* Status Filter & Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    placeholder="अध्याय खोज्नुहोस्..."
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div className="inline-flex rounded-lg bg-stone-200/60 dark:bg-stone-800 p-0.5 text-xs">
                  <button
                    onClick={() => setChapterStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      chapterStatusFilter === 'all'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    सबै ({chapters.length})
                  </button>
                  <button
                    onClick={() => setChapterStatusFilter('published')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      chapterStatusFilter === 'published'
                        ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    प्रकाशित ({publishedCount})
                  </button>
                  <button
                    onClick={() => setChapterStatusFilter('draft')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      chapterStatusFilter === 'draft'
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    मस्यौदा ({draftCount})
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {chapters
                .filter((ch) => {
                  if (chapterStatusFilter === 'published' && ch.status !== 'published') return false;
                  if (chapterStatusFilter === 'draft' && ch.status !== 'draft') return false;
                  if (chapterSearch.trim()) {
                    const q = chapterSearch.toLowerCase();
                    return (
                      ch.title.toLowerCase().includes(q) ||
                      ch.subtitle.toLowerCase().includes(q) ||
                      String(ch.chapterNumber).includes(q)
                    );
                  }
                  return true;
                })
                .map((ch) => {
                  const isDraft = ch.status === 'draft';
                  return (
                    <div
                      key={ch.id}
                      className={`p-4 rounded-xl bg-white dark:bg-stone-900 border flex items-center justify-between gap-4 shadow-xs transition ${
                        isDraft
                          ? 'border-amber-400/80 dark:border-amber-500/50 bg-amber-500/[0.02]'
                          : 'border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-heading font-bold text-emerald-800 dark:text-emerald-400">
                            अध्याय {ch.chapterNumber}
                          </span>
                          <span className="text-[11px] text-stone-400 font-book">
                            {ch.series} • {ch.readTimeMinutes} मिनेट
                          </span>
                          {isDraft ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-heading font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                              मस्यौदा (Draft)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-heading font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                              प्रकाशित (Published)
                            </span>
                          )}
                        </div>
                        <h3 className="font-heading font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                          {ch.title}
                        </h3>
                        <p className="text-xs text-stone-500 font-book line-clamp-1">
                          {ch.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quick Toggle Status Button */}
                        <button
                          onClick={() => handleToggleChapterStatus(ch)}
                          title={isDraft ? 'तुरुन्त प्रकाशित गर्नुहोस् (पाठकलाई देखाउनुहोस्)' : 'मस्यौदा बनाउनुहोस् (पाठकबाट लुकाउनुहोस्)'}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-heading font-semibold flex items-center gap-1 transition cursor-pointer ${
                            isDraft
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/40'
                          }`}
                        >
                          {isDraft ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">{isDraft ? 'प्रकाशित गर्नुहोस्' : 'मस्यौदा बनाउनुहोस्'}</span>
                        </button>

                        <button
                          onClick={() => onOpenChapter(ch.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-book bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
                        >
                          पढ्नुहोस्
                        </button>
                        <button
                          onClick={() => {
                            setIsCreatingNew(false);
                            setEditingChapter({
                              ...ch,
                              content: ch.content
                            });
                          }}
                          className="p-2 rounded-lg text-amber-600 hover:bg-amber-500/10 transition cursor-pointer"
                          title="सम्पादन गर्नुहोस्"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(ch.id)}
                          className="p-2 rounded-lg text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                          title="मेटाउनुहोस्"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ARCHITECTURE & NOVELTY TAB */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            {/* Header / Gold Standard Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/10 via-amber-500/10 to-stone-100 dark:to-stone-900 border border-amber-500/30 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-heading font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>दार्शनिक वास्तुकला र नवीनता मापदण्ड (Intellectual Architecture)</span>
                  </div>
                  <h2 className="text-xl font-heading font-bold text-stone-900 dark:text-stone-100">
                    अध्याय १–१४ गोल्ड स्ट्यान्डर्ड र अध्याय १५ नयाँ मानक
                  </h2>
                  <p className="text-xs sm:text-sm font-book text-stone-600 dark:text-stone-300 mt-1 max-w-3xl leading-relaxed">
                    यो एप सामान्य धार्मिक लेखहरूको संग्रह होइन, बरु एउटा अविच्छिन्न विचारप्रधान ग्रन्थ (Continuous Book) हो। हरेक अध्यायमा नयाँ दार्शनिक प्रश्न, अद्वितीय दृष्टिकोण र गहिरो तार्किक शैली हुनुपर्छ। पुरानो एकै ढाँचा (Formulaic Pattern: भ्रम → खण्डन → सत्य) को सट्टा यहाँ हरेक अध्यायको आफ्नै बौद्धिक पहिचान (DNA) सुरक्षित गरिएको छ।
                  </p>
                </div>
                <button
                  onClick={() => onOpenChapter('ch-15')}
                  className="px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>अध्याय १५ (Gold Standard) पढ्नुहोस्</span>
                </button>
              </div>
            </div>

            {/* Showcase: Chapter 15 Re-engineered */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-heading font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30">
                    अध्याय १५ • Gold Standard
                  </span>
                  <h3 className="font-heading font-bold text-base text-stone-900 dark:text-stone-100">
                    न्यायको दिन (कयामत) र जवाफदेहिता
                  </h3>
                </div>
                <span className="text-xs font-book text-stone-500">
                  {CHAPTER_METADATA_REGISTRY[15]?.reasoningStyle}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700/70">
                  <div className="font-heading font-bold text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-600" />
                    <span>केन्द्रीय दार्शनिक प्रश्न (Central Question):</span>
                  </div>
                  <p className="font-book text-stone-700 dark:text-stone-300 leading-relaxed">
                    "{CHAPTER_METADATA_REGISTRY[15]?.centralQuestion}"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700/70">
                  <div className="font-heading font-bold text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>मुख्य प्रतिपादन (Core Argument):</span>
                  </div>
                  <p className="font-book text-stone-700 dark:text-stone-300 leading-relaxed">
                    {CHAPTER_METADATA_REGISTRY[15]?.coreArgument}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-heading font-semibold text-stone-500">मुख्य अवधारणाहरू:</span>
                  {CHAPTER_METADATA_REGISTRY[15]?.keyConcepts.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-stone-400 font-book">
                  शब्द संख्या: ३,२५०+ • ६ प्रमाणिक सन्दर्भ
                </div>
              </div>
            </div>

            {/* Novelty Test Bench */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-heading font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>अध्याय नवीनता र पुनरावृत्ति अडिट (10-Point Novelty Audit Engine)</span>
                </h3>
                <p className="text-xs text-stone-500 font-book mt-1">
                  कुनै पनि नयाँ अध्याय (अध्याय १६+) थप्नुअघि वा सम्पादन गर्दा यहाँ त्यसको बौद्धिक संरचना परीक्षण गर्नुहोस्। प्रणालीले अघिल्ला अध्यायहरूसँग तुलना गरेर दोहोरिएका तर्क, अवधारणा र संरचनागत समानता पत्ता लगाउँछ।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-stone-500 font-medium mb-1">परीक्षण अध्याय नम्बर</label>
                  <input
                    type="number"
                    value={testChapterNum}
                    onChange={(e) => setTestChapterNum(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-stone-500 font-medium mb-1">मुख्य विषय (Main Theme)</label>
                  <input
                    type="text"
                    value={testTheme}
                    onChange={(e) => setTestTheme(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-heading font-semibold"
                  />
                </div>
              </div>

              <div className="text-xs space-y-3">
                <div>
                  <label className="block text-stone-500 font-medium mb-1">केन्द्रीय दार्शनिक प्रश्न (Central Question)</label>
                  <input
                    type="text"
                    value={testQuestion}
                    onChange={(e) => setTestQuestion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-heading font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 font-medium mb-1">मुख्य प्रतिपादन (Core Argument)</label>
                  <textarea
                    rows={2}
                    value={testArgument}
                    onChange={(e) => setTestArgument(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-book"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-500 font-medium mb-1">अद्वितीय दृष्टिकोण (Unique Perspective)</label>
                    <input
                      type="text"
                      value={testPerspective}
                      onChange={(e) => setTestPerspective(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-book"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 font-medium mb-1">मुख्य अवधारणाहरू (अल्पविरामले छुट्याउनुहोस्)</label>
                    <input
                      type="text"
                      value={testConcepts}
                      onChange={(e) => setTestConcepts(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-book"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
                <span className="text-xs text-stone-500 font-book">
                  अध्याय १ देखि १५ सम्मका सबै रजिस्टर्ड अवधारणाहरूसँग तुलना गरिनेछ।
                </span>
                <button
                  onClick={handleRunNoveltyAudit}
                  className="px-5 py-2.5 rounded-xl text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>नवीनता परीक्षण चलाउनुहोस् (Run Novelty Audit)</span>
                </button>
              </div>

              {testValidationResult && (
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    testValidationResult.passed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-heading font-bold text-sm">
                      {testValidationResult.passed ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>नवीनता मापदण्ड उत्तीर्ण (Validation Passed)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>पुनरावलोकन आवश्यक (Needs Improvement)</span>
                        </>
                      )}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-white/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100">
                      नवीनता प्राप्तांक: {testValidationResult.score} / १००
                    </span>
                  </div>
                  <ul className="space-y-1 list-disc list-inside font-book text-stone-700 dark:text-stone-300">
                    {testValidationResult.feedback.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Explorer of Chapter Metadata Registry (1-15) */}
            <div className="space-y-4">
              <h3 className="text-base font-heading font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" />
                <span>अध्यायगत दार्शनिक यात्रा (Master Curriculum DNA Map)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CHAPTER_METADATA_REGISTRY).map(([chNumStr, meta]) => {
                  const chapterNumber = Number(chNumStr);
                  const matchingCh = chapters.find(c => c.chapterNumber === chapterNumber);
                  return (
                    <div
                      key={chapterNumber}
                      className={`p-4 rounded-xl border transition ${
                        chapterNumber === 15
                          ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/40 shadow-xs'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-heading font-bold text-emerald-800 dark:text-emerald-300">
                          अध्याय {chapterNumber}: {meta.mainTheme}
                        </span>
                        {chapterNumber === 15 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300">
                            Gold Standard
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-heading font-medium text-stone-800 dark:text-stone-200 mb-1">
                        "{meta.centralQuestion}"
                      </div>
                      <p className="text-[11px] font-book text-stone-500 dark:text-stone-400 line-clamp-2 mb-2">
                        {meta.coreArgument}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {meta.keyConcepts.map((kc, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                          >
                            {kc}
                          </span>
                        ))}
                      </div>
                      {matchingCh && (
                        <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 font-book">
                            {matchingCh.wordCount} शब्द • {matchingCh.readTimeMinutes} मिनेट
                          </span>
                          <button
                            onClick={() => onOpenChapter(matchingCh.id)}
                            className="text-emerald-700 dark:text-emerald-400 font-heading font-semibold hover:underline cursor-pointer"
                          >
                            पढ्नुहोस् →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* QUESTIONS INBOX TAB */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <h2 className="text-base font-heading font-bold text-stone-900 dark:text-stone-100">
              पाठकहरूले पठाएका प्रश्नहरू (Non-Muslim Reader Inquiries)
            </h2>

            {questions.length === 0 ? (
              <p className="p-8 text-center text-stone-400 font-book border border-dashed rounded-xl">
                अहिलेसम्म कुनै नयाँ प्रश्न प्राप्त भएको छैन।
              </p>
            ) : (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.status === 'answered'
                              ? 'bg-emerald-500/15 text-emerald-700'
                              : 'bg-amber-500/15 text-amber-700 animate-pulse'
                          }`}
                        >
                          {q.status === 'answered' ? 'उत्तर दिइसकियो' : 'उत्तर दिन बाँकी (Pending)'}
                        </span>
                        <span className="font-heading font-semibold text-stone-800 dark:text-stone-200">
                          {q.isAnonymous ? 'गुमनाम पाठक' : q.senderName}
                        </span>
                        {q.senderEmail && (
                          <span className="text-stone-400">({q.senderEmail})</span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400 font-book">
                        मिति: {q.createdAt}
                      </span>
                    </div>

                    {q.chapterTitle && (
                      <div className="text-xs text-emerald-800 dark:text-emerald-400 font-medium mb-1">
                        सन्दर्भ: {q.chapterTitle}
                      </div>
                    )}

                    <p className="text-sm font-book font-medium text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-lg border border-stone-200/60 dark:border-stone-700">
                      "{q.questionText}"
                    </p>

                    {/* Show existing answer if answered */}
                    {q.answerText && (
                      <div className="mt-3 p-3 rounded-lg bg-emerald-700/10 border-l-4 border-emerald-700 text-xs sm:text-sm font-book">
                        <span className="font-heading font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                          प्रमाणिक उत्तर ({q.answeredBy || 'रिसर्च बोर्ड'}):
                        </span>
                        <p className="text-stone-800 dark:text-stone-200 leading-relaxed">
                          {q.answerText}
                        </p>
                      </div>
                    )}

                    {/* Answer reply input box */}
                    {replyingQId === q.id ? (
                      <div className="mt-4 space-y-2">
                        <textarea
                          value={answerDraft}
                          onChange={(e) => setAnswerDraft(e.target.value)}
                          placeholder="कुरआन र सहीह हदीसको प्रमाणसहित आधिकारिक उत्तर लेख्नुहोस्..."
                          rows={3}
                          className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-book bg-white dark:bg-stone-800"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setReplyingQId(null)}
                            className="px-3 py-1.5 text-xs text-stone-500 cursor-pointer"
                          >
                            रद्द गर्नुहोस्
                          </button>
                          <button
                            onClick={() => handleAnswerQuestion(q.id)}
                            className="px-4 py-1.5 text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] rounded-lg cursor-pointer"
                          >
                            उत्तर सुरक्षित तथा प्रकाशित गर्नुहोस्
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            setReplyingQId(q.id);
                            setAnswerDraft(q.answerText || '');
                          }}
                          className="px-3 py-1.5 text-xs font-heading font-semibold rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
                        >
                          {q.answerText ? 'उत्तर सम्पादन गर्नुहोस्' : 'उत्तर लेख्नुहोस्'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COMMENTS MODERATION TAB */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <h2 className="text-base font-heading font-bold text-stone-900 dark:text-stone-100">
              पाठक टिप्पणी समीक्षा तथा स्पाम नियन्त्रण
            </h2>

            <div className="space-y-3">
              {allComments.map((comm) => (
                <div
                  key={comm.id}
                  className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start justify-between gap-4 shadow-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-heading font-bold text-stone-900 dark:text-stone-100">
                        {comm.authorName}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {comm.createdAt}
                      </span>
                      {comm.reportsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 text-[10px] font-bold flex items-center gap-0.5">
                          <Flag className="w-2.5 h-2.5" /> {comm.reportsCount} रिपोर्ट
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm font-book text-stone-800 dark:text-stone-200">
                      {comm.commentText}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(comm.id)}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                    title="टिप्पणी मेटाउनुहोस्"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 max-w-2xl">
            <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
              <h2 className="text-base font-heading font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                पाठकहरूलाई नयाँ सूचना पठाउनुहोस्
              </h2>
              <div className="space-y-3 text-xs font-book">
                <div>
                  <label className="block text-stone-500 mb-1">सूचना शीर्षक (Title)</label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="उदा. नयाँ अध्याय प्रकाशित वा अध्ययन गोष्ठी..."
                    className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">सन्देश (Message)</label>
                  <textarea
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    rows={3}
                    placeholder="सन्देश विस्तारमा लेख्नुहोस्..."
                    className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSendNotification}
                    className="px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>सूचना पठाउनुहोस्</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sent Notifications List */}
            <div>
              <h3 className="text-sm font-heading font-bold text-stone-700 dark:text-stone-300 mb-3">
                पहिले पठाइएका सूचनाहरू
              </h3>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs"
                  >
                    <div className="font-heading font-bold text-stone-900 dark:text-stone-100">
                      {n.title}
                    </div>
                    <p className="text-stone-600 dark:text-stone-400 font-book mt-0.5">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {n.createdAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BACKUP & NO-REBUILD CONTENT SYNC TAB */}
        {activeTab === 'backup' && (
          <div className="space-y-6 max-w-4xl">
            {/* Explanatory Header */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] text-[#fef3c7] shadow-lg border border-amber-500/50">
              <div className="flex items-center gap-2 text-[#fbbf24] font-heading font-bold text-sm mb-1">
                <Database className="w-4 h-4" />
                <span>No-Rebuild Content Architecture (बिना Rebuild नयाँ अध्याय थप्ने प्रणाली)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white mt-1">
                सामग्री निर्यात, आयात तथा तत्काल अद्यावधिक
              </h2>
              <p className="text-xs sm:text-sm font-book text-stone-200 mt-2 leading-relaxed">
                यस व्यवस्थापन प्रणालीबाट तपाईं पुस्तकका सबै ३२ अध्याय तथा नयाँ थपिएका अध्यायहरूको पूर्ण डेटा JSON ढाँचामा निर्यात (Export) गर्न सक्नुहुन्छ। नयाँ अध्याय तयार भएपछि वा सम्पादन गरेपछि यहाँ सिधै JSON पेस्ट गरेर तत्काल सुरक्षित गर्न सक्नुहुन्छ—यसका लागि एन्ड्रोइड एपलाई फेरि कम्पाइल, rebuild वा re-publish गरिरहनु पर्दैन!
              </p>
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-heading font-bold text-sm mb-1">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>अध्यायहरूको ब्याकअप डाउनलोड (Export JSON)</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-book mt-1">
                    हाल सुरक्षित रहेका सबै ({chapters.length}) अध्यायहरूको पूरा सामग्री JSON फाइलको रूपमा डाउनलोड गर्नुहोस्।
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={handleExportJSON}
                    className="flex-1 px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>JSON डाउनलोड</span>
                  </button>
                  <button
                    onClick={handleCopyJSON}
                    className="px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'प्रतिलिपि भयो!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Reset to Baseline Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-heading font-bold text-sm mb-1">
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>आधिकारिक मूल ३२ अध्याय रिसेट</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 font-book mt-1">
                    यदि कुनै परीक्षण अध्याय हटाएर फेरि मूल आधिकारिक ३२ अध्यायको प्रमाणीकरण स्थितिमा फर्कन चाहनुहुन्छ भने यस बटन प्रयोग गर्नुहोस्।
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={handleResetToBaseline}
                    className="w-full px-4 py-2 rounded-xl text-xs font-heading font-semibold border border-amber-500/50 text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>मूल ३२ अध्यायमा पुनःस्थापना</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Import JSON Box */}
            <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-heading font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    नयाँ वा परिमार्जित सामग्री आयात गर्नुहोस् (Import JSON)
                  </h3>
                  <p className="text-xs text-stone-500 font-book mt-0.5">
                    यहाँ नयाँ अध्यायहरूको मान्य JSON संरचना टाँस्नुहोस्। तुरुन्तै एपमा लागू हुनेछ।
                  </p>
                </div>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-book">
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-book flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}

              <div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  rows={6}
                  placeholder='[ { "id": "ch-33", "chapterNumber": 33, "title": "...", "content": ["..."], "status": "draft" } ]'
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setImportText('')}
                  className="px-4 py-2 rounded-xl text-xs font-book text-stone-500 hover:text-stone-700 cursor-pointer"
                >
                  खाली गर्नुहोस्
                </button>
                <button
                  onClick={handleImportJSON}
                  className="px-5 py-2.5 rounded-xl text-xs font-heading font-semibold bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>डेटा आयात र अद्यावधिक गर्नुहोस्</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Chapter Edit / Create Modal */}
      {editingChapter && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 w-full max-w-3xl rounded-2xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto font-book text-xs">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-heading font-bold text-stone-900 dark:text-stone-100">
                {isCreatingNew ? 'नयाँ अध्याय सिर्जना' : `अध्याय सम्पादन: ${editingChapter.title}`}
              </h3>
              <button
                onClick={() => setEditingChapter(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 mb-1">अध्याय नम्बर</label>
                  <input
                    type="number"
                    value={editingChapter.chapterNumber || 1}
                    onChange={(e) => setEditingChapter({ ...editingChapter, chapterNumber: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-500 mb-1">शृङ्खला (Series)</label>
                  <input
                    type="text"
                    value={editingChapter.series || ''}
                    onChange={(e) => setEditingChapter({ ...editingChapter, series: e.target.value })}
                    className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-500 mb-1">अध्यायको शीर्षक</label>
                <input
                  type="text"
                  value={editingChapter.title || ''}
                  onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 font-heading font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">उपशीर्षक / मुख्य दर्शन</label>
                <input
                  type="text"
                  value={editingChapter.subtitle || ''}
                  onChange={(e) => setEditingChapter({ ...editingChapter, subtitle: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">अरबी शीर्षक (Arabic Title)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={editingChapter.arabicTitle || ''}
                  onChange={(e) => setEditingChapter({ ...editingChapter, arabicTitle: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 font-arabic text-sm"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">प्रकाशन अवस्था</label>
                <select
                  value={editingChapter.status || 'draft'}
                  onChange={(e) => setEditingChapter({ ...editingChapter, status: e.target.value as Chapter['status'] })}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="draft">Draft — परीक्षणका लागि</option>
                  <option value="published">Published — अन्तिम स्वीकृति भएपछि</option>
                </select>
                <p className="mt-1 text-[10px] text-stone-400">पहिले Install/Preview गरेर जाँच गर्नुहोस्। ठीक भएपछि मात्र Published छान्नुहोस्।</p>
              </div>

              <div>
                <label className="block text-stone-500 mb-1">अध्यायको विषयवस्तु (Content Paragraphs - दुई लाइन खाली छोडेर छुट्याउनुहोस्)</label>
                <textarea
                  rows={8}
                  value={
                    Array.isArray(editingChapter.content)
                      ? editingChapter.content.join('\n\n')
                      : (editingChapter.content || '')
                  }
                  onChange={(e) => setEditingChapter({ ...editingChapter, content: e.target.value.split('\n\n') })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 leading-relaxed font-book"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">आत्म-चिन्तन (Reflection)</label>
                <textarea
                  rows={2}
                  value={editingChapter.reflection || ''}
                  onChange={(e) => setEditingChapter({ ...editingChapter, reflection: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div>
                <label className="block text-stone-500 mb-1">अर्को अध्यायको जिज्ञासा (Next Chapter Teaser)</label>
                <input
                  type="text"
                  value={editingChapter.nextChapterTeaser || ''}
                  onChange={(e) => setEditingChapter({ ...editingChapter, nextChapterTeaser: e.target.value })}
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  onClick={() => setEditingChapter(null)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  onClick={handleSaveChapter}
                  className="px-5 py-2 rounded-xl bg-[#064e3b] text-[#fef3c7] font-heading font-semibold hover:bg-[#047857] flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>सुरक्षित गर्नुहोस्</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
