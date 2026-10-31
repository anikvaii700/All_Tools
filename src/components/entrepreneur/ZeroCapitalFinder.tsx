import React, { useState } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Send,
  Zap,
  X,
} from 'lucide-react';
import { ZERO_CAPITAL_IDEAS_DATABASE } from '../../data/zeroCapitalDatabase';
import { ZeroCapitalIdea, BusinessProject, CapitalBracket } from '../../types/entrepreneur';

interface ZeroCapitalFinderProps {
  activeProject: BusinessProject;
  onApplyIdeaToProject: (idea: ZeroCapitalIdea) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ZeroCapitalFinder: React.FC<ZeroCapitalFinderProps> = ({
  activeProject,
  onApplyIdeaToProject,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCapital, setSelectedCapital] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDetailModal, setActiveDetailModal] = useState<ZeroCapitalIdea | null>(null);

  const filteredIdeas = ZERO_CAPITAL_IDEAS_DATABASE.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.banglaTitle.includes(searchQuery) ||
      idea.tagline.includes(searchQuery) ||
      idea.requiredSkills.some((s) => s.includes(searchQuery));

    const matchesCapital = selectedCapital === 'all' || idea.capitalRequired === selectedCapital;
    const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory;

    return matchesSearch && matchesCapital && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>জিরো ও লো-ক্যাপিটাল বিজনেস ফাইন্ডার</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
            কোনো পুঁজি ছাড়াই নিজের দক্ষতা ও স্মার্টফোন দিয়ে ব্যবসা শুরু করুন
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            কোনো লোন বা ঝুঁকির দরকার নেই। সেবা ও মধ্যস্বত্বহীন প্রি-অর্ডারের মাধ্যমে কীভাবে প্রথম মাসেই গ্রাহক পাবেন তা জানুন।
          </p>
        </div>

        {/* Disclaimer Banner */}
        <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-white/10 text-[11px] text-emerald-200 flex items-start gap-2 max-w-xl">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300 mt-0.5" />
          <span>
            সতর্কতা: আমরা কোনো অবাস্তব বা রাতারাতি আয়ের নিশ্চয়তা দিই না। আপনার নিষ্ঠা, সততা ও সঠিক কাজের মাধ্যমেই ব্যবসার সাফল্য নির্ভর করে।
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আইডিয়া খুঁজুন (যেমন: সোশ্যাল মিডিয়া, ক্যানভা, রিলস, প্রি-অর্ডার, টিউটরিং)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 bg-slate-50"
            />
          </div>

          {/* Capital Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCapital}
              onChange={(e) => setSelectedCapital(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
            >
              <option value="all">সকল পুঁজির পরিমাণ</option>
              <option value="zero">৳০ (সম্পূর্ণ জিরো ক্যাপিটাল)</option>
              <option value="low">৳১,০০০ - ৫,০০০ (সামান্য)</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              <option value="service">সার্ভিস / সেবা</option>
              <option value="digital">ডিজিটাল ও ক্যানভা</option>
              <option value="coaching">টিউটরিং ও কোচিং</option>
              <option value="reselling">প্রি-অর্ডার ও ট্রেডিং</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdeas.map((idea) => {
          const isCurrentIdea = activeProject.name.includes(idea.banglaTitle) || activeProject.tagline.includes(idea.banglaTitle);
          return (
            <div
              key={idea.id}
              className={`bg-white rounded-3xl p-5 border transition flex flex-col justify-between shadow-xs ${
                isCurrentIdea ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/90 hover:border-emerald-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {idea.capitalRequired === 'zero' ? '🌱 সম্পূর্ণ বিনা পুঁজিতে' : '💡 স্বল্প পুঁজি'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{idea.timeToFirstIncome}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{idea.banglaTitle}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{idea.tagline}</p>

                {/* Quick Info Badges */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-2xl text-[11px]">
                  <div>
                    <span className="text-slate-400 block">সম্ভাব্য মাসিক আয়:</span>
                    <span className="font-bold text-emerald-700">{idea.potentialMonthlyIncome}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">শুরুর খরচ:</span>
                    <span className="font-bold text-slate-700">{idea.estimatedStartingCost}</span>
                  </div>
                </div>

                {/* Target Customers */}
                <div className="mt-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">টার্গেট কাস্টমার:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {idea.targetCustomersInBD.slice(0, 3).map((cust, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg">
                        {cust}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDetailModal(idea)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>৪-সপ্তাহের গাইড</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onApplyIdeaToProject(idea);
                    onShowToast(`"${idea.banglaTitle}" বর্তমান প্রজেক্টে যুক্ত করা হয়েছে! 🚀`, '✨');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>প্রজেক্টে নিন</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Roadmap Modal */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[11px] text-emerald-300 font-bold">পূর্ণাঙ্গ ব্যবসায়িক রোডম্যাপ</span>
                <h3 className="text-base sm:text-lg font-bold">{activeDetailModal.banglaTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Value Proposition */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">মূল ভ্যালু প্রপোজিশন (কেন কাস্টমার আপনাকে টাকা দেবে):</span>
                <p className="text-slate-700 text-xs leading-relaxed">{activeDetailModal.valueProposition}</p>
              </div>

              {/* First Offer Draft */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">প্রথম অফারের নমুনা:</span>
                  <span className="font-bold text-emerald-700">{activeDetailModal.firstOfferDraft.suggestedPrice}</span>
                </div>
                <div className="text-xs text-slate-900 font-bold">{activeDetailModal.firstOfferDraft.name}</div>
                <p className="text-xs text-slate-600">{activeDetailModal.firstOfferDraft.description}</p>
              </div>

              {/* How to find first 10 customers */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Send className="w-4 h-4 text-rose-500" />
                  <span>প্রথম ১০ জন কাস্টমার কীভাবে পাবেন:</span>
                </h4>
                <ul className="space-y-1.5 pl-2">
                  {activeDetailModal.howToFindFirst10Customers.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4-Week Roadmap */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>৪ সপ্তাহের শূন্য থেকে আয়ের রোডম্যাপ:</span>
                </h4>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-indigo-700 block mb-0.5">সপ্তাহ ১ (প্রস্তুতি ও স্যাম্পল):</span>
                    <span className="text-slate-600">{activeDetailModal.fourWeekRoadmap.week1}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-indigo-700 block mb-0.5">সপ্তাহ ২ (আউটরিচ ও ডেমো প্রদর্শন):</span>
                    <span className="text-slate-600">{activeDetailModal.fourWeekRoadmap.week2}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-indigo-700 block mb-0.5">সপ্তাহ ৩ (প্রথম কাজ ডেলিভারি):</span>
                    <span className="text-slate-600">{activeDetailModal.fourWeekRoadmap.week3}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-indigo-700 block mb-0.5">সপ্তাহ ৪ (পেইড ক্লায়েন্ট ও স্কেলিং):</span>
                    <span className="text-slate-600">{activeDetailModal.fourWeekRoadmap.week4}</span>
                  </div>
                </div>
              </div>

              {/* Risks in BD */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">বাংলাদেশে বাস্তব ঝুঁকি ও সমাধান:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {activeDetailModal.realRisksInBD.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setActiveDetailModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyIdeaToProject(activeDetailModal);
                  onShowToast(`"${activeDetailModal.banglaTitle}" প্রজেক্টে যুক্ত করা হয়েছে! 🚀`, '✨');
                  setActiveDetailModal(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>এই আইডিয়া নিয়ে প্রজেক্ট শুরু করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
