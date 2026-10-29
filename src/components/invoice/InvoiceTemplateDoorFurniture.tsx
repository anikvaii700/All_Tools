import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateDoorFurniture: React.FC<InvoiceTemplateProps> = ({
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
    <div className="invoice-printable-doc bg-[#fafff0] text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-[#84cc16] rounded-xl shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Wooden Striped Side Border Accents */}
      <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-purple-600 via-amber-400 to-lime-500 opacity-60 pointer-events-none print:hidden" />
      <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-purple-600 via-amber-400 to-lime-500 opacity-60 pointer-events-none print:hidden" />

      <div>
        {/* Top Header: Cash Memo Capsule & Phone */}
        <div className="flex items-center justify-between pb-1 border-b border-lime-300 gap-2">
          <div className="bg-emerald-600 text-white font-extrabold text-xs px-3 py-0.5 rounded-full shadow-xs">
            <input
              type="text"
              value={invoice.memoTypeTitle || 'ক্যাশ মেমো'}
              onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
              className="bg-transparent border-none text-white text-center w-24 focus:outline-none font-bold"
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-purple-900">
            <span>মোবাইল-</span>
            <input
              type="text"
              value={business.phone || ''}
              placeholder="০১৯১৬৪২২৪০৮"
              onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
              className="font-mono bg-transparent border-b border-purple-300 focus:outline-none px-1 py-0.5 w-28 print:border-none print:p-0"
            />
          </div>
        </div>

        {/* Business Title in Graceful Indigo Bengali */}
        <div className="text-center py-3 sm:py-4 my-1">
          <div 
            onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
            className="cursor-pointer"
          >
            <input
              ref={bizNameRef}
              type="text"
              value={business.businessName || ''}
              placeholder="মদিনা ডোর এন্ড ফার্নিচার"
              onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
              className="w-full text-center text-2xl sm:text-4xl md:text-5xl font-black text-indigo-950 tracking-tight drop-shadow-xs bg-transparent border-none focus:outline-none focus:bg-white/80 rounded py-2.5 sm:py-3.5 min-h-[52px] sm:min-h-[64px] leading-relaxed print:p-0"
            />
          </div>
          <input
            type="text"
            value={business.tagline || ''}
            placeholder="দেশী বিদেশী কাঠের দরজা ও চৌকাঠ পাওয়া যায়। সেগুন, বার্মাটিক সেগুন, গামারী মেহগনি, শিল কড়াই, টিক চাম্বল, ও লোহা কাঠের চৌকাঠ পাওয়া যায়।"
            onChange={(e) => onUpdateBusiness?.({ tagline: e.target.value })}
            className="w-full text-center text-[11px] text-slate-800 font-bold mt-1 bg-transparent border-none focus:outline-none focus:bg-white/80 rounded px-1 py-0.5 print:p-0 print:placeholder-transparent"
          />
          <input
            type="text"
            value={business.businessAddress || ''}
            placeholder="শনিরআখড়া ব্রীজ সংলগ্ন, ৩/৪নং রোডের মধ্যখানে, ঢাকা-১২৩৬"
            onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
            className="w-full text-center text-xs font-bold text-emerald-800 mt-1 bg-transparent border-none focus:outline-none focus:bg-white/80 rounded px-1 py-0.5 print:p-0 print:placeholder-transparent"
          />
        </div>

        {/* Customer Information Oval Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 my-2.5 text-xs">
          <div 
            onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
            className="sm:col-span-6 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-emerald-600 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              নং-
            </span>
            <input
              ref={invNumberRef}
              type="text"
              value={invoice.invoiceNumber || ''}
              placeholder="MSF-INV-0001"
              onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
              className="flex-1 border-2 border-sky-400 rounded bg-white font-mono font-bold text-slate-900 px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-500 print:border-none print:p-0"
            />
          </div>

          <div 
            onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
            className="sm:col-span-6 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-indigo-900 text-white font-bold px-3 py-0.5 rounded text-[11px] shrink-0">
              তারিখঃ
            </span>
            <input
              ref={invDateRef}
              type="text"
              value={invoice.invoiceDate || ''}
              placeholder="২০২৬-১০-২৮"
              onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
              className="flex-1 border-2 border-sky-400 rounded bg-white font-mono font-bold text-slate-900 px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-500 print:border-none print:p-0"
            />
          </div>

          <div 
            onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
            className="sm:col-span-12 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-indigo-900 text-white font-bold px-4 py-1.5 rounded text-xs shrink-0">
              নামঃ
            </span>
            <input
              ref={custNameRef}
              type="text"
              value={invoice.customer.name || ''}
              placeholder="সম্মানিত খরিদ্দার"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
              className="flex-1 border-2 border-sky-400 rounded bg-white font-bold text-slate-900 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 print:border-none print:p-0"
            />
          </div>

          <div 
            onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
            className="sm:col-span-12 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-emerald-600 text-white font-bold px-4 py-1.5 rounded text-xs shrink-0">
              ঠিকানাঃ
            </span>
            <input
              ref={custAddressRef}
              type="text"
              value={invoice.customer.address || ''}
              placeholder="খরিদ্দারের ঠিকানা"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
              className="flex-1 border-2 border-sky-400 rounded bg-white font-medium text-slate-800 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 print:border-none print:p-0"
            />
          </div>
        </div>

        {/* Outline Table */}
        <div className="border-2 border-lime-600 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-lime-600 text-white text-[11px] sm:text-xs font-bold text-center">
                <th className="py-2 px-2 border-r border-lime-400 w-12">নং</th>
                <th className="py-2 px-4 border-r border-lime-400 text-left">বিবরণ</th>
                <th className="py-2 px-3 border-r border-lime-400 w-24">পরিমাণ</th>
                <th className="py-2 px-3 border-r border-lime-400 w-24 text-right">দর</th>
                <th className="py-2 px-4 w-28 text-right">টাকা</th>
                <th className="py-2 px-1 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lime-100 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-lime-50/40 transition">
                  <td className="py-2 px-2 text-center font-bold text-lime-900 border-r border-lime-200">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-1 px-2 border-r border-lime-200">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      placeholder="দরজা / চৌকাঠের বিবরণ লিখুন"
                      className="w-full font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:bg-lime-50 px-1 py-0.5 print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-center border-r border-lime-200">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem?.(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono font-bold bg-transparent border-none outline-none focus:outline-none focus:bg-lime-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-right border-r border-lime-200">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem?.(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-right font-mono bg-transparent border-none outline-none focus:outline-none focus:bg-lime-50 px-1 py-1 print:border-none print:p-0"
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

              <tr className="print:hidden bg-lime-50">
                <td colSpan={6} className="py-1 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-lime-900 hover:underline"
                  >
                    ➕ আইটেম যোগ করুন
                  </button>
                </td>
              </tr>

              {/* Empty placeholder rows */}
              {Array.from({ length: Math.max(0, 5 - invoice.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-7">
                  <td className="border-r border-lime-200"></td>
                  <td className="border-r border-lime-200"></td>
                  <td className="border-r border-lime-200"></td>
                  <td className="border-r border-lime-200"></td>
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
                className="border-b border-lime-500 flex-1 font-bold text-slate-800 text-xs px-2 py-0.5 bg-transparent focus:outline-none focus:bg-white print:p-0"
              />
            </div>
            {invoice.notes && (
              <div className="text-[11px] text-slate-600 italic">
                <span className="font-bold">শর্তাবলীঃ </span>{invoice.notes}
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 border-2 border-lime-600 rounded-lg overflow-hidden divide-y divide-lime-200 text-xs font-bold bg-white">
            {(calc.totalVat > 0 || calc.totalDiscount > 0) && (
              <div className="flex justify-between py-1 px-3 bg-lime-50 text-slate-800">
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
              <div className="flex justify-between py-1 px-3 bg-amber-50 text-amber-900 border-b border-lime-200">
                <span>ভ্যাট / ট্যাক্সঃ</span>
                <span className="font-mono font-bold">+{currencySymbol} {numFormat(calc.totalVat)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 px-3 bg-lime-100 text-slate-900">
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
      <div className="pt-8 border-t border-lime-400 flex items-end justify-between text-xs font-bold text-slate-700">
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
