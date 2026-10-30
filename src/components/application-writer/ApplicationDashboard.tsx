import React from 'react';
import {
  FileText,
  Sparkles,
  GraduationCap,
  Briefcase,
  Landmark,
  ShieldAlert,
  Home,
  CreditCard,
  Zap,
  Users,
  Building2,
  FileCheck,
  FolderArchive,
  Download,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Flame,
  PenTool,
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
  // Top popular picks from all 150
  const popularPicks = DOCUMENT_TYPES.filter((t) => t.isPopular).slice(0, 12);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-white" />;
      case 'Landmark':
        return <Landmark className="w-5 h-5 text-white" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-white" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-white" />;
      case 'Home':
        return <Home className="w-5 h-5 text-white" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-white" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-white" />;
      case 'Users':
        return <Users className="w-5 h-5 text-white" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-white" />;
      case 'FileCheck':
        return <FileCheck className="w-5 h-5 text-white" />;
      case 'PenTool':
        return <PenTool className="w-5 h-5 text-white" />;
      default:
        return <Sparkles className="w-5 h-5 text-white" />;
    }
  };

  const toBnNum = (n: number | string) =>
    n.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-rose-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>মোট ১৫০টি প্রমিত আবেদনপত্র ও দরখাস্তের সম্পূর্ণ ভাণ্ডার</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            স্বাগতম MoSaFa Application Writer-এ!
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            থানার সাধারণ ডায়েরি (জিডি), লিখিত অভিযোগ, ইউপি ও পৌরসভার সনদপত্র, স্কুল-কলেজের ছুটির দরখাস্ত,
            চাকরির কভার লেটার ও রিজাইন, জমি-জমার নামজারি এবং ব্যাংকিং আবেদনপত্র—সবকিছু এখন প্রস্তুত স্বয়ংক্রিয়ভাবে।
          </p>

          {/* 4 Main Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartNewApplication}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>সকল ১৫০টি আবেদন দেখুন</span>
            </button>

            <button
              type="button"
              onClick={onStartOfficialLetter}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>অফিসিয়াল দরখাস্ত তৈরি</span>
            </button>

            <button
              type="button"
              onClick={onViewTemplates}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>লেআউট টেমপ্লেট (৮টি)</span>
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
              <span>জিডি ও অভিযোগের স্বতন্ত্র সরকারি পুলিশি প্রমিত ফরম্যাট</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PDF, Word (.docx) ডাউনলোড ও সরাসরি প্রিন্ট</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>বাংলা ইউনিকোড ও A4 পেজ স্কেলিং</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Starter Application Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 fill-current" />
              <span>সবচেয়ে বেশি ব্যবহৃত দরকারি আবেদনসমূহ (জনপ্রিয়)</span>
            </h2>
            <p className="text-xs text-slate-500">
              যেকোনো কার্ডে ক্লিক করে সরাসরি তথ্য পূরণ শুরু করুন।
            </p>
          </div>
          <button
            type="button"
            onClick={onStartNewApplication}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>সবগুলো দেখুন (১৫০)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
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
                  <div className="flex items-center gap-1.5">
                    {pick.serialNo && (
                      <span className="text-[10px] font-extrabold text-white bg-slate-900 px-1.5 py-0.5 rounded">
                        #{toBnNum(pick.serialNo)}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                      {pick.badge || 'জনপ্রিয়'}
                    </span>
                  </div>
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
                <span className="text-slate-400 text-[11px] truncate max-w-[170px]">
                  প্রাপক: {pick.defaultRecipientDesignationBn}
                </span>
                <span className="text-rose-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition shrink-0">
                  <span>লিখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10 Major Categories */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          ক্যাটাগরি অনুযায়ী দরখাস্ত বেছে নিন (১০টি প্রধান বিভাগ)
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
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                        {cat.serialRange}
                      </span>
                    </div>
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
            <h4 className="text-xs font-bold text-slate-900">স্বয়ংক্রিয় প্রমিত বয়ান</h4>
            <p className="text-[11px] text-slate-500">
              প্রতিটি আবেদনের জন্য যথাযথ আইনি ও প্রাতিষ্ঠানিক প্রমিত বয়ান
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
