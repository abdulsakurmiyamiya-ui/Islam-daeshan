import React, { useState } from 'react';
import { HadithReference } from '../types';
import { Scroll, Copy, Check, ShieldCheck } from 'lucide-react';

interface HadithCardProps {
  hadith: HadithReference;
}

export const HadithCard: React.FC<HadithCardProps> = ({ hadith }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `"${hadith.nepaliTranslation}"\n— [स्रोत: ${hadith.source}, हदीस नं. ${hadith.hadithNumber} (${hadith.grade})]`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 p-5 sm:p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border-2 border-amber-600/30 shadow-sm relative">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-semibold text-amber-900 dark:text-amber-400">
          <span className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-800 dark:text-amber-300 flex items-center justify-center">
            <Scroll className="w-3.5 h-3.5" />
          </span>
          <span>
            {hadith.source} (हदीस नं. {hadith.hadithNumber})
          </span>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700/10 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30">
            <ShieldCheck className="w-2.5 h-2.5" />
            {hadith.grade}
          </span>
        </div>
        <button
          onClick={handleCopy}
          title="हदीस प्रतिलिपि गर्नुहोस्"
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-amber-600/10 hover:bg-amber-600/20 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'कपी भयो' : 'कपी'}</span>
        </button>
      </div>

      {/* Arabic Snippet if available */}
      {hadith.arabicSnippet && (
        <div
          dir="rtl"
          className="pt-3 pb-2 text-lg sm:text-xl font-arabic text-emerald-900 dark:text-emerald-300 leading-relaxed text-right"
        >
          {hadith.arabicSnippet}
        </div>
      )}

      {/* Nepali Translation */}
      <div className="pt-2 text-base sm:text-lg font-book text-stone-800 dark:text-stone-200 leading-relaxed border-l-4 border-amber-600 pl-3.5 my-2">
        {hadith.nepaliTranslation}
      </div>

      {hadith.narrator && (
        <div className="mt-2 text-xs text-stone-600 dark:text-stone-400 font-book">
          <span className="font-medium text-amber-800 dark:text-amber-300">वर्णनकर्ता: </span>
          {hadith.narrator}
        </div>
      )}

      {hadith.context && (
        <div className="mt-3 pt-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-book border-t border-amber-500/20">
          <span className="font-semibold text-amber-900 dark:text-amber-300">सन्दर्भ: </span>
          {hadith.context}
        </div>
      )}
    </div>
  );
};
