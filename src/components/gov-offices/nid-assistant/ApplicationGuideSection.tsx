// Application Guide Section for services.nidw.gov.bd
import React from 'react';
import { ExternalLink, Smartphone, CheckCircle2, Phone, HelpCircle, Download } from 'lucide-react';

export const ApplicationGuideSection: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Guide */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8">
        <span className="px-3 py-1 rounded-md bg-white/10 text-emerald-300 text-xs font-mono font-bold">
          অনলাইন প্রসেস গাইড
        </span>
        <h2 className="text-xl sm:text-2xl font-bold mt-2 text-white">
          services.nidw.gov.bd পোর্টালে অনলাইন আবেদনের পূর্ণাঙ্গ ধাপসমূহ
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          ঘরে বসেই কম্পিউটার অথবা স্মার্টফোন থেকে নির্বাচন কমিশনের অফিসিয়াল সার্ভারে আবেদন করুন। নিচে
          সহজে বুঝে নেওয়ার জন্য স্ক্রিনশট-অনুরূপ নির্দেশনা দেওয়া হলো।
        </p>
      </div>

      {/* 5 Core Steps Workflow */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-2.5">
              ০১
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">রেজিস্ট্রেশন ও লগইন</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              nidw পোর্টালে আপনার NID নম্বর ও জন্মতারিখ দিন। বর্তমান ও স্থায়ী ঠিকানা নির্বাচন করুন।
            </p>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold mt-3 block">ধাপ ১</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-2.5">
              ০২
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">ফেস ভেরিফিকেশন</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              মোবাইলে "NID Wallet" অ্যাপ খুলে প্রদর্শিত QR কোড স্ক্যান করে ৩ ধাপে মুখমণ্ডল স্ক্যান করুন।
            </p>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold mt-3 block">ধাপ ২</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-2.5">
              ০৩
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">ফি পরিশোধ</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              বিকাশ বা রকেট থেকে নির্ধারিত সরকারি ফি পরিশোধ করুন। পোর্টালে "পেইড" স্ট্যাটাস নিশ্চিত
              হবে।
            </p>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold mt-3 block">ধাপ ৩</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-2.5">
              ০৪
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">তথ্য ও দলিল আপলোড</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              সঠিক তথ্য টাইপ করুন এবং উপযুক্ত প্রমাণপত্রের স্ক্যান কপি (সর্বোচ্চ 1MB PDF/JPG) আপলোড
              করুন।
            </p>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold mt-3 block">ধাপ ৪</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center mb-2.5">
              ০৫
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">সাবমিট ও কপি প্রিন্ট</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              সবকিছু রিভিউ করে সাবমিট করুন। ফরম-২ সংশোধন কপি প্রিন্ট করে নিজের কাছে সংরক্ষণ করুন।
            </p>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold mt-3 block">ধাপ ৫</span>
        </div>
      </div>

      {/* Direct Portal Links and Helplines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">অফিসিয়াল NID সার্ভিসেস পোর্টাল</h3>
            <p className="text-xs text-slate-500 mt-1">
              সরাসরি নির্বাচন কমিশনের ওয়েবসাইটে গিয়ে আবেদন শুরু করুন।
            </p>
            <a
              href="https://services.nidw.gov.bd"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 underline"
            >
              <span>services.nidw.gov.bd ভিজিট করুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900">নির্বাচন কমিশন হেল্পলাইন (১০৫)</h3>
            <p className="text-xs text-slate-500 mt-1">
              যে কোনো পরামর্শ বা আবেদন ট্র্যাকিংয়ের জন্য রোববার থেকে বৃহস্পতিবার সকাল ৯টা থেকে বিকাল
              ৫টা।
            </p>
            <span className="mt-2 block text-xs font-bold text-slate-800 font-mono">
              টোল-ফ্রি নম্বর: ১০৫ (যেকোনো মোবাইল অপারেটর থেকে)
            </span>
          </div>
        </div>
      </div>

      {/* SMS Status Check Format */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mb-2">
          <Smartphone className="w-4 h-4 text-rose-400" />
          <span>মোবাইল এসএমএস এর মাধ্যমে আবেদন ট্র্যাকিং</span>
        </h3>
        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
          আপনার আবেদনের বর্তমান অবস্থা জানতে মোবাইলের মেসেজ অপশনে গিয়ে নিম্নোক্ত ফরম্যাটে লিখুন:
        </p>
        <div className="p-3 bg-white/10 rounded-xl border border-white/15 font-mono text-xs sm:text-sm text-emerald-300">
          NID &lt;স্পেস&gt; FormNumber &lt;স্পেস&gt; DD-MM-YYYY
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          উদাহরণ: <span className="font-mono text-slate-200">NID 12345678 15-08-1996</span> লিখে পাঠিয়ে
          দিন <span className="font-bold text-rose-400">১০৫</span> নম্বরে।
        </p>
      </div>
    </div>
  );
};
