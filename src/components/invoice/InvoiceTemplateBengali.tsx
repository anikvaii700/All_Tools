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

export const InvoiceTemplateBengali: React.FC<TemplateProps> = ({ invoice, business, calc, onEditField }) => {
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
    <div className="bg-white text-slate-900 p-8 sm:p-10 font-sans text-xs sm:text-sm min-h-[900px] flex flex-col justify-between border-2 border-emerald-700 shadow-sm print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Decorative Traditional Corner Borders */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-700 print:hidden" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-700 print:hidden" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-700 print:hidden" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-700 print:hidden" />

      <div>
        {/* Religious or Welcome Header */}
        <div className="text-center pb-2">
          <span
            {...clickProps('field-biz-religious', 'ধর্মীয় বাণী এডিট করুন')}
            className="text-[11px] text-slate-500 font-medium cursor-pointer"
          >
            {business.religiousHeader || 'বিসমিল্লাহির রাহমানির রাহিম'}
          </span>
        </div>

        {/* Business Title & Memo Type */}
        <div className="text-center pb-4 border-b-2 border-emerald-700">
          <div className="inline-block p-1">
            <div className="flex items-center justify-center gap-3">
              {business.logoUrl && (
                <img
                  src={business.logoUrl}
                  alt="Logo"
                  className="w-14 h-14 object-contain rounded-lg border border-slate-200"
                />
              )}
              <div>
                <h1
                  {...clickProps('field-biz-name', 'ব্যবসার নাম এডিট করুন')}
                  className="text-2xl sm:text-3xl font-extrabold text-emerald-800 tracking-tight"
                >
                  {business.businessName || 'The MoSaFa ডিজিটাল আইটি সল্যুশন'}
                </h1>
                {business.subtitle && (
                  <p
                    {...clickProps('field-biz-subtitle', 'সাবটাইটেল এডিট করুন')}
                    className="text-xs text-slate-700 font-bold mt-0.5 tracking-wider"
                  >
                    {business.subtitle}
                  </p>
                )}
                {business.ownerName && (
                  <p
                    {...clickProps('field-biz-owner', 'প্রোপ্রাইটরের নাম এডিট করুন')}
                    className="text-xs text-rose-700 font-bold mt-0.5"
                  >
                    প্রোপ্রাইটর: {business.ownerName}
                  </p>
                )}
              </div>
            </div>
            <p
              {...clickProps('field-biz-address', 'ঠিকানা এডিট করুন')}
              className="text-xs text-slate-600 mt-1 max-w-xl mx-auto whitespace-pre-line"
            >
              {business.businessAddress}
            </p>
            <div className="text-[11px] text-slate-600 mt-1 flex flex-wrap justify-center gap-x-4">
              {business.phone && (
                <span {...clickProps('field-biz-phone', 'মোবাইল নম্বর এডিট করুন')}>
                  মোবাইল: {toBengaliNumerals(business.phone)}
                </span>
              )}
              {business.email && (
                <span {...clickProps('field-biz-email', 'ইমেইল এডিট করুন')}>
                  ইমেইল: {business.email}
                </span>
              )}
              {business.binVatNumber && <span>BIN/VAT: {business.binVatNumber}</span>}
            </div>
          </div>

          <div className="mt-3 inline-block">
            <span className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-extrabold px-6 py-1 rounded-full text-xs shadow-xs tracking-wider">
              ক্যাশ মেমো / বিক্রয় চালান (INVOICE)
            </span>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-emerald-600/30 text-xs">
          {/* Customer Side */}
          <div className="space-y-1">
            <div {...clickProps('field-cust-name', 'গ্রাহকের নাম পরিবর্তন করতে ক্লিক করুন')}>
              <span className="font-bold text-slate-700">ক্রেতার নাম:</span>{' '}
              <span className="font-extrabold text-slate-900 text-sm">
                {invoice.customer.name || 'সম্মানিত খরিদ্দার'}
              </span>
            </div>
            {invoice.customer.companyName && (
              <div {...clickProps('field-cust-company', 'কোম্পানির নাম এডিট করুন')}>
                <span className="font-bold text-slate-700">প্রতিষ্ঠান:</span>{' '}
                <span>{invoice.customer.companyName}</span>
              </div>
            )}
            <div {...clickProps('field-cust-address', 'ঠিকানা এডিট করুন')}>
              <span className="font-bold text-slate-700">ঠিকানা:</span>{' '}
              <span>{invoice.customer.address || '—'}</span>
            </div>
            <div {...clickProps('field-cust-phone', 'মোবাইল নম্বর এডিট করুন')}>
              <span className="font-bold text-slate-700">মোবাইল নং:</span>{' '}
              <span className="font-mono">
                {invoice.customer.phone ? toBengaliNumerals(invoice.customer.phone) : '—'}
              </span>
            </div>
          </div>

          {/* Invoice Meta Side */}
          <div className="sm:text-right space-y-1 self-start">
            <div {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}>
              <span className="font-bold text-slate-700">চালান / মেমো নং:</span>{' '}
              <span className="font-black text-rose-700 font-mono text-sm">{invoice.invoiceNumber}</span>
            </div>
            <div {...clickProps('field-inv-date', 'চালানের তারিখ এডিট করুন')}>
              <span className="font-bold text-slate-700">তারিখ:</span>{' '}
              <span className="font-semibold">{toBengaliNumerals(invoice.invoiceDate)}</span>
            </div>
            <div {...clickProps('field-inv-due-date', 'পরিশোধের শেষ সময় (Due Date) এডিট করুন')}>
              <span className="font-bold text-slate-700">পরিশোধের শেষ সময়:</span>{' '}
              <span className="font-semibold">{invoice.dueDate ? toBengaliNumerals(invoice.dueDate) : '—'}</span>
            </div>
            <div {...clickProps('field-inv-status', 'পেমেন্ট স্ট্যাটাস পরিবর্তন করুন')}>
              <span className="font-bold text-slate-700">বিল অবস্থা:</span>{' '}
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  calc.isOverdue
                    ? 'bg-rose-100 text-rose-800'
                    : invoice.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : invoice.paymentStatus === 'partial'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {calc.isOverdue
                  ? 'বিলম্বিত (বকেয়া)'
                  : invoice.paymentStatus === 'paid'
                  ? 'পরিশোধিত (PAID)'
                  : invoice.paymentStatus === 'partial'
                  ? 'আংশিক জমা'
                  : 'অপরিশোধিত'}
              </span>
            </div>
          </div>
        </div>

        {/* Bangla Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left border-collapse border border-emerald-800">
            <thead>
              <tr className="bg-emerald-800 text-white text-[11px] font-bold text-center">
                <th className="py-2 px-2 border border-emerald-700 w-10">ক্রমিক</th>
                <th
                  {...clickProps(`field-item-name-${invoice.items[0]?.id || ''}`, 'আইটেম যোগ বা এডিট করুন')}
                  className="py-2 px-3 border border-emerald-700 text-left cursor-pointer hover:bg-emerald-700"
                >
                  পণ্য / সেবার বিবরণ ✏️
                </th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ (Quantity) এডিট করুন')}
                  className="py-2 px-2 border border-emerald-700 w-24 cursor-pointer hover:bg-emerald-700"
                >
                  পরিমাণ ✏️
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'দর (Price) এডিট করুন')}
                  className="py-2 px-3 border border-emerald-700 text-right w-28 cursor-pointer hover:bg-emerald-700"
                >
                  দর ✏️
                </th>
                <th
                  {...clickProps(`field-item-discount-${invoice.items[0]?.id || ''}`, 'ছাড় (Discount) এডিট করুন')}
                  className="py-2 px-2 border border-emerald-700 text-right w-20 cursor-pointer hover:bg-emerald-700"
                >
                  ছাড় ✏️
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'মোট টাকার হিসাব এডিট করুন')}
                  className="py-2 px-3 border border-emerald-700 text-right w-32 cursor-pointer hover:bg-emerald-700"
                >
                  মোট টাকা ✏️
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-600/20 text-xs">
              {invoice.items.map((item, idx) => {
                const qtyStr = toBengaliNumerals(item.quantity);
                const unitStr = item.unit === 'custom' ? item.customUnit || '' : item.unit;
                return (
                  <tr key={item.id || idx} className="hover:bg-emerald-50/40">
                    <td className="py-2.5 px-2 text-center border-r border-emerald-800/30 font-bold">
                      {toBengaliNumerals(idx + 1)}
                    </td>
                    <td
                      {...clickProps(`field-item-name-${item.id}`, 'এই আইটেমের নাম এডিট করুন')}
                      className="py-2.5 px-3 border-r border-emerald-800/30 cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 transition"
                    >
                      <div className="font-bold text-slate-900">{item.name || 'আইটেম'}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td
                      {...clickProps(`field-item-qty-${item.id}`, 'এই আইটেমের পরিমাণ (Quantity) এডিট করুন')}
                      className="py-2.5 px-2 text-center border-r border-emerald-800/30 cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 font-bold text-indigo-900 transition"
                    >
                      {qtyStr} <span className="text-[10px] text-slate-500 font-normal">{unitStr}</span>
                    </td>
                    <td
                      {...clickProps(`field-item-price-${item.id}`, 'এই আইটেমের একক দর (Price) এডিট করুন')}
                      className="py-2.5 px-3 text-right border-r border-emerald-800/30 cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 font-semibold transition"
                    >
                      {currencySymbol} {numFormat(item.unitPrice)}
                    </td>
                    <td
                      {...clickProps(`field-item-discount-${item.id}`, 'এই আইটেমের ছাড় (Discount) এডিট করুন')}
                      className="py-2.5 px-2 text-right border-r border-emerald-800/30 text-slate-600 cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 transition"
                    >
                      {item.discountValue > 0
                        ? item.discountType === 'percent'
                          ? `${toBengaliNumerals(item.discountValue)}%`
                          : `${currencySymbol}${numFormat(item.discountValue)}`
                        : '—'}
                    </td>
                    <td
                      {...clickProps(`field-item-price-${item.id}`, 'এই আইটেমের দর ও পরিমাণ এডিট করুন')}
                      className="py-2.5 px-3 text-right font-bold text-slate-900 cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 transition"
                    >
                      {currencySymbol} {numFormat(item.lineTotal || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation & Amount in Words */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 pt-3">
          <div className="md:col-span-7 space-y-3">
            <div
              {...clickProps('field-calc-subtotal', 'আইটেমের মোট টাকার অংক দেখুন')}
              className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 transition"
            >
              <span className="font-bold text-emerald-900 text-xs block">কথায়:</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{amountInWords}</p>
            </div>

            {(business.bkashNumber || business.nagadNumber || business.bankAccountNumber) && (
              <div
                {...clickProps('field-business-settings', 'পেমেন্ট ও ব্যাংক তথ্য এডিট করতে সেটিংস খুলুন')}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 transition"
              >
                <span className="font-bold text-slate-800 block text-[11px]">টাকা পাঠানোর নম্বর:</span>
                {business.bkashNumber && (
                  <div>
                    <span className="font-bold text-pink-600">বিকাশ:</span> {toBengaliNumerals(business.bkashNumber)}
                  </div>
                )}
                {business.nagadNumber && (
                  <div>
                    <span className="font-bold text-orange-600">নগদ:</span> {toBengaliNumerals(business.nagadNumber)}
                  </div>
                )}
                {business.bankAccountNumber && (
                  <div className="text-[11px]">
                    <span className="font-bold">{business.bankName}:</span> হিসাব নং: {business.bankAccountNumber}
                  </div>
                )}
              </div>
            )}

            <div
              {...clickProps('field-inv-notes', 'বিশেষ নোট এডিট করুন')}
              className="text-xs text-slate-600 p-2 rounded-lg cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 transition"
            >
              <span className="font-bold">বিশেষ দ্রষ্টব্য:</span> {invoice.notes || '—'}
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="border-2 border-emerald-800 p-3.5 rounded-xl space-y-2 text-xs bg-white">
              <div
                {...clickProps('field-calc-subtotal', 'আইটেমের মোট সাবটোটাল')}
                className="flex justify-between text-slate-700 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>উপ-মোট (Subtotal):</span>
                <span className="font-bold">{currencySymbol} {numFormat(calc.subtotal)}</span>
              </div>

              <div
                {...clickProps('field-inv-discount', 'ইনভয়েস বিশেষ ছাড় এডিট করুন')}
                className="flex justify-between text-rose-700 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>মোট ছাড় (Discount):</span>
                <span>-{currencySymbol} {numFormat(calc.totalDiscount)}</span>
              </div>

              <div
                {...clickProps(`field-item-vat-${invoice.items[0]?.id || ''}`, 'ভ্যাট হার এডিট করুন')}
                className="flex justify-between text-slate-700 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>ভ্যাট / সরকারি ট্যাক্স:</span>
                <span>+{currencySymbol} {numFormat(calc.totalVat)}</span>
              </div>

              <div
                {...clickProps('field-inv-shipping', 'ডেলিভারি বা পরিবহন চার্জ এডিট করুন')}
                className="flex justify-between text-slate-700 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>পরিবহন / খালাস চার্জ:</span>
                <span>+{currencySymbol} {numFormat(calc.shipping)}</span>
              </div>

              <div
                {...clickProps('field-calc-subtotal', 'সর্বমোট বিল')}
                className="pt-2 border-t border-emerald-800 flex justify-between font-black text-sm text-emerald-950 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>সর্বমোট বিল:</span>
                <span>{currencySymbol} {numFormat(calc.grandTotal)}</span>
              </div>

              <div
                {...clickProps('field-inv-paid-amount', 'পরিশোধিত টাকা (Paid Amount) এডিট করুন')}
                className="flex justify-between text-emerald-700 font-bold pt-1 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>জমা / নগদ প্রাপ্তি:</span>
                <span>{currencySymbol} {numFormat(calc.paidAmount)}</span>
              </div>

              <div
                {...clickProps('field-inv-paid-amount', 'বকেয়া ঠিক করতে পরিশোধিত টাকা এডিট করুন')}
                className="flex justify-between text-rose-700 font-black text-sm pt-1 border-t border-dashed border-emerald-600 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>বকেয়া পাওনা:</span>
                <span>{currencySymbol} {numFormat(calc.dueAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traditional Dual Signature */}
      <div className="mt-10 pt-8 border-t border-emerald-700">
        <div className="flex justify-between items-end gap-6 text-xs">
          <div className="text-center">
            <div className="w-36 border-b border-dashed border-slate-700 mb-1" />
            <p className="font-semibold text-slate-700">ক্রেতার স্বাক্ষর</p>
          </div>

          <div
            {...clickProps('field-inv-terms', 'শর্তাবলী বা নিচের লেখা পরিবর্তন করুন')}
            className="text-center text-[10px] text-slate-500 max-w-xs p-1 rounded cursor-pointer hover:bg-rose-50"
          >
            <p>{invoice.terms || 'বিক্রিত পণ্য বিশেষ কারণ ছাড়া ফেরত নেওয়া হয় না।'}</p>
            <p className="font-bold text-emerald-800 mt-0.5">ধন্যবাদ, আবার আসবেন!</p>
          </div>

          <div
            {...clickProps('field-inv-signature', 'স্বাক্ষরের পদবী এডিট করুন')}
            className="text-center p-1 rounded cursor-pointer hover:bg-rose-50"
          >
            <div className="w-36 border-b border-slate-900 mb-1" />
            <p className="font-bold text-slate-900">{invoice.signatureTitle || 'বিক্রেতার সিল ও স্বাক্ষর'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
