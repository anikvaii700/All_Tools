import React, { useState } from 'react';
import {
  Share2,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Layers,
  Facebook,
  Youtube,
  Globe,
  Mail,
  Linkedin,
  Quote,
  Pin,
  Loader2,
  Info,
} from 'lucide-react';
import { RepurposedPackage } from '../../types/creatorStudio';
import { CreatorAiService } from '../../services/creatorAiService';
import { CreatorStorage } from '../../services/creatorStorage';

interface ContentRepurposerProps {
  initialSourceText?: string;
  onShowToast?: (msg: string, icon?: string) => void;
}

export const ContentRepurposer: React.FC<ContentRepurposerProps> = ({
  initialSourceText = '',
  onShowToast,
}) => {
  const [sourceText, setSourceText] = useState(
    initialSourceText ||
      '২০২৬ সালে কনটেন্ট ক্রিয়েটরদের জন্য সবচেয়ে গুরুত্বপূর্ণ বিষয় হলো ধারাবাহিকতা ও নিজস্ব দৃষ্টিভঙ্গি। শুধু ট্রেন্ড ফলো না করে অডিয়েন্সের বাস্তব সমস্যার সমাধান দিলে দ্রুত লয়াল ফ্যানবেস তৈরি হয়।'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [packageData, setPackageData] = useState<RepurposedPackage | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'facebook'
    | 'blog'
    | 'youtube'
    | 'shorts'
    | 'carousel'
    | 'linkedin'
    | 'newsletter'
    | 'quote'
    | 'pinterest'
  >('facebook');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRepurpose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) return;

    setIsLoading(true);
    try {
      const res = await CreatorAiService.repurpose(sourceText);
      if (res && res.data) {
        setPackageData(res.data);
        if (onShowToast) {
          onShowToast('সফলভাবে ৯টি ভিন্ন ফরম্যাটে রূপান্তর সম্পন্ন হয়েছে!', '✨');
        }
      }
    } catch {
      if (onShowToast) {
        onShowToast('রি-পারপাস করতে সমস্যা হয়েছে।', '⚠️');
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

  const handleSaveToDrafts = (title: string, content: string) => {
    CreatorStorage.saveDraft({
      id: `draft-repurposed-${Date.now()}`,
      title,
      type: 'blog_article',
      content,
      wordCount: content.split(/\s+/).length,
      estimatedDurationMinutes: 2,
      tone: 'Repurposed',
      language: 'bn',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    if (onShowToast) {
      onShowToast(`"${title}" ড্রাফট হিসেবে সেভ হয়েছে!`, '💾');
    }
  };

  const tabs = [
    { id: 'facebook', label: 'ফেসবুক পোস্ট', icon: <Facebook className="w-3.5 h-3.5 text-blue-600" /> },
    { id: 'shorts', label: 'শর্টস / রিলস', icon: <Youtube className="w-3.5 h-3.5 text-red-500" /> },
    { id: 'blog', label: 'ব্লগ আর্টিকেল', icon: <Globe className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'youtube', label: 'ইউটিউব ভিডিও', icon: <Youtube className="w-3.5 h-3.5 text-red-600" /> },
    { id: 'carousel', label: 'কারোসেল স্লাইড', icon: <Layers className="w-3.5 h-3.5 text-purple-600" /> },
    { id: 'linkedin', label: 'লিঙ্কডইন পোস্ট', icon: <Linkedin className="w-3.5 h-3.5 text-blue-700" /> },
    { id: 'newsletter', label: 'ইমেইল নিউজলেটার', icon: <Mail className="w-3.5 h-3.5 text-amber-600" /> },
    { id: 'quote', label: 'কোট কার্ড', icon: <Quote className="w-3.5 h-3.5 text-pink-600" /> },
    { id: 'pinterest', label: 'পিন্টারেস্ট পিন', icon: <Pin className="w-3.5 h-3.5 text-rose-600" /> },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-200">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              মাল্টি-প্ল্যাটফর্ম কন্টেন্ট রি-পারপাসার (Content Repurposer) 🔄
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              একটিমাত্র মূল লেখা বা স্ক্রিপ্ট থেকে ফেসবুক পোস্ট, ইউটিউব ভিডিও, রিলস, লিঙ্কডইন ও নিউজলেটার তৈরি করুন
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">স্মার্ট ক্রিয়েটর টেকনিক:</span> টপ ক্রিয়েটররা প্রতিটি প্ল্যাটফর্মের জন্য নতুন করে সময় নষ্ট করেন না। একই মূল ধারণাকে প্ল্যাটফর্মের অ্যালগরিদম ও অডিয়েন্সের সাইকোলজি অনুযায়ী রূপান্তর করেন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Source Text Input */}
        <form
          onSubmit={handleRepurpose}
          className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>উৎস কন্টেন্ট (Source Material)</span>
            <span className="text-[11px] text-slate-400">যে কোনো টেক্সট বা আইডিয়া</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আপনার লেখা বা ভিডিওর সারমর্ম পেস্ট করুন
            </label>
            <textarea
              rows={10}
              required
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-cyan-500 outline-hidden leading-relaxed"
              placeholder="আপনার ব্লগ পোস্ট, নোট, বা ইউটিউব ভিডিও স্ক্রিপ্টের কিছু অংশ এখানে পেস্ট করুন..."
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>৯টি ফরম্যাটে রূপান্তর হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>৯টি ভিন্ন ফরম্যাটে রূপান্তর করুন</span>
              </>
            )}
          </button>
        </form>

        {/* Repurposed Tabs & Output Display */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            {/* Format Tabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content Display */}
            {packageData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                    {tabs.find((t) => t.id === activeTab)?.label}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        let textToCopy = '';
                        if (activeTab === 'facebook') textToCopy = packageData.facebookPost;
                        if (activeTab === 'blog') textToCopy = packageData.blogArticle;
                        if (activeTab === 'youtube') textToCopy = packageData.youtubeScript;
                        if (activeTab === 'shorts') textToCopy = packageData.shortsScript;
                        if (activeTab === 'carousel') textToCopy = packageData.carouselSlides.join('\n\n');
                        if (activeTab === 'linkedin') textToCopy = packageData.linkedinPost;
                        if (activeTab === 'newsletter') textToCopy = packageData.newsletterDraft;
                        if (activeTab === 'quote') textToCopy = packageData.quoteCard;
                        if (activeTab === 'pinterest') textToCopy = packageData.pinterestDescription;
                        handleCopy(textToCopy, activeTab);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === activeTab ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === activeTab ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-sans text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[380px] overflow-y-auto">
                  {activeTab === 'facebook' && packageData.facebookPost}
                  {activeTab === 'blog' && packageData.blogArticle}
                  {activeTab === 'youtube' && packageData.youtubeScript}
                  {activeTab === 'shorts' && packageData.shortsScript}
                  {activeTab === 'carousel' && (
                    <div className="space-y-2">
                      {packageData.carouselSlides.map((slide, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200">
                          <span className="font-bold text-purple-600 block mb-1">স্লাইড {idx + 1}:</span>
                          <span>{slide}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === 'linkedin' && packageData.linkedinPost}
                  {activeTab === 'newsletter' && packageData.newsletterDraft}
                  {activeTab === 'quote' && packageData.quoteCard}
                  {activeTab === 'pinterest' && packageData.pinterestDescription}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                বামপাশের বক্সে আপনার লেখা পেস্ট করে &quot;রূপান্তর করুন&quot; বাটনে চাপুন। এক ক্লিকে ৯টি ফরম্যাট তৈরি হবে।
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
