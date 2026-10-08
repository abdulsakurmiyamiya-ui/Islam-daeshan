/**
 * Islam Darshan - Application Type Definitions
 */

export interface AyahReference {
  id: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number | string;
  arabicText: string;
  nepaliTranslation: string;
  context?: string;
}

export interface HadithReference {
  id: string;
  source: string; // e.g., 'सहीह अल-बुखारी', 'सहीह मुस्लिम', 'सुनन अन-नसाई'
  hadithNumber: string | number;
  narrator?: string;
  arabicSnippet?: string;
  nepaliTranslation: string;
  grade: 'सहीह' | 'हसन' | 'मुत्तफक अलैह' | (string & {});
  context?: string;
}

export interface ChapterFAQ {
  question: string;
  answer: string;
  referenceQuote?: string;
}

export interface ChapterIntellectualMetadata {
  chapterNumber?: number;  // The chapter number this metadata belongs to
  centralQuestion: string; // The primary philosophical inquiry driving the chapter
  coreArgument: string;    // The central thesis/argument proved
  mainTheme: string;       // Primary theological / philosophical theme
  evidenceUsed: string[];  // Primary Quranic and Hadith proofs used
  keyConcepts: string[];   // Unique key concepts introduced
  uniquePerspective: string; // Why this chapter is novel and non-repetitive
  reasoningStyle?: string; // The distinct reasoning methodology (Ethical, Historical, Comparative, Dialectical)
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  arabicTitle: string;
  subtitle: string;
  series: 'आधारभूत दर्शन' | 'ईश्वर र सृष्टि' | 'मानवीय मूल्य र समाज' | 'शंका र समाधान' | 'ऐतिहासिक दृष्टि' | 'आध्यात्मिक यात्रा' | 'ग्रन्थ र स्रोत' | (string & {});
  readTimeMinutes: number;
  wordCount: number;
  summary: string;
  content: string[]; // High quality rich narrative paragraphs
  ayahReferences: AyahReference[];
  hadithReferences: HadithReference[];
  commonQuestionsAnswered: ChapterFAQ[];
  reflection: string;
  nextChapterTeaser: string;
  status: 'published' | 'draft';
  coverUrl?: string;
  audioDuration?: string;
  intellectualMetadata?: ChapterIntellectualMetadata;
}

export interface Question {
  id: string;
  chapterId?: string;
  chapterTitle?: string;
  questionText: string;
  isAnonymous: boolean;
  senderName?: string;
  senderEmail?: string;
  status: 'pending' | 'answered' | 'archived';
  answerText?: string;
  answeredBy?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  chapterId: string;
  authorName: string;
  authorId: string;
  commentText: string;
  parentId?: string;
  likesCount: number;
  likedByMe?: boolean;
  reportsCount: number;
  isApproved: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface Bookmark {
  id: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  scrollPercentage: number;
  note?: string;
  createdAt: string;
}

export interface ReadingProgress {
  chapterId: string;
  progressPercent: number;
  completed: boolean;
  lastReadAt: string;
}

export interface DictionaryTerm {
  id: string;
  term: string;
  transliteration: string;
  arabicScript: string;
  meaning: string;
  detailedExplanation: string;
  category: 'तौहीद र अकीदा' | 'इबादत र उपासना' | 'आचारसंहिता र चरित्र' | 'ग्रन्थ र स्रोत' | 'समाज र न्याय';
  references?: string;
}

export interface DailyAyah {
  arabic: string;
  reference: string;
  nepali: string;
  explanation: string;
}

export interface DailyHadith {
  arabic?: string;
  source: string;
  hadithNumber: string;
  nepali: string;
  lesson: string;
}

export interface DailyThought {
  title: string;
  reflection: string;
  actionPoint: string;
}

export interface ReaderSettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  theme: 'cream' | 'sepia' | 'darkEmerald';
  lineHeight: 'normal' | 'relaxed' | 'loose';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  chapterId?: string;
  type: 'new_chapter' | 'announcement' | 'daily_thought';
  read: boolean;
  createdAt: string;
}
