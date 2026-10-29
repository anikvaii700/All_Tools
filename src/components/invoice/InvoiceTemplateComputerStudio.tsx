import React from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, numberToWordsBengali, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateComputerStudio: React.FC<InvoiceTemplateProps> = ({
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
  const rawWords = invoice.customInWords || numberToWordsBengali(calc.grandTotal);
  const amountInWords = cleanBengaliAmountInWords(rawWords);
  const numFormat = (num: number) => toBengaliNumerals(formatMoney(num, ''));

  const inlineInput =
    'bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-700 focus:bg-amber-50/50 outline-none rounded transition print:border-none print:bg-transparent print:p-0';

  return (
    <div className="bg-white text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-2 border-blue-800 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-text overflow-hidden">
      {/* Top Royal Blue Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-9 bg-blue-800 flex items-center justify-between px-6 text-white text-xs font-bold print:bg-blue-800 z-10">
        <input
          type="text"
          value={business.religiousHeader || 'বিসমিল্লাহির রহমানির রহীম'}
          onChange={(e) => onUpdateBusiness?.({ religiousHeader: e.target.value })}
          onFocus={() => onEditField?.('field-biz-religious')}
          className="bg-transparent border-none text-white outline-none w-48 sm:w-64 font-bold"
          placeholder="ধর্মীয় বাণী"
        />
        <div className="flex items-center gap-1 font-mono">
          <span>মোবাঃ</span>
          <input
            type="text"
            value={business.phone || '০১৭০০০০০০০০'}
            onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
            onFocus={() => onEditField?.('field-biz-phone')}
            className="bg-transparent border-none text-white outline-none w-28 sm:w-36 font-mono font-bold text-right"
            placeholder="মোবাইল নম্বর"
          />
        </div>
      </div>

      {/* Bottom Left Decorative Wave Accent */}
      <div className="absolute bottom-0 left-0 w-48 h-24 bg-blue-800 rounded-tr-full opacity-90 pointer-events-none print:opacity-100" />

      <div className="pt-6">
        {/* Cash Memo Capsule */}
        <div className="text-center my-2">
          <input
            type="text"
            value={business.memoTypeTitle || 'ক্যাশ মেমো'}
            onChange={(e) => onUpdateBusiness?.({ memoTypeTitle: e.target.value })}
            className="bg-blue-800 text-white font-extrabold text-xs px-6 py-1 rounded-full shadow-xs inline-block text-center w-36 border-none outline-none focus:ring-1 focus:ring-white"
            placeholder="ক্যাশ মেমো"
          />
        </div>

        {/* Business Title in Royal Blue */}
        <div className="text-center py-3 sm:py-4 my-1">
          <input
            type="text"
            value={business.businessName || 'নাঈম কম্পিউটার কর্নার এন্ড স্টুডিও'}
            onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
            onFocus={() => onEditField?.('field-biz-name')}
            title="প্রতিষ্ঠানের নাম এডিট করুন"
            className={`w-full text-center text-2xl sm:text-3xl md:text-4xl font-black text-blue-900 tracking-tight py-2.5 sm:py-3.5 min-h-[52px] sm:min-h-[64px] leading-relaxed ${inlineInput}`}
            placeholder="প্রতিষ্ঠানের নাম"
          />
          <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
            <span>প্রোঃ</span>
            <input
              type="text"
              value={business.ownerName || 'মোঃ নাঈম ইসলাম'}
              onChange={(e) => onUpdateBusiness?.({ ownerName: e.target.value })}
              onFocus={() => onEditField?.('field-biz-owner')}
              className={`text-center font-bold text-slate-800 w-48 sm:w-64 ${inlineInput}`}
              placeholder="স্বত্বাধিকারী"
            />
          </div>
          <input
            type="text"
            value={business.businessAddress || 'পোলের হাট বাজার, কাউখালী, পিরোজপুর'}
            onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
            onFocus={() => onEditField?.('field-biz-address')}
            className={`w-full text-center text-xs text-slate-600 mt-0.5 ${inlineInput}`}
            placeholder="প্রতিষ্ঠানের ঠিকানা"
          />
        </div>

        {/* Minimal Dotted Customer Rows */}
        <div className="my-3 space-y-2 text-xs text-slate-800 border-t border-b border-blue-200 py-2.5">
          <div
            onClick={() => {
              const el = document.getElementById('field-comp-cust-name');
              el?.focus();
            }}
            className="flex items-center gap-2 cursor-text"
          >
            <span className="font-extrabold text-slate-900 shrink-0 text-sm">নামঃ</span>
            <input
              id="field-comp-cust-name"
              type="text"
              value={invoice.customer.name || ''}
              onChange={(e) =>
                onUpdateInvoice?.({
                  customer: { ...invoice.customer, name: e.target.value },
                })
              }
              onFocus={() => onEditField?.('field-cust-name')}
              title="গ্রাহকের নাম এডিট করুন"
              className="border-b border-dotted border-blue-900 flex-1 font-bold text-slate-900 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent outline-none focus:bg-amber-50"
              placeholder="খরিদ্দারের নাম লিখুন..."
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div
              onClick={() => {
                const el = document.getElementById('field-comp-cust-addr');
                el?.focus();
              }}
              className="flex items-center gap-2 flex-1 cursor-text"
            >
              <span className="font-extrabold text-slate-900 shrink-0 text-sm">ঠিকানাঃ</span>
              <input
                id="field-comp-cust-addr"
                type="text"
                value={invoice.customer.address || ''}
                onChange={(e) =>
                  onUpdateInvoice?.({
                    customer: { ...invoice.customer, address: e.target.value },
                  })
                }
                onFocus={() => onEditField?.('field-cust-address')}
                title="গ্রাহকের ঠিকানা এডিট করুন"
                className="border-b border-dotted border-blue-900 flex-1 text-slate-800 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent outline-none focus:bg-amber-50"
                placeholder="গ্রাহকের ঠিকানা লিখুন..."
              />
            </div>
            <div
              onClick={() => {
                const el = document.getElementById('field-comp-inv-date');
                el?.focus();
              }}
              className="flex items-center gap-2 w-48 sm:w-56 cursor-text"
            >
              <span className="font-extrabold text-slate-900 shrink-0 text-sm">তারিখঃ</span>
              <input
                id="field-comp-inv-date"
                type="text"
                value={invoice.invoiceDate || ''}
                onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
                onFocus={() => onEditField?.('field-inv-date')}
                title="তারিখ এডিট করুন"
                className="border-b border-dotted border-blue-900 flex-1 font-mono font-bold text-slate-900 px-3 py-1.5 min-h-[38px] leading-relaxed text-xs sm:text-sm bg-transparent outline-none text-right focus:bg-amber-50"
              />
            </div>
          </div>
        </div>

        {/* Rounded Top Corner Blue Table */}
        <div className="border-2 border-blue-900 rounded-2xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white text-[11px] sm:text-xs font-bold text-center">
                <th className="py-1 px-1 border-r border-blue-700 w-12">নং</th>
                <th className="py-1 px-3 border-r border-blue-700 text-left">বিবরণ</th>
                <th className="py-1 px-2 border-r border-blue-700 w-20">পরিমাণ</th>
                <th className="py-1 px-2 border-r border-blue-700 w-24 text-right">দর</th>
                <th className="py-1 px-3 w-28 text-right">মোট টাকা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="h-7 hover:bg-blue-50/50 transition">
                  <td className="px-1 text-center font-bold text-blue-950 border-r border-blue-100">
                    {toBengaliNumerals(idx + 1)}
                  </td>
                  <td className="px-2 border-r border-blue-100">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      onFocus={() => onEditField?.(`field-item-name-${item.id}`)}
                      className="w-full font-bold text-slate-900 bg-transparent border-none outline-none focus:bg-amber-50"
                      placeholder="পণ্যের নাম"
                    />
                  </td>
                  <td className="px-1 text-center border-r border-blue-100">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateItem?.(item.id, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      onFocus={() => onEditField?.(`field-item-qty-${item.id}`)}
                      className="w-full text-center font-mono font-bold text-slate-900 bg-transparent border-none outline-none focus:bg-amber-50"
                    />
                  </td>
                  <td className="px-2 text-right border-r border-blue-100">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        onUpdateItem?.(item.id, {
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      onFocus={() => onEditField?.(`field-item-price-${item.id}`)}
                      className="w-full text-right font-mono text-slate-900 bg-transparent border-none outline-none focus:bg-amber-50"
                    />
                  </td>
                  <td className="px-2 text-right font-mono font-bold text-slate-900">
                    {numFormat(item.lineTotal)}
                  </td>
                </tr>
              ))}

              {Array.from({ length: Math.max(0, 8 - invoice.items.length) }).map((_, i) => (
                <tr key={`pad-${i}`} className="h-6">
                  <td className="text-center text-slate-400 font-mono text-[10px] border-r border-blue-100">
                    {toBengaliNumerals(invoice.items.length + i + 1)}
                  </td>
                  <td className="border-r border-blue-100"></td>
                  <td className="border-r border-blue-100"></td>
                  <td className="border-r border-blue-100"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {calc.totalVat > 0 || calc.totalDiscount > 0 ? (
                <>
                  <tr className="border-t-2 border-blue-900 bg-blue-50 font-bold">
                    <td colSpan={3} rowSpan={1 + (calc.totalDiscount > 0 ? 1 : 0) + (calc.totalVat > 0 ? 1 : 0) + 1} className="py-2 px-3 border-r border-blue-200 align-top">
                      <div className="flex items-start gap-1.5 pt-1">
                        <span className="shrink-0 text-slate-700">কথায়ঃ</span>
                        <input
                          type="text"
                          value={invoice.customInWords ?? amountInWords}
                          onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                          onFocus={() => onEditField?.('field-in-words')}
                          className="w-full font-semibold text-slate-800 bg-transparent border-none outline-none text-xs focus:bg-amber-50"
                          placeholder="টাকা কথায়..."
                        />
                      </div>
                    </td>
                    <td className="py-1 px-2 text-center bg-blue-100 text-blue-950 font-bold border-r border-blue-200 text-xs">
                      উপ-মোট
                    </td>
                    <td className="py-1 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                      {currencySymbol} {numFormat(calc.subtotal)}
                    </td>
                  </tr>
                  {calc.totalDiscount > 0 && (
                    <tr className="border-t border-blue-200 bg-rose-50/50 font-bold">
                      <td className="py-1 px-2 text-center bg-rose-100 text-rose-900 border-r border-blue-200 text-xs">
                        ছাড়
                      </td>
                      <td className="py-1 px-3 text-right font-mono font-bold text-rose-700 text-xs">
                        -{currencySymbol} {numFormat(calc.totalDiscount)}
                      </td>
                    </tr>
                  )}
                  {calc.totalVat > 0 && (
                    <tr className="border-t border-blue-200 bg-amber-50 font-bold">
                      <td className="py-1 px-2 text-center bg-amber-200 text-amber-950 border-r border-blue-200 text-xs">
                        ভ্যাট/ট্যাক্স
                      </td>
                      <td className="py-1 px-3 text-right font-mono font-black text-amber-900 text-xs">
                        +{currencySymbol} {numFormat(calc.totalVat)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-blue-900 bg-blue-50 font-bold">
                    <td className="py-1 px-2 text-center bg-blue-900 text-white font-extrabold border-r border-blue-900">
                      সর্বমোট
                    </td>
                    <td className="py-1 px-3 text-right font-mono font-black text-blue-950 text-sm">
                      {currencySymbol} {numFormat(calc.grandTotal)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr className="border-t-2 border-blue-900 bg-blue-50 font-bold">
                  <td colSpan={3} className="py-1 px-3 border-r border-blue-200">
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 text-slate-700">কথায়ঃ</span>
                      <input
                        type="text"
                        value={invoice.customInWords ?? amountInWords}
                        onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                        onFocus={() => onEditField?.('field-in-words')}
                        className="w-full font-semibold text-slate-800 bg-transparent border-none outline-none text-xs focus:bg-amber-50"
                        placeholder="টাকা কথায়..."
                      />
                    </div>
                  </td>
                  <td className="py-1 px-2 text-center bg-blue-900 text-white font-extrabold border-r border-blue-900">
                    মোট
                  </td>
                  <td className="py-1 px-3 text-right font-mono font-black text-blue-950 text-sm">
                    {currencySymbol} {numFormat(calc.grandTotal)}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modern Notice & Signatures */}
      <div className="pt-4 space-y-4">
        <div className="text-[10px] text-slate-600 text-center font-medium bg-blue-50/70 p-1.5 rounded-lg border border-blue-100">
          বিশেষ দ্রষ্টব্যঃ কম্পিউটার কম্পোজ, ছবি তোলা, অনলাইন আবেদন ও প্রিন্ট সেবা যত্নসহকারে করা হয়।
        </div>

        <div className="flex items-end justify-between text-xs font-bold text-slate-800 px-6">
          <div className="text-center">
            <div className="w-28 border-t border-slate-700 mx-auto mb-1" />
            <input
              type="text"
              value={invoice.customerSignatureTitle || 'ক্রেতার স্বাক্ষর'}
              onChange={(e) => onUpdateInvoice?.({ customerSignatureTitle: e.target.value })}
              className="text-center font-bold text-slate-700 bg-transparent border-none outline-none w-28"
            />
          </div>
          <SignatureBlock
            signatureImage={invoice.signatureImage || business.signatureImage}
            signatureTitle={invoice.signatureTitle || 'পরিচালকের স্বাক্ষর'}
            onUpdateTitle={(val) => onUpdateInvoice?.({ signatureTitle: val })}
            onOpenSignatureModal={onOpenSignatureModal}
            lineColor="border-slate-700"
            textColor="text-slate-700"
          />
        </div>
      </div>
    </div>
  );
};
