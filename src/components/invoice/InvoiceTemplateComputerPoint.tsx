import React from 'react';
import { BusinessProfile, Invoice, InvoiceCalculation } from './types';
import { formatMoney } from './calculator';
import { numberToWordsBengali, toBengaliNumerals } from './numberToWords';

interface TemplateProps {
  invoice: Invoice;
  business: BusinessProfile;
  calc: InvoiceCalculation;
  onEditField?: (fieldId: string) => void;
}

export const InvoiceTemplateComputerPoint: React.FC<TemplateProps> = ({
  invoice,
  business,
  calc,
  onEditField,
}) => {
  const currencySymbol = 'Tk.';
  const amountInWords = numberToWordsBengali(calc.grandTotal);
  const numFormat = (num: number) => formatMoney(num, '');

  const clickProps = (fieldId: string, label = 'Click to edit') => ({
    onClick: () => onEditField && onEditField(fieldId),
    title: `${label} ✏️`,
    className:
      'cursor-pointer hover:bg-rose-50/80 hover:outline-dashed hover:outline-2 hover:outline-rose-400 rounded transition-all print:hover:bg-transparent print:hover:outline-none print:cursor-default',
  });

  return (
    <div className="bg-white text-slate-900 p-6 sm:p-8 font-sans text-xs sm:text-sm min-h-[920px] flex flex-col justify-between border border-slate-300 shadow-md print:border-none print:shadow-none print:p-6 print:m-0 print:min-h-0 relative select-none">
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
          <div className="flex items-start gap-3">
            {/* Logo */}
            <div className="w-14 h-14 border-2 border-red-600 flex flex-col items-center justify-center font-black text-slate-900 shrink-0">
              <span className="text-xl text-red-600">CP</span>
              <span className="text-[8px] font-bold">POINT</span>
            </div>

            <div {...clickProps('field-business-settings', 'Edit business details')}>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {business.businessName || 'Computer Point'}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {business.businessAddress || 'Jowel Mini Plaza (1st Floor), College Road, Kapasia, Gazipur.'}
              </p>
              <div className="text-[11px] text-slate-700 mt-1 font-mono">
                {business.phone && <span>Mobile : {business.phone}</span>}
                {business.email && <span className="ml-2">Email : {business.email}</span>}
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
          <span className="bg-red-600 text-white font-black text-xs px-6 py-0.5 rounded shadow-xs tracking-widest uppercase">
            B i l l
          </span>
        </div>

        {/* Client & Date Info */}
        <div className="my-3 space-y-1 text-xs text-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-slate-900 shrink-0">No.</span>
              <div
                {...clickProps('field-inv-number', 'Edit invoice number')}
                className="border-b border-dotted border-slate-600 flex-1 font-mono font-bold text-slate-900 px-2"
              >
                {invoice.invoiceNumber}
              </div>
            </div>
            <div className="flex items-center gap-2 w-48 sm:w-60">
              <span className="font-bold text-slate-900 shrink-0">Date:</span>
              <div
                {...clickProps('field-inv-date', 'Edit invoice date')}
                className="border-b border-dotted border-slate-600 flex-1 font-mono font-bold text-slate-900 px-2"
              >
                {invoice.invoiceDate}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-bold text-slate-900 shrink-0">Name :</span>
              <div
                {...clickProps('field-cust-name', 'Edit client name')}
                className="border-b border-dotted border-slate-600 flex-1 font-bold text-slate-900 px-2 min-h-[20px]"
              >
                {invoice.customer.name || 'Valued Client'}
              </div>
            </div>
            <div className="flex items-center gap-2 w-48 sm:w-60">
              <span className="font-bold text-slate-900 shrink-0">Contact No.</span>
              <div
                {...clickProps('field-cust-phone', 'Edit phone')}
                className="border-b border-dotted border-slate-600 flex-1 font-mono text-slate-900 px-2 min-h-[20px]"
              >
                {invoice.customer.phone || '—'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 shrink-0">Address :</span>
            <div
              {...clickProps('field-cust-address', 'Edit address')}
              className="border-b border-dotted border-slate-600 flex-1 text-slate-800 px-2 min-h-[20px]"
            >
              {invoice.customer.address || '—'}
            </div>
          </div>
        </div>

        {/* Crimson Red Table Header */}
        <div className="border border-red-600">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-red-600 text-white text-[11px] sm:text-xs font-bold text-center">
                <th className="py-1.5 px-2 border-r border-red-500 w-12">Sl. No</th>
                <th className="py-1.5 px-4 border-r border-red-500 text-left">Description</th>
                <th
                  {...clickProps(`field-item-qty-${invoice.items[0]?.id || ''}`, 'Edit quantity')}
                  className="py-1.5 px-3 border-r border-red-500 w-20"
                >
                  Qty.
                </th>
                <th
                  {...clickProps(`field-item-price-${invoice.items[0]?.id || ''}`, 'Edit unit price')}
                  className="py-1.5 px-3 border-r border-red-500 w-24 text-right"
                >
                  Rate
                </th>
                <th className="py-1.5 px-4 w-28 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-2 text-center font-bold text-slate-700 border-r border-slate-300">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-300">
                    <div
                      {...clickProps(`field-item-name-${item.id}`, 'Edit item name')}
                      className="font-bold text-slate-900"
                    >
                      {item.name || 'Item Name'}
                    </div>
                    {item.description && (
                      <div className="text-[10px] text-slate-500">{item.description}</div>
                    )}
                  </td>
                  <td
                    {...clickProps(`field-item-qty-${item.id}`, 'Edit item qty')}
                    className="py-2 px-3 text-center font-mono border-r border-slate-300"
                  >
                    {item.quantity}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'Edit rate')}
                    className="py-2 px-3 text-right font-mono border-r border-slate-300"
                  >
                    {numFormat(item.unitPrice)}
                  </td>
                  <td
                    {...clickProps(`field-item-price-${item.id}`, 'Edit total')}
                    className="py-2 px-3 text-right font-mono font-bold text-slate-900"
                  >
                    {numFormat(item.lineTotal)}
                  </td>
                </tr>
              ))}

              {Array.from({ length: Math.max(0, 8 - invoice.items.length) }).map((_, i) => (
                <tr key={`fill-${i}`} className="h-7">
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td className="border-r border-slate-300"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Red Outline Totals Box on Right */}
        <div className="mt-3 flex justify-end">
          <div className="w-64 border border-red-600 text-xs">
            <div className="flex border-b border-red-600">
              <span className="w-28 p-1 font-bold text-red-700 border-r border-red-600 bg-red-50/50">
                Total Taka
              </span>
              <span
                {...clickProps('field-inv-paid-amount', 'Edit amount')}
                className="flex-1 p-1 text-right font-mono font-black"
              >
                {currencySymbol} {numFormat(calc.grandTotal)}
              </span>
            </div>
            <div className="flex border-b border-red-600">
              <span className="w-28 p-1 font-bold text-slate-700 border-r border-red-600 bg-slate-50">
                Advance
              </span>
              <span
                {...clickProps('field-inv-paid-amount', 'Edit paid amount')}
                className="flex-1 p-1 text-right font-mono font-bold text-emerald-700"
              >
                {currencySymbol} {numFormat(calc.paidAmount)}
              </span>
            </div>
            <div className="flex">
              <span className="w-28 p-1 font-bold text-slate-700 border-r border-red-600 bg-slate-50">
                Due
              </span>
              <span
                {...clickProps('field-inv-paid-amount', 'Edit due amount')}
                className="flex-1 p-1 text-right font-mono font-bold text-rose-700"
              >
                {currencySymbol} {numFormat(calc.dueAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* In Words */}
        <div className="mt-2 text-xs flex items-center gap-2">
          <span className="font-bold text-slate-900 shrink-0">Taka In Word :</span>
          <div className="border-b border-dotted border-slate-700 flex-1 font-semibold text-slate-800 px-2 py-0.5">
            {amountInWords} Taka only.
          </div>
        </div>
      </div>

      {/* Footer Signatures and Bottom Geometric Color Bar */}
      <div className="pt-8">
        <div className="flex items-end justify-between text-xs font-bold text-slate-800 pb-4">
          <div className="text-center">
            <div className="w-32 border-t border-slate-700 mx-auto mb-1" />
            <span>Received by</span>
          </div>
          <div className="text-center">
            <div className="w-36 border-t border-slate-700 mx-auto mb-1" />
            <span>Authorized Signature</span>
          </div>
        </div>

        {/* Bottom Geometric Color Bar */}
        <div className="flex h-3 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8">
          <div className="w-1/5 bg-slate-900" />
          <div className="w-1/5 bg-red-600" />
          <div className="w-1/5 bg-slate-500" />
          <div className="w-1/5 bg-orange-500" />
          <div className="w-1/5 bg-rose-200" />
        </div>
      </div>
    </div>
  );
};
