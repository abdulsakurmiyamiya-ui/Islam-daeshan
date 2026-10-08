import React, { useState } from 'react';
import { AyahReference } from '../types';
import { BookOpen, Copy, Check, Share2 } from 'lucide-react';

interface AyahCardProps {
  ayah: AyahReference;
}

export const AyahCard: React.FC<AyahCardProps> = ({ ayah }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `${ayah.arabicText}\n\n"${ayah.nepaliTranslation}"\n— [${ayah.surahName} ${ayah.surahNumber}:${ayah.ayahNumber}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#064e3b]/10 via-[#047857]/5 to-amber-500/5 border-2 border-[#d97706]/40 shadow-sm relative overflow-hidden">
      {/* Background Islamic Watermark Motif */}
      <div className="absolute -right-6 -bottom-6 text-7xl text-[#d97706]/10 font-arabic select-none pointer-events-none">
        ۝
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#d97706]/20">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-heading font-semibold text-[#065f46]">
          <span className="w-6 h-6 rounded-full bg-[#d97706]/20 text-[#b45309] flex items-center justify-center text-xs">
            <BookOpen className="w-3.5 h-3.5" />
          </span>
          <span>
            {ayah.surahName} [सूरह {ayah.surahNumber}, आयत {ayah.ayahNumber}]
          </span>
        </div>
        <button
          onClick={handleCopy}
          title="आयत प्रतिलिपि गर्नुहोस्"
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-[#d97706]/10 hover:bg-[#d97706]/20 text-[#b45309] transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'कपी भयो' : 'कपी'}</span>
        </button>
      </div>

      {/* Arabic Script */}
      <div
        dir="rtl"
        className="pt-4 pb-3 text-xl sm:text-2xl md:text-3xl font-arabic text-emerald-950 dark:text-emerald-300 leading-loose text-right tracking-wide selection:bg-amber-200"
      >
        {ayah.arabicText}
      </div>

      {/* Nepali Translation */}
      <div className="pt-2 text-base sm:text-lg font-book font-normal text-stone-800 dark:text-stone-200 leading-relaxed italic border-l-4 border-[#d97706] pl-3.5 my-2">
        "{ayah.nepaliTranslation}"
      </div>

      {/* Contextual Note */}
      {ayah.context && (
        <div className="mt-3 pt-2.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-book border-t border-stone-200/50 dark:border-stone-800">
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">सन्दर्भ: </span>
          {ayah.context}
        </div>
      )}
    </div>
  );
};
