import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Calendar,
  Share2,
  Video,
  FileText,
  RotateCw,
  Megaphone,
  CheckCircle,
  Tag,
  Clock,
} from 'lucide-react';
import { BusinessProject } from '../../types/entrepreneur';
import { EntrepreneurAiService } from '../../services/entrepreneurAiService';

interface MarketingSalesStudioProps {
  project: BusinessProject;
  onShowToast: (msg: string, icon?: string) => void;
}

const CONTENT_CALENDAR_DAYS = [
  { day: 1, type: 'উদ্যোক্তা পরিচয়', topic: 'কেন এই ব্যবসা শুরু করলেন? আপনার পেছনের অনুপ্রেরণা ও লক্ষ্য শেয়ার করুন।' },
  { day: 2, type: 'কাস্টমার সমস্যা', topic: 'আপনার কাস্টমার প্রতিদিন কোন বাস্তব সমস্যায় ভোগেন এবং তা কেন কষ্টের।' },
  { day: 3, type: 'সমাধান ও সুবিধা', topic: 'কীভাবে আপনার সেবা বা পণ্য ঝামেলাহীনভাবে সমস্যার ইতি টানবে।' },
  { day: 4, type: 'বিহাইন্ড দ্য সিন', topic: 'আপনি কীভাবে কাজ তৈরি বা প্যাকেজিং করেন তার একটি ১৫ সেকেন্ডের আনকাট ভিডিও।' },
  { day: 5, type: 'কাস্টমার টেস্টমোনিয়াল', topic: 'সন্তুষ্ট কাস্টমারের একটি রিভিউ বা কথোপকথনের স্ক্রিনশট ও ধন্যবাদ বার্তা।' },
  { day: 6, type: 'সাধারণ ভুল ধারণা', topic: 'আপনার ইন্ডাস্ট্রির প্রচলিত ৩টি ভুল ধারণা দূর করে শিক্ষণীয় পোস্ট।' },
  { day: 7, type: 'সরাসরি সেলস অফার', topic: 'বিশেষ ছাড় বা নির্দিষ্ট প্যাকেজের বিস্তারিত মূল্য ও দ্রুত বুকিংয়ের কল টু অ্যাকশন।' },
  { day: 8, type: 'প্রশ্নোত্তর (Q&A)', topic: 'কাস্টমাররা যে প্রশ্ন সবচেয়ে বেশি করেন তার একটি সহজ সুন্দর উত্তর।' },
  { day: 9, type: 'তুলনামূলক পোস্ট', topic: 'সাধারণ বাজার বনাম আমাদের প্রিমিয়াম মান—কেন আমরা সততায় আপোষ করি না।' },
  { day: 10, type: 'ভিডিও ডেমো', topic: 'মোবাইলে শুট করা ৩০ সেকেন্ডের প্রোডাক্ট ব্যবহার বা কাজের ফলাফল প্রদর্শন।' },
];

