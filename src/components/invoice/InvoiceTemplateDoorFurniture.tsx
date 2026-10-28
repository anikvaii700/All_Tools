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

export const InvoiceTemplateDoorFurniture: React.FC<TemplateProps> = ({
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
    <div className="bg-[#fafff0] text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-[#84cc16] rounded-xl shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Wooden Striped Side Border Accents */}
      <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-purple-600 via-amber-400 to-lime-500 opacity-60 pointer-events-none print:hidden" />
      <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-purple-600 via-amber-400 to-lime-500 opacity-60 pointer-events-none print:hidden" />

      <div>
        {/* Top Header: Cash Memo Capsule & Phone */}
        <div className="flex items-center justify-between pb-1 border-b border-lime-300">
          <span className="bg-emerald-600 text-white font-extrabold text-xs px-4 py-0.5 rounded-full shadow-xs">
            ক্যাশ মেমো
          </span>
          <div
            {...clickProps('field-biz-phone', 'মোবাইল নম্বর এডিট করুন')}
            className="text-[11px] font-mono font-bold text-purple-900 cursor-pointer"
          >
            মোবাইল- {toBengaliNumerals(business.phone || '০১৯১৬৪২২৪০৮')}
          </div>
        </div>

        {/* Business Title in Graceful Indigo Bengali */}
        <div className="text-center py-2">
          <h1
            {...clickProps('field-biz-name', 'ব্যবসার নাম এডিট করুন')}
            className="text-2xl sm:text-4xl font-black text-indigo-950 tracking-tight drop-shadow-xs"
          >
            {business.businessName || 'মদিনা ডোর এন্ড ফার্নিচার'}
          </h1>
          <p
            {...clickProps('field-biz-tagline', 'পণ্যের বিবরণ / স্লোগান এডিট করুন')}
            className="text-[11px] text-slate-800 font-bold mt-1"
          >
            {business.tagline || 'দেশী বিদেশী কাঠের দরজা ও চৌকাঠ পাওয়া যায়। সেগুন, বার্মাটিক সেগুন, গামারী মেহগনি, শিল কড়াই, টিক চাম্বল, ও লোহা কাঠের চৌকাঠ পাওয়া যায়।'}
          </p>
          <div
            {...clickProps('field-biz-address', 'ঠিকানা এডিট করুন')}
            className="text-xs font-bold text-emerald-800 mt-1"
          >
            {business.businessAddress || 'শনিরআখড়া ব্রীজ সংলগ্ন, ৩/৪নং রোডের মধ্যখানে, ঢাকা-১২৩৬'}
          </div>
        </div>

        {/* Customer Information Oval Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 my-2.5 text-xs">
          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span className="bg-emerald-600 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              নং
            </span>
            <div
              {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}
              className="flex-1 border-2 border-sky-400 rounded bg-white font-mono font-bold text-slate-900 px-2 py-0.5"
            >
              {invoice.invoiceNumber}
            </div>
          </div>

          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span className="bg-indigo-900 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              তারিখঃ
            </span>
            <div
              {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}
              className="flex-1 border-2 border-sky-400 rounded bg-white font-mono font-bold text-slate-900 px-2 py-0.5"
            >
              {toBengaliNumerals(invoice.invoiceDate)}
            </div>
          </div>

          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span className="bg-indigo-900 text-white font-bold px-4 py-0.5 rounded text-[11px] shrink-0">
              নাম
            </span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="flex-1 border-2 border-sky-400 rounded bg-white font-bold text-slate-900 px-2 py-0.5 min-h-[24px]"
            >
              {invoice.customer.name || 'সম্মানিত খরিদ্দার'}
            </div>
          </div>

          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span className="bg-fuchsia-800 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              ঠিকানা
            </span>
            <div
              {...clickProps('field-cust-address', 'ঠিকানা এডিট করুন')}
              className="flex-1 border-2 border-sky-400 rounded bg-white text-slate-800 px-2 py-0.5 min-h-[24px]"
            >
              {invoice.customer.address || '—'}
            </div>
          </div>
        </div>

        {/* Orange & Purple Rounded Pill Column Table */}
        <div className="border-2 border-slate-700 rounded-xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-white text-[11px] sm:text-xs font-black text-center">
                <th className="py-2 px-2 bg-orange-600 border-r border-orange-500 w-12">সংখ্যা</th>
                <th className="py-2 px-4 bg-indigo-800 border-r border-indigo-700 text-left">মালের বিবরণ</th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-2 px-3 bg-red-600 border-r border-red-500 w-24"
                >
                  পরিমাণ
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'দর এডিট করুন')}
                  className="py-2 px-3 bg-indigo-800 border-r border-indigo-700 w-24 text-right"
                >
                  দর
                </th>
                <th className="py-2 px-4 bg-orange-600 w-32 text-right">টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-300 bg-lime-50/20">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300">
                    <div
                      {...clickProps(`field-item-name-${item.id}`, 'আইটেমের নাম এডিট করুন')}
                      className="font-bold text-slate-900"
                    >
                      {item.name || 'দরজা / ফার্নিচার'}
                    </div>
                    {item.description && (
                      <div className="text-[10px] text-slate-500">{item.description}</div>
                    )}
                  </td>
                  <td
                    {...clickProps(`field-item-qty-${item.id}`, 'পরিমাণ পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-center font-mono font-bold bg-purple-50/40 border-r border-slate-300"
                  >
                    {toBengaliNumerals(item.quantity)} {item.unit !== 'piece' ? item.unit : ''}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'দর পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-right font-mono bg-lime-50/30 border-r border-slate-300"
                  >
                    {numFormat(item.unitPrice)}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'টাকা এডিট করুন')}
                    className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 bg-purple-50/20"
                  >
                    {numFormat(item.lineTotal)}
                  </td>
                </tr>
              ))}

              {Array.from({ length: Math.max(0, 7 - invoice.items.length) }).map((_, i) => (
                <tr key={`fill-${i}`} className="h-8">
                  <td className="border-r border-slate-300 bg-lime-50/10"></td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300 bg-purple-50/20"></td>
                  <td className="border-r border-slate-300 bg-lime-50/10"></td>
                  <td className="bg-purple-50/10"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pill Shaped Totals Box */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-sky-500 text-white font-bold px-3 py-1 rounded-full text-[11px] shrink-0">
                টাকা কথায়
              </span>
              <div
                {...clickProps('field-in-words', 'কথায় টাকা এডিট করুন')}
                className="border-2 border-sky-300 rounded-full flex-1 font-bold text-slate-900 text-xs px-3 py-0.5 bg-white cursor-pointer"
              >
                {amountInWords}
              </div>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-20 bg-purple-600 text-white font-bold py-1 rounded-full text-xs text-center shrink-0">
                মোট
              </span>
              <div
                {...clickProps('field-inv-paid-amount', 'মোট টাকা এডিট করুন')}
                className="flex-1 border-2 border-purple-400 rounded-full py-1 px-3 text-right font-mono font-black text-slate-900 text-xs bg-white"
              >
                {currencySymbol} {numFormat(calc.grandTotal)}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-20 bg-amber-500 text-white font-bold py-1 rounded-full text-xs text-center shrink-0">
                অগ্রীম
              </span>
              <div
                {...clickProps('field-inv-paid-amount', 'পরিশোধিত টাকা এডিট করুন')}
                className="flex-1 border-2 border-amber-400 rounded-full py-1 px-3 text-right font-mono font-bold text-emerald-700 text-xs bg-white"
              >
                {currencySymbol} {numFormat(calc.paidAmount)}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-20 bg-rose-600 text-white font-bold py-1 rounded-full text-xs text-center shrink-0">
                বাকী
              </span>
              <div
                {...clickProps('field-inv-paid-amount', 'বকেয়া টাকা এডিট করুন')}
                className="flex-1 border-2 border-rose-400 rounded-full py-1 px-3 text-right font-mono font-bold text-rose-700 text-xs bg-white"
              >
                {currencySymbol} {numFormat(calc.dueAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Tagline and Signatures */}
      <div className="pt-4">
        <div className="text-center space-y-1">
          <p className="text-[11px] text-slate-700 font-semibold italic">
            কথায় এবং কাজে মিল রাখার নির্ভরযোগ্য একটি প্রতিষ্ঠান
          </p>
          <span className="bg-emerald-700 text-white font-bold text-xs px-6 py-0.5 rounded-full inline-block shadow-xs">
            বিঃদ্রঃ বিক্রিত মাল ফেরত নেওয়া হয়।
          </span>
        </div>

        <div className="flex items-end justify-between text-xs font-bold text-slate-800 pt-4 border-t border-lime-400 mt-2">
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
