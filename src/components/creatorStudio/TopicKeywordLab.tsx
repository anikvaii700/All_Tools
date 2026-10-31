import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Bookmark,
  Share2,
  Copy,
  Check,
  HelpCircle,
  TrendingUp,
  Tag,
  Layers,
  ArrowRight,
  Info,
  Youtube,
  Globe,
  Loader2,
} from 'lucide-react';
import { TopicKeywordItem, CreatorPlatform } from '../../types/creatorStudio';
import { CreatorAiService } from '../../services/creatorAiService';
import { CreatorStorage } from '../../services/creatorStorage';

interface TopicKeywordLabProps {
  activeNiche?: string;
  onShowToast?: (msg: string, icon?: string) => void;
  onSendToScriptStudio?: (topic: string, platform: CreatorPlatform) => void;
}

export const TopicKeywordLab: React.FC<TopicKeywordLabProps> = ({
  activeNiche = '',
  onShowToast,
  onSendToScriptStudio,
}) => {
  const [nicheQuery, setNicheQuery] = useState(activeNiche || 'স্মার্টফোন দিয়ে ফ্রিল্যান্সিং ও অনলাইন ইনকাম');
  const [platform, setPlatform] = useState<CreatorPlatform>('youtube');
  const [audience, setAudience] = useState('বাংলাদেশি শিক্ষার্থী ও নতুন ক্রিয়েটর');
  const [language, setLanguage] = useState('bn');

  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<TopicKeywordItem[]>(() => CreatorStorage.getSavedKeywords());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TopicKeywordItem | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicheQuery.trim()) return;

    setIsLoading(true);
    try {
      const res = await CreatorAiService.generateTopics({
        niche: nicheQuery,
        platform,
        language,
        audience,
      });

      if (res && res.data && res.data.length > 0) {
        setTopics(res.data);
        setSelectedTopic(res.data[0]);
        if (onShowToast) {
          onShowToast('৫টি নতুন টপিক ক্লাস্টার ও কিওয়ার্ড আইডিয়া তৈরি হয়েছে!', '💡');
        }
      }
    } catch {
      if (onShowToast) {
        onShowToast('টপিক তৈরি করতে সমস্যা হয়েছে।', '⚠️');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    if (onShowToast) {
      onShowToast('ক্লিপবোর্ডে কপি হয়েছে!', '📋');
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveKeyword = (item: TopicKeywordItem) => {
    CreatorStorage.saveKeyword({ ...item, isSaved: true });
    if (onShowToast) {
      onShowToast(`"${item.title}" সেভ করা হয়েছে!`, '⭐');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              টপিক ও কিওয়ার্ড ল্যাব (Topic & Keyword Lab) 🔍
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              ব্লগ, ইউটিউব ও ফেসবুকের জন্য হাই-ডিমান্ড টপিক, কিওয়ার্ড ক্লাস্টার ও সার্চ ইনটেন্ট রিসার্চ
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">সতর্কতা:</span> এখানে প্রদত্ত কিওয়ার্ড ক্লাস্টার ও সার্চ ইনটেন্ট অডিয়েন্স সাইকোলজি ও স্ট্র্যাটেজিক কনটেন্ট প্ল্যানিংয়ের জন্য তৈরি। গুগল বা ফেসবুকের লাইভ ট্রাফিক কাউন্ট কোনো থার্ড-পার্টি টুল দিয়ে নিশ্চিত করা যায় না।
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <form
        onSubmit={handleGenerate}
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              মূল বিষয় বা নিশ (Niche Query)
            </label>
            <div className="relative">
              <input
                type="text"
                value={nicheQuery}
                onChange={(e) => setNicheQuery(e.target.value)}
                placeholder="যেমন: ওয়ার্ডপ্রেস এসইও টিপস, কুকিং রেসিপি, ডিজিটাল মার্কেটিং..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden pr-10"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              প্ল্যাটফর্ম নির্বাচন
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as CreatorPlatform)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden bg-white"
            >
              <option value="youtube">ইউটিউব ভিডিও (YouTube)</option>
              <option value="blog">এসইও ব্লগ পোস্ট (SEO Blog)</option>
              <option value="facebook">ফেসবুক পোস্ট ও রিলস (Facebook)</option>
              <option value="multi">মাল্টি-প্ল্যাটফর্ম (Multi)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              টার্গেট অডিয়েন্স
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden"
              placeholder="যেমন: নতুন ফ্রিল্যান্সার"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-98 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>কিওয়ার্ড ও টপিক ক্লাস্টার খোঁজা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>টপিক ও ক্লাস্টার জেনারেট করুন</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Topics List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic Cards Left Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-bold text-sm text-slate-900">
              টপিক ও কিওয়ার্ড আইডিয়াসমূহ ({topics.length})
            </h3>
            <span className="text-xs text-slate-400">ক্লিক করে বিস্তারিত দেখুন</span>
          </div>

          <div className="space-y-3">
            {topics.map((item) => {
              const isSelected = selectedTopic?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedTopic(item)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0 uppercase">
                      {item.platform}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold">
                      ইনটেন্ট: {item.searchIntent}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                      {item.difficultyEstimate}
                    </span>
                  </div>
                </div>
              );
            })}

            {topics.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                কোনো টপিক নেই। উপরে আপনার বিষয় লিখে জেনারেট বাটনে ক্লিক করুন।
              </div>
            )}
          </div>
        </div>

        {/* Selected Topic Deep Dive */}
        {selectedTopic && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  ক্যাটাগরি: {selectedTopic.category}
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900">
                  {selectedTopic.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedTopic.title, 'title-top')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                  title="কপি করুন"
                >
                  {copiedId === 'title-top' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveKeyword(selectedTopic)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>সেভ</span>
                </button>
                {onSendToScriptStudio && (
                  <button
                    type="button"
                    onClick={() => onSendToScriptStudio(selectedTopic.title, selectedTopic.platform)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>স্ক্রিপ্ট তৈরি করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Keyword Cluster */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>সম্পর্কিত কিওয়ার্ড ক্লাস্টার (Keywords)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTopic.relatedKeywords.map((kw, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCopy(kw, `kw-${idx}`)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{kw}</span>
                    {copiedId === `kw-${idx}` ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Angles / Hooks */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>ভিডিও ও ব্লগের ইউনিক অ্যাঙ্গেল (Angle & Hook)</span>
              </div>
              <div className="space-y-2">
                {selectedTopic.suggestedAngles.map((angle, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-800 flex items-start gap-2"
                  >
                    <span className="font-bold text-emerald-700 shrink-0">#{idx + 1}</span>
                    <p className="leading-relaxed">{angle}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs for SEO Rich Snippets */}
            {selectedTopic.faqs && selectedTopic.faqs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>গুগল সার্চ ও অডিয়েন্স FAQ (সচরাচর জিজ্ঞাসিত প্রশ্ন)</span>
                </div>
                <div className="space-y-2.5">
                  {selectedTopic.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1"
                    >
                      <p className="text-xs font-bold text-slate-900">প্রশ্ন: {faq.q}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">উত্তর: {faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
