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
import { PassportPresetId, StudioWorkspaceTab } from './ai-photo-studio/types';
import { SubToolVisualLogo } from '../SubToolVisualLogo';
import { ToolVisualLogo } from '../ToolVisualLogo';

export type StudioSection =
  | 'dashboard'
  | 'ai-photo-studio'
  | 'multi-photo'
  | 'doc-scanner'
  | 'id-card'
  | 'two-person'
  | 'background-changer';

export interface StudioLaunchOptions {
  preset?: PhotoSizePreset;
  aiStudioTab?: StudioWorkspaceTab;
  aiPassportPreset?: PassportPresetId;
}

interface StudioDashboardProps {
  onSelectSection: (
    section: StudioSection,
    initialPreset?: PhotoSizePreset,
    launchOptions?: StudioLaunchOptions
  ) => void;
  onOpenStandaloneTool?: (toolId: 'job-photo-signature-resizer' | 'poster-studio') => void;
  onBackToHome?: () => void;
}

export const StudioDashboard: React.FC<StudioDashboardProps> = ({
  onSelectSection,
  onOpenStandaloneTool,
  onBackToHome,
}) => {
  const tools = [
    {
      id: 'ai-photo-studio',
      title: 'MoSaFa AI Photo Studio – All-in-One',
      englishTitle: '216+ Styles, Free Neural Background Changer, Attire Overlays, Passport & Print Studio',
      subtitle:
        'একই স্টুডিওতে ২১৬+ ফটো স্টাইল, ১৫ ক্যাটাগরি ফ্রি ব্যাকগ্রাউন্ড রিমুভ ও পরিবর্তন, ফরমাল পোশাক ওভারলে, বাংলাদেশ পাসপোর্ট (৪৫×৫৫ / ৩৫×৪৫ মিমি), ভিসা সাইজ এবং 4R/5R/A4 মাল্টি-কপি প্রিন্ট ও PDF।',
      badge: '✨ নতুন: অল-ইন-ওয়ান ফ্রি স্টুডিও',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold',
      icon: <Sparkles className="w-7 h-7 text-indigo-600" />,
      iconBg: 'bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200',
      onClick: () =>
        onSelectSection('ai-photo-studio', undefined, {
          aiStudioTab: 'backgrounds',
          aiPassportPreset: 'original-free',
        }),
      actionLabel: 'MoSaFa AI Photo Studio ওপেন করুন',
      presets: [
        {
          label: '🎨 ব্যাকগ্রাউন্ড চেঞ্জার',
          targetSection: 'ai-photo-studio' as StudioSection,
          launchOptions: { aiStudioTab: 'backgrounds' as StudioWorkspaceTab, aiPassportPreset: 'original-free' as PassportPresetId },
        },
        {
          label: '✨ ২১৬+ স্টাইল',
          targetSection: 'ai-photo-studio' as StudioSection,
          launchOptions: { aiStudioTab: 'styles' as StudioWorkspaceTab, aiPassportPreset: 'original-free' as PassportPresetId },
        },
        {
          label: '🪪 পাসপোর্ট (৪৫×৫৫ / ৩৫×৪৫)',
          targetSection: 'ai-photo-studio' as StudioSection,
          launchOptions: { aiStudioTab: 'passport' as StudioWorkspaceTab, aiPassportPreset: 'bd-passport-45x55' as PassportPresetId },
        },
        {
          label: '🖨️ 4R / 5R / A4 প্রিন্ট শিট',
          targetSection: 'ai-photo-studio' as StudioSection,
          launchOptions: { aiStudioTab: 'print' as StudioWorkspaceTab, aiPassportPreset: 'bd-standard-35x45' as PassportPresetId },
        },
      ],
    },
    {
      id: 'doc-scanner',
      title: 'স্মার্ট ডকুমেন্ট স্ক্যানার ও অটো A4 মেকার (Smart Document Scanner)',
      englishTitle: 'Auto Edge Detection, Perspective Deskew, Shadow Clean & Multi-Page A4 PDF',
      subtitle:
        'মোবাইল দিয়ে তোলা আঁকাবাঁকা ও ছায়াযুক্ত দরখাস্ত, সনদপত্র, রসিদ বা দলিলের ছবি এক ক্লিকে সোজা, অটো ক্রপ, ছায়া দূর ও বহু-পৃষ্ঠা প্রিন্ট-রেডি A4 সাইজ ও PDF তৈরি।',
      badge: 'ডকুমেন্ট স্ক্যানার ও A4',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
      icon: <FileText className="w-7 h-7 text-emerald-600" />,
      iconBg: 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200',
      onClick: () => onSelectSection('doc-scanner'),
      actionLabel: 'ডকুমেন্ট স্ক্যানার ও A4 শুরু করুন',
      presets: [
        { label: '📄 পেপার স্ক্যান ও A4', preset: 'a4-full' as PhotoSizePreset, targetSection: 'doc-scanner' as StudioSection },
        { label: '📑 বহু-পৃষ্ঠা PDF মেকার', preset: 'custom' as PhotoSizePreset, targetSection: 'doc-scanner' as StudioSection },
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

        {/* 6 Dedicated Visual Logo Sub-Tool Buttons (4 Studio Sections + 2 SEO-Preserved Independent Sub-Tools) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={tool.onClick}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 p-5 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="mb-3.5 flex items-center justify-center">
                <SubToolVisualLogo
                  logoId={tool.id}
                  className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              <h3 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                {tool.title}
              </h3>
            </button>
          ))}

          {/* Sub-Tool 5: Job Photo & Signature Resizer (Opens original canonical URL /tools/job-photo-signature-resizer) */}
          <a
            href="/tools/job-photo-signature-resizer"
            onClick={(e) => {
              if (onOpenStandaloneTool) {
                e.preventDefault();
                onOpenStandaloneTool('job-photo-signature-resizer');
              }
            }}
            className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 p-5 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center group cursor-pointer no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="mb-3.5 flex items-center justify-center">
              <ToolVisualLogo
                toolId="job-photo-signature-resizer"
                className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            <h3 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
              চাকরির ছবি ও স্বাক্ষর সাইজার (Job Photo &amp; Signature Resizer)
            </h3>
          </a>

          {/* Sub-Tool 6: MoSaFa AI Photo Status & Frame Studio (Opens original canonical URL /tools/poster-studio) */}
          <a
            href="/tools/poster-studio"
            onClick={(e) => {
              if (onOpenStandaloneTool) {
                e.preventDefault();
                onOpenStandaloneTool('poster-studio');
              }
            }}
            className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 p-5 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center group cursor-pointer no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="mb-3.5 flex items-center justify-center">
              <ToolVisualLogo
                toolId="poster-studio"
                className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            <h3 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
              MoSaFa AI Photo Status &amp; Frame Studio
            </h3>
          </a>
        </div>
      </div>
    </div>
  );
};
