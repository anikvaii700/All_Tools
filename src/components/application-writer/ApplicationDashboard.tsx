import React from 'react';
import {
  FileText,
  Sparkles,
  GraduationCap,
  Briefcase,
  Landmark,
  AlertCircle,
  Building2,
  FolderArchive,
  Download,
  Printer,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { CATEGORIES, DOCUMENT_TYPES } from './categoriesData';
import { CategoryId, DocumentTypeInfo } from './types';

interface ApplicationDashboardProps {
  onStartNewApplication: () => void;
  onStartOfficialLetter: () => void;
  onViewTemplates: () => void;
  onOpenSavedDocs: () => void;
  onSelectCategory: (catId: CategoryId) => void;
  onSelectSpecificType: (type: DocumentTypeInfo) => void;
  savedCount: number;
}

export const ApplicationDashboard: React.FC<ApplicationDashboardProps> = ({
  onStartNewApplication,
  onStartOfficialLetter,
  onViewTemplates,
  onOpenSavedDocs,
  onSelectCategory,
  onSelectSpecificType,
  savedCount,
}) => {
  // Popular quick starter picks
  const popularPicks = DOCUMENT_TYPES.filter((t) =>
    ['school-leave', 'office-casual-leave', 'job-application-cover', 'birth-cert-correction', 'resignation-letter', 'road-drain-repair'].includes(
      t.id
    )
  );

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-rose-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>১০০% ফ্রি ও ক্লায়েন্ট-সাইড প্রফেশনাল ডকুমেন্ট জেনারেটর</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            স্বাগতম MoSaFa Application Writer-এ!
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            আপনার প্রয়োজন অনুযায়ী কয়েকটি তথ্য দিন, আর তৈরি করুন সুন্দর ও প্রফেশনাল দরখাস্ত বা অফিসিয়াল চিঠি।
            স্কুল-কলেজ, অফিস, সরকারি দপ্তর, অভিযোগ ও ব্যবসার সব ফরম্যাট এক ছাতার নিচে।
          </p>

          {/* 4 Main Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartNewApplication}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>নতুন দরখাস্ত তৈরি করুন</span>
            </button>

            <button
              type="button"
              onClick={onStartOfficialLetter}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>অফিসিয়াল চিঠি তৈরি করুন</span>
            </button>

            <button
              type="button"
              onClick={onViewTemplates}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>টেমপ্লেট দেখুন</span>
            </button>

            <button
              type="button"
              onClick={onOpenSavedDocs}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <FolderArchive className="w-4 h-4 text-cyan-300" />
              <span>সংরক্ষিত ডকুমেন্ট ({savedCount})</span>
            </button>
          </div>

          {/* Feature highlights pills */}
          <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>কোনো লগইন বা রেজিস্ট্রেশন প্রয়োজন নেই</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PDF, Word (.docx) ও ডাইরেক্ট প্রিন্ট</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>নিখুঁত বাংলা ইউনিকোড ও A4 পেজ লেআউট</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Starter Application Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>সবচেয়ে বেশি ব্যবহৃত দরকারি আবেদনসমূহ</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                দ্রুত শুরু
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              যেকোনো কার্ডে ক্লিক করে সরাসরি তথ্য পূরণ শুরু করুন।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {popularPicks.map((pick) => (
            <div
              key={pick.id}
              onClick={() => onSelectSpecificType(pick)}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-rose-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                    {pick.badge || 'জনপ্রিয়'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{pick.nameEn}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition">
                  {pick.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {pick.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">প্রমিত ফরম্যাট</span>
                <span className="text-rose-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>লিখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6 Category Portals */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          ক্যাটাগরি অনুযায়ী দরখাস্ত বেছে নিন
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const count = DOCUMENT_TYPES.filter((t) => t.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${cat.accentColor} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition`}
                    >
                      {cat.id === 'education' && <GraduationCap className="w-5 h-5" />}
                      {cat.id === 'office' && <Briefcase className="w-5 h-5" />}
                      {cat.id === 'government' && <Landmark className="w-5 h-5" />}
                      {cat.id === 'complaint' && <AlertCircle className="w-5 h-5" />}
                      {cat.id === 'business' && <Building2 className="w-5 h-5" />}
                      {cat.id === 'custom' && <Sparkles className="w-5 h-5" />}
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>{count}টি আবেদনপত্র দেখুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature capabilities footer banner */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">PDF ও Word (.docx) এক্সপোর্ট</h4>
            <p className="text-[11px] text-slate-500">
              সরাসরি প্রিন্ট বা ওয়ার্ড ফাইলে এডিট করার সম্পূর্ণ স্বাধীনতা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">ঐচ্ছিক AI পরিমার্জন</h4>
            <p className="text-[11px] text-slate-500">
              ভাষা উন্নতকরণ, বানান সংশোধন ও ইংরেজি অনুবাদ সুবিধা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">গোপনীয়তার শতভাগ নিশ্চয়তা</h4>
            <p className="text-[11px] text-slate-500">
              আপনার কোনো ব্যক্তিগত তথ্য বা চিঠি সার্ভারে সংরক্ষিত হয় না
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
