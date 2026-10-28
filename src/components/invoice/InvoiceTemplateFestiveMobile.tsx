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

export const InvoiceTemplateFestiveMobile: React.FC<TemplateProps> = ({
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

  // Generate colorful triangles for festive bunting borders on left and right edges
  const buntingColors = [
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
  ];

  return (
    <div className="bg-white text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-blue-900 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none overflow-hidden">
      {/* Left Festive Triangular Bunting Border */}
      <div className="absolute top-0 bottom-0 left-0 w-3.5 flex flex-col pointer-events-none print:hidden overflow-hidden">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={`left-tri-${i}`}
            className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px]"
            style={{ borderLeftColor: buntingColors[i % buntingColors.length] }}
          />
        ))}
      </div>

      {/* Right Festive Triangular Bunting Border */}
      <div className="absolute top-0 bottom-0 right-0 w-3.5 flex flex-col pointer-events-none print:hidden overflow-hidden">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={`right-tri-${i}`}
            className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[14px]"
            style={{ borderRightColor: buntingColors[i % buntingColors.length] }}
          />
        ))}
      </div>

      <div className="px-2">
        {/* Top Navy Blue Capsule Banner: ক্যাশ মেমো */}
        <div className="text-center pb-2">
          <span className="bg-blue-900 text-white font-black text-xs sm:text-sm px-8 py-1 rounded-full shadow-xs tracking-wider inline-block">
            ক্যাশ মেমো
          </span>
        </div>

        {/* Dynamic Curved Red Header with Black Central Badge */}
        <div className="bg-red-600 rounded-3xl p-3 sm:p-4 text-white shadow-md relative flex flex-col sm:flex-row items-center justify-between gap-3 border-2 border-white">
          {/* Left Phone Info */}
          <div
            {...clickProps('field-biz-phone', 'মোবাইল নম্বর এডিট করুন')}
            className="text-center sm:text-left text-xs font-mono font-bold space-y-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <span>☎️</span> {toBengaliNumerals(business.phone || '+৮৮০ ১৭১২-৩৪৫৬৭৮')}
            </div>
          </div>

          {/* Center Black Circle Title Badge */}
          <div
            {...clickProps('field-biz-name', 'ব্যবসার নাম এডিট করুন')}
            className="bg-black text-white rounded-full w-28 h-28 sm:w-32 sm:h-32 flex flex-col items-center justify-center p-2 text-center shadow-lg border-2 border-yellow-400 shrink-0 cursor-pointer"
          >
            <span className="text-xl sm:text-2xl font-black text-yellow-400 tracking-tight leading-tight">
              {business.businessName ? business.businessName.split(' ')[0] : 'এমরান'}
            </span>
            <span className="text-[10px] sm:text-xs text-white font-bold mt-0.5">
              {business.businessName && business.businessName.split(' ').length > 1
                ? business.businessName.split(' ').slice(1).join(' ')
                : 'মোবাইল সার্ভিসিং'}
            </span>
          </div>

          {/* Right Address Location */}
          <div
            {...clickProps('field-biz-address', 'ঠিকানা এডিট করুন')}
            className="text-center sm:text-right text-xs space-y-0.5 max-w-[180px] cursor-pointer"
          >
            <div className="text-yellow-300 font-bold flex items-center justify-center sm:justify-end gap-1">
              <span>📍</span> <span>ঠিকানা</span>
            </div>
            <p className="text-[11px] leading-tight text-white/95">
              {business.businessAddress || 'এলাহাবাদ ব্যাংকের নীচে, সাহুড়া, বুড়ারী বাজার, পূর্ব মেদিনীপুর'}
            </p>
          </div>
        </div>

        {/* Proprietor Navy Pill */}
        <div className="text-center mt-2.5">
          <span className="bg-blue-900 text-white font-black text-xs px-6 py-1 rounded-full shadow-xs inline-block">
            {business.ownerName ? `প্রোঃ ${business.ownerName}` : 'প্রোঃ রঞ্জন অধিকারী'}
          </span>
        </div>

        {/* Customer Information Dotted Rows */}
        <div className="my-2.5 space-y-1.5 text-xs text-slate-800 border-b border-slate-300 pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="font-bold text-slate-900 shrink-0">নং</span>
              <div
                {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}
                className="border-b border-dotted border-blue-900 flex-1 font-mono font-bold text-red-600 px-2"
              >
                {invoice.invoiceNumber}
              </div>
            </div>
            <div className="flex items-center gap-1.5 w-48 sm:w-60">
              <span className="font-bold text-slate-900 shrink-0">তারিখ -</span>
              <div
                {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}
                className="border-b border-dotted border-blue-900 flex-1 font-mono font-bold text-slate-900 px-2"
              >
                {toBengaliNumerals(invoice.invoiceDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="font-bold text-slate-900 shrink-0">নাম -</span>
              <div
                {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
                className="border-b border-dotted border-blue-900 flex-1 font-bold text-slate-900 px-2 min-h-[20px]"
              >
                {invoice.customer.name || 'সম্মানিত ক্রেতা'}
              </div>
            </div>
            <div className="flex items-center gap-1.5 w-48 sm:w-60">
              <span className="font-bold text-slate-900 shrink-0">মোবাইল -</span>
              <div
                {...clickProps('field-cust-phone', 'মোবাইল নম্বর এডিট করুন')}
                className="border-b border-dotted border-blue-900 flex-1 font-mono font-bold text-slate-900 px-2 min-h-[20px]"
              >
                {invoice.customer.phone ? toBengaliNumerals(invoice.customer.phone) : '—'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 shrink-0">ঠিকানা -</span>
            <div
              {...clickProps('field-cust-address', 'ঠিকানা এডিট করুন')}
              className="border-b border-dotted border-blue-900 flex-1 text-slate-800 px-2 min-h-[20px]"
            >
              {invoice.customer.address || '—'}
            </div>
          </div>
        </div>

        {/* Green Services Ribbon */}
        <div className="bg-emerald-600 text-white text-center py-1 px-3 rounded-lg text-[11px] font-bold shadow-xs mb-2">
          সমস্ত কোম্পানীর মোবাইল রিপিয়ারিং করা হয় । ডিসপ্লে চেঞ্জ করা হয় । রিপিয়ারিং এর জিনিস পাইকারী পাওয়া যায় ।
        </div>

        {/* Deep Blue Bordered Table */}
        <div className="border-2 border-blue-900 rounded-lg overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-blue-900 text-blue-950 text-[11px] sm:text-xs font-black text-center bg-blue-50/60">
                <th className="py-2 px-2 border-r border-blue-900 w-12">নং</th>
                <th className="py-2 px-4 border-r border-blue-900 text-left">বিবরণ</th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-2 px-3 border-r border-blue-900 w-24"
                >
                  পরিমান
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'দর এডিট করুন')}
                  className="py-2 px-3 border-r border-blue-900 w-24 text-right"
                >
                  দর
                </th>
                <th className="py-2 px-4 w-32 text-right">মূল্য</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-200 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition">
                  <td className="py-2.5 px-2 text-center font-bold text-blue-950 border-r border-blue-900">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-2.5 px-3 border-r border-blue-900">
                    <div
                      {...clickProps(`field-item-name-${item.id}`, 'আইটেমের নাম এডিট করুন')}
                      className="font-bold text-slate-900"
                    >
                      {item.name || 'সার্ভিসিং / যন্ত্রাংশ'}
                    </div>
                    {item.description && (
                      <div className="text-[10px] text-slate-500">{item.description}</div>
                    )}
                  </td>
                  <td
                    {...clickProps(`field-item-qty-${item.id}`, 'পরিমাণ পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-center font-mono font-bold border-r border-blue-900"
                  >
                    {toBengaliNumerals(item.quantity)} {item.unit !== 'piece' ? item.unit : ''}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'দর পরিবর্তন করুন')}
                    className="py-2.5 px-3 text-right font-mono border-r border-blue-900"
                  >
                    {numFormat(item.unitPrice)}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'মূল্য এডিট করুন')}
                    className="py-2.5 px-3 text-right font-mono font-bold text-slate-900"
                  >
                    {numFormat(item.lineTotal)}
                  </td>
                </tr>
              ))}

              {Array.from({ length: Math.max(0, 7 - invoice.items.length) }).map((_, i) => (
                <tr key={`fill-${i}`} className="h-8">
                  <td className="border-r border-blue-900"></td>
                  <td className="border-r border-blue-900"></td>
                  <td className="border-r border-blue-900"></td>
                  <td className="border-r border-blue-900"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-blue-900 bg-slate-50">
                <td colSpan={3} className="py-2 px-3 border-r border-blue-900">
                  <span className="font-bold text-slate-800">কথায়: </span>
                  <span {...clickProps('field-in-words', 'কথায় টাকা এডিট করুন')} className="font-semibold text-xs cursor-pointer">{amountInWords}</span>
                </td>
                <td className="py-2 px-3 text-center font-black text-blue-950 border-r border-blue-900">
                  মোট =
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

        {/* Due & Paid Amount Chips */}
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

      {/* Signatures & Red Warning Banner */}
      <div className="pt-6">
        <div className="flex items-end justify-between text-xs font-bold text-slate-800 pb-3 px-2">
          <div className="text-center">
            <div className="w-32 sm:w-40 border-t border-slate-700 mx-auto mb-1" />
            <span>ক্রেতার স্বাক্ষর</span>
          </div>
          <div className="text-center">
            <div className="w-32 sm:w-40 border-t border-slate-700 mx-auto mb-1" />
            <span>{business.businessName || 'এমরান মোবাইল'}</span>
          </div>
        </div>

        {/* Warning Bottom Banner */}
        <div className="bg-red-600 text-white text-center py-1.5 px-3 rounded text-xs font-bold shadow-xs">
          বিঃ দ্রঃ ২ই মাসের মধ্যে মোবাইল ডেলিভারী না নিলে কর্তৃপক্ষ দায়ী নয়।
        </div>
      </div>
    </div>
  );
};
