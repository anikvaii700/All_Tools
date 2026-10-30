import React, { useState } from 'react';
import {
  Search,
  ShieldAlert,
  Landmark,
  GraduationCap,
  Briefcase,
  Home,
  CreditCard,
  Zap,
  Users,
  Building2,
  FileCheck,
  PenTool,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { CATEGORIES, DOCUMENT_TYPES } from './categoriesData';
import { CategoryId, DocumentTypeInfo } from './types';

interface DocumentTypeSelectorProps {
  selectedTypeId: string;
  onSelectType: (type: DocumentTypeInfo) => void;
}

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  selectedTypeId,
  onSelectType,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all' | 'popular'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Icon mapping
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert':
        return <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />;
      case 'Landmark':
        return <Landmark className="w-3.5 h-3.5 text-emerald-600" />;
      case 'GraduationCap':
        return <GraduationCap className="w-3.5 h-3.5 text-sky-600" />;
      case 'Briefcase':
        return <Briefcase className="w-3.5 h-3.5 text-purple-600" />;
      case 'Home':
        return <Home className="w-3.5 h-3.5 text-amber-600" />;
      case 'CreditCard':
        return <CreditCard className="w-3.5 h-3.5 text-cyan-600" />;
      case 'Zap':
        return <Zap className="w-3.5 h-3.5 text-yellow-600" />;
      case 'Users':
        return <Users className="w-3.5 h-3.5 text-rose-600" />;
      case 'Building2':
        return <Building2 className="w-3.5 h-3.5 text-slate-700" />;
      case 'FileCheck':
        return <FileCheck className="w-3.5 h-3.5 text-violet-600" />;
      case 'PenTool':
        return <PenTool className="w-3.5 h-3.5 text-slate-800" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-indigo-600" />;
    }
  };

  const toBnNum = (n: number | string) =>
    n.toString().replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]);

  // Convert Bengali numerals in search query to English for serial matching
  const normalizedQuery = searchQuery
    .trim()
    .toLowerCase()
    .replace(/[০-৯]/g, (d) => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]);

  // Filter types
  const filteredTypes = DOCUMENT_TYPES.filter((doc) => {
    // Category or Popular filter
    if (activeCategory === 'popular') {
      if (!doc.isPopular) return false;
    } else if (activeCategory !== 'all') {
      if (doc.categoryId !== activeCategory) return false;
    }

    if (!searchQuery.trim()) return true;

    // Search matching
    const q = searchQuery.trim().toLowerCase();
    const matchesSerial = doc.serialNo && (doc.serialNo.toString() === normalizedQuery || toBnNum(doc.serialNo) === q);
    const matchesName = doc.name.toLowerCase().includes(q);
    const matchesNameEn = doc.nameEn.toLowerCase().includes(q);
    const matchesDesc = doc.description.toLowerCase().includes(q);
    const matchesSubject = doc.defaultSubjectBn.toLowerCase().includes(q);

    return matchesSerial || matchesName || matchesNameEn || matchesDesc || matchesSubject;
  });

  const popularCount = DOCUMENT_TYPES.filter((t) => t.isPopular).length;

  return (
    <div className="space-y-6">
      {/* Header and Search Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
            <span>ডকুমেন্টের ধরন ও ক্যাটাগরি বেছে নিন</span>
            <span className="text-xs bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full font-bold">
              মোট ১৫০টি প্রমিত আবেদন
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            থানা জিডি, ইউপি/পৌরসভা সনদ, স্কুল-কলেজ, অফিস, ব্যাংক ও ভূমিসহ সকল দরখাস্ত এক ক্লিকে প্রস্তুত করুন।
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px] sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ক্রমিক নং (১-১৫০) বা নাম দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-rose-500 text-slate-800 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* All Tab */}
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>সকল দরখাস্ত</span>
          <span className="text-[10px] opacity-75">({DOCUMENT_TYPES.length})</span>
        </button>

        {/* Popular Top 20 Tab */}
        <button
          type="button"
          onClick={() => setActiveCategory('popular')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeCategory === 'popular'
              ? 'bg-rose-600 text-white shadow-xs shadow-rose-200'
              : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>জনপ্রিয় ২০টি</span>
          <span className="text-[10px] opacity-80">({popularCount})</span>
        </button>

        {/* 10 Clean Categories + Custom */}
        {CATEGORIES.map((cat) => {
          const count = DOCUMENT_TYPES.filter((t) => t.categoryId === cat.id).length;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs shadow-rose-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              {getCategoryIcon(cat.iconName)}
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Types Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTypes.map((type) => {
          const isSelected = selectedTypeId === type.id;
          const isGd = type.documentFormat === 'gd' || type.id.startsWith('gd-');
          const isComplaint = type.documentFormat === 'police_complaint';

          return (
            <div
              key={type.id}
              onClick={() => onSelectType(type)}
              className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'border-rose-500 bg-rose-50/60 shadow-md ring-2 ring-rose-300'
                  : 'border-slate-200 bg-white hover:border-rose-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {/* Serial Number Badge */}
                    {type.serialNo ? (
                      <span className="w-8 h-8 shrink-0 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs shadow-2xs group-hover:bg-rose-600 transition">
                        #{toBnNum(type.serialNo)}
                      </span>
                    ) : (
                      <div className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-rose-100 transition">
                        <PenTool className="w-4 h-4 text-slate-700 group-hover:text-rose-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition leading-snug">
                        {type.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">{type.nameEn}</p>
                    </div>
                  </div>

                  {/* Format / Popular Badge */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {type.isPopular && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap">
                        ★ সেরা
                      </span>
                    )}
                    {isGd ? (
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap">
                        জিডি
                      </span>
                    ) : isComplaint ? (
                      <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap">
                        অভিযোগ
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {type.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">
                  প্রাপক: {type.defaultRecipientDesignationBn}
                </span>
                <span className="text-rose-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition shrink-0">
                  <span>দরখাস্ত লিখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-sm text-slate-600">
            "{searchQuery}" এর সাথে কোনো আবেদনপত্র মেলেনি।
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
          >
            সকল ১৫টি ক্যাটাগরি ও ১৫০টি আবেদন দেখুন
          </button>
        </div>
      )}
    </div>
  );
};
