import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateMobilePoint: React.FC<InvoiceTemplateProps> = ({
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
  const invDateRef = useRef<HTMLInputElement>(null);
  const invNumberRef = useRef<HTMLInputElement>(null);
  const bizNameRef = useRef<HTMLInputElement>(null);

  return (
    <div className="invoice-printable-doc bg-gradient-to-b from-sky-50 via-white to-sky-50 text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-4 border-sky-400 rounded-xl shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      <div>
        {/* Top Header Row with Brand Badges and Title */}
        <div className="relative border-b-2 border-sky-500 pb-3">
          {/* Top Corner Cash Memo Pill */}
          <div className="absolute top-0 right-0">
            <input
              type="text"
              value={invoice.memoTypeTitle || 'ক্যাশ মেমো'}
              onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
              className="bg-amber-400 text-slate-900 font-black px-4 py-1.5 rounded-bl-2xl shadow-xs text-xs sm:text-sm tracking-wide border-l border-b border-amber-500 text-center w-28 outline-none focus:outline-none focus:ring-1 focus:ring-amber-600 print:border-none print:bg-transparent"
              title="ক্যাশ মেমো টাইটেল এডিট করুন"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            {/* Left Brand Pills / Logo */}
            <div className="flex sm:flex-col items-center gap-1 shrink-0">
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt="Logo"
                  className="w-14 h-14 object-contain rounded-xl border border-sky-300 bg-white p-1"
                />
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-2 gap-1 text-[9px] font-bold">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-center">vivo</span>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-center">oppo</span>
                  <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-center">mi</span>
                  <span className="bg-yellow-500 text-slate-900 px-1.5 py-0.5 rounded text-center">realme</span>
                  <span className="bg-blue-800 text-white px-1.5 py-0.5 rounded text-center">SAMSUNG</span>
                  <span className="bg-red-600 text-white px-1 py-0.5 rounded text-center">1+</span>
                </div>
              )}
            </div>

            {/* Central Main Business Title */}
            <div className="flex-1 text-center w-full">
              <div 
                onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
                className="inline-block w-full max-w-xl bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-md border-2 border-white cursor-pointer"
              >
                <input
                  ref={bizNameRef}
                  type="text"
                  value={business.businessName || ''}
                  placeholder="ফাস্ট মোবাইল পয়েন্ট"
                  onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
                  className="w-full text-center text-xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-xs bg-transparent border-none outline-none text-white placeholder:text-blue-200 focus:outline-none focus:ring-1 focus:ring-white rounded py-2 sm:py-2.5 min-h-[48px] sm:min-h-[64px] leading-relaxed print:placeholder-transparent"
                />
                <input
                  type="text"
                  value={business.subtitle || ''}
                  placeholder="কোম্পানির অনুমোদিত শো-রুম"
                  onChange={(e) => onUpdateBusiness?.({ subtitle: e.target.value })}
                  className="w-full text-center text-[11px] sm:text-xs text-sky-100 font-bold tracking-wider mt-0.5 bg-transparent border-none outline-none placeholder:text-sky-200 focus:outline-none focus:ring-1 focus:ring-white rounded py-0.5 print:placeholder-transparent"
                />
              </div>

              {/* Owner & Phone Row */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-2 text-xs font-black text-rose-700">
                <div className="flex items-center gap-1">
                  <span>➤ প্রোঃ</span>
                  <input
                    type="text"
                    value={business.ownerName || ''}
                    placeholder="তিতাস সরকার"
                    onChange={(e) => onUpdateBusiness?.({ ownerName: e.target.value })}
                    className="font-bold text-rose-700 border-b border-rose-300 focus:outline-none focus:bg-rose-50 px-1 py-0.5 min-w-[120px] print:border-none print:p-0"
                  />
                  <span>◄</span>
                </div>
                <div className="flex items-center gap-1 text-slate-800">
                  <span className="text-rose-600">📞</span>
                  <input
                    type="text"
                    value={business.phone || ''}
                    placeholder="০১৮১৭-৫৭৮০০৮০"
                    onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
                    className="font-bold text-slate-800 border-b border-slate-300 focus:outline-none focus:bg-sky-50 px-1 py-0.5 min-w-[130px] print:border-none print:p-0"
                  />
                </div>
              </div>

              {/* Services Tagline */}
              <div className="mt-1.5 inline-block w-full max-w-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-[10px] sm:text-xs px-3 py-0.5 rounded-full shadow-xs">
                <input
                  type="text"
                  value={business.tagline || ''}
                  placeholder="এখানে মোবাইল সার্ভিসিং সহ মোবাইলের সকল ধরনের কাঙ্ক্ষিত সেবা পেয়ে যাবেন।"
                  onChange={(e) => onUpdateBusiness?.({ tagline: e.target.value })}
                  className="w-full text-center bg-transparent border-none outline-none text-white placeholder:text-rose-200 focus:outline-none focus:ring-1 focus:ring-white rounded print:placeholder-transparent"
                />
              </div>
            </div>
          </div>

          {/* Cyan Address Bar */}
          <div className="mt-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-center py-1 px-3 rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5">
            <span>📍</span>
            <input
              type="text"
              value={business.businessAddress || ''}
              placeholder="বরুড়া চান্দিনা রোড, গপি সড়কের রাস্তার মাথায়, বরুড়া, কুমিল্লা।"
              onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
              className="w-full max-w-xl text-center bg-transparent border-none outline-none text-white placeholder:text-sky-200 focus:outline-none focus:ring-1 focus:ring-white rounded print:placeholder-transparent"
            />
          </div>
        </div>

        {/* Customer Information Badges Row with Extra Breathing Space for Matras (ই-কার, ঈ-কার) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 my-3 text-xs">
          {/* Customer Name */}
          <div 
            onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
            className="sm:col-span-6 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-red-700 text-white font-bold px-3 py-2 rounded-md text-xs shrink-0 select-none">
              নামঃ
            </span>
            <input
              ref={custNameRef}
              type="text"
              value={invoice.customer.name || ''}
              placeholder="সম্মানিত ক্রেতা"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
              className="flex-1 border-b-2 border-sky-400 font-bold text-slate-900 px-3 py-1.5 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent outline-none focus:outline-none focus:bg-white/80 focus:ring-1 focus:ring-sky-500 rounded-sm print:border-b print:border-sky-400 print:bg-transparent print:p-0 print:ring-0"
            />
          </div>

          {/* Date */}
          <div 
            onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
            className="sm:col-span-3 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-emerald-700 text-white font-bold px-3 py-2 rounded-md text-xs shrink-0 select-none">
              তারিখঃ
            </span>
            <input
              ref={invDateRef}
              type="text"
              value={invoice.invoiceDate || ''}
              placeholder="২০২৬-১০-২৮"
              onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
              className="flex-1 border-b-2 border-sky-400 font-mono font-bold text-slate-800 px-3 py-1.5 min-h-[38px] sm:min-h-[42px] bg-transparent outline-none focus:outline-none focus:bg-white/80 focus:ring-1 focus:ring-sky-500 rounded-sm print:border-b print:border-sky-400 print:bg-transparent print:p-0 print:ring-0"
            />
          </div>

          {/* Serial / Invoice Number */}
          <div 
            onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
            className="sm:col-span-3 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-purple-800 text-white font-bold px-3 py-2 rounded-md text-xs shrink-0 select-none">
              ক্রমিক নংঃ
            </span>
            <input
              ref={invNumberRef}
              type="text"
              value={invoice.invoiceNumber || ''}
              placeholder="MSF-INV-0001"
              onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
              className="flex-1 border-b-2 border-sky-400 font-mono font-extrabold text-red-600 px-3 py-1.5 min-h-[38px] sm:min-h-[42px] bg-transparent outline-none focus:outline-none focus:bg-white/80 focus:ring-1 focus:ring-sky-500 rounded-sm print:border-b print:border-sky-400 print:bg-transparent print:p-0 print:ring-0"
            />
          </div>

          {/* Customer Address */}
          <div 
            onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
            className="sm:col-span-7 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-emerald-700 text-white font-bold px-3 py-2 rounded-md text-xs shrink-0 select-none">
              ঠিকানাঃ
            </span>
            <input
              ref={custAddressRef}
              type="text"
              value={invoice.customer.address || ''}
              placeholder="ক্রেতার ঠিকানা"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
              className="flex-1 border-b-2 border-sky-400 font-medium text-slate-800 px-3 py-1.5 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent outline-none focus:outline-none focus:bg-white/80 focus:ring-1 focus:ring-sky-500 rounded-sm print:border-b print:border-sky-400 print:bg-transparent print:p-0 print:ring-0"
            />
          </div>

          {/* Customer Mobile */}
          <div 
            onClick={() => { custPhoneRef.current?.focus(); onEditField?.('field-cust-phone'); }}
            className="sm:col-span-5 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="bg-blue-700 text-white font-bold px-3 py-2 rounded-md text-xs shrink-0 select-none">
              মোবাইলঃ
            </span>
            <input
              ref={custPhoneRef}
              type="text"
              value={invoice.customer.phone || ''}
              placeholder="০১৭xxxxxxxx"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, phone: e.target.value } })}
              className="flex-1 border-b-2 border-sky-400 font-mono font-bold text-slate-900 px-3 py-1.5 min-h-[38px] sm:min-h-[42px] bg-transparent outline-none focus:outline-none focus:bg-white/80 focus:ring-1 focus:ring-sky-500 rounded-sm print:border-b print:border-sky-400 print:bg-transparent print:p-0 print:ring-0"
            />
          </div>
        </div>

        {/* Rounded Column Blue Outline Table without inner boxes ('ঘর ঘর' মুক্ত) */}
        <div className="border-2 border-sky-500 rounded-xl overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-900 via-sky-700 to-blue-900 text-white text-[11px] sm:text-xs font-bold text-center">
                <th className="py-2.5 px-2 border-r border-sky-400 w-12">ক্র.নং</th>
                <th className="py-2.5 px-4 border-r border-sky-400 text-left">বিবরণ</th>
                <th className="py-2.5 px-3 border-r border-sky-400 w-24">পরিমাপ</th>
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
                      placeholder="পণ্য বা সেবার নাম"
                      className="w-full font-bold text-slate-900 bg-transparent border-none outline-none focus:outline-none focus:bg-sky-50 rounded px-1 py-1 print:p-0"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => onUpdateItem?.(item.id, { description: e.target.value })}
                      placeholder="বিবরণ / IMEI / মডেল..."
                      className="w-full text-[10px] text-slate-500 bg-transparent border-none outline-none focus:outline-none focus:bg-sky-50 rounded px-1 py-0.5 print:p-0 print:placeholder-transparent"
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
                        title="আইটেম মুছুন"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {/* Add item button row */}
              <tr className="print:hidden bg-sky-50/50">
                <td colSpan={6} className="py-1.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>➕ নতুন আইটেম যোগ করুন</span>
                  </button>
                </td>
              </tr>

              {/* Empty placeholder rows to fill height */}
              {Array.from({ length: Math.max(0, 4 - invoice.items.length) }).map((_, i) => (
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

        {/* Bottom Calculations and Totals with Pill Badges */}
        <div className="mt-3 flex flex-col sm:flex-row items-stretch justify-between gap-3">
          {/* Left In-Words and Notes */}
          <div className="flex-1 flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-600 text-white font-bold px-3 py-1 rounded-md text-[11px] shrink-0">
                কথায়ঃ
              </span>
              <input
                type="text"
                value={invoice.customInWords !== undefined ? invoice.customInWords : amountInWords}
                onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                placeholder={amountInWords}
                className="border-b-2 border-sky-300 flex-1 font-bold text-slate-800 text-xs px-2 py-1 bg-transparent border-none outline-none focus:outline-none focus:bg-white rounded print:border-b print:bg-transparent print:p-0"
              />
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 text-[11px] text-slate-700">
              <span className="font-bold text-sky-900">নোটঃ </span>
              <input
                type="text"
                value={invoice.notes || ''}
                placeholder="নোট বা শর্তাবলী লিখুন..."
                onChange={(e) => onUpdateInvoice?.({ notes: e.target.value })}
                className="w-full bg-transparent border-none outline-none text-slate-700 text-xs focus:outline-none focus:bg-white rounded px-1 py-0.5 print:p-0 print:placeholder-transparent"
              />
            </div>
          </div>

          {/* Right Calculations (মোট টাকাঃ, জমাঃ, বাকীঃ) */}
          <div className="w-full sm:w-64 space-y-1.5">
            {(calc.totalVat > 0 || calc.totalDiscount > 0) && (
              <div className="flex items-center gap-1.5">
                <span className="bg-slate-600 text-white font-bold px-3 py-1 rounded-lg text-xs w-24 text-center shrink-0">
                  উপ-মোটঃ
                </span>
                <div className="flex-1 bg-slate-50 border border-slate-300 rounded-lg py-1 px-3 text-right font-mono font-bold text-slate-800 text-xs">
                  {currencySymbol} {numFormat(calc.subtotal)}
                </div>
              </div>
            )}
            {calc.totalDiscount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="bg-rose-500 text-white font-bold px-3 py-1 rounded-lg text-xs w-24 text-center shrink-0">
                  ছাড়ঃ
                </span>
                <div className="flex-1 bg-rose-50 border border-rose-300 rounded-lg py-1 px-3 text-right font-mono font-bold text-rose-700 text-xs">
                  -{currencySymbol} {numFormat(calc.totalDiscount)}
                </div>
              </div>
            )}
            {calc.totalVat > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="bg-amber-600 text-white font-bold px-3 py-1 rounded-lg text-xs w-24 text-center shrink-0">
                  ভ্যাটঃ
                </span>
                <div className="flex-1 bg-amber-50 border border-amber-300 rounded-lg py-1 px-3 text-right font-mono font-bold text-amber-900 text-xs">
                  +{currencySymbol} {numFormat(calc.totalVat)}
                </div>
              </div>
            )}
            {/* Grand Total */}
            <div className="flex items-center gap-1.5">
              <span className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-xs w-24 text-center shrink-0">
                {calc.totalVat > 0 || calc.totalDiscount > 0 ? 'সর্বমোটঃ' : 'মোট টাকাঃ'}
              </span>
              <div className="flex-1 bg-sky-50 border border-sky-300 rounded-lg py-1 px-3 text-right font-mono font-black text-slate-900 text-sm">
                {currencySymbol} {numFormat(calc.grandTotal)}
              </div>
            </div>

            {/* Paid Amount */}
            <div className="flex items-center gap-1.5">
              <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg text-xs w-24 text-center shrink-0">
                জমাঃ
              </span>
              <div className="flex-1 bg-rose-50 border border-rose-300 rounded-lg py-0.5 px-2 flex items-center justify-end">
                <span className="text-rose-700 font-mono text-sm mr-1">{currencySymbol}</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={invoice.paidAmount ?? 0}
                  onChange={(e) => onUpdateInvoice?.({ paidAmount: parseFloat(e.target.value) || 0 })}
                  className="w-24 text-right font-mono font-bold text-rose-700 text-sm bg-transparent border-none outline-none focus:outline-none print:p-0"
                />
              </div>
            </div>

            {/* Due Amount */}
            <div className="flex items-center gap-1.5">
              <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-xs w-24 text-center shrink-0">
                বাকীঃ
              </span>
              <div className="flex-1 bg-amber-50 border border-amber-300 rounded-lg py-1 px-3 text-right font-mono font-bold text-amber-900 text-sm">
                {currencySymbol} {numFormat(calc.dueAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures with Digital Drawing Support */}
      <div className="pt-8 border-t border-sky-300 flex items-end justify-between text-xs font-bold text-slate-700">
        <div className="text-center">
          <div className="w-32 sm:w-40 border-t-2 border-slate-700 mx-auto mb-1" />
          <input
            type="text"
            value={invoice.customerSignatureTitle || 'ক্রেতার স্বাক্ষর'}
            onChange={(e) => onUpdateInvoice?.({ customerSignatureTitle: e.target.value })}
            className="text-center font-bold text-slate-700 bg-transparent border-none outline-none focus:outline-none focus:bg-white rounded px-1 print:border-none print:p-0"
          />
        </div>
        
        {/* Seller Digital Signature Block */}
        <SignatureBlock
          signatureTitle={business.signatureTitle || 'বিক্রেতার স্বাক্ষর'}
          onChangeTitle={(title) => onUpdateBusiness?.({ signatureTitle: title })}
          signatureImage={business.signatureImage || invoice.signatureImage}
          onOpenSignatureModal={onOpenSignatureModal}
          defaultTitle="বিক্রেতার স্বাক্ষর"
        />
      </div>
    </div>
  );
};
