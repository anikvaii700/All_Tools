import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateMotors: React.FC<InvoiceTemplateProps> = ({
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

  return (
    <div className="invoice-printable-doc bg-white text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-emerald-600 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Right Vertical Cash Memo Banner */}
      <div className="absolute top-0 right-0 bg-fuchsia-700 text-white font-black py-2 px-3 text-[11px] rounded-bl-xl shadow-xs tracking-widest">
        <input
          type="text"
          value={invoice.memoTypeTitle || 'ক্যাশ মেমো'}
          onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
          className="bg-transparent border-none text-white text-center w-24 focus:outline-none font-bold"
        />
      </div>

      <div>
        {/* Religious Line */}
        <div className="text-center pb-1">
          <input
            type="text"
            value={business.religiousHeader || 'বিসমিল্লাহির রাহমানির রাহিম'}
            onChange={(e) => onUpdateBusiness?.({ religiousHeader: e.target.value })}
            className="text-[11px] text-slate-600 font-bold text-center bg-transparent border-none focus:outline-none focus:bg-emerald-50 rounded px-2 print:p-0"
          />
        </div>

        {/* Dynamic Curved Header with Trucks & Logos */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-200 to-sky-200 p-3 rounded-2xl border border-amber-300 shadow-xs relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Vehicle Silhouette / Logo */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-bold text-lg shadow-xs">
                🚛
              </div>
              <div className="hidden sm:block text-[9px] font-bold text-slate-800">
                <div>TATA • EICHER</div>
                <div>ASHOK LEYLAND</div>
              </div>
            </div>

            {/* Central Business Name */}
            <div 
              onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
              className="text-center flex-1 w-full cursor-pointer py-3 sm:py-4 my-1"
            >
              <input
                ref={bizNameRef}
                type="text"
                value={business.businessName || ''}
                placeholder="সায়াদ জেনুইন মটরস"
                onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
                className="w-full text-center text-2xl sm:text-4xl md:text-5xl font-black text-red-600 tracking-tight drop-shadow-xs bg-transparent border-none focus:outline-none focus:bg-white/80 rounded py-2.5 sm:py-3.5 min-h-[52px] sm:min-h-[64px] leading-relaxed print:p-0"
              />
              <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
                <div className="bg-blue-800 text-white font-bold text-xs px-3 py-0.5 rounded-full flex items-center gap-1">
                  <span>প্রোঃ</span>
                  <input
                    type="text"
                    value={business.ownerName || ''}
                    placeholder="মোঃ সোহেল"
                    onChange={(e) => onUpdateBusiness?.({ ownerName: e.target.value })}
                    className="bg-transparent border-none text-white focus:outline-none text-center min-w-[100px] print:p-0"
                  />
                </div>
                <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1">
                  <span>📞</span>
                  <input
                    type="text"
                    value={business.phone || ''}
                    placeholder="০১৭০০০০০০০০"
                    onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
                    className="font-mono bg-transparent border-b border-slate-400 focus:outline-none px-1 py-0.5 w-32 print:border-none print:p-0"
                  />
                </div>
              </div>
              <input
                type="text"
                value={business.tagline || ''}
                placeholder="টাটা, লিল্যান্ড ও আইসার গাড়ির সকল প্রকার জেনুইন পার্টস বিক্রেতা।"
                onChange={(e) => onUpdateBusiness?.({ tagline: e.target.value })}
                className="w-full text-center text-[10px] text-slate-800 font-bold mt-1 bg-transparent border-none focus:outline-none focus:bg-white/80 rounded px-1 py-0.5 print:p-0 print:placeholder-transparent"
              />
            </div>
          </div>

          <div className="mt-2 bg-emerald-700 text-white text-center py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
            <span>📍</span>
            <input
              type="text"
              value={business.businessAddress || ''}
              placeholder="নওগাঁ বাইপাস মোড়, বশিপুর সান্তাহার।"
              onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
              className="bg-transparent border-none text-white text-center focus:outline-none w-full max-w-xl print:p-0 print:placeholder-transparent"
            />
          </div>
        </div>

        {/* Customer & Vehicle Info Grid */}
        <div className="bg-sky-50 border border-sky-300 rounded-xl p-3 my-3 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div 
            onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="font-bold text-slate-800 shrink-0 text-sm">তারিখঃ</span>
            <input
              ref={invDateRef}
              type="text"
              value={invoice.invoiceDate || ''}
              placeholder="২০২৬-১০-২৮"
              onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
              className="border-b border-slate-400 flex-1 font-mono font-bold text-slate-900 px-3 py-1.5 min-h-[38px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-white rounded print:border-b print:p-0"
            />
          </div>

          <div 
            onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="font-bold text-slate-800 shrink-0 text-sm">ক্রমিক নংঃ</span>
            <input
              ref={invNumberRef}
              type="text"
              value={invoice.invoiceNumber || ''}
              placeholder="MSF-INV-0001"
              onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
              className="border-b border-slate-400 flex-1 font-mono font-bold text-red-700 px-3 py-1.5 min-h-[38px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-white rounded print:border-b print:p-0"
            />
          </div>

          <div 
            onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="font-bold text-slate-800 shrink-0 text-sm">নামঃ</span>
            <input
              ref={custNameRef}
              type="text"
              value={invoice.customer.name || ''}
              placeholder="সম্মানিত গ্রাহক"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
              className="border-b border-slate-400 flex-1 font-bold text-slate-900 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-white rounded print:border-b print:p-0"
            />
          </div>

          <div 
            onClick={() => { custPhoneRef.current?.focus(); onEditField?.('field-cust-phone'); }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="font-bold text-slate-800 shrink-0 text-sm">মোবাইলঃ</span>
            <input
              ref={custPhoneRef}
              type="text"
              value={invoice.customer.phone || ''}
              placeholder="০১৭xxxxxxxx"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, phone: e.target.value } })}
              className="border-b border-slate-400 flex-1 font-mono font-bold text-slate-900 px-3 py-1.5 min-h-[38px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-white rounded print:border-b print:p-0"
            />
          </div>

          <div 
            onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
            className="sm:col-span-2 flex items-center gap-2 cursor-pointer"
          >
            <span className="font-bold text-slate-800 shrink-0 text-sm">ঠিকানাঃ</span>
            <input
              ref={custAddressRef}
              type="text"
              value={invoice.customer.address || ''}
              placeholder="গ্রাহকের ঠিকানা লিখুন"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
              className="border-b border-slate-400 flex-1 text-slate-800 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-white rounded print:border-b print:p-0"
            />
          </div>
        </div>

        {/* Yellow Header with Red Text Table */}
        <div className="border-2 border-emerald-600 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-yellow-400 text-red-700 text-[11px] sm:text-xs font-black text-center">
                <th className="py-2 px-4 border-r border-amber-500 text-left">বিবরণ</th>
                <th className="py-2 px-3 border-r border-amber-500 w-24">পরিমাণ</th>
                <th className="py-2 px-3 border-r border-amber-500 w-24 text-right">দর</th>
                <th className="py-2 px-4 w-28 text-right">টাকা</th>
                <th className="py-2 px-1 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100 text-xs">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-1 px-2 border-r border-emerald-200">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      placeholder="পার্টস বা মালামালের নাম"
                      className="w-full font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:bg-yellow-50 px-1 py-0.5 print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-center border-r border-emerald-200">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem?.(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono font-bold bg-transparent border-none outline-none focus:outline-none focus:bg-yellow-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-right border-r border-emerald-200">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem?.(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-right font-mono bg-transparent border-none outline-none focus:outline-none focus:bg-yellow-50 px-1 py-1 print:border-none print:p-0"
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

              <tr className="print:hidden bg-yellow-50">
                <td colSpan={5} className="py-1 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    ➕ পার্টস / আইটেম যোগ করুন
                  </button>
                </td>
              </tr>

              {/* Empty placeholder rows */}
              {Array.from({ length: Math.max(0, 5 - invoice.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-7">
                  <td className="border-r border-emerald-200"></td>
                  <td className="border-r border-emerald-200"></td>
                  <td className="border-r border-emerald-200"></td>
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
                className="border-b-2 border-emerald-400 flex-1 font-bold text-slate-800 text-xs px-2 py-0.5 bg-transparent focus:outline-none focus:bg-white print:p-0"
              />
            </div>
            {invoice.notes && (
              <div className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="font-bold">শর্তাবলীঃ </span>{invoice.notes}
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 border-2 border-emerald-600 rounded-lg overflow-hidden divide-y divide-emerald-200 text-xs font-bold bg-white">
            {(calc.totalVat > 0 || calc.totalDiscount > 0) && (
              <div className="flex justify-between py-1 px-3 bg-emerald-50 text-slate-800">
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
              <div className="flex justify-between py-1 px-3 bg-amber-50 text-amber-900 border-b border-emerald-200">
                <span>ভ্যাট / ট্যাক্সঃ</span>
                <span className="font-mono font-bold">+{currencySymbol} {numFormat(calc.totalVat)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 px-3 bg-yellow-100 text-slate-900">
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
            <div className="flex justify-between py-1 px-3 bg-red-100 text-red-700">
              <span>বাকীঃ</span>
              <span className="font-mono font-black">{currencySymbol} {numFormat(calc.dueAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="pt-8 border-t border-emerald-500 flex items-end justify-between text-xs font-bold text-slate-700">
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
          signatureTitle={business.signatureTitle || invoice.signatureTitle || 'ম্যানেজার / বিক্রেতার স্বাক্ষর'}
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
