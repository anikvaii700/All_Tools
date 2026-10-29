import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateFestiveMobile: React.FC<InvoiceTemplateProps> = ({
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
  const custAddressRef = useRef<HTMLInputElement>(null);
  const custPhoneRef = useRef<HTMLInputElement>(null);
  const invNumberRef = useRef<HTMLInputElement>(null);
  const invDateRef = useRef<HTMLInputElement>(null);
  const bizNameRef = useRef<HTMLInputElement>(null);

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
    <div className="invoice-printable-doc bg-white text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-blue-900 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none overflow-hidden">
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
          <input
            type="text"
            value={invoice.memoTypeTitle || 'ক্যাশ মেমো'}
            onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
            className="bg-blue-900 text-white font-black text-xs sm:text-sm px-6 py-1 rounded-full shadow-xs tracking-wider text-center focus:outline-none print:border-none"
          />
        </div>

        {/* Dynamic Curved Red Header with Black Central Badge */}
        <div className="bg-red-600 rounded-3xl p-3 sm:p-4 text-white shadow-md relative flex flex-col sm:flex-row items-center justify-between gap-3 border-2 border-white">
          {/* Left Phone Info */}
          <div className="text-center sm:text-left text-xs font-mono font-bold space-y-1">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <span>☎️</span>
              <input
                type="text"
                value={business.phone || ''}
                placeholder="০১৭০০০০০০০০"
                onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
                className="bg-transparent border-b border-red-300 text-white font-mono focus:outline-none w-28 print:border-none print:p-0"
              />
            </div>
          </div>

          {/* Center Black Circle Title Badge */}
          <div 
            onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
            className="bg-black text-white rounded-full w-32 h-32 sm:w-44 sm:h-44 flex flex-col items-center justify-center p-3 text-center shadow-lg border-2 border-yellow-400 shrink-0 cursor-pointer"
          >
            <input
              ref={bizNameRef}
              type="text"
              value={business.businessName || ''}
              placeholder="এমরান মোবাইল"
              onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
              className="w-full text-center text-base sm:text-xl font-black text-yellow-400 tracking-tight bg-transparent border-none focus:outline-none px-1 py-1 min-h-[36px] sm:min-h-[44px] leading-relaxed"
            />
            <input
              type="text"
              value={business.tagline || ''}
              placeholder="সার্ভিসিং সেন্টার"
              onChange={(e) => onUpdateBusiness?.({ tagline: e.target.value })}
              className="w-full text-center text-[9px] sm:text-[11px] text-white font-bold bg-transparent border-none focus:outline-none px-1 mt-1 print:placeholder-transparent"
            />
          </div>

          {/* Right Address Location */}
          <div className="text-center sm:text-right text-xs space-y-0.5 max-w-[200px]">
            <div className="text-yellow-300 font-bold flex items-center justify-center sm:justify-end gap-1">
              <span>📍</span> <span>ঠিকানা</span>
            </div>
            <input
              type="text"
              value={business.businessAddress || ''}
              placeholder="এলাহাবাদ ব্যাংকের নীচে, সাহুড়া, বুড়ারী বাজার, পূর্ব মেদিনীপুর"
              onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
              className="w-full text-center sm:text-right text-[11px] leading-tight text-white bg-transparent border-b border-red-300 focus:outline-none print:border-none print:p-0"
            />
          </div>
        </div>

        {/* Proprietor Navy Pill */}
        <div className="text-center mt-2.5">
          <div className="bg-blue-900 text-white font-black text-xs px-6 py-1 rounded-full shadow-xs inline-flex items-center gap-1">
            <span>প্রোঃ</span>
            <input
              type="text"
              value={business.ownerName || ''}
              placeholder="রঞ্জন অধিকারী"
              onChange={(e) => onUpdateBusiness?.({ ownerName: e.target.value })}
              className="bg-transparent border-none text-white font-bold text-center focus:outline-none print:p-0"
            />
          </div>
        </div>

        {/* Customer Information Dotted Rows */}
        <div className="my-2.5 space-y-1.5 text-xs text-slate-800 border-b border-slate-300 pb-2">
          <div className="flex items-center justify-between gap-4">
            <div 
              onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
              className="flex items-center gap-1.5 flex-1 cursor-pointer"
            >
              <span className="font-bold text-slate-900 shrink-0">নং-</span>
              <input
                ref={invNumberRef}
                type="text"
                value={invoice.invoiceNumber || ''}
                placeholder="MSF-INV-0001"
                onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
                className="border-b border-dotted border-blue-900 flex-1 font-mono font-bold text-red-600 px-2 bg-transparent focus:outline-none focus:bg-sky-50 print:p-0"
              />
            </div>
            <div 
              onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
              className="flex items-center gap-1.5 w-48 sm:w-60 cursor-pointer"
            >
              <span className="font-bold text-slate-900 shrink-0">তারিখঃ</span>
              <input
                ref={invDateRef}
                type="text"
                value={invoice.invoiceDate || ''}
                placeholder="২০২৬-১০-২৮"
                onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
                className="border-b border-dotted border-blue-900 flex-1 font-mono font-bold text-slate-900 px-2 bg-transparent focus:outline-none focus:bg-sky-50 print:p-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div 
              onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
              className="flex items-center gap-1.5 flex-1 cursor-pointer"
            >
              <span className="font-bold text-slate-900 shrink-0 text-sm">নামঃ</span>
              <input
                ref={custNameRef}
                type="text"
                value={invoice.customer.name || ''}
                placeholder="সম্মানিত ক্রেতা"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
                className="border-b border-dotted border-blue-900 flex-1 font-bold text-slate-900 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-sky-50 print:p-0"
              />
            </div>
            <div 
              onClick={() => { custPhoneRef.current?.focus(); onEditField?.('field-cust-phone'); }}
              className="flex items-center gap-1.5 w-48 sm:w-60 cursor-pointer"
            >
              <span className="font-bold text-slate-900 shrink-0 text-sm">মোবাইলঃ</span>
              <input
                ref={custPhoneRef}
                type="text"
                value={invoice.customer.phone || ''}
                placeholder="০১৭xxxxxxxx"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, phone: e.target.value } })}
                className="border-b border-dotted border-blue-900 flex-1 font-mono font-bold text-slate-900 px-3 py-1.5 min-h-[38px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-sky-50 print:p-0"
              />
            </div>
          </div>

          <div 
            onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <span className="font-bold text-slate-900 shrink-0 text-sm">ঠিকানাঃ</span>
            <input
              ref={custAddressRef}
              type="text"
              value={invoice.customer.address || ''}
              placeholder="ক্রেতার ঠিকানা লিখুন"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
              className="border-b border-dotted border-blue-900 flex-1 text-slate-800 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-sky-50 print:p-0"
            />
          </div>
        </div>

        {/* Outline Table */}
        <div className="border border-blue-900 rounded overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white text-[11px] sm:text-xs font-bold text-center">
                <th className="py-2 px-2 border-r border-blue-700 w-12">ক্র.নং</th>
                <th className="py-2 px-4 border-r border-blue-700 text-left">বিবরণ</th>
                <th className="py-2 px-3 border-r border-blue-700 w-24">পরিমাণ</th>
                <th className="py-2 px-3 border-r border-blue-700 w-24 text-right">দর</th>
                <th className="py-2 px-4 w-28 text-right">টাকা</th>
                <th className="py-2 px-1 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition">
                  <td className="py-2 px-2 text-center font-bold border-r border-slate-300">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-1 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      placeholder="বিবরণ"
                      className="w-full font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:bg-sky-50 px-1 py-0.5 print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-center border-r border-slate-300">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem?.(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono font-bold bg-transparent border-none outline-none focus:outline-none focus:bg-sky-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-right border-r border-slate-300">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem?.(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-right font-mono bg-transparent border-none outline-none focus:outline-none focus:bg-sky-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {numFormat(item.lineTotal)}
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

              <tr className="print:hidden bg-blue-50">
                <td colSpan={6} className="py-1 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-blue-900 hover:underline"
                  >
                    ➕ আইটেম যোগ করুন
                  </button>
                </td>
              </tr>

              {/* Empty placeholder rows */}
              {Array.from({ length: Math.max(0, 5 - invoice.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-7">
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td></td>
                  <td className="print:hidden"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 shrink-0">কথায়ঃ</span>
              <input
                type="text"
                value={invoice.customInWords !== undefined ? invoice.customInWords : amountInWords}
                onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                placeholder={amountInWords}
                className="border-b border-blue-900 flex-1 font-bold text-slate-800 text-xs px-2 py-0.5 bg-transparent focus:outline-none focus:bg-white print:p-0"
              />
            </div>
            {invoice.notes && (
              <div className="text-[11px] text-slate-600 italic">
                <span className="font-bold">শর্তঃ </span>{invoice.notes}
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 border border-blue-900 divide-y divide-slate-300 text-xs font-bold bg-white">
            {(calc.totalVat > 0 || calc.totalDiscount > 0) && (
              <div className="flex justify-between py-1 px-3 bg-blue-50 text-slate-800">
                <span>উপ-মোটঃ</span>
                <span className="font-mono">{currencySymbol} {numFormat(calc.subtotal)}</span>
              </div>
            )}
            {calc.totalDiscount > 0 && (
              <div className="flex justify-between py-1 px-3 bg-rose-50 text-rose-700">
                <span>ছাড়ঃ</span>
                <span className="font-mono">-{currencySymbol} {numFormat(calc.totalDiscount)}</span>
              </div>
            )}
            {calc.totalVat > 0 && (
              <div className="flex justify-between py-1 px-3 bg-amber-50 text-amber-900 border-b border-blue-200">
                <span>ভ্যাট / ট্যাক্সঃ</span>
                <span className="font-mono font-bold">+{currencySymbol} {numFormat(calc.totalVat)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 px-3 bg-blue-100 text-slate-900">
              <span>{calc.totalVat > 0 || calc.totalDiscount > 0 ? 'সর্বমোট টাকাঃ' : 'মোট টাকাঃ'}</span>
              <span className="font-mono">{currencySymbol} {numFormat(calc.grandTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-0.5 px-3">
              <span>জমাঃ</span>
              <div className="flex items-center justify-end">
                <span className="mr-1">{currencySymbol}</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={invoice.paidAmount ?? 0}
                  onChange={(e) => onUpdateInvoice?.({ paidAmount: parseFloat(e.target.value) || 0 })}
                  className="w-20 text-right font-mono font-bold text-slate-900 bg-transparent border-none focus:outline-none print:p-0"
                />
              </div>
            </div>
            <div className="flex justify-between py-1 px-3 text-red-600">
              <span>বাকীঃ</span>
              <span className="font-mono font-black">{currencySymbol} {numFormat(calc.dueAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="pt-8 border-t border-slate-300 flex items-end justify-between text-xs font-bold text-slate-700">
        <div className="text-center">
          <div className="w-36 border-t-2 border-slate-700 mx-auto mb-1" />
          <input
            type="text"
            value={invoice.customerSignatureTitle || 'ক্রেতার স্বাক্ষর'}
            onChange={(e) => onUpdateInvoice?.({ customerSignatureTitle: e.target.value })}
            className="text-center font-bold text-slate-700 bg-transparent border-none focus:outline-none print:p-0"
          />
        </div>
        <SignatureBlock
          signatureImage={invoice.signatureImage || business.signatureImage}
          signatureTitle={business.signatureTitle || invoice.signatureTitle || 'স্বত্বাধিকারীর স্বাক্ষর'}
          onUpdateTitle={(val) => {
            onUpdateBusiness?.({ signatureTitle: val });
            onUpdateInvoice?.({ signatureTitle: val });
          }}
          onOpenSignatureModal={onOpenSignatureModal}
          lineColor="border-slate-700"
          textColor="text-slate-700"
        />
      </div>
    </div>
  );
};
