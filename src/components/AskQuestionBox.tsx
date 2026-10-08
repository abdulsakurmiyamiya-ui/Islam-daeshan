import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { HelpCircle, Send, UserX, CheckCircle2, Lock } from 'lucide-react';

interface AskQuestionBoxProps {
  chapterId?: string;
  chapterTitle?: string;
}

export const AskQuestionBox: React.FC<AskQuestionBoxProps> = ({
  chapterId,
  chapterTitle,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSend = (isAnonymous: boolean) => {
    if (!questionText.trim()) {
      setErrorMsg('कृपया आफ्नो प्रश्न वा जिज्ञासा लेख्नुहोस्।');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);

    try {
      StorageService.submitQuestion({
        chapterId,
        chapterTitle,
        questionText,
        isAnonymous,
        senderName: isAnonymous ? undefined : senderName,
        senderEmail: isAnonymous ? undefined : senderEmail,
      });

      setSubmitting(false);
      setSubmitted(true);
      setQuestionText('');
      setSenderName('');
      setSenderEmail('');
    } catch {
      setSubmitting(false);
      setErrorMsg('प्रश्न पठाउँदा समस्या भयो, कृपया पुनः प्रयास गर्नुहोस्।');
    }
  };

  return (
    <div id="ask-question-box" className="my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#064e3b]/15 via-[#022c22]/10 to-amber-500/10 border-2 border-[#d97706]/50 shadow-md relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-[#064e3b] flex items-center justify-center shadow">
          <HelpCircle className="w-5 h-5 font-bold" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-heading font-bold text-emerald-950 dark:text-emerald-300">
            तपाईंको मनमा कुनै जिज्ञासा छ?
          </h3>
          <p className="text-xs sm:text-sm font-book text-stone-600 dark:text-stone-400">
            कुनै पनि प्रश्न संकोच विना सोध्नुहोस्। प्रमाणमा आधारित उत्तर प्रदान गरिनेछ।
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center my-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
          <h4 className="font-heading font-bold text-emerald-900 dark:text-emerald-300 text-base">
            तपाईंको जिज्ञासा सफलतापूर्वक सुरक्षित भयो!
          </h4>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-book mt-1">
            विद्वान शोधकर्ताहरूद्वारा यसको उत्तर समीक्षा गरी चाँडै अपडेट गरिनेछ।
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition cursor-pointer"
          >
            अर्को प्रश्न सोध्नुहोस्
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-book">
              {errorMsg}
            </div>
          )}

          {/* Main Question Textarea */}
          <textarea
            id="question-input-field"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="आफ्नो प्रश्न, शंका वा जिज्ञासा यहाँ विस्तारपूर्वक लेख्नुहोस्..."
            rows={3}
            className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 placeholder-stone-400 text-sm font-book focus:outline-none focus:ring-2 focus:ring-[#d97706] transition"
          />

          {/* Optional Identity Toggle */}
          <div className="flex items-center justify-between text-xs font-book text-stone-500 dark:text-stone-400">
            <button
              type="button"
              onClick={() => setShowOptionalFields(!showOptionalFields)}
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer underline decoration-dotted"
            >
              {showOptionalFields ? '– नाम र इमेल लुकाउनुहोस्' : '+ नाम र इमेल राख्न चाहनुहुन्छ? (ऐच्छिक)'}
            </button>
            <span className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
              <Lock className="w-3 h-3" /> पूर्ण गोपनीयता
            </span>
          </div>

          {showOptionalFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="तपाईंको नाम (ऐच्छिक)"
                className="p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-book text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="तपाईंको इमेल (उत्तर प्राप्त गर्नका लागि)"
                className="p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-book text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Action Buttons: Regular & Anonymous */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              id="send-question-btn"
              disabled={submitting}
              onClick={() => handleSend(false)}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl font-heading font-semibold text-xs sm:text-sm bg-[#064e3b] text-[#fef3c7] hover:bg-[#047857] shadow-sm border border-emerald-600/40 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Send className="w-4 h-4 text-[#fbbf24]" />
              <span>प्रश्न पठाउनुहोस्</span>
            </button>

            <button
              id="send-anonymous-question-btn"
              disabled={submitting}
              onClick={() => handleSend(true)}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl font-heading font-semibold text-xs sm:text-sm bg-[#d97706]/20 text-[#b45309] dark:text-[#fde68a] hover:bg-[#d97706]/30 border border-[#d97706]/50 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <UserX className="w-4 h-4 text-[#b45309] dark:text-[#fde68a]" />
              <span>गुमनाम रूपमा पठाउनुहोस्</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
