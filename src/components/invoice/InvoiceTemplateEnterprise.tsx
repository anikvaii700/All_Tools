import React, { useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, numberToWordsBengali, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateEnterprise: React.FC<InvoiceTemplateProps> = ({
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper for inline inputs with seamless styling
  const inlineInputClass =
    'bg-transparent border-b border-dashed border-transparent hover:border-slate-400 focus:border-emerald-600 focus:bg-white/90 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1 transition-all print:border-none print:bg-transparent print:ring-0 print:p-0';

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateBusiness) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateBusiness({ logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#fffdf0] text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border-2 border-slate-400 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-text">
      {/* Hidden file input for logo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoChange}
        accept="image/*"
        className="hidden"
      />

      <div>
        {/* Top Religious & Contact Info */}
        <div className="flex items-center justify-between text-xs text-slate-800 pb-1">
          <div className="flex items-center gap-2">
            {/* Laurel Logo Badge */}
            <div
              onClick={() => {
                fileInputRef.current?.click();
                onEditField?.('field-biz-name');
              }}
              title="লোগো পরিবর্তন করতে ক্লিক করুন"
              className="w-10 h-10 rounded-full border-2 border-emerald-600 flex items-center justify-center font-black text-rose-700 text-xs bg-amber-50 cursor-pointer shadow-2xs hover:scale-105 transition-transform shrink-0"
            >
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt="Logo"
                  className="w-8 h-8 object-contain rounded-full"
                />
              ) : (
                <span>
                  {business.businessName ? business.businessName.slice(0, 2).toUpperCase() : 'SE'}
                </span>
              )}
            </div>

            <div>
              <input
                type="text"
                value={business.religiousHeader ?? 'বিসমিল্লাহির রাহমানির রাহিম'}
                onChange={(e) => onUpdateBusiness?.({ religiousHeader: e.target.value })}
                onFocus={() => onEditField?.('field-biz-religious')}
                title="ধর্মীয় বাণী পরিবর্তন করতে ক্লিক করুন"
                className={`font-semibold text-[11px] block text-slate-600 w-44 sm:w-56 ${inlineInputClass}`}
                placeholder="বিসমিল্লাহির রাহমানির রাহিম"
              />
              <div className="inline-block mt-0.5">
                <input
                  type="text"
                  value={business.memoTypeTitle ?? 'ক্যাশ মেমো'}
                  onChange={(e) => onUpdateBusiness?.({ memoTypeTitle: e.target.value })}
                  onFocus={() => onEditField?.('field-inv-section-1')}
                  title="মেমোর ধরণ (যেমন: ক্যাশ মেমো, চালান, বিল) পরিবর্তন করতে ক্লিক করুন"
                  className="bg-blue-900 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full inline-block text-center w-24 border-none outline-none focus:ring-1 focus:ring-white"
                  placeholder="ক্যাশ মেমো"
                />
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono font-bold text-slate-800 space-y-0.5">
            <div className="flex items-center justify-end gap-1">
              <span className="shrink-0 text-slate-700 font-sans">মোবা :</span>
              <input
                type="text"
                value={business.phone ?? '০১৭৪৩২২৪৭০০'}
                onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
                onFocus={() => onEditField?.('field-biz-phone')}
                title="মোবাইল নম্বর এডিট করুন"
                className={`text-right font-mono font-bold w-28 sm:w-36 ${inlineInputClass}`}
                placeholder="০১৭১১-০০০০০০"
              />
            </div>
            <div className="flex items-center justify-end">
              <input
                type="text"
                value={business.email ?? 'contact@mosafa.com'}
                onChange={(e) => onUpdateBusiness?.({ email: e.target.value })}
                onFocus={() => onEditField?.('field-biz-email')}
                title="ইমেইল এড্রেস এডিট করুন"
                className={`text-right text-[10px] text-slate-600 font-normal w-36 sm:w-48 ${inlineInputClass}`}
                placeholder="ইমেইল এড্রেস"
              />
            </div>
          </div>
        </div>

        {/* Business Title, Subtitle, Tagline & Address */}
        <div className="text-center py-3 sm:py-4 my-1">
          <input
            type="text"
            value={business.businessName ?? 'The MoSaFa ডিজিটাল আইটি সল্যুশন'}
            onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
            onFocus={() => onEditField?.('field-biz-name')}
            title="প্রতিষ্ঠানের নাম এডিট করুন"
            className={`w-full text-center text-2xl sm:text-3xl md:text-4xl font-black text-emerald-800 tracking-tight py-2.5 sm:py-3.5 min-h-[52px] sm:min-h-[64px] leading-relaxed ${inlineInputClass}`}
            placeholder="প্রতিষ্ঠানের নাম"
          />

          <input
            type="text"
            value={business.subtitle ?? 'M/S SIAM ENTERPRISES'}
            onChange={(e) => onUpdateBusiness?.({ subtitle: e.target.value })}
            onFocus={() => onEditField?.('field-biz-subtitle')}
            title="সাবটাইটেল / ইংরেজি নাম এডিট করুন"
            className={`w-full text-center text-xs sm:text-sm font-extrabold text-slate-700 tracking-wider mt-0.5 ${inlineInputClass}`}
            placeholder="সাবটাইটেল বা ট্রেডিং নাম"
          />

          <input
            type="text"
            value={
              business.tagline ??
              'এখানে যাবতীয় জি.আই পাইপ, এস.এস পাইপ, বাথরুম ফিটিংস, সেনেটারী ফিটিংস, প্লাস্টিক ফিটিংস পাইকারী ও খুচরা বিক্রয় করা হয়।'
            }
            onChange={(e) => onUpdateBusiness?.({ tagline: e.target.value })}
            onFocus={() => onEditField?.('field-biz-tagline')}
            title="পণ্যের বিবরণ / স্লোগান এডিট করুন"
            className={`w-full text-center text-[10px] sm:text-[11px] text-slate-600 mt-0.5 ${inlineInputClass}`}
            placeholder="পণ্যের বিবরণ বা স্লোগান"
          />

          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="text-[11px] shrink-0">📍</span>
            <input
              type="text"
              value={business.businessAddress ?? 'হাউজ #১২, রোড #৪, ধানমন্ডি, ঢাকা-১২০৯, বাংলাদেশ'}
              onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
              onFocus={() => onEditField?.('field-biz-address')}
              title="প্রতিষ্ঠানের ঠিকানা এডিট করুন"
              className={`w-full max-w-xl text-center text-[11px] font-bold text-slate-800 ${inlineInputClass}`}
              placeholder="ঠিকানা"
            />
          </div>
        </div>

        {/* Customer Info Bars with Red & Blue Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 my-2 text-xs">
          {/* Memo No */}
          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span
              onClick={() => {
                const el = document.getElementById('field-enterprise-inv-num');
                el?.focus();
              }}
              className="bg-blue-900 text-white font-bold px-3 py-1 rounded text-[11px] shrink-0 cursor-pointer hover:bg-blue-800 transition select-none"
            >
              নং-
            </span>
            <div
              onClick={() => {
                const el = document.getElementById('field-enterprise-inv-num');
                el?.focus();
              }}
              className="flex-1 border border-slate-400 bg-white px-2 py-1 cursor-text flex items-center hover:border-slate-600 transition"
            >
              <input
                id="field-enterprise-inv-num"
                type="text"
                value={invoice.invoiceNumber || ''}
                onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
                onFocus={() => onEditField?.('field-inv-number')}
                title="মেমো / ইনভয়েস নম্বর এডিট করুন"
                className="w-full font-mono font-bold text-slate-900 bg-transparent border-none outline-none p-0 text-xs"
                placeholder="MSF-INV-0001"
              />
            </div>
          </div>

          {/* Date */}
          <div className="sm:col-span-6 flex items-center gap-1.5">
            <span
              onClick={() => {
                const el = document.getElementById('field-enterprise-inv-date');
                el?.focus();
              }}
              className="bg-blue-900 text-white font-bold px-3 py-1 rounded text-[11px] shrink-0 cursor-pointer hover:bg-blue-800 transition select-none"
            >
              তারিখঃ
            </span>
            <div
              onClick={() => {
                const el = document.getElementById('field-enterprise-inv-date');
                el?.focus();
              }}
              className="flex-1 border border-slate-400 bg-white px-2 py-1 cursor-text flex items-center hover:border-slate-600 transition"
            >
              <input
                id="field-enterprise-inv-date"
                type="text"
                value={invoice.invoiceDate || ''}
                onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
                onFocus={() => onEditField?.('field-inv-date')}
                title="তারিখ এডিট করুন"
                className="w-full font-mono font-bold text-slate-900 bg-transparent border-none outline-none p-0 text-xs"
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* Customer Name */}
          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span
              onClick={() => {
                const el = document.getElementById('field-enterprise-cust-name');
                el?.focus();
              }}
              className="bg-blue-900 text-white font-extrabold px-3.5 py-2 rounded text-xs shrink-0 cursor-pointer hover:bg-blue-800 transition select-none"
            >
              নামঃ
            </span>
            <div
              onClick={() => {
                const el = document.getElementById('field-enterprise-cust-name');
                el?.focus();
              }}
              className="flex-1 border border-slate-400 bg-white px-3 py-1.5 cursor-text flex items-center hover:border-blue-900 transition min-h-[38px] sm:min-h-[42px] rounded-sm"
            >
              <input
                id="field-enterprise-cust-name"
                type="text"
                value={invoice.customer.name || ''}
                onChange={(e) =>
                  onUpdateInvoice?.({
                    customer: { ...invoice.customer, name: e.target.value },
                  })
                }
                onFocus={() => onEditField?.('field-cust-name')}
                title="গ্রাহকের নাম এডিট করুন"
                className="w-full font-bold text-slate-900 bg-transparent border-none outline-none p-0 text-xs sm:text-sm leading-relaxed"
                placeholder="খরিদ্দারের নাম লিখুন..."
              />
            </div>
          </div>

          {/* Customer Address */}
          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span
              onClick={() => {
                const el = document.getElementById('field-enterprise-cust-addr');
                el?.focus();
              }}
              className="bg-red-700 text-white font-extrabold px-3 py-2 rounded text-xs shrink-0 cursor-pointer hover:bg-red-800 transition select-none"
            >
              ঠিকানাঃ
            </span>
            <div
              onClick={() => {
                const el = document.getElementById('field-enterprise-cust-addr');
                el?.focus();
              }}
              className="flex-1 border border-red-500 bg-white px-3 py-1.5 cursor-text flex items-center hover:border-red-700 transition min-h-[38px] sm:min-h-[42px] rounded-sm"
            >
              <input
                id="field-enterprise-cust-addr"
                type="text"
                value={invoice.customer.address || ''}
                onChange={(e) =>
                  onUpdateInvoice?.({
                    customer: { ...invoice.customer, address: e.target.value },
                  })
                }
                onFocus={() => onEditField?.('field-cust-address')}
                title="গ্রাহকের ঠিকানা এডিট করুন"
                className="w-full font-medium text-slate-800 bg-transparent border-none outline-none p-0 text-xs sm:text-sm leading-relaxed"
                placeholder="ঠিকানা (যেমন: ঢাকা, বাংলাদেশ)"
              />
            </div>
          </div>

          {/* Customer Mobile */}
          <div className="sm:col-span-12 flex items-center gap-1.5">
            <span
              onClick={() => {
                const el = document.getElementById('field-enterprise-cust-phone');
                el?.focus();
              }}
              className="bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded text-[11px] shrink-0 cursor-pointer hover:bg-emerald-800 transition select-none"
            >
              মোবাইলঃ
            </span>
            <div
              onClick={() => {
                const el = document.getElementById('field-enterprise-cust-phone');
                el?.focus();
              }}
              className="flex-1 border border-emerald-500 bg-white px-2.5 py-1 cursor-text flex items-center hover:border-emerald-700 transition"
            >
              <input
                id="field-enterprise-cust-phone"
                type="text"
                value={invoice.customer.phone || ''}
                onChange={(e) =>
                  onUpdateInvoice?.({
                    customer: { ...invoice.customer, phone: e.target.value },
                  })
                }
                onFocus={() => onEditField?.('field-cust-phone')}
                title="গ্রাহকের মোবাইল নম্বর এডিট করুন"
                className="w-full font-mono font-bold text-slate-900 bg-transparent border-none outline-none p-0 text-xs"
                placeholder="০১৭০০-০০০০০০"
              />
            </div>
          </div>
        </div>

        {/* Traditional Orange-Gold Ledger Table */}
        <div className="border border-slate-500 bg-white mt-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e67e22] text-white text-[11px] sm:text-xs font-black text-center">
                <th className="py-1 px-1 border-r border-amber-600 w-12">সংখ্যা</th>
                <th className="py-1 px-3 border-r border-amber-600 text-left">মালের বিবরণ</th>
                <th className="py-1 px-2 border-r border-amber-600 w-20">পরিমান</th>
                <th className="py-1 px-2 border-r border-amber-600 w-24 text-right">দর</th>
                <th className="py-1 px-3 w-28 text-right">টাকা</th>
                <th className="w-8 border-l border-amber-600 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="h-7 hover:bg-amber-50/50 transition group">
                  {/* Serial */}
                  <td className="px-1 text-center font-bold text-slate-700 border-r border-slate-300">
                    {toBengaliNumerals(idx + 1)}
                  </td>

                  {/* Description / Item Name */}
                  <td className="px-2 border-r border-slate-300">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      onFocus={() => onEditField?.(`field-item-name-${item.id}`)}
                      title="আইটেমের নাম এডিট করুন"
                      className="w-full font-bold text-slate-900 bg-transparent border-none outline-none p-0 text-xs focus:bg-amber-50"
                      placeholder="মালের বিবরণ"
                    />
                  </td>

                  {/* Quantity */}
                  <td className="px-1 text-center border-r border-slate-300">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdateItem?.(item.id, {
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                      onFocus={() => onEditField?.(`field-item-qty-${item.id}`)}
                      title="পরিমাণ এডিট করুন"
                      className="w-full text-center font-mono font-bold text-slate-900 bg-transparent border-none outline-none p-0 text-xs focus:bg-amber-50"
                    />
                  </td>

                  {/* Unit Price (দর) */}
                  <td className="px-2 text-right border-r border-slate-300">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) =>
                        onUpdateItem?.(item.id, {
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      onFocus={() => onEditField?.(`field-item-price-${item.id}`)}
                      title="প্রতিটির দর এডিট করুন"
                      className="w-full text-right font-mono text-slate-900 bg-transparent border-none outline-none p-0 text-xs focus:bg-amber-50"
                    />
                  </td>

                  {/* Line Total */}
                  <td className="px-2 text-right font-mono font-bold text-slate-900">
                    {numFormat(item.lineTotal)}
                  </td>

                  {/* Delete Item (Hidden in Print) */}
                  <td className="text-center print:hidden border-l border-slate-200">
                    {invoice.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem?.(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                        title="এই সারিটি মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5 mx-auto" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {/* Pad rows up to 10 rows for full ledger sheet look */}
              {Array.from({ length: Math.max(0, 10 - invoice.items.length) }).map((_, i) => (
                <tr key={`pad-${i}`} className="h-6">
                  <td className="text-center text-slate-400 font-mono text-[10px] border-r border-slate-300">
                    {toBengaliNumerals(invoice.items.length + i + 1)}
                  </td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td></td>
                  <td className="print:hidden border-l border-slate-200"></td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              {calc.totalVat > 0 || calc.totalDiscount > 0 ? (
                <>
                  <tr className="border-t-2 border-slate-700 bg-slate-50">
                    <td colSpan={3} rowSpan={1 + (calc.totalDiscount > 0 ? 1 : 0) + (calc.totalVat > 0 ? 1 : 0) + 1} className="py-2 px-3 border-r border-slate-300 font-bold text-xs align-top">
                      <div className="flex items-start gap-1.5 pt-1">
                        <span className="shrink-0 text-slate-800">টাকা কথায়ঃ</span>
                        <input
                          type="text"
                          value={invoice.customInWords ?? amountInWords}
                          onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                          onFocus={() => onEditField?.('field-in-words')}
                          title="কথায় টাকা এডিট করুন"
                          className="w-full font-semibold text-slate-900 bg-transparent border-none outline-none p-0 text-xs focus:bg-amber-50"
                          placeholder="টাকা কথায়..."
                        />
                      </div>
                    </td>
                    <td className="py-1 px-2 text-center font-bold bg-amber-100 text-slate-900 border-r border-slate-300 text-xs">
                      উপ-মোট
                    </td>
                    <td className="py-1 px-3 text-right font-mono font-bold text-slate-900 text-xs bg-white">
                      {currencySymbol} {numFormat(calc.subtotal)}
                    </td>
                    <td className="print:hidden border-l border-slate-200"></td>
                  </tr>
                  {calc.totalDiscount > 0 && (
                    <tr className="border-t border-slate-200 bg-rose-50/50">
                      <td className="py-1 px-2 text-center font-bold bg-rose-100 text-rose-900 border-r border-slate-300 text-xs">
                        ছাড়-
                      </td>
                      <td className="py-1 px-3 text-right font-mono font-bold text-rose-700 text-xs bg-white">
                        -{currencySymbol} {numFormat(calc.totalDiscount)}
                      </td>
                      <td className="print:hidden border-l border-slate-200"></td>
                    </tr>
                  )}
                  {calc.totalVat > 0 && (
                    <tr className="border-t border-slate-200 bg-amber-50">
                      <td className="py-1 px-2 text-center font-bold bg-amber-200 text-amber-950 border-r border-slate-300 text-xs">
                        ভ্যাট/ট্যাক্স
                      </td>
                      <td className="py-1 px-3 text-right font-mono font-black text-amber-900 text-xs bg-white">
                        +{currencySymbol} {numFormat(calc.totalVat)}
                      </td>
                      <td className="print:hidden border-l border-slate-200"></td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-slate-700 bg-slate-50">
                    <td className="py-1 px-2 text-center font-black bg-red-600 text-white border-r border-slate-300">
                      সর্বমোট-
                    </td>
                    <td className="py-1 px-3 text-right font-mono font-black text-slate-900 text-xs sm:text-sm bg-white">
                      {currencySymbol} {numFormat(calc.grandTotal)}
                    </td>
                    <td className="print:hidden border-l border-slate-200"></td>
                  </tr>
                </>
              ) : (
                <tr className="border-t-2 border-slate-700 bg-slate-50">
                  <td colSpan={3} className="py-1 px-3 border-r border-slate-300 font-bold text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 text-slate-800">টাকা কথায়ঃ</span>
                      <input
                        type="text"
                        value={invoice.customInWords ?? amountInWords}
                        onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                        onFocus={() => onEditField?.('field-in-words')}
                        title="কথায় টাকা এডিট করুন"
                        className="w-full font-semibold text-slate-900 bg-transparent border-none outline-none p-0 text-xs focus:bg-amber-50"
                        placeholder="টাকা কথায়..."
                      />
                    </div>
                  </td>
                  <td className="py-1 px-2 text-center font-black bg-red-600 text-white border-r border-slate-300">
                    মোট-
                  </td>
                  <td className="py-1 px-3 text-right font-mono font-black text-slate-900 text-xs sm:text-sm bg-white">
                    {currencySymbol} {numFormat(calc.grandTotal)}
                  </td>
                  <td className="print:hidden border-l border-slate-200"></td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>

        {/* Quick Add Row Button right on the memo (Hidden in print) */}
        <div className="mt-2 flex justify-start print:hidden">
          <button
            type="button"
            onClick={onAddItem}
            className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer border border-amber-300 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-amber-800" />
            <span>+ নতুন মালের বিবরণ / সারি যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Dealer Brand Logos and Signatures */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-slate-600 border-t border-b border-slate-300 py-1">
          <span className="shrink-0">ডিলারঃ</span>
          <input
            type="text"
            value={business.dealerText ?? 'RFL • polymer • ANWAR'}
            onChange={(e) => onUpdateBusiness?.({ dealerText: e.target.value })}
            onFocus={() => onEditField?.('field-biz-tagline')}
            title="ডিলার বা ব্র্যান্ডের নামসমূহ এডিট করুন"
            className="text-center font-bold text-slate-700 bg-transparent border-none outline-none p-0 text-[10px] w-64 focus:bg-amber-50"
            placeholder="ডিলার ও ব্র্যান্ড নাম"
          />
        </div>

        <div className="flex items-end justify-between text-xs font-bold text-slate-800 px-2">
          {/* Customer Signature */}
          <div className="text-center">
            <div className="w-32 border-t border-slate-800 mx-auto mb-1" />
            <input
              type="text"
              value={invoice.customerSignatureTitle ?? 'ক্রেতার স্বাক্ষর'}
              onChange={(e) => onUpdateInvoice?.({ customerSignatureTitle: e.target.value })}
              onFocus={() => onEditField?.('field-inv-terms')}
              title="স্বাক্ষরের টাইটেল এডিট করুন"
              className="text-center font-bold text-slate-800 bg-transparent border-none outline-none p-0 text-xs w-28"
            />
          </div>

          {/* Seller / Authorized Signature with Digital Canvas Pad */}
          <SignatureBlock
            signatureTitle={invoice.signatureTitle || business.signatureTitle || 'বিক্রেতার স্বাক্ষর'}
            onChangeTitle={(title) => {
              onUpdateInvoice?.({ signatureTitle: title });
              onUpdateBusiness?.({ signatureTitle: title });
            }}
            signatureImage={business.signatureImage || invoice.signatureImage}
            onOpenSignatureModal={onOpenSignatureModal}
            defaultTitle="বিক্রেতার স্বাক্ষর"
          />
        </div>
      </div>
    </div>
  );
};
