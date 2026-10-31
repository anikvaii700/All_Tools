import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Film,
  ListOrdered,
  Clock,
  Layers,
  ArrowRight,
  Bookmark,
  Share2,
  Copy,
  Check,
  Info,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { VideoProductionPlan, StoryboardScene } from '../../types/creatorStudio';
import { CreatorAiService } from '../../services/creatorAiService';
import { CreatorStorage } from '../../services/creatorStorage';

interface AiVideoProductionProps {
  initialTopic?: string;
  onShowToast?: (msg: string, icon?: string) => void;
  onSendToVideoEditor?: (plan: VideoProductionPlan) => void;
}

export const AiVideoProduction: React.FC<AiVideoProductionProps> = ({
  initialTopic = '',
  onShowToast,
  onSendToVideoEditor,
}) => {
  const [topic, setTopic] = useState(initialTopic || 'কম্পিউটার ছাড়া মোবাইল দিয়ে ফটো ও ভিডিও এডিটিং');
  const [platform, setPlatform] = useState('youtube');
  const [duration, setDuration] = useState('৩-৫ মিনিট (YouTube Video)');
  const [tone, setTone] = useState('উৎসাহব্যঞ্জক ও আধুনিক (Energetic & Modern)');
  const [language, setLanguage] = useState('bn');

  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<VideoProductionPlan | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const res = await CreatorAiService.generateVideoPlan({
        topic,
        platform,
        duration,
        tone,
        language,
      });

      if (res && res.data) {
        setPlan(res.data);
        if (onShowToast) {
          onShowToast('সম্পূর্ণ ভিডিও প্রোডাকশন প্ল্যান ও স্টোরিবোর্ড প্রস্তুত!', '🎬');
        }
      }
    } catch {
      if (onShowToast) {
        onShowToast('ভিডিও প্ল্যান তৈরিতে সমস্যা হয়েছে।', '⚠️');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!plan) return;
    CreatorStorage.saveVideoPlan(plan);
    if (onShowToast) {
      onShowToast('ভিডিও প্রোডাকশন প্ল্যান সেভ করা হয়েছে!', '💾');
    }
  };

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(sectionId);
    if (onShowToast) {
      onShowToast('ক্লিপবোর্ডে কপি হয়েছে!', '📋');
    }
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-200">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              এআই ভিডিও প্রোডাকশন ও স্টোরিবোর্ড (AI Video Production) 🎬
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              প্রথম ৩ সেকেন্ডের হুক, সিন-বাই-সিন স্টোরিবোর্ড, ভিজ্যুয়াল ডিরেকশন ও ভয়েসওভার শট লিস্ট
            </p>
          </div>
        </div>

        {/* Honest AI Capability Notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">প্রোডাকশন প্ল্যানিং বনাম ভিডিও জেনারেশন:</span> এটি একটি পেশাদার ডিরেক্টর সহকারী যা প্রতিটি দৃশ্য (Scene), ক্যামেরা অ্যাঙ্গেল, বি-রোল ফুটেজ ও অন-স্ক্রিন টেক্সটের সুনির্দিষ্ট তালিকা প্রস্তুত করে। আপনি এই প্ল্যান নিয়ে সরাসরি মোবাইল/ক্যামেরা শুট করতে পারেন অথবা আমাদের বিল্ট-ইন ব্রাউজার ভিডিও এডিটরে পাঠাতে পারেন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column */}
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>ভিডিও প্যারামিটার</span>
            <span className="text-[11px] text-slate-400">ডিরেকশন ইনপুট</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ভিডিওর বিষয়বস্তু (Topic)
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-500 outline-hidden"
              placeholder="যেমন: ওয়ার্ডপ্রেস ওয়েবসাইট তৈরির সহজ গাইড..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              প্ল্যাটফর্ম
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="youtube">ইউটিউব লং ভিডিও (Landscape 16:9)</option>
              <option value="shorts">ইউটিউব শর্টস ও রিলস (Vertical 9:16)</option>
              <option value="facebook">ফেসবুক ওয়াচ ও পেজ ভিডিও</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ভিডিওর দৈর্ঘ্য
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="৩০-৬০ সেকেন্ড (Shorts/Reels)">৩০-৬০ সেকেন্ড (শর্টস/রিলস)</option>
              <option value="৩-৫ মিনিট (YouTube Video)">৩-৫ মিনিট (ইউটিউব ভিডিও)</option>
              <option value="৮-১০ মিনিট (Masterclass)">৮-১০ মিনিট (পূর্ণাঙ্গ মাস্টারক্লাস)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ভিডিও টোন ও মেজাজ
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="উৎসাহব্যঞ্জক ও আধুনিক (Energetic & Modern)">উৎসাহব্যঞ্জক ও আধুনিক</option>
              <option value="পেশাদার ও শান্ত (Calm & Professional)">পেশাদার ও তথ্যভিত্তিক</option>
              <option value="হাস্যরস ও বিনোদনধর্মী (Fun & Engaging)">হাস্যরস ও বিনোদনধর্মী</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>স্টোরিবোর্ড তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>স্টোরিবোর্ড ও শট লিস্ট জেনারেট করুন</span>
              </>
            )}
          </button>
        </form>

        {/* Storyboard Output Column */}
        <div className="lg:col-span-8 space-y-4">
          {plan ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                    {plan.durationEstimate} • {plan.platform.toUpperCase()}
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-slate-900">{plan.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSavePlan}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    <span>সেভ</span>
                  </button>
                  {onSendToVideoEditor && (
                    <button
                      type="button"
                      onClick={() => onSendToVideoEditor(plan)}
                      className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>ভিডিও এডিটরে পাঠান</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Hook Card */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>প্রথম ৩-৫ সেকেন্ডের ভাইরাল হুক (Viral Hook):</span>
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                  &quot;{plan.hook}&quot;
                </p>
              </div>

              {/* Scenes Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-purple-600" />
                  <span>দৃশ্য বিভাজন ও শট লিস্ট ({plan.scenes.length}টি দৃশ্য)</span>
                </span>

                <div className="space-y-3">
                  {plan.scenes.map((scene) => (
                    <div
                      key={scene.sceneNumber}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs">
                          দৃশ্য #{scene.sceneNumber} ({scene.durationSeconds} সেকেন্ড)
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          মিউজিক: {scene.musicMood}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-700">🎬 ভিজ্যুয়াল ডিরেকশন:</span>
                          <p className="text-slate-600 leading-relaxed">{scene.visualPrompt}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-slate-700">🎙️ ভয়েসওভার স্ক্রিপ্ট:</span>
                          <p className="text-slate-800 leading-relaxed font-medium">
                            &quot;{scene.voiceover}&quot;
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="text-indigo-700 font-bold">
                          অন-স্ক্রিন টেক্সট: {scene.onScreenText}
                        </span>
                        <span className="text-slate-500">
                          বি-রোল আইডিয়া: {scene.bRollSuggestion}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title Ideas & Metadata */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800">
                  💡 প্রস্তাবিত ভাইরাল টাইটেল আইডিয়া:
                </span>
                <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                  {plan.titleIdeas.map((ti, idx) => (
                    <li key={idx}>{ti}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
              <Film className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">কোনো স্টোরিবোর্ড তৈরি নেই</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                বামপাশের ফর্মে আপনার ভিডিওর বিষয়বস্তু লিখে &quot;স্টোরিবোর্ড ও শট লিস্ট জেনারেট করুন&quot; বাটনে ক্লিক করুন।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
