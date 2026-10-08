import { ALL_CHAPTERS } from '../data/chaptersData';
import { Chapter, Question, Comment, Bookmark, ReadingProgress, ReaderSettings, AppNotification } from '../types';

const STORAGE_KEYS = {
  CHAPTERS: 'islam_darshan_chapters_v12',
  QUESTIONS: 'islam_darshan_questions_v1',
  COMMENTS: 'islam_darshan_comments_v1',
  BOOKMARKS: 'islam_darshan_bookmarks_v1',
  READING_PROGRESS: 'islam_darshan_progress_v1',
  FAVORITES: 'islam_darshan_favorites_v1',
  OFFLINE_DOWNLOADS: 'islam_darshan_offline_v1',
  SETTINGS: 'islam_darshan_settings_v1',
  NOTIFICATIONS: 'islam_darshan_notifications_v1',
  LAST_READ: 'islam_darshan_last_read_v1'
};

// Safe storage wrapper: in iframe sandboxes or when cookies/localStorage are restricted,
// gracefully falls back to memory without throwing uncaught SecurityError or QuotaExceededError
class SafeStorageManager {
  private memory = new Map<string, string>();

  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // Storage access blocked or restricted in sandboxed iframe
    }
    return this.memory.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // QuotaExceededError or SecurityError
    }
    this.memory.set(key, value);
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
    this.memory.delete(key);
  }
}

export const safeStorage = new SafeStorageManager();

// Initial sample comments to make the community vibrant
const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    chapterId: 'ch-3',
    authorName: 'रोशन श्रेष्ठ',
    authorId: 'user-guest-1',
    commentText: 'पैगम्बर मुहम्मद ﷺ को निष्कलंक चरित्र र ४० वर्षपछिको जीवन त्यागबारे यस्तो तार्किक र प्रमाणिक विश्लेषण मैले पहिलो पटक पढ्न पाएँ। विशेष गरी छोराको मृत्युमा सूर्यग्रहणको घटना र सत्ताको प्रस्ताव अस्वीकार गरेको प्रसंगले मन छोयो।',
    likesCount: 18,
    reportsCount: 0,
    isApproved: true,
    createdAt: '२०२६-०२-१५'
  },
  {
    id: 'comm-2',
    chapterId: 'ch-3',
    authorName: 'अब्दुल्लाह खान',
    authorId: 'user-guest-2',
    commentText: 'माशाअल्लाह, नेपाली भाषामा यस्तो प्रमाणिक र उच्चस्तरीय पुस्तक तयार पार्नुभएकोमा धेरै धेरै कृतज्ञता।',
    likesCount: 9,
    reportsCount: 0,
    isApproved: true,
    createdAt: '२०२६-०२-१८'
  },
  {
    id: 'comm-4-1',
    chapterId: 'ch-4',
    authorName: 'बिदुर दाहाल',
    authorId: 'user-guest-4',
    commentText: 'केतलीमा पानी उम्लेको उदाहरण र विज्ञान (How) तथा वह्य (Why) को सीमा छुट्ट्याइएको विश्लेषणले वर्षौंदेखिको मेरो बौद्धिक अन्योल शान्त पार्यो। "संयोग" शब्द आफैंमा कुनै कारण होइन भन्ने बुझाइ साँच्चै आँखै खोल्ने खालको छ।',
    likesCount: 14,
    reportsCount: 0,
    isApproved: true,
    createdAt: '२०२६-०२-२२'
  },
  {
    id: 'comm-29-1',
    chapterId: 'ch-29',
    authorName: 'डा. समिर अर्याल',
    authorId: 'user-guest-29-1',
    commentText: 'नित्सेको शून्यवाद र आधुनिक "तरल नैतिकता" लाई कुरआनको "हवा" (वासनाको ईश्वरीकरण) सँग जोडेर गरिएको यो बौद्धिक चिरफार साँच्चै आँखै खोल्ने खालको छ। विशेष गरी पानीजहाजको रूपकले आधुनिक अति-व्यक्तिवाद (Hyper-Individualism) को खोक्रोपनलाई गजबले उदाङ्गो पारेको छ।',
    likesCount: 16,
    reportsCount: 0,
    isApproved: true,
    createdAt: '२०२६-०२-२०'
  },
  {
    id: 'comm-29-2',
    chapterId: 'ch-29',
    authorName: 'सुमन सुवेदी',
    authorId: 'user-guest-29-2',
    commentText: 'आजको सामाजिक सञ्जाल र बजारले जब मानिसलाई केवल उपभोग्य वस्तु बनाइदिएको छ, कुरआनको "करामतुल इन्सान" (मानव मर्यादाको पराभौतिक धरातल) ले वास्तविक समाधान दिन्छ। यो अध्याय दर्शनशास्त्रका विद्यार्थीहरूका लागि अनिवार्य पाठ हो।',
    likesCount: 11,
    reportsCount: 0,
    isApproved: true,
    createdAt: '२०२६-०२-२१'
  },
  {
    id: 'comm-30-1',
    chapterId: 'ch-30',
    authorName: 'इन्जिनियर प्रविण न्यौपाने',
    authorId: 'user-guest-30-1',
    commentText: 'कार्टेसियन मेकानिस्टिक अहङ्कार र कुरआनको "अल-मीजान" बीचको यो तुलनात्मक अध्ययन अत्यन्तै शक्तिशाली छ। बगिरहेको नदीमा पनि पानी खेर नफाल्ने र कयामतकै दिन पनि बिरुवा रोप्ने पैगम्बरी सन्देशले वातावरण संरक्षणलाई सामान्य फेसनबाट उठाएर ईमानको पराभौतिक धरातलमा स्थापित गरिदिएको छ।',
    likesCount: 19,
    reportsCount: 0,
    isApproved: true,
    createdAt: '२०२६-०२-२२'
  },
  {
    id: 'comm-30-2',
    chapterId: 'ch-30',
    authorName: 'सविना मानन्धर',
    authorId: 'user-guest-30-2',
    commentText: 'सूरह अल-अनआम (६:३८) मा पशु-पक्षीलाई मानवजस्तै "उम्मह" (सार्वभौम समुदाय) मानिएको आयत र बिरालो तथा तिर्खाएको कुकुरको न्यायशास्त्रले आँखा रसायो। जलवायु संकटको युगमा यस्तो गहिरो इको-थियोलोजी नेपाली भाषामा पढ्न पाउनु गौरवको कुरा हो।',
    likesCount: 15,
    reportsCount: 0,
    isApproved: true,
    createdAt: '२०२६-०२-२२'
  }
];

