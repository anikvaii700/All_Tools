import React from 'react';
import {
  Layers,
  Sparkles,
  ArrowRight,
  FileText,
  Printer,
  Camera,
  Image as ImageIcon,
  Users,
  Maximize2,
  Scissors,
  Palette,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PhotoSizePreset } from './photoStudioTypes';

export type StudioSection =
  | 'dashboard'
  | 'multi-photo'
  | 'id-card'
  | 'two-person'
  | 'background-changer';

interface StudioDashboardProps {
  onSelectSection: (section: StudioSection, initialPreset?: PhotoSizePreset) => void;
  onBackToHome?: () => void;
}

export const StudioDashboard: React.FC<StudioDashboardProps> = ({
  onSelectSection,
  onBackToHome,
}) => {
  const tools = [
    {
      id: 'multi-photo',
      title: 'ডিজিটাল ফটো ও প্রিন্ট স্টুডিও (Digital Photo & Print Studio)',
      englishTitle: 'Passport, Stamp, Visa, Full A4 & Custom Multi-Size Photos',
      subtitle:
        'পাসপোর্ট (৩৫×৪৫ মিমি), স্ট্যাম্প (২০×২৫ মিমি), ভিসা, ৩R, ৪R, সম্পূর্ণ A4 পেজ বা কাস্টম মাপে ছবি সাজিয়ে আসল স্কেলে প্রিন্ট ও পিডিএফ ডাউনলোড।',
      badge: 'অল-ইন-ওয়ান স্টুডিও',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <Camera className="w-7 h-7 text-emerald-600" />,
      iconBg: 'bg-emerald-50 border border-emerald-200',
      onClick: () => onSelectSection('multi-photo', 'passport-bd'),
      actionLabel: 'ফটো স্টুডিও শুরু করুন',
      presets: [
        { label: 'পাসপোর্ট (৩৫×৪৫)', preset: 'passport-bd' as PhotoSizePreset },
        { label: 'স্ট্যাম্প (২০×২৫)', preset: 'stamp' as PhotoSizePreset },
        { label: 'ফুল A4 পেজ', preset: 'a4-full' as PhotoSizePreset },
        { label: 'কাস্টম মাপ', preset: 'custom' as PhotoSizePreset },
      ],
    },
    {
      id: 'id-card',
      title: 'আইডি কার্ড সামনে ও পেছনে এক পেজে (AI ID Card Maker)',
      englishTitle: 'Front & Back to One Page (NID / Smart Card / Driving License)',
      subtitle:
        'আইডি কার্ড বা স্মার্ট কার্ডের উভয় পাশ স্বয়ংক্রিয় নিখুঁত ক্রপ ও সোজা করে আসল ১০০% স্কেলে (৮৫.৬ × ৫৪ মিমি) পাশাপাশি বা উপরে-নিচে প্রিন্ট।',
      badge: 'AI ক্রপ ও সোজা করার ইঞ্জিন',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      icon: <FileText className="w-7 h-7 text-teal-600" />,
      iconBg: 'bg-teal-50 border border-teal-200',
      onClick: () => onSelectSection('id-card'),
      actionLabel: 'আইডি কার্ড তৈরি করুন',
    },
    {
      id: 'two-person',
      title: 'দুইজনের জয়েন্ট ছবি স্টুডিও (Two-Person Joint Photo)',
      englishTitle: 'Shoulder-to-Shoulder Joint Photo Frame',
      subtitle:
        'দুইজনের পৃথক ছবি কাঁধে কাঁধ মিলিয়ে এক ফ্রেমে যুক্ত করে কাবিননামা, বিবাহ বা যৌথ অফিসিয়াল ফরমের জন্য ৭০×৪৫ মিমি বা ৩R মাপে প্রিন্ট।',
      badge: 'যৌথ ফটো ফ্রেম',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: <Users className="w-7 h-7 text-purple-600" />,
      iconBg: 'bg-purple-50 border border-purple-200',
      onClick: () => onSelectSection('two-person'),
      actionLabel: 'দুইজনের জয়েন্ট ছবি সাজান',
    },
    {
      id: 'background-changer',
      title: 'ছবির ব্যাকগ্রাউন্ড পরিবর্তন (Studio Backdrop Changer)',
      englishTitle: 'Studio Background Color (White / Blue / Sky / Transparent)',
      subtitle:
        'এক ক্লিকে যেকোনো ছবির ব্যাকগ্রাউন্ড প্রমিত স্টুডিও হোয়াইট, পাসপোর্ট ব্লু বা ট্রান্সপারেন্ট PNG করে ডাউনলোড বা সরাসরি A4 শিটে প্রিন্ট করুন।',
      badge: 'স্টুডিও কালার রিপ্লেসমেন্ট',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: <Palette className="w-7 h-7 text-rose-600" />,
      iconBg: 'bg-rose-50 border border-rose-200',
      onClick: () => onSelectSection('background-changer'),
      actionLabel: 'ব্যাকগ্রাউন্ড পরিবর্তন করুন',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      {/* Hero Studio Banner */}
      <div className="bg-gradient-to-b from-white via-slate-50/80 to-slate-100/50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Top Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold tracking-wide mb-4 shadow-2xs">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>MoSaFa Tools — আল্ট্রা ডিজিটাল স্টুডিও</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-snug">
              আল্ট্রা ডিজিটাল স্টুডিও (Ultra Digital Studio)
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              ছবি সাজান, প্রয়োজনীয় সাইজ তৈরি করুন এবং কম্পিউটার বা মোবাইলের যেকোনো প্রিন্টারে আসল স্কেলে প্রিন্ট করুন।
            </p>

            {/* 3 Value propositions */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ৩০০ DPI হাই-রেজ্যুলেশন আসল সাইজ
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <Printer className="w-4 h-4 text-indigo-600" />
                সব প্রিন্টারে সরাসরি প্রিন্ট (Epson, Canon, HP)
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                ১০০% প্রাইভেট (ব্রাউজারে প্রসেসিং)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              সাব-টুলসমূহ নির্বাচন করুন
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              আপনার কাজের ধরনের ওপর ভিত্তি করে নির্দিষ্ট সাব-টুলটি ওপেন করুন
            </p>
          </div>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-2xs cursor-pointer"
            >
              ← মূল ওয়েবসাইটে ফিরুন
            </button>
          )}
        </div>

        {/* 4 Dedicated, Specialized Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-400 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row: Icon & Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${tool.iconBg} group-hover:scale-105 transition-transform`}
                  >
                    {tool.icon}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${tool.badgeColor}`}
                  >
                    {tool.badge}
                  </span>
                </div>

                {/* Tool Titles */}
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mb-2">
                  {tool.englishTitle}
                </p>

                {/* Subtitle / Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {tool.subtitle}
                </p>

                {/* Preset Chips (If Multi-Photo Studio) */}
                {tool.presets && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
                      দ্রুত সাইজ নির্বাচন:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.presets.map((p) => (
                        <button
                          key={p.preset}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSection('multi-photo', p.preset);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-[11px] font-bold border border-slate-200 hover:border-indigo-200 transition cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={tool.onClick}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-between cursor-pointer group-hover:shadow-md"
                >
                  <span>{tool.actionLabel}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
