import React from 'react';
import {
  FileText,
  Calendar,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  PenTool,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { ApplicationFormData, DocumentTypeInfo, Language, Tone } from './types';

interface ApplicationFormProps {
  typeInfo: DocumentTypeInfo;
  formData: ApplicationFormData;
  onChangeField: (key: keyof ApplicationFormData, value: any) => void;
  onGenerate: () => void;
  onReset: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  typeInfo,
  formData,
  onChangeField,
  onGenerate,
  onReset,
}) => {
  const tones: { label: string; value: Tone; desc: string }[] = [
    { label: 'ফরমাল (Formal)', value: 'Formal', desc: 'প্রমিত অফিসিয়াল রীতি' },
    { label: 'অতি উচ্চ মার্জিত (Highly Formal)', value: 'Highly Formal', desc: 'সরকারি ও উচ্চপদস্থ ব্যক্তিবর্গের জন্য' },
    { label: 'সহজ ও প্রফেশনাল (Simple)', value: 'Simple and Professional', desc: 'সাবলীল ও স্পষ্ট' },
    { label: 'সম্মানজনক (Respectful)', value: 'Respectful', desc: 'বিনীত ও অনুরোধমূলক' },
    { label: 'সংক্ষিপ্ত (Concise)', value: 'Concise', desc: 'টু-দ্য-পয়েন্ট ও দ্রুত পাঠযোগ্য' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-6">
      {/* Header & Language/Tone Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            {typeInfo.name}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            দরখাস্তের প্রয়োজনীয় তথ্যসমূহ পূরণ করুন
          </h2>
          <p className="text-xs text-slate-500">
            নিচের ঘরগুলোতে তথ্য দিন। ফাঁকা রাখলে স্বয়ংক্রিয় প্রমিত প্লেসহোল্ডার যুক্ত হবে।
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onChangeField('language', 'bn')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              formData.language === 'bn'
                ? 'bg-white text-rose-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇧🇩 বাংলা দরখাস্ত
          </button>
          <button
            type="button"
            onClick={() => onChangeField('language', 'en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              formData.language === 'en'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇬🇧 English Letter
          </button>
        </div>
      </div>

      {/* Tone Picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span>লেখার বাচনভঙ্গি ও টোন (Writing Tone):</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {tones.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChangeField('tone', t.value)}
              className={`p-2 rounded-xl text-left border transition text-xs cursor-pointer ${
                formData.tone === t.value
                  ? 'border-rose-500 bg-rose-50/70 text-rose-800 font-bold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="truncate">{t.label}</div>
              <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                {t.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>তারিখ (Date):</span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => onChangeField('date', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
          />
        </div>

        {/* Recipient Designation */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>প্রাপকের পদবি (Recipient Designation): *</span>
          </label>
          <input
            type="text"
            value={formData.recipientDesignation}
            onChange={(e) => onChangeField('recipientDesignation', e.target.value)}
            placeholder={
              formData.language === 'bn'
                ? typeInfo.defaultRecipientDesignationBn
                : typeInfo.defaultRecipientDesignationEn
            }
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
          />
        </div>

        {/* Organization Name */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>প্রতিষ্ঠান বা দপ্তরের নাম (Organization): *</span>
          </label>
          <input
            type="text"
            value={formData.organizationName}
            onChange={(e) => onChangeField('organizationName', e.target.value)}
            placeholder="যেমন: মতিঝিল সরকারি বালক উচ্চ বিদ্যালয় / সিটি ব্যাংক লিমিটেড"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
          />
        </div>

        {/* Organization Address */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>প্রতিষ্ঠানের ঠিকানা / শাখা (Address):</span>
          </label>
          <input
            type="text"
            value={formData.organizationAddress}
            onChange={(e) => onChangeField('organizationAddress', e.target.value)}
            placeholder="যেমন: মতিঝিল, ঢাকা-১০০০"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
          />
        </div>

        {/* Subject */}
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>দরখাস্তের বিষয় (Subject): *</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => onChangeField('subject', e.target.value)}
            placeholder={
              formData.language === 'bn' ? typeInfo.defaultSubjectBn : typeInfo.defaultSubjectEn
            }
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800 font-medium"
          />
        </div>

        {/* Applicant Name */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>আবেদনকারীর নাম (Applicant Name): *</span>
          </label>
          <input
            type="text"
            value={formData.applicantName}
            onChange={(e) => onChangeField('applicantName', e.target.value)}
            placeholder="যেমন: মাহিনুর ইসলাম / মো: আরিফুল ইসলাম"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
          />
        </div>

        {/* Applicant Designation / Class */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
            <PenTool className="w-3.5 h-3.5 text-slate-500" />
            <span>পদবি / শ্রেণি ও রোল (Designation / Class):</span>
          </label>
          <input
            type="text"
            value={formData.applicantDesignation}
            onChange={(e) => onChangeField('applicantDesignation', e.target.value)}
            placeholder="যেমন: দশম শ্রেণি, রোল: ০৫ অথবা সিনিয়র অফিসার"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
          />
        </div>

        {/* Dates (Leave start and end) if applicable */}
        {typeInfo.fields.some((f) => f.key === 'startDate') && (
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>কার্যকর / শুরুর তারিখ (Start Date):</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => onChangeField('startDate', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
            />
          </div>
        )}

        {typeInfo.fields.some((f) => f.key === 'endDate') && (
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>সমাপ্তির তারিখ (End Date):</span>
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => onChangeField('endDate', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
            />
          </div>
        )}

        {/* Education & Experience for Job Applications */}
        {typeInfo.id === 'job-application-cover' && (
          <>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                সর্বোচ্চ শিক্ষাগত যোগ্যতা:
              </label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => onChangeField('education', e.target.value)}
                placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয় হতে ফিন্যান্সে এমবিএ (সিজিপিএ ৩.৮৫)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                পূর্ব অভিজ্ঞতা ও স্কিলস:
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => onChangeField('experience', e.target.value)}
                placeholder="যেমন: ৩ বছরের সফল কর্মাভিজ্ঞতা ও টিম লিডারশিপ"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
              />
            </div>
          </>
        )}

        {/* Contact Info */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>মোবাইল নম্বর (ঐচ্ছিক):</span>
          </label>
          <input
            type="text"
            value={formData.applicantPhone}
            onChange={(e) => onChangeField('applicantPhone', e.target.value)}
            placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>ইমেইল / ঠিকানা (ঐচ্ছিক):</span>
          </label>
          <input
            type="text"
            value={formData.applicantEmail || formData.applicantAddress}
            onChange={(e) => onChangeField('applicantAddress', e.target.value)}
            placeholder="যেমন: মিরপুর-১০, ঢাকা"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800"
          />
        </div>

        {/* Reason / Purpose Textarea */}
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-700 block mb-1">
            আবেদন বা ছুটির সুনির্দিষ্ট কারণ / মূল বিবরণ: *
          </label>
          <textarea
            rows={3}
            value={formData.reason}
            onChange={(e) => onChangeField('reason', e.target.value)}
            placeholder={
              typeInfo.defaultReasonBn ||
              'আপনার পরিস্থিতি, অসুস্থতা, সমস্যা বা সুনির্দিষ্ট অনুরোধটি সংক্ষেপে লিখুন...'
            }
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500 text-slate-800 resize-y"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>রিসেট করুন</span>
        </button>

        <button
          type="button"
          onClick={onGenerate}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 hover:opacity-95 transition flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>📄 দরখাস্ত তৈরি করুন (Generate Application)</span>
        </button>
      </div>
    </div>
  );
};
