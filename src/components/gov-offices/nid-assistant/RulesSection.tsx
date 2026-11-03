// Official Rules and Regulatory Framework of Bangladesh Election Commission
import React from 'react';
import { Shield, BookOpen, AlertOctagon, Scale, Award, HelpCircle } from 'lucide-react';

export const RulesSection: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8">
        <span className="px-3 py-1 rounded-md bg-white/10 text-rose-300 text-xs font-mono font-bold">
          আইন ও বিধিমালা
        </span>
        <h2 className="text-xl sm:text-2xl font-bold mt-2 text-white">
          জাতীয় পরিচয়পত্র সংশোধন নীতিমালা ও ক্যাটাগরি বিধিমালা
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          জাতীয় পরিচয় নিবন্ধন আইন ২০১০ এবং ভোটার তালিকা আইন ২০০৯ অনুযায়ী নির্বাচন কমিশন চার স্তরের
          ক্ষমতাপ্রাপ্ত কর্মকর্তার মাধ্যমে আবেদনসমূহ নিষ্পত্তি করে থাকে।
        </p>
      </div>

      {/* The 4 Regulatory Categories ('ক', 'খ', 'গ', 'ঘ') */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Category 'ক' */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 font-bold font-mono text-base flex items-center justify-center">
                ক
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                উপজেলা / থানা পর্যায়
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              "ক" ক্যাটাগরি (সাধারণ সংশোধন)
            </h3>
            <span className="text-xs text-indigo-700 font-semibold block mt-1">
              নিষ্পত্তিকারী: উপজেলা বা থানা নির্বাচন কর্মকর্তা
            </span>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              নিজের নামের সাধারণ বানান ভুল, পিতা/মাতার নামের সাধারণ সংশোধন, বৈবাহিক তথ্য হালনাগাদ, রক্তের
              গ্রুপ, জন্মস্থান (জেলা) এবং বর্তমান ঠিকানার পরিবর্তন এই ক্যাটাগরিতে পড়ে।
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            গড় নিষ্পত্তি সময়: ৭ থেকে ১৫ কার্যদিবস
          </div>
        </div>

        {/* Category 'খ' */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 font-bold font-mono text-base flex items-center justify-center">
                খ
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                জেলা পর্যায়
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              "খ" ক্যাটাগরি (মধ্যম মাত্রার সংশোধন)
            </h3>
            <span className="text-xs text-indigo-700 font-semibold block mt-1">
              নিষ্পত্তিকারী: সিনিয়র জেলা নির্বাচন অফিসার / জেলা নির্বাচন অফিসার
            </span>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              নামের আংশিক পদবী/উপাধি যোগ বা বিয়োগ, পিতা বা মাতার নামের উল্লেখযোগ্য পরিবর্তন, শিক্ষাগত সনদ
              বিহীন ব্যক্তিদের জন্মতারিখ সীমিত সংশোধন।
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            গড় নিষ্পত্তি সময়: ১৫ থেকে ৩০ কার্যদিবস
          </div>
        </div>

        {/* Category 'গ' */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 font-bold font-mono text-base flex items-center justify-center">
                গ
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                আঞ্চলিক পর্যায় (বিভাগ)
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              "গ" ক্যাটাগরি (জটিল ও স্পর্শকাতর সংশোধন)
            </h3>
            <span className="text-xs text-indigo-700 font-semibold block mt-1">
              নিষ্পত্তিকারী: আঞ্চলিক নির্বাচন কর্মকর্তা (Regional Election Officer)
            </span>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              জন্মতারিখ বা বয়সের সংশোধন (এসএসসি মূল সনদ সাপেক্ষে), ভাই-বোনের বয়সের অসঙ্গতি নিষ্পত্তি, এবং
              সম্পূর্ণ নাম পরিবর্তনের প্রাথমিক তদন্ত ও শুনানি।
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            গড় নিষ্পত্তি সময়: ৩০ থেকে ৬০ কার্যদিবস (শুনানি প্রযোজ্য)
          </div>
        </div>

        {/* Category 'ঘ' */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-800 font-bold font-mono text-base flex items-center justify-center">
                ঘ
              </span>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                কমিশন সচিবালয় / ডিজি পর্যায়
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              "ঘ" ক্যাটাগরি (বিশেষ ও নীতিগত বিষয়)
            </h3>
            <span className="text-xs text-indigo-700 font-semibold block mt-1">
              নিষ্পত্তিকারী: মহাপরিচালক (DG), জাতীয় পরিচয় নিবন্ধন অনুবিভাগ
            </span>
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              সম্পূর্ণ নাম পরিবর্তন (গেজেট বিজ্ঞপ্তিসহ), বয়সের বড় ব্যবধান (৫ বছরের অধিক), এবং পূর্ববর্তী
              আবেদনে নামঞ্জুরকৃত কোনো সিদ্ধান্তের বিরুদ্ধে আপিল।
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            গড় নিষ্পত্তি সময়: ৬০ থেকে ৯০ কার্যদিবস
          </div>
        </div>
      </div>

      {/* Statutory Penalties Under Law */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-7 text-rose-950">
        <div className="flex items-center gap-2 font-bold text-base text-rose-900 mb-2">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
          <span>জাতীয় পরিচয় নিবন্ধন আইন ২০১০ এর গুরুত্বপূর্ণ আইনি ধারা</span>
        </div>
        <p className="text-xs sm:text-sm text-rose-900 leading-relaxed mb-3">
          জাতীয় পরিচয়পত্রে ইচ্ছাকৃতভাবে অসত্য বা জাল তথ্য প্রদান একটি আমলযোগ্য অপরাধ। আইনে বর্ণিত
          শাস্তি নিম্নরূপ:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-rose-200">
            <span className="font-bold text-rose-800 block mb-0.5">ধারা ১৪ (মিথ্যা তথ্য প্রদান):</span>
            <span>অনধিক ৩ বছরের কারাদণ্ড অথবা অনধিক ২০,০০০ টাকা জরিমানা বা উভয় দণ্ড।</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-rose-200">
            <span className="font-bold text-rose-800 block mb-0.5">ধারা ১৫ (নকল বা জাল কার্ড তৈরি):</span>
            <span>অনধিক ৭ বছরের কারাদণ্ড অথবা অনধিক ৫০,০০০ টাকা অর্থদণ্ড।</span>
          </div>
        </div>
      </div>
    </div>
  );
};