export const MarketingSalesStudio: React.FC<MarketingSalesStudioProps> = ({
  project,
  onShowToast,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'facebook_post' | 'sales_copy' | 'whatsapp_message' | 'video_script'>('facebook_post');
  const [productTopic, setProductTopic] = useState(project.offerDraft.selectedBrandName || project.name);
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'copywriter' | 'calendar' | 'campaigns'>('copywriter');

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await EntrepreneurAiService.generateMarketingCopy({
        businessName: project.name,
        productService: productTopic || project.tagline,
        targetAudience: project.targetAudience || 'বাংলাদেশের ক্রেতারা',
        type: selectedFormat,
        tone: 'আন্তরিক ও প্রফেশনাল',
      });

      if (res.success && res.data) {
        setGeneratedOutput(res.data);
        onShowToast('কনটেন্ট সফলভাবে তৈরি হয়েছে! ✍️', '✨');
      }
    } catch {
      onShowToast('কনটেন্ট তৈরিতে সমস্যা হয়েছে।', '⚠️');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    onShowToast('টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে! 📋', '📋');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold mb-2">
            <Megaphone className="w-3.5 h-3.5" />
            <span>মডিউল ৭: মার্কেটিং ও সেলস কপিরাইটিং স্টুডিও</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            কাস্টমারের আবেগকে ছুঁয়ে বিক্রি বাড়ানোর বাংলা সেলস কপি তৈরি করুন
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            ফেসবুক পোস্ট, সেলস কপি, হোয়াটসঅ্যাপ মার্কেটিং বার্তা, টিকটক/রিলস ভিডিও স্ক্রিপ্ট এবং ৩০ দিনের কনটেন্ট ক্যালেন্ডার।
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('copywriter')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'copywriter'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ✍️ কপিরাইটিং জেনারেটর
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📅 ৩০ দিনের সোশ্যাল কনটেন্ট ক্যালেন্ডার
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🎁 ঈদ ও উৎসব অফার ক্যাম্পেইন প্ল্যান
          </button>
        </div>
      </div>

      {/* Tab 1: Copywriter Generator */}
      {activeTab === 'copywriter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">কনটেন্টের ফরম্যাট নির্বাচন করুন:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'facebook_post', label: 'ফেসবুক পোস্ট / ক্যাপশন', icon: '📱' },
                  { id: 'sales_copy', label: 'হাই-কনভার্টিং সেলস কপি', icon: '🎯' },
                  { id: 'whatsapp_message', label: 'হোয়াটসঅ্যাপ ডাইরেক্ট পিচ', icon: '💬' },
                  { id: 'video_script', label: '৩০ সেকেন্ডের রিলস স্ক্রিপ্ট', icon: '🎬' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id as any)}
                    className={`p-3 rounded-2xl border text-left text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                      selectedFormat === fmt.id
                        ? 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500/10'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{fmt.icon}</span>
                    <span>{fmt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">পণ্য বা সেবার বিবরণ / অফার টপিক:</label>
              <input
                type="text"
                value={productTopic}
                onChange={(e) => setProductTopic(e.target.value)}
                placeholder="যেমন: সোশ্যাল মিডিয়া প্যাকেজ / অর্গানিক মধু"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleGenerate}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>কপি প্রস্তুত হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>সেলস কপি তৈরি করুন 🚀</span>
                </>
              )}
            </button>
          </div>

          {/* Output Display (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>জেনারেটকৃত কপি / স্ক্রিপ্ট:</span>
                </span>
                {generatedOutput && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedOutput)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি করুন</span>
                  </button>
                )}
              </div>

              {generatedOutput ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-sans whitespace-pre-line leading-relaxed max-h-[420px] overflow-y-auto">
                  {generatedOutput}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">বামের বাটনে ক্লিক করে তাৎক্ষণিক হাই-কনভার্টিং বাংলা সেলস কপি তৈরি করুন</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Content Calendar */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>সোশ্যাল মিডিয়া কনটেন্ট ক্যালেন্ডার ফ্রেমওয়ার্ক</span>
              </h3>
              <p className="text-xs text-slate-500">প্রতিদিন পেজে কী পোস্ট করবেন তা নিয়ে আর ভাবতে হবে না।</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {CONTENT_CALENDAR_DAYS.map((c) => (
              <div key={c.day} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-700 text-xs">দিন {c.day}: {c.type}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProductTopic(`${c.type}: ${c.topic}`);
                      setActiveTab('copywriter');
                    }}
                    className="text-[10px] text-indigo-600 hover:underline font-bold"
                  >
                    কপি লিখুন →
                  </button>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{c.topic}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Offer Campaigns */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-500" />
            <span>বাংলাদেশে প্রমাণিত সেলস অফার ক্যাম্পেইনসমূহ</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs space-y-1.5">
              <span className="font-bold text-amber-900 block text-sm">১. ঈদ উৎসব স্পেশাল অফার</span>
              <p className="text-slate-700 text-[11px]">
                ঈদের আগের ১৫ দিন কেনাকাটার পিক টাইম। "বান্ডিল প্যাকেজে ১০% ছাড় + আকর্ষণীয় গিফট" দিলে কাস্টমার দ্রুত কেনে।
              </p>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
              <span className="font-bold text-emerald-900 block text-sm">২. প্রথম ১০ জনের বিশেষ ছাড়</span>
              <p className="text-slate-700 text-[11px]">
                নতুন উদ্যোগের জন্য সেরা ক্যাম্পেইন। প্রথম ১০ জন ক্রেতার জন্য বিশেষ দাম ঘোষণা করে স্ক্যারসিটি (Scarcity) তৈরি করুন।
              </p>
            </div>

            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 text-xs space-y-1.5">
              <span className="font-bold text-purple-900 block text-sm">৩. রেফারেল বোনাস ক্যাম্পেইন</span>
              <p className="text-slate-700 text-[11px]">
                "আপনার পরিচিত কাউকে আমাদের সাথে যুক্ত করিয়ে দিলে পরবর্তী অর্ডারে আপনি পাবেন ৳২০০ নগদ ছাড়!"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
