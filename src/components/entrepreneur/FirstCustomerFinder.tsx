import React, { useState } from 'react';
import {
  Users,
  Target,
  Send,
  MessageSquare,
  Copy,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Flame,
  HelpCircle,
  PhoneCall,
  Search,
} from 'lucide-react';
import { BusinessProject } from '../../types/entrepreneur';

interface FirstCustomerFinderProps {
  project: BusinessProject;
  onShowToast: (msg: string, icon?: string) => void;
}

export const FirstCustomerFinder: React.FC<FirstCustomerFinderProps> = ({
  project,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'persona' | 'outreach' | 'objections' | 'plan'>('outreach');

  // Persona State
  const [personaName, setPersonaName] = useState('ব্যস্ত দোকানদার / ক্ষুদ্র উদ্যোক্তা');
  const [painPoint, setPainPoint] = useState('ফেসবুক পেজে পোস্ট দেওয়ার মতো সময় বা সুন্দর ব্যানার তৈরির দক্ষতার অভাব।');
  const [onlineHangout, setOnlineHangout] = useState('লোকাল ব্যবসা ও এফ-কমার্স ফেসবুক গ্রুপ, হোয়াটসঅ্যাপ');

  // Custom Outreach Variables
  const [prospectName, setProspectName] = useState('আহমেদ ভাই');
  const [businessName, setBusinessName] = useState(project.offerDraft.selectedBrandName || project.name);
  const [serviceName, setServiceName] = useState('সোশ্যাল মিডিয়া ব্যানার ও রিলস তৈরি');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} কপি করা হয়েছে! 📋`, '📋');
  };

  // WhatsApp Message Templates
  const whatsappWarmMessage = `আসসালামু আলাইকুম ${prospectName} 🌸

আশা করি ভালো আছেন। 

আপনার জন্য একটি ছোট অনুরোধ ছিল। আমি সম্প্রতি একটি উদ্যোগ শুরু করেছি—"${businessName}"। আমরা মূলত স্থানীয় উদ্যোক্তাদের জন্য ${serviceName} সেবা প্রদান করছি।

আমি আপনার কোনো কিছু বিক্রি করতে মেসেজ দিইনি! শুধু আপনার ব্যবসায়িক অভিজ্ঞতা থেকে এই উদ্যোগটি কেমন হতে পারে, সে বিষয়ে একটু নিরপেক্ষ পরামর্শ চাচ্ছিলাম।

আপনার কি কাল ২ মিনিট একটু কথা বলার সুযোগ হবে? আপনার মতামত আমার জন্য অনেক বড় উৎসাহ হবে।

ধন্যবাদান্তে,
${businessName}`;

  const whatsappDirectTrial = `আসসালামু আলাইকুম ${prospectName} ভাইয়া,

আপনার পেজের প্রোডাক্টগুলো চমৎকার! 

তবে খেয়াল করলাম পেজে নিয়মিত নতুন পোস্ট বা ভিডিও যাচ্ছে না। দোকান সামলিয়ে পেজ চালানো সত্যিই অনেক কষ্টের।

আমি আপনার পেজের জন্য সম্পূর্ণ ফ্রিতে ১টি আকর্ষণীয় পোস্টার/নমুনা রেডি করে রেখেছি। আপনি অনুমতি দিলে কি হোয়াটসঅ্যাপে পাঠাতে পারি? পছন্দ হলে আপনি পেজে ব্যবহার করতে পারেন—কোনো ফি দেওয়া লাগবে না।

ভালো থাকবেন!`;

  const facebookGroupPost = `[কোনো বিজ্ঞাপন বা বিক্রি নয় — অভিজ্ঞদের জন্য ছোট উপহার 🎁]

অনেকেই বলেন ফেসবুক পেজে পোস্ট দিলে লাইক-কমেন্ট আসে কিন্তু বিক্রি হয় না। 

এর অন্যতম প্রধান কারণ: মানুষ সাধারণ ছবিতে চোখ আটকায় না। তারা এমন পোস্ট দেখতে পছন্দ করে যা দেখে সরাসরি বিশ্বাস তৈরি হয়।

আমি সম্প্রতি বেশ কিছু উদ্যোক্তার জন্য স্টাডি করে দেখেছি ৩টি ছোট্ট পরিবর্তন আনলেই পেজে কাস্টমারের ইনবক্স মেসেজ দ্বিগুণ করা সম্ভব:
১. ছবির নিচে প্রাইস ইনবক্স না লিখে পণ্যের খাঁটি বৈশিষ্ট্য স্পষ্ট করে তোলা
২. মোবাইলেই আলো ঠিক রেখে ১৫ সেকেন্ডের ছোট্ট একটি আনবক্সিং ভিডিও দেওয়া
৩. সন্তুষ্ট কাস্টমারের মেসেজের স্ক্রিনশট শেয়ার করা

আপনার পেজে কাস্টমার মেসেজ কেমন আসছে? কোনো প্রশ্ন থাকলে কমেন্টে জানাতে পারেন, সাধ্যমতো পরামর্শ দেওয়ার চেষ্টা করব!`;

  const OBJECTIONS_LIST = [
    {
      objection: 'দামটা একটু বেশি মনে হচ্ছে, কিছুটা কমানো যায় কি?',
      psychology: 'কাস্টমার দাম বেশি বলছে মানে সে এখনো পুরো ভ্যালু বা ঝুঁকিহীনতার নিশ্চয়তা পায়নি।',
      exactReply: `ভাইয়া আপনার অনুভূতি আমি সম্পূর্ণ বুঝতে পারছি। কিন্তু বাজারে সস্তায় অনেকেই কাজ করে পরে ফোন ধরে না বা কোয়ালিটি খারাপ দেয়। 

আমি শুধু কাজের ডেলিভারি দিই না, আপনার পেজে যেন কাস্টমার আকৃষ্ট হয় সেই ব্যক্তিগত যত্ন নিই। 

তবে আপনার সাথে প্রথম কাজ শুরু করার খাতিরে আমি প্রথম মাসে বিশেষ ২০% ছাড়ে ট্রায়াল দিয়ে দেখতে পারি। আপনি কি রাজি?`,
    },
    {
      objection: 'পরে কোনো এক সময় ভেবে দেখব বা জানাব।',
      psychology: 'এটি ভদ্রভাবে বিদায় জানানো। তারা জরুরি কোনো চাপ অনুভব করছে না।',
      exactReply: `নিশ্চয়ই ভাইয়া, তাড়াহুড়োর কিছু নেই! আপনি সময় নিয়ে ভাবুন। 

তবে আমাদের এই সপ্তাহের স্পেশাল অনবোর্ডিং ব্যাচে আর মাত্র ২টি খালি স্লট রয়েছে যাতে আমরা ফ্রি কভার ডিজাইন দিচ্ছি। 

আপনি চাইলে কি আপনার স্লটটি সাময়িকভাবে হোল্ড করে রাখব? সিদ্ধান্ত আপনি পরে নিলেও অফারটি মিস হবে না।`,
    },
    {
      objection: 'আমরা অলরেডি অন্য একজন থেকে নিয়মিত নিচ্ছি।',
      psychology: 'তারা বর্তমান সার্ভিস নিয়ে কম্ফোর্টেবল, সহজে নতুন কাউকে রিস্ক নিতে চায় না।',
      exactReply: `মাশাআল্লাহ ভাইয়া, এটা শুনে ভালো লাগল যে আপনার অলরেডি একটি ভালো সাপোর্ট রয়েছে! 

আমি কখনোই বলব না তাদের বাদ দিয়ে আমার কাছে আসুন। তবে যেকোনো ব্যাকআপ হিসেবে আমাদের সাথে পরিচিত থাকা ভালো। 

আমি কি মাত্র ১টি ছোট স্যাম্পল কাজ আপনাকে ফ্রিতে করে দিতে পারি? যাতে ভবিষ্যতে কখনো জরুরি প্রয়োজনে আপনি আমাদের কোয়ালিটি যাচাই করতে পারেন।`,
    },
    {
      objection: 'আপনাদের নাম তো আগে শুনিনি, বিশ্বাস করব কীভাবে?',
      psychology: 'ব্র্যান্ড অপরিচিত হওয়ায় প্রতারণা বা টাকা মার যাওয়ার স্বাভাবিক ভয়।',
      exactReply: `ভাইয়া একদম খাঁটি কথা বলেছেন! নতুন কারো ওপর বিশ্বাস করা সত্যিই কঠিন। 

এই কারণেই আমরা শুরুতেই পুরো টাকা চাই না। আপনি কাজ হাতে পেয়ে দেখে সন্তুষ্ট হওয়ার পর বিল পরিশোধ করবেন। 

তাছাড়া কোনো কারণে কাজের মান মনের মতো না হলে আপনার ১ পয়সাও দেওয়া লাগবে না—পুরো ঝুঁকি আমার!`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
          <Target className="w-3.5 h-3.5" />
          <span>মডিউল ৪: প্রথম ১০ জন কাস্টমার সন্ধান</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          বিনা বিজ্ঞাপনে সততা ও আন্তরিকতার সাথে প্রথম ১০ জন পেইড ক্রেতা পান
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl">
          বিজ্ঞাপনে হাজার টাকা নষ্ট না করে কীভাবে ব্যক্তিগত যোগাযোগ, ফেসবুক গ্রুপ ও চমৎকার স্যাম্পল উপহার দিয়ে গ্রাহকদের সাথে আজীবন বিশ্বাস তৈরি করবেন।
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('outreach')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'outreach'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            💬 হোয়াটসঅ্যাপ ও আউটরিচ মেসেজ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('objections')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'objections'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🛡️ কাস্টমার আপত্তি মোকাবিলার স্ক্রিপ্ট ({OBJECTIONS_LIST.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'plan'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📋 প্রথম ১০ ক্লায়েন্টের অ্যাকশন প্ল্যান
          </button>
        </div>
      </div>

      {/* Tab 1: Outreach Messages */}
      {activeTab === 'outreach' && (
        <div className="space-y-5">
          {/* Customizer */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">কাস্টমার / ব্যক্তির নাম:</label>
              <input
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">আপনার ব্র্যান্ড নাম:</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">সেবার নাম:</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* Template 1: Warm Advice Outreach */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  পদ্ধতি ১: পরামর্শ চাওয়া (সবচেয়ে বেশি রেসপন্স পাওয়া স্ক্রিপ্ট)
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">পরিচিত বা সম্ভাব্য ক্লায়েন্টকে প্রথম বার্তা</h3>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(whatsappWarmMessage, 'পরামর্শ বার্তা')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>কপি করুন</span>
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-sans text-xs text-slate-800 whitespace-pre-line leading-relaxed">
              {whatsappWarmMessage}
            </div>
            <span className="text-[11px] text-slate-500 block">
              💡 কেন এটি কাজ করে: মানুষ পরামর্শ দিতে ভালোবাসে কিন্তু কিছু চাপিয়ে দেওয়া ঘৃণা করে। যখন তারা উৎসাহ দেয়, তারাই আপনার প্রথম গ্রাহক হয়।
            </span>
          </div>

          {/* Template 2: Free Trial Gift Outreach */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  পদ্ধতি ২: ফ্রি স্যাম্পল উপহার দিয়ে পিচ
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">অনলাইন শপ ও দোকানদারদের জন্য নো-রিস্ক অফার</h3>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(whatsappDirectTrial, 'ফ্রি স্যাম্পল বার্তা')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>কপি করুন</span>
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-sans text-xs text-slate-800 whitespace-pre-line leading-relaxed">
              {whatsappDirectTrial}
            </div>
          </div>

          {/* Template 3: Facebook Group Value Post */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  পদ্ধতি ৩: ফেসবুক গ্রুপে ভ্যালু কনটেন্ট
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">গ্রুপে সরাসরি বিক্রি ছাড়া অথরিটি তৈরির পোস্ট</h3>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(facebookGroupPost, 'ফেসবুক গ্রুপ পোস্ট')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>কপি করুন</span>
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-sans text-xs text-slate-800 whitespace-pre-line leading-relaxed">
              {facebookGroupPost}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Objections */}
      {activeTab === 'objections' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              কাস্টমারের আপত্তি মানে তারা কিনতে চায় না তা নয়—এর মানে তাদের মনে কিছু সংশয় বা ভীতি রয়েছে। এই স্ক্রিপ্টগুলো দিয়ে ভয় দূর করুন।
            </span>
          </div>

          {OBJECTIONS_LIST.map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    আপত্তি #{idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">"{item.objection}"</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">মানসিকতা: {item.psychology}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.exactReply, 'উত্তর')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>উত্তর কপি</span>
                </button>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {item.exactReply}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Action Plan */}
      {activeTab === 'plan' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>প্রথম ১০ জন কাস্টমার অর্জনের প্রমাণিত রোডম্যাপ</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-xs">১ম স্তর: পরিচিত বৃত্ত (Warm Circle - প্রথম ৩ জন কাস্টমার)</div>
              <p className="text-slate-600 text-[11px]">
                আপনার ঘনিষ্ঠ বন্ধু, পরিবার ও প্রাক্তন সহকর্মীদের মধ্যে যারা ব্যবসা করেন বা সেবার প্রয়োজন রয়েছে তাদের জানান। প্রথম ২ জনকে ফ্রি ট্রায়াল দিন এবং তাদের থেকে লিখিত রিভিউ নিন।
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-xs">২য় স্তর: স্থানীয় দোকান ও শপ ভিজিট (Direct Footprint - পরবর্তী ৪ জন কাস্টমার)</div>
              <p className="text-slate-600 text-[11px]">
                আপনার এলাকার বাজারে অন্তত ১৫টি দোকানে যান। তাদের সাথে সালাম দিয়ে পরিচিত হোন। মোবাইলে তৈরি করা সুন্দর ডেমো দেখান এবং ৩ দিনের ট্রায়াল অফার করুন।
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 text-xs">৩য় স্তর: রেফারেল লুপ (Referral Multiplier - শেষ ৩ জন কাস্টমার)</div>
              <p className="text-slate-600 text-[11px]">
                যে ক্লায়েন্টরা আপনার কাজে সন্তুষ্ট হয়েছেন, তাদের বলুন: "আপনার পরিচিত কোনো ব্যবসায়ী ভাই কি আছেন যিনি পেজে নিয়মিত পোস্ট দিতে কষ্ট পাচ্ছেন? তাকে জানালে তিনি বিশেষ ছাড় পাবেন।"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
