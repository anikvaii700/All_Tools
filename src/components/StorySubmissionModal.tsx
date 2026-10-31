import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Send,
  Info,
  Clock,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { storySubmissionService, SubmittedStory } from '../services/storySubmissionService';

interface StorySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, icon?: string) => void;
  defaultType?: 'islamic' | 'general';
}

const ISLAMIC_CATEGORIES = [
  { id: 'rizq', label: '💰 রিজিক ও দারিদ্র্য মুক্তি' },
  { id: 'dua_accepted', label: '🤲 অসম্ভব দোয়া কবুল' },
  { id: 'shifa', label: '🩺 কঠিন রোগ ও শিফা' },
  { id: 'child', label: '👶 সন্তান লাভ ও পরিবার' },
  { id: 'distress', label: '🛡️ পেরেশানি ও বিপদ থেকে উদ্ধার' },
  { id: 'general_islamic', label: '📿 সাধারণ ইস্তেগফার ও জিকির আমল' },
];

const GENERAL_CATEGORIES = [
  { id: 'romance', label: '❤️ প্রেম ও রোমান্টিক' },
  { id: 'thriller', label: '⚡ থ্রিলার ও রোমাঞ্চ' },
  { id: 'horror', label: '👻 ভৌতিক ও অলৌকিক' },
  { id: 'mystery', label: '🔍 রহস্য ও গোয়েন্দা' },
  { id: 'social', label: '🏡 পারিবারিক ও সামাজিক' },
  { id: 'inspirational', label: '💡 শিক্ষামূলক ও অনুপ্রেরণা' },
  { id: 'sci_fi', label: '🚀 সায়েন্স ফিকশন' },
  { id: 'children', label: '🎈 শিশু-কিশোর গল্প' },
];

