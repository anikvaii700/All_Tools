import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Calendar,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Layers,
  ArrowRight,
  Info,
  Loader2,
} from 'lucide-react';
import { NicheIdea } from '../../types/creatorStudio';
import { CreatorAiService } from '../../services/creatorAiService';
import { CreatorStorage } from '../../services/creatorStorage';

interface NicheFinderProps {
  onShowToast?: (msg: string, icon?: string) => void;
  onApplyNicheToProject?: (nicheTitle: string) => void;
}

export const NicheFinder: React.FC<NicheFinderProps> = ({
  onShowToast,
  onApplyNicheToProject,
}) => {
  const [country, setCountry] = useState('বাংলাদেশ (Bangladesh)');
  const [language, setLanguage] = useState('বাংলা (Bengali)');
  const [platform, setPlatform] = useState('YouTube ও Facebook');
  const [interests, setInterests] = useState('টেকনোলজি, ক্যারিয়ার টিপস ও মোবাইল অ্যাপস');
  const [skills, setSkills] = useState('বেসিক ভিডিও এডিটিং, প্রেজেন্টেশন ও লেখালেখি');
  const [experience, setExperience] = useState('নতুন / বিগিনার');
  const [timeHours, setTimeHours] = useState(10);
  const [budget, setBudget] = useState('জিরো বাজেট (স্মার্টফোন দিয়ে শুরু)');
  const [monetization, setMonetization] = useState('গুগল অ্যাডসেন্স, স্পন্সরশিপ ও অ্যাফিলিয়েট');

  const [isLoading, setIsLoading] = useState(false);
  const [niches, setNiches] = useState<NicheIdea[]>(() => CreatorStorage.getSavedNiches());
  const [selectedNiche, setSelectedNiche] = useState<NicheIdea | null>(null);
  const [isAiMode, setIsAiMode] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await CreatorAiService.findNiches({
        country,
        language,
        platform,
        interests,
        skills,
        timeHours,
        budget,
        monetization,
      });

      if (res && res.data && res.data.length > 0) {
        setNiches(res.data);
        setSelectedNiche(res.data[0]);
        setIsAiMode(res.isAiAvailable);
        if (onShowToast) {
          onShowToast('সফলভাবে ৩টি লাভজনক নিশ ও ৩০ দিনের রোডম্যাপ তৈরি হয়েছে!', '🎯');
        }
      }
    } catch {
      if (onShowToast) {
        onShowToast('নিশ তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।', '⚠️');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNiche = (niche: NicheIdea) => {
    CreatorStorage.saveNiche(niche);
    if (onShowToast) {
      onShowToast(`"${niche.title}" নিশ সেভ করা হয়েছে!`, '⭐');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              নিশ ফাইন্ডার ও ক্যারিয়ার রোডম্যাপ 🧭
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              আপনার আগ্রহ, দক্ষতা ও সময় অনুযায়ী বাস্তবসম্মত ও লাভজনক বিষয় নির্বাচন করুন
            </p>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">সতর্ক বার্তা ও সঠিক মানদণ্ড:</span> এখানে প্রদত্ত বিশ্লেষণটি আপনার ইনপুট ও অ্যালগরিদমিক স্ট্র্যাটেজির ওপর ভিত্তি করে তৈরি। কোনো অনানুষ্ঠানিক সার্চ ভলিউম বা অবাস্তব ইনকাম পরিসংখ্যান প্রদর্শন করা হয় না।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Creator Profile Input */}
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>আপনার ক্রিয়েটর প্রোফাইল</span>
            <span className="text-[11px] font-normal text-slate-400">১০টি পরিমাপক</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              টার্গেট দেশ ও ভাষা
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
                placeholder="যেমন: বাংলাদেশ"
              />
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
                placeholder="যেমন: বাংলা"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              প্রধান প্ল্যাটফর্ম
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
            >
              <option value="YouTube ও Facebook">YouTube ও Facebook (ভিডিও ও রিলস)</option>
              <option value="শুধু YouTube">শুধুমাত্র YouTube চ্যানেল</option>
              <option value="শুধু Facebook">শুধুমাত্র Facebook পেজ ও রিলস</option>
              <option value="SEO ব্লগ ও ওয়েবসাইট">SEO ব্লগ ও ওয়েবসাইট (আর্টিকেল)</option>
              <option value="মাল্টি-প্ল্যাটফর্ম">অল-ইন-ওয়ান মাল্টি প্ল্যাটফর্ম</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আপনার আগ্রহ ও পছন্দের বিষয়
            </label>
            <textarea
              rows={2}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
              placeholder="যেমন: গ্যাজেট রিভিউ, রান্না, ইসলামি জ্ঞান, ফ্রিল্যান্সিং..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আপনার বর্তমান দক্ষতা
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
              placeholder="যেমন: কথা বলা, ক্যানভা ডিজাইন, ক্যাপকাট এডিটিং..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                অভিজ্ঞতা
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-white"
              >
                <option value="নতুন / বিগিনার">একদম নতুন</option>
                <option value="মাঝারি / ইন্টারমিডিয়েট">মাঝারি জ্ঞান আছে</option>
                <option value="অভিজ্ঞ / এক্সপার্ট">অভিজ্ঞ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সাপ্তাহিক সময় (ঘণ্টা)
              </label>
              <input
                type="number"
                min={2}
                max={60}
                value={timeHours}
                onChange={(e) => setTimeHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              বাজেট ও ইকুইপমেন্ট
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
              placeholder="যেমন: স্মার্টফোন ও ট্রাইপড"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আয়ের মূল লক্ষ্য (Monetization)
            </label>
            <input
              type="text"
              value={monetization}
              onChange={(e) => setMonetization(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
              placeholder="যেমন: গুগল অ্যাডসেন্স, অ্যাফিলিয়েট, পেইড কোর্স"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>নিশ ও স্ট্র্যাটেজি তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>নিশ ও ৩০ দিনের রোডম্যাপ বের করুন</span>
              </>
            )}
          </button>
        </form>

        {/* Right Column: Generated Niches & Detailed 30-Day Plan */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>প্রস্তাবিত নিশসমূহ</span>
              {isAiMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  AI চালিত
                </span>
              )}
            </h3>
            <span className="text-xs text-slate-500">{niches.length}টি নিশ পাওয়া গেছে</span>
          </div>

          {/* Niche Selection Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {niches.map((niche, idx) => {
              const isSelected = selectedNiche?.id === niche.id;
              return (
                <button
                  key={niche.id || idx}
                  type="button"
                  onClick={() => setSelectedNiche(niche)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                    {niche.title}
                  </span>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-bold text-indigo-600">পটেনশিয়াল: {niche.profitPotential}</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded-md">কম্পিটিশন: {niche.competitionLevel}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Niche Deep Dive Card */}
          {selectedNiche && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    {selectedNiche.englishTitle}
                  </span>
                  <h4 className="text-lg font-black text-slate-900">{selectedNiche.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveNiche(selectedNiche)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="নিশটি সেভ করুন"
                  >
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    <span>সেভ করুন</span>
                  </button>
                  {onApplyNicheToProject && (
                    <button
                      type="button"
                      onClick={() => onApplyNicheToProject(selectedNiche.title)}
                      className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>প্রজেক্টে অ্যাপ্লাই করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {selectedNiche.description}
              </p>

              {/* Target Audience & Monetization Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>টার্গেট অডিয়েন্স প্রোফাইল</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedNiche.targetAudience}
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>সম্ভাব্য আয়ের উৎস</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNiche.monetizationMethods.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Formats */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>রেকমেন্ডেড কন্টেন্ট ফরম্যাট</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedNiche.recommendedFormats.map((fmt, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              {/* 30 Days Action Roadmap */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <span>নতুনদের জন্য প্রথম ৩০ দিনের অ্যাকশন রোডম্যাপ</span>
                  </div>
                  <span className="text-[11px] text-slate-400">ধাপে ধাপে করণীয়</span>
                </div>

                <div className="space-y-2">
                  {selectedNiche.roadmap30Days.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                    >
                      <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-indigo-700 font-bold text-[11px] shrink-0">
                        {step.day}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed pt-0.5">{step.task}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
