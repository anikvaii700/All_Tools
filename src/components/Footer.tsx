import React from 'react';
import { MessageSquare, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigateTool?: (tool: any) => void;
  onOpenDeveloperModal?: () => void;
  onOpenLegalModal?: (tab: 'about' | 'contact' | 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDeveloperModal, onOpenLegalModal }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 pt-6 pb-8 px-4 mt-auto relative z-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ২। সরাসরি ডেভেলপারকে মেসেজ দিন বাটন কার্ড */}
        <div className="bg-slate-50/90 border border-slate-200 rounded-3xl p-5 sm:p-7 text-center shadow-xs max-w-2xl mx-auto">
          <button
            type="button"
            onClick={onOpenDeveloperModal}
            className="w-full py-4 px-6 bg-black hover:bg-slate-900 text-white font-black text-sm sm:text-base rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 group"
          >
            <MessageSquare className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition shrink-0" />
            <span>সরাসরি ডেভেলপারকে মেসেজ দিন</span>
          </button>
        </div>

        {/* ৩। লিগ্যাল ও ট্রাস্ট পেজ লিংকসমূহ (AdSense & User Trust) */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => onOpenLegalModal?.('about')}
            className="hover:text-indigo-600 transition cursor-pointer"
          >
            আমাদের সম্পর্কে (About Us)
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => onOpenLegalModal?.('contact')}
            className="hover:text-emerald-600 transition cursor-pointer"
          >
            যোগাযোগ (Contact Us)
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => onOpenLegalModal?.('privacy')}
            className="hover:text-rose-600 transition cursor-pointer"
          >
            গোপনীয়তা নীতি (Privacy Policy)
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => onOpenLegalModal?.('terms')}
            className="hover:text-amber-600 transition cursor-pointer"
          >
            শর্তাবলী (Terms & Conditions)
          </button>
        </div>

        {/* ৪। ফুটার কপিরাইট ও ডেভেলপার সাপোর্ট লিংক */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden aspect-square">
              <img src="/logo.png" alt="MoSaFa Tools Official Logo" className="w-full h-full object-contain aspect-square" />
            </div>
            <span className="font-extrabold text-slate-800">MoSaFa Tools</span>
            <span>• সর্বস্বত্ব সংরক্ষিত ২০২৬</span>
          </div>

          <button
            type="button"
            onClick={onOpenDeveloperModal}
            className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
          >
            <span>হোয়াটসঅ্যাপে মেসেজ পাঠান</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      </div>
    </footer>
  );
};
