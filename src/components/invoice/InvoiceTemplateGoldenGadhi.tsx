import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateGoldenGadhi: React.FC<InvoiceTemplateProps> = ({
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
  const invNumberRef = useRef<HTMLInputElement>(null);
  const invDateRef = useRef<HTMLInputElement>(null);
  const bizNameRef = useRef<HTMLInputElement>(null);

  return (
    <div className="invoice-printable-doc bg-[#fefee2] text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-[#84cc16] shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Side Decorative Green Ribbons */}
      <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-emerald-600 via-lime-500 to-transparent opacity-80 pointer-events-none print:hidden" />
      <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-l from-emerald-600 via-lime-500 to-transparent opacity-80 pointer-events-none print:hidden" />

      <div>
        {/* Top Religious Line and Cash Memo Capsule */}
        <div className="flex items-center justify-between pb-1 border-b border-lime-300 gap-2">
          <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white font-extrabold px-3 py-0.5 rounded-full text-[11px] shadow-xs">
            <input
              type="text"
              value={invoice.memoTypeTitle || 'ক্যাশ মেমো'}
              onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
              className="bg-transparent border-none outline-none text-white text-center w-24 focus:outline-none font-bold print:p-0"
            />
          </div>
          <input
            type="text"
            value={business.religiousHeader || 'বিসমিল্লাহির রহমানির রহীম'}
            onChange={(e) => onUpdateBusiness?.({ religiousHeader: e.target.value })}
            className="text-[11px] text-slate-700 font-bold text-center bg-transparent border-none outline-none focus:outline-none focus:bg-white/80 rounded px-2 print:p-0"
          />
          <div className="flex items-center gap-1 text-[11px] text-slate-700 font-bold">
            <span>মোবাঃ</span>
            <input
              type="text"
              value={business.phone || ''}
              placeholder="০১৮২৩-৫৫৪৬২১"
              onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
              className="font-mono bg-transparent border-b border-slate-300 focus:outline-none px-1 py-0.5 w-28 print:border-none print:p-0"
            />
          </div>
        </div>

        {/* Business Title in Bold Red/Magenta */}
        <div className="text-center py-3 sm:py-4">
          <div 
            onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
            className="cursor-pointer my-1"
          >
            <input
              ref={bizNameRef}
              type="text"
              value={business.businessName || ''}
              placeholder="সানজিতা সোনালী গদি হাউজ"
              onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
              className="w-full text-center text-2xl sm:text-4xl md:text-5xl font-black text-rose-700 tracking-tight drop-shadow-xs bg-transparent border-none outline-none focus:outline-none focus:bg-white/80 rounded py-2.5 sm:py-3.5 min-h-[52px] sm:min-h-[68px] leading-relaxed print:p-0"
            />
          </div>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="text-xs sm:text-sm font-extrabold text-teal-800">প্রোঃ</span>
            <input
              type="text"
              value={business.ownerName || ''}
              placeholder="মোঃ রাকিব হোসেন"
              onChange={(e) => onUpdateBusiness?.({ ownerName: e.target.value })}
              className="text-xs sm:text-sm font-extrabold text-teal-800 bg-transparent border-b border-teal-300 focus:outline-none focus:bg-white/80 px-1 py-0.5 text-center min-w-[140px] print:border-none print:p-0"
            />
          </div>
          <input
            type="text"
            value={business.tagline || ''}
            placeholder="এখানে রেক্সিন, লেদার, ফোমের গদির বিভিন্ন মডেলের চেয়ার, সোফা সুলভ মূল্যে বিক্রয় করা হয়।"
            onChange={(e) => onUpdateBusiness?.({ tagline: e.target.value })}
            className="w-full max-w-lg mx-auto text-center text-[11px] text-slate-700 font-semibold mt-1 bg-transparent border-none outline-none focus:outline-none focus:bg-white/80 rounded px-1 py-0.5 print:p-0 print:placeholder-transparent"
          />
          <div className="mt-1.5 inline-block bg-emerald-700 text-white text-[11px] font-bold px-4 py-0.5 rounded-full shadow-xs">
            <input
              type="text"
              value={business.businessAddress || ''}
              placeholder="থানা রোড, সাহার বাজার, সুলতান সুপার মার্কেট, দিনাজপুর।"
              onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
              className="bg-transparent border-none outline-none text-white text-center focus:outline-none min-w-[280px] sm:min-w-[360px] print:p-0 print:placeholder-transparent"
            />
          </div>
        </div>

        {/* Dotted Customer Info Lines with Extra Matra Room */}
        <div className="my-3 space-y-2 text-xs text-slate-800 border-t border-b border-lime-300 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div 
              onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
              className="flex items-center gap-2 flex-1 cursor-pointer"
            >
              <span className="font-bold text-slate-800 shrink-0">ক্রমিক নংঃ</span>
              <input
                ref={invNumberRef}
                type="text"
                value={invoice.invoiceNumber || ''}
                placeholder="MSF-INV-0001"
                onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
                className="border-b border-dotted border-slate-600 flex-1 font-mono font-bold text-rose-700 px-2 py-1 bg-transparent outline-none focus:outline-none focus:bg-white/80 print:border-dotted print:p-0"
              />
            </div>
            <div 
              onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
              className="flex items-center gap-2 w-48 sm:w-60 cursor-pointer"
            >
              <span className="font-bold text-slate-800 shrink-0">তারিখঃ</span>
              <input
                ref={invDateRef}
                type="text"
                value={invoice.invoiceDate || ''}
                placeholder="২০২৬-১০-২৮"
                onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
                className="border-b border-dotted border-slate-600 flex-1 font-mono font-bold text-slate-900 px-2 py-1 bg-transparent outline-none focus:outline-none focus:bg-white/80 print:border-dotted print:p-0"
              />
            </div>
          </div>

          <div 
            onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="font-bold text-slate-800 shrink-0">নামঃ</span>
            <input
              ref={custNameRef}
              type="text"
              value={invoice.customer.name || ''}
              placeholder="সম্মানিত খরিদ্দার"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
              className="border-b border-dotted border-slate-600 flex-1 font-bold text-slate-900 px-3 py-1.5 min-h-[38px] text-xs sm:text-sm leading-relaxed bg-transparent outline-none focus:outline-none focus:bg-white/80 rounded print:border-dotted print:p-0"
            />
          </div>

          <div 
            onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="font-bold text-slate-800 shrink-0">ঠিকানাঃ</span>
            <input
              ref={custAddressRef}
              type="text"
              value={invoice.customer.address || ''}
              placeholder="খরিদ্দারের ঠিকানা লিখুন"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
              className="border-b border-dotted border-slate-600 flex-1 font-medium text-slate-800 px-3 py-1.5 min-h-[38px] text-xs sm:text-sm leading-relaxed bg-transparent outline-none focus:outline-none focus:bg-white/80 rounded print:border-dotted print:p-0"
            />
          </div>
        </div>

        {/* Traditional Bengalee Bordered Table without inner boxes */}
        <div className="border border-slate-700 bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#a3e635]/30 text-slate-900 text-xs font-bold text-center border-b border-slate-700">
                <th className="py-2.5 px-2 border-r border-slate-700 w-12">নং</th>
                <th className="py-2.5 px-4 border-r border-slate-700 text-left">বিবরণ</th>
                <th className="py-2.5 px-3 border-r border-slate-700 w-24">পরিমাণ</th>
                <th className="py-2.5 px-3 border-r border-slate-700 w-24 text-right">দর</th>
                <th className="py-2.5 px-4 w-28 text-right">টাকা</th>
                <th className="py-2.5 px-1 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-xs font-medium">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-lime-50/50 transition">
                  <td className="py-2 px-2 text-center font-bold border-r border-slate-700">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-1 px-2 border-r border-slate-700">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      placeholder="মালের বিবরণ লিখুন"
                      className="w-full font-bold text-slate-900 bg-transparent border-none outline-none focus:outline-none focus:bg-lime-50 px-1 py-1 print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-center border-r border-slate-700">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem?.(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono font-bold bg-transparent border-none outline-none focus:outline-none focus:bg-lime-50 py-1 px-1 print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-right border-r border-slate-700">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem?.(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-right font-mono bg-transparent border-none outline-none focus:outline-none focus:bg-lime-50 py-1 px-1 print:p-0"
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

              <tr className="print:hidden bg-lime-50/50">
                <td colSpan={6} className="py-1.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>➕ আইটেম যোগ করুন</span>
                  </button>
                </td>
              </tr>

              {/* Empty placeholder rows */}
              {Array.from({ length: Math.max(0, 5 - invoice.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-7">
                  <td className="border-r border-slate-700"></td>
                  <td className="border-r border-slate-700"></td>
                  <td className="border-r border-slate-700"></td>
                  <td className="border-r border-slate-700"></td>
                  <td></td>
                  <td className="print:hidden"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Calculations */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch justify-between gap-3">
          {/* Left: In Words */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 shrink-0">কথায়ঃ</span>
              <input
                type="text"
                value={invoice.customInWords !== undefined ? invoice.customInWords : amountInWords}
                onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                placeholder={amountInWords}
                className="border-b border-dotted border-slate-600 flex-1 font-bold text-slate-900 text-xs px-2 py-1 bg-transparent outline-none focus:outline-none focus:bg-white print:p-0"
              />
            </div>
            {invoice.notes && (
              <div className="text-[11px] text-slate-600 italic">
                <span>শর্তাবলীঃ </span>{invoice.notes}
              </div>
            )}
          </div>

          {/* Right: Totals Box */}
          <div className="w-full sm:w-64 border border-slate-700 bg-white divide-y divide-slate-300 text-xs font-bold">
            {(calc.totalVat > 0 || calc.totalDiscount > 0) && (
              <div className="flex justify-between py-1 px-3 bg-slate-50 text-slate-800">
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
              <div className="flex justify-between py-1.5 px-3 bg-amber-50 text-amber-900 border-b border-slate-300">
                <span>ভ্যাট / ট্যাক্সঃ</span>
                <span className="font-mono font-bold">+{currencySymbol} {numFormat(calc.totalVat)}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 px-3 bg-lime-50/50">
              <span>{calc.totalVat > 0 || calc.totalDiscount > 0 ? 'সর্বমোট টাকাঃ' : 'মোট টাকাঃ'}</span>
              <span className="font-mono">{currencySymbol} {numFormat(calc.grandTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-1 px-3">
              <span>জমাঃ</span>
              <div className="flex items-center justify-end">
                <span className="mr-1">{currencySymbol}</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={invoice.paidAmount ?? 0}
                  onChange={(e) => onUpdateInvoice?.({ paidAmount: parseFloat(e.target.value) || 0 })}
                  className="w-20 text-right font-mono font-bold text-slate-900 bg-transparent border-none outline-none focus:outline-none print:p-0"
                />
              </div>
            </div>
            <div className="flex justify-between py-1.5 px-3 bg-red-50 text-red-700">
              <span>বাকীঃ</span>
              <span className="font-mono font-black">{currencySymbol} {numFormat(calc.dueAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures with Digital Drawing Support */}
      <div className="pt-8 border-t border-slate-400 flex items-end justify-between text-xs font-bold text-slate-800">
        <div className="text-center">
          <div className="w-36 border-t border-slate-700 mx-auto mb-1" />
          <input
            type="text"
            value={invoice.customerSignatureTitle || 'ক্রেতার স্বাক্ষর'}
            onChange={(e) => onUpdateInvoice?.({ customerSignatureTitle: e.target.value })}
            className="text-center font-bold text-slate-800 bg-transparent border-none outline-none focus:outline-none print:p-0"
          />
        </div>

        {/* Seller Digital Signature Block */}
        <SignatureBlock
          signatureTitle={business.signatureTitle || 'স্বত্বাধিকারীর স্বাক্ষর'}
          onChangeTitle={(title) => onUpdateBusiness?.({ signatureTitle: title })}
          signatureImage={business.signatureImage || invoice.signatureImage}
          onOpenSignatureModal={onOpenSignatureModal}
          defaultTitle="স্বত্বাধিকারীর স্বাক্ষর"
        />
      </div>
    </div>
  );
};
