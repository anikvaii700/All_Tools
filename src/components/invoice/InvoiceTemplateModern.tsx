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

export const InvoiceTemplateModern: React.FC<TemplateProps> = ({ invoice, business, calc, onEditField }) => {
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
    <div className="bg-white text-slate-800 p-8 sm:p-10 font-sans text-xs sm:text-sm min-h-[900px] flex flex-col justify-between border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 select-none">
      <div>
        {/* Top Gradient Accent Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 rounded-full mb-6 print:hidden" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6">
          <div
            {...clickProps('field-business-settings', 'ব্যবসার তথ্য ও প্রোফাইল এডিট করুন')}
            className="flex items-start gap-4 p-1 rounded-2xl cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 transition"
          >
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-2xl shadow-sm border border-slate-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-100 shrink-0">
                {business.businessName.charAt(0) || 'M'}
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full">
                {isBn ? 'অফিসিয়াল ইনভয়েস' : 'Official Invoice'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {business.businessName || 'ব্যবসার নাম'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 max-w-sm whitespace-pre-line leading-relaxed">
                {business.businessAddress}
              </p>
              <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3">
                {business.phone && <span>📞 {business.phone}</span>}
                {business.email && <span>✉️ {business.email}</span>}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0 min-w-[200px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {isBn ? 'ইনভয়েস নম্বর' : 'Invoice Number'}
            </span>
            <div
              {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}
              className="text-base sm:text-lg font-black text-indigo-900 font-mono inline-block"
            >
              {invoice.invoiceNumber}
            </div>
            <div className="mt-2 text-xs space-y-0.5">
              <div {...clickProps('field-inv-date', 'চালানের তারিখ এডিট করুন')} className="text-slate-600">
                <span className="text-slate-400">{isBn ? 'ইস্যু তারিখ:' : 'Issued:'}</span> {invoice.invoiceDate}
              </div>
              {invoice.dueDate && (
                <div {...clickProps('field-inv-due-date', 'পরিশোধের শেষ তারিখ এডিট করুন')} className="text-slate-600">
                  <span className="text-slate-400">{isBn ? 'পরিশোধ:' : 'Due:'}</span> {invoice.dueDate}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer & Info Pill Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 px-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/80 my-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">
              {isBn ? 'ইনভয়েস প্রাপক (Billed To):' : 'Billed To:'}
            </span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="font-extrabold text-slate-900 text-sm sm:text-base inline-block"
            >
              {invoice.customer.name || (isBn ? 'নামহীন গ্রাহক' : 'Customer Name')}
            </div>
            {invoice.customer.companyName && (
              <div
                {...clickProps('field-cust-company', 'কোম্পানির নাম এডিট করুন')}
                className="text-xs font-semibold text-slate-700"
              >
                {invoice.customer.companyName}
              </div>
            )}
            <div
              {...clickProps('field-cust-address', 'গ্রাহকের ঠিকানা এডিট করুন')}
              className="text-xs text-slate-600 mt-0.5 whitespace-pre-line"
            >
              {invoice.customer.address || '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3">
              <span {...clickProps('field-cust-phone', 'গ্রাহকের ফোন নম্বর এডিট করুন')}>
                ফোন: {invoice.customer.phone || '—'}
              </span>
              <span {...clickProps('field-cust-email', 'গ্রাহকের ইমেইল এডিট করুন')}>
                ইমেইল: {invoice.customer.email || '—'}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center sm:items-end text-xs space-y-1 text-slate-600">
            <div {...clickProps('field-inv-status', 'পেমেন্ট স্ট্যাটাস এডিট করুন')}>
              <span className="text-slate-400">{isBn ? 'পেমেন্ট স্ট্যাটাস:' : 'Status:'} </span>
              <span
                className={`inline-block font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                  calc.isOverdue
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : invoice.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : invoice.paymentStatus === 'partial'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {calc.isOverdue
                  ? isBn ? 'বিলম্বিত (Overdue)' : 'Overdue'
                  : invoice.paymentStatus === 'paid'
                  ? isBn ? 'পরিশোধিত' : 'Paid'
                  : invoice.paymentStatus === 'partial'
                  ? isBn ? 'আংশিক পরিশোধিত' : 'Partial'
                  : isBn ? 'অপরিশোধিত' : 'Unpaid'}
              </span>
            </div>
            {business.tradeLicense && <div>ট্রেড লাইসেন্স: {business.tradeLicense}</div>}
            {business.binVatNumber && <div>BIN/VAT: {business.binVatNumber}</div>}
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-indigo-600 text-indigo-950 text-[11px] uppercase tracking-wider font-extrabold">
                <th className="py-3 px-3 w-8 text-center">#</th>
                <th
                  {...clickProps(`field-item-name-${invoice.items[0]?.id || ''}`, 'আইটেম নাম এডিট করুন')}
                  className="py-3 px-3 cursor-pointer hover:bg-indigo-50"
                >
                  {isBn ? 'সেবা বা পণ্যের নাম ✏️' : 'Description ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-indigo-50"
                >
                  {isBn ? 'পরিমাণ ✏️' : 'Qty ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'মূল্য এডিট করুন')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-indigo-50"
                >
                  {isBn ? 'মূল্য ✏️' : 'Unit Price ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-discount-${invoice.items[0]?.id || ''}`, 'ছাড় এডিট করুন')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-indigo-50"
                >
                  {isBn ? 'ছাড় ✏️' : 'Discount ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-vat-${invoice.items[0]?.id || ''}`, 'ভ্যাট এডিট করুন')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-indigo-50"
                >
                  {isBn ? 'ভ্যাট ✏️' : 'VAT ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'মোট টাকার হিসাব এডিট করুন')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-indigo-50"
                >
                  {isBn ? 'মোট ✏️' : 'Total ✏️'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {invoice.items.map((item, idx) => {
                const qtyStr = isBn ? toBengaliNumerals(item.quantity) : String(item.quantity);
                const unitStr = item.unit === 'custom' ? item.customUnit || '' : item.unit;
                return (
                  <tr key={item.id || idx} className="hover:bg-indigo-50/30 transition">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">
                      {isBn ? toBengaliNumerals(idx + 1) : idx + 1}
                    </td>
                    <td
                      {...clickProps(`field-item-name-${item.id}`, 'আইটেমের নাম এডিট করুন')}
                      className="py-3 px-3"
                    >
                      <div className="font-bold text-slate-900">{item.name || 'আইটেম'}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td
                      {...clickProps(`field-item-qty-${item.id}`, 'পরিমাণ (Quantity) এডিট করুন')}
                      className="py-3 px-3 text-center whitespace-nowrap font-bold text-indigo-900"
                    >
                      {qtyStr} <span className="text-[10px] text-slate-400 font-normal">{unitStr}</span>
                    </td>
                    <td
                      {...clickProps(`field-item-price-${item.id}`, 'একক দর (Price) এডিট করুন')}
                      className="py-3 px-3 text-right font-medium"
                    >
                      {currencySymbol} {numFormat(item.unitPrice)}
                    </td>
                    <td
                      {...clickProps(`field-item-discount-${item.id}`, 'ছাড় (Discount) এডিট করুন')}
                      className="py-3 px-3 text-right text-slate-500"
                    >
                      {item.discountValue > 0
                        ? item.discountType === 'percent'
                          ? `${isBn ? toBengaliNumerals(item.discountValue) : item.discountValue}%`
                          : `${currencySymbol}${numFormat(item.discountValue)}`
                        : '—'}
                    </td>
                    <td
                      {...clickProps(`field-item-vat-${item.id}`, 'ভ্যাট এডিট করুন')}
                      className="py-3 px-3 text-right text-slate-500"
                    >
                      {item.vatRate > 0
                        ? `${isBn ? toBengaliNumerals(item.vatRate) : item.vatRate}%`
                        : '—'}
                    </td>
                    <td
                      {...clickProps(`field-item-price-${item.id}`, 'মোটের হিসাব পরিবর্তন করুন')}
                      className="py-3 px-3 text-right font-black text-indigo-950"
                    >
                      {currencySymbol} {numFormat(item.lineTotal || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation & Bank Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-200">
          <div className="md:col-span-7 space-y-3">
            <div
              {...clickProps('field-calc-subtotal', 'আইটেমের মোট টাকা')}
              className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100"
            >
              <span className="text-[10px] uppercase font-bold text-indigo-500 block tracking-wider">
                {isBn ? 'কথায় মোট টাকা:' : 'Amount In Words:'}
              </span>
              <p className="text-xs font-bold text-indigo-950 mt-0.5">{amountInWords}</p>
            </div>

            {(business.bkashNumber || business.nagadNumber || business.bankAccountNumber) && (
              <div
                {...clickProps('field-business-settings', 'পেমেন্ট ও ব্যাংক তথ্য পরিবর্তন করতে সেটিংস খুলুন')}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1"
              >
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                  {isBn ? 'পেমেন্ট গ্রহণের মাধ্যম:' : 'Payment Gateways:'}
                </span>
                {business.bkashNumber && (
                  <div>
                    <span className="font-semibold text-pink-600">bKash:</span> {business.bkashNumber}
                  </div>
                )}
                {business.nagadNumber && (
                  <div>
                    <span className="font-semibold text-orange-600">Nagad:</span> {business.nagadNumber}
                  </div>
                )}
                {business.bankAccountNumber && (
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-indigo-900">{business.bankName}:</span>{' '}
                    A/C {business.bankAccountNumber} ({business.bankAccountName})
                  </div>
                )}
              </div>
            )}

            <div
              {...clickProps('field-inv-notes', 'বিশেষ নোট এডিট করুন')}
              className="text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/60"
            >
              <strong>{isBn ? 'বিশেষ নোট:' : 'Notes:'}</strong> {invoice.notes || '—'}
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-2 text-xs">
              <div
                {...clickProps('field-calc-subtotal', 'সাবটোটাল')}
                className="flex justify-between text-slate-300 p-1 rounded hover:bg-slate-800"
              >
                <span>{isBn ? 'সাবটোটাল:' : 'Subtotal:'}</span>
                <span className="font-semibold">
                  {currencySymbol} {numFormat(calc.subtotal)}
                </span>
              </div>

              {calc.itemDiscounts > 0 && (
                <div
                  {...clickProps(`field-item-discount-${invoice.items[0]?.id || ''}`, 'আইটেম ছাড় পরিবর্তন করুন')}
                  className="flex justify-between text-rose-300 p-1 rounded hover:bg-slate-800"
                >
                  <span>{isBn ? 'আইটেম ছাড়:' : 'Item Discount:'}</span>
                  <span>-{currencySymbol} {numFormat(calc.itemDiscounts)}</span>
                </div>
              )}

              {calc.totalVat > 0 && (
                <div
                  {...clickProps(`field-item-vat-${invoice.items[0]?.id || ''}`, 'ভ্যাট পরিবর্তন করুন')}
                  className="flex justify-between text-slate-300 p-1 rounded hover:bg-slate-800"
                >
                  <span>{isBn ? 'ভ্যাট / ট্যাক্স:' : 'VAT/Tax:'}</span>
                  <span>+{currencySymbol} {numFormat(calc.totalVat)}</span>
                </div>
              )}

              <div
                {...clickProps('field-inv-discount', 'ইনভয়েস ছাড় পরিবর্তন করুন')}
                className="flex justify-between text-rose-300 p-1 rounded hover:bg-slate-800"
              >
                <span>{isBn ? 'ইনভয়েস ছাড়:' : 'Invoice Discount:'}</span>
                <span>-{currencySymbol} {numFormat(calc.invoiceDiscount)}</span>
              </div>

              <div
                {...clickProps('field-inv-shipping', 'ডেলিভারি চার্জ পরিবর্তন করুন')}
                className="flex justify-between text-slate-300 p-1 rounded hover:bg-slate-800"
              >
                <span>{isBn ? 'অন্যান্য চার্জ:' : 'Shipping:'}</span>
                <span>+{currencySymbol} {numFormat(calc.shipping)}</span>
              </div>

              <div
                {...clickProps('field-calc-subtotal', 'সর্বমোট বিল')}
                className="pt-2 border-t border-slate-700 flex justify-between font-black text-base text-white p-1 rounded hover:bg-slate-800"
              >
                <span>{isBn ? 'সর্বমোট প্রদেয়:' : 'Grand Total:'}</span>
                <span className="text-amber-400">
                  {currencySymbol} {numFormat(calc.grandTotal)}
                </span>
              </div>

              <div
                {...clickProps('field-inv-paid-amount', 'পরিশোধিত টাকা পরিবর্তন করুন')}
                className="flex justify-between text-emerald-400 font-semibold pt-1 p-1 rounded hover:bg-slate-800"
              >
                <span>{isBn ? 'পরিশোধিত:' : 'Paid:'}</span>
                <span>{currencySymbol} {numFormat(calc.paidAmount)}</span>
              </div>

              <div
                {...clickProps('field-inv-paid-amount', 'বকেয়া পরিবর্তন করতে পরিশোধিত টাকা এডিট করুন')}
                className="flex justify-between text-rose-400 font-bold text-sm pt-1 border-t border-dashed border-slate-700 p-1 rounded hover:bg-slate-800"
              >
                <span>{isBn ? 'বকেয়া পাওনা:' : 'Due:'}</span>
                <span>{currencySymbol} {numFormat(calc.dueAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-slate-200">
        <div className="flex justify-between items-end gap-6">
          <div
            {...clickProps('field-inv-terms', 'শর্তাবলী এডিট করুন')}
            className="text-xs text-slate-500 max-w-sm p-1 rounded"
          >
            {invoice.terms && (
              <p className="whitespace-pre-line text-[11px] mb-1">
                <strong>{isBn ? 'শর্তাবলী:' : 'Terms:'}</strong> {invoice.terms}
              </p>
            )}
            <p className="text-[10px] text-slate-400">
              {business.defaultInvoiceFooter || 'The MoSaFa Tools • ইনভয়েস ও মানি রিসিট প্রস্তুতকারক'}
            </p>
          </div>

          <div
            {...clickProps('field-inv-signature', 'অনুমোদিত স্বাক্ষরের পদবী এডিট করুন')}
            className="text-center shrink-0 p-1 rounded"
          >
            <div className="w-36 border-b-2 border-indigo-600 mb-1" />
            <p className="text-xs font-bold text-slate-900">
              {invoice.signatureTitle || (isBn ? 'অনুমোদিত স্বাক্ষর' : 'Authorized Signature')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
