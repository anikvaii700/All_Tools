import { Invoice, InvoiceCalculation, InvoiceItem } from './types';

export function calculateItemTotal(item: InvoiceItem): {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  vatAmount: number;
  total: number;
} {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const price = Math.max(0, Number(item.unitPrice) || 0);
  const subtotal = Math.round(qty * price * 100) / 100;

  let discount = 0;
  if (item.discountType === 'percent') {
    const p = Math.min(100, Math.max(0, Number(item.discountValue) || 0));
    discount = Math.round((subtotal * p) / 100 * 100) / 100;
  } else {
    discount = Math.min(subtotal, Math.max(0, Number(item.discountValue) || 0));
  }

  const taxableAmount = Math.max(0, subtotal - discount);

  let vatAmount = 0;
  const vatRate = Math.max(0, Number(item.vatRate) || 0);
  if (vatRate > 0) {
    vatAmount = Math.round((taxableAmount * vatRate) / 100 * 100) / 100;
  }

  const total = Math.round((taxableAmount + vatAmount) * 100) / 100;

  return {
    subtotal,
    discount,
    taxableAmount,
    vatAmount,
    total,
  };
}

export function calculateInvoice(invoice: Invoice): InvoiceCalculation {
  let subtotal = 0;
  let itemDiscounts = 0;
  let totalVat = 0;

  (invoice.items || []).forEach((item) => {
    const res = calculateItemTotal(item);
    subtotal += res.subtotal;
    itemDiscounts += res.discount;
    totalVat += res.vatAmount;
  });

  subtotal = Math.round(subtotal * 100) / 100;
  itemDiscounts = Math.round(itemDiscounts * 100) / 100;
  totalVat = Math.round(totalVat * 100) / 100;

  const currentTotalBeforeInvDiscount = subtotal - itemDiscounts + totalVat;

  let invoiceDiscount = 0;
  if (invoice.invoiceDiscountType === 'percent') {
    const p = Math.min(100, Math.max(0, Number(invoice.invoiceDiscountValue) || 0));
    invoiceDiscount = Math.round((subtotal * p) / 100 * 100) / 100;
  } else {
    invoiceDiscount = Math.min(
      currentTotalBeforeInvDiscount,
      Math.max(0, Number(invoice.invoiceDiscountValue) || 0)
    );
  }

  const totalDiscount = Math.round((itemDiscounts + invoiceDiscount) * 100) / 100;
  const shipping = Math.max(0, Number(invoice.shippingCharge) || 0);

  const grandTotal = Math.max(
    0,
    Math.round((subtotal - itemDiscounts + totalVat - invoiceDiscount + shipping) * 100) / 100
  );

  const paidAmount = Math.max(0, Number(invoice.paidAmount) || 0);
  const dueAmount = Math.max(0, Math.round((grandTotal - paidAmount) * 100) / 100);

  // Overdue check: only overdue if due date passed and dueAmount > 0
  let isOverdue = false;
  if (dueAmount > 0 && invoice.dueDate) {
    const dueTime = new Date(invoice.dueDate).setHours(23, 59, 59, 999);
    isOverdue = Date.now() > dueTime;
  }

  return {
    subtotal,
    itemDiscounts,
    taxableSubtotal: Math.max(0, subtotal - itemDiscounts),
    totalVat,
    invoiceDiscount,
    totalDiscount,
    shipping,
    grandTotal,
    paidAmount,
    dueAmount,
    isOverdue,
  };
}

export function formatMoney(val: number, currencySymbol = '৳'): string {
  const safeVal = isNaN(val) ? 0 : val;
  // If whole number, don't show .00; if has decimals, show 2 decimal places
  const hasDecimals = Math.abs(safeVal % 1) >= 0.005;
  const formatted = safeVal.toLocaleString('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol}${formatted}`;
}
