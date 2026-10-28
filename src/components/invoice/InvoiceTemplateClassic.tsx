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

export const InvoiceTemplateClassic: React.FC<TemplateProps> = ({ invoice, business, calc, onEditField }) => {
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
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-slate-800">
          <div
            {...clickProps('field-business-settings', 'ব্যবসার নাম ও প্রোফাইল এডিট করুন')}
            className="flex items-start gap-3.5 p-1 rounded-xl cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 transition"
          >
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-lg border border-slate-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xl shrink-0">
                {business.businessName.charAt(0) || 'M'}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {business.businessName || 'ব্যবসার নাম'}
              </h1>
              {business.ownerName && (
                <p className="text-xs text-slate-600 font-medium">স্বত্বাধিকারী: {business.ownerName}</p>
              )}
              <p className="text-xs text-slate-500 mt-1 max-w-sm whitespace-pre-line">
                {business.businessAddress}
              </p>
              <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                {business.phone && <span>📞 {business.phone}</span>}
                {business.email && <span>✉️ {business.email}</span>}
                {business.website && <span>🌐 {business.website}</span>}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 space-y-1">
            <div className="inline-block bg-slate-900 text-white font-extrabold px-3 py-1 text-xs uppercase tracking-wider rounded-sm mb-2">
              {isBn ? 'ইনভয়েস / বিল' : 'INVOICE'}
            </div>
            <div {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}>
              <span className="text-slate-500">{isBn ? 'ইনভয়েস নং:' : 'Invoice No:'} </span>
              <span className="font-bold text-slate-900">{invoice.invoiceNumber}</span>
            </div>
            <div {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}>
              <span className="text-slate-500">{isBn ? 'তারিখ:' : 'Date:'} </span>
              <span className="font-semibold text-slate-800">{invoice.invoiceDate}</span>
            </div>
            {invoice.dueDate && (
              <div {...clickProps('field-inv-due-date', 'পরিশোধের শেষ তারিখ এডিট করুন')}>
                <span className="text-slate-500">{isBn ? 'পরিশোধের শেষ তারিখ:' : 'Due Date:'} </span>
                <span className="font-semibold text-slate-800">{invoice.dueDate}</span>
              </div>
            )}
            <div {...clickProps('field-inv-status', 'পেমেন্ট স্ট্যাটাস এডিট করুন')}>
              <span className="text-slate-500">{isBn ? 'স্ট্যাটাস:' : 'Status:'} </span>
              <span
                className={`inline-block font-bold px-2 py-0.5 rounded text-[11px] uppercase ${
                  calc.isOverdue
                    ? 'bg-rose-100 text-rose-700'
                    : invoice.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : invoice.paymentStatus === 'partial'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {calc.isOverdue
                  ? isBn
                    ? 'বিলম্বিত (Overdue)'
                    : 'Overdue'
                  : invoice.paymentStatus === 'paid'
                  ? isBn
                    ? 'পরিশোধিত (Paid)'
                    : 'Paid'
                  : invoice.paymentStatus === 'partial'
                  ? isBn
                    ? 'আংশিক পরিশোধিত'
                    : 'Partial'
                  : isBn
                  ? 'অপরিশোধিত (Unpaid)'
                  : 'Unpaid'}
              </span>
            </div>
          </div>
        </div>

        {/* Billed To / Customer Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {isBn ? 'বিল গ্রাহক (Customer):' : 'Billed To:'}
            </span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="font-bold text-slate-900 text-sm sm:text-base inline-block"
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
              className="text-xs text-slate-600 whitespace-pre-line"
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

          {(business.tradeLicense || business.binVatNumber) && (
            <div
              {...clickProps('field-business-settings', 'ট্রেড লাইসেন্স বা ভ্যাট নম্বর পরিবর্তন করুন')}
              className="text-left sm:text-right space-y-1 text-xs text-slate-600 self-end p-2 rounded cursor-pointer hover:bg-rose-50"
            >
              {business.tradeLicense && (
                <div>
                  <span className="text-slate-400">ট্রেড লাইসেন্স নং:</span> {business.tradeLicense}
                </div>
              )}
              {business.binVatNumber && (
                <div>
                  <span className="text-slate-400">BIN / VAT নং:</span> {business.binVatNumber}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3 w-8 text-center">#</th>
                <th
                  {...clickProps(`field-item-name-${invoice.items[0]?.id || ''}`, 'আইটেম এডিট করুন')}
                  className="py-2.5 px-3 cursor-pointer hover:bg-slate-800"
                >
                  {isBn ? 'বিবরণ / আইটেম ✏️' : 'Description ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-800"
                >
                  {isBn ? 'পরিমাণ ✏️' : 'Qty ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'দর এডিট করুন')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-800"
                >
                  {isBn ? 'দর (একক) ✏️' : 'Unit Price ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-discount-${invoice.items[0]?.id || ''}`, 'ছাড় এডিট করুন')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-800"
                >
                  {isBn ? 'ছাড় ✏️' : 'Discount ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-vat-${invoice.items[0]?.id || ''}`, 'ভ্যাট এডিট করুন')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-800"
                >
                  {isBn ? 'ভ্যাট/ট্যাক্স ✏️' : 'VAT ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'মোট টাকার হিসাব এডিট করুন')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-800"
                >
                  {isBn ? 'মোট ✏️' : 'Total ✏️'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {invoice.items.map((item, idx) => {
                const qtyStr = isBn ? toBengaliNumerals(item.quantity) : String(item.quantity);
                const unitStr = item.unit === 'custom' ? item.customUnit || '' : item.unit;
                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                      {isBn ? toBengaliNumerals(idx + 1) : idx + 1}
                    </td>
                    <td
                      {...clickProps(`field-item-name-${item.id}`, 'এই আইটেমের নাম এডিট করুন')}
                      className="py-2.5 px-3"
                    >
                      <div className="font-bold text-slate-900">{item.name || 'আইটেম'}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td
                      {...clickProps(`field-item-qty-${item.id}`, 'এই আইটেমের পরিমাণ (Quantity) এডিট করুন')}
                      className="py-2.5 px-3 text-center whitespace-nowrap"
                    >
                      <span className="font-bold text-indigo-950">{qtyStr}</span>{' '}
                      <span className="text-[11px] text-slate-500">{unitStr}</span>
                    </td>
                    <td
                      {...clickProps(`field-item-price-${item.id}`, 'এই আইটেমের দর (Price) এডিট করুন')}
                      className="py-2.5 px-3 text-right font-medium"
                    >
                      {currencySymbol} {numFormat(item.unitPrice)}
                    </td>
                    <td
                      {...clickProps(`field-item-discount-${item.id}`, 'এই আইটেমের ছাড় (Discount) এডিট করুন')}
                      className="py-2.5 px-3 text-right text-slate-600"
                    >
                      {item.discountValue > 0
                        ? item.discountType === 'percent'
                          ? `${isBn ? toBengaliNumerals(item.discountValue) : item.discountValue}%`
                          : `${currencySymbol}${numFormat(item.discountValue)}`
                        : '—'}
                    </td>
                    <td
                      {...clickProps(`field-item-vat-${item.id}`, 'এই আইটেমের ভ্যাট হার এডিট করুন')}
                      className="py-2.5 px-3 text-right text-slate-600"
                    >
                      {item.vatRate > 0
                        ? `${isBn ? toBengaliNumerals(item.vatRate) : item.vatRate}%`
                        : '—'}
                    </td>
                    <td
                      {...clickProps(`field-item-price-${item.id}`, 'এই আইটেমের মূল্য বা পরিমাণ পরিবর্তন করুন')}
                      className="py-2.5 px-3 text-right font-bold text-slate-900"
                    >
                      {currencySymbol} {numFormat(item.lineTotal || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary & Payment Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-200">
          <div className="md:col-span-7 space-y-3">
            {/* Amount in words */}
            <div
              {...clickProps('field-calc-subtotal', 'আইটেমের মোট মূল্য')}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
                {isBn ? 'কথায় (In Words):' : 'Amount In Words:'}
              </span>
              <p className="text-xs font-semibold text-slate-800 leading-snug">{amountInWords}</p>
            </div>

            {/* Bank & MFS Payment Details */}
            {(business.bkashNumber || business.nagadNumber || business.bankAccountNumber) && (
              <div
                {...clickProps('field-business-settings', 'পেমেন্ট মেথড ও ব্যাংক তথ্য পরিবর্তন করতে সেটিংস খুলুন')}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
              >
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                  {isBn ? 'পেমেন্ট নির্দেশিকা (Payment Instructions):' : 'Payment Methods:'}
                </span>
                {business.bkashNumber && (
                  <div className="text-slate-700">
                    <span className="font-semibold text-pink-700">bKash:</span> {business.bkashNumber}
                  </div>
                )}
                {business.nagadNumber && (
                  <div className="text-slate-700">
                    <span className="font-semibold text-orange-700">Nagad:</span> {business.nagadNumber}
                  </div>
                )}
                {business.bankAccountNumber && (
                  <div className="text-slate-700 text-[11px] pt-0.5">
                    <span className="font-semibold text-indigo-800">{business.bankName}:</span> A/C:{' '}
                    {business.bankAccountNumber} ({business.bankAccountName})
                  </div>
                )}
              </div>
            )}

            <div
              {...clickProps('field-inv-notes', 'নোট এডিট করুন')}
              className="text-xs text-slate-600 p-1 rounded"
            >
              <span className="font-bold text-slate-700">{isBn ? 'নোট:' : 'Notes:'} </span>
              {invoice.notes || '—'}
            </div>
          </div>

          {/* Right Summary Table */}
          <div className="md:col-span-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div
                {...clickProps('field-calc-subtotal', 'আইটেমের মোট সাবটোটাল')}
                className="flex justify-between text-slate-600 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>{isBn ? 'সাবটোটাল (Subtotal):' : 'Subtotal:'}</span>
                <span className="font-semibold">
                  {currencySymbol} {numFormat(calc.subtotal)}
                </span>
              </div>

              {calc.itemDiscounts > 0 && (
                <div
                  {...clickProps(`field-item-discount-${invoice.items[0]?.id || ''}`, 'আইটেম ডিসকাউন্ট পরিবর্তন করুন')}
                  className="flex justify-between text-rose-600 p-1 rounded cursor-pointer hover:bg-rose-50"
                >
                  <span>{isBn ? 'আইটেম ডিসকাউন্ট:' : 'Item Discount:'}</span>
                  <span>
                    -{currencySymbol} {numFormat(calc.itemDiscounts)}
                  </span>
                </div>
              )}

              {calc.totalVat > 0 && (
                <div
                  {...clickProps(`field-item-vat-${invoice.items[0]?.id || ''}`, 'ভ্যাট পরিবর্তন করুন')}
                  className="flex justify-between text-slate-600 p-1 rounded cursor-pointer hover:bg-rose-50"
                >
                  <span>{isBn ? 'মোট ভ্যাট / ট্যাক্স:' : 'Total VAT / Tax:'}</span>
                  <span className="font-semibold">
                    +{currencySymbol} {numFormat(calc.totalVat)}
                  </span>
                </div>
              )}

              <div
                {...clickProps('field-inv-discount', 'ইনভয়েস বিশেষ ছাড় এডিট করুন')}
                className="flex justify-between text-rose-600 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>{isBn ? 'ইনভয়েস বিশেষ ছাড়:' : 'Invoice Discount:'}</span>
                <span>
                  -{currencySymbol} {numFormat(calc.invoiceDiscount)}
                </span>
              </div>

              <div
                {...clickProps('field-inv-shipping', 'ডেলিভারি চার্জ এডিট করুন')}
                className="flex justify-between text-slate-600 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>{isBn ? 'ডেলিভারি / অন্যান্য চার্জ:' : 'Shipping / Extra:'}</span>
                <span>
                  +{currencySymbol} {numFormat(calc.shipping)}
                </span>
              </div>

              <div
                {...clickProps('field-calc-subtotal', 'সর্বমোট বিল')}
                className="pt-2 border-t border-slate-300 flex justify-between font-black text-sm sm:text-base text-slate-900 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>{isBn ? 'সর্বমোট (Grand Total):' : 'Grand Total:'}</span>
                <span className="text-indigo-900">
                  {currencySymbol} {numFormat(calc.grandTotal)}
                </span>
              </div>

              <div
                {...clickProps('field-inv-paid-amount', 'পরিশোধিত টাকা (Paid Amount) পরিবর্তন করুন')}
                className="flex justify-between text-emerald-700 font-semibold pt-1 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>{isBn ? 'পরিশোধিত (Paid Amount):' : 'Paid Amount:'}</span>
                <span>
                  {currencySymbol} {numFormat(calc.paidAmount)}
                </span>
              </div>

              <div
                {...clickProps('field-inv-paid-amount', 'বকেয়া পরিবর্তন করতে পরিশোধিত টাকা এডিট করুন')}
                className="flex justify-between text-rose-700 font-bold text-sm pt-1 border-t border-dashed border-slate-300 p-1 rounded cursor-pointer hover:bg-rose-50"
              >
                <span>{isBn ? 'বকেয়া (Due Amount):' : 'Due Amount:'}</span>
                <span>
                  {currencySymbol} {numFormat(calc.dueAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Signature */}
      <div className="mt-10 pt-6 border-t border-slate-200">
        <div className="flex justify-between items-end gap-6">
          <div
            {...clickProps('field-inv-terms', 'শর্তাবলী এডিট করুন')}
            className="text-xs text-slate-500 max-w-sm p-1 rounded"
          >
            {invoice.terms && (
              <p className="whitespace-pre-line leading-relaxed text-[11px] mb-1">
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
            <div className="w-40 border-b border-slate-800 mb-1" />
            <p className="text-xs font-bold text-slate-800">
              {invoice.signatureTitle || (isBn ? 'অনুমোদিত স্বাক্ষর' : 'Authorized Signature')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
