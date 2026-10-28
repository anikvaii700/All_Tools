import React from 'react';
import { BusinessProfile, Invoice, InvoiceCalculation } from './types';
import { formatMoney } from './calculator';
import { numberToWordsBengali, toBengaliNumerals } from './numberToWords';

interface TemplateProps {
  invoice: Invoice;
  business: BusinessProfile;
  calc: InvoiceCalculation;
  onEditField?: (fieldId: string) => void;
}

export const InvoiceTemplateBismillahStore: React.FC<TemplateProps> = ({
  invoice,
  business,
  calc,
  onEditField,
}) => {
  const currencySymbol = '৳';
  const amountInWords = numberToWordsBengali(calc.grandTotal);
  const numFormat = (num: number) => toBengaliNumerals(formatMoney(num, ''));

  const clickProps = (fieldId: string, label = 'এডিট করতে ক্লিক করুন') => ({
    onClick: () => onEditField && onEditField(fieldId),
    title: `${label} ✏️`,
    className:
      'cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 rounded transition-all print:hover:bg-transparent print:hover:outline-none print:cursor-default',
  });

  return (
    <div className="bg-white text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-sky-400 rounded-lg shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      <div>
        {/* Top Header Section with Vertical Red Cash Memo Badge */}
        <div className="flex flex-col sm:flex-row items-stretch border-2 border-sky-500 rounded-xl overflow-hidden mb-3">
          {/* Left Red Vertical Pill */}
          <div className="bg-gradient-to-b from-red-600 via-rose-600 to-red-700 text-white font-black flex items-center justify-center p-2 sm:px-3 text-center tracking-widest text-xs sm:text-sm shrink-0 border-b-2 sm:border-b-0 sm:border-r-2 border-amber-300">
            <span className="writing-vertical rotate-180 sm:writing-mode-vertical">
              ক্যাশ মেমো
            </span>
          </div>

          {/* Central Blue Banner with Yellow Title */}
          <div className="flex-1 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 p-3 text-center sm:text-left flex flex-col justify-center">
            <h1
              {...clickProps('field-biz-name', 'ব্যবসার নাম এডিট করুন')}
              className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-sm tracking-wide"
            >
              {business.businessName || 'বিসমিল্লাহ্ ষ্টোর'}
            </h1>
            <p
              {...clickProps('field-biz-tagline', 'পণ্যের বিবরণ / স্লোগান এডিট করুন')}
              className="text-[11px] text-white/95 font-semibold mt-1"
            >
              {business.tagline || 'এখানে সকল প্রকার জুয়েলারী, কসমেটিক্স ও খেলনা সামগ্রী পাইকারী ও খুচরা বিক্রয় করা হয়।'}
            </p>
          </div>

          {/* Right Yellow Contact & Address Panel */}
          <div className="bg-amber-100 p-3 flex flex-col justify-center text-xs font-bold text-slate-800 border-t-2 sm:border-t-0 sm:border-l-2 border-amber-300 min-w-[180px]">
            <div {...clickProps('field-biz-owner', 'প্রোপ্রাইটরের নাম এডিট করুন')}>
              প্রোঃ {business.ownerName || 'মিজান'}
            </div>
            <div
              {...clickProps('field-biz-phone', 'মোবাইল নম্বর এডিট করুন')}
              className="text-blue-900 font-mono flex items-center gap-1 mt-0.5"
            >
              <span>📞</span> {toBengaliNumerals(business.phone || '০১৮৬৬-২৬১২১৩')}
            </div>
            <div
              {...clickProps('field-biz-address', 'ঠিকানা এডিট করুন')}
              className="text-[10px] text-slate-700 mt-1 leading-tight"
            >
              {business.businessAddress || 'সি-৩৬, সিটি সেন্টার, কেরানীহাট, সাতকানিয়া, চট্টগ্রাম।'}
            </div>
          </div>
        </div>

        {/* Customer Information Oval Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3 text-xs">
          {/* Serial / Memo No */}
          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span className="bg-amber-400 text-slate-900 font-extrabold px-3 py-0.5 rounded-full text-[11px] shrink-0 border border-amber-500">
              ক্রমিক নং-
            </span>
            <div
              {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}
              className="flex-1 border-2 border-sky-400 rounded-full font-mono font-bold text-slate-900 px-3 py-0.5"
            >
              {invoice.invoiceNumber}
            </div>
          </div>

          {/* Date */}
          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span className="bg-amber-400 text-slate-900 font-extrabold px-3 py-0.5 rounded-full text-[11px] shrink-0 border border-amber-500">
              তারিখ:-
            </span>
            <div
              {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}
              className="flex-1 border-2 border-sky-400 rounded-full font-mono font-bold text-slate-800 px-3 py-0.5"
            >
              {toBengaliNumerals(invoice.invoiceDate)}
            </div>
          </div>

          {/* Name */}
          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span className="bg-blue-700 text-white font-bold px-4 py-0.5 rounded-full text-[11px] shrink-0">
              নাম
            </span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="flex-1 border-2 border-sky-400 rounded-full font-bold text-slate-900 px-3 py-0.5 min-h-[26px]"
            >
              {invoice.customer.name || 'সম্মানিত ক্রেতা'}
            </div>
          </div>

          {/* Address */}
          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span className="bg-emerald-700 text-white font-bold px-4 py-0.5 rounded-full text-[11px] shrink-0">
              ঠিকানা
            </span>
            <div
              {...clickProps('field-cust-address', 'ঠিকানা এডিট করুন')}
              className="flex-1 border-2 border-sky-400 rounded-full text-slate-800 px-3 py-0.5 min-h-[26px]"
            >
              {invoice.customer.address || '—'}
            </div>
          </div>
        </div>

        {/* Cyan Rounded Table */}
        <div className="border-2 border-sky-400 rounded-xl overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-sky-600 to-blue-600 text-white text-[11px] sm:text-xs font-bold text-center">
                <th className="py-2 px-2 border-r border-sky-300 w-12">নং</th>
                <th className="py-2 px-4 border-r border-sky-300 text-left">বিবরণ</th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-2 px-3 border-r border-sky-300 w-28"
                >
                  পরিমাণ
                </th>
                <th className="py-2 px-4 w-32 text-right">টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-sky-50/50 transition">
                  <td className="py-2.5 px-2 text-center font-bold text-sky-800 border-r border-sky-200">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-2.5 px-3 border-r border-sky-200">
                    <div
                      {...clickProps(`field-item-name-${item.id}`, 'আইটেমের নাম এডিট করুন')}
                      className="font-bold text-slate-900"
                    >
                      {item.name || 'পণ্য / সেবা'}
                    </div>
                    {item.description && (
                      <div className="text-[10px] text-slate-500">{item.description}</div>
                    )}
                  </td>
                  <td
                    {...clickProps(`field-item-qty-${item.id}`, 'পরিমাণ পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-center font-mono font-bold border-r border-sky-200"
                  >
                    {toBengaliNumerals(item.quantity)} {item.unit !== 'piece' ? item.unit : ''}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'টাকা এডিট করুন')}
                    className="py-2.5 px-3 text-right font-mono font-bold text-slate-900"
                  >
                    {numFormat(item.lineTotal)}
                  </td>
                </tr>
              ))}

              {Array.from({ length: Math.max(0, 8 - invoice.items.length) }).map((_, i) => (
                <tr key={`pad-${i}`} className="h-8">
                  <td className="border-r border-sky-200"></td>
                  <td className="border-r border-sky-200"></td>
                  <td className="border-r border-sky-200"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
            {/* Total Row */}
            <tfoot>
              <tr className="bg-sky-600 text-white font-extrabold text-xs sm:text-sm">
                <td colSpan={2} className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-800 px-2.5 py-0.5 rounded text-[11px]">কথায়</span>
                    <span {...clickProps('field-in-words', 'কথায় টাকা এডিট করুন')} className="font-semibold text-xs cursor-pointer">{amountInWords}</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-right border-l border-sky-500">মোট</td>
                <td
                  {...clickProps('field-inv-paid-amount', 'হিসাব পরিবর্তন করুন')}
                  className="py-2 px-3 text-right font-mono font-black"
                >
                  {currencySymbol} {numFormat(calc.grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Due & Paid Sub-Card */}
        <div className="mt-2 flex justify-end gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-300">
            <span className="text-emerald-800">পরিশোধিত:</span>
            <span className="font-mono text-emerald-900">{currencySymbol} {numFormat(calc.paidAmount)}</span>
          </div>
          {calc.dueAmount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-lg border border-amber-300">
              <span className="text-amber-800">বকেয়া:</span>
              <span className="font-mono text-amber-900">{currencySymbol} {numFormat(calc.dueAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="pt-8 flex items-end justify-between text-xs font-bold text-slate-800">
        <div className="text-center">
          <div className="w-32 sm:w-40 border-t-2 border-slate-700 mx-auto mb-1" />
          <span>ক্রেতার স্বাক্ষর</span>
        </div>
        <div className="text-center">
          <div className="w-32 sm:w-40 border-t-2 border-slate-700 mx-auto mb-1" />
          <span>পক্ষে- {business.businessName || 'বিসমিল্লাহ্ ষ্টোর'}</span>
        </div>
      </div>
    </div>
  );
};
