import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, numberToWordsEnglish, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateModern: React.FC<InvoiceTemplateProps> = ({
  invoice,
  business,
  calc,
  onEditField,
  onUpdateInvoice,
  onUpdateBusiness,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onOpenSignatureModal,
}) => {
  const isBn = invoice.language === 'bn';
  const currencySymbol = invoice.currency.includes('৳') ? '৳' : invoice.currency.split(' ')[0] || '৳';

  const amountInWords = isBn
    ? cleanBengaliAmountInWords(calc.grandTotal)
    : numberToWordsEnglish(calc.grandTotal, currencySymbol === '৳' ? 'Taka' : 'Currency');

  const numFormat = (num: number) =>
    isBn ? toBengaliNumerals(formatMoney(num, '')) : formatMoney(num, '');

  const custNameRef = useRef<HTMLInputElement>(null);
  const custCompanyRef = useRef<HTMLInputElement>(null);
  const custAddressRef = useRef<HTMLInputElement>(null);
  const custPhoneRef = useRef<HTMLInputElement>(null);
  const invNumberRef = useRef<HTMLInputElement>(null);
  const invDateRef = useRef<HTMLInputElement>(null);
  const invDueDateRef = useRef<HTMLInputElement>(null);
  const bizNameRef = useRef<HTMLInputElement>(null);

  return (
    <div className="invoice-printable-doc bg-white text-slate-800 p-8 sm:p-10 font-sans text-xs sm:text-sm min-h-[900px] flex flex-col justify-between border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 select-none">
      <div>
        {/* Top Gradient Accent Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 rounded-full mb-6 print:hidden" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6">
          <div className="flex items-start gap-4 flex-1 w-full">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-2xl shadow-sm border border-slate-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-100 shrink-0">
                {business.businessName?.charAt(0) || 'M'}
              </div>
            )}
            <div 
              onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
              className="flex-1 cursor-pointer"
            >
              <input
                type="text"
                value={invoice.memoTypeTitle || (isBn ? 'অফিসিয়াল ইনভয়েস' : 'Official Invoice')}
                onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
                className="text-[10px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full border-none focus:outline-none print:p-0"
              />
              <input
                ref={bizNameRef}
                type="text"
                value={business.businessName || ''}
                placeholder={isBn ? 'ব্যবসার নাম' : 'Business Name'}
                onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
                className="w-full text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 bg-transparent border-none focus:outline-none focus:bg-slate-50 rounded py-2 sm:py-3 min-h-[48px] sm:min-h-[58px] leading-relaxed print:p-0"
              />
              <input
                type="text"
                value={business.businessAddress || ''}
                placeholder={isBn ? 'ঠিকানা লিখুন...' : 'Address...'}
                onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
                className="w-full text-xs text-slate-500 mt-0.5 bg-transparent border-none focus:outline-none focus:bg-slate-50 rounded py-0.5 print:p-0"
              />
              <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3">
                <div className="flex items-center gap-1">
                  <span>📞</span>
                  <input
                    type="text"
                    value={business.phone || ''}
                    placeholder="Phone"
                    onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
                    className="font-mono bg-transparent border-b border-slate-300 focus:outline-none px-1 py-0.5 w-28 print:border-none print:p-0"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span>✉️</span>
                  <input
                    type="text"
                    value={business.email || ''}
                    placeholder="Email"
                    onChange={(e) => onUpdateBusiness?.({ email: e.target.value })}
                    className="font-mono bg-transparent border-b border-slate-300 focus:outline-none px-1 py-0.5 w-36 print:border-none print:p-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0 min-w-[200px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              {isBn ? 'ইনভয়েস নম্বর' : 'Invoice Number'}
            </span>
            <div 
              onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
              className="cursor-pointer"
            >
              <input
                ref={invNumberRef}
                type="text"
                value={invoice.invoiceNumber || ''}
                placeholder="INV-0001"
                onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
                className="text-base sm:text-lg font-black text-indigo-900 font-mono sm:text-right bg-transparent border-none focus:outline-none w-32 print:p-0"
              />
            </div>
            <div className="mt-2 text-xs space-y-1">
              <div 
                onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
                className="text-slate-600 flex items-center sm:justify-end gap-1 cursor-pointer"
              >
                <span className="text-slate-400">{isBn ? 'তারিখঃ' : 'Date:'}</span>
                <input
                  ref={invDateRef}
                  type="text"
                  value={invoice.invoiceDate || ''}
                  placeholder="Date"
                  onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
                  className="font-mono font-bold sm:text-right bg-transparent border-b border-slate-200 focus:outline-none w-28 print:border-none print:p-0"
                />
              </div>
              <div 
                onClick={() => { invDueDateRef.current?.focus(); onEditField?.('field-inv-due-date'); }}
                className="text-slate-600 flex items-center sm:justify-end gap-1 cursor-pointer"
              >
                <span className="text-slate-400">{isBn ? 'পরিশোধঃ' : 'Due:'}</span>
                <input
                  ref={invDueDateRef}
                  type="text"
                  value={invoice.dueDate || ''}
                  placeholder="Due Date"
                  onChange={(e) => onUpdateInvoice?.({ dueDate: e.target.value })}
                  className="font-mono sm:text-right bg-transparent border-b border-slate-200 focus:outline-none w-28 print:border-none print:p-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Info Pill Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 px-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/80 my-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">
              {isBn ? 'ইনভয়েস প্রাপক (Billed To):' : 'Billed To:'}
            </span>
            <div 
              onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-bold text-slate-700 shrink-0 text-sm">{isBn ? 'নামঃ' : 'Name:'}</span>
              <input
                ref={custNameRef}
                type="text"
                value={invoice.customer.name || ''}
                placeholder={isBn ? 'গ্রাহকের নাম' : 'Customer Name'}
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
                className="font-extrabold text-slate-900 text-xs sm:text-sm flex-1 bg-transparent border-b border-indigo-200 focus:outline-none focus:bg-white rounded px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed print:border-none print:p-0"
              />
            </div>
            <div 
              onClick={() => { custCompanyRef.current?.focus(); onEditField?.('field-cust-company'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-bold text-slate-500 shrink-0 text-sm">{isBn ? 'কোম্পানিঃ' : 'Company:'}</span>
              <input
                ref={custCompanyRef}
                type="text"
                value={invoice.customer.companyName || ''}
                placeholder={isBn ? 'কোম্পানির নাম' : 'Company Name'}
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, companyName: e.target.value } })}
                className="text-xs sm:text-sm text-slate-700 flex-1 bg-transparent border-b border-indigo-100 focus:outline-none focus:bg-white rounded px-3 py-1.5 min-h-[38px] leading-relaxed print:border-none print:p-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div 
              onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-bold text-slate-500 shrink-0 text-sm">{isBn ? 'ঠিকানাঃ' : 'Address:'}</span>
              <input
                ref={custAddressRef}
                type="text"
                value={invoice.customer.address || ''}
                placeholder={isBn ? 'গ্রাহকের ঠিকানা' : 'Customer Address'}
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
                className="text-xs sm:text-sm text-slate-600 flex-1 bg-transparent border-b border-indigo-100 focus:outline-none focus:bg-white rounded px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed print:border-none print:p-0"
              />
            </div>
            <div 
              onClick={() => { custPhoneRef.current?.focus(); onEditField?.('field-cust-phone'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-bold text-slate-500 shrink-0 text-sm">{isBn ? 'মোবাইলঃ' : 'Phone:'}</span>
              <input
                ref={custPhoneRef}
                type="text"
                value={invoice.customer.phone || ''}
                placeholder="01xxxxxxxxx"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, phone: e.target.value } })}
                className="font-mono text-xs sm:text-sm text-slate-700 flex-1 bg-transparent border-b border-indigo-100 focus:outline-none focus:bg-white rounded px-3 py-1.5 min-h-[38px] leading-relaxed print:border-none print:p-0"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-4">{isBn ? 'বিবরণ' : 'Description'}</th>
                <th className="py-3 px-3 w-24 text-center">{isBn ? 'পরিমাণ' : 'Qty'}</th>
                <th className="py-3 px-3 w-28 text-right">{isBn ? 'দর' : 'Rate'}</th>
                <th className="py-3 px-4 w-32 text-right">{isBn ? 'মোট' : 'Amount'}</th>
                <th className="py-3 px-1 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      placeholder="Item name"
                      className="w-full font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:bg-slate-50 px-1 py-0.5 print:p-0"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => onUpdateItem?.(item.id, { description: e.target.value })}
                      placeholder="Description..."
                      className="w-full text-[11px] text-slate-400 bg-transparent border-none focus:outline-none focus:bg-slate-50 px-1 py-0.5 print:p-0 print:placeholder-transparent"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem?.(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono font-bold bg-transparent border-none outline-none focus:outline-none focus:bg-slate-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem?.(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-right font-mono bg-transparent border-none outline-none focus:outline-none focus:bg-slate-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                    {currencySymbol} {numFormat(item.lineTotal)}
                  </td>
                  <td className="py-1 px-1 text-center print:hidden">
                    {invoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem?.(item.id)}
                        className="text-red-400 hover:text-red-600 text-xs px-1"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              <tr className="print:hidden bg-slate-50/50">
                <td colSpan={6} className="py-1.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    ➕ {isBn ? 'আইটেম যোগ করুন' : 'Add Item'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Calculations */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 space-y-2">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="font-bold text-slate-700">{isBn ? 'কথায়ঃ ' : 'In Words: '}</span>
              <input
                type="text"
                value={invoice.customInWords !== undefined ? invoice.customInWords : amountInWords}
                onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                placeholder={amountInWords}
                className="w-full font-bold text-slate-900 mt-1 bg-transparent border-b border-slate-300 focus:outline-none focus:bg-white px-1 py-0.5 print:border-none print:p-0"
              />
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="font-bold text-slate-600">{isBn ? 'নোটঃ ' : 'Notes: '}</span>
              <input
                type="text"
                value={invoice.notes || ''}
                placeholder="Notes..."
                onChange={(e) => onUpdateInvoice?.({ notes: e.target.value })}
                className="w-full bg-transparent border-none focus:outline-none focus:bg-white text-slate-600 px-1 py-0.5 print:p-0 print:placeholder-transparent"
              />
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="border border-slate-200 rounded-2xl p-4 space-y-2 text-xs bg-slate-50/50">
              <div className="flex justify-between text-slate-600">
                <span>{isBn ? 'সাবটোটালঃ' : 'Subtotal:'}</span>
                <span className="font-mono font-bold">{currencySymbol} {numFormat(calc.subtotal)}</span>
              </div>
              {calc.totalDiscount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>{isBn ? 'ছাড়ঃ' : 'Discount:'}</span>
                  <span className="font-mono">-{currencySymbol} {numFormat(calc.totalDiscount)}</span>
                </div>
              )}
              {calc.totalVat > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>{isBn ? 'ভ্যাট / ট্যাক্সঃ' : 'VAT / Tax:'}</span>
                  <span className="font-mono font-bold">+{currencySymbol} {numFormat(calc.totalVat)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>{isBn ? 'সর্বমোট বিলঃ' : 'Total Amount:'}</span>
                <span>{currencySymbol} {numFormat(calc.grandTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>{isBn ? 'জমাঃ' : 'Paid:'}</span>
                <div className="flex items-center justify-end">
                  <span className="mr-1">{currencySymbol}</span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={invoice.paidAmount ?? 0}
                    onChange={(e) => onUpdateInvoice?.({ paidAmount: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right font-mono font-bold text-emerald-800 bg-transparent border-none focus:outline-none print:border-none print:p-0"
                  />
                </div>
              </div>
              <div className="flex justify-between text-rose-700 font-black text-sm pt-1 border-t border-slate-200">
                <span>{isBn ? 'বাকীঃ' : 'Due:'}</span>
                <span>{currencySymbol} {numFormat(calc.dueAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs font-bold text-slate-700">
        <div className="text-center">
          <div className="w-36 border-t-2 border-slate-400 mx-auto mb-1" />
          <input
            type="text"
            value={invoice.customerSignatureTitle || (isBn ? 'গ্রাহকের স্বাক্ষর' : 'Customer Signature')}
            onChange={(e) => onUpdateInvoice?.({ customerSignatureTitle: e.target.value })}
            className="text-center font-bold text-slate-700 bg-transparent border-none focus:outline-none print:p-0"
          />
        </div>
        <SignatureBlock
          signatureImage={invoice.signatureImage || business.signatureImage}
          signatureTitle={business.signatureTitle || invoice.signatureTitle || (isBn ? 'অনুমোদিত স্বাক্ষর' : 'Authorized Signature')}
          onUpdateTitle={(val) => {
            onUpdateBusiness?.({ signatureTitle: val });
            onUpdateInvoice?.({ signatureTitle: val });
          }}
          onOpenSignatureModal={onOpenSignatureModal}
          lineColor="border-slate-400"
          textColor="text-slate-700"
        />
      </div>
    </div>
  );
};