// Initial sample reader questions for Admin CMS
const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-sample-30-1',
    chapterId: 'ch-30',
    chapterTitle: 'पर्यावरण दर्शन र ब्रह्माण्डीय सन्तुलन — प्रकृतिमाथि मानवको विजय कि पवित्र अमानत?',
    questionText: 'यदि मानिस प्रकृतिको मालिक होइन केवल संरक्षक (खलीफा) मात्र हो भने, आजका आधुनिक कर्पोरेसनहरूले प्राकृतिक स्रोतहरूको दोहन गर्दा इस्लामिक अर्थशास्त्रले कस्तो नियम लागू गर्छ?',
    isAnonymous: false,
    senderName: 'अमृता दाहाल',
    senderEmail: 'amrita.dahal@example.com',
    status: 'answered',
    answerText: 'इस्लामिक न्यायशास्त्रमा "ला दरर व ला दिरार" (न आफूलाई नोक्सान पुर्‍याऊ, न अरूलाई वा पर्यावरणलाई नोक्सान पुर्‍याऊ) भन्ने सार्वभौम कानुनी नियम छ। प्राकृतिक स्रोतहरू कुनै व्यक्तिको निजी एकाधिकार होइनन्; ती सम्पूर्ण सृष्टिको साझा अमानत हुन्। त्यसैले नाफाका लागि नदी दूषित गर्ने, जङ्गल विनाश गर्ने वा हावामा विष घोल्ने कर्पोरेट गतिविधिलाई इस्लामले "फसाद फिल-अर्द" (पृथ्वीमाथि अपराध) मान्दछ र राज्यलाई त्यसलाई रोक्ने पूर्ण कानुनी अधिकार दिन्छ।',
    answeredBy: 'इस्लामिक अध्ययन बोर्ड',
    createdAt: '२०२६-०२-२२'
  },
  {
    id: 'q-sample-29-1',
    chapterId: 'ch-29',
    chapterTitle: 'नैतिकता र आधुनिकताको द्वन्द्वमा कुरआनको मार्गदर्शन',
    questionText: 'आधुनिक समाजमा बहुसंख्यक मानिसहरूले कुनै कुरालाई सहमति दिए भने त्यसलाई किन अनैतिक मान्ने? बहुमतको निर्णय नै सत्य किन हुन सक्दैन?',
    isAnonymous: false,
    senderName: 'विवेक ढकाल',
    senderEmail: 'bibek.dhakal@example.com',
    status: 'answered',
    answerText: 'इतिहास साक्षी छ कि धेरै पटक बहुमत गलत बाटोमा हिँडेको छ— दासप्रथा, जातीय विभेद र औपनिवेशिक नरसंहार पनि कुनै समय बहुमतकै सहमतिमा चलेका थिए। कुरआनले सूरह अल-अनआम (६:११६) मा भन्छ: "यदि तपाईं पृथ्वीका बहुसंख्यक मानिसहरूको पछि लाग्नुभयो भने उनीहरूले तपाईंलाई अल्लाहको बाटोबाट भड्काइदिनेछन्।" सत्य कुनै जनमत संग्रहको मतपत्र होइन; सत्य वस्तुनिष्ठ र शाश्वत हुन्छ, जसको सर्वोच्च मानक ईश्वरको न्याय (फुरकान) हो।',
    answeredBy: 'इस्लामिक अध्ययन बोर्ड',
    createdAt: '२०२६-०२-२१'
  },
  {
    id: 'q-sample-1',
    chapterId: 'ch-3',
    chapterTitle: 'मुहम्मद ﷺ वास्तवमै अल्लाहका सन्देष्टा हुनुहुन्थ्यो भन्ने प्रमाण के हो?',
    questionText: 'यदि मुहम्मद ﷺ ले सांसारिक लाभ नचाहेको भए उहाँले आफ्ना अनुयायीहरूलाई युद्ध लड्न किन अनुमति दिनुभयो?',
    isAnonymous: false,
    senderName: 'अनिल पौडेल',
    senderEmail: 'anil.p@example.com',
    status: 'answered',
    answerText: 'नमस्ते अनिलजी, पैगम्बर ﷺ र उहाँका अनुयायीहरूले मक्कामा १३ वर्षसम्म चरम दमन, बहिष्कार र हत्या चुपचाप सहे तर कहिल्यै हात उठाएनन्। मदिना गइसकेपछि पनि उनीहरूमाथि मक्काका कुराैशहरूले आक्रमण जारी राखेपछि मात्र सूरह अल-हज (२२:३९) मार्फत आत्मरक्षा र उत्पीडितहरूको सुरक्षाका लागि मात्र युद्धको अनुमति दिइएको थियो। युद्ध सत्ता वा भूभाग कब्जा गर्नका लागि होइन, धार्मिक स्वतन्त्रता र निर्दोषहरूको जीवन रक्षाका लागि थियो।',
    answeredBy: 'इस्लामिक अध्ययन बोर्ड',
    createdAt: '२०२६-०२-२०'
  }
];

