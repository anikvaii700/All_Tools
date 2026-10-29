import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateFurnitureClassic: React.FC<InvoiceTemplateProps> = ({
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
    <div className="invoice-printable-doc bg-[#fff6ee] text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-[#fb923c] rounded-xl shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Right Diamond Red Cash Memo Ribbon */}
      <div className="absolute top-0 right-3 bg-red-600 text-white font-black py-1 px-3 text-xs shadow-md rounded-b-xl border-b-2 border-amber-300">
        <input
          type="text"
          value={invoice.memoTypeTitle || 'ক্যাশ মেমো'}
          onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
          className="bg-transparent border-none outline-none text-white text-center w-24 focus:outline-none font-bold"
        />
      </div>

      <div>
        {/* Business Title in Classic Calligraphic Bengali Red */}
        <div className="text-center py-3 sm:py-4">
          <div 
            onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
            className="cursor-pointer my-1"
          >
            <input
              ref={bizNameRef}
              type="text"
              value={business.businessName || ''}
              placeholder="মায়ের দোয়া জান্নাত ফার্নিচার"
              onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
              className="w-full text-center text-2xl sm:text-4xl md:text-5xl font-black text-red-600 tracking-tight drop-shadow-xs bg-transparent border-none outline-none focus:outline-none focus:bg-white/80 rounded py-2.5 sm:py-3.5 min-h-[52px] sm:min-h-[68px] leading-relaxed print:p-0"
            />
          </div>
          <div className="inline-flex items-center gap-1 bg-sky-500 text-white font-bold text-xs px-4 py-1 rounded-full mt-1">
            <span>প্রোপাইটরঃ</span>
            <input
              type="text"
              value={business.ownerName || ''}
              placeholder="মোঃ জসিম"
              onChange={(e) => onUpdateBusiness?.({ ownerName: e.target.value })}
              className="bg-transparent border-none outline-none text-white focus:outline-none text-center min-w-[120px] print:p-0 font-bold"
            />
          </div>
          <input
            type="text"
            value={business.businessAddress || ''}
            placeholder="পুরাতন কন্ট্রোল্যের মোড়, বায়তুল শরফ মসজিদের পাশে, দক্ষিণ পতেঙ্গা, চট্টগ্রাম।"
            onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
            className="w-full text-center text-xs text-slate-700 mt-1.5 bg-transparent border-none outline-none focus:outline-none focus:bg-white/80 rounded py-0.5 print:p-0"
          />

          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between bg-lime-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold gap-2">
            <input
              type="text"
              value={business.tagline || ''}
              placeholder="এখানে উন্নত মানের কাঠের ফার্নিচার বিক্রয় ও নকশা করা হয়।"
              onChange={(e) => onUpdateBusiness?.({ tagline: e.target.value })}
              className="bg-transparent border-none outline-none text-white focus:outline-none flex-1 text-center sm:text-left print:p-0 print:placeholder-transparent"
            />
            <div className="flex items-center gap-1 font-mono">
              <span>মোবাঃ</span>
              <input
                type="text"
                value={business.phone || ''}
                placeholder="০১৭৭৭-০৭০৪৬৬"
                onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
                className="bg-transparent border-none outline-none text-white focus:outline-none font-mono text-center w-28 print:p-0"
              />
            </div>
          </div>
        </div>

        {/* Customer Information Grid with Colored Labels - Extra Spacing for Matras (ই-কার, ঈ-কার) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 my-3 text-xs">
          <div 
            onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
            className="sm:col-span-6 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-purple-800 text-white font-bold px-3 py-1.5 rounded text-[11px] shrink-0">
              নং-
            </span>
            <input
              ref={invNumberRef}
              type="text"
              value={invoice.invoiceNumber || ''}
              placeholder="MSF-INV-0001"
              onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
              className="flex-1 border border-slate-300 bg-white font-mono font-bold text-slate-900 px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-purple-400 print:border-none print:p-0"
            />
          </div>

          <div 
            onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
            className="sm:col-span-6 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-emerald-700 text-white font-bold px-3 py-1.5 rounded text-[11px] shrink-0">
              তারিখঃ
            </span>
            <input
              ref={invDateRef}
              type="text"
              value={invoice.invoiceDate || ''}
              placeholder="২০২৬-১০-২৮"
              onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
              className="flex-1 border border-slate-300 bg-white font-mono font-bold text-slate-900 px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400 print:border-none print:p-0"
            />
          </div>

          {/* Customer Name with Extra Padding & Line Height for Vowels/Matras */}
          <div 
            onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
            className="sm:col-span-12 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-emerald-700 text-white font-bold px-4 py-2 rounded text-xs shrink-0 select-none">
              নামঃ
            </span>
            <input
              ref={custNameRef}
              type="text"
              value={invoice.customer.name || ''}
              placeholder="সম্মানিত ক্রেতার নাম"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
              className="flex-1 border border-slate-300 bg-white font-bold text-slate-900 px-3 py-2 rounded min-h-[38px] sm:min-h-[42px] text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-400 print:border-none print:p-0"
            />
          </div>

          {/* Customer Address with Extra Padding for Matras */}
          <div 
            onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
            className="sm:col-span-12 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-emerald-700 text-white font-bold px-4 py-2 rounded text-xs shrink-0 select-none">
              ঠিকানাঃ
            </span>
            <input
              ref={custAddressRef}
              type="text"
              value={invoice.customer.address || ''}
              placeholder="ক্রেতার ঠিকানা"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
              className="flex-1 border border-slate-300 bg-white font-medium text-slate-900 px-3 py-2 rounded min-h-[38px] sm:min-h-[42px] text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-400 print:border-none print:p-0"
            />
          </div>
        </div>

        {/* Traditional Grid Table without inner boxes ('ঘর ঘর' মুক্ত পরিচ্ছন্ন টেবিল) */}
        <div className="border-2 border-orange-400 rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-500 text-white text-[11px] sm:text-xs font-bold text-center">
                <th className="py-2.5 px-2 border-r border-orange-300 w-12">নং</th>
                <th className="py-2.5 px-4 border-r border-orange-300 text-left">বিবরণ</th>
                <th className="py-2.5 px-3 border-r border-orange-300 w-24">পরিমাণ</th>
                <th className="py-2.5 px-3 border-r border-orange-300 w-24 text-right">দর</th>
                <th className="py-2.5 px-4 w-28 text-right">টাকা</th>
                <th className="py-2.5 px-1 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-orange-50/40 transition">
                  <td className="py-2.5 px-2 text-center font-bold text-orange-900 border-r border-orange-200">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="py-1 px-2 border-r border-orange-200">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      placeholder="ফার্নিচারের বিবরণ লিখুন"
                      className="w-full font-bold text-slate-900 bg-transparent border-none outline-none focus:outline-none focus:bg-orange-50 px-1 py-1 print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-center border-r border-orange-200">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem?.(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono font-bold bg-transparent border-none outline-none focus:outline-none focus:bg-orange-50 py-1 px-1 print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-right border-r border-orange-200">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem?.(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-right font-mono bg-transparent border-none outline-none focus:outline-none focus:bg-orange-50 py-1 px-1 print:p-0"
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

              <tr className="print:hidden bg-orange-50">
                <td colSpan={6} className="py-1.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-orange-800 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>➕ আইটেম যোগ করুন</span>
                  </button>
                </td>
              </tr>

              {/* Empty placeholder rows */}
              {Array.from({ length: Math.max(0, 5 - invoice.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-7">
                  <td className="border-r border-orange-200"></td>
                  <td className="border-r border-orange-200"></td>
                  <td className="border-r border-orange-200"></td>
                  <td className="border-r border-orange-200"></td>
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
                className="border-b border-orange-400 flex-1 font-bold text-slate-800 text-xs px-2 py-1 bg-transparent border-none outline-none focus:outline-none focus:bg-white rounded print:p-0"
              />
            </div>
            {invoice.notes && (
              <div className="text-[11px] text-slate-600 italic">
                <span className="font-bold">শর্তাবলীঃ </span>{invoice.notes}
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 border-2 border-orange-400 rounded-lg overflow-hidden divide-y divide-orange-200 text-xs font-bold bg-white">
            {(calc.totalVat > 0 || calc.totalDiscount > 0) && (
              <div className="flex justify-between py-1 px-3 bg-orange-50 text-slate-800">
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
              <div className="flex justify-between py-1 px-3 bg-amber-50 text-amber-900 border-b border-orange-200">
                <span>ভ্যাট / ট্যাক্সঃ</span>
                <span className="font-mono font-bold">+{currencySymbol} {numFormat(calc.totalVat)}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 px-3 bg-orange-100 text-slate-900">
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
            <div className="flex justify-between py-1.5 px-3 bg-red-100 text-red-700">
              <span>বাকীঃ</span>
              <span className="font-mono font-black">{currencySymbol} {numFormat(calc.dueAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures with Digital Drawing Support */}
      <div className="pt-8 border-t border-orange-300 flex items-end justify-between text-xs font-bold text-slate-700">
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
