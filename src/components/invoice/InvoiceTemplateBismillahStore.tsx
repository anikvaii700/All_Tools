import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateBismillahStore: React.FC<InvoiceTemplateProps> = ({
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
    <div className="invoice-printable-doc bg-white text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-sky-400 rounded-lg shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      <div>
        {/* Top Header Section with Vertical Red Cash Memo Badge */}
        <div className="flex flex-col sm:flex-row items-stretch border-2 border-sky-500 rounded-xl overflow-hidden mb-3">
          {/* Left Red Vertical Pill */}
          <div className="bg-gradient-to-b from-red-600 via-rose-600 to-red-700 text-white font-black flex items-center justify-center p-2 sm:px-3 text-center tracking-widest text-xs sm:text-sm shrink-0 border-b-2 sm:border-b-0 sm:border-r-2 border-amber-300">
            <input
              type="text"
              value={invoice.memoTypeTitle || 'ক্যাশ মেমো'}
              onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
              className="bg-transparent border-none outline-none text-white text-center w-20 focus:outline-none font-bold"
            />
          </div>

          {/* Central Blue Banner with Yellow Title */}
          <div 
            onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
            className="flex-1 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 py-4 sm:py-5 px-3 sm:px-4 text-center sm:text-left flex flex-col justify-center cursor-pointer"
          >
            <input
              ref={bizNameRef}
              type="text"
              value={business.businessName || ''}
              placeholder="বিসমিল্লাহ্ ষ্টোর"
              onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
              className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-300 drop-shadow-sm tracking-wide bg-transparent border-none outline-none focus:outline-none focus:ring-1 focus:ring-white rounded py-2 sm:py-3 min-h-[48px] sm:min-h-[58px] leading-relaxed print:p-0"
            />
            <input
              type="text"
              value={business.tagline || ''}
              placeholder="এখানে সকল প্রকার জুয়েলারী, কসমেটিক্স ও খেলনা সামগ্রী পাইকারী ও খুচরা বিক্রয় করা হয়।"
              onChange={(e) => onUpdateBusiness?.({ tagline: e.target.value })}
              className="text-[11px] text-white/95 font-semibold mt-1 bg-transparent border-none outline-none focus:outline-none focus:ring-1 focus:ring-white rounded py-1 print:p-0 print:placeholder-transparent"
            />
          </div>

          {/* Right Yellow Contact & Address Panel */}
          <div className="bg-amber-100 p-3 flex flex-col justify-center text-xs font-bold text-slate-800 border-t-2 sm:border-t-0 sm:border-l-2 border-amber-300 min-w-[200px]">
            <div className="flex items-center gap-1">
              <span>প্রোঃ</span>
              <input
                type="text"
                value={business.ownerName || ''}
                placeholder="মিজান"
                onChange={(e) => onUpdateBusiness?.({ ownerName: e.target.value })}
                className="bg-transparent border-b border-amber-400 focus:outline-none font-bold text-slate-800 px-1 py-0.5 flex-1 print:border-none print:p-0"
              />
            </div>
            <div className="text-blue-900 font-mono flex items-center gap-1 mt-1">
              <span>📞</span>
              <input
                type="text"
                value={business.phone || ''}
                placeholder="০১৮৬৬-২৬১২১৩"
                onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
                className="bg-transparent border-b border-amber-400 focus:outline-none font-mono font-bold text-blue-900 px-1 py-0.5 flex-1 print:border-none print:p-0"
              />
            </div>
            <input
              type="text"
              value={business.businessAddress || ''}
              placeholder="সি-৩৬, সিটি সেন্টার, কেরানীহাট, সাতকানিয়া, চট্টগ্রাম।"
              onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
              className="text-[10px] text-slate-700 mt-1 leading-tight bg-transparent border-b border-amber-400 focus:outline-none px-1 py-0.5 print:border-none print:p-0"
            />
          </div>
        </div>

        {/* Customer Information Oval Badges with Extra Breathing Space for Matras */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-3 text-xs">
          {/* Serial / Memo No */}
          <div 
            onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
            className="sm:col-span-6 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-amber-400 text-slate-900 font-extrabold px-3 py-1.5 rounded-full text-xs shrink-0 border border-amber-500 select-none">
              ক্রমিক নংঃ
            </span>
            <input
              ref={invNumberRef}
              type="text"
              value={invoice.invoiceNumber || ''}
              placeholder="MSF-INV-0001"
              onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
              className="flex-1 border-2 border-sky-400 rounded-full font-mono font-bold text-slate-900 px-3 py-1.5 bg-transparent outline-none focus:outline-none focus:bg-sky-50 print:p-0"
            />
          </div>

          {/* Date */}
          <div 
            onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
            className="sm:col-span-6 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-amber-400 text-slate-900 font-extrabold px-3 py-1.5 rounded-full text-xs shrink-0 border border-amber-500 select-none">
              তারিখঃ
            </span>
            <input
              ref={invDateRef}
              type="text"
              value={invoice.invoiceDate || ''}
              placeholder="২০২৬-১০-২৮"
              onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
              className="flex-1 border-2 border-sky-400 rounded-full font-mono font-bold text-slate-800 px-3 py-1.5 bg-transparent outline-none focus:outline-none focus:bg-sky-50 print:p-0"
            />
          </div>

          {/* Customer Name with Matra Room */}
          <div 
            onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
            className="sm:col-span-12 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-blue-700 text-white font-bold px-4 py-2 rounded-full text-xs shrink-0 select-none">
              নামঃ
            </span>
            <input
              ref={custNameRef}
              type="text"
              value={invoice.customer.name || ''}
              placeholder="সম্মানিত ক্রেতার নাম"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
              className="flex-1 border-2 border-sky-400 rounded-full font-bold text-slate-900 px-4 py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent outline-none focus:outline-none focus:bg-sky-50 print:p-0"
            />
          </div>

          {/* Customer Address with Matra Room */}
          <div 
            onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
            className="sm:col-span-12 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-blue-700 text-white font-bold px-4 py-2 rounded-full text-xs shrink-0 select-none">
              ঠিকানাঃ
            </span>
            <input
              ref={custAddressRef}
              type="text"
              value={invoice.customer.address || ''}
              placeholder="ক্রেতার ঠিকানা"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
              className="flex-1 border-2 border-sky-400 rounded-full font-medium text-slate-800 px-4 py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent outline-none focus:outline-none focus:bg-sky-50 print:p-0"
            />
          </div>
        </div>

        {/* Outline Table without inner boxes */}
        <div className="border-2 border-sky-500 rounded-xl overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-800 text-white text-[11px] sm:text-xs font-bold text-center">
                <th className="py-2.5 px-2 border-r border-sky-400 w-12">নং</th>
                <th className="py-2.5 px-4 border-r border-sky-400 text-left">মালের বিবরণ</th>
                <th className="py-2.5 px-3 border-r border-sky-400 w-24">পরিমাণ</th>
                <th className="py-2.5 px-3 border-r border-sky-400 w-24 text-right">দর</th>
                <th className="py-2.5 px-4 w-28 text-right">টাকা</th>
                <th className="py-2.5 px-1 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-sky-50/40 transition">
                  <td className="py-2.5 px-2 text-center font-bold text-sky-800 border-r border-sky-200">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-1 px-2 border-r border-sky-200">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      placeholder="মালের বিবরণ লিখুন"
                      className="w-full font-bold text-slate-900 bg-transparent border-none outline-none focus:outline-none focus:bg-sky-50 px-1 py-1 print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-center border-r border-sky-200">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem?.(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono font-bold bg-transparent border-none outline-none focus:outline-none focus:bg-sky-50 py-1 px-1 print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-right border-r border-sky-200">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem?.(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-right font-mono bg-transparent border-none outline-none focus:outline-none focus:bg-sky-50 py-1 px-1 print:p-0"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
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

              <tr className="print:hidden bg-sky-50/50">
                <td colSpan={6} className="py-1.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>➕ আইটেম যোগ করুন</span>
                  </button>
                </td>
              </tr>

              {/* Empty placeholder rows */}
              {Array.from({ length: Math.max(0, 5 - invoice.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-7">
                  <td className="border-r border-sky-200"></td>
                  <td className="border-r border-sky-200"></td>
                  <td className="border-r border-sky-200"></td>
                  <td className="border-r border-sky-200"></td>
                  <td></td>
                  <td className="print:hidden"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Calculations */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-sky-700 text-white font-bold px-3 py-1 rounded-full text-[11px] shrink-0">
                কথায়ঃ
              </span>
              <input
                type="text"
                value={invoice.customInWords !== undefined ? invoice.customInWords : amountInWords}
                onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                placeholder={amountInWords}
                className="border-b-2 border-sky-300 flex-1 font-bold text-slate-800 text-xs px-2 py-1 bg-transparent border-none outline-none focus:outline-none focus:bg-white print:p-0"
              />
            </div>
            {invoice.notes && (
              <div className="text-[11px] text-slate-600 italic bg-amber-50 p-1.5 rounded border border-amber-200">
                <span className="font-bold">নোটঃ </span>{invoice.notes}
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 border-2 border-sky-400 rounded-xl overflow-hidden divide-y divide-sky-200 text-xs font-bold bg-white">
            {(calc.totalVat > 0 || calc.totalDiscount > 0) && (
              <div className="flex justify-between py-1 px-3 bg-sky-50 text-slate-800">
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
              <div className="flex justify-between py-1 px-3 bg-amber-50 text-amber-900 border-b border-sky-200">
                <span>ভ্যাট / ট্যাক্সঃ</span>
                <span className="font-mono font-bold">+{currencySymbol} {numFormat(calc.totalVat)}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 px-3 bg-sky-100 text-slate-900">
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
      <div className="pt-8 border-t border-sky-300 flex items-end justify-between text-xs font-bold text-slate-700">
        <div className="text-center">
          <div className="w-36 border-t-2 border-slate-700 mx-auto mb-1" />
          <input
            type="text"
            value={invoice.customerSignatureTitle || 'ক্রেতার স্বাক্ষর'}
            onChange={(e) => onUpdateInvoice?.({ customerSignatureTitle: e.target.value })}
            className="text-center font-bold text-slate-700 bg-transparent border-none outline-none focus:outline-none print:p-0"
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
