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

export const InvoiceTemplateGoldenGadhi: React.FC<TemplateProps> = ({
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
    <div className="bg-[#fefee2] text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-[#84cc16] shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Side Decorative Green Ribbons */}
      <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-emerald-600 via-lime-500 to-transparent opacity-80 pointer-events-none print:hidden" />
      <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-l from-emerald-600 via-lime-500 to-transparent opacity-80 pointer-events-none print:hidden" />

      <div>
        {/* Top Religious Line and Cash Memo Capsule */}
        <div className="flex items-center justify-between pb-1 border-b border-lime-300">
          <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white font-extrabold px-4 py-0.5 rounded-full text-[11px] shadow-xs">
            ক্যাশ মেমো...
          </div>
          <span
            {...clickProps('field-biz-religious', 'ধর্মীয় বাণী এডিট করুন')}
            className="text-[11px] text-slate-700 font-bold"
          >
            {business.religiousHeader || 'বিসমিল্লাহির রহমানির রহীম'}
          </span>
          <div
            {...clickProps('field-biz-phone', 'মোবাইল নম্বর এডিট করুন')}
            className="text-[11px] text-slate-700 font-mono font-bold"
          >
            মোবাঃ {toBengaliNumerals(business.phone || '০১৮২৩-৫৫৪৬২১')}
          </div>
        </div>

        {/* Business Title in Bold Red/Magenta */}
        <div className="text-center py-2">
          <h1
            {...clickProps('field-biz-name', 'ব্যবসার নাম এডিট করুন')}
            className="text-2xl sm:text-4xl font-black text-rose-700 tracking-tight drop-shadow-xs"
          >
            {business.businessName || 'সানজিতা সোনালী গদি হাউজ'}
          </h1>
          <p
            {...clickProps('field-biz-owner', 'প্রোপ্রাইটরের নাম এডিট করুন')}
            className="text-xs sm:text-sm font-extrabold text-teal-800 mt-0.5"
          >
            প্রোঃ {business.ownerName || 'মোঃ রাকিব হোসেন'}
          </p>
          <p
            {...clickProps('field-biz-tagline', 'পণ্যের বিবরণ / স্লোগান এডিট করুন')}
            className="text-[11px] text-slate-700 font-semibold mt-1 max-w-lg mx-auto"
          >
            {business.tagline || 'এখানে রেক্সিন, লেদার, ফোমের গদির বিভিন্ন মডেলের চেয়ার, সোফা সুলভ মূল্যে বিক্রয় করা হয়।'}
          </p>
          <div
            {...clickProps('field-biz-address', 'ঠিকানা এডিট করুন')}
            className="mt-1.5 inline-block bg-emerald-700 text-white text-[11px] font-bold px-4 py-0.5 rounded-full shadow-xs"
          >
            {business.businessAddress || 'থানা রোড, সাহার বাজার, সুলতান সুপার মার্কেট, দিনাজপুর।'}
          </div>
        </div>

        {/* Dotted Customer Info Lines */}
        <div className="my-3 space-y-1.5 text-xs text-slate-800 border-t border-b border-lime-300 py-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-slate-800 shrink-0">ক্রমিক নং-</span>
              <div
                {...clickProps('field-inv-number', 'ইনভয়েস নং এডিট করুন')}
                className="border-b border-dotted border-slate-600 flex-1 font-mono font-bold text-rose-700 px-2"
              >
                {invoice.invoiceNumber}
              </div>
            </div>
            <div className="flex items-center gap-2 w-48 sm:w-60">
              <span className="font-bold text-slate-800 shrink-0">তারিখ ঃ</span>
              <div
                {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}
                className="border-b border-dotted border-slate-600 flex-1 font-mono font-bold text-slate-900 px-2"
              >
                {toBengaliNumerals(invoice.invoiceDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 shrink-0">নাম ঃ</span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="border-b border-dotted border-slate-600 flex-1 font-bold text-slate-900 px-2 min-h-[22px]"
            >
              {invoice.customer.name || 'সম্মানিত খরিদ্দার'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 shrink-0">ঠিকানা ঃ</span>
            <div
              {...clickProps('field-cust-address', 'ঠিকানা এডিট করুন')}
              className="border-b border-dotted border-slate-600 flex-1 text-slate-800 px-2 min-h-[22px]"
            >
              {invoice.customer.address || '—'}
            </div>
          </div>
        </div>

        {/* Magenta Header Ledger Table */}
        <div className="border-2 border-fuchsia-900 rounded-lg overflow-hidden bg-white/90 relative">
          {/* Subtle Watermark inside table */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-6xl font-black text-rose-900 rotate-[-20deg]">
            ধন্যবাদ আবার আসবেন
          </div>

          <table className="w-full text-left border-collapse relative z-10">
            <thead>
              <tr className="bg-gradient-to-r from-purple-900 via-fuchsia-900 to-rose-900 text-white text-[11px] sm:text-xs font-bold text-center">
                <th className="py-2 px-2 border-r border-fuchsia-700 w-12">ক্র.নং</th>
                <th className="py-2 px-4 border-r border-fuchsia-700 text-left">বিবরণ</th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-2 px-3 border-r border-fuchsia-700 w-24"
                >
                  পরিমাণ
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'দর এডিট করুন')}
                  className="py-2 px-3 border-r border-fuchsia-700 w-24 text-right"
                >
                  দর
                </th>
                <th className="py-2 px-4 w-28 text-right">মোট টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-amber-50/50 transition">
                  <td className="py-2.5 px-2 text-center font-bold text-fuchsia-900 border-r border-purple-200">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-2.5 px-3 border-r border-purple-200">
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
                    className="py-2.5 px-3 text-center font-mono font-bold border-r border-purple-200"
                  >
                    {toBengaliNumerals(item.quantity)} {item.unit !== 'piece' ? item.unit : ''}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'দর পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-right font-mono border-r border-purple-200"
                  >
                    {numFormat(item.unitPrice)}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'মোট টাকা এডিট করুন')}
                    className="py-2.5 px-3 text-right font-mono font-bold text-slate-900"
                  >
                    {numFormat(item.lineTotal)}
                  </td>
                </tr>
              ))}

              {Array.from({ length: Math.max(0, 7 - invoice.items.length) }).map((_, i) => (
                <tr key={`fill-${i}`} className="h-8">
                  <td className="border-r border-purple-200"></td>
                  <td className="border-r border-purple-200"></td>
                  <td className="border-r border-purple-200"></td>
                  <td className="border-r border-purple-200"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Totals Box (Blue Headers) and In-Words */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 shrink-0">কথায়:</span>
              <div
                {...clickProps('field-in-words', 'কথায় টাকা এডিট করুন')}
                className="border-b border-dotted border-slate-700 flex-1 font-bold text-slate-900 text-xs px-2 py-0.5 cursor-pointer"
              >
                {amountInWords}
              </div>
            </div>
            {invoice.terms && (
              <div
                {...clickProps('field-inv-terms', 'শর্তাবলী এডিট করুন')}
                className="text-[11px] text-slate-600 bg-lime-100/60 p-2 rounded border border-lime-300"
              >
                {invoice.terms}
              </div>
            )}
          </div>

          {/* Right Ledger Summary (মোট=, জমা=, বাকী=) */}
          <div className="w-full sm:w-64 border border-blue-600 rounded-lg overflow-hidden bg-white shadow-xs">
            <div className="flex border-b border-blue-200">
              <span className="bg-blue-600 text-white font-bold px-3 py-1 text-xs w-20 text-center shrink-0">
                মোট=
              </span>
              <div
                {...clickProps('field-inv-paid-amount', 'হিসাব পরিবর্তন করুন')}
                className="flex-1 py-1 px-3 text-right font-mono font-black text-slate-900 text-xs"
              >
                {currencySymbol} {numFormat(calc.grandTotal)}
              </div>
            </div>

            <div className="flex border-b border-blue-200">
              <span className="bg-blue-600 text-white font-bold px-3 py-1 text-xs w-20 text-center shrink-0">
                জমা=
              </span>
              <div
                {...clickProps('field-inv-paid-amount', 'পরিশোধিত টাকা এডিট করুন')}
                className="flex-1 py-1 px-3 text-right font-mono font-bold text-emerald-700 text-xs"
              >
                {currencySymbol} {numFormat(calc.paidAmount)}
              </div>
            </div>

            <div className="flex">
              <span className="bg-blue-600 text-white font-bold px-3 py-1 text-xs w-20 text-center shrink-0">
                বাকী=
              </span>
              <div
                {...clickProps('field-inv-paid-amount', 'বকেয়া টাকা এডিট করুন')}
                className="flex-1 py-1 px-3 text-right font-mono font-bold text-rose-700 text-xs"
              >
                {currencySymbol} {numFormat(calc.dueAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Disclaimer & Signatures */}
      <div className="pt-6">
        <div className="text-center my-2">
          <span className="bg-rose-700 text-white font-bold text-xs px-6 py-1 rounded shadow-xs inline-block">
            বিক্রিত মাল ফেরত লওয়া হয় না।
          </span>
        </div>

        <div className="flex items-end justify-between text-xs font-bold text-slate-800 pt-4 border-t border-lime-400">
          <div className="text-center">
            <div className="w-32 sm:w-40 border-t border-slate-700 mx-auto mb-1" />
            <span>ক্রেতার স্বাক্ষর</span>
          </div>
          <div className="text-center">
            <div className="w-32 sm:w-40 border-t border-slate-700 mx-auto mb-1" />
            <span>বিক্রেতার স্বাক্ষর</span>
          </div>
        </div>
      </div>
    </div>
  );
};
