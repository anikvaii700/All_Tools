import React from 'react';
import { BusinessProfile, Invoice, InvoiceCalculation } from './types';
import { formatMoney } from './calculator';
import { numberToWordsBengali, numberToWordsEnglish, toBengaliNumerals } from './numberToWords';

interface TemplateProps {
  invoice: Invoice;
  business: BusinessProfile;
  calc: InvoiceCalculation;
  onEditField?: (fieldId: string) => void;
}

export const InvoiceTemplateElegant: React.FC<TemplateProps> = ({ invoice, business, calc, onEditField }) => {
  const isBn = invoice.language === 'bn';
  const currencySymbol = invoice.currency.includes('৳') ? '৳' : invoice.currency.split(' ')[0] || '৳';

  const amountInWords = isBn
    ? numberToWordsBengali(calc.grandTotal)
    : numberToWordsEnglish(calc.grandTotal, currencySymbol === '৳' ? 'Taka' : 'Currency');

  const numFormat = (num: number) =>
    isBn ? toBengaliNumerals(formatMoney(num, '')) : formatMoney(num, '');

  const clickProps = (fieldId: string, label = 'এডিট করতে ক্লিক করুন') => ({
    onClick: () => onEditField && onEditField(fieldId),
    title: `${label} ✏️`,
    className:
      'cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 rounded transition-all print:hover:bg-transparent print:hover:outline-none print:cursor-default',
  });

  return (
    <div className="bg-[#fcfbf9] text-stone-800 p-8 sm:p-10 font-serif text-xs sm:text-sm min-h-[900px] flex flex-col justify-between border-2 border-amber-900/10 shadow-sm print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 select-none">
      <div>
        {/* Elegant Gold Double Frame Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-amber-900/20">
          <div
            {...clickProps('field-business-settings', 'ব্যবসার তথ্য ও প্রোফাইল এডিট করুন')}
            className="flex items-start gap-4 p-1 rounded-md cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 transition"
          >
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-md border border-amber-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-emerald-900 text-amber-200 flex items-center justify-center font-bold text-2xl border-2 border-amber-400 shrink-0">
                {business.businessName.charAt(0) || 'M'}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-950 tracking-tight">
                {business.businessName || 'ব্যবসার নাম'}
              </h1>
              {business.ownerName && (
                <p className="text-xs text-amber-900/80 font-sans italic">স্বত্বাধিকারী: {business.ownerName}</p>
              )}
              <p className="text-xs text-stone-600 mt-1 max-w-sm whitespace-pre-line font-sans">
                {business.businessAddress}
              </p>
              <div className="text-[11px] text-stone-500 mt-1 flex flex-wrap gap-x-3 font-sans">
                {business.phone && <span>📞 {business.phone}</span>}
                {business.email && <span>✉️ {business.email}</span>}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <h2 className="text-2xl sm:text-3xl font-light tracking-widest text-emerald-900 uppercase">
              {isBn ? 'ইনভয়েস' : 'INVOICE'}
            </h2>
            <div className="mt-2 text-xs space-y-1 font-sans">
              <div {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}>
                <span className="text-stone-500">{isBn ? 'নম্বর:' : 'No:'}</span>{' '}
                <span className="font-bold text-emerald-950">{invoice.invoiceNumber}</span>
              </div>
              <div {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}>
                <span className="text-stone-500">{isBn ? 'তারিখ:' : 'Date:'}</span> {invoice.invoiceDate}
              </div>
              {invoice.dueDate && (
                <div {...clickProps('field-inv-due-date', 'পরিশোধের শেষ সময় এডিট করুন')}>
                  <span className="text-stone-500">{isBn ? 'মেয়াদ:' : 'Due:'}</span> {invoice.dueDate}
                </div>
              )}
              <div {...clickProps('field-inv-status', 'পেমেন্ট স্ট্যাটাস এডিট করুন')}>
                <span
                  className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] uppercase font-sans ${
                    calc.isOverdue
                      ? 'bg-rose-100 text-rose-800'
                      : invoice.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {calc.isOverdue ? 'Overdue' : invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-amber-900/10 font-sans">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold block mb-1">
              {isBn ? 'বিল গ্রাহক' : 'Recipient'}
            </span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="font-bold text-stone-900 text-sm sm:text-base inline-block"
            >
              {invoice.customer.name || 'সম্মানিত গ্রাহক'}
            </div>
            {invoice.customer.companyName && (
              <div
                {...clickProps('field-cust-company', 'কোম্পানির নাম এডিট করুন')}
                className="text-xs font-semibold text-stone-700"
              >
                {invoice.customer.companyName}
              </div>
            )}
            <div
              {...clickProps('field-cust-address', 'গ্রাহকের ঠিকানা এডিট করুন')}
              className="text-xs text-stone-600 mt-0.5 whitespace-pre-line"
            >
              {invoice.customer.address || '—'}
            </div>
            <div className="text-xs text-stone-500 mt-1 flex flex-wrap gap-x-3">
              <span {...clickProps('field-cust-phone', 'মোবাইল এডিট করুন')}>
                ফোন: {invoice.customer.phone || '—'}
              </span>
              <span {...clickProps('field-cust-email', 'ইমেইল এডিট করুন')}>
                ইমেইল: {invoice.customer.email || '—'}
              </span>
            </div>
          </div>

          <div
            {...clickProps('field-business-settings', 'ট্রেড লাইসেন্স বা ভ্যাট নম্বর পরিবর্তন করুন')}
            className="sm:text-right text-xs text-stone-600 space-y-1 self-end font-sans p-2 rounded cursor-pointer hover:bg-rose-50"
          >
            {business.tradeLicense && <div>ট্রেড লাইসেন্স: {business.tradeLicense}</div>}
            {business.binVatNumber && <div>BIN/VAT রেজিস্ট্রেশন: {business.binVatNumber}</div>}
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto font-sans">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-950 text-amber-100 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 w-8 text-center">#</th>
                <th
                  {...clickProps(`field-item-name-${invoice.items[0]?.id || ''}`, 'আইটেম নাম এডিট করুন')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-emerald-900"
                >
                  {isBn ? 'বিবরণ ✏️' : 'Description ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:bg-emerald-900"
                >
                  {isBn ? 'পরিমাণ ✏️' : 'Qty ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'দর এডিট করুন')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-emerald-900"
                >
                  {isBn ? 'দর ✏️' : 'Price ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-discount-${invoice.items[0]?.id || ''}`, 'ছাড় এডিট করুন')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-emerald-900"
                >
                  {isBn ? 'ছাড় ✏️' : 'Discount ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-vat-${invoice.items[0]?.id || ''}`, 'ভ্যাট এডিট করুন')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-emerald-900"
                >
                  {isBn ? 'ভ্যাট ✏️' : 'VAT ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'মোট টাকার হিসাব এডিট করুন')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-emerald-900"
                >
                  {isBn ? 'মোট ✏️' : 'Total ✏️'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/10 text-xs">
              {invoice.items.map((item, idx) => {
                const qtyStr = isBn ? toBengaliNumerals(item.quantity) : String(item.quantity);
                const unitStr = item.unit === 'custom' ? item.customUnit || '' : item.unit;
                return (
                  <tr key={item.id || idx}>
                    <td className="py-2.5 px-3 text-center text-stone-400">
                      {isBn ? toBengaliNumerals(idx + 1) : idx + 1}
                    </td>
                    <td
                      {...clickProps(`field-item-name-${item.id}`, 'আইটেমের নাম এডিট করুন')}
                      className="py-2.5 px-3"
                    >
                      <div className="font-bold text-stone-900">{item.name || 'আইটেম'}</div>
                      {item.description && (
                        <div className="text-[11px] text-stone-500 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td
                      {...clickProps(`field-item-qty-${item.id}`, 'পরিমাণ (Quantity) এডিট করুন')}
                      className="py-2.5 px-3 text-center font-bold text-emerald-950"
                    >
                      {qtyStr} <span className="font-normal text-stone-500">{unitStr}</span>
                    </td>
                    <td
                      {...clickProps(`field-item-price-${item.id}`, 'দর (Price) এডিট করুন')}
                      className="py-2.5 px-3 text-right"
                    >
                      {currencySymbol} {numFormat(item.unitPrice)}
                    </td>
                    <td
                      {...clickProps(`field-item-discount-${item.id}`, 'ছাড় (Discount) এডিট করুন')}
                      className="py-2.5 px-3 text-right text-stone-500"
                    >
                      {item.discountValue > 0
                        ? item.discountType === 'percent'
                          ? `${isBn ? toBengaliNumerals(item.discountValue) : item.discountValue}%`
                          : `${currencySymbol}${numFormat(item.discountValue)}`
                        : '—'}
                    </td>
                    <td
                      {...clickProps(`field-item-vat-${item.id}`, 'ভ্যাট এডিট করুন')}
                      className="py-2.5 px-3 text-right text-stone-500"
                    >
                      {item.vatRate > 0 ? `${isBn ? toBengaliNumerals(item.vatRate) : item.vatRate}%` : '—'}
                    </td>
                    <td
                      {...clickProps(`field-item-price-${item.id}`, 'মোটের হিসাব পরিবর্তন করুন')}
                      className="py-2.5 px-3 text-right font-bold text-emerald-950"
                    >
                      {currencySymbol} {numFormat(item.lineTotal || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-amber-900/20 font-sans">
          <div className="md:col-span-7 space-y-3">
            <div
              {...clickProps('field-calc-subtotal', 'আইটেমের মোট অংক')}
              className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80"
            >
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                {isBn ? 'কথায়:' : 'In Words:'}
              </span>
              <p className="text-xs font-serif font-bold text-emerald-950 mt-0.5">{amountInWords}</p>
            </div>

            {(business.bkashNumber || business.bankAccountNumber) && (
              <div
                {...clickProps('field-business-settings', 'পেমেন্ট ও ব্যাংক তথ্য পরিবর্তন করতে সেটিংস খুলুন')}
                className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1"
              >
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  পেমেন্ট মাধ্যম:
                </span>
                {business.bkashNumber && <div>bKash: {business.bkashNumber}</div>}
                {business.bankAccountNumber && (
                  <div>
                    {business.bankName}: {business.bankAccountNumber} ({business.bankAccountName})
                  </div>
                )}
              </div>
            )}

            <div
              {...clickProps('field-inv-notes', 'নোট এডিট করুন')}
              className="text-xs text-stone-600 p-1 rounded"
            >
              <strong>নোট:</strong> {invoice.notes || '—'}
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
              <div
                {...clickProps('field-calc-subtotal', 'সাবটোটাল')}
                className="flex justify-between text-stone-600 p-1 rounded hover:bg-rose-50"
              >
                <span>সাবটোটাল:</span>
                <span className="font-semibold">{currencySymbol} {numFormat(calc.subtotal)}</span>
              </div>
              <div
                {...clickProps('field-inv-discount', 'ছাড় পরিবর্তন করুন')}
                className="flex justify-between text-rose-700 p-1 rounded hover:bg-rose-50"
              >
                <span>মোট ছাড়:</span>
                <span>-{currencySymbol} {numFormat(calc.totalDiscount)}</span>
              </div>
              <div
                {...clickProps(`field-item-vat-${invoice.items[0]?.id || ''}`, 'ভ্যাট পরিবর্তন করুন')}
                className="flex justify-between text-stone-600 p-1 rounded hover:bg-rose-50"
              >
                <span>ভ্যাট / ট্যাক্স:</span>
                <span>+{currencySymbol} {numFormat(calc.totalVat)}</span>
              </div>
              <div
                {...clickProps('field-inv-shipping', 'ডেলিভারি চার্জ পরিবর্তন করুন')}
                className="flex justify-between text-stone-600 p-1 rounded hover:bg-rose-50"
              >
                <span>ডেলিভারি চার্জ:</span>
                <span>+{currencySymbol} {numFormat(calc.shipping)}</span>
              </div>
              <div
                {...clickProps('field-calc-subtotal', 'সর্বমোট বিল')}
                className="pt-2 border-t border-amber-900/20 flex justify-between font-bold text-base text-emerald-950 font-serif p-1 rounded hover:bg-rose-50"
              >
                <span>সর্বমোট:</span>
                <span>{currencySymbol} {numFormat(calc.grandTotal)}</span>
              </div>
              <div
                {...clickProps('field-inv-paid-amount', 'পরিশোধিত টাকা পরিবর্তন করুন')}
                className="flex justify-between text-emerald-800 font-semibold pt-1 p-1 rounded hover:bg-rose-50"
              >
                <span>পরিশোধিত:</span>
                <span>{currencySymbol} {numFormat(calc.paidAmount)}</span>
              </div>
              <div
                {...clickProps('field-inv-paid-amount', 'বকেয়া পরিবর্তন করতে পরিশোধিত টাকা এডিট করুন')}
                className="flex justify-between text-rose-800 font-bold text-sm pt-1 border-t border-dashed border-stone-300 p-1 rounded hover:bg-rose-50"
              >
                <span>বকেয়া:</span>
                <span>{currencySymbol} {numFormat(calc.dueAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature & Footer */}
      <div className="mt-10 pt-6 border-t border-amber-900/20 font-sans">
        <div className="flex justify-between items-end gap-6">
          <div
            {...clickProps('field-inv-terms', 'শর্তাবলী এডিট করুন')}
            className="text-xs text-stone-500 max-w-sm p-1 rounded"
          >
            {invoice.terms && <p className="text-[11px] mb-1"><strong>শর্তাবলী:</strong> {invoice.terms}</p>}
            <p className="text-[10px] text-stone-400">{business.defaultInvoiceFooter}</p>
          </div>
          <div
            {...clickProps('field-inv-signature', 'স্বাক্ষরের পদবী এডিট করুন')}
            className="text-center shrink-0 p-1 rounded"
          >
            <div className="w-36 border-b border-stone-800 mb-1" />
            <p className="text-xs font-bold text-stone-800">{invoice.signatureTitle || 'স্বাক্ষর'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