export const StorageService = {
  // Chapters
  getChapters(): Chapter[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.CHAPTERS);
      if (stored) {
        const parsed: Chapter[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Verify that all 32 default baseline chapters exist in stored data.
          // If any are missing (e.g. from an earlier build with only 30 chapters),
          // or if any stored chapter still contains the old placeholder text while default is rich,
          // intelligently update them so no foundation chapters or rich updates are lost!
          const defaultMap = new Map(ALL_CHAPTERS.map(c => [c.id, c]));
          let hasUpgrades = false;
          const upgradedParsed = parsed.map(c => {
            const def = defaultMap.get(c.id);
            if (def && (c.id === 'ch-1' || c.chapterNumber === 1) && (c.title !== def.title || c.subtitle !== def.subtitle || c.content?.[0] !== def.content?.[0] || (c.wordCount || 0) < 3000 || c.content?.length !== def.content?.length)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-2' || c.chapterNumber === 2) && (c.title !== def.title || c.content?.[0] !== def.content?.[0])) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-3' || c.chapterNumber === 3) && (c.title !== def.title || c.content?.[0] !== def.content?.[0])) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-4' || c.chapterNumber === 4) && (c.title !== def.title || c.content?.[0] !== def.content?.[0] || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-5' || c.chapterNumber === 5) && (c.title !== def.title || c.content?.[0] !== def.content?.[0] || (c.wordCount || 0) < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-6' || c.chapterNumber === 6) && (c.title !== def.title || c.content?.[0] !== def.content?.[0] || (c.wordCount || 0) < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-7' || c.chapterNumber === 7) && (c.title !== def.title || c.content?.[0] !== def.content?.[0] || (c.wordCount || 0) < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-8' || c.chapterNumber === 8) && (c.title !== def.title || c.content?.[0] !== def.content?.[0] || (c.wordCount || 0) < 4000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-9' || c.chapterNumber === 9) && (c.title !== def.title || c.content?.[0] !== def.content?.[0] || (c.wordCount || 0) < 4000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-10' || c.chapterNumber === 10) && (c.title !== def.title || c.content?.[0] !== def.content?.[0] || (c.wordCount || 0) < 4000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-11' || c.chapterNumber === 11) && (c.title !== def.title || c.content?.[0] !== def.content?.[0] || (c.wordCount || 0) < 4000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-12' || c.chapterNumber === 12) && (c.title !== def.title || c.content?.[0] !== def.content?.[0] || (c.wordCount || 0) < 4000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && c.content?.[0]?.includes('को गहिराइमा प्रवेश गर्छौं') && !def.content?.[0]?.includes('को गहिराइमा प्रवेश गर्छौं')) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-15' || c.chapterNumber === 15) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-16' || c.chapterNumber === 16) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-17' || c.chapterNumber === 17) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-18' || c.chapterNumber === 18) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-19' || c.chapterNumber === 19) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-20' || c.chapterNumber === 20) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-21' || c.chapterNumber === 21) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-22' || c.chapterNumber === 22) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-23' || c.chapterNumber === 23) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-24' || c.chapterNumber === 24) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-25' || c.chapterNumber === 25) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-26' || c.chapterNumber === 26) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-27' || c.chapterNumber === 27) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-28' || c.chapterNumber === 28) && (c.wordCount < 3000 || !c.intellectualMetadata)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-29' || c.chapterNumber === 29) && (c.wordCount < 3000 || !c.intellectualMetadata || c.title !== def.title)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-30' || c.chapterNumber === 30) && (c.wordCount < 3000 || !c.intellectualMetadata || c.title !== def.title)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-31' || c.chapterNumber === 31) && (c.wordCount < 3000 || !c.intellectualMetadata || c.title !== def.title)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && (c.id === 'ch-32' || c.chapterNumber === 32) && (!c.intellectualMetadata || c.title !== def.title)) {
              hasUpgrades = true;
              return { ...def, status: c.status || def.status };
            }
            if (def && def.intellectualMetadata && !c.intellectualMetadata) {
              hasUpgrades = true;
              return { ...c, intellectualMetadata: def.intellectualMetadata };
            }
            return c;
          });

          const storedIds = new Set(upgradedParsed.map(c => c.id));
          const missingDefaults = ALL_CHAPTERS.filter(c => !storedIds.has(c.id));
          if (missingDefaults.length > 0 || hasUpgrades) {
            const merged = [...upgradedParsed, ...missingDefaults].sort((a, b) => a.chapterNumber - b.chapterNumber);
            safeStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(merged));
            return merged;
          }
          return upgradedParsed;
        }
      }
    } catch {
      // fallback
    }
    safeStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(ALL_CHAPTERS));
    return ALL_CHAPTERS;
  },

  saveChapters(chapters: Chapter[]): void {
    safeStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  },

  resetToDefaultChapters(): Chapter[] {
    safeStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(ALL_CHAPTERS));
    return ALL_CHAPTERS;
  },

  exportChaptersJSON(): string {
    const chapters = this.getChapters();
    return JSON.stringify(chapters, null, 2);
  },

  importChaptersJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'अमान्य ढाँचा: JSON सूची (Array) हुनुपर्छ।' };
      }
      if (parsed.length === 0) {
        return { success: false, count: 0, error: 'JSON खाली छ।' };
      }

      // Validate required chapter fields
      for (const ch of parsed) {
        if (!ch.id || !ch.title || typeof ch.chapterNumber !== 'number' || !Array.isArray(ch.content)) {
          return { success: false, count: 0, error: `अध्याय ${ch.chapterNumber || ''} को ढाँचा अमान्य छ (id, title, chapterNumber, वा content अपुग)।` };
        }
        if (!ch.status) {
          ch.status = 'published';
        }
      }

      this.saveChapters(parsed);
      return { success: true, count: parsed.length };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, count: 0, error: `JSON पार्स गर्न सकिएन: ${msg}` };
    }
  },

  addChapter(newChapter: Omit<Chapter, 'id'>): Chapter {
    const chapters = this.getChapters();
    const nextId = `ch-${Date.now()}`;
    const chapter: Chapter = {
      ...newChapter,
      id: nextId,
      status: newChapter.status || 'draft', // New chapters default to draft
    };
    const updated = [...chapters, chapter];
    this.saveChapters(updated);

    // Auto-create notification for new chapter if published
    if (chapter.status === 'published') {
      this.addNotification({
        title: `नयाँ अध्याय प्रकाशित: ${chapter.title}`,
        message: `अध्याय ${chapter.chapterNumber} अहिले उपलब्ध छ। पढ्नका लागि ट्याप गर्नुहोस्।`,
        chapterId: chapter.id,
        type: 'new_chapter'
      });
    }

    return chapter;
  },

  updateChapter(id: string, updates: Partial<Chapter>): Chapter | null {
    const chapters = this.getChapters();
    const index = chapters.findIndex(c => c.id === id);
    if (index === -1) return null;
    const wasDraft = chapters[index].status === 'draft';
    chapters[index] = { ...chapters[index], ...updates };
    this.saveChapters(chapters);

    // If transitioned from draft to published, trigger notification
    if (wasDraft && chapters[index].status === 'published') {
      this.addNotification({
        title: `नयाँ अध्याय प्रकाशित: ${chapters[index].title}`,
        message: `अध्याय ${chapters[index].chapterNumber} अहिले सार्वजनिक रूपमा उपलब्ध छ।`,
        chapterId: chapters[index].id,
        type: 'new_chapter'
      });
    }

    return chapters[index];
  },

  deleteChapter(id: string): boolean {
    const chapters = this.getChapters();
    const filtered = chapters.filter(c => c.id !== id);
    this.saveChapters(filtered);
    return true;
  },

  // Questions
  getQuestions(): Question[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    safeStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    return INITIAL_QUESTIONS;
  },

  submitQuestion(data: {
    chapterId?: string;
    chapterTitle?: string;
    questionText: string;
    isAnonymous: boolean;
    senderName?: string;
    senderEmail?: string;
  }): Question {
    const questions = this.getQuestions();
    const newQ: Question = {
      id: `q-${Date.now()}`,
      chapterId: data.chapterId,
      chapterTitle: data.chapterTitle,
      questionText: data.questionText.trim(),
      isAnonymous: data.isAnonymous,
      senderName: data.isAnonymous ? 'गुमनाम पाठक' : (data.senderName?.trim() || 'जिज्ञासु पाठक'),
      senderEmail: data.isAnonymous ? undefined : data.senderEmail?.trim(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    questions.unshift(newQ);
    safeStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    return newQ;
  },

  answerQuestion(questionId: string, answerText: string): void {
    const questions = this.getQuestions();
    const q = questions.find(item => item.id === questionId);
    if (q) {
      q.answerText = answerText;
      q.status = 'answered';
      q.answeredBy = 'इस्लाम दर्शन रिसर्च बोर्ड';
      safeStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    }
  },

  // Comments
  getComments(chapterId?: string): Comment[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.COMMENTS);
      const comments: Comment[] = stored ? JSON.parse(stored) : INITIAL_COMMENTS;
      if (chapterId) {
        return comments.filter(c => c.chapterId === chapterId && c.isApproved);
      }
      return comments;
    } catch {
      return INITIAL_COMMENTS;
    }
  },

  addComment(commentData: {
    chapterId: string;
    authorName: string;
    commentText: string;
    parentId?: string;
  }): { success: boolean; comment?: Comment; error?: string } {
    // Built-in spam filter
    const text = commentData.commentText.trim();
    if (text.length < 3) return { success: false, error: 'प्रतिक्रिया कम्तीमा ३ अक्षरको हुनुपर्छ।' };
    
    // Check spam words or suspicious URLs
    const spamPatterns = [/http[s]?:\/\//i, /casino/i, /lottery/i, /crypto/i];
    if (spamPatterns.some(pat => pat.test(text))) {
      return { success: false, error: 'लिंक वा विज्ञापन पोस्ट गर्न अनुमति छैन।' };
    }

    const comments = this.getComments();
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      chapterId: commentData.chapterId,
      authorName: commentData.authorName.trim() || 'एक पाठक',
      authorId: 'user-client',
      commentText: text,
      parentId: commentData.parentId,
      likesCount: 0,
      reportsCount: 0,
      isApproved: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    comments.unshift(newComment);
    safeStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    return { success: true, comment: newComment };
  },

  likeComment(commentId: string): void {
    const comments = this.getComments();
    const c = comments.find(item => item.id === commentId);
    if (c) {
      if (!c.likedByMe) {
        c.likesCount += 1;
        c.likedByMe = true;
      } else {
        c.likesCount = Math.max(0, c.likesCount - 1);
        c.likedByMe = false;
      }
      safeStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    }
  },

  reportComment(commentId: string): void {
    const comments = this.getComments();
    const c = comments.find(item => item.id === commentId);
    if (c) {
      c.reportsCount += 1;
      if (c.reportsCount >= 3) {
        c.isApproved = false; // Auto-hide reported spam
      }
      safeStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    }
  },

  deleteComment(commentId: string): void {
    const comments = this.getComments();
    const updated = comments.filter(c => c.id !== commentId);
    safeStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(updated));
  },

  // Bookmarks
  getBookmarks(): Bookmark[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark(chapter: Chapter, scrollPercentage = 0): boolean {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex(b => b.chapterId === chapter.id);
    let isBookmarked = false;

    if (index >= 0) {
      bookmarks.splice(index, 1);
      isBookmarked = false;
    } else {
      bookmarks.unshift({
        id: `bm-${Date.now()}`,
        chapterId: chapter.id,
        chapterNumber: chapter.chapterNumber,
        chapterTitle: chapter.title,
        scrollPercentage: Math.round(scrollPercentage),
        createdAt: new Date().toISOString().split('T')[0]
      });
      isBookmarked = true;
    }

    safeStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return isBookmarked;
  },

  isChapterBookmarked(chapterId: string): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.chapterId === chapterId);
  },

  // Reading Progress & Last Read
  getReadingProgress(): Record<string, ReadingProgress> {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  updateReadingProgress(chapterId: string, progressPercent: number): void {
    const allProgress = this.getReadingProgress();
    allProgress[chapterId] = {
      chapterId,
      progressPercent: Math.min(100, Math.max(0, Math.round(progressPercent))),
      completed: progressPercent >= 90,
      lastReadAt: new Date().toISOString()
    };
    safeStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(allProgress));

    // Save as last read chapter for continue reading button
    safeStorage.setItem(STORAGE_KEYS.LAST_READ, chapterId);
  },

  getLastReadChapterId(): string | null {
    return safeStorage.getItem(STORAGE_KEYS.LAST_READ) || 'ch-1';
  },

  // Favorites
  getFavorites(): string[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  toggleFavorite(chapterId: string): boolean {
    const favs = this.getFavorites();
    const index = favs.indexOf(chapterId);
    let isFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
      isFav = false;
    } else {
      favs.push(chapterId);
      isFav = true;
    }
    safeStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    return isFav;
  },

  isFavorite(chapterId: string): boolean {
    return this.getFavorites().includes(chapterId);
  },

  // Offline Downloads
  getOfflineChapters(): string[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.OFFLINE_DOWNLOADS);
      return stored ? JSON.parse(stored) : ['ch-1', 'ch-2'];
    } catch {
      return ['ch-1', 'ch-2'];
    }
  },

  toggleOfflineDownload(chapterId: string): boolean {
    const list = this.getOfflineChapters();
    const index = list.indexOf(chapterId);
    let downloaded = false;
    if (index >= 0) {
      list.splice(index, 1);
      downloaded = false;
    } else {
      list.push(chapterId);
      downloaded = true;
    }
    safeStorage.setItem(STORAGE_KEYS.OFFLINE_DOWNLOADS, JSON.stringify(list));
    return downloaded;
  },

  isDownloaded(chapterId: string): boolean {
    return this.getOfflineChapters().includes(chapterId);
  },

  // Settings
  getSettings(): ReaderSettings {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      fontSize: 'medium',
      theme: 'cream',
      lineHeight: 'relaxed'
    };
  },

  saveSettings(settings: ReaderSettings): void {
    safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Notifications
  getNotifications(): AppNotification[] {
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    const initial: AppNotification[] = [
      {
        id: 'notif-welcome',
        title: 'इस्लाम दर्शनमा हार्दिक स्वागत छ',
        message: 'सत्यको अनुसन्धान, प्रमाणको परीक्षण र निष्पक्ष अध्ययनको यो यात्रामा तपाईंलाई स्वागत गर्दछौं।',
        chapterId: 'ch-3',
        type: 'announcement',
        read: false,
        createdAt: '२०२६-०२-१५'
      }
    ];
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initial));
    return initial;
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): void {
    const list = this.getNotifications();
    const newN: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    list.unshift(newN);
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  },

  markNotificationsRead(): void {
    const list = this.getNotifications();
    list.forEach(n => { n.read = true; });
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }
};
