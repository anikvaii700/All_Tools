import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  ExternalLink,
  FileText,
  CreditCard,
  HelpCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
} from 'lucide-react';
import {
  BANGLADESH_BUSINESS_STRUCTURES,
  OFFICIAL_GOVT_PORTALS,
  TRADE_LICENSE_GUIDE,
  BUSINESS_BANKING_GUIDE,
} from '../../data/bangladeshGovtGuide';

export const BangladeshBusinessGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'structures' | 'tradelicense' | 'taxbank' | 'portals'>('tradelicense');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>মডিউল ১০: বাংলাদেশ সরকারি ও আইনি গাইডবুক</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          ট্রেড লাইসেন্স, টিআইএন ও সরকারি কমপ্লায়েন্স নির্দেশিকা
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl">
          দালাল বা মধ্যস্বত্বভোগীদের বাড়তি টাকা না দিয়ে সরাসরি সরকারি নিয়মে ব্যবসা পরিচালনা ও ব্যাংকিং সংক্রান্ত যাচাইকৃত তথ্য।
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('tradelicense')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'tradelicense'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📜 ট্রেড লাইসেন্স নিয়মাবলি
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('structures')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'structures'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🏢 ব্যবসার ধরন ও তুলনা (৩টি মডেল)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('taxbank')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'taxbank'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            💳 e-TIN, ভ্যাট ও কারেন্ট একাউন্ট
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('portals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'portals'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🏛️ অফিসিয়াল সরকারি পোর্টাল ও এসএমই লিংক
          </button>
        </div>
      </div>

      {/* Tab 1: Trade License */}
      {activeTab === 'tradelicense' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>যাচাইকরণ সময়: {TRADE_LICENSE_GUIDE.lastVerifiedDate} • বাংলাদেশের স্থানীয় সরকার আইন অনুযায়ী</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRADE_LICENSE_GUIDE.authorityBreakdown.map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {item.area}
                </span>
                <div className="text-base font-bold text-slate-900">ফি: {item.estimatedFee}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.process}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-2">
            <h4 className="text-sm font-bold text-slate-900">প্রয়োজনীয় কাগজপত্র চেকলিস্ট:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">✓ উদ্যোক্তার জাতীয় পরিচয়পত্র (NID) ফটোকপি</li>
              <li className="flex items-center gap-2">✓ পাসপোর্ট সাইজ রঙিন ছবি (২-৩ কপি)</li>
              <li className="flex items-center gap-2">✓ দোকান/অফিসের ভাড়ার চুক্তিপত্র বা হোল্ডিং ট্যাক্স রসিদ</li>
              <li className="flex items-center gap-2">✓ অনলাইন ব্যবসা হলে "অনলাইন মার্কেটিং/ই-কমার্স" বিবরণ</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 2: Business Structures */}
      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {BANGLADESH_BUSINESS_STRUCTURES.map((struct, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  জটিলতা: {struct.complexity}
                </span>
                <h3 className="text-base font-bold text-slate-900">{struct.banglaName}</h3>
                <p className="text-xs text-slate-500 italic">{struct.idealFor}</p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div>
                    <span className="text-slate-400">সরকারি খরচ: </span>
                    <span className="font-bold text-slate-800">{struct.setupCostEstimate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">সময়কাল: </span>
                    <span className="font-bold text-indigo-700">{struct.timelineDays}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs pt-1">
                  <span className="font-bold text-emerald-800 block">সুবিধাসমূহ:</span>
                  <ul className="space-y-0.5 text-slate-600 text-[11px]">
                    {struct.pros.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-1">বাধ্যতামূলক ডকুমেন্টস:</span>
                <div className="flex flex-wrap gap-1">
                  {struct.mandatoryDocs.map((doc, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: TIN & Banking */}
      {activeTab === 'taxbank' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-500" />
              <span>ব্যাংক কারেন্ট একাউন্ট খোলার চেকলিস্ট</span>
            </h3>
            <p className="text-xs text-slate-500">
              ব্যক্তিগত একাউন্টে ব্যবসায়িক লেনদেন করলে ব্যাংক যেকোনো সময় ব্লক করতে পারে। ব্যবসার নামে চলতি হিসাব খুলতে যা লাগবে:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              {BUSINESS_BANKING_GUIDE.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>ডিজিটাল পেমেন্ট মার্চেন্ট ও গেটওয়ে</span>
            </h3>
            <div className="space-y-3">
              {BUSINESS_BANKING_GUIDE.digitalPaymentGatewaysInBD.map((gw, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-900">{gw.name}</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{gw.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Official Portals */}
      {activeTab === 'portals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFICIAL_GOVT_PORTALS.map((portal, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:border-emerald-300 transition"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                  অফিসিয়াল সরকারি সেবা
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-2">{portal.banglaName}</h4>
                <p className="text-xs text-slate-500 mt-1">{portal.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                >
                  <span>ওয়েবসাইটে যান</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legal Disclaimer */}
      <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          আইনি সতর্কতা: এই গাইডে উপস্থাপিত তথ্যসমূহ কেবলমাত্র সাধারণ ব্যবসায়িক সচেতনতা ও প্রাথমিক নির্দেশনার জন্য সংকলিত। ব্যবসাভেদে স্থানীয় কর্তৃপক্ষ ও বর্তমান কর বিধিমালার তারতম্য হতে পারে। বিশেষ আইনি বা জটিল কর সংক্রান্ত সিদ্ধান্তের জন্য নিবন্ধিত আইনজীবী বা চার্টার্ড অ্যাকাউন্ট্যান্টের পরামর্শ নেওয়া সমীচীন।
        </span>
      </div>
    </div>
  );
};
