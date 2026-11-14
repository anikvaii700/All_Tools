import React, { useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  Download,
  Plus,
  Trash2,
  Truck,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';
import { calculateInvoice } from '../../components/invoice/calculator';
import { getShopCategoryConfig } from '../shopCategoriesConfig';
import { formatShopMoney, toShopDigits } from '../shopI18n';
import {
  RepairStatus,
  ShopCustomer,
  ShopExpense,
  ShopLanguage,
  ShopProfile,
  ShopRepairTicket,
  ShopSupplier,
} from '../types';
import { ShopDataState } from '../useShopData';

export type LedgerSection = 'customers' | 'suppliers' | 'expenses' | 'repairs' | 'reports';

interface ShopLedgerViewProps {
  section: LedgerSection;
  profile: ShopProfile;
  data: ShopDataState;
  language: ShopLanguage;
  onShowToast: (msg: string, icon?: string) => void;
  onOpenDailySales?: () => void;
}

export const ShopLedgerView: React.FC<ShopLedgerViewProps> = ({
  section,
  profile,
  data,
  language,
  onShowToast,
  onOpenDailySales,
}) => {
  const cat = getShopCategoryConfig(profile.shopCategory);

  // Customer form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custDue, setCustDue] = useState('');

  // Supplier form
  const [supName, setSupName] = useState('');
  const [supCompany, setSupCompany] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supPayable, setSupPayable] = useState('');

  // Expense form
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('দোকান ভাড়া ও বিল');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Repair ticket form
  const [repCust, setRepCust] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repDevice, setRepDevice] = useState('');
  const [repSerial, setRepSerial] = useState('');
  const [repIssue, setRepIssue] = useState('');
  const [repEst, setRepEst] = useState('');
  const [repAdv, setRepAdv] = useState('');

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;
    const now = new Date().toISOString();
    await data.upsertItem<ShopCustomer>('customers', {
      id: `cust-${Date.now()}`,
      shopId: profile.shopId,
      ownerUid: profile.ownerUid,
      name: custName.trim(),
      companyName: '',
      phone: custPhone.trim(),
      email: '',
      address: custAddress.trim(),
      totalDue: Math.max(0, Number(custDue) || 0),
      createdAt: now,
      updatedAt: now,
    });
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustDue('');
    onShowToast(language === 'en' ? 'Customer saved!' : 'ক্রেতার তথ্য সংরক্ষিত হয়েছে!', '✅');
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;
    const now = new Date().toISOString();
    await data.upsertItem<ShopSupplier>('suppliers', {
      id: `sup-${Date.now()}`,
      shopId: profile.shopId,
      ownerUid: profile.ownerUid,
      name: supName.trim(),
      company: supCompany.trim(),
      phone: supPhone.trim(),
      address: '',
      totalPayable: Math.max(0, Number(supPayable) || 0),
      notes: '',
      createdAt: now,
      updatedAt: now,
    });
    setSupName('');
    setSupCompany('');
    setSupPhone('');
    setSupPayable('');
    onShowToast(language === 'en' ? 'Supplier added!' : 'সাপ্লায়ার সংরক্ষিত হয়েছে!', '✅');
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim()) return;
    const now = new Date().toISOString();
    await data.upsertItem<ShopExpense>('expenses', {
      id: `exp-${Date.now()}`,
      shopId: profile.shopId,
      ownerUid: profile.ownerUid,
      title: expTitle.trim(),
      category: expCategory,
      amount: Math.max(0, Number(expAmount) || 0),
      date: expDate,
      paymentMethod: 'cash',
      note: '',
      createdAt: now,
      updatedAt: now,
    });
    setExpTitle('');
    setExpAmount('');
    onShowToast(language === 'en' ? 'Expense recorded!' : 'খরচের হিসাব যোগ হয়েছে!', '✅');
  };

  const handleAddRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repCust.trim() || !repDevice.trim()) return;
    const now = new Date().toISOString();
    const ticketNum = `SRV-${String(data.repairs.length + 1).padStart(4, '0')}`;
    await data.upsertItem<ShopRepairTicket>('repairs', {
      id: `rep-${Date.now()}`,
      shopId: profile.shopId,
      ownerUid: profile.ownerUid,
      ticketNumber: ticketNum,
      customerName: repCust.trim(),
      customerPhone: repPhone.trim(),
      deviceName: repDevice.trim(),
      serialOrImei: repSerial.trim(),
      issueDescription: repIssue.trim(),
      estimatedCost: Math.max(0, Number(repEst) || 0),
      advancePaid: Math.max(0, Number(repAdv) || 0),
      status: 'pending',
      receivedDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      notes: '',
      createdAt: now,
      updatedAt: now,
    });
    setRepCust('');
    setRepPhone('');
    setRepDevice('');
    setRepSerial('');
    setRepIssue('');
    setRepEst('');
    setRepAdv('');
    onShowToast(language === 'en' ? `Ticket ${ticketNum} created!` : `সার্ভিস টিকিট ${ticketNum} তৈরি হয়েছে!`, '🛠️');
  };

  const handleExportCsvReport = () => {
    const rows: string[][] = [
      ['Type', 'Ref / Name', 'Date', 'Total / Amount', 'Paid', 'Due / Notes'],
      ...data.invoices.map((inv) => {
        const c = calculateInvoice(inv);
        return [
          'Cash Memo',
          `${inv.invoiceNumber} (${inv.customer.name || 'Customer'})`,
          inv.invoiceDate,
          String(c.grandTotal),
          String(c.paidAmount),
          String(c.dueAmount),
        ];
      }),
      ...data.dailySales.map((ds) => [
        'Counter Sale',
        ds.title,
        ds.date,
        String(ds.totalAmount),
        String(ds.paidAmount),
        String(ds.dueAmount),
      ]),
      ...data.expenses.map((exp) => [
        'Expense',
        exp.title,
        exp.date,
        String(exp.amount),
        '0',
        exp.category,
      ]),
    ];

    const csv = '\uFEFF' + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(profile.shopName || 'shop').replace(/\s+/g, '_')}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(language === 'en' ? 'CSV Report downloaded!' : 'রিপোর্ট CSV ডাউনলোড হয়েছে!', '📄');
  };

  /* -------------------- CUSTOMERS -------------------- */
  if (section === 'customers') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <h2 className="font-black text-base text-slate-900">
              {language === 'en' ? 'Customers & Due Ledger' : 'ক্রেতা তালিকা ও বাকি খাতা'}
            </h2>
          </div>

          <form onSubmit={handleAddCustomer} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
            <input
              type="text"
              required
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder={language === 'en' ? 'Customer name *' : 'ক্রেতার নাম *'}
              className="p-2.5 rounded-xl border border-slate-300 font-semibold"
            />
            <input
              type="tel"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              placeholder={language === 'en' ? 'Mobile number' : 'মোবাইল নম্বর'}
              className="p-2.5 rounded-xl border border-slate-300 font-mono"
            />
            <input
              type="text"
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              placeholder={language === 'en' ? 'Address' : 'ঠিকানা'}
              className="p-2.5 rounded-xl border border-slate-300"
            />
            <input
              type="number"
              min="0"
              value={custDue}
              onChange={(e) => setCustDue(e.target.value)}
              placeholder={language === 'en' ? 'Previous Due (৳)' : 'পূর্বের বকেয়া (৳)'}
              className="p-2.5 rounded-xl border border-slate-300 font-mono"
            />
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'en' ? 'Add' : 'যুক্ত করুন'}</span>
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          {data.customers.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              {language === 'en' ? 'No customers recorded yet.' : 'এখনো কোনো ক্রেতা যুক্ত করা হয়নি।'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.customers.map((c) => {
                const invoiceDue = data.invoices
                  .filter(
                    (inv) =>
                      (inv.customer.phone && c.phone && inv.customer.phone === c.phone) ||
                      inv.customer.name.toLowerCase() === c.name.toLowerCase()
                  )
                  .reduce((sum, inv) => sum + calculateInvoice(inv).dueAmount, 0);

                return (
                  <div key={c.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">{c.name}</div>
                      <div className="text-slate-500 font-mono">
                        {c.phone || '---'} {c.address ? `• ${c.address}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">
                          {language === 'en' ? 'Total Due' : 'মোট বকেয়া'}
                        </span>
                        <span className="font-mono font-black text-rose-700">
                          {formatShopMoney((c.totalDue || 0) + invoiceDue, language)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => data.deleteItem('customers', c.id)}
                        className="p-2 rounded-lg bg-rose-50 text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* -------------------- SUPPLIERS -------------------- */
  if (section === 'suppliers') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-700" />
            <h2 className="font-black text-base text-slate-900">
              {language === 'en' ? 'Suppliers & Payables' : 'পাইকার / সাপ্লায়ার ও পাওনা'}
            </h2>
          </div>

          <form onSubmit={handleAddSupplier} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
            <input
              type="text"
              required
              value={supName}
              onChange={(e) => setSupName(e.target.value)}
              placeholder={language === 'en' ? 'Supplier name *' : 'সাপ্লায়ারের নাম *'}
              className="p-2.5 rounded-xl border border-slate-300 font-semibold"
            />
            <input
              type="text"
              value={supCompany}
              onChange={(e) => setSupCompany(e.target.value)}
              placeholder={language === 'en' ? 'Company' : 'কোম্পানি / বাজার'}
              className="p-2.5 rounded-xl border border-slate-300"
            />
            <input
              type="tel"
              value={supPhone}
              onChange={(e) => setSupPhone(e.target.value)}
              placeholder={language === 'en' ? 'Mobile' : 'মোবাইল নম্বর'}
              className="p-2.5 rounded-xl border border-slate-300 font-mono"
            />
            <input
              type="number"
              min="0"
              value={supPayable}
              onChange={(e) => setSupPayable(e.target.value)}
              placeholder={language === 'en' ? 'Payable (৳)' : 'দেনা / বাকি (৳)'}
              className="p-2.5 rounded-xl border border-slate-300 font-mono"
            />
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'en' ? 'Add' : 'যুক্ত করুন'}</span>
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          {data.suppliers.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              {language === 'en' ? 'No suppliers added yet.' : 'এখনো কোনো সাপ্লায়ার যুক্ত করা হয়নি।'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.suppliers.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{s.name}</div>
                    <div className="text-slate-500">
                      {s.company || '---'} • <span className="font-mono">{s.phone || '---'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-amber-800">
                      {formatShopMoney(s.totalPayable || 0, language)}
                    </span>
                    <button
                      type="button"
                      onClick={() => data.deleteItem('suppliers', s.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* -------------------- EXPENSES -------------------- */
  if (section === 'expenses') {
    const totalExp = data.expenses.reduce((s, e) => s + (e.amount || 0), 0);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-rose-700" />
              <h2 className="font-black text-base text-slate-900">
                {language === 'en' ? 'Daily Shop Expenses' : 'দৈনিক খরচ ও হিশাব'}
              </h2>
            </div>
            <span className="font-mono font-black text-sm text-rose-700">
              {language === 'en' ? 'Total:' : 'মোট খরচ:'} {formatShopMoney(totalExp, language)}
            </span>
          </div>

          <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
            <input
              type="text"
              required
              value={expTitle}
              onChange={(e) => setExpTitle(e.target.value)}
              placeholder={language === 'en' ? 'Expense title *' : 'খরচের বিবরণ *'}
              className="p-2.5 rounded-xl border border-slate-300 font-semibold"
            />
            <select
              value={expCategory}
              onChange={(e) => setExpCategory(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-300 font-semibold"
            >
              <option value="দোকান ভাড়া ও বিল">দোকান ভাড়া ও বিল</option>
              <option value="কর্মচারী বেতন">কর্মচারী বেতন</option>
              <option value="মালামাল ক্রয়">মালামাল ক্রয়</option>
              <option value="পরিবহন ও যাতায়াত">পরিবহন ও যাতায়াত</option>
              <option value="আপ্যায়ন ও অন্যান্য">আপ্যায়ন ও অন্যান্য</option>
            </select>
            <input
              type="number"
              required
              min="0"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              placeholder={language === 'en' ? 'Amount (৳) *' : 'টাকা (৳) *'}
              className="p-2.5 rounded-xl border border-slate-300 font-mono"
            />
            <input
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-300 font-mono"
            />
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'en' ? 'Record' : 'খরচ যোগ'}</span>
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          {data.expenses.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              {language === 'en' ? 'No expenses recorded yet.' : 'এখনো কোনো খরচ যুক্ত করা হয়নি।'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.expenses.map((ex) => (
                <div key={ex.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">{ex.title}</div>
                    <div className="text-slate-500">
                      {ex.category} • <span className="font-mono">{ex.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-rose-700">
                      {formatShopMoney(ex.amount, language)}
                    </span>
                    <button
                      type="button"
                      onClick={() => data.deleteItem('expenses', ex.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* -------------------- REPAIRS / SERVICING -------------------- */
  if (section === 'repairs') {
    const statuses: Array<{ id: RepairStatus; bn: string; en: string }> = [
      { id: 'pending', bn: 'অপেক্ষমাণ', en: 'Pending' },
      { id: 'in_progress', bn: 'কাজ চলছে', en: 'In Progress' },
      { id: 'ready', bn: 'ডেলিভারির জন্য প্রস্তুত', en: 'Ready' },
      { id: 'delivered', bn: 'ডেলিভারি সম্পন্ন', en: 'Delivered' },
      { id: 'cancelled', bn: 'বাতিল', en: 'Cancelled' },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-700" />
            <h2 className="font-black text-base text-slate-900">
              {language === 'en' ? cat.terminology.serviceTitleEn : cat.terminology.serviceTitleBn}
            </h2>
          </div>

          <form onSubmit={handleAddRepair} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <input
              type="text"
              required
              value={repCust}
              onChange={(e) => setRepCust(e.target.value)}
              placeholder={language === 'en' ? 'Customer name *' : 'গ্রাহকের নাম *'}
              className="p-2.5 rounded-xl border border-slate-300 font-semibold"
            />
            <input
              type="tel"
              value={repPhone}
              onChange={(e) => setRepPhone(e.target.value)}
              placeholder={language === 'en' ? 'Customer mobile' : 'গ্রাহকের মোবাইল'}
              className="p-2.5 rounded-xl border border-slate-300 font-mono"
            />
            <input
              type="text"
              required
              value={repDevice}
              onChange={(e) => setRepDevice(e.target.value)}
              placeholder={language === 'en' ? 'Device / Model *' : 'ডিভাইস / মডেলের নাম *'}
              className="p-2.5 rounded-xl border border-slate-300 font-semibold"
            />
            <input
              type="text"
              value={repSerial}
              onChange={(e) => setRepSerial(e.target.value)}
              placeholder={language === 'en' ? 'IMEI / Serial Number' : 'IMEI / সিরিয়াল নম্বর'}
              className="p-2.5 rounded-xl border border-slate-300 font-mono"
            />
            <input
              type="text"
              value={repIssue}
              onChange={(e) => setRepIssue(e.target.value)}
              placeholder={language === 'en' ? 'Issue / Service note' : 'সমস্যার বিবরণ'}
              className="p-2.5 rounded-xl border border-slate-300"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="0"
                value={repEst}
                onChange={(e) => setRepEst(e.target.value)}
                placeholder={language === 'en' ? 'Bill ৳' : 'বিল ৳'}
                className="p-2.5 rounded-xl border border-slate-300 font-mono"
              />
              <input
                type="number"
                min="0"
                value={repAdv}
                onChange={(e) => setRepAdv(e.target.value)}
                placeholder={language === 'en' ? 'Adv ৳' : 'জমা ৳'}
                className="p-2.5 rounded-xl border border-slate-300 font-mono"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
              >
                {language === 'en' ? 'Create' : 'টিকিট'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          {data.repairs.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              {language === 'en' ? 'No service/repair tickets yet.' : 'এখনো কোনো সার্ভিসিং টিকিট তৈরি করা হয়নি।'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.repairs.map((r) => (
                <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-emerald-700">{r.ticketNumber}</span>
                      <span className="font-extrabold text-sm text-slate-900">{r.deviceName}</span>
                    </div>
                    <div className="text-slate-600 mt-0.5">
                      {r.customerName} {r.customerPhone ? `(${r.customerPhone})` : ''}
                      {r.serialOrImei ? ` • S/N: ${r.serialOrImei}` : ''}
                    </div>
                    {r.issueDescription && <div className="text-slate-500 mt-0.5">{r.issueDescription}</div>}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right mr-1 font-mono">
                      <div className="font-bold text-slate-900">{formatShopMoney(r.estimatedCost, language)}</div>
                      <div className="text-[10px] text-slate-500">
                        {language === 'en' ? 'Adv:' : 'জমা:'} {formatShopMoney(r.advancePaid, language)}
                      </div>
                    </div>

                    <select
                      value={r.status}
                      onChange={(e) =>
                        data.upsertItem<ShopRepairTicket>('repairs', {
                          ...r,
                          status: e.target.value as RepairStatus,
                        })
                      }
                      className="p-2 rounded-xl border border-slate-300 font-bold text-xs bg-slate-50"
                    >
                      {statuses.map((st) => (
                        <option key={st.id} value={st.id}>
                          {language === 'en' ? st.en : st.bn}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => data.deleteItem('repairs', r.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* -------------------- REPORTS -------------------- */
  const memoSales = data.invoices.reduce((acc, inv) => acc + calculateInvoice(inv).grandTotal, 0);
  const memoCollected = data.invoices.reduce((acc, inv) => acc + calculateInvoice(inv).paidAmount, 0);
  const memoDue = data.invoices.reduce((acc, inv) => acc + calculateInvoice(inv).dueAmount, 0);
  const counterSales = data.dailySales.reduce((acc, ds) => acc + (ds.totalAmount || 0), 0);
  const counterCollected = data.dailySales.reduce((acc, ds) => acc + (ds.paidAmount || 0), 0);
  const counterDue = data.dailySales.reduce((acc, ds) => acc + (ds.dueAmount || 0), 0);
  const totalSales = memoSales + counterSales;
  const totalCollected = memoCollected + counterCollected;
  const totalDue = memoDue + counterDue;
  const totalExp = data.expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const netCash = totalCollected - totalExp;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-emerald-700" />
          <div>
            <h2 className="font-black text-base text-slate-900">
              {language === 'en' ? 'Shop Financial Summary & Reports' : 'দোকানের আর্থিক হিসাব ও সামারি রিপোর্ট'}
            </h2>
            <p className="text-xs text-slate-500">
              {profile.shopName} • {toShopDigits(data.invoices.length, language)}{' '}
              {language === 'en' ? 'Cash Memos' : 'টি ক্যাশ মেমো'} •{' '}
              {toShopDigits(data.dailySales.length, language)}{' '}
              {language === 'en' ? 'Counter Sales' : 'টি কাউন্টার বিক্রি'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenDailySales && (
            <button
              type="button"
              onClick={onOpenDailySales}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarDays className="w-4 h-4" />
              <span>{language === 'en' ? 'Daily Sales Report' : 'প্রতিদিনের বিক্রয় রিপোর্ট'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportCsvReport}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'en' ? 'Export CSV Report' : 'CSV রিপোর্ট ডাউনলোড'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500">{language === 'en' ? 'Total Billed' : 'মোট বিক্রি'}</div>
          <div className="text-lg font-black text-slate-900 mt-1 tabular-nums">{formatShopMoney(totalSales, language)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-emerald-700">{language === 'en' ? 'Total Collected' : 'নগদ আদায়'}</div>
          <div className="text-lg font-black text-emerald-700 mt-1 tabular-nums">{formatShopMoney(totalCollected, language)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-rose-700">{language === 'en' ? 'Customer Due' : 'মোট বকেয়া'}</div>
          <div className="text-lg font-black text-rose-700 mt-1 tabular-nums">{formatShopMoney(totalDue, language)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-amber-700">{language === 'en' ? 'Total Expenses' : 'মোট খরচ'}</div>
          <div className="text-lg font-black text-amber-700 mt-1 tabular-nums">{formatShopMoney(totalExp, language)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <div className="text-[11px] font-bold text-indigo-700">{language === 'en' ? 'Net Cash Flow' : 'নিট নগদ স্থিতি'}</div>
          <div className="text-lg font-black text-indigo-800 mt-1 tabular-nums">{formatShopMoney(netCash, language)}</div>
        </div>
      </div>
    </div>
  );
};
