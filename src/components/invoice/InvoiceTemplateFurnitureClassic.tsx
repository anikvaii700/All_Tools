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

export const InvoiceTemplateFurnitureClassic: React.FC<TemplateProps> = ({
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
    <div className="bg-[#fff6ee] text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-[#fb923c] rounded-xl shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Right Diamond Red Cash Memo Ribbon */}
      <div className="absolute top-0 right-3 bg-red-600 text-white font-black py-2 px-3 text-xs shadow-md rounded-b-xl border-b-2 border-amber-300">
        ক্যাশ মেমো
      </div>

      <div>
        {/* Business Title in Classic Calligraphic Bengali Red */}
        <div className="text-center pt-2 pb-2">
          <h1
            {...clickProps('field-biz-name', 'ব্যবসার নাম এডিট করুন')}
            className="text-2xl sm:text-4xl font-black text-red-600 tracking-tight drop-shadow-xs"
          >
            {business.businessName || 'মায়ের দোয়া জান্নাত ফার্নিচার'}
          </h1>
          <div
            {...clickProps('field-biz-owner', 'প্রোপাইটর এডিট করুন')}
            className="inline-block bg-sky-500 text-white font-bold text-xs px-4 py-0.5 rounded-full mt-1"
          >
            প্রোপাইটর ঃ {business.ownerName || 'মোঃ জসিম'}
          </div>
          <p
            {...clickProps('field-biz-address', 'ঠিকানা এডিট করুন')}
            className="text-xs text-slate-700 mt-1"
          >
            {business.businessAddress || 'পুরাতন কন্ট্রোল্যের মোড়, বায়তুল শরফ মসজিদের পাশে, দক্ষিণ পতেঙ্গা, চট্টগ্রাম।'}
          </p>

          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between bg-lime-600 text-white px-4 py-1 rounded-lg text-xs font-bold gap-2">
            <span {...clickProps('field-biz-tagline', 'পণ্যের বিবরণ / স্লোগান এডিট করুন')}>
              {business.tagline || 'এখানে উন্নত মানের কাঠের ফার্নিচার বিক্রয় ও নকশা করা হয়।'}
            </span>
            <span
              {...clickProps('field-biz-phone', 'মোবাইল নম্বর এডিট করুন')}
              className="font-mono cursor-pointer"
            >
              মোবাঃ {toBengaliNumerals(business.phone || '০১৭৭৭-০৭০৪৬৬')}
            </span>
          </div>
        </div>

        {/* Customer Information Grid with Colored Labels */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 my-3 text-xs">
          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span className="bg-purple-800 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              নং-
            </span>
            <div
              {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}
              className="flex-1 border border-slate-300 bg-white font-mono font-bold text-slate-900 px-2 py-0.5 rounded"
            >
              {invoice.invoiceNumber}
            </div>
          </div>

          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span className="bg-emerald-700 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              তারিখ
            </span>
            <div
              {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}
              className="flex-1 border border-slate-300 bg-white font-mono font-bold text-slate-900 px-2 py-0.5 rounded"
            >
              {toBengaliNumerals(invoice.invoiceDate)}
            </div>
          </div>

          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span className="bg-emerald-700 text-white font-bold px-4 py-0.5 rounded text-[11px] shrink-0">
              নাম
            </span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="flex-1 border border-slate-300 bg-white font-bold text-slate-900 px-2 py-0.5 rounded min-h-[24px]"
            >
              {invoice.customer.name || 'সম্মানিত ক্রেতা'}
            </div>
          </div>

          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span className="bg-emerald-700 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              ঠিকানা
            </span>
            <div
              {...clickProps('field-cust-address', 'ঠিকানা এডিট করুন')}
              className="flex-1 border border-slate-300 bg-white text-slate-800 px-2 py-0.5 rounded min-h-[24px]"
            >
              {invoice.customer.address || '—'}
            </div>
          </div>
        </div>

        {/* Dual Orange & Cyan Header Table with Pastel Column Tint */}
        <div className="border-2 border-slate-700 rounded-lg overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-white text-[11px] sm:text-xs font-black text-center">
                <th className="py-2 px-2 bg-sky-500 border-r border-sky-400 w-12">ক্রম</th>
                <th className="py-2 px-4 bg-amber-500 border-r border-amber-400 text-left">বিবরণ</th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'দর এডিট করুন')}
                  className="py-2 px-3 bg-sky-500 border-r border-sky-400 w-24 text-right"
                >
                  দর
                </th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-2 px-3 bg-amber-500 border-r border-amber-400 w-24"
                >
                  পরিমাণ
                </th>
                <th className="py-2 px-4 bg-sky-500 w-32 text-right">টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-amber-50/50 transition">
                  <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-300">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300">
                    <div
                      {...clickProps(`field-item-name-${item.id}`, 'আইটেমের নাম এডিট করুন')}
                      className="font-bold text-slate-900"
                    >
                      {item.name || 'ফার্নিচার আইটেম'}
                    </div>
                    {item.description && (
                      <div className="text-[10px] text-slate-500">{item.description}</div>
                    )}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'দর পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-right font-mono bg-sky-50/30 border-r border-slate-300"
                  >
                    {numFormat(item.unitPrice)}
                  </td>
                  <td
                    {...clickProps(`field-item-qty-${item.id}`, 'পরিমাণ পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-center font-mono font-bold bg-amber-50/30 border-r border-slate-300"
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

              {Array.from({ length: Math.max(0, 7 - invoice.items.length) }).map((_, i) => (
                <tr key={`fill-${i}`} className="h-8">
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300 bg-sky-50/20"></td>
                  <td className="border-r border-slate-300 bg-amber-50/20"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Words and Advance/Due/Total Card */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 shrink-0">কথায় ঃ</span>
              <div
                {...clickProps('field-in-words', 'কথায় টাকা এডিট করুন')}
                className="border-b border-dotted border-slate-700 flex-1 font-bold text-slate-900 text-xs px-2 py-0.5 cursor-pointer"
              >
                {amountInWords}
              </div>
            </div>
            {invoice.notes && (
              <div
                {...clickProps('field-inv-notes', 'নোট এডিট করুন')}
                className="bg-amber-100/50 p-2 rounded text-[11px] text-slate-700 border border-amber-200"
              >
                {invoice.notes}
              </div>
            )}
          </div>

          {/* Right Advance, Due, Total Box */}
          <div className="w-full sm:w-60 border border-slate-600 rounded-lg overflow-hidden bg-white shadow-xs text-xs">
            <div className="flex border-b border-slate-300">
              <span className="w-20 p-1.5 font-bold text-slate-800 border-r border-slate-300 bg-slate-100 text-center">
                অগ্রিম
              </span>
              <span
                {...clickProps('field-inv-paid-amount', 'পরিশোধিত টাকা এডিট করুন')}
                className="flex-1 p-1.5 text-right font-mono font-bold text-emerald-700"
              >
                {currencySymbol} {numFormat(calc.paidAmount)}
              </span>
            </div>
            <div className="flex border-b border-slate-300">
              <span className="w-20 p-1.5 font-bold text-slate-800 border-r border-slate-300 bg-slate-100 text-center">
                বাকী
              </span>
              <span
                {...clickProps('field-inv-paid-amount', 'বকেয়া টাকা এডিট করুন')}
                className="flex-1 p-1.5 text-right font-mono font-bold text-rose-700"
              >
                {currencySymbol} {numFormat(calc.dueAmount)}
              </span>
            </div>
            <div className="flex bg-amber-50">
              <span className="w-20 p-1.5 font-black text-slate-900 border-r border-slate-300 bg-amber-200 text-center">
                মোট
              </span>
              <span
                {...clickProps('field-inv-paid-amount', 'মোট টাকা এডিট করুন')}
                className="flex-1 p-1.5 text-right font-mono font-black text-slate-900 text-sm"
              >
                {currencySymbol} {numFormat(calc.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="pt-8 flex items-end justify-between text-xs font-bold text-slate-800 border-t border-orange-300 mt-4">
        <div className="text-center">
          <div className="w-32 sm:w-40 border-t border-slate-700 mx-auto mb-1" />
          <span>ক্রেতার স্বাক্ষর</span>
        </div>
        <div className="text-center">
          <div className="w-36 sm:w-48 border-t border-slate-700 mx-auto mb-1" />
          <span>পক্ষে ঃ {business.businessName || 'মায়ের দোয়া জান্নাত ফার্নিচার'}</span>
        </div>
      </div>
    </div>
  );
};
