// Official NID Correction Fee Structure & Calculator
import React, { useState } from 'react';
import { CreditCard, Calculator, Smartphone, Info, ShieldCheck, Check } from 'lucide-react';
import { STANDARD_FEE_TIERS } from '../knowledgeBase/electionCommissionData';

export const FeeSection: React.FC<{ onShowToast: (msg: string, icon?: string) => void }> = ({
  onShowToast,
}) => {
  const [feeCategory, setFeeCategory] = useState<'personal' | 'other' | 'both'>('personal');
  const [selectedTimes, setSelectedTimes] = useState<number>(0); // 0 = 1st, 1 = 2nd, 2 = 3rd
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  const toBn = (n: number | string): string => {
    const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n).replace(/\d/g, (d) => bn[Number(d)]);
  };

  const getActiveTiers = () => {
    if (feeCategory === 'personal') return STANDARD_FEE_TIERS.personalInfo;
    if (feeCategory === 'other') return STANDARD_FEE_TIERS.otherInfo;
    return STANDARD_FEE_TIERS.bothInfo;
  };

  const activeTiers = getActiveTiers();
  const currentTier = activeTiers[selectedTimes] || activeTiers[0];

  const base = isUrgent && currentTier.urgentBaseFee ? currentTier.urgentBaseFee : currentTier.baseFee;
  const vat =
    isUrgent && currentTier.urgentVatAmount ? currentTier.urgentVatAmount : currentTier.vatAmount;
  const total =
    isUrgent && currentTier.urgentTotalFee ? currentTier.urgentTotalFee : currentTier.totalFee;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-md bg-white/10 text-rose-300 text-xs font-mono font-bold">
              গেজেট ২০২৪-২০২৫
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-2 text-white">
              নির্বাচন কমিশন সরকারি NID সংশোধন ও রি-ইস্যু ফি চার্ট
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              আইন অনুযায়ী সকল সরকারি ফির সাথে ১৫% মূল্য সংযোজন কর (ভ্যাট) প্রযোজ্য। ১ম, ২য় ও ৩য় বার
              আবেদনের ধাপ অনুযায়ী ফি ভিন্ন হয়।
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-center shrink-0">
            <span className="text-xs text-slate-300 block">সরকারি ভ্যাট হার</span>
            <span className="text-2xl font-bold font-mono text-rose-400">১৫%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">সব সেবায় অন্তর্ভুক্ত</span>
          </div>
        </div>
      </div>

      {/* Interactive Fee Calculator */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            ইন্টারঅ্যাক্টিভ সরকারি ফি ক্যালকুলেটর
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Step 1: Category selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              ১. কোন ধরনের তথ্য সংশোধন করবেন?
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setFeeCategory('personal')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  feeCategory === 'personal'
                    ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>ব্যক্তিগত তথ্য (নাম, পিতা/মাতা, জন্মতারিখ)</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  ১ম বার: ৳ ২৩০ (ভ্যাটসহ)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFeeCategory('other')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  feeCategory === 'other'
                    ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>অন্যান্য তথ্য / ঠিকানা / রক্তের গ্রুপ</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  ১ম বার: ৳ ১১৫ (ভ্যাটসহ)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFeeCategory('both')}
                className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  feeCategory === 'both'
                    ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>উভয় তথ্য (ব্যক্তিগত + অন্যান্য এক সাথে)</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  ১ম বার: ৳ ৩৪৫ (ভ্যাটসহ)
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Times / Frequency */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              ২. পূর্বে এই তথ্য সংশোধন করেছেন কতবার?
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedTimes(0)}
                className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  selectedTimes === 0
                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>প্রথমবার (১ম আবেদন)</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  সর্বনিম্ন সরকারি চার্জ
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimes(1)}
                className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  selectedTimes === 1
                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>দ্বিতীয়বার (২য় আবেদন)</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  ১ম বারের চেয়ে একটু বেশি
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimes(2)}
                className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  selectedTimes === 2
                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>তৃতীয় বা পরবর্তী বার</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  সর্বোচ্চ সরকারি স্ল্যাব
                </div>
              </button>
            </div>
          </div>

          {/* Step 3: Delivery Mode */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              ৩. ডেলিভারি ধরন (সাধারণ / জরুরি)
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsUrgent(false)}
                className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  !isUrgent
                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>সাধারণ ডেলিভারি (Regular)</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  স্ট্যান্ডার্ড সরকারি সময়
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsUrgent(true)}
                className={`w-full p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                  isUrgent
                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>জরুরি ডেলিভারি (Urgent)</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  দ্বিগুণ মূল ফি + ভ্যাট
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Calculated Output Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-rose-400 font-medium">হিসাবকৃত মোট প্রদেয় ফি</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white mt-1">
                ৳ {toBn(total)}.০০ টাকা
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                (মূল ফি: ৳ {toBn(base)} + ১৫% ভ্যাট: ৳ {toBn(vat)})
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-400 block">আবেদনের স্ল্যাব:</span>
              <span className="text-sm font-bold text-white block">{currentTier.times}</span>
              <span className="text-xs text-indigo-300 block mt-0.5">
                {isUrgent ? 'জরুরি সার্ভিস' : 'সাধারণ সার্ভিস'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Master Fee Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 overflow-x-auto">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
          সম্পূর্ণ সরকারি ফি চার্ট (Master Table)
        </h3>
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <th className="p-3 font-bold">সেবার বিবরণ</th>
              <th className="p-3 font-bold">আবেদনের ক্রম</th>
              <th className="p-3 font-bold font-mono">মূল ফি</th>
              <th className="p-3 font-bold font-mono">১৫% ভ্যাট</th>
              <th className="p-3 font-bold font-mono text-rose-700">সর্বমোট (টাকা)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {/* Personal Info */}
            <tr className="hover:bg-slate-50">
              <td className="p-3 font-medium" rowSpan={3}>
                ব্যক্তিগত তথ্য সংশোধন (নাম, পিতা/মাতা, জন্মতারিখ)
              </td>
              <td className="p-3">১ম বার</td>
              <td className="p-3 font-mono">৳ ২০০</td>
              <td className="p-3 font-mono">৳ ৩০</td>
              <td className="p-3 font-mono font-bold text-rose-700">৳ ২৩০</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-3">২য় বার</td>
              <td className="p-3 font-mono">৳ ৩০০</td>
              <td className="p-3 font-mono">৳ ৪৫</td>
              <td className="p-3 font-mono font-bold text-rose-700">৳ ৩৪৫</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-3">৩য় ও পরবর্তী বার</td>
              <td className="p-3 font-mono">৳ ৫০০</td>
              <td className="p-3 font-mono">৳ ৭৫</td>
              <td className="p-3 font-mono font-bold text-rose-700">৳ ৫৭৫</td>
            </tr>

            {/* Other Info */}
            <tr className="hover:bg-slate-50 bg-slate-50/50">
              <td className="p-3 font-medium" rowSpan={3}>
                অন্যান্য তথ্য সংশোধন (ঠিকানা, রক্তের গ্রুপ, পেশা)
              </td>
              <td className="p-3">১ম বার</td>
              <td className="p-3 font-mono">৳ ১০০</td>
              <td className="p-3 font-mono">৳ ১৫</td>
              <td className="p-3 font-mono font-bold text-rose-700">৳ ১১৫</td>
            </tr>
            <tr className="hover:bg-slate-50 bg-slate-50/50">
              <td className="p-3">২য় বার</td>
              <td className="p-3 font-mono">৳ ২০০</td>
              <td className="p-3 font-mono">৳ ৩০</td>
              <td className="p-3 font-mono font-bold text-rose-700">৳ ২৩০</td>
            </tr>
            <tr className="hover:bg-slate-50 bg-slate-50/50">
              <td className="p-3">৩য় ও পরবর্তী বার</td>
              <td className="p-3 font-mono">৳ ৩০০</td>
              <td className="p-3 font-mono">৳ ৪৫</td>
              <td className="p-3 font-mono font-bold text-rose-700">৳ ৩৪৫</td>
            </tr>

            {/* Re-issue */}
            <tr className="hover:bg-slate-50">
              <td className="p-3 font-medium" rowSpan={3}>
                হারানো বা নষ্ট কার্ড রি-ইস্যু (Re-issue)
              </td>
              <td className="p-3">১ম বার সাধারণ</td>
              <td className="p-3 font-mono">৳ ২০০</td>
              <td className="p-3 font-mono">৳ ৩০</td>
              <td className="p-3 font-mono font-bold text-rose-700">৳ ২৩০</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-3">১ম বার জরুরি</td>
              <td className="p-3 font-mono">৳ ৩০০</td>
              <td className="p-3 font-mono">৳ ৪৫</td>
              <td className="p-3 font-mono font-bold text-rose-700">৳ ৩৪৫</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="p-3">২য় বার বা তদূর্ধ্ব</td>
              <td className="p-3 font-mono">৳ ৩০০/৫০০</td>
              <td className="p-3 font-mono">৳ ৪৫/৭৫</td>
              <td className="p-3 font-mono font-bold text-rose-700">৳ ৩৪৫/৫৭৫</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Banking Payment Steps */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-indigo-600" />
          <span>মোবাইল ব্যাংকিংয়ে ফি পরিশোধ করার নিয়ম</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
            <h4 className="text-sm font-bold text-rose-900 mb-2">১. বিকাশ অ্যাপের মাধ্যমে:</h4>
            <ol className="text-xs text-rose-950 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>বিকাশ অ্যাপে লগইন করে "Pay Bill" অপশনে যান।</li>
              <li>"সরকারি ফি" বা সার্চ বারে "NID Service" লিখুন।</li>
              <li>আবেদনের ধরন সিলেক্ট করুন (যেমন: NID Info Correction)।</li>
              <li>আপনার জাতীয় পরিচয়পত্র নম্বরটি ইনপুট দিন।</li>
              <li>টাকার পরিমাণ স্বয়ংক্রিয়ভাবে ভেসে উঠবে, পিন দিয়ে কনফার্ম করুন।</li>
            </ol>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
            <h4 className="text-sm font-bold text-indigo-900 mb-2">২. রকেট (Rocket) অ্যাপ বা ইউএসএসডি:</h4>
            <ol className="text-xs text-indigo-950 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>রকেট অ্যাপে "Bill Pay" তে যান অথবা *322# ডায়াল করুন।</li>
              <li>Biller ID ঘরে 1000 লিখুন (Election Commission NID Wing)।</li>
              <li>Bill Number ঘরে আপনার NID নম্বরটি লিখুন।</li>
              <li>ফি কোড অনুযায়ী অ্যামাউন্ট দিয়ে পিন কনফার্ম করুন।</li>
              <li>প্রাপ্ত ট্রানজেকশন আইডি (TxnID) সংরক্ষণ করুন।</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
