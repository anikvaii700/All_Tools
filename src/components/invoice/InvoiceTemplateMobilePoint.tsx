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

export const InvoiceTemplateMobilePoint: React.FC<TemplateProps> = ({
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
    <div className="bg-gradient-to-b from-sky-50 via-white to-sky-50 text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-sky-400 rounded-xl shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      <div>
        {/* Top Header Row with Brand Badges and Title */}
        <div className="relative border-b-2 border-sky-500 pb-3">
          {/* Top Corner Cash Memo Pill */}
          <div className="absolute top-0 right-0">
            <div className="bg-amber-400 text-slate-900 font-black px-4 py-1.5 rounded-bl-2xl shadow-xs text-xs sm:text-sm tracking-wide border-l border-b border-amber-500">
              ক্যাশ মেমো
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            {/* Left Brand Pills / Logo */}
            <div className="flex sm:flex-col items-center gap-1 shrink-0">
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt="Logo"
                  className="w-14 h-14 object-contain rounded-xl border border-sky-300 bg-white p-1"
                />
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-2 gap-1 text-[9px] font-bold">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-center">vivo</span>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-center">oppo</span>
                  <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-center">mi</span>
                  <span className="bg-yellow-500 text-slate-900 px-1.5 py-0.5 rounded text-center">realme</span>
                  <span className="bg-blue-800 text-white px-1.5 py-0.5 rounded text-center">SAMSUNG</span>
                  <span className="bg-red-600 text-white px-1 py-0.5 rounded text-center">1+</span>
                </div>
              )}
            </div>

            {/* Central Main Business Title */}
            <div className="flex-1 text-center">
              <div className="inline-block bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 text-white px-6 py-2 rounded-2xl shadow-md border-2 border-white">
                <h1
                  {...clickProps('field-biz-name', 'ব্যবসার নাম এডিট করুন')}
                  className="text-xl sm:text-3xl font-black tracking-tight drop-shadow-xs"
                >
                  {business.businessName || 'ফাস্ট মোবাইল পয়েন্ট'}
                </h1>
                <p
                  {...clickProps('field-biz-subtitle', 'সাবটাইটেল এডিট করুন')}
                  className="text-[11px] text-sky-100 font-bold tracking-wider mt-0.5"
                >
                  {business.subtitle || 'কোম্পানির অনুমোদিত শো-রুম'}
                </p>
              </div>

              {/* Owner & Phone Row */}
              <div className="flex items-center justify-center gap-4 mt-2 text-xs font-black text-rose-700">
                <span {...clickProps('field-biz-owner', 'প্রোপ্রাইটরের নাম এডিট করুন')}>
                  ➤ প্রোঃ {business.ownerName || 'তিতাস সরকার'} ◄
                </span>
                <span
                  {...clickProps('field-biz-phone', 'মোবাইল নম্বর এডিট করুন')}
                  className="flex items-center gap-1 text-slate-800"
                >
                  <span className="text-rose-600">📞</span> {toBengaliNumerals(business.phone || '০১৮১৭-৫৭৮০০৮০')}
                </span>
              </div>

              {/* Services Tagline */}
              <div
                {...clickProps('field-biz-tagline', 'পণ্যের বিবরণ / স্লোগান এডিট করুন')}
                className="mt-1.5 inline-block bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-[10px] sm:text-xs px-4 py-0.5 rounded-full shadow-xs"
              >
                {business.tagline || 'এখানে মোবাইল সার্ভিসিং সহ মোবাইলের সকল ধরনের কাঙ্ক্ষিত সেবা পেয়ে যাবেন।'}
              </div>
            </div>
          </div>

          {/* Cyan Address Bar */}
          <div
            {...clickProps('field-biz-address', 'ঠিকানা এডিট করুন')}
            className="mt-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-center py-1 px-3 rounded-lg text-xs font-semibold shadow-xs"
          >
            <span>📍 {business.businessAddress || 'বরুড়া চান্দিনা রোড, গপি সড়কের রাস্তার মাথায়, বরুড়া, কুমিল্লা।'}</span>
          </div>
        </div>

        {/* Customer Information Badges Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 my-3 text-xs">
          {/* Customer Name */}
          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span className="bg-red-700 text-white font-bold px-2.5 py-1 rounded-md text-[11px] shrink-0">
              নাম:
            </span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="flex-1 border-b-2 border-sky-400 font-bold text-slate-900 px-2 py-0.5 min-h-[26px]"
            >
              {invoice.customer.name || 'সম্মানিত ক্রেতা'}
            </div>
          </div>

          {/* Date */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <span className="bg-emerald-700 text-white font-bold px-2 py-1 rounded-md text-[11px] shrink-0">
              তাং:
            </span>
            <div
              {...clickProps('field-inv-date', 'চালানের তারিখ এডিট করুন')}
              className="flex-1 border-b-2 border-sky-400 font-mono font-bold text-slate-800 px-2 py-0.5 min-h-[26px]"
            >
              {toBengaliNumerals(invoice.invoiceDate)}
            </div>
          </div>

          {/* Serial / Invoice Number */}
          <div className="sm:col-span-3 flex items-center gap-1.5">
            <span className="bg-purple-800 text-white font-bold px-2 py-1 rounded-md text-[11px] shrink-0">
              ক্রমিক নং
            </span>
            <div
              {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}
              className="flex-1 border-b-2 border-sky-400 font-mono font-extrabold text-red-600 px-2 py-0.5 min-h-[26px]"
            >
              {invoice.invoiceNumber}
            </div>
          </div>

          {/* Customer Address */}
          <div className="sm:col-span-7 flex items-center gap-1.5">
            <span className="bg-emerald-700 text-white font-bold px-2 py-1 rounded-md text-[11px] shrink-0">
              ঠিকানা:
            </span>
            <div
              {...clickProps('field-cust-address', 'ঠিকানা এডিট করুন')}
              className="flex-1 border-b-2 border-sky-400 font-medium text-slate-800 px-2 py-0.5 min-h-[26px]"
            >
              {invoice.customer.address || '—'}
            </div>
          </div>

          {/* Customer Mobile */}
          <div className="sm:col-span-5 flex items-center gap-1.5">
            <span className="bg-blue-700 text-white font-bold px-2 py-1 rounded-md text-[11px] shrink-0">
              মোবাইল:
            </span>
            <div
              {...clickProps('field-cust-phone', 'মোবাইল নম্বর এডিট করুন')}
              className="flex-1 border-b-2 border-sky-400 font-mono font-bold text-slate-900 px-2 py-0.5 min-h-[26px]"
            >
              {invoice.customer.phone ? toBengaliNumerals(invoice.customer.phone) : '—'}
            </div>
          </div>
        </div>

        {/* Rounded Column Blue Outline Table */}
        <div className="border-2 border-sky-500 rounded-xl overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900 via-sky-700 to-blue-900 text-white text-[11px] sm:text-xs font-bold text-center">
                <th className="py-2 px-2 border-r border-sky-400 w-12">ক্র.নং</th>
                <th className="py-2 px-4 border-r border-sky-400 text-left">বিবরণ</th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-2 px-3 border-r border-sky-400 w-24"
                >
                  পরিমাপ
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'দর এডিট করুন')}
                  className="py-2 px-3 border-r border-sky-400 w-24 text-right"
                >
                  দর
                </th>
                <th className="py-2 px-4 w-28 text-right">টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-sky-50/40 transition">
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
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.description}</div>
                    )}
                  </td>
                  <td
                    {...clickProps(`field-item-qty-${item.id}`, 'পরিমাণ পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-center font-mono font-bold border-r border-sky-200"
                  >
                    {toBengaliNumerals(item.quantity)} {item.unit !== 'piece' ? item.unit : ''}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'একক দর পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-right font-mono border-r border-sky-200"
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

              {/* Empty placeholder rows to fill height */}
              {Array.from({ length: Math.max(0, 6 - invoice.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-8">
                  <td className="border-r border-sky-200"></td>
                  <td className="border-r border-sky-200"></td>
                  <td className="border-r border-sky-200"></td>
                  <td className="border-r border-sky-200"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Calculations and Totals with Pill Badges */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch justify-between gap-3">
          {/* Left In-Words and Notes */}
          <div className="flex-1 flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-600 text-white font-bold px-3 py-1 rounded-md text-[11px] shrink-0">
                কথায়:
              </span>
              <div
                {...clickProps('field-in-words', 'কথায় টাকা এডিট করুন')}
                className="border-b-2 border-sky-300 flex-1 font-bold text-slate-800 text-xs px-2 py-0.5 cursor-pointer"
              >
                {amountInWords}
              </div>
            </div>

            {invoice.notes && (
              <div
                {...clickProps('field-inv-notes', 'নোট এডিট করুন')}
                className="bg-sky-50 border border-sky-200 rounded-lg p-2 text-[11px] text-slate-700"
              >
                <span className="font-bold text-sky-900">নোট:</span> {invoice.notes}
              </div>
            )}
          </div>

          {/* Right Calculations (মোট, জমা, বাকী) */}
          <div className="w-full sm:w-64 space-y-1.5">
            {/* Grand Total */}
            <div className="flex items-center gap-1.5">
              <span className="bg-emerald-600 text-white font-bold px-4 py-1 rounded-lg text-xs w-20 text-center shrink-0">
                মোট-
              </span>
              <div
                {...clickProps('field-inv-paid-amount', 'হিসাব পরিবর্তন করুন')}
                className="flex-1 bg-sky-50 border border-sky-300 rounded-lg py-1 px-3 text-right font-mono font-black text-slate-900 text-sm"
              >
                {currencySymbol} {numFormat(calc.grandTotal)}
              </div>
            </div>

            {/* Paid Amount */}
            <div className="flex items-center gap-1.5">
              <span className="bg-red-600 text-white font-bold px-4 py-1 rounded-lg text-xs w-20 text-center shrink-0">
                জমা-
              </span>
              <div
                {...clickProps('field-inv-paid-amount', 'পরিশোধিত টাকা এডিট করুন')}
                className="flex-1 bg-rose-50 border border-rose-300 rounded-lg py-1 px-3 text-right font-mono font-bold text-rose-700 text-sm"
              >
                {currencySymbol} {numFormat(calc.paidAmount)}
              </div>
            </div>

            {/* Due Amount */}
            <div className="flex items-center gap-1.5">
              <span className="bg-blue-600 text-white font-bold px-4 py-1 rounded-lg text-xs w-20 text-center shrink-0">
                বাকী-
              </span>
              <div
                {...clickProps('field-inv-paid-amount', 'বকেয়া টাকা এডিট করুন')}
                className="flex-1 bg-amber-50 border border-amber-300 rounded-lg py-1 px-3 text-right font-mono font-bold text-amber-900 text-sm"
              >
                {currencySymbol} {numFormat(calc.dueAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="pt-8 border-t border-sky-300 flex items-end justify-between text-xs font-bold text-slate-700">
        <div className="text-center">
          <div className="w-32 sm:w-40 border-t-2 border-slate-700 mx-auto mb-1" />
          <span>ক্রেতার স্বাক্ষর</span>
        </div>
        <div className="text-center">
          <div className="w-32 sm:w-40 border-t-2 border-slate-700 mx-auto mb-1" />
          <span>বিক্রেতার স্বাক্ষর</span>
        </div>
      </div>
    </div>
  );
};
