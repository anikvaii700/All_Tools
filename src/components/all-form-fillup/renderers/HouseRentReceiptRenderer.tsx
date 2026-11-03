import React from 'react';
import { formatBanglaDate, formatBanglaNumber, toBanglaDigits } from '../numberUtils';

interface HouseRentReceiptRendererProps {
  data: Record<string, any>;
  showBorder?: boolean;
}

export const HouseRentReceiptRenderer: React.FC<HouseRentReceiptRendererProps> = ({
  data,
  showBorder = true,
}) => {
  const receiptNumber = data.receiptNumber || '০১';
  const receiptDate = data.receiptDate ? formatBanglaDate(data.receiptDate) : '.../.../২০২...';
  const ownerName = data.ownerName || '...................................................';
  const ownerMobile = data.ownerMobile || '';
  const tenantName = data.tenantName || '...................................................';
  const flatNumber = data.flatNumber || '...................................................';
  const month = data.month || '.....................';
  const year = data.year ? toBanglaDigits(data.year) : '২০২৬';
  const rentAmountRaw = data.rentAmount || 0;
  const rentAmountBn = formatBanglaNumber(rentAmountRaw);
  const rentAmountWords = data.rentAmountWords || '...........................................................................';
  const utilityIncluded = data.utilityIncluded || '';
  const note = data.note || '';
  const ownerSignatureTitle = data.ownerSignatureTitle || 'মালিকের স্বাক্ষর';

  return (
    <div
      id="house-rent-receipt-document"
      className={`bg-white text-slate-900 w-full max-w-[760px] mx-auto p-7 sm:p-10 font-sans selection:bg-rose-100 ${
        showBorder ? 'border-2 border-slate-900 shadow-md' : 'border border-slate-300'
      } rounded-xs`}
      style={{
        boxSizing: 'border-box',
        minHeight: '520px',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Decorative Inner Border Accent */}
      <div className="border border-slate-800 p-6 sm:p-8 relative">
        {/* Corner Decors */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-slate-900" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-slate-900" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-slate-900" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-slate-900" />

        {/* 1. HEADER SECTION */}
        <div className="text-center mb-6 pb-2">
          <div className="inline-block relative">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 pb-1">
              বাসা ভাড়ার রসিদ
            </h1>
            {/* Elegant double line under heading */}
            <div className="w-full h-0.5 bg-slate-900" />
            <div className="w-4/5 h-0.5 bg-slate-900 mt-0.5 mx-auto" />
          </div>
        </div>

        {/* 2. RECEIPT NO & DATE ROW */}
        <div className="flex items-center justify-between border-b border-dashed border-slate-400 pb-3 mb-6 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800">রসিদ নং:</span>
            <span className="font-mono font-bold text-slate-950 px-2 py-0.5 border border-slate-400 rounded-sm bg-slate-50 min-w-[60px] text-center inline-block">
              {toBanglaDigits(receiptNumber)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800">তারিখ:</span>
            <span className="font-bold text-slate-950 border-b border-dotted border-slate-700 min-w-[110px] text-center px-1">
              {receiptDate}
            </span>
          </div>
        </div>

        {/* 3. OWNER & TENANT DETAILS (DOTTED/UNDERLINED ROW STYLE) */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed mb-6">
          {/* মালিকের বিবরণ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-baseline flex-1 min-w-0">
              <span className="font-bold whitespace-nowrap text-slate-900 mr-2">
                বাড়ির মালিকের নাম:
              </span>
              <span className="font-semibold text-slate-950 border-b border-dotted border-slate-600 flex-1 px-1">
                {ownerName}
              </span>
            </div>
            {ownerMobile && (
              <div className="flex items-baseline shrink-0">
                <span className="font-bold whitespace-nowrap text-slate-900 mr-2">
                  মোবাইল:
                </span>
                <span className="font-mono font-semibold text-slate-950 border-b border-dotted border-slate-600 px-1">
                  {toBanglaDigits(ownerMobile)}
                </span>
              </div>
            )}
          </div>

          {/* ভাড়াটিয়ার বিবরণ */}
          <div className="flex items-baseline">
            <span className="font-bold whitespace-nowrap text-slate-900 mr-2">
              ভাড়াটিয়ার নাম:
            </span>
            <span className="font-semibold text-slate-950 border-b border-dotted border-slate-600 flex-1 px-1">
              {tenantName}
            </span>
          </div>

          {/* বাসা / ফ্ল্যাট নম্বর */}
          <div className="flex items-baseline">
            <span className="font-bold whitespace-nowrap text-slate-900 mr-2">
              বাসা / ফ্ল্যাট নম্বর ও ঠিকানা:
            </span>
            <span className="font-semibold text-slate-950 border-b border-dotted border-slate-600 flex-1 px-1">
              {flatNumber}
            </span>
          </div>

          {/* পেমেন্টের বিবরণ: মাস, বছর, পরিমাণ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="flex items-baseline">
              <span className="font-bold whitespace-nowrap text-slate-900 mr-2">
                ভাড়ার মাস ও সাল:
              </span>
              <span className="font-bold text-slate-950 border-b border-dotted border-slate-600 flex-1 px-1">
                {month}, {year}
              </span>
            </div>

            <div className="flex items-baseline">
              <span className="font-bold whitespace-nowrap text-slate-900 mr-2">
                ভাড়ার পরিমাণ (অংকে):
              </span>
              <span className="font-bold text-base text-slate-950 border-b border-dotted border-slate-700 flex-1 px-1">
                ৳ {rentAmountBn}/-
              </span>
            </div>
          </div>

          {/* ভাড়ার পরিমাণ কথায় */}
          <div className="flex items-baseline pt-1">
            <span className="font-bold whitespace-nowrap text-slate-900 mr-2">
              ভাড়ার পরিমাণ (কথায়):
            </span>
            <span className="font-bold text-slate-950 border-b border-dotted border-slate-700 flex-1 px-1 italic">
              {rentAmountWords}
            </span>
          </div>

          {/* আনুষঙ্গিক নোট/বিল */}
          {utilityIncluded && (
            <div className="flex items-baseline pt-1">
              <span className="font-semibold whitespace-nowrap text-slate-700 mr-2">
                অন্যান্য বিল / ইউটিলিটি:
              </span>
              <span className="text-slate-800 border-b border-dotted border-slate-400 flex-1 px-1 text-xs">
                {utilityIncluded}
              </span>
            </div>
          )}

          {note && (
            <div className="p-2.5 rounded-sm bg-slate-50 border border-slate-200 text-[11px] sm:text-xs text-slate-700 mt-2">
              <span className="font-bold text-slate-900">বিশেষ দ্রষ্টব্য:</span> {note}
            </div>
          )}
        </div>

        {/* 4. DECLARATION (অঙ্গীকারনামা) */}
        <div className="my-6 p-3 bg-slate-50/80 border-t border-b border-slate-300 text-center">
          <p className="font-bold text-xs sm:text-sm text-slate-900 tracking-wide">
            "আমি স্বীকার করিতেছি যে, উপরোক্ত পরিমাণ ভাড়া সম্পূর্ণ বুঝিয়া পাইলাম এবং গ্রহণ করিলাম।"
          </p>
        </div>

        {/* 5. SIGNATURE & STAMP BLOCK */}
        <div className="mt-12 pt-6 flex items-end justify-between text-xs sm:text-sm">
          {/* সিল (যদি থাকে) */}
          <div className="text-center w-36">
            <div className="h-14 border border-dashed border-slate-300 rounded-sm flex items-center justify-center text-[10px] text-slate-400 mb-1">
              সিল (যদি থাকে)
            </div>
            <span className="text-[11px] text-slate-500">অফিসিয়াল সিল</span>
          </div>

          {/* মালিকের স্বাক্ষর ও তারিখ (Aligned Right as specified) */}
          <div className="text-center w-52">
            <div className="h-10 border-b-2 border-slate-800 mb-1.5 flex items-end justify-center pb-1">
              {/* Blank writing area for manual physical signature */}
            </div>
            <p className="font-bold text-slate-950 text-xs sm:text-sm">
              {ownerSignatureTitle}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              তারিখ: {receiptDate}
            </p>
          </div>
        </div>

        {/* Subtle Watermark/Footer identifier */}
        <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>The MoSaFa All Form Fillup</span>
          <span>খসড়া আইডি: MSF-RENT-{toBanglaDigits(receiptNumber)}</span>
        </div>
      </div>
    </div>
  );
};
