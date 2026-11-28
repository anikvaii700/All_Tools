import React from 'react';
import { MessageCircle, Wrench } from 'lucide-react';

interface FooterProps {
  onNavigateTool?: (tool: any) => void;
  onOpenDeveloperModal?: () => void;
  onOpenLegalModal?: (tab: 'about' | 'contact' | 'privacy' | 'terms') => void;
  onNavigateLegal?: (tab: 'about' | 'contact' | 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTool,
  onOpenDeveloperModal,
  onOpenLegalModal,
  onNavigateLegal,
}) => {
  const handleLegalClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    tab: 'about' | 'contact' | 'privacy' | 'terms'
  ) => {
    e.preventDefault();
    if (onNavigateLegal) {
      onNavigateLegal(tab);
    } else {
      onOpenLegalModal?.(tab);
    }
  };

  const handleToolClick = (tool: string) => {
    onNavigateTool?.(tool);
  };

  return (
    <footer className="w-full mt-auto relative z-10 bg-slate-900 text-slate-300">
      <div className="max-w-7xl 2xl:max-w-[1560px] mx-auto px-5 sm:px-8 lg:px-10 pt-10 sm:pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] gap-8 sm:gap-10 lg:gap-16 pb-9">
          {/* Brand and platform summary */}
          <div className="max-w-md">
            <a href="/" className="inline-flex items-center gap-2.5 no-underline text-white">
              <span className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
                <Wrench className="w-5 h-5 text-white" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">MoSaFa Tools</span>
            </a>
            <p className="mt-4 text-sm leading-7 text-slate-400 max-w-md">
              বাংলাদেশের দৈনন্দিন কাজের জন্য সহজ ও বিনামূল্যের অনলাইন টুলস প্ল্যাটফর্ম। CV তৈরি, ছবি রিসাইজ, PDF, বাংলা টাইপিং এবং প্রয়োজনীয় আরও অনেক টুল ব্যবহার করুন এক জায়গায়।
            </p>
          </div>

          {/* Popular tools */}
          <nav aria-label="গুরুত্বপূর্ণ টুলস">
            <h2 className="text-sm font-extrabold text-white mb-4">গুরুত্বপূর্ণ টুলস</h2>
            <ul className="space-y-3 text-sm">
              <li><button type="button" onClick={() => handleToolClick('cv-maker')} className="text-left text-slate-400 hover:text-white transition">CV Maker</button></li>
              <li><button type="button" onClick={() => handleToolClick('ultra-digital-studio')} className="text-left text-slate-400 hover:text-white transition">Photo Tools</button></li>
              <li><button type="button" onClick={() => handleToolClick('pdf-toolkit')} className="text-left text-slate-400 hover:text-white transition">PDF Tools</button></li>
              <li><button type="button" onClick={() => handleToolClick('typing-test')} className="text-left text-slate-400 hover:text-white transition">Bangla Typing Test</button></li>
              <li><a href="/" className="text-slate-400 hover:text-white transition no-underline">সকল টুলস</a></li>
            </ul>
          </nav>

          {/* Information and legal */}
          <nav aria-label="তথ্য ও নীতিমালা">
            <h2 className="text-sm font-extrabold text-white mb-4">তথ্য ও নীতিমালা</h2>
            <ul className="space-y-3 text-sm">
              <li><a href="/about" onClick={(e) => handleLegalClick(e, 'about')} className="text-slate-400 hover:text-white transition no-underline">আমাদের সম্পর্কে</a></li>
              <li><a href="/contact" onClick={(e) => handleLegalClick(e, 'contact')} className="text-slate-400 hover:text-white transition no-underline">যোগাযোগ করুন</a></li>
              <li><a href="/privacy" onClick={(e) => handleLegalClick(e, 'privacy')} className="text-slate-400 hover:text-white transition no-underline">প্রাইভেসি পলিসি</a></li>
              <li><a href="/terms" onClick={(e) => handleLegalClick(e, 'terms')} className="text-slate-400 hover:text-white transition no-underline">ব্যবহারের শর্তাবলি</a></li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-slate-700/80 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MoSaFa Tools" className="w-6 h-6 rounded-md bg-white object-contain p-0.5" />
            <span className="font-bold text-slate-200">MoSaFa Tools</span>
            <span>• সর্বস্বত্ব সংরক্ষিত © ২০২৬</span>
          </div>
          <span>MoSaFa BD দ্বারা পরিচালিত</span>
        </div>
      </div>

      {/* Compact WhatsApp-style contact shortcut in the footer corner */}
      <button
        type="button"
        onClick={onOpenDeveloperModal}
        aria-label="ডেভেলপারকে মেসেজ দিন"
        title="ডেভেলপারকে মেসেজ দিন"
        className="absolute bottom-5 right-5 sm:bottom-6 sm:right-7 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </footer>
  );
};
