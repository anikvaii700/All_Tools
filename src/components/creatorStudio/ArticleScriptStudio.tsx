import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Download,
  Share2,
  Clock,
  Type,
  Youtube,
  Globe,
  Video,
  ListOrdered,
  Layers,
  ArrowRight,
  Info,
  Loader2,
  Edit3,
} from 'lucide-react';
import { ContentDraft, CreatorLanguage } from '../../types/creatorStudio';
import { CreatorAiService } from '../../services/creatorAiService';
import { CreatorStorage } from '../../services/creatorStorage';

interface ArticleScriptStudioProps {
  initialTopic?: string;
  initialType?: string;
  onShowToast?: (msg: string, icon?: string) => void;
  onSendToRepurposer?: (text: string) => void;
  onSendToVideoProduction?: (topic: string) => void;
}

export const ArticleScriptStudio: React.FC<ArticleScriptStudioProps> = ({
  initialTopic = '',
  initialType = 'youtube_long',
  onShowToast,
  onSendToRepurposer,
  onSendToVideoProduction,
}) => {
  const [topic, setTopic] = useState(initialTopic || '২০২৬ সালে অনলাইন থেকে প্যাসিভ ইনকাম শুরু করার নিয়ম');
  const [contentType, setContentType] = useState(initialType);
  const [tone, setTone] = useState('আকর্ষণীয় ও বন্ধুত্বপূর্ণ (Engaging & Friendly)');
  const [length, setLength] = useState('মাঝারি (৬০০-১০০০ শব্দ / ৩-৫ মিনিট)');
  const [language, setLanguage] = useState<CreatorLanguage>('bn');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [outline, setOutline] = useState<string[]>([]);
  const [contentBody, setContentBody] = useState('');
  const [copied, setCopied] = useState(false);

  // Calculate word count & estimated duration
  const words = contentBody.trim().split(/\s+/).filter(Boolean).length;
  // Bangla speaking rate: ~130-150 words per minute for videos
  const estimatedMins = Math.max(1, Math.round((words / 140) * 10) / 10);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const res = await CreatorAiService.generateScript({
        topic,
        type: contentType,
        tone,
        length,
        language,
      });

      if (res && res.data) {
        setGeneratedTitle(res.data.title || topic);
        setOutline(res.data.outline || []);
        setContentBody(res.data.content || '');
        if (onShowToast) {
          onShowToast('স্ক্রিপ্ট ও আর্টিকেল সফলভাবে প্রস্তুত হয়েছে!', '✍️');
        }
      }
    } catch {
      if (onShowToast) {
        onShowToast('স্ক্রিপ্ট জেনারেট করতে সমস্যা হয়েছে।', '⚠️');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(`${generatedTitle}\n\n${contentBody}`);
    setCopied(true);
    if (onShowToast) {
      onShowToast('সম্পূর্ণ লেখা কপি হয়েছে!', '📋');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDraft = () => {
    const draft: ContentDraft = {
      id: `draft-${Date.now()}`,
      title: generatedTitle || topic,
      type: contentType as any,
      content: contentBody,
      outline,
      wordCount: words,
      estimatedDurationMinutes: estimatedMins,
      tone,
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    CreatorStorage.saveDraft(draft);
    if (onShowToast) {
      onShowToast('ড্রাফট প্রজেক্টে সেভ করা হয়েছে!', '💾');
    }
  };

  const handleDownloadTxt = () => {
    const textData = `শিরোনাম: ${generatedTitle || topic}\nতারিখ: ${new Date().toLocaleDateString('bn-BD')}\nশব্দ সংখ্যা: ${words}\n\n=== আউটলাইন ===\n${outline.join('\n')}\n\n=== মূল কন্টেন্ট ===\n\n${contentBody}`;
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(generatedTitle || 'script').replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast('টেক্সট ফাইল ডাউনলোড হয়েছে!', '📥');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              স্ক্রিপ্ট ও আর্টিকেল স্টুডিও (Script & Article Studio) ✍️
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              ইউটিউব লং ভিডিও, শর্টস, ফেসবুক রিলস, এসইও ব্লগ আর্টিকেল ও ভয়েসওভার স্ক্রিপ্ট জেনারেটর
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">স্মার্ট রাইটিং ফিচার:</span> এখানে তৈরি হওয়া প্রতিটি স্ক্রিপ্ট আপনি সরাসরি লাইভ এডিট করতে পারবেন, শব্দ ও সময় গণনা দেখতে পারবেন এবং ১-ক্লিক ড্রাফট সেভ বা এক্সপোর্ট করতে পারবেন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Form Column */}
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>কন্টেন্ট প্যারামিটার</span>
            <span className="text-[11px] text-slate-400">কনফিগারেশন</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              কন্টেন্টের ধরন (Format)
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden bg-white"
            >
              <option value="youtube_long">ইউটিউব লং ভিডিও স্ক্রিপ্ট (Full YouTube Script)</option>
              <option value="youtube_shorts">ইউটিউব শর্টস (YouTube Shorts 30-60s)</option>
              <option value="facebook_reel">ফেসবুক রিলস স্ক্রিপ্ট (Facebook Reel)</option>
              <option value="blog_article">এসইও ব্লগ পোস্ট আর্টিকেল (SEO Blog Article)</option>
              <option value="storytelling">গল্প বলার ভঙ্গিমায় স্ক্রিপ্ট (Storytelling Script)</option>
              <option value="tutorial">ধাপে ধাপে টিউটোরিয়াল (Step-by-Step Tutorial)</option>
              <option value="product_review">প্রোডাক্ট রিভিউ ও মতামত (Product Review)</option>
              <option value="voiceover">ভয়েসওভার স্ক্রিপ্ট (Voice-over Script)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              কন্টেন্টের বিষয় বা শিরোনাম (Topic)
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden"
              placeholder="যেমন: মোবাইল দিয়ে ভিডিও এডিটিং শেখার সহজ উপায়..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              টোন বা বাচনভঙ্গি (Tone)
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden bg-white"
            >
              <option value="আকর্ষণীয় ও বন্ধুত্বপূর্ণ (Engaging & Friendly)">আকর্ষণীয় ও বন্ধুত্বপূর্ণ</option>
              <option value="পেশাদার ও তথ্যবহুল (Professional & Informative)">পেশাদার ও তথ্যবহুল</option>
              <option value="উত্তেজনাপূর্ণ ও এনার্জেটিক (High Energy & Viral)">উত্তেজনাপূর্ণ ও ভাইরাল</option>
              <option value="সহজ সরল ও শিক্ষণীয় (Simple & Educational)">সহজ সরল ও শিক্ষণীয়</option>
              <option value="গল্প ও আবেগপূর্ণ (Emotional & Story)">গল্প ও আবেগপূর্ণ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              দৈর্ঘ্য ও পরিসর (Length)
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden bg-white"
            >
              <option value="শর্ট (২০০-৪০০ শব্দ / ১-২ মিনিট)">সংক্ষিপ্ত (১-২ মিনিট)</option>
              <option value="মাঝারি (৬০০-১০০০ শব্দ / ৩-৫ মিনিট)">মাঝারি (৩-৫ মিনিট)</option>
              <option value="বিস্তারিত (১২০০+ শব্দ / ৮-১০ মিনিট)">বিস্তারিত ও ইন-ডেপথ (৮-১০ মিনিট)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ভাষা (Language)
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as CreatorLanguage)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden bg-white"
            >
              <option value="bn">বাংলা (Bengali)</option>
              <option value="en">English</option>
              <option value="bilingual">দ্বিভাষিক (Banglish / Tech Bangla)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>স্ক্রিপ্ট লেখা হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>স্ক্রিপ্ট তৈরি করুন</span>
              </>
            )}
          </button>
        </form>

        {/* Content Preview & Live Editor Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-rose-500" />
                  <span>লাইভ স্ক্রিপ্ট এডিটর</span>
                </span>
                {contentBody && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {words} শব্দ • আনুমানিক {estimatedMins} মিনিট
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!contentBody}
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
                <button
                  type="button"
                  disabled={!contentBody}
                  onClick={handleSaveDraft}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                  <span>ড্রাফট সেভ</span>
                </button>
                <button
                  type="button"
                  disabled={!contentBody}
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>TXT</span>
                </button>
              </div>
            </div>

            {/* Title Display & Edit */}
            {generatedTitle && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  প্রস্তাবিত শিরোনাম (Title)
                </label>
                <input
                  type="text"
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                  className="w-full text-base sm:text-lg font-black text-slate-900 border-b border-slate-200 focus:border-rose-500 pb-1 outline-hidden"
                />
              </div>
            )}

            {/* Outline list if available */}
            {outline && outline.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                  <span>আউটলাইন ও অধ্যায় বিভাজন:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                  {outline.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-white border border-slate-200 text-[10px] flex items-center justify-center font-bold text-indigo-600 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Editor Body */}
            <div>
              <textarea
                rows={16}
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                placeholder="স্ক্রিপ্ট তৈরি হলে এখানে সম্পূর্ণ টেক্সট প্রদর্শিত হবে এবং আপনি ইচ্ছেমতো এডিট করতে পারবেন..."
                className="w-full p-4 rounded-2xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden font-sans text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50/40"
              />
            </div>

            {/* Bottom Actions to connect with other studios */}
            {contentBody && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  💡 এই স্ক্রিপ্টটিকে অন্য স্টুডিওতে ট্রান্সফার করুন:
                </div>
                <div className="flex items-center gap-2">
                  {onSendToRepurposer && (
                    <button
                      type="button"
                      onClick={() => onSendToRepurposer(contentBody)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>রি-পারপাস করুন</span>
                    </button>
                  )}
                  {onSendToVideoProduction && (
                    <button
                      type="button"
                      onClick={() => onSendToVideoProduction(generatedTitle || topic)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>ভিডিও স্টোরিবোর্ড</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
