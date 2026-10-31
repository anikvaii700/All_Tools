import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
  Users,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { BusinessProject } from '../../types/entrepreneur';

interface GrowthRoadmapProps {
  project: BusinessProject;
  onUpdateProject: (updater: (prev: BusinessProject) => BusinessProject) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const THIRTY_DAY_CHALLENGE_LIST = [
  { day: 1, title: 'প্রোফাইল ও নিজের সেরা ৩টি আগ্রহ চিহ্নিত করুন' },
  { day: 2, title: 'জিরো ক্যাপিটাল ডাটাবেস থেকে ১টি প্রধান ব্যবসা নির্বাচন' },
  { day: 3, title: 'আশেপাশের ৫ জন মানুষের সাথে কথা বলে সমস্যা যাচাই' },
  { day: 4, title: 'ক্যানভা বা সাধারণ ফোনে ১টি আকর্ষণীয় স্যাম্পল প্রস্তুত' },
  { day: 5, title: 'পরিষ্কার ১ লাইনের ভ্যালু প্রপোজিশন ও ব্র্যান্ড নাম নির্ধারণ' },
  { day: 6, title: '১টি বেসিক ও ১টি গ্রোথ প্যাকেজের মূল্য তালিকা তৈরি' },
  { day: 7, title: 'প্রথম সপ্তাহের কাজের অগ্রগতি ও ভুলত্রুটি রিভিউ' },
  { day: 8, title: '১০ জন পরিচিত মানুষকে হোয়াটসঅ্যাপে বিনম্র পরামর্শ বার্তা পাঠানো' },
  { day: 9, title: 'লোকাল ফেসবুক গ্রুপে ১টি শিক্ষণীয় ভ্যালু পোস্ট শেয়ার' },
  { day: 10, title: 'প্রথম একজনকে ৩ দিনের ফ্রি নো-রিস্ক ট্রায়াল অফার করা' },
  { day: 11, title: 'ফ্রি ট্রায়ালের প্রথম কাজ ডেলিভারি ও দ্রুত ফিডব্যাক গ্রহণ' },
  { day: 12, title: 'কাস্টমারের মনের মতো রিভিশন ও সংশোধন সম্পন্ন করা' },
  { day: 13, title: 'সন্তুষ্ট কাস্টমারের লিখিত রিভিউ স্ক্রিনশট ও সম্মতি নেওয়া' },
  { day: 14, title: '২য় সপ্তাহের কাজের ফলাফল পর্যালোচনা ও দ্বিতীয় ট্রায়াল অনুসন্ধান' },
  { day: 15, title: 'প্রথম পেইড ক্লায়েন্ট অনবোর্ড করা ও ৫০% অগ্রিম গ্রহণ' },
  { day: 16, title: 'বিকাশ পার্সোনাল রিটেইল বা বিজনেস আলাদা হিসাব চালু' },
  { day: 17, title: 'ব্যবসায়িক খরচের খাতা নিয়মিত আপডেটের রুটিন তৈরি' },
  { day: 18, title: 'প্রথম পেইড ক্লায়েন্টের কাজ সময়মতো ১০০% কোয়ালিটিতে ডেলিভারি' },
  { day: 19, title: 'ক্লায়েন্টকে জিজ্ঞেস করা: "আপনার পরিচিত আর কার এই সেবা প্রয়োজন?"' },
  { day: 20, title: 'রেফারেল পাওয়া নতুন ২ জনের সাথে সরাসরি মিটিং/ফোনে কথা' },
  { day: 21, title: '৩য় সপ্তাহের রিভিউ ও মোট সংগৃহীত রেভিনিউ গণনা' },
  { day: 22, title: 'দ্বিতীয় পেইড ক্লায়েন্ট কনভার্ট ও অগ্রিম নিশ্চিতকরণ' },
  { day: 23, title: 'সামাজিক মাধ্যমে কাজের বিহাইন্ড দ্য সিন বা কেস স্টাডি পোস্ট' },
  { day: 24, title: 'কাস্টমার ফলো-আপ ও দ্বিতীয় মাসের রিটেইনার আলোচনা' },
  { day: 25, title: 'নিজের কাজের একটি স্ট্যান্ডার্ড অপারেটিং প্রসিডিউর (SOP) তৈরি' },
  { day: 26, title: 'তৃতীয় পেইড ক্লায়েন্টের সাথে চুক্তি সম্পন্ন' },
  { day: 27, title: 'ট্রেড লাইসেন্স ও প্রাথমিক আইনি তথ্যাদি সংগ্রহ ও ফাইল প্রস্তুত' },
  { day: 28, title: 'অর্জিত মুনাফা থেকে ২০% রিইনভেস্ট ফান্ডে আলাদা জমা' },
  { day: 29, title: 'সন্তুষ্ট ক্লায়েন্টদের ধন্যবাদ জানিয়ে শুভেচ্ছা মেসেজ' },
  { day: 30, title: '৩০ দিনের চ্যালেঞ্জ সমাপনী উৎসব ও পরবর্তী ৯০ দিনের রোডম্যাপ শুরু' },
];

export const GrowthRoadmap: React.FC<GrowthRoadmapProps> = ({
  project,
  onUpdateProject,
  onShowToast,
}) => {
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`mosafa_growth_days_${project.id}`);
      return saved ? JSON.parse(saved) : [1, 2, 3];
    } catch {
      return [1, 2, 3];
    }
  });

  const [activeTab, setActiveTab] = useState<'30days' | '90days' | 'hiring'>('30days');

  const toggleDay = (day: number) => {
    let updated: number[];
    if (completedDays.includes(day)) {
      updated = completedDays.filter((d) => d !== day);
    } else {
      updated = [...completedDays, day];
      onShowToast(`দিন ${day} সম্পন্ন হয়েছে! দুর্দান্ত গতি! 🏆`, '⭐');
    }
    setCompletedDays(updated);
    try {
      localStorage.setItem(`mosafa_growth_days_${project.id}`, JSON.stringify(updated));
    } catch {}
  };

  const progressPercent = Math.round((completedDays.length / THIRTY_DAY_CHALLENGE_LIST.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>মডিউল ১১: বিজনেস গ্রোথ ও রোডম্যাপ প্ল্যানার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            ৩০ দিনের জিরো-টু-ওয়ান চ্যালেঞ্জ ও ৯০ দিনের স্কেলিং রোডম্যাপ
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            কোনো দ্বিধা ছাড়াই প্রতিদিন মাত্র ১টি নির্দিষ্ট পদক্ষেপে এগিয়ে যান। ধারাবাহিকভাবে ৩০ দিন শেষ করলেই আপনার হাতে থাকবে একটি বাস্তব, লাভজনক ব্যবসা।
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('30days')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === '30days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🔥 ৩০ দিনের বাস্তব চ্যালেঞ্জ ({progressPercent}%)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('90days')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === '90days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📈 ৯০ দিনের ৩-পর্যায়ের রোডম্যাপ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hiring')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'hiring'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🤝 প্রথম টিম মেম্বার নিয়োগ ও আউটসোর্সিং
          </button>
        </div>
      </div>

      {/* Tab 1: 30-Day Challenge */}
      {activeTab === '30days' && (
        <div className="space-y-4">
          {/* Progress Bar Card */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-950 text-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs text-indigo-300 font-bold">আপনার অগ্রগতির স্কোর</span>
              <h3 className="text-xl font-bold">
                {completedDays.length} / {THIRTY_DAY_CHALLENGE_LIST.length} দিন সফলভাবে সম্পন্ন
              </h3>
            </div>
            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex justify-between text-xs text-indigo-200 font-bold">
                <span>অগ্রগতি</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* 30 Days Checkboxes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {THIRTY_DAY_CHALLENGE_LIST.map((item) => {
              const isDone = completedDays.includes(item.day);
              return (
                <div
                  key={item.day}
                  onClick={() => toggleDay(item.day)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 select-none ${
                    isDone
                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-indigo-300 text-slate-800'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}} // handled by parent div
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className={`text-[10px] font-bold block ${isDone ? 'text-emerald-700' : 'text-indigo-600'}`}>
                      দিন #{item.day}
                    </span>
                    <p className={`text-xs font-medium leading-snug ${isDone ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: 90 Days Scaling Roadmap */}
      {activeTab === '90days' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              মাস ১: ভ্যালিডেশন ও প্রথম ৩-৫ ক্লায়েন্ট
            </span>
            <h3 className="text-base font-bold text-slate-900">ভিত্তি স্থাপন ও প্রথম আয়</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>✓ জিরো পুঁজিতে কাজ শুরু করা</li>
              <li>✓ কাস্টমারের অগ্রিম টাকা নিয়ে উপকরণ বা ডাটা কেনা</li>
              <li>✓ প্রথম ৫ জন ক্রেতার সাথে গভীর যোগাযোগ ও টেস্টমোনিয়াল নেওয়া</li>
              <li>✓ মাসিক ৳১৫,০০০ - ২৫,০০০ আয়ে পৌঁছানো</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
              মাস ২: সিস্টেমাইজেশন ও ১৫-২০ ক্লায়েন্ট
            </span>
            <h3 className="text-base font-bold text-slate-900">নিয়মিত কার্যক্রম ও প্রচার</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>✓ কাজের নির্দিষ্ট দৈনিক রুটিন ও টেমপ্লেট লাইব্রেরি রেডি করা</li>
              <li>✓ সন্তুষ্ট ক্লায়েন্টদের থেকে রেফারেল সিস্টেম চালু করা</li>
              <li>✓ ট্রেড লাইসেন্স ও আনুষ্ঠানিক বিজনেস কারেন্ট একাউন্ট সম্পন্ন করা</li>
              <li>✓ মাসিক ৳৩৫,০০০ - ৫০,০০০ আয়ে উত্তীর্ণ হওয়া</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              মাস ৩: টিম ও ব্যবসা সম্প্রসারণ
            </span>
            <h3 className="text-base font-bold text-slate-900">স্কেলিং ও স্বয়ংক্রিয়করণ</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>✓ একজন পার্ট-টাইম সহকারী নিয়োগ করে রুটিন কাজ অর্পণ</li>
              <li>✓ প্রিমিয়াম ক্লায়েন্ট ও উচ্চমূল্যের প্যাকেজে জোর দেওয়া</li>
              <li>✓ ব্যবসা থেকে নিয়মিত ২০% রিইনভেস্ট করে মার্কেটিং বাড়ানো</li>
              <li>✓ মাসিক ৳৭০,০০০+ লক্ষ্যমাত্রায় পৌঁছানো</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Hiring Checklist */}
      {activeTab === 'hiring' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            কখন এবং কীভাবে প্রথম সহকারী বা পার্টনার নিয়োগ করবেন:
          </h3>
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-xs">১. সঠিক সময় নির্ধারণ:</span>
              <p className="text-slate-600 text-[11px]">
                যখন আপনি কাজের চাপে নতুন ক্লায়েন্টের সাথে কথা বলার সময় পাচ্ছেন না এবং ব্যবসা থেকে নিজের খরচের বাইরে অতিরিক্ত টাকা আসছে, তখনই প্রথম সহকারী নিয়োগ দেওয়ার সময়।
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-xs">২. রুটিন কাজের জন্য প্রজেক্ট ভিত্তিক নিয়োগ:</span>
              <p className="text-slate-600 text-[11px]">
                শুরুতেই ফিক্সড মাসিক বেতনের চাপ না নিয়ে কাজ অনুযায়ী বা প্রতি পোস্টার/ডেলিভারি হিসেবে পার্ট-টাইম শিক্ষার্থী বা ফ্রিল্যান্সারদের দায়িত্ব দিন।
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-xs">৩. কাজের লিখিত নির্দেশিকা (SOP):</span>
              <p className="text-slate-600 text-[11px]">
                কীভাবে পোস্টার ডিজাইন করবেন, কী সাইজ হবে, কীভাবে ডেলিভারি করবেন—একটি ৩ পাতার গাইডলাইন লিখে দিলে নতুন কর্মী কোনো ভুল না করে ঠিকমতো কাজ করতে পারবে।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
