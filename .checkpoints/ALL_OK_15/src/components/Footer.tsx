import React from 'react';

interface FooterProps {
  onOpenGuide: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenGuide, onShowToast }) => {
  const handleCopyCode = async () => {
    try {
      const res = await fetch('/blogger-theme.xml');
      if (res.ok) {
        const text = await res.text();
        await navigator.clipboard.writeText(text);
        onShowToast('ব্লগার থিম কোড সফলভাবে কপি হয়েছে! 📋', '🎉');
        return;
      }
    } catch {
      // fallback
    }
    onShowToast('কোড কপি করতে সমস্যা হয়েছে।', '⚠️');
  };

  return (
    <footer className="w-full bg-white border-t border-slate-200 py-6 px-4 mt-auto relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">The MoSaFa Tools</span>
          <span>• সর্বস্বত্ব সংরক্ষিত ২০২৬</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCode}
            className="hover:text-rose-600 font-semibold transition cursor-pointer"
          >
            📋 মূল পেজের কোড কপি
          </button>
          <span>|</span>
          <button
            onClick={onOpenGuide}
            className="hover:text-rose-600 font-semibold transition cursor-pointer"
          >
            💡 সেটআপ গাইড
          </button>
        </div>
      </div>
    </footer>
  );
};
