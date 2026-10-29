import React, { useState } from 'react';
import {
  Search,
  GraduationCap,
  Briefcase,
  Landmark,
  AlertCircle,
  Building2,
  PenTool,
  ArrowRight,
  CheckCircle2,
  Sparkles,
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
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Icon mapping
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'Landmark':
        return <Landmark className="w-4 h-4 text-amber-600" />;
      case 'AlertCircle':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'PenTool':
        return <PenTool className="w-4 h-4 text-slate-700" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
    }
  };

  // Filter types
  const filteredTypes = DOCUMENT_TYPES.filter((doc) => {
    const matchesCategory = activeCategory === 'all' || doc.categoryId === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      doc.name.toLowerCase().includes(q) ||
      doc.nameEn.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q) ||
      doc.defaultSubjectBn.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>ডকুমেন্টের ধরন ও ক্যাটাগরি বেছে নিন</span>
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
              {DOCUMENT_TYPES.length}টি তৈরি টেমপ্লেট
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            আপনার প্রয়োজনীয় দরখাস্ত নির্বাচন করুন, স্বয়ংক্রিয়ভাবে উপযোগী ইনপুট ফরম ও বয়ান প্রস্তুত হবে।
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="দরখাস্ত খুঁজুন (যেমন: ছুটি, চাকরি, NID...)"
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-rose-500 text-slate-800 shadow-2xs"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>সকল দরখাস্ত</span>
          <span className="text-[10px] opacity-75">({DOCUMENT_TYPES.length})</span>
        </button>

        {CATEGORIES.map((cat) => {
          const count = DOCUMENT_TYPES.filter((t) => t.categoryId === cat.id).length;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
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
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-rose-100 transition">
                      <PenTool className="w-4 h-4 text-slate-700 group-hover:text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition">
                        {type.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">{type.nameEn}</p>
                    </div>
                  </div>

                  {type.badge && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                      {type.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mt-2">
                  {type.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="font-semibold text-slate-700">ডিফল্ট বিষয়:</span>
                  <span className="truncate">{type.defaultSubjectBn}</span>
                </div>
              </div>

              <div className="mt-3.5 pt-2 flex items-center justify-between text-xs">
                {isSelected ? (
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-rose-600" />
                    <span>নির্বাচিত হয়েছে</span>
                  </span>
                ) : (
                  <span className="text-slate-400 group-hover:text-rose-600 font-medium flex items-center gap-1 transition">
                    <span>তৈরি করুন</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </span>
                )}
                <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                  {type.fields.length}টি তথ্য
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTypes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">কোনো দরখাস্ত পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400 mt-1">
            ভিন্ন কীওয়ার্ড দিয়ে খুঁজুন অথবা ‘কাস্টম আবেদন’ অপশনটি ব্যবহার করুন।
          </p>
        </div>
      )}
    </div>
  );
};
