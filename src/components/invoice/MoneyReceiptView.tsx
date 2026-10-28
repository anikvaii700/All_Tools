import React from 'react';
import { BusinessProfile, MoneyReceipt } from './types';
import { formatMoney } from './calculator';
import { toBengaliNumerals } from './numberToWords';

interface MoneyReceiptViewProps {
  receipt: MoneyReceipt;
  business: BusinessProfile;
}

export const MoneyReceiptView: React.FC<MoneyReceiptViewProps> = ({ receipt, business }) => {
  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'bkash': return 'bKash (বিকাশ)';
      case 'nagad': return 'Nagad (নগদ)';
      case 'rocket': return 'Rocket (রকেট)';
      case 'bank': return 'ব্যাংক ট্রান্সফার / চেক';
      case 'card': return 'কার্ড পেমেন্ট';
      case 'cash': return 'নগদ ক্যাশ';
      default: return 'অন্যান্য মাধ্যম';
    }
  };

  return (
    <div className="bg-white text-slate-800 p-6 sm:p-8 font-sans text-xs sm:text-sm border-2 border-indigo-900 rounded-2xl shadow-sm print:border-none print:shadow-none print:p-6 print:m-0 max-w-2xl mx-auto relative overflow-hidden">
      {/* Top Banner Ribbon */}
      <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-4">
        <div className="flex items-start gap-3">
          {business.logoUrl ? (
            <img src={business.logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded-lg border border-slate-200" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold text-lg">
              {business.businessName.charAt(0) || 'M'}
            </div>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-black text-indigo-950">
              {business.businessName || 'The MoSaFa'}
            </h2>
            <p className="text-[11px] text-slate-500 whitespace-pre-line">{business.businessAddress}</p>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {business.phone && <span>মোবাইল: {business.phone}</span>}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block bg-indigo-900 text-white font-extrabold px-3 py-1 text-xs uppercase tracking-wider rounded-md mb-1">
            মানি রিসিট (MONEY RECEIPT)
          </span>
          <div className="text-xs font-mono">
            <span className="text-slate-500">রিসিট নং:</span> <strong>{receipt.receiptNumber}</strong>
          </div>
          <div className="text-xs">
            <span className="text-slate-500">তারিখ:</span> <strong>{toBengaliNumerals(receipt.receiptDate)}</strong>
          </div>
        </div>
      </div>

      {/* Main Receipt Body */}
      <div className="py-6 space-y-4">
        {/* Row 1 */}
        <div className="flex items-center gap-2 border-b border-dashed border-slate-300 pb-2">
          <span className="text-slate-600 font-semibold shrink-0">যাঁর নিকট থেকে প্রাপ্ত:</span>
          <span className="font-extrabold text-slate-900 text-sm sm:text-base flex-1">
            {receipt.receivedFrom || 'সম্মানিত গ্রাহক'}
          </span>
          {receipt.customerPhone && (
            <span className="text-xs text-slate-500 font-mono">মোবাইল: {receipt.customerPhone}</span>
          )}
        </div>

        {/* Row 2: Amount */}
        <div className="flex items-center gap-4 bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200/80">
          <span className="text-indigo-950 font-bold shrink-0">প্রাপ্ত টাকার অংক:</span>
          <div className="font-black text-xl sm:text-2xl text-indigo-900 font-mono">
            ৳ {toBengaliNumerals(formatMoney(receipt.amount, ''))}
          </div>
          <span className="text-[11px] bg-indigo-200/60 text-indigo-900 font-bold px-2.5 py-1 rounded-full ml-auto">
            {getMethodBadge(receipt.paymentMethod)}
          </span>
        </div>

        {/* Row 3: In words */}
        <div className="border-b border-dashed border-slate-300 pb-2">
          <span className="text-slate-600 font-semibold block text-[11px] uppercase tracking-wider mb-0.5">
            কথায় (In Words):
          </span>
          <span className="font-bold text-slate-900 text-sm">{receipt.amountInWords}</span>
        </div>

        {/* Row 4: Purpose & Invoice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-b border-dashed border-slate-300 pb-3">
          <div>
            <span className="text-slate-600 font-semibold">পেমেন্টের বিবরণ / উদ্দেশ্য:</span>
            <p className="font-bold text-slate-800 mt-0.5">{receipt.paymentPurpose || 'বকেয়া বিল পরিশোধ'}</p>
          </div>
          {receipt.relatedInvoiceNumber && (
            <div className="sm:text-right">
              <span className="text-slate-600 font-semibold">সংশ্লিষ্ট ইনভয়েস নং:</span>
              <p className="font-mono font-bold text-indigo-900 mt-0.5">{receipt.relatedInvoiceNumber}</p>
            </div>
          )}
        </div>

        {/* Notes */}
        {receipt.notes && (
          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong>নোট / রেফারেন্স:</strong> {receipt.notes}
          </div>
        )}
      </div>

      {/* Bottom Signatures */}
      <div className="pt-8 border-t border-indigo-900/40 flex justify-between items-end text-xs">
        <div className="text-center">
          <div className="w-32 border-b border-slate-400 mb-1" />
          <span className="text-slate-600 text-[11px]">টাকা প্রদানকারীর স্বাক্ষর</span>
        </div>

        <div className="text-center">
          <div className="w-36 border-b-2 border-indigo-900 mb-1" />
          <span className="font-bold text-indigo-950">
            {receipt.receivedBy || business.ownerName || 'অনুমোদিত গ্রহণকারীর স্বাক্ষর'}
          </span>
        </div>
      </div>
    </div>
  );
};
