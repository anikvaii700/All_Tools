import React, { useRef } from 'react';
import { InvoiceTemplateProps } from './types';
import { formatMoney } from './calculator';
import { cleanBengaliAmountInWords } from './numberToWords';
import { SignatureBlock } from './SignatureBlock';

export const InvoiceTemplateComputerPoint: React.FC<InvoiceTemplateProps> = ({
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
  const currencySymbol = 'Tk.';
  const amountInWords = cleanBengaliAmountInWords(calc.grandTotal);
  const numFormat = (num: number) => formatMoney(num, '');

  const custNameRef = useRef<HTMLInputElement>(null);
  const custAddressRef = useRef<HTMLInputElement>(null);
  const custPhoneRef = useRef<HTMLInputElement>(null);
  const invNumberRef = useRef<HTMLInputElement>(null);
  const invDateRef = useRef<HTMLInputElement>(null);
  const bizNameRef = useRef<HTMLInputElement>(null);

  return (
    <div className="invoice-printable-doc bg-white text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border border-slate-300 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
      {/* Top Geometric Color Bars */}
      <div className="absolute top-0 left-0 right-0 flex h-3">
        <div className="w-1/5 bg-slate-900" />
        <div className="w-1/5 bg-red-600" />
        <div className="w-1/5 bg-slate-500" />
        <div className="w-1/5 bg-orange-500" />
        <div className="w-1/5 bg-rose-200" />
      </div>

      <div className="pt-4">
        {/* Header Grid: Logo & Title on Left, Services Box on Right */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-3 border-b border-slate-200">
          <div className="flex items-start gap-3 flex-1 w-full">
            {/* Logo */}
            <div className="w-14 h-14 border-2 border-red-600 flex flex-col items-center justify-center font-black text-slate-900 shrink-0">
              <span className="text-xl text-red-600">CP</span>
              <span className="text-[8px] font-bold">POINT</span>
            </div>

            <div 
              onClick={() => { bizNameRef.current?.focus(); onEditField?.('field-biz-name'); }}
              className="flex-1 cursor-pointer py-2 sm:py-3 my-1"
            >
              <input
                ref={bizNameRef}
                type="text"
                value={business.businessName || ''}
                placeholder="Computer Point"
                onChange={(e) => onUpdateBusiness?.({ businessName: e.target.value })}
                className="w-full text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight bg-transparent border-none focus:outline-none focus:bg-slate-50 rounded py-2 sm:py-3 min-h-[48px] sm:min-h-[58px] leading-relaxed print:p-0"
              />
              <input
                type="text"
                value={business.businessAddress || ''}
                placeholder="Jowel Mini Plaza (1st Floor), College Road, Kapasia, Gazipur."
                onChange={(e) => onUpdateBusiness?.({ businessAddress: e.target.value })}
                className="w-full text-xs text-slate-600 mt-0.5 bg-transparent border-none focus:outline-none focus:bg-slate-50 rounded py-0.5 print:p-0"
              />
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-700 mt-1 font-mono">
                <div className="flex items-center gap-1">
                  <span>Mobile:</span>
                  <input
                    type="text"
                    value={business.phone || ''}
                    placeholder="01712-345678"
                    onChange={(e) => onUpdateBusiness?.({ phone: e.target.value })}
                    className="font-mono bg-transparent border-b border-slate-300 focus:outline-none px-1 py-0.5 print:border-none print:p-0"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span>Email:</span>
                  <input
                    type="text"
                    value={business.email || ''}
                    placeholder="info@computerpoint.com"
                    onChange={(e) => onUpdateBusiness?.({ email: e.target.value })}
                    className="font-mono bg-transparent border-b border-slate-300 focus:outline-none px-1 py-0.5 print:border-none print:p-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Services Bullet Box */}
          <div className="border border-slate-400 rounded-xl p-2 text-[10px] text-slate-700 bg-slate-50 shrink-0 w-36 shadow-2xs">
            <div className="flex items-center gap-1.5"><span className="text-red-600">✓</span> Systems</div>
            <div className="flex items-center gap-1.5"><span className="text-red-600">✓</span> Solutions</div>
            <div className="flex items-center gap-1.5"><span className="text-red-600">✓</span> Accessories</div>
            <div className="flex items-center gap-1.5"><span className="text-red-600">✓</span> Servicing</div>
            <div className="flex items-center gap-1.5"><span className="text-red-600">✓</span> Training</div>
          </div>
        </div>

        {/* Red Centered "B i l l" Tag */}
        <div className="text-center my-2">
          <input
            type="text"
            value={invoice.memoTypeTitle || 'B i l l'}
            onChange={(e) => onUpdateInvoice?.({ memoTypeTitle: e.target.value })}
            className="bg-red-600 text-white font-black text-xs px-6 py-0.5 rounded shadow-xs tracking-widest uppercase text-center focus:outline-none print:border-none"
          />
        </div>

        {/* Client & Date Info */}
        <div className="my-3 space-y-1 text-xs text-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div 
              onClick={() => { invNumberRef.current?.focus(); onEditField?.('field-inv-number'); }}
              className="flex items-center gap-2 flex-1 cursor-pointer"
            >
              <span className="font-bold text-slate-900 shrink-0">No.</span>
              <input
                ref={invNumberRef}
                type="text"
                value={invoice.invoiceNumber || ''}
                placeholder="INV-001"
                onChange={(e) => onUpdateInvoice?.({ invoiceNumber: e.target.value })}
                className="border-b border-dotted border-slate-600 flex-1 font-mono font-bold text-slate-900 px-2 bg-transparent focus:outline-none focus:bg-slate-50 print:p-0"
              />
            </div>
            <div 
              onClick={() => { invDateRef.current?.focus(); onEditField?.('field-inv-date'); }}
              className="flex items-center gap-2 w-48 sm:w-60 cursor-pointer"
            >
              <span className="font-bold text-slate-900 shrink-0">Date:</span>
              <input
                ref={invDateRef}
                type="text"
                value={invoice.invoiceDate || ''}
                placeholder="2026-10-28"
                onChange={(e) => onUpdateInvoice?.({ invoiceDate: e.target.value })}
                className="border-b border-dotted border-slate-600 flex-1 font-mono font-bold text-slate-900 px-2 bg-transparent focus:outline-none focus:bg-slate-50 print:p-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div 
              onClick={() => { custNameRef.current?.focus(); onEditField?.('field-cust-name'); }}
              className="flex items-center gap-2 flex-1 cursor-pointer"
            >
              <span className="font-bold text-slate-900 shrink-0 text-sm">Name:</span>
              <input
                ref={custNameRef}
                type="text"
                value={invoice.customer.name || ''}
                placeholder="Customer Name"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, name: e.target.value } })}
                className="border-b border-dotted border-slate-600 flex-1 font-bold text-slate-900 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-slate-50 print:p-0"
              />
            </div>
            <div 
              onClick={() => { custPhoneRef.current?.focus(); onEditField?.('field-cust-phone'); }}
              className="flex items-center gap-2 w-48 sm:w-60 cursor-pointer"
            >
              <span className="font-bold text-slate-900 shrink-0 text-sm">Cell:</span>
              <input
                ref={custPhoneRef}
                type="text"
                value={invoice.customer.phone || ''}
                placeholder="01xxxxxxxxx"
                onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, phone: e.target.value } })}
                className="border-b border-dotted border-slate-600 flex-1 font-mono font-bold text-slate-900 px-3 py-1.5 min-h-[38px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-slate-50 print:p-0"
              />
            </div>
          </div>

          <div 
            onClick={() => { custAddressRef.current?.focus(); onEditField?.('field-cust-address'); }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="font-bold text-slate-900 shrink-0 text-sm">Address:</span>
            <input
              ref={custAddressRef}
              type="text"
              value={invoice.customer.address || ''}
              placeholder="Customer Address"
              onChange={(e) => onUpdateInvoice?.({ customer: { ...invoice.customer, address: e.target.value } })}
              className="border-b border-dotted border-slate-600 flex-1 font-medium text-slate-800 px-3 py-1.5 sm:py-2 min-h-[38px] sm:min-h-[42px] leading-relaxed text-xs sm:text-sm bg-transparent focus:outline-none focus:bg-slate-50 print:p-0"
            />
          </div>
        </div>

        {/* Clean Line Table */}
        <div className="border border-slate-400 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-900 text-xs font-bold border-b border-slate-400">
                <th className="py-2 px-2 border-r border-slate-400 w-12 text-center">SL.</th>
                <th className="py-2 px-4 border-r border-slate-400">Item Description</th>
                <th className="py-2 px-3 border-r border-slate-400 w-24 text-center">Qty.</th>
                <th className="py-2 px-3 border-r border-slate-400 w-24 text-right">Rate</th>
                <th className="py-2 px-4 w-28 text-right">Amount</th>
                <th className="py-2 px-1 w-8 print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-2 text-center font-bold border-r border-slate-300">
                    {idx + 1}
                  </td>
                  <td className="py-1 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => onUpdateItem?.(item.id, { name: e.target.value })}
                      placeholder="Item name"
                      className="w-full font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:bg-slate-50 px-1 py-0.5 print:p-0"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => onUpdateItem?.(item.id, { description: e.target.value })}
                      placeholder="Specs / serial..."
                      className="w-full text-[10px] text-slate-500 bg-transparent border-none focus:outline-none focus:bg-slate-50 px-1 py-0.5 print:p-0 print:placeholder-transparent"
                    />
                  </td>
                  <td className="py-1 px-2 text-center border-r border-slate-300">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => onUpdateItem?.(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full text-center font-mono font-bold bg-transparent border-none outline-none focus:outline-none focus:bg-slate-50 px-1 py-1 print:border-none print:p-0"
                    />
                  </td>
                  <td className="py-1 px-2 text-right border-r border-slate-300">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItem?.(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full text-right font-mono bg-transparent border-none outline-none focus:outline-none focus:bg-slate-50 px-1 py-1 print:border-none print:p-0"
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

              <tr className="print:hidden bg-slate-50">
                <td colSpan={6} className="py-1 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onAddItem?.()}
                    className="text-xs font-bold text-slate-700 hover:underline"
                  >
                    ➕ Add Item
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
              <span className="font-bold text-slate-900 shrink-0">In Words:</span>
              <input
                type="text"
                value={invoice.customInWords !== undefined ? invoice.customInWords : amountInWords}
                onChange={(e) => onUpdateInvoice?.({ customInWords: e.target.value })}
                placeholder={amountInWords}
                className="border-b border-dotted border-slate-600 flex-1 font-bold text-slate-800 text-xs px-2 py-0.5 bg-transparent focus:outline-none focus:bg-slate-50 print:p-0"
              />
            </div>
            {invoice.notes && (
              <div className="text-[11px] text-slate-600 italic">
                <span className="font-bold">Terms: </span>{invoice.notes}
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 border border-slate-400 divide-y divide-slate-300 text-xs font-bold bg-white">
            {(calc.totalVat > 0 || calc.totalDiscount > 0) && (
              <div className="flex justify-between py-1 px-3 bg-slate-50 text-slate-800">
                <span>Subtotal (উপ-মোট):</span>
                <span className="font-mono">{currencySymbol} {numFormat(calc.subtotal)}</span>
              </div>
            )}
            {calc.totalDiscount > 0 && (
              <div className="flex justify-between py-1 px-3 bg-rose-50 text-rose-700">
                <span>Discount (ছাড়):</span>
                <span className="font-mono">-{currencySymbol} {numFormat(calc.totalDiscount)}</span>
              </div>
            )}
            {calc.totalVat > 0 && (
              <div className="flex justify-between py-1 px-3 bg-amber-50 text-amber-900">
                <span>VAT / Tax (ভ্যাট):</span>
                <span className="font-mono font-bold">+{currencySymbol} {numFormat(calc.totalVat)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 px-3 bg-slate-100 text-slate-900">
              <span>{calc.totalVat > 0 || calc.totalDiscount > 0 ? 'Total (সর্বমোট):' : 'Total:'}</span>
              <span className="font-mono">{currencySymbol} {numFormat(calc.grandTotal)}</span>
            </div>
            <div className="flex items-center justify-between py-0.5 px-3">
              <span>Paid:</span>
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
              <span>Due:</span>
              <span className="font-mono font-black">{currencySymbol} {numFormat(calc.dueAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-slate-300 flex items-end justify-between text-xs font-bold text-slate-700">
        <div className="text-center">
          <div className="w-36 border-t border-slate-500 mx-auto mb-1" />
          <input
            type="text"
            value={invoice.customerSignatureTitle || 'Customer Signature'}
            onChange={(e) => onUpdateInvoice?.({ customerSignatureTitle: e.target.value })}
            className="text-center font-bold text-slate-700 bg-transparent border-none focus:outline-none print:p-0"
          />
        </div>
        <SignatureBlock
          signatureImage={invoice.signatureImage || business.signatureImage}
          signatureTitle={business.signatureTitle || invoice.signatureTitle || 'Authorized Signature'}
          onUpdateTitle={(val) => {
            onUpdateBusiness?.({ signatureTitle: val });
            onUpdateInvoice?.({ signatureTitle: val });
          }}
          onOpenSignatureModal={onOpenSignatureModal}
          lineColor="border-slate-500"
          textColor="text-slate-700"
        />
      </div>
    </div>
  );
};
