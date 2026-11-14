import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CalendarDays,
  CheckCircle2,
  Download,
  Edit2,
  FileText,
  Plus,
  Printer,
  Receipt,
  Search,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { calculateInvoice } from '../../components/invoice/calculator';
import { getShopCategoryConfig } from '../shopCategoriesConfig';
import { formatShopMoney, toShopDigits } from '../shopI18n';
import {
  DailySalePaymentMethod,
  ShopDailySale,
  ShopLanguage,
  ShopProfile,
} from '../types';
import { ShopDataState } from '../useShopData';

type PeriodPreset = 'today' | 'yesterday' | 'last7' | 'month' | 'all' | 'custom';

interface ShopDailySalesReportViewProps {
  profile: ShopProfile;
  logoDataUrl?: string;
  data: ShopDataState;
  language: ShopLanguage;
  onShowToast: (msg: string, icon?: string) => void;
  onOpenCashMemo?: () => void;
}

function getLocalDateIso(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function normalizeDateStr(primary?: string, fallback?: string): string {
  const val = (primary || '').trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const fb = (fallback || '').trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(fb)) return fb;
  return getLocalDateIso(0);
}

const PAYMENT_LABELS: Record<DailySalePaymentMethod, { bn: string; en: string; color: string }> = {
  cash: { bn: 'নগদ (Cash)', en: 'Cash', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  bkash: { bn: 'বিকাশ', en: 'bKash', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  nagad: { bn: 'নগদ (Nagad)', en: 'Nagad', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  rocket: { bn: 'রকেট', en: 'Rocket', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  bank: { bn: 'ব্যাংক', en: 'Bank', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  card: { bn: 'কার্ড', en: 'Card', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  due: { bn: 'বাকি', en: 'Due', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const ShopDailySalesReportView: React.FC<ShopDailySalesReportViewProps> = ({
  profile,
  logoDataUrl,
  data,
  language,
  onShowToast,
  onOpenCashMemo,
}) => {
  const cat = getShopCategoryConfig(profile.shopCategory);
  const today = getLocalDateIso(0);
  const yesterday = getLocalDateIso(-1);
  const last7Start = getLocalDateIso(-6);
  const monthStart = `${today.slice(0, 8)}01`;

  const [preset, setPreset] = useState<PeriodPreset>('today');
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick Daily Counter Sale form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saleDate, setSaleDate] = useState<string>(today);
  const [saleTitle, setSaleTitle] = useState<string>('');
  const [saleCustomer, setSaleCustomer] = useState<string>('');
  const [salePayment, setSalePayment] = useState<DailySalePaymentMethod>('cash');
  const [saleQty, setSaleQty] = useState<string>('1');
  const [saleTotal, setSaleTotal] = useState<string>('');
  const [salePaid, setSalePaid] = useState<string>('');
  const [salePaidManual, setSalePaidManual] = useState<boolean>(false);
  const [saleCost, setSaleCost] = useState<string>('');
  const [saleNote, setSaleNote] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const selectPreset = (next: PeriodPreset) => {
    setPreset(next);
    if (next === 'today') {
      setFromDate(today);
      setToDate(today);
      setSaleDate(today);
    } else if (next === 'yesterday') {
      setFromDate(yesterday);
      setToDate(yesterday);
      setSaleDate(yesterday);
    } else if (next === 'last7') {
      setFromDate(last7Start);
      setToDate(today);
    } else if (next === 'month') {
      setFromDate(monthStart);
      setToDate(today);
    } else if (next === 'all') {
      setFromDate('');
      setToDate('');
    }
  };

  const inspectSingleDay = (dateStr: string) => {
    setFromDate(dateStr);
    setToDate(dateStr);
    setSaleDate(dateStr);
    if (dateStr === today) setPreset('today');
    else if (dateStr === yesterday) setPreset('yesterday');
    else setPreset('custom');
  };

  const inRange = (dateStr: string): boolean => {
    if (preset === 'all') return true;
    if (fromDate && dateStr < fromDate) return false;
    if (toDate && dateStr > toDate) return false;
    return true;
  };

  const handleProductPick = (prodId: string) => {
    setSelectedProductId(prodId);
    const found = data.products.find((p) => p.id === prodId);
    if (!found) return;
    const qtyNum = Math.max(1, Number(saleQty) || 1);
    const total = (found.sellingPrice || 0) * qtyNum;
    const cost = (found.purchasePrice || 0) * qtyNum;
    setSaleTitle(found.name);
    setSaleTotal(total > 0 ? String(total) : '');
    if (salePayment !== 'due') {
      setSalePaid(total > 0 ? String(total) : '');
      setSalePaidManual(false);
    }
    setSaleCost(cost > 0 ? String(cost) : '');
  };

  const handleQtyChange = (nextQtyStr: string) => {
    setSaleQty(nextQtyStr);
    if (selectedProductId) {
      const found = data.products.find((p) => p.id === selectedProductId);
      if (found) {
        const qtyNum = Math.max(0, Number(nextQtyStr) || 0);
        const total = (found.sellingPrice || 0) * qtyNum;
        const cost = (found.purchasePrice || 0) * qtyNum;
        setSaleTotal(total > 0 ? String(total) : '');
        if (!salePaidManual && salePayment !== 'due') {
          setSalePaid(total > 0 ? String(total) : '');
        }
        setSaleCost(cost > 0 ? String(cost) : '');
      }
    }
  };

  const handleTotalChange = (val: string) => {
    setSaleTotal(val);
    if (!salePaidManual) {
      setSalePaid(salePayment === 'due' ? '0' : val);
    }
  };

  const handlePaymentMethodChange = (method: DailySalePaymentMethod) => {
    setSalePayment(method);
    if (method === 'due') {
      setSalePaid('0');
      setSalePaidManual(false);
    } else if (!salePaidManual) {
      setSalePaid(saleTotal);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSaleTitle('');
    setSaleCustomer('');
    setSalePayment('cash');
    setSaleQty('1');
    setSaleTotal('');
    setSalePaid('');
    setSalePaidManual(false);
    setSaleCost('');
    setSaleNote('');
    setSelectedProductId('');
  };

  const handleSaveCounterSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = saleTitle.trim();
    const totalNum = Math.max(0, Number(saleTotal) || 0);
    if (!cleanTitle) {
      onShowToast(language === 'en' ? 'Enter sale description or item' : 'বিক্রয়ের বিবরণ বা পণ্যের নাম লিখুন', '⚠️');
      return;
    }
    if (totalNum <= 0) {
      onShowToast(language === 'en' ? 'Enter a valid sale amount' : 'সঠিক বিক্রয়ের টাকা লিখুন', '⚠️');
      return;
    }

    const rawPaid = salePaid === '' ? (salePayment === 'due' ? 0 : totalNum) : Math.max(0, Number(salePaid) || 0);
    const paidNum = Math.min(totalNum, rawPaid);
    const dueNum = Math.max(0, totalNum - paidNum);
    const costNum = Math.max(0, Number(saleCost) || 0);
    const qtyNum = Math.max(1, Number(saleQty) || 1);
    const now = new Date().toISOString();
    const existing = editingId ? data.dailySales.find((s) => s.id === editingId) : undefined;
    const itemId = editingId || `dsale-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    await data.upsertItem<ShopDailySale>('dailySales', {
      id: itemId,
      shopId: profile.shopId,
      ownerUid: profile.ownerUid,
      date: normalizeDateStr(saleDate, today),
      title: cleanTitle.slice(0, 180),
      customerName: saleCustomer.trim().slice(0, 160),
      paymentMethod: salePayment,
      totalAmount: totalNum,
      paidAmount: paidNum,
      dueAmount: dueNum,
      costAmount: costNum,
      quantity: qtyNum,
      note: saleNote.trim().slice(0, 400),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });

    onShowToast(
      editingId
        ? language === 'en'
          ? 'Daily sale entry updated!'
          : 'বিক্রয়ের হিসাব আপডেট হয়েছে!'
        : language === 'en'
        ? 'Daily sale added to report!'
        : 'প্রতিদিনের বিক্রয় রিপোর্টে যোগ হয়েছে!',
      '✅'
    );
    resetForm();
  };

  const handleStartEdit = (entry: ShopDailySale) => {
    setEditingId(entry.id);
    setSaleDate(entry.date);
    setSaleTitle(entry.title);
    setSaleCustomer(entry.customerName || '');
    setSalePayment(entry.paymentMethod);
    setSaleQty(String(entry.quantity || 1));
    setSaleTotal(String(entry.totalAmount));
    setSalePaid(String(entry.paidAmount));
    setSalePaidManual(entry.paidAmount !== entry.totalAmount);
    setSaleCost(entry.costAmount ? String(entry.costAmount) : '');
    setSaleNote(entry.note || '');
    setSelectedProductId('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build normalized views across Invoices (Cash Memos), Counter Sales (dailySales), Receipts, and Expenses
  const periodSummary = useMemo(() => {
    const filteredInvoices = data.invoices.filter((inv) =>
      inRange(normalizeDateStr(inv.invoiceDate, inv.createdAt))
    );
    const filteredCounter = data.dailySales.filter((ds) =>
      inRange(normalizeDateStr(ds.date, ds.createdAt))
    );
    const filteredReceipts = data.receipts.filter((rec) =>
      inRange(normalizeDateStr(rec.receiptDate, rec.createdAt))
    );
    const filteredExpenses = data.expenses.filter((exp) =>
      inRange(normalizeDateStr(exp.date, exp.createdAt))
    );

    let memoBilled = 0;
    let memoCollected = 0;
    let memoDue = 0;
    filteredInvoices.forEach((inv) => {
      const calc = calculateInvoice(inv);
      memoBilled += calc.grandTotal;
      memoCollected += calc.paidAmount;
      memoDue += calc.dueAmount;
    });

    let counterBilled = 0;
    let counterCollected = 0;
    let counterDue = 0;
    let counterCost = 0;
    const methodTotals: Record<DailySalePaymentMethod, number> = {
      cash: 0,
      bkash: 0,
      nagad: 0,
      rocket: 0,
      bank: 0,
      card: 0,
      due: 0,
    };

    filteredCounter.forEach((ds) => {
      counterBilled += ds.totalAmount || 0;
      counterCollected += ds.paidAmount || 0;
      counterDue += ds.dueAmount || 0;
      counterCost += ds.costAmount || 0;
      const pm = ds.paymentMethod || 'cash';
      methodTotals[pm] = (methodTotals[pm] || 0) + (ds.paidAmount || 0);
    });

    // Include receipts in payment method breakdown & collected cash
    let receiptCollected = 0;
    filteredReceipts.forEach((rec) => {
      const amt = rec.amount || 0;
      receiptCollected += amt;
      const pm = (rec.paymentMethod === 'other' ? 'cash' : rec.paymentMethod) as DailySalePaymentMethod;
      if (pm in methodTotals) {
        methodTotals[pm] += amt;
      }
    });

    // Cash memos paid amount goes into cash bucket unless covered by receipts
    if (memoCollected > 0) {
      methodTotals.cash += memoCollected;
    }

    const totalExpenses = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalSales = memoBilled + counterBilled;
    const totalCollected = memoCollected + counterCollected + receiptCollected;
    const totalDue = memoDue + counterDue;
    const netCash = totalCollected - totalExpenses;
    const estimatedProfit = counterCost > 0 ? counterBilled - counterCost : null;

    return {
      filteredInvoices,
      filteredCounter,
      filteredReceipts,
      filteredExpenses,
      memoBilled,
      memoCollected,
      memoDue,
      counterBilled,
      counterCollected,
      counterDue,
      counterCost,
      receiptCollected,
      totalExpenses,
      totalSales,
      totalCollected,
      totalDue,
      netCash,
      estimatedProfit,
      methodTotals,
    };
  }, [data.invoices, data.dailySales, data.receipts, data.expenses, preset, fromDate, toDate]);

  // Day-by-Day Aggregation across ALL history (newest first)
  const dailyRows = useMemo(() => {
    const map = new Map<
      string,
      {
        date: string;
        memoCount: number;
        counterCount: number;
        receiptCount: number;
        totalSales: number;
        totalCollected: number;
        totalDue: number;
        totalExpense: number;
        totalCost: number;
      }
    >();

    const ensureDay = (dateStr: string) => {
      let row = map.get(dateStr);
      if (!row) {
        row = {
          date: dateStr,
          memoCount: 0,
          counterCount: 0,
          receiptCount: 0,
          totalSales: 0,
          totalCollected: 0,
          totalDue: 0,
          totalExpense: 0,
          totalCost: 0,
        };
        map.set(dateStr, row);
      }
      return row;
    };

    data.invoices.forEach((inv) => {
      const d = normalizeDateStr(inv.invoiceDate, inv.createdAt);
      const calc = calculateInvoice(inv);
      const row = ensureDay(d);
      row.memoCount += 1;
      row.totalSales += calc.grandTotal;
      row.totalCollected += calc.paidAmount;
      row.totalDue += calc.dueAmount;
    });

    data.dailySales.forEach((ds) => {
      const d = normalizeDateStr(ds.date, ds.createdAt);
      const row = ensureDay(d);
      row.counterCount += 1;
      row.totalSales += ds.totalAmount || 0;
      row.totalCollected += ds.paidAmount || 0;
      row.totalDue += ds.dueAmount || 0;
      row.totalCost += ds.costAmount || 0;
    });

    data.receipts.forEach((rec) => {
      const d = normalizeDateStr(rec.receiptDate, rec.createdAt);
      const row = ensureDay(d);
      row.receiptCount += 1;
      row.totalCollected += rec.amount || 0;
    });

    data.expenses.forEach((exp) => {
      const d = normalizeDateStr(exp.date, exp.createdAt);
      const row = ensureDay(d);
      row.totalExpense += exp.amount || 0;
    });

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [data.invoices, data.dailySales, data.receipts, data.expenses]);

  // Combined itemized transactions for selected range + search query
  const detailedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    type CombinedRow =
      | {
          kind: 'counter';
          date: string;
          sortKey: string;
          entry: ShopDailySale;
        }
      | {
          kind: 'memo';
          date: string;
          sortKey: string;
          id: string;
          invoiceNumber: string;
          customerName: string;
          itemsSummary: string;
          totalAmount: number;
          paidAmount: number;
          dueAmount: number;
          status: string;
        }
      | {
          kind: 'receipt';
          date: string;
          sortKey: string;
          id: string;
          receiptNumber: string;
          receivedFrom: string;
          paymentMethod: string;
          amount: number;
          purpose: string;
        };

    const combined: CombinedRow[] = [];

    periodSummary.filteredCounter.forEach((entry) => {
      const match =
        !q ||
        entry.title.toLowerCase().includes(q) ||
        (entry.customerName || '').toLowerCase().includes(q) ||
        (entry.note || '').toLowerCase().includes(q);
      if (match) {
        combined.push({
          kind: 'counter',
          date: normalizeDateStr(entry.date, entry.createdAt),
          sortKey: entry.updatedAt || entry.createdAt || entry.date,
          entry,
        });
      }
    });

    periodSummary.filteredInvoices.forEach((inv) => {
      const calc = calculateInvoice(inv);
      const itemsSummary = inv.items.map((it) => `${it.name} (${it.quantity})`).join(', ');
      const custName = inv.customer?.name || (language === 'en' ? 'Walk-in Customer' : 'সাধারণ ক্রেতা');
      const match =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        custName.toLowerCase().includes(q) ||
        itemsSummary.toLowerCase().includes(q);
      if (match) {
        combined.push({
          kind: 'memo',
          date: normalizeDateStr(inv.invoiceDate, inv.createdAt),
          sortKey: inv.updatedAt || inv.createdAt || inv.invoiceDate,
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: custName,
          itemsSummary,
          totalAmount: calc.grandTotal,
          paidAmount: calc.paidAmount,
          dueAmount: calc.dueAmount,
          status: inv.paymentStatus,
        });
      }
    });

    periodSummary.filteredReceipts.forEach((rec) => {
      const match =
        !q ||
        rec.receiptNumber.toLowerCase().includes(q) ||
        (rec.receivedFrom || '').toLowerCase().includes(q) ||
        (rec.paymentPurpose || '').toLowerCase().includes(q);
      if (match) {
        combined.push({
          kind: 'receipt',
          date: normalizeDateStr(rec.receiptDate, rec.createdAt),
          sortKey: rec.createdAt || rec.receiptDate,
          id: rec.id,
          receiptNumber: rec.receiptNumber,
          receivedFrom: rec.receivedFrom || '---',
          paymentMethod: rec.paymentMethod,
          amount: rec.amount || 0,
          purpose: rec.paymentPurpose || '',
        });
      }
    });

    return combined.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  }, [periodSummary, searchQuery, language]);

  const handleExportDailyCsv = () => {
    const rows: string[][] = [
      [
        'Date',
        'Type',
        'Reference / Description',
        'Customer',
        'Payment Method',
        'Total Sale (BDT)',
        'Collected (BDT)',
        'Due (BDT)',
        'Cost (BDT)',
      ],
      ...detailedItems.map((row) => {
        if (row.kind === 'counter') {
          return [
            row.date,
            'Counter Sale',
            row.entry.title,
            row.entry.customerName || '',
            row.entry.paymentMethod,
            String(row.entry.totalAmount),
            String(row.entry.paidAmount),
            String(row.entry.dueAmount),
            String(row.entry.costAmount || 0),
          ];
        }
        if (row.kind === 'memo') {
          return [
            row.date,
            'Cash Memo',
            `${row.invoiceNumber}: ${row.itemsSummary}`,
            row.customerName,
            row.status,
            String(row.totalAmount),
            String(row.paidAmount),
            String(row.dueAmount),
            '0',
          ];
        }
        return [
          row.date,
          'Money Receipt',
          `${row.receiptNumber}: ${row.purpose}`,
          row.receivedFrom,
          row.paymentMethod,
          '0',
          String(row.amount),
          '0',
          '0',
        ];
      }),
      [],
      ['DAILY SUMMARY', 'Memos', 'Counter Sales', 'Total Sales', 'Total Collected', 'Total Due', 'Expenses', 'Net Cash'],
      ...dailyRows.map((d) => [
        d.date,
        String(d.memoCount),
        String(d.counterCount),
        String(d.totalSales),
        String(d.totalCollected),
        String(d.totalDue),
        String(d.totalExpense),
        String(d.totalCollected - d.totalExpense),
      ]),
    ];

    const csv = '\uFEFF' + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(profile.shopName || 'shop').replace(/\s+/g, '_')}_daily_sales_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(language === 'en' ? 'Daily Sales CSV downloaded!' : 'প্রতিদিনের বিক্রয় রিপোর্ট CSV ডাউনলোড হয়েছে!', '📄');
  };

  const rangeLabel =
    preset === 'all'
      ? language === 'en'
        ? 'All Dates'
        : 'সকল তারিখ'
      : fromDate === toDate
      ? toShopDigits(fromDate, language)
      : `${toShopDigits(fromDate, language)} → ${toShopDigits(toDate, language)}`;

  return (
    <div className="space-y-6">
      {/* Printable Shop Header (visible only when printing A4 report) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoDataUrl && (
              <img src={logoDataUrl} alt={profile.shopName} className="w-12 h-12 object-contain" />
            )}
            <div>
              <h1 className="text-xl font-black text-slate-900">{profile.shopName}</h1>
              <p className="text-xs text-slate-600">
                {profile.ownerName} • {profile.phone} {profile.address ? `• ${profile.address}` : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-slate-900">
              {language === 'en' ? 'DAILY SALES REPORT' : 'প্রতিদিনের বিক্রয় রিপোর্ট'}
            </div>
            <div className="text-xs text-slate-600 font-mono">{rangeLabel}</div>
          </div>
        </div>
      </div>

      {/* Top Header & Period Filters */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: profile.brandColor || cat.accentColor }}
            >
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {language === 'en' ? 'Daily Sales Report & Counter Register' : 'প্রতিদিনের বিক্রয় রিপোর্ট ও দৈনিক খাতা'}
              </h2>
              <p className="text-xs text-slate-500">
                {profile.shopName} •{' '}
                {language === 'en'
                  ? 'Auto-combines Cash Memos, Money Receipts & Counter Sales'
                  : 'ক্যাশ মেমো, মানি রিসিট ও দৈনিক কাউন্টার বিক্রয়ের সমন্বিত হিসাব'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenCashMemo && (
              <button
                type="button"
                onClick={onOpenCashMemo}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'New Cash Memo' : '+ নতুন ক্যাশ মেমো'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportDailyCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'CSV' : 'CSV ডাউনলোড'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Print / PDF' : 'প্রিন্ট / PDF'}</span>
            </button>
          </div>
        </div>

        {/* Date Preset Pills & Custom Range */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            {(
              [
                { id: 'today', bn: 'আজ', en: 'Today' },
                { id: 'yesterday', bn: 'গতকাল', en: 'Yesterday' },
                { id: 'last7', bn: 'গত ৭ দিন', en: 'Last 7 Days' },
                { id: 'month', bn: 'এই মাস', en: 'This Month' },
                { id: 'all', bn: 'সব দিন', en: 'All Time' },
              ] as Array<{ id: PeriodPreset; bn: string; en: string }>
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => selectPreset(btn.id)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  preset === btn.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {language === 'en' ? btn.en : btn.bn}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="font-bold text-slate-500">
              {language === 'en' ? 'From:' : 'হতে:'}
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setPreset('custom');
                setFromDate(e.target.value);
              }}
              className="p-1.5 px-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white"
            />
            <label className="font-bold text-slate-500">
              {language === 'en' ? 'To:' : 'পর্যন্ত:'}
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setPreset('custom');
                setToDate(e.target.value);
              }}
              className="p-1.5 px-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* Quick Daily Counter Sale Entry Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <h3 className="font-black text-sm text-slate-900">
              {editingId
                ? language === 'en'
                  ? 'Edit Counter Sale Entry'
                  : 'বিক্রয়ের হিসাব আপডেট করুন'
                : language === 'en'
                ? 'Quick Daily Sale Entry (Counter / Cash Sale)'
                : 'দ্রুত দৈনিক বিক্রয় যোগ করুন (নগদ / কাউন্টার বিক্রি)'}
            </h3>
          </div>

          {data.products.length > 0 && (
            <select
              value={selectedProductId}
              onChange={(e) => handleProductPick(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 max-w-xs"
            >
              <option value="">
                {language === 'en' ? '-- Pick from Inventory (Optional) --' : '-- স্টক থেকে পণ্য বাছুন (ঐচ্ছিক) --'}
              </option>
              {data.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ৳{p.sellingPrice} ({p.stock} {p.unit})
                </option>
              ))}
            </select>
          )}
        </div>

        <form onSubmit={handleSaveCounterSale} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-2.5 text-xs">
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              {language === 'en' ? 'Date' : 'তারিখ'}
            </label>
            <input
              type="date"
              required
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              {language === 'en' ? 'Item / Sale Description *' : 'বিক্রয়ের বিবরণ / পণ্যের নাম *'}
            </label>
            <input
              type="text"
              required
              value={saleTitle}
              onChange={(e) => setSaleTitle(e.target.value)}
              placeholder={language === 'en' ? 'e.g. Counter cash sale' : 'যেমন: নগদ বিক্রি / পণ্যের নাম'}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              {language === 'en' ? 'Customer (Opt)' : 'ক্রেতা (ঐচ্ছিক)'}
            </label>
            <input
              type="text"
              value={saleCustomer}
              onChange={(e) => setSaleCustomer(e.target.value)}
              placeholder={language === 'en' ? 'Walk-in' : 'সাধারণ ক্রেতা'}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              {language === 'en' ? 'Method' : 'পেমেন্ট মাধ্যম'}
            </label>
            <select
              value={salePayment}
              onChange={(e) => handlePaymentMethodChange(e.target.value as DailySalePaymentMethod)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
            >
              {(Object.keys(PAYMENT_LABELS) as DailySalePaymentMethod[]).map((pm) => (
                <option key={pm} value={pm}>
                  {language === 'en' ? PAYMENT_LABELS[pm].en : PAYMENT_LABELS[pm].bn}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              {language === 'en' ? 'Total Sale (৳) *' : 'মোট বিক্রি (৳) *'}
            </label>
            <input
              type="number"
              required
              min="0"
              step="any"
              value={saleTotal}
              onChange={(e) => handleTotalChange(e.target.value)}
              placeholder="0"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              {language === 'en' ? 'Paid (৳)' : 'নগদ জমা (৳)'}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={salePaid}
              onChange={(e) => {
                setSalePaid(e.target.value);
                setSalePaidManual(true);
              }}
              placeholder={saleTotal || '0'}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-emerald-700"
            />
          </div>

          <div className="lg:col-span-1 flex items-end gap-1.5">
            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              {editingId ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingId ? (language === 'en' ? 'Update' : 'আপডেট') : language === 'en' ? 'Add' : 'যোগ'}</span>
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title={language === 'en' ? 'Cancel' : 'বাতিল'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Optional Qty, Cost, Note sub-row */}
          <div className="sm:col-span-2 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                {language === 'en' ? 'Qty:' : 'পরিমাণ:'}
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={saleQty}
                onChange={(e) => handleQtyChange(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 font-mono text-xs bg-slate-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                {language === 'en' ? 'Cost Price (Opt):' : 'ক্রয়মূল্য / কেনা দাম (ঐচ্ছিক):'}
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={saleCost}
                onChange={(e) => setSaleCost(e.target.value)}
                placeholder="0"
                className="w-full p-2 rounded-xl border border-slate-200 font-mono text-xs bg-slate-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                {language === 'en' ? 'Note:' : 'নোট:'}
              </label>
              <input
                type="text"
                value={saleNote}
                onChange={(e) => setSaleNote(e.target.value)}
                placeholder={language === 'en' ? 'Optional remark...' : 'অতিরিক্ত মন্তব্য (ঐচ্ছিক)...'}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Period Summary KPI Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <span>
            {language === 'en' ? 'Report Summary for:' : 'নির্বাচিত সময়ের বিক্রয় সারসংক্ষেপ:'}{' '}
            <span className="text-slate-900 font-black">{rangeLabel}</span>
          </span>
          <span className="tabular-nums">
            {language === 'en'
              ? `${periodSummary.filteredInvoices.length} Memos • ${periodSummary.filteredCounter.length} Counter Entries`
              : `${toShopDigits(periodSummary.filteredInvoices.length, language)} টি মেমো • ${toShopDigits(periodSummary.filteredCounter.length, language)} টি কাউন্টার বিক্রি`}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500">
              {language === 'en' ? 'Total Sales' : 'মোট বিক্রি'}
            </div>
            <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">
              {formatShopMoney(periodSummary.totalSales, language)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 tabular-nums">
              {language === 'en' ? 'Memo:' : 'মেমো:'} {formatShopMoney(periodSummary.memoBilled, language)} •{' '}
              {language === 'en' ? 'Counter:' : 'কাউন্টার:'} {formatShopMoney(periodSummary.counterBilled, language)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="text-[11px] font-bold text-emerald-700">
              {language === 'en' ? 'Cash & MFS Collected' : 'মোট নগদ ও ডিজিটাল আদায়'}
            </div>
            <div className="text-xl font-black text-emerald-700 mt-1 tabular-nums">
              {formatShopMoney(periodSummary.totalCollected, language)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 tabular-nums">
              {language === 'en' ? 'Receipts:' : 'রিসিট:'} {formatShopMoney(periodSummary.receiptCollected, language)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="text-[11px] font-bold text-rose-700">
              {language === 'en' ? 'Credit / Due Sales' : 'বাকি বিক্রি'}
            </div>
            <div className="text-xl font-black text-rose-700 mt-1 tabular-nums">
              {formatShopMoney(periodSummary.totalDue, language)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 tabular-nums">
              {language === 'en' ? 'Memo Due:' : 'মেমো বাকি:'} {formatShopMoney(periodSummary.memoDue, language)}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="text-[11px] font-bold text-amber-700">
              {language === 'en' ? 'Daily Expenses' : 'দৈনিক খরচ'}
            </div>
            <div className="text-xl font-black text-amber-700 mt-1 tabular-nums">
              {formatShopMoney(periodSummary.totalExpenses, language)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 tabular-nums">
              {toShopDigits(periodSummary.filteredExpenses.length, language)}{' '}
              {language === 'en' ? 'entries' : 'টি খরচের এন্ট্রি'}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="text-[11px] font-bold text-indigo-700">
              {language === 'en' ? 'Net Cash in Hand' : 'নিট ক্যাশ স্থিতি'}
            </div>
            <div className="text-xl font-black text-indigo-800 mt-1 tabular-nums">
              {formatShopMoney(periodSummary.netCash, language)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 tabular-nums">
              {periodSummary.estimatedProfit !== null
                ? `${language === 'en' ? 'Counter Profit:' : 'কাউন্টার লাভ:'} ${formatShopMoney(periodSummary.estimatedProfit, language)}`
                : language === 'en'
                ? 'Collected - Expenses'
                : 'আদায় - দৈনিক খরচ'}
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'en' ? 'Payment Channels:' : 'পেমেন্ট মাধ্যম অনুযায়ী আদায়:'}</span>
          </span>
          {(['cash', 'bkash', 'nagad', 'rocket', 'bank', 'card'] as DailySalePaymentMethod[]).map((pm) => (
            <span
              key={pm}
              className={`px-2.5 py-1 rounded-lg border font-bold tabular-nums ${PAYMENT_LABELS[pm].color}`}
            >
              {language === 'en' ? PAYMENT_LABELS[pm].en : PAYMENT_LABELS[pm].bn}:{' '}
              {formatShopMoney(periodSummary.methodTotals[pm] || 0, language)}
            </span>
          ))}
        </div>
      </div>

      {/* Selected Range Detailed Transactions List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <h3 className="font-black text-sm text-slate-900">
              {language === 'en'
                ? `Sales Details (${rangeLabel})`
                : `নির্বাচিত সময়ের বিস্তারিত বিক্রয়ের তালিকা (${rangeLabel})`}
            </h3>
          </div>

          <div className="relative w-full sm:w-64 print:hidden">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Filter item or customer...' : 'পণ্য, মেমো বা ক্রেতা খুঁজুন...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        {detailedItems.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">
              {language === 'en'
                ? 'No sales recorded for this date/range yet.'
                : 'এই তারিখে এখনো কোনো বিক্রয় রেকর্ড পাওয়া যায়নি।'}
            </p>
            <p>
              {language === 'en'
                ? 'Use the quick form above to record a counter sale or create a Cash Memo.'
                : 'উপরের দ্রুত ফর্ম থেকে কাউন্টার বিক্রি যোগ করুন অথবা নতুন ক্যাশ মেমো তৈরি করুন।'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">{language === 'en' ? 'Date' : 'তারিখ'}</th>
                  <th className="py-3 px-4">{language === 'en' ? 'Type' : 'ধরন'}</th>
                  <th className="py-3 px-4">{language === 'en' ? 'Item / Reference' : 'বিবরণ ও মেমো'}</th>
                  <th className="py-3 px-4">{language === 'en' ? 'Customer' : 'ক্রেতা'}</th>
                  <th className="py-3 px-4 text-right">{language === 'en' ? 'Total' : 'মোট'}</th>
                  <th className="py-3 px-4 text-right">{language === 'en' ? 'Paid' : 'আদায়'}</th>
                  <th className="py-3 px-4 text-right">{language === 'en' ? 'Due' : 'বাকি'}</th>
                  <th className="py-3 px-4 text-right print:hidden">{language === 'en' ? 'Action' : 'অ্যাকশন'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detailedItems.map((row) => {
                  if (row.kind === 'counter') {
                    const entry = row.entry;
                    const pm = PAYMENT_LABELS[entry.paymentMethod] || PAYMENT_LABELS.cash;
                    const profit = entry.costAmount ? entry.totalAmount - entry.costAmount : null;
                    return (
                      <tr key={`c-${entry.id}`} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono whitespace-nowrap">{toShopDigits(row.date, language)}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-md border text-[10px] font-bold ${pm.color}`}>
                            {language === 'en' ? pm.en : pm.bn}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            {entry.title}
                            {entry.quantity && entry.quantity > 1 ? ` × ${toShopDigits(entry.quantity, language)}` : ''}
                          </div>
                          {(entry.note || profit !== null) && (
                            <div className="text-[10px] text-slate-500">
                              {profit !== null && (
                                <span className="text-emerald-700 font-bold mr-2">
                                  {language === 'en' ? 'Profit:' : 'লাভ:'} {formatShopMoney(profit, language)}
                                </span>
                              )}
                              {entry.note}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{entry.customerName || '---'}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatShopMoney(entry.totalAmount, language)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatShopMoney(entry.paidAmount, language)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                          {formatShopMoney(entry.dueAmount, language)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap print:hidden">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(entry)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              title={language === 'en' ? 'Edit' : 'এডিট'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => data.deleteItem('dailySales', entry.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                              title={language === 'en' ? 'Delete' : 'মুছুন'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  if (row.kind === 'memo') {
                    return (
                      <tr key={`m-${row.id}`} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono whitespace-nowrap">{toShopDigits(row.date, language)}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-md border bg-slate-900 text-white text-[10px] font-bold">
                            {language === 'en' ? 'Cash Memo' : 'ক্যাশ মেমো'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 font-mono">{row.invoiceNumber}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">{row.itemsSummary}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">{row.customerName}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatShopMoney(row.totalAmount, language)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatShopMoney(row.paidAmount, language)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                          {formatShopMoney(row.dueAmount, language)}
                        </td>
                        <td className="py-3 px-4 text-right text-[10px] text-slate-400 print:hidden">
                          {language === 'en' ? 'Via Cash Memo' : 'ক্যাশ মেমো'}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={`r-${row.id}`} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono whitespace-nowrap">{toShopDigits(row.date, language)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md border bg-indigo-50 border-indigo-200 text-indigo-700 text-[10px] font-bold">
                          {language === 'en' ? 'Receipt' : 'মানি রিসিট'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono">{row.receiptNumber}</div>
                        <div className="text-[11px] text-slate-500">{row.purpose || row.paymentMethod}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{row.receivedFrom}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">---</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatShopMoney(row.amount, language)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">---</td>
                      <td className="py-3 px-4 text-right text-[10px] text-slate-400 print:hidden">
                        {language === 'en' ? 'Via Receipt' : 'মানি রিসিট'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Day-by-Day Sales History Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <h3 className="font-black text-sm text-slate-900">
              {language === 'en' ? 'Day-by-Day Sales Ledger' : 'তারিখ অনুযায়ী প্রতিদিনের বিক্রয় ইতিহাস'}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            {toShopDigits(dailyRows.length, language)} {language === 'en' ? 'active days' : 'দিনের হিসাব'}
          </span>
        </div>

        {dailyRows.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            {language === 'en'
              ? 'No daily sales history yet.'
              : 'এখনো কোনো দিনের বিক্রয়ের ইতিহাস তৈরি হয়নি।'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3 px-4">{language === 'en' ? 'Date' : 'তারিখ'}</th>
                  <th className="py-3 px-4">{language === 'en' ? 'Entries' : 'মেমো / এন্ট্রি'}</th>
                  <th className="py-3 px-4 text-right">{language === 'en' ? 'Total Sales' : 'মোট বিক্রি'}</th>
                  <th className="py-3 px-4 text-right">{language === 'en' ? 'Collected' : 'নগদ আদায়'}</th>
                  <th className="py-3 px-4 text-right">{language === 'en' ? 'Due' : 'বাকি'}</th>
                  <th className="py-3 px-4 text-right">{language === 'en' ? 'Expenses' : 'দৈনিক খরচ'}</th>
                  <th className="py-3 px-4 text-right">{language === 'en' ? 'Net Cash' : 'নিট ক্যাশ'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailyRows.map((d) => {
                  const net = d.totalCollected - d.totalExpense;
                  const isFocused = fromDate === d.date && toDate === d.date && preset !== 'all';
                  return (
                    <tr
                      key={d.date}
                      onClick={() => inspectSingleDay(d.date)}
                      className={`cursor-pointer transition ${
                        isFocused ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {toShopDigits(d.date, language)}
                        {d.date === today && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-sans font-extrabold">
                            {language === 'en' ? 'Today' : 'আজ'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {toShopDigits(d.memoCount, language)} {language === 'en' ? 'Memo' : 'মেমো'} •{' '}
                        {toShopDigits(d.counterCount, language)} {language === 'en' ? 'Counter' : 'কাউন্টার'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatShopMoney(d.totalSales, language)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatShopMoney(d.totalCollected, language)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        {formatShopMoney(d.totalDue, language)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                        {formatShopMoney(d.totalExpense, language)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-indigo-800">
                        {formatShopMoney(net, language)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
