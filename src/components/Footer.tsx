import React from 'react';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import { UserReviewsMarquee } from './UserReviewsMarquee';

interface FooterProps {
  onNavigateTool?: (tool: any) => void;
  onOpenDeveloperModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDeveloperModal }) => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 pt-2 pb-8 px-4 mt-auto relative z-10">
      {/* ১। চলমান ইউজার রিভিউ মারকুই (ডান থেকে বামে স্ক্রল) */}
      <div className="w-full mb-6">
        <UserReviewsMarquee />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* ২। শুধু সরাসরি ডেভেলপারকে মেসেজ দিন বাটন কার্ড — ক্লিক করলে পপআপ ওপেন হবে */}
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

        {/* ৩। ফুটার কপিরাইট ও ডেভেলপার সাপোর্ট লিংক */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">The MoSaFa Tools</span>
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
