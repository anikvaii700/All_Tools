import React from 'react';
import { Layout, Check, Sparkles } from 'lucide-react';
import { TemplateId } from './types';

export interface TemplateCardInfo {
  id: TemplateId;
  name: string;
  nameEn: string;
  badge: string;
  description: string;
  stylePreview: string;
}

export const TEMPLATES: TemplateCardInfo[] = [
  {
    id: 'traditional-bn',
    name: 'ঐতিহ্যবাহী বাংলা দরখাস্ত',
    nameEn: 'Traditional Bengali Application',
    badge: 'ক্ল্যাসিক',
    description: 'বরাবর, বিষয়, জনাব ও অতএব মহোদয়ের নিকট বিনীত প্রার্থনা সম্বলিত প্রমিত ঐতিহ্যবাহী রূপ।',
    stylePreview: 'border-l-4 border-slate-700 pl-2',
  },
  {
    id: 'modern-bn',
    name: 'আধুনিক বাংলা আবেদন',
    nameEn: 'Modern Bengali Document',
    badge: 'স্মার্ট',
    description: 'পরিচ্ছন্ন টপ বার, আধুনিক স্পেসিং ও কর্পোরেট টাইপোগ্রাফির ছোঁয়ায় সমৃদ্ধ অফিসিয়াল লুক।',
    stylePreview: 'border-t-2 border-slate-800 pt-1',
  },
  {
    id: 'english-official',
    name: 'English Official Letter',
    nameEn: 'Formal UK/International Letter',
    badge: 'International',
    description: 'Formal letterhead, To block, subject line, Dear Sir/Madam and professional sign-off.',
    stylePreview: 'border-b-2 border-slate-700 pb-1',
  },
  {
    id: 'school-college',
    name: 'শিক্ষা প্রতিষ্ঠান দরখাস্ত',
    nameEn: 'School / College Application',
    badge: 'অ্যাকাডেমিক',
    description: 'শিক্ষার্থী রোল, শ্রেণি, অভিভাবকের স্বাক্ষর ও প্রধান শিক্ষকের অনুমোদনের বিশেষ ট্রিপল সাইন ব্লক।',
    stylePreview: 'border-l-4 border-indigo-500 pl-2',
  },
  {
    id: 'office-leave',
    name: 'কর্পোরেট ছুটির আবেদন',
    nameEn: 'Corporate Leave Application',
    badge: 'এইচআর ফরম্যাট',
    description: 'কর্মকর্তার পদবি, বিভাগ, ছুটির মেয়াদ ও বিভাগীয় প্রধানের সুপারিশ ব্লক সমন্বিত।',
    stylePreview: 'border-l-4 border-emerald-500 pl-2',
  },
  {
    id: 'complaint-letter',
    name: 'নাগরিক অভিযোগপত্র',
    nameEn: 'Official Complaint Letter',
    badge: 'প্রতিকার',
    description: 'লালচে অফিসিয়াল সতর্কবার্তা বার, অভিযোগের সূত্র ও তদন্তের সুস্পষ্ট আবেদনের কাঠামো।',
    stylePreview: 'border-t-2 border-rose-500 pt-1',
  },
  {
    id: 'job-application',
    name: 'চাকরির আবেদন ও কভার লেটার',
    nameEn: 'Job Application & Cover Letter',
    badge: 'ক্যারিয়ার',
    description: 'শিক্ষাগত যোগ্যতা, অভিজ্ঞতা, স্কিলস সারসংক্ষেপ ও সংযুক্ত জীবনবৃত্তান্তের তালিকা ব্লক।',
    stylePreview: 'border-l-4 border-slate-500 pl-2',
  },
  {
    id: 'minimal-clean',
    name: 'সাদামাটা পরিচ্ছন্ন লেটার',
    nameEn: 'Minimal Clean Format',
    badge: 'সিম্পল',
    description: 'কোনো বাড়তি অলঙ্করণ ছাড়া সর্বোচ্চ পরিচ্ছন্ন ও আন্তর্জাতিক প্রিন্ট-বান্ধব সাধারণ লেআউট।',
    stylePreview: 'border border-dashed border-slate-300 p-1',
  },
];

interface TemplateSelectorProps {
  selectedTemplateId: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  onSelectTemplate,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-rose-600" />
            <span>৮টি প্রফেশনাল পেজ ডিজাইন টেমপ্লেট</span>
          </h3>
          <p className="text-xs text-slate-500">
            টেমপ্লেট পরিবর্তন করলে আপনার লেখা ড্রাফট মুছে যাবে না।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplateId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-200 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                    {tmpl.badge}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs">
                      <Check className="w-3 h-3 stroke-3" />
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition">
                  {tmpl.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium mb-1.5">{tmpl.nameEn}</p>
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className={`text-[10px] text-slate-400 ${tmpl.stylePreview}`}>
                  লেআউট স্টাইল
                </span>
                <span className="text-rose-600 font-bold text-[10px]">
                  {isSelected ? 'সক্রিয়' : 'নির্বাচন করুন'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
