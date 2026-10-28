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

export const InvoiceTemplateComputerStudio: React.FC<TemplateProps> = ({
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
    <div className="bg-white text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-2 border-blue-800 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none overflow-hidden">
      {/* Top Royal Blue Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-9 bg-blue-800 flex items-center justify-between px-6 text-white text-xs font-bold print:bg-blue-800">
        <span {...clickProps('field-biz-religious', 'ধর্মীয় বাণী এডিট করুন')}>
          {business.religiousHeader || 'বিসমিল্লাহির রহমানির রহীম'}
        </span>
        <span {...clickProps('field-biz-phone', 'মোবাইল নম্বর এডিট করুন')} className="font-mono cursor-pointer">
          মোবাঃ {toBengaliNumerals(business.phone || '০১৭০০০০০০০০')}
        </span>
      </div>

      {/* Bottom Left Decorative Wave Accent */}
      <div className="absolute bottom-0 left-0 w-48 h-24 bg-blue-800 rounded-tr-full opacity-90 pointer-events-none print:opacity-100" />

      <div className="pt-6">
        {/* Cash Memo Capsule */}
        <div className="text-center my-2">
          <span className="bg-blue-800 text-white font-extrabold text-xs px-6 py-1 rounded-full shadow-xs inline-block">
            ক্যাশ মেমো
          </span>
        </div>

        {/* Business Title in Royal Blue */}
        <div className="text-center pb-2">
          <h1
            {...clickProps('field-biz-name', 'ব্যবসার নাম এডিট করুন')}
            className="text-2xl sm:text-3xl font-black text-blue-900 tracking-tight"
          >
            {business.businessName || 'নাঈম কম্পিউটার কর্নার এন্ড স্টুডিও'}
          </h1>
          <p
            {...clickProps('field-biz-owner', 'প্রোপ্রাইটরের নাম এডিট করুন')}
            className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5"
          >
            প্রোঃ {business.ownerName || 'মোঃ নাঈম ইসলাম'}
          </p>
          <p
            {...clickProps('field-biz-address', 'ঠিকানা এডিট করুন')}
            className="text-xs text-slate-600 mt-0.5"
          >
            {business.businessAddress || 'পোলের হাট বাজার, কাউখালী, পিরোজপুর'}
          </p>
        </div>

        {/* Minimal Dotted Customer Rows */}
        <div className="my-3 space-y-2 text-xs text-slate-800 border-t border-b border-blue-200 py-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 shrink-0">নাম</span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="border-b border-dotted border-blue-900 flex-1 font-bold text-slate-900 px-2 min-h-[20px]"
            >
              {invoice.customer.name || '....................................................................................'}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-slate-900 shrink-0">ঠিকানা</span>
              <div
                {...clickProps('field-cust-address', 'ঠিকানা এডিট করুন')}
                className="border-b border-dotted border-blue-900 flex-1 text-slate-800 px-2 min-h-[20px]"
              >
                {invoice.customer.address || '...................................................'}
              </div>
            </div>
            <div className="flex items-center gap-2 w-44 sm:w-56">
              <span className="font-bold text-slate-900 shrink-0">তাং</span>
              <div
                {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}
                className="border-b border-dotted border-blue-900 flex-1 font-mono font-bold text-slate-900 px-2 min-h-[20px]"
              >
                {toBengaliNumerals(invoice.invoiceDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Rounded Top Corner Blue Table */}
        <div className="border-2 border-blue-900 rounded-2xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-blue-900 text-blue-950 text-xs font-black text-center bg-blue-50/70">
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
                <th className="py-2 px-4 w-28 text-right">টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-200 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition">
                  <td className="py-2 px-2 text-center font-bold text-blue-950 border-r border-blue-900">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-2 px-3 border-r border-blue-900">
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
                    className="py-2 px-3 text-center font-mono font-bold border-r border-blue-900"
                  >
                    {toBengaliNumerals(item.quantity)} {item.unit !== 'piece' ? item.unit : ''}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'দর পরিবর্তন করুন')}
                    className="py-2 px-3 text-right font-mono border-r border-blue-900"
                  >
                    {numFormat(item.unitPrice)}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'টাকা এডিট করুন')}
                    className="py-2 px-3 text-right font-mono font-bold text-slate-900"
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
            {/* Embedded Totals in Table Footer */}
            <tfoot>
              <tr className="border-t-2 border-blue-900">
                <td colSpan={3} rowSpan={3} className="p-3 align-top border-r border-blue-900 bg-blue-50/20">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-blue-900">কথায়:</span>
                    <span {...clickProps('field-in-words', 'কথায় টাকা এডিট করুন')} className="text-xs font-semibold cursor-pointer">{amountInWords}</span>
                  </div>
                </td>
                <td className="py-1 px-3 text-right font-bold text-blue-950 border-r border-blue-900">
                  মোট
                </td>
                <td
                  {...clickProps('field-inv-paid-amount', 'মোট টাকা এডিট করুন')}
                  className="py-1 px-3 text-right font-mono font-black text-slate-900"
                >
                  {currencySymbol} {numFormat(calc.grandTotal)}
                </td>
              </tr>
              <tr className="border-t border-blue-900">
                <td className="py-1 px-3 text-right font-bold text-blue-950 border-r border-blue-900">
                  জমা
                </td>
                <td
                  {...clickProps('field-inv-paid-amount', 'পরিশোধিত টাকা এডিট করুন')}
                  className="py-1 px-3 text-right font-mono font-bold text-emerald-700"
                >
                  {currencySymbol} {numFormat(calc.paidAmount)}
                </td>
              </tr>
              <tr className="border-t border-blue-900">
                <td className="py-1 px-3 text-right font-bold text-blue-950 border-r border-blue-900">
                  বাকি
                </td>
                <td
                  {...clickProps('field-inv-paid-amount', 'বকেয়া টাকা এডিট করুন')}
                  className="py-1 px-3 text-right font-mono font-bold text-rose-700"
                >
                  {currencySymbol} {numFormat(calc.dueAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Signature Section */}
      <div className="pt-8 pb-3 relative z-10 flex justify-end">
        <div className="text-center w-48">
          <div className="border-t-2 border-blue-900 mb-1" />
          <span className="font-bold text-blue-950 text-xs">কর্তৃপক্ষের স্বাক্ষর</span>
        </div>
      </div>
    </div>
  );
};
