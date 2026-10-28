import React, { useState } from 'react';
import { Copy, Check, HelpCircle, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenGuide: () => void;
  onShowToast: (message: string, icon?: string) => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGuide,
  onShowToast,
  onNavigateHome,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      const res = await fetch('/blogger-theme.xml');
      if (res.ok) {
        const text = await res.text();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onShowToast('সম্পূর্ণ ৭টি টুলের ব্লগার কোড কপি হয়েছে! 📋', '🎉');
        setTimeout(() => setCopied(false), 3000);
        return;
      }
    } catch {
      // fallback
    }
    onShowToast('কোড কপি করতে সমস্যা হয়েছে। গাইড বাটনে ক্লিক করুন।', '⚠️');
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  The MoSaFa
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Tools
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                সকল ফ্রি অনলাইন টুলস এক ক্লিকে
              </p>
            </div>
          </button>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenGuide}
            type="button"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>ব্লগারে সেটআপ গাইড</span>
          </button>

          <button
            onClick={handleCopyCode}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 text-white shadow-sm shadow-rose-200 active:scale-95 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি সম্পন্ন! ✅' : 'সম্পূর্ণ কোড কপি 📋'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
