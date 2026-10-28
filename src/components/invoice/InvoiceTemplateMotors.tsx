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

export const InvoiceTemplateMotors: React.FC<TemplateProps> = ({
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
    <div className="bg-white text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-emerald-600 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Right Vertical Cash Memo Banner */}
      <div className="absolute top-0 right-0 bg-fuchsia-700 text-white font-black py-4 px-2 text-[11px] rounded-bl-xl shadow-xs tracking-widest writing-vertical rotate-180 sm:writing-mode-vertical">
        ক্যাশ মেমো
      </div>

      <div>
        {/* Religious Line */}
        <div className="text-center pb-1">
          <span
            {...clickProps('field-biz-religious', 'ধর্মীয় বাণী এডিট করুন')}
            className="text-[11px] text-slate-600 font-bold"
          >
            {business.religiousHeader || 'বিসমিল্লাহির রাহমানির রাহিম'}
          </span>
        </div>

        {/* Dynamic Curved Header with Trucks & Logos */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-200 to-sky-200 p-3 rounded-2xl border border-amber-300 shadow-xs relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Vehicle Silhouette / Logo */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-bold text-lg shadow-xs">
                🚛
              </div>
              <div className="hidden sm:block text-[9px] font-bold text-slate-800">
                <div>TATA • EICHER</div>
                <div>ASHOK LEYLAND</div>
              </div>
            </div>

            {/* Central Business Name */}
            <div className="text-center flex-1">
              <h1
                {...clickProps('field-biz-name', 'ব্যবসার নাম এডিট করুন')}
                className="text-2xl sm:text-4xl font-black text-red-600 tracking-tight drop-shadow-xs"
              >
                {business.businessName || 'সায়াদ জেনুইন মটরস'}
              </h1>
              <div className="mt-1 flex items-center justify-center gap-3">
                <span
                  {...clickProps('field-biz-owner', 'প্রোপ্রাইটরের নাম এডিট করুন')}
                  className="bg-blue-800 text-white font-bold text-xs px-3 py-0.5 rounded-full"
                >
                  প্রোঃ {business.ownerName || 'মোঃ সোহেল'}
                </span>
                <span
                  {...clickProps('field-biz-phone', 'মোবাইল নম্বর এডিট করুন')}
                  className="font-mono font-bold text-slate-900 text-xs"
                >
                  📞 {toBengaliNumerals(business.phone || '০১৭০০০০০০০০')}
                </span>
              </div>
              <p
                {...clickProps('field-biz-tagline', 'পণ্যের বিবরণ / স্লোগান এডিট করুন')}
                className="text-[10px] text-slate-800 font-bold mt-1"
              >
                {business.tagline || 'টাটা, লিল্যান্ড ও আইসার গাড়ির সকল প্রকার জেনুইন পার্টস বিক্রেতা।'}
              </p>
            </div>
          </div>

          <div
            {...clickProps('field-biz-address', 'ঠিকানা এডিট করুন')}
            className="mt-2 bg-emerald-700 text-white text-center py-1 rounded-lg text-xs font-bold"
          >
            📍 {business.businessAddress || 'নওগাঁ বাইপাস মোড়, বশিপুর সান্তাহার।'}
          </div>
        </div>

        {/* Customer & Vehicle Info Grid */}
        <div className="bg-sky-50 border border-sky-300 rounded-xl p-3 my-3 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 shrink-0">তারিখ ঃ</span>
            <div
              {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}
              className="border-b border-slate-400 flex-1 font-mono font-bold text-slate-900 px-2"
            >
              {toBengaliNumerals(invoice.invoiceDate)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 shrink-0">ক্রমিক নং-</span>
            <div
              {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}
              className="border-b border-slate-400 flex-1 font-mono font-bold text-red-700 px-2"
            >
              {invoice.invoiceNumber}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 shrink-0">নাম ঃ</span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="border-b border-slate-400 flex-1 font-bold text-slate-900 px-2 min-h-[20px]"
            >
              {invoice.customer.name || 'সম্মানিত গ্রাহক'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 shrink-0">মোবাইল ঃ</span>
            <div
              {...clickProps('field-cust-phone', 'মোবাইল এডিট করুন')}
              className="border-b border-slate-400 flex-1 font-mono font-bold text-slate-900 px-2 min-h-[20px]"
            >
              {invoice.customer.phone ? toBengaliNumerals(invoice.customer.phone) : '—'}
            </div>
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <span className="font-bold text-slate-800 shrink-0">ঠিকানা ঃ</span>
            <div
              {...clickProps('field-cust-address', 'ঠিকানা এডিট করুন')}
              className="border-b border-slate-400 flex-1 text-slate-800 px-2 min-h-[20px]"
            >
              {invoice.customer.address || '—'}
            </div>
          </div>
        </div>

        {/* Yellow Header with Red Text Table */}
        <div className="border-2 border-emerald-600 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-yellow-400 text-red-700 text-[11px] sm:text-xs font-black text-center">
                <th className="py-2 px-4 border-r border-amber-500 text-left">বিবরণ</th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-2 px-3 border-r border-amber-500 w-24"
                >
                  পরিমাণ
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'দর এডিট করুন')}
                  className="py-2 px-3 border-r border-amber-500 w-24 text-right"
                >
                  দর
                </th>
                <th className="py-2 px-4 w-32 text-right">টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-200 text-xs">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/50 transition">
                  <td className="py-2.5 px-3 border-r border-sky-300">
                    <div
                      {...clickProps(`field-item-name-${item.id}`, 'আইটেমের নাম এডিট করুন')}
                      className="font-bold text-slate-900"
                    >
                      {item.name || 'পার্টস / মালামাল'}
                    </div>
                    {item.description && (
                      <div className="text-[10px] text-slate-500">{item.description}</div>
                    )}
                  </td>
                  <td
                    {...clickProps(`field-item-qty-${item.id}`, 'পরিমাণ পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-center font-mono font-bold border-r border-sky-300"
                  >
                    {toBengaliNumerals(item.quantity)} {item.unit !== 'piece' ? item.unit : ''}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'দর পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-right font-mono border-r border-sky-300"
                  >
                    {numFormat(item.unitPrice)}
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
                <tr key={`fill-${i}`} className="h-7">
                  <td className="border-r border-sky-300"></td>
                  <td className="border-r border-sky-300"></td>
                  <td className="border-r border-sky-300"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-emerald-600 bg-sky-50">
                <td colSpan={2} className="py-2 px-3 border-r border-sky-300">
                  <span className="font-bold text-slate-800">কথায় ঃ </span>
                  <span {...clickProps('field-in-words', 'কথায় টাকা এডিট করুন')} className="font-semibold text-xs cursor-pointer">{amountInWords}</span>
                </td>
                <td className="py-2 px-3 text-center font-black bg-emerald-700 text-white border-r border-emerald-700">
                  মোট=
                </td>
                <td
                  {...clickProps('field-inv-paid-amount', 'মোট টাকা এডিট করুন')}
                  className="py-2 px-3 text-right font-mono font-black text-slate-900 text-xs sm:text-sm bg-white"
                >
                  {currencySymbol} {numFormat(calc.grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Due / Paid Row */}
        <div className="mt-2 flex justify-end gap-3 text-xs font-bold">
          <div className="bg-emerald-50 border border-emerald-300 px-3 py-1 rounded">
            <span>জমা: {currencySymbol} {numFormat(calc.paidAmount)}</span>
          </div>
          {calc.dueAmount > 0 && (
            <div className="bg-rose-50 border border-rose-300 px-3 py-1 rounded text-rose-700">
              <span>বকেয়া: {currencySymbol} {numFormat(calc.dueAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Signatures & Green Footer Bar */}
      <div className="pt-6">
        <div className="flex items-end justify-between text-xs font-bold text-slate-800 pb-3">
          <div className="text-center">
            <div className="w-32 border-t border-slate-700 mx-auto mb-1" />
            <span>ক্রেতার স্বাক্ষর</span>
          </div>
          <div className="text-center">
            <div className="w-32 border-t border-slate-700 mx-auto mb-1" />
            <span>বিক্রেতার স্বাক্ষর</span>
          </div>
        </div>

        <div className="bg-emerald-700 h-2 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8" />
      </div>
    </div>
  );
};
