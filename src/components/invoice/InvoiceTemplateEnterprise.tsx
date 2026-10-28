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

export const InvoiceTemplateEnterprise: React.FC<TemplateProps> = ({
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
    <div className="bg-[#fffdf0] text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-2 border-slate-400 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      <div>
        {/* Top Religious & Contact Info */}
        <div className="flex items-center justify-between text-xs text-slate-800 pb-1">
          <div className="flex items-center gap-2">
            {/* Laurel Logo Badge */}
            <div
              {...clickProps('field-biz-name', 'লোগো ও প্রতিষ্ঠানের নাম এডিট করুন')}
              className="w-10 h-10 rounded-full border-2 border-emerald-600 flex items-center justify-center font-black text-rose-700 text-xs bg-amber-50 cursor-pointer shadow-2xs"
            >
              {business.logoUrl ? (
                <img src={business.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-full" />
              ) : (
                (business.businessName ? business.businessName.slice(0, 2).toUpperCase() : 'SE')
              )}
            </div>
            <div>
              <span
                {...clickProps('field-biz-religious', 'ধর্মীয় বাণী এডিট করুন')}
                className="font-semibold text-[11px] block text-slate-600"
              >
                {business.religiousHeader || 'বিসমিল্লাহির রাহমানির রাহিম'}
              </span>
              <span className="bg-blue-900 text-white font-extrabold text-[10px] px-3 py-0.5 rounded-full inline-block">
                ক্যাশ মেমো
              </span>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono font-bold text-slate-800">
            <div {...clickProps('field-biz-phone', 'মোবাইল নম্বর এডিট করুন')}>
              মোবা : {toBengaliNumerals(business.phone || '০১৭৪৩২২৪৭০০')}
            </div>
            {business.email && (
              <div
                {...clickProps('field-biz-email', 'ইমেইল এডিট করুন')}
                className="text-[10px] text-slate-600 font-normal"
              >
                {business.email}
              </div>
            )}
          </div>
        </div>

        {/* Business Title in Bold Forest Green with English Subtitle */}
        <div className="text-center py-1">
          <h1
            {...clickProps('field-biz-name', 'প্রতিষ্ঠানের নাম এডিট করুন')}
            className="text-2xl sm:text-3xl font-black text-emerald-800 tracking-tight"
          >
            {business.businessName || 'The MoSaFa ডিজিটাল আইটি সল্যুশন'}
          </h1>
          <p
            {...clickProps('field-biz-subtitle', 'সাবটাইটেল / ইংরেজি নাম এডিট করুন')}
            className="text-xs sm:text-sm font-extrabold text-slate-700 tracking-wider mt-0.5"
          >
            {business.subtitle || 'M/S SIAM ENTERPRISES'}
          </p>
          <p
            {...clickProps('field-biz-tagline', 'পণ্যের বিবরণ / স্লোগান এডিট করুন')}
            className="text-[10px] text-slate-600 mt-0.5 max-w-xl mx-auto"
          >
            {business.tagline || 'এখানে যাবতীয় পাইকারী ও খুচরা মালামাল এবং ডিজিটাল সেবা সুলভ মূল্যে প্রদান করা হয়।'}
          </p>
          <div
            {...clickProps('field-biz-address', 'ঠিকানা এডিট করুন')}
            className="text-[11px] font-bold text-slate-800 mt-0.5"
          >
            📍 {business.businessAddress || 'হাউজ #১২, রোড #৪, ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ'}
          </div>
        </div>

        {/* Customer Info Bars with Red & Blue Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 my-2 text-xs">
          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span className="bg-blue-900 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              নং-
            </span>
            <div
              {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}
              className="flex-1 border border-slate-400 font-mono font-bold text-slate-900 px-2 py-0.5 bg-white"
            >
              {invoice.invoiceNumber}
            </div>
          </div>

          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span className="bg-blue-900 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              তারিখঃ
            </span>
            <div
              {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}
              className="flex-1 border border-slate-400 font-mono font-bold text-slate-900 px-2 py-0.5 bg-white"
            >
              {toBengaliNumerals(invoice.invoiceDate)}
            </div>
          </div>

          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span className="bg-blue-900 text-white font-bold px-4 py-0.5 rounded text-[11px] shrink-0">
              নাম
            </span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="flex-1 border border-slate-400 font-bold text-slate-900 px-2 py-0.5 bg-white min-h-[24px]"
            >
              {invoice.customer.name || 'সম্মানিত খরিদ্দার'}
            </div>
          </div>

          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span className="bg-red-700 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              ঠিকানাঃ
            </span>
            <div
              {...clickProps('field-cust-address', 'ঠিকানা এডিট করুন')}
              className="flex-1 border border-red-500 font-medium text-slate-800 px-2 py-0.5 bg-white min-h-[24px]"
            >
              {invoice.customer.address || '—'}
            </div>
          </div>

          {invoice.customer.phone && (
            <div className="sm:col-span-12 flex items-center gap-1.5">
              <span className="bg-emerald-700 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
                মোবাইলঃ
              </span>
              <div
                {...clickProps('field-cust-phone', 'গ্রাহকের মোবাইল এডিট করুন')}
                className="flex-1 border border-emerald-500 font-mono font-bold text-slate-900 px-2 py-0.5 bg-white min-h-[24px]"
              >
                {toBengaliNumerals(invoice.customer.phone)}
              </div>
            </div>
          )}
        </div>

        {/* Traditional Orange-Gold Ledger Table */}
        <div className="border border-slate-500 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e67e22] text-white text-[11px] sm:text-xs font-black text-center">
                <th className="py-1 px-1 border-r border-amber-600 w-12">সংখ্যা</th>
                <th className="py-1 px-3 border-r border-amber-600 text-left">মালের বিবরণ</th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-1 px-2 border-r border-amber-600 w-20"
                >
                  পরিমান
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'দর এডিট করুন')}
                  className="py-1 px-2 border-r border-amber-600 w-20 text-right"
                >
                  দর
                </th>
                <th className="py-1 px-3 w-28 text-right">টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="h-7 hover:bg-amber-50/40 transition">
                  <td className="px-1 text-center font-bold text-slate-700 border-r border-slate-300">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="px-2 border-r border-slate-300">
                    <span
                      {...clickProps(`field-item-name-${item.id}`, 'আইটেমের নাম এডিট করুন')}
                      className="font-bold text-slate-900"
                    >
                      {item.name || 'মাল'}
                    </span>
                  </td>
                  <td
                    {...clickProps(`field-item-qty-${item.id}`, 'পরিমাণ পরিবর্তন করুন')}
                    className="px-2 text-center font-mono font-bold border-r border-slate-300"
                  >
                    {toBengaliNumerals(item.quantity)}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'দর পরিবর্তন করুন')}
                    className="px-2 text-right font-mono border-r border-slate-300"
                  >
                    {numFormat(item.unitPrice)}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'টাকা এডিট করুন')}
                    className="px-2 text-right font-mono font-bold text-slate-900"
                  >
                    {numFormat(item.lineTotal)}
                  </td>
                </tr>
              ))}

              {/* Pad rows up to 10 rows for full ledger sheet look */}
              {Array.from({ length: Math.max(0, 10 - invoice.items.length) }).map((_, i) => (
                <tr key={`pad-${i}`} className="h-6">
                  <td className="text-center text-slate-400 font-mono text-[10px] border-r border-slate-300">
                    {toBengaliNumerals(invoice.items.length + i + 1)}
                  </td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-700 bg-slate-50">
                <td colSpan={3} className="py-1 px-3 border-r border-slate-300 font-bold text-xs">
                  টাকা কথায়ঃ <span {...clickProps('field-in-words', 'কথায় টাকা এডিট করুন')} className="font-semibold text-slate-900">{amountInWords}</span>
                </td>
                <td className="py-1 px-2 text-center font-black bg-red-600 text-white border-r border-slate-300">
                  মোট-
                </td>
                <td
                  {...clickProps('field-inv-paid-amount', 'মোট টাকা এডিট করুন')}
                  className="py-1 px-3 text-right font-mono font-black text-slate-900 text-xs sm:text-sm bg-white"
                >
                  {currencySymbol} {numFormat(calc.grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Dealer Brand Logos and Signatures */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-600 border-t border-b border-slate-300 py-1">
          <span>ডিলারঃ</span>
          <span className="border border-red-600 px-2 py-0.5 rounded font-black text-red-600">RFL</span>
          <span className="border border-blue-900 px-2 py-0.5 rounded font-black text-blue-900">polymer</span>
          <span className="border border-emerald-700 px-2 py-0.5 rounded font-black text-emerald-800">ANWAR</span>
        </div>

        <div className="flex items-end justify-between text-xs font-bold text-slate-800">
          <div {...clickProps('field-inv-terms', 'স্বাক্ষর এডিট করুন')} className="text-center cursor-pointer">
            <div className="w-32 border-t border-slate-800 mx-auto mb-1" />
            <span>ক্রেতার স্বাক্ষর</span>
          </div>
          <div {...clickProps('field-inv-terms', 'স্বাক্ষর এডিট করুন')} className="text-center cursor-pointer">
            <div className="w-32 border-t border-slate-800 mx-auto mb-1" />
            <span>বিক্রেতার স্বাক্ষর</span>
          </div>
        </div>
      </div>
    </div>
  );
};