export const StorySubmissionModal: React.FC<StorySubmissionModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  defaultType = 'general',
}) => {
  const [storyType, setStoryType] = useState<'islamic' | 'general'>(defaultType);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [authorContact, setAuthorContact] = useState('');
  const [category, setCategory] = useState(
    defaultType === 'islamic' ? 'rizq' : 'romance'
  );
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [lessonOrAmal, setLessonOrAmal] = useState('');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentCategories =
    storyType === 'islamic' ? ISLAMIC_CATEGORIES : GENERAL_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !author.trim() || !content.trim()) {
      onShowToast('দয়া করে শিরোনাম, লেখকের নাম ও গল্পের বিবরণ পূরণ করুন!', '⚠️');
      return;
    }

    const paragraphs = content
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const categoryItem = currentCategories.find((c) => c.id === category);
    const categoryLabel = categoryItem ? categoryItem.label : category;

    setIsSubmitting(true);

    try {
      await storySubmissionService.submitStory({
        title: title.trim(),
        author: author.trim(),
        authorContact: authorContact.trim() || undefined,
        storyType,
        category,
        categoryLabel,
        shortDescription:
          shortDescription.trim() ||
          paragraphs[0]?.slice(0, 140) + '...' ||
          'একটি সুন্দর নতুন গল্প।',
        content: paragraphs,
        lessonOrAmal: lessonOrAmal.trim() || undefined,
        reference: reference.trim() || undefined,
        coverIcon: storyType === 'islamic' ? '📿' : '✍️',
        coverGradient:
          storyType === 'islamic'
            ? 'from-emerald-900 via-teal-950 to-slate-950'
            : 'from-rose-600 via-pink-700 to-indigo-900',
      });

      setSubmittedSuccess(true);
      onShowToast('গল্পটি পর্যালোচনার জন্য সফলভাবে জমা হয়েছে! 🌟', '🎉');
    } catch {
      onShowToast('গল্প জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।', '⚠️');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setTitle('');
    setAuthor('');
    setAuthorContact('');
    setShortDescription('');
    setContent('');
    setLessonOrAmal('');
    setReference('');
    setSubmittedSuccess(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black leading-tight">
                গল্প জমা দিন ও প্রকাশ করুন
              </h3>
              <p className="text-[11px] text-slate-300">
                এডমিন যাচাই ও অনুমোদনের পর সাইটে লাইভ প্রকাশিত হবে
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          /* Submission Success State */
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-sm animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-slate-900">
                আপনার গল্পটি সফলভাবে জমা হয়েছে! 🎉
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                ধন্যবাদ! গল্পটি বর্তমানে <span className="font-bold text-amber-600">পেন্ডিং (যাচাইয়ের অপেক্ষায়)</span> রয়েছে। এডমিন এটি পর্যালোচনা করে অনুমোদন (Approve) করলে সাইটে সবার পড়ার জন্য লাইভ হয়ে যাবে এবং একটি নোটিফিকেশন আসবে।
              </p>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setSubmittedSuccess(false);
                  setTitle('');
                  setContent('');
                  setLessonOrAmal('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                আরেকটি গল্প লিখুন
              </button>
              <button
                onClick={handleResetAndClose}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black cursor-pointer shadow-md"
              >
                ঠিক আছে, বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-5 text-xs sm:text-sm">
            {/* 1. Choose Story Type (Islamic vs General) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                গল্পের ধরন নির্বাচন করুন *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setStoryType('islamic');
                    setCategory('rizq');
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    storyType === 'islamic'
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">📿</span>
                  <div>
                    <h5 className="font-black text-xs sm:text-sm text-emerald-950">
                      ইস্তেগফার ও ইসলামিক গল্প
                    </h5>
                    <p className="text-[10px] text-emerald-700/80">
                      বাস্তব অভিজ্ঞতা, আমল ও বরকত
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStoryType('general');
                    setCategory('romance');
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                    storyType === 'general'
                      ? 'bg-gradient-to-r from-rose-50 to-indigo-50 border-rose-500 ring-2 ring-rose-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">✍️</span>
                  <div>
                    <h5 className="font-black text-xs sm:text-sm text-slate-900">
                      সাধারণ স্বরচিত গল্প
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      সাহিত্য, রোমাঞ্চ, রহস্য, পারিবারিক
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Informational Banner */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2 text-[11px] sm:text-xs text-amber-900 leading-relaxed">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>এডমিন যাচাই নীতি:</strong> কপিরাইটমুক্ত এবং মার্জিত গল্প লিখুন। এডমিন প্যানেল থেকে আপনার গল্পটি পর্যবেক্ষণ ও অনুমোদনের পর তা সাইটে প্রকাশিত হবে।
              </span>
            </div>

            {/* 3. Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  গল্পের শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    storyType === 'islamic'
                      ? 'যেমন: প্রতিদিন ইস্তেগফারের পর আমার জীবনে যা ঘটেছিল'
                      : 'যেমন: মধ্যরাতের একাকী পদধ্বনি'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  লেখকের নাম / ছদ্মনাম *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="আপনার নাম বা ছদ্মনাম লিখুন"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Category & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  বিভাগ / ক্যাটাগরি *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white cursor-pointer"
                >
                  {currentCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ইমেইল বা মোবাইল (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={authorContact}
                  onChange={(e) => setAuthorContact(e.target.value)}
                  placeholder="অনুমোদনের আপডেট পাওয়ার জন্য"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 5. Short Description */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                সংক্ষিপ্ত ভূমিকা বা সারাংশ (১-২ লাইন)
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="গল্পের মূল আকর্ষণ বা এক লাইনের সারসংক্ষেপ..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* 6. Full Story Content */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                সম্পূর্ণ গল্প লিখুন * (নতুন অনুচ্ছেদের জন্য Enter দিন)
              </label>
              <textarea
                required
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="আপনার গল্পটি সুন্দরভাবে গুছিয়ে লিখুন... নতুন প্যারাগ্রাফ করতে Enter চাপুন।"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* 7. Lesson or Amal (if Islamic or moral) */}
            {storyType === 'islamic' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    কোন বিশেষ আমল করা হয়েছিল?
                  </label>
                  <input
                    type="text"
                    value={lessonOrAmal}
                    onChange={(e) => setLessonOrAmal(e.target.value)}
                    placeholder="যেমন: প্রতিদিন ১০০০ বার ইস্তেগফার ও তাহাজ্জুদ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    হাদিস রেফারেন্স / ঘটনার সূত্র (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="যেমন: বাস্তব ঘটনা / সহিহ হাদিসের আলো"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  গল্পের নীতিবাক্য বা শিক্ষণীয় বিষয় (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={lessonOrAmal}
                  onChange={(e) => setLessonOrAmal(e.target.value)}
                  placeholder="যেমন: সত্যের জয় ও ধৈর্য্যের ফল সর্বদা মধুর হয়।"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-black flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'জমা হচ্ছে...' : 'অনুমোদনের জন্য জমা দিন 🚀'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
