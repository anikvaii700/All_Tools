import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateBengali: React.FC<InvoiceTemplateProps> = ({
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
  const currencySymbol = '৳';
  const amountInWords = cleanBengaliAmountInWords(calc.grandTotal);
  const numFormat = (num: number) => toBengaliNumerals(formatMoney(num, ''));

  const custNameRef = useRef<HTMLInputElement>(null);
  const custCompanyRef = useRef<HTMLInputElement>(null);
  const custAddressRef = useRef<HTMLInputElement>(null);
  const custPhoneRef = useRef<HTMLInputElement>(null);
  const invNumberRef = useRef<HTMLInputElement>(null);
  const invDateRef = useRef<HTMLInputElement>(null);
  const invDueDateRef = useRef<HTMLInputElement>(null);
  const bizNameRef = useRef<HTMLInputElement>(null);

  return (
    <div className="invoice-printable-doc bg-white text-slate-900 p-8 sm:p-10 font-sans text-xs sm:text-sm min-h-[900px] flex flex-col justify-between border-2 border-emerald-700 shadow-sm print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Decorative Traditional Corner Borders */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-700 print:hidden" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-700 print:hidden" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-700 print:hidden" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-700 print:hidden" />

      <div>
        {/* Religious or Welcome Header */}
        <div className="text-center pb-2">
          <input
            type="text"
            value={business.religiousHeader || 'বিসমিল্লাহির রাহমানির রাহিম'}
            onChange={(e) => onUpdateBusiness?.({ religiousHeader: e.target.value })}
            className="text-[11px] text-slate-600 font-medium text-center bg-transparent border-none focus:outline-none focus:bg-emerald-50 rounded px-2 print:p-0"
          />
        </div>

        {/* Business Title & Memo Type */}
        <div className="text-center pb-4 border-b-2 border-emerald-700">
          <div className="inline-block p-1 w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {business.logoUrl && (
                <img
                  src={business.logoUrl}
                  alt="Logo"
                  className="w-14 h-14 object-contain rounded-lg border border-slate-200"
                />
              )}
              <div 
                onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
                className="flex-1 w-full cursor-pointer py-3 sm:py-4 my-1"
              >
                <input
                  ref={bizNameRef}
                  type="text"
                  value={business.businessName || ''}
                  placeholder="The MoSaFa ডিজিটাল আইটি সল্যুশন"
                  onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
                  className="w-full text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-800 tracking-tight bg-transparent border-none focus:outline-none focus:bg-emerald-50 rounded py-2.5 sm:py-3.5 min-h-[52px] sm:min-h-[64px] leading-relaxed print:p-0"
                />
                <input
                  type="text"
                  value={business.subtitle || ''}
                  placeholder="সাবটাইটেল / ব্যবসার ধরন"
                  onChange={(e) => onUpdateBusiness?.({ subtitle: e.target.value })}
                  className="w-full text-center text-xs text-slate-700 font-bold mt-0.5 tracking-wider bg-transparent border-none focus:outline-none focus:bg-emerald-50 rounded py-0.5 print:p-0 print:placeholder-transparent"
                />
                <div className="flex items-center justify-center gap-1 text-xs text-rose-700 font-bold mt-0.5">
                  <span>প্রোপাইটরঃ</span>
                  <input
                    type="text"
                    value={business.ownerName || ''}
                    placeholder="মালিকের নাম"
                    onChange={(e) => onUpdateBusiness?.({ ownerName: e.target.value })}
                    className="text-center font-bold text-rose-700 bg-transparent border-b border-rose-300 focus:outline-none px-1 py-0.5 print:border-none print:p-0"
                  />
                </div>
              </div>
            </div>

            <input
              type="text"
              value={business.businessAddress || ''}
              placeholder="ঠিকানাঃ সড়ক, এলাকা, জেলা"
              onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
              className="w-full text-center text-xs text-slate-600 mt-1 bg-transparent border-none focus:outline-none focus:bg-emerald-50 rounded px-1 py-0.5 print:p-0"
            />

            <div className="text-[11px] text-slate-600 mt-1 flex flex-wrap justify-center gap-x-4">
              <div className="flex items-center gap-1">
                <span>মোবাইলঃ</span>
                <input
                  type="text"
                  value={business.phone || ''}
                  placeholder="০১৭xxxxxxxx"
                  onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
                  className="font-mono bg-transparent border-b border-slate-300 focus:outline-none px-1 py-0.5 w-28 print:border-none print:p-0"
                />
              </div>
              <div className="flex items-center gap-1">
                <span>ইমেইলঃ</span>
                <input
                  type="text"
                  value={business.email || ''}
                  placeholder="email@example.com"
                  onChange={(e) => onUpdateBusiness?.({ email: e.target.value })}
                  className="font-mono bg-transparent border-b border-slate-300 focus:outline-none px-1 py-0.5 w-36 print:border-none print:p-0"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 inline-block">
            <input
              type="text"
              value={invoice.memoTypeTitle || 'ক্যাশ মেমো / বিক্রয় চালান (INVOICE)'}
              onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
              className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white font-extrabold px-6 py-1 rounded-full text-xs shadow-xs tracking-wider text-center focus:outline-none print:border-none"
            />
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-emerald-600/30 text-xs">
          {/* Customer Side */}
          <div className="space-y-2">
            <div 
              onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-bold text-slate-700 shrink-0 text-sm">নামঃ</span>
              <input
                ref={custNameRef}
                type="text"
                value={invoice.customer.name || ''}
                placeholder="সম্মানিত খরিদ্দার"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
                className="font-extrabold text-slate-900 text-xs sm:text-sm flex-1 bg-transparent border-b border-slate-300 focus:outline-none focus:bg-emerald-50 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed print:border-none print:p-0"
              />
            </div>

            <div 
              onClick={() => { custCompanyRef.current?.focus(); onEditField?.('field-cust-company'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-bold text-slate-700 shrink-0 text-sm">প্রতিষ্ঠানঃ</span>
              <input
                ref={custCompanyRef}
                type="text"
                value={invoice.customer.companyName || ''}
                placeholder="কোম্পানির নাম (ঐচ্ছিক)"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, companyName: e.target.value } })}
                className="text-slate-800 text-xs sm:text-sm flex-1 bg-transparent border-b border-slate-200 focus:outline-none focus:bg-emerald-50 px-3 py-1.5 min-h-[38px] leading-relaxed print:border-none print:p-0"
              />
            </div>

            <div 
              onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-bold text-slate-700 shrink-0 text-sm">ঠিকানাঃ</span>
              <input
                ref={custAddressRef}
                type="text"
                value={invoice.customer.address || ''}
                placeholder="খরিদ্দারের ঠিকানা"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
                className="text-slate-800 text-xs sm:text-sm flex-1 bg-transparent border-b border-slate-200 focus:outline-none focus:bg-emerald-50 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed print:border-none print:p-0"
              />
            </div>

            <div 
              onClick={() => { custPhoneRef.current?.focus(); onEditField?.('field-cust-phone'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-bold text-slate-700 shrink-0 text-sm">মোবাইল নংঃ</span>
              <input
                ref={custPhoneRef}
                type="text"
                value={invoice.customer.phone || ''}
                placeholder="০১৭xxxxxxxx"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, phone: e.target.value } })}
                className="font-mono text-slate-900 text-xs sm:text-sm flex-1 bg-transparent border-b border-slate-200 focus:outline-none focus:bg-emerald-50 px-3 py-1.5 min-h-[38px] leading-relaxed print:border-none print:p-0"
              />
            </div>
          </div>

          {/* Invoice Meta Side */}
          <div className="sm:text-right space-y-1.5 self-start">
            <div 
              onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
              className="flex items-center sm:justify-end gap-1 cursor-pointer"
            >
              <span className="font-bold text-slate-700">মেমো নংঃ</span>
              <input
                ref={invNumberRef}
                type="text"
                value={invoice.invoiceNumber || ''}
                placeholder="MSF-INV-0001"
                onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
                className="font-black text-rose-700 font-mono text-sm sm:text-right bg-transparent border-b border-slate-300 focus:outline-none focus:bg-emerald-50 px-1 py-0.5 w-36 print:border-none print:p-0"
              />
            </div>

            <div 
              onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
              className="flex items-center sm:justify-end gap-1 cursor-pointer"
            >
              <span className="font-bold text-slate-700">তারিখঃ</span>
              <input
                ref={invDateRef}
                type="text"
                value={invoice.invoiceDate || ''}
                placeholder="২০২৬-১০-২৮"
                onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
                className="font-semibold sm:text-right bg-transparent border-b border-slate-200 focus:outline-none focus:bg-emerald-50 px-1 py-0.5 w-32 print:border-none print:p-0"
              />
            </div>

            <div 
              onClick={() => { invDueDateRef.current?.focus(); onEditField?.('field-inv-due-date'); }}
              className="flex items-center sm:justify-end gap-1 cursor-pointer"
            >
              <span className="font-bold text-slate-700">পরিশোধের শেষ সময়ঃ</span>
              <input
                ref={invDueDateRef}
                type="text"
                value={invoice.dueDate || ''}
                placeholder="Due Date"
                onChange={(e) => onUpdateInvoice?.({ dueDate: e.target.value })}
                className="font-semibold sm:text-right bg-transparent border-b border-slate-200 focus:outline-none focus:bg-emerald-50 px-1 py-0.5 w-32 print:border-none print:p-0"
              />
            </div>
          </div>
        </div>

        {/* Bangla Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left border-collapse border border-emerald-800">
            <thead>
              <tr className="bg-emerald-800 text-white text-[11px] font-bold text-center">
                <th className="py-2 px-2 border border-emerald-700 w-10">ক্রমিক</th>
                <th className="py-2 px-3 border border-emerald-700 text-left">পণ্য / সেবার বিবরণ</th>
                <th className="py-2 px-2 border border-emerald-700 w-24">পরিমাণ</th>
                <th className="py-2 px-3 border border-emerald-700 text-right w-28">দর</th>
                <th className="py-2 px-3 border border-emerald-700 text-right w-32">মোট টাকা</th>
                <th className="py-2 px-1 w-8 print:hidden border border-emerald-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-600/20 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-emerald-50/40">
                  <td className="py-2.5 px-2 text-center border-r border-emerald-800/30 font-bold">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-2 px-2 border-r border-emerald-800/30">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      placeholder="আইটেমের নাম"
                      className="w-full font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:bg-emerald-50 px-1 py-0.5 print:p-0"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => onUpdateItem?.(item.id, { description: e.target.value })}
                      placeholder="বিবরণ..."
                      className="w-full text-[11px] text-slate-500 bg-transparent border-none focus:outline-none focus:bg-emerald-50 px-1 py-0.5 print:p-0 print:placeholder-transparent"
                    />
                  </td>
                  <td className="py-2 px-2 text-center border-r border-emerald-800/30">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem?.(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono font-bold bg-transparent border-none outline-none focus:outline-none focus:bg-emerald-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-2 px-2 text-right border-r border-emerald-800/30">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem?.(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-right font-mono bg-transparent border-none outline-none focus:outline-none focus:bg-emerald-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right border-r border-emerald-800/30 font-bold text-slate-900">
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

              <tr className="print:hidden bg-emerald-50/50">
                <td colSpan={6} className="py-1.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    ➕ আইটেম যোগ করুন
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes & Calculations */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 space-y-2">
            <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900">কথায়ঃ </span>
              <input
                type="text"
                value={invoice.customInWords !== undefined ? invoice.customInWords : amountInWords}
                onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                placeholder={amountInWords}
                className="w-full font-bold text-emerald-950 mt-1 bg-transparent border-b border-emerald-300 focus:outline-none focus:bg-white px-1 py-0.5 print:border-none print:p-0"
              />
            </div>

            <div className="text-xs text-slate-600 p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold">বিশেষ দ্রষ্টব্যঃ </span>
              <input
                type="text"
                value={invoice.notes || ''}
                placeholder="নোট বা বিশেষ শর্ত লিখুন..."
                onChange={(e) => onUpdateInvoice?.({ notes: e.target.value })}
                className="w-full bg-transparent border-none focus:outline-none focus:bg-white text-slate-700 px-1 py-0.5 mt-0.5 print:p-0 print:placeholder-transparent"
              />
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="border-2 border-emerald-800 p-3 rounded-xl space-y-1.5 text-xs bg-white">
              <div className="flex justify-between text-slate-700">
                <span>উপ-মোটঃ</span>
                <span className="font-bold">{currencySymbol} {numFormat(calc.subtotal)}</span>
              </div>

              {calc.totalDiscount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>ছাড়ঃ</span>
                  <span className="font-mono">-{currencySymbol} {numFormat(calc.totalDiscount)}</span>
                </div>
              )}

              {calc.totalVat > 0 && (
                <div className="flex justify-between text-amber-800 font-bold">
                  <span>ভ্যাট / ট্যাক্সঃ</span>
                  <span className="font-mono font-bold">+{currencySymbol} {numFormat(calc.totalVat)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-emerald-800 flex justify-between font-black text-sm text-emerald-950">
                <span>সর্বমোট বিলঃ</span>
                <span>{currencySymbol} {numFormat(calc.grandTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-emerald-700 font-bold pt-1">
                <span>জমাঃ</span>
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

              <div className="flex justify-between text-rose-700 font-black text-sm pt-1 border-t border-dashed border-emerald-600">
                <span>বাকীঃ</span>
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
            <div className="w-36 border-b border-dashed border-slate-700 mb-1 mx-auto" />
            <input
              type="text"
              value={invoice.customerSignatureTitle || 'ক্রেতার স্বাক্ষর'}
              onChange={(e) => onUpdateInvoice?.({ customerSignatureTitle: e.target.value })}
              className="text-center font-semibold text-slate-700 bg-transparent border-none focus:outline-none print:p-0"
            />
          </div>

          <div className="text-center text-[10px] text-slate-500 max-w-xs">
            <input
              type="text"
              value={invoice.terms || 'বিক্রিত পণ্য বিশেষ কারণ ছাড়া ফেরত নেওয়া হয় না।'}
              onChange={(e) => onUpdateInvoice?.({ terms: e.target.value })}
              className="text-center w-full bg-transparent border-none focus:outline-none print:p-0"
            />
            <p className="font-bold text-emerald-800 mt-0.5">ধন্যবাদ, আবার আসবেন!</p>
          </div>

          <SignatureBlock
            signatureImage={invoice.signatureImage || business.signatureImage}
            signatureTitle={business.signatureTitle || invoice.signatureTitle || 'বিক্রেতার সিল ও স্বাক্ষর'}
            onUpdateTitle={(val) => {
              onUpdateBusiness?.({ signatureTitle: val });
              onUpdateInvoice?.({ signatureTitle: val });
            }}
            onOpenSignatureModal={onOpenSignatureModal}
            lineColor="border-slate-900"
            textColor="text-slate-900"
          />
        </div>
      </div>
    </div>
  );
};
