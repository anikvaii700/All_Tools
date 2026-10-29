import React from 'react';

interface FooterProps {
  onNavigateTool?: (tool: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTool }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-6 px-4 mt-auto relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">The MoSaFa Tools</span>
          <span>• সর্বস্বত্ব সংরক্ষিত ২০২৬</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center font-medium">
          <button
            onClick={() => onNavigateTool && onNavigateTool(null)}
            className="hover:text-rose-600 transition cursor-pointer"
          >
            হোম পোর্টাল
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigateTool && onNavigateTool('invoice-maker')}
            className="hover:text-emerald-700 font-semibold transition cursor-pointer"
          >
            MoSaFa Invoice Maker
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigateTool && onNavigateTool('bangla-text-converter')}
            className="hover:text-emerald-700 font-semibold transition cursor-pointer"
          >
            বাংলা টেক্সট কনভার্টার
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigateTool && onNavigateTool('voter-transfer-form')}
            className="hover:text-emerald-700 font-semibold transition cursor-pointer"
          >
            ভোটার স্থানান্তর ফরম ফিলাপ
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigateTool && onNavigateTool('room-remix')}
            className="hover:text-rose-600 font-semibold transition cursor-pointer"
          >
            MoSaFa Room Remix
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigateTool && onNavigateTool('bus-fare')}
            className="hover:text-rose-600 transition cursor-pointer"
          >
            কোন বাসে কত ভাড়া
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigateTool && onNavigateTool('prepaid-meter')}
            className="hover:text-rose-600 transition cursor-pointer"
          >
            প্রিপেইড মিটার সহকারী
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigateTool && onNavigateTool('golpo-ghor')}
            className="hover:text-rose-600 transition cursor-pointer"
          >
            গল্পের ঘর
          </button>
          <span>•</span>
          <button
            onClick={() => onNavigateTool && onNavigateTool('love-test')}
            className="hover:text-rose-600 transition cursor-pointer"
          >
            প্রেম টেস্ট
          </button>
        </div>
      </div>
    </footer>
  );
};
