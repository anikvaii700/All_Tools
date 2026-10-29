import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords, numberToWordsEnglish, toBengaliNumerals } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateMinimal: React.FC<InvoiceTemplateProps> = ({
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
  const isBn = invoice.language === 'bn';
  const currencySymbol = invoice.currency.includes('৳') ? '৳' : invoice.currency.split(' ')[0] || '৳';

  const amountInWords = isBn
    ? cleanBengaliAmountInWords(calc.grandTotal)
    : numberToWordsEnglish(calc.grandTotal, currencySymbol === '৳' ? 'Taka' : 'Currency');

  const numFormat = (num: number) =>
    isBn ? toBengaliNumerals(formatMoney(num, '')) : formatMoney(num, '');

  const custNameRef = useRef<HTMLInputElement>(null);
  const custCompanyRef = useRef<HTMLInputElement>(null);
  const custAddressRef = useRef<HTMLInputElement>(null);
  const custPhoneRef = useRef<HTMLInputElement>(null);
  const invNumberRef = useRef<HTMLInputElement>(null);
  const invDateRef = useRef<HTMLInputElement>(null);
  const invDueDateRef = useRef<HTMLInputElement>(null);
  const bizNameRef = useRef<HTMLInputElement>(null);

  return (
    <div className="invoice-printable-doc bg-white text-black p-8 sm:p-10 font-sans text-xs sm:text-sm min-h-[900px] flex flex-col justify-between border border-black/20 shadow-none print:border-none print:p-6 print:m-0 print:min-h-0 select-none">
      <div>
        {/* Minimal Black & White Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-black">
          <div 
            onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
            className="flex-1 w-full cursor-pointer py-1.5 sm:py-2"
          >
            <input
              ref={bizNameRef}
              type="text"
              value={business.businessName || ''}
              placeholder="COMPANY NAME"
              onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
              className="w-full text-2xl sm:text-3xl font-bold uppercase tracking-tight bg-transparent border-none focus:outline-none focus:bg-slate-50 py-2 sm:py-3 min-h-[48px] sm:min-h-[58px] leading-relaxed print:p-0"
            />
            <input
              type="text"
              value={business.businessAddress || ''}
              placeholder="Address line..."
              onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
              className="w-full text-xs text-black/70 mt-0.5 bg-transparent border-none focus:outline-none focus:bg-slate-50 py-0.5 print:p-0"
            />
            <div className="text-[11px] text-black/70 mt-1 flex flex-wrap gap-x-3">
              <div className="flex items-center gap-1">
                <span>Tel:</span>
                <input
                  type="text"
                  value={business.phone || ''}
                  placeholder="Phone"
                  onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
                  className="font-mono bg-transparent border-b border-black/30 focus:outline-none px-1 w-28 print:border-none print:p-0"
                />
              </div>
              <div className="flex items-center gap-1">
                <span>Email:</span>
                <input
                  type="text"
                  value={business.email || ''}
                  placeholder="Email"
                  onChange={(e) => onUpdateBusiness?.({ email: e.target.value })}
                  className="font-mono bg-transparent border-b border-black/30 focus:outline-none px-1 w-36 print:border-none print:p-0"
                />
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <input
              type="text"
              value={invoice.memoTypeTitle || (isBn ? 'ইনভয়েস' : 'INVOICE')}
              onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
              className="text-xl font-bold uppercase tracking-wider sm:text-right bg-transparent border-none focus:outline-none w-32 print:p-0"
            />
            <div className="text-xs font-mono mt-1 space-y-1">
              <div 
                onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
                className="flex items-center sm:justify-end gap-1 cursor-pointer"
              >
                <strong>NO:</strong>
                <input
                  ref={invNumberRef}
                  type="text"
                  value={invoice.invoiceNumber || ''}
                  placeholder="INV-001"
                  onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
                  className="font-bold sm:text-right bg-transparent border-b border-black/20 focus:outline-none w-28 print:border-none print:p-0"
                />
              </div>
              <div 
                onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
                className="flex items-center sm:justify-end gap-1 cursor-pointer"
              >
                <strong>DATE:</strong>
                <input
                  ref={invDateRef}
                  type="text"
                  value={invoice.invoiceDate || ''}
                  placeholder="Date"
                  onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
                  className="sm:text-right bg-transparent border-b border-black/20 focus:outline-none w-28 print:border-none print:p-0"
                />
              </div>
              <div 
                onClick={() => { invDueDateRef.current?.focus(); onEditField?.('field-inv-due-date'); }}
                className="flex items-center sm:justify-end gap-1 cursor-pointer"
              >
                <strong>DUE:</strong>
                <input
                  ref={invDueDateRef}
                  type="text"
                  value={invoice.dueDate || ''}
                  placeholder="Due Date"
                  onChange={(e) => onUpdateInvoice?.({ dueDate: e.target.value })}
                  className="sm:text-right bg-transparent border-b border-black/20 focus:outline-none w-28 print:border-none print:p-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Client & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-black/20">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest block mb-1">
              {isBn ? 'গ্রাহক তথ্য:' : 'BILLED TO:'}
            </span>
            <div 
              onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="font-bold text-sm">{isBn ? 'নামঃ' : 'Name:'}</span>
              <input
                ref={custNameRef}
                type="text"
                value={invoice.customer.name || ''}
                placeholder="Customer Name"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
                className="font-bold text-xs sm:text-sm flex-1 bg-transparent border-b border-black/30 focus:outline-none px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed print:border-none print:p-0"
              />
            </div>
            <div 
              onClick={() => { custCompanyRef.current?.focus(); onEditField?.('field-cust-company'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-xs text-black/60 shrink-0">{isBn ? 'প্রতিষ্ঠানঃ' : 'Company:'}</span>
              <input
                ref={custCompanyRef}
                type="text"
                value={invoice.customer.companyName || ''}
                placeholder="Company Name"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, companyName: e.target.value } })}
                className="text-xs sm:text-sm flex-1 bg-transparent border-b border-black/20 focus:outline-none px-3 py-1.5 min-h-[38px] leading-relaxed print:border-none print:p-0"
              />
            </div>
            <div 
              onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-xs text-black/60 shrink-0">{isBn ? 'ঠিকানাঃ' : 'Address:'}</span>
              <input
                ref={custAddressRef}
                type="text"
                value={invoice.customer.address || ''}
                placeholder="Address"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
                className="text-xs sm:text-sm flex-1 bg-transparent border-b border-black/20 focus:outline-none px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed print:border-none print:p-0"
              />
            </div>
            <div 
              onClick={() => { custPhoneRef.current?.focus(); onEditField?.('field-cust-phone'); }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-xs text-black/60 shrink-0">{isBn ? 'মোবাইলঃ' : 'Phone:'}</span>
              <input
                ref={custPhoneRef}
                type="text"
                value={invoice.customer.phone || ''}
                placeholder="01xxxxxxxxx"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, phone: e.target.value } })}
                className="font-mono text-xs sm:text-sm flex-1 bg-transparent border-b border-black/20 focus:outline-none px-3 py-1.5 min-h-[38px] leading-relaxed print:border-none print:p-0"
              />
            </div>
          </div>
        </div>

        {/* Minimal Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-[11px] font-bold uppercase tracking-wider">
                <th className="py-2 px-2 w-10">#</th>
                <th className="py-2 px-3">{isBn ? 'বিবরণ' : 'DESCRIPTION'}</th>
                <th className="py-2 px-2 w-20 text-center">{isBn ? 'পরিমাণ' : 'QTY'}</th>
                <th className="py-2 px-3 w-24 text-right">{isBn ? 'দর' : 'UNIT PRICE'}</th>
                <th className="py-2 px-3 w-28 text-right">{isBn ? 'মোট' : 'TOTAL'}</th>
                <th className="py-2 px-1 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-mono text-black/50">{idx + 1}</td>
                  <td className="py-1 px-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      placeholder="Item name"
                      className="w-full font-bold bg-transparent border-none focus:outline-none focus:bg-slate-50 px-1 py-0.5 print:p-0"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => onUpdateItem?.(item.id, { description: e.target.value })}
                      placeholder="Description..."
                      className="w-full text-[11px] text-black/50 bg-transparent border-none focus:outline-none focus:bg-slate-50 px-1 py-0.5 print:p-0 print:placeholder-transparent"
                    />
                  </td>
                  <td className="py-1 px-2 text-center">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem?.(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono font-bold bg-transparent border-none outline-none focus:outline-none focus:bg-slate-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-right">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem?.(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-right font-mono bg-transparent border-none outline-none focus:outline-none focus:bg-slate-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold">
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

              <tr className="print:hidden bg-slate-50">
                <td colSpan={6} className="py-1.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-black hover:underline"
                  >
                    ➕ {isBn ? 'আইটেম যোগ করুন' : 'Add Item'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Minimal Calculations */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 space-y-2">
            <div className="border border-black/20 p-2.5 text-xs">
              <span className="font-bold">{isBn ? 'কথায়ঃ ' : 'IN WORDS: '}</span>
              <input
                type="text"
                value={invoice.customInWords !== undefined ? invoice.customInWords : amountInWords}
                onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                placeholder={amountInWords}
                className="w-full font-bold mt-1 bg-transparent border-b border-black/30 focus:outline-none px-1 py-0.5 print:border-none print:p-0"
              />
            </div>
            <div className="border border-black/20 p-2 text-xs">
              <span className="font-bold">{isBn ? 'নোটঃ ' : 'NOTES: '}</span>
              <input
                type="text"
                value={invoice.notes || ''}
                placeholder="Notes..."
                onChange={(e) => onUpdateInvoice?.({ notes: e.target.value })}
                className="w-full bg-transparent border-none focus:outline-none text-black/70 px-1 py-0.5 print:p-0 print:placeholder-transparent"
              />
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="border border-black p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>{isBn ? 'উপ-মোটঃ' : 'SUBTOTAL:'}</span>
                <span className="font-mono font-bold">{currencySymbol} {numFormat(calc.subtotal)}</span>
              </div>
              {calc.totalDiscount > 0 && (
                <div className="flex justify-between">
                  <span>{isBn ? 'ছাড়ঃ' : 'DISCOUNT:'}</span>
                  <span className="font-mono">-{currencySymbol} {numFormat(calc.totalDiscount)}</span>
                </div>
              )}
              {calc.totalVat > 0 && (
                <div className="flex justify-between font-bold">
                  <span>{isBn ? 'ভ্যাট / ট্যাক্সঃ' : 'VAT / TAX:'}</span>
                  <span className="font-mono">+{currencySymbol} {numFormat(calc.totalVat)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-black flex justify-between font-black text-sm">
                <span>{isBn ? 'সর্বমোট বিলঃ' : 'TOTAL:'}</span>
                <span>{currencySymbol} {numFormat(calc.grandTotal)}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span>{isBn ? 'জমাঃ' : 'PAID:'}</span>
                <div className="flex items-center justify-end">
                  <span className="mr-1">{currencySymbol}</span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={invoice.paidAmount ?? 0}
                    onChange={(e) => onUpdateInvoice?.({ paidAmount: parseFloat(e.target.value) || 0 })}
                    className="w-20 text-right font-mono font-bold bg-transparent border-none focus:outline-none print:border-none print:p-0"
                  />
                </div>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
                <span>{isBn ? 'বাকীঃ' : 'DUE:'}</span>
                <span>{currencySymbol} {numFormat(calc.dueAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="pt-8 border-t border-black/20 flex items-end justify-between text-xs font-bold text-black">
        <div className="text-center">
          <div className="w-36 border-t border-black mx-auto mb-1" />
          <input
            type="text"
            value={invoice.customerSignatureTitle || (isBn ? 'গ্রাহকের স্বাক্ষর' : 'Client Signature')}
            onChange={(e) => onUpdateInvoice?.({ customerSignatureTitle: e.target.value })}
            className="text-center font-bold bg-transparent border-none focus:outline-none print:p-0"
          />
        </div>
        <SignatureBlock
          signatureImage={invoice.signatureImage || business.signatureImage}
          signatureTitle={business.signatureTitle || invoice.signatureTitle || (isBn ? 'অনুমোদিত স্বাক্ষর' : 'Authorized Signature')}
          onUpdateTitle={(val) => {
            onUpdateBusiness?.({ signatureTitle: val });
            onUpdateInvoice?.({ signatureTitle: val });
          }}
          onOpenSignatureModal={onOpenSignatureModal}
          lineColor="border-black"
          textColor="text-black"
        />
      </div>
    </div>
  );
};
