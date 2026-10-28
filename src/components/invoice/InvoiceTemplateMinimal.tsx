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

export const InvoiceTemplateMinimal: React.FC<TemplateProps> = ({ invoice, business, calc, onEditField }) => {
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
    <div className="bg-white text-black p-8 sm:p-10 font-sans text-xs sm:text-sm min-h-[900px] flex flex-col justify-between border border-black/20 shadow-none print:border-none print:p-6 print:m-0 print:min-h-0 select-none">
      <div>
        {/* Minimal Black & White Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-black">
          <div
            {...clickProps('field-business-settings', 'ব্যবসার তথ্য ও প্রোফাইল এডিট করুন')}
            className="p-1 rounded cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 transition"
          >
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
              {business.businessName || 'INVOICE'}
            </h1>
            <p className="text-xs text-black/70 mt-0.5 whitespace-pre-line">{business.businessAddress}</p>
            <div className="text-[11px] text-black/70 mt-1 flex flex-wrap gap-x-3">
              {business.phone && <span>Tel: {business.phone}</span>}
              {business.email && <span>Email: {business.email}</span>}
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <h2 className="text-xl font-bold uppercase tracking-wider">{isBn ? 'ইনভয়েস' : 'INVOICE'}</h2>
            <div className="text-xs font-mono mt-1 space-y-0.5">
              <div {...clickProps('field-inv-number', 'ইনভয়েস নম্বর এডিট করুন')}>
                <strong>NO:</strong> {invoice.invoiceNumber}
              </div>
              <div {...clickProps('field-inv-date', 'তারিখ এডিট করুন')}>
                <strong>DATE:</strong> {invoice.invoiceDate}
              </div>
              {invoice.dueDate && (
                <div {...clickProps('field-inv-due-date', 'পরিশোধের শেষ সময় এডিট করুন')}>
                  <strong>DUE:</strong> {invoice.dueDate}
                </div>
              )}
              <div {...clickProps('field-inv-status', 'পেমেন্ট স্ট্যাটাস এডিট করুন')}>
                <strong>STATUS:</strong> {invoice.paymentStatus.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Client & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-black/20">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest block mb-1">
              {isBn ? 'গ্রাহক তথ্য:' : 'BILLED TO:'}
            </span>
            <div
              {...clickProps('field-cust-name', 'গ্রাহকের নাম এডিট করুন')}
              className="font-bold text-sm inline-block"
            >
              {invoice.customer.name || 'Customer'}
            </div>
            {invoice.customer.companyName && (
              <div
                {...clickProps('field-cust-company', 'কোম্পানির নাম এডিট করুন')}
                className="text-xs"
              >
                {invoice.customer.companyName}
              </div>
            )}
            <div
              {...clickProps('field-cust-address', 'গ্রাহকের ঠিকানা এডিট করুন')}
              className="text-xs text-black/80 mt-0.5"
            >
              {invoice.customer.address || '—'}
            </div>
            {invoice.customer.phone && (
              <div
                {...clickProps('field-cust-phone', 'গ্রাহকের ফোন নম্বর এডিট করুন')}
                className="text-xs text-black/70 mt-0.5"
              >
                Ph: {invoice.customer.phone}
              </div>
            )}
          </div>

          <div
            {...clickProps('field-business-settings', 'ট্রেড লাইসেন্স বা ভ্যাট নম্বর পরিবর্তন করুন')}
            className="sm:text-right text-xs space-y-0.5 self-end p-2 rounded cursor-pointer hover:bg-rose-50"
          >
            {business.tradeLicense && <div>Trade Lic: {business.tradeLicense}</div>}
            {business.binVatNumber && <div>BIN/VAT: {business.binVatNumber}</div>}
          </div>
        </div>

        {/* Minimal Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-[11px] font-bold uppercase">
                <th className="py-2 px-2 w-8 text-center">#</th>
                <th
                  {...clickProps(`field-item-name-${invoice.items[0]?.id || ''}`, 'আইটেম নাম এডিট করুন')}
                  className="py-2 px-2 cursor-pointer hover:bg-black/10"
                >
                  {isBn ? 'আইটেম ✏️' : 'Item ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'পরিমাণ এডিট করুন')}
                  className="py-2 px-2 text-center cursor-pointer hover:bg-black/10"
                >
                  {isBn ? 'পরিমাণ ✏️' : 'Qty ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'মূল্য এডিট করুন')}
                  className="py-2 px-2 text-right cursor-pointer hover:bg-black/10"
                >
                  {isBn ? 'মূল্য ✏️' : 'Price ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-discount-${invoice.items[0]?.id || ''}`, 'ছাড় এডিট করুন')}
                  className="py-2 px-2 text-right cursor-pointer hover:bg-black/10"
                >
                  {isBn ? 'ছাড় ✏️' : 'Disc ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-vat-${invoice.items[0]?.id || ''}`, 'ট্যাক্স এডিট করুন')}
                  className="py-2 px-2 text-right cursor-pointer hover:bg-black/10"
                >
                  {isBn ? 'ভ্যাট ✏️' : 'Tax ✏️'}
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'মোটের হিসাব পরিবর্তন করুন')}
                  className="py-2 px-2 text-right cursor-pointer hover:bg-black/10"
                >
                  {isBn ? 'মোট ✏️' : 'Total ✏️'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-xs">
              {invoice.items.map((item, idx) => {
                const qtyStr = isBn ? toBengaliNumerals(item.quantity) : String(item.quantity);
                const unitStr = item.unit === 'custom' ? item.customUnit || '' : item.unit;
                return (
                  <tr key={item.id || idx}>
                    <td className="py-2 px-2 text-center text-black/50 font-mono">
                      {isBn ? toBengaliNumerals(idx + 1) : idx + 1}
                    </td>
                    <td
                      {...clickProps(`field-item-name-${item.id}`, 'আইটেমের নাম এডিট করুন')}
                      className="py-2 px-2"
                    >
                      <div className="font-semibold">{item.name || 'Item'}</div>
                      {item.description && <div className="text-[11px] text-black/60">{item.description}</div>}
                    </td>
                    <td
                      {...clickProps(`field-item-qty-${item.id}`, 'পরিমাণ (Quantity) এডিট করুন')}
                      className="py-2 px-2 text-center font-bold"
                    >
                      {qtyStr} <span className="font-normal text-black/60">{unitStr}</span>
                    </td>
                    <td
                      {...clickProps(`field-item-price-${item.id}`, 'দর (Price) এডিট করুন')}
                      className="py-2 px-2 text-right font-mono"
                    >
                      {currencySymbol} {numFormat(item.unitPrice)}
                    </td>
                    <td
                      {...clickProps(`field-item-discount-${item.id}`, 'ছাড় (Discount) এডিট করুন')}
                      className="py-2 px-2 text-right font-mono"
                    >
                      {item.discountValue > 0 ? `${currencySymbol}${numFormat(item.discountValue)}` : '—'}
                    </td>
                    <td
                      {...clickProps(`field-item-vat-${item.id}`, 'ভ্যাট এডিট করুন')}
                      className="py-2 px-2 text-right font-mono"
                    >
                      {item.vatRate > 0 ? `${item.vatRate}%` : '—'}
                    </td>
                    <td
                      {...clickProps(`field-item-price-${item.id}`, 'মোটের হিসাব পরিবর্তন করুন')}
                      className="py-2 px-2 text-right font-bold font-mono"
                    >
                      {currencySymbol} {numFormat(item.lineTotal || 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Minimal Summary */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 pt-3 border-t border-black/20">
          <div className="md:col-span-7 space-y-2">
            <div
              {...clickProps('field-calc-subtotal', 'আইটেমের মোট টাকা')}
              className="border border-black p-2.5 text-xs"
            >
              <span className="font-bold block text-[10px] uppercase">
                {isBn ? 'কথায় মোট টাকা:' : 'Amount in words:'}
              </span>
              <p className="mt-0.5">{amountInWords}</p>
            </div>

            {(business.bkashNumber || business.bankAccountNumber) && (
              <div
                {...clickProps('field-business-settings', 'পেমেন্ট ও ব্যাংক তথ্য পরিবর্তন করতে সেটিংস খুলুন')}
                className="text-xs space-y-0.5 border border-dashed border-black/40 p-2.5"
              >
                <span className="font-bold text-[10px] uppercase block">Payment:</span>
                {business.bkashNumber && <div>bKash: {business.bkashNumber}</div>}
                {business.bankAccountNumber && (
                  <div>
                    {business.bankName} - A/C: {business.bankAccountNumber}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:col-span-5">
            <div className="border border-black p-3 space-y-1.5 text-xs font-mono">
              <div
                {...clickProps('field-calc-subtotal', 'সাবটোটাল')}
                className="flex justify-between p-1 rounded hover:bg-rose-50"
              >
                <span>SUBTOTAL:</span>
                <span>{currencySymbol} {numFormat(calc.subtotal)}</span>
              </div>
              <div
                {...clickProps('field-inv-discount', 'ছাড় পরিবর্তন করুন')}
                className="flex justify-between p-1 rounded hover:bg-rose-50"
              >
                <span>DISCOUNT:</span>
                <span>-{currencySymbol} {numFormat(calc.totalDiscount)}</span>
              </div>
              <div
                {...clickProps(`field-item-vat-${invoice.items[0]?.id || ''}`, 'ভ্যাট পরিবর্তন করুন')}
                className="flex justify-between p-1 rounded hover:bg-rose-50"
              >
                <span>TAX/VAT:</span>
                <span>+{currencySymbol} {numFormat(calc.totalVat)}</span>
              </div>
              <div
                {...clickProps('field-inv-shipping', 'ডেলিভারি চার্জ পরিবর্তন করুন')}
                className="flex justify-between p-1 rounded hover:bg-rose-50"
              >
                <span>SHIPPING:</span>
                <span>+{currencySymbol} {numFormat(calc.shipping)}</span>
              </div>
              <div
                {...clickProps('field-calc-subtotal', 'সর্বমোট বিল')}
                className="pt-1.5 border-t border-black flex justify-between font-bold text-sm p-1 rounded hover:bg-rose-50"
              >
                <span>TOTAL:</span>
                <span>{currencySymbol} {numFormat(calc.grandTotal)}</span>
              </div>
              <div
                {...clickProps('field-inv-paid-amount', 'পরিশোধিত টাকা পরিবর্তন করুন')}
                className="flex justify-between p-1 rounded hover:bg-rose-50"
              >
                <span>PAID:</span>
                <span>{currencySymbol} {numFormat(calc.paidAmount)}</span>
              </div>
              <div
                {...clickProps('field-inv-paid-amount', 'বকেয়া পরিবর্তন করতে পরিশোধিত টাকা এডিট করুন')}
                className="flex justify-between font-bold pt-1 border-t border-dashed border-black p-1 rounded hover:bg-rose-50"
              >
                <span>DUE:</span>
                <span>{currencySymbol} {numFormat(calc.dueAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="mt-8 pt-4 border-t border-black flex justify-between items-end">
        <div
          {...clickProps('field-inv-terms', 'শর্তাবলী এডিট করুন')}
          className="text-[10px] text-black/70 max-w-sm p-1 rounded"
        >
          {invoice.terms && <p><strong>Terms:</strong> {invoice.terms}</p>}
          <p className="mt-0.5">{business.defaultInvoiceFooter}</p>
        </div>
        <div
          {...clickProps('field-inv-signature', 'স্বাক্ষরের পদবী এডিট করুন')}
          className="text-center shrink-0 p-1 rounded"
        >
          <div className="w-32 border-b border-black mb-1" />
          <p className="text-[11px] font-bold">{invoice.signatureTitle || 'Signature'}</p>
        </div>
      </div>
    </div>
  );
};
