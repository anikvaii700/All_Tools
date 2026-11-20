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
import { SubToolVisualLogo } from '../SubToolVisualLogo';

const APP_CATEGORY_LOGO_MAP: Record<string, string> = {
  police: 'passport-police',
  municipal: 'gov-central',
  education: 'form-education',
  office: 'form-job',
  land: 'land-mutation',
  bank: 'banking-mfs',
  utility: 'utility-bills',
  personal: 'nid-birth',
  business: 'form-business',
  other: 'form-certificate',
  custom: 'form-custom',
};

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {popularPicks.map((pick) => (
            <button
              key={pick.id}
              type="button"
              onClick={() => onSelectSpecificType(pick)}
              className="group cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-rose-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <div className="mb-3 flex items-center justify-center">
                <SubToolVisualLogo
                  logoId={APP_CATEGORY_LOGO_MAP[pick.categoryId] || 'form-custom'}
                  className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors leading-snug line-clamp-2">
                {pick.name}
              </h3>
            </button>
          ))}
        </div>
      </div>

      {/* 11 Major Categories — Large Visual Logo Tiles */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          ক্যাটাগরি অনুযায়ী দরখাস্ত বেছে নিন
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className="group cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="mb-3 flex items-center justify-center">
                <SubToolVisualLogo
                  logoId={APP_CATEGORY_LOGO_MAP[cat.id] || 'form-custom'}
                  className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <h3 className="text-xs sm:text-sm md:text-[15px] font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                {cat.name}
              </h3>
            </button>
          ))}
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
