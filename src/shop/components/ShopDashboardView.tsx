import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CreditCard,
  Download,
  Edit3,
  Eye,
  Package,
  Plus,
  Receipt,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import { calculateInvoice } from '../../components/invoice/calculator';
import { getShopCategoryConfig } from '../shopCategoriesConfig';
import { formatShopMoney, toShopDigits } from '../shopI18n';
import { ShopAssetsMap, ShopLanguage, ShopProfile } from '../types';
import { ShopDataState } from '../useShopData';
import { ShopCategoryIcon } from './ShopCategoryIcon';

interface ShopDashboardViewProps {
  profile: ShopProfile;
  assets: ShopAssetsMap;
  data: ShopDataState;
  language: ShopLanguage;
  onNavigateTab: (tab: string) => void;
  onOpenVisitingCardModal: () => void;
}

export const ShopDashboardView: React.FC<ShopDashboardViewProps> = ({
  profile,
  assets,
  data,
  language,
  onNavigateTab,
  onOpenVisitingCardModal,
}) => {
  const cat = getShopCategoryConfig(profile.shopCategory);
  const accent = profile.brandColor || cat.accentColor;
  const [viewCardFull, setViewCardFull] = useState(false);

  const nowDate = new Date();
  const today = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}-${String(
    nowDate.getDate()
  ).padStart(2, '0')}`;

  const memoSales = data.invoices.reduce((acc, inv) => acc + calculateInvoice(inv).grandTotal, 0);
  const memoCollected = data.invoices.reduce((acc, inv) => acc + calculateInvoice(inv).paidAmount, 0);
  const memoDue = data.invoices.reduce((acc, inv) => acc + calculateInvoice(inv).dueAmount, 0);

  const counterSales = data.dailySales.reduce((acc, ds) => acc + (ds.totalAmount || 0), 0);
  const counterCollected = data.dailySales.reduce((acc, ds) => acc + (ds.paidAmount || 0), 0);
  const counterDue = data.dailySales.reduce((acc, ds) => acc + (ds.dueAmount || 0), 0);

  const totalSales = memoSales + counterSales;
  const totalCollected = memoCollected + counterCollected;
  const totalDue = memoDue + counterDue;
  const totalExpenses = data.expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const todayMemoSales = data.invoices
    .filter((inv) => inv.invoiceDate === today)
    .reduce((acc, inv) => acc + calculateInvoice(inv).grandTotal, 0);
  const todayCounterSales = data.dailySales
    .filter((ds) => ds.date === today)
    .reduce((acc, ds) => acc + (ds.totalAmount || 0), 0);
  const todaySales = todayMemoSales + todayCounterSales;

  const lowStockItems = data.products.filter((p) => p.stock <= (p.minStockAlert ?? 3));

  const soonExpiringItems = cat.capabilities.supportsExpiryAndBatch
    ? data.products.filter((p) => {
        if (!p.expiryDate) return false;
        const diffDays = (Date.parse(p.expiryDate) - Date.now()) / 86400000;
        return diffDays <= 30;
      })
    : [];

  const activeRepairs = cat.capabilities.supportsRepairs
    ? data.repairs.filter((r) => r.status === 'pending' || r.status === 'in_progress' || r.status === 'ready')
    : [];

  const handleDownloadCard = () => {
    if (!assets.visitingCardDataUrl) return;
    const link = document.createElement('a');
    link.href = assets.visitingCardDataUrl;
    link.download = `${(profile.shopName || 'shop').replace(/\s+/g, '_')}_visiting_card.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Branded Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          {assets.logoDataUrl ? (
            <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
              <img src={assets.logoDataUrl} alt={profile.shopName} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0"
              style={{ backgroundColor: accent }}
            >
              {(profile.shopName || 'S').charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">{profile.shopName}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold">
                <ShopCategoryIcon iconName={cat.iconName} className="w-3 h-3" />
                <span>{language === 'en' ? cat.nameEn : cat.nameBn}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {profile.ownerName} • <span className="font-mono">{profile.phone}</span>
              {profile.address ? ` • ${profile.address}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('cash-memo')}
            className="px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition hover:opacity-95"
            style={{ backgroundColor: accent }}
          >
            <Receipt className="w-4 h-4" />
            <span>{language === 'en' ? 'New Cash Memo' : 'নতুন ক্যাশ মেমো'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('daily-sales')}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            <span>{language === 'en' ? 'Daily Sales' : 'প্রতিদিনের বিক্রয় রিপোর্ট'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('inventory')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'en' ? 'Add Product' : 'পণ্য যোগ করুন'}</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('daily-sales')}
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{language === 'en' ? 'Total Billed Sales' : 'সর্বমোট বিক্রি (বিল)'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {formatShopMoney(totalSales, language)}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1 tabular-nums flex items-center justify-between">
            <span>{language === 'en' ? 'Today:' : 'আজকের বিক্রি:'} {formatShopMoney(todaySales, language)}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{language === 'en' ? 'Collected vs Due' : 'নগদ আদায় ও বকেয়া'}</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-2 tabular-nums">
            {formatShopMoney(totalCollected, language)}
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-1 tabular-nums">
            {language === 'en' ? 'Due:' : 'মোট বকেয়া:'} {formatShopMoney(totalDue, language)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>{language === 'en' ? cat.terminology.inventoryTitleEn : cat.terminology.inventoryTitleBn}</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tabular-nums">
            {toShopDigits(data.products.length, language)}
          </div>
          <div className="text-[11px] text-amber-700 font-bold mt-1 tabular-nums">
            {language === 'en' ? 'Low stock:' : 'কম স্টক:'} {toShopDigits(lowStockItems.length, language)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              {cat.capabilities.supportsRepairs
                ? language === 'en'
                  ? 'Active Repairs'
                  : 'চলমান সার্ভিসিং'
                : language === 'en'
                ? 'Expenses & Customers'
                : 'মোট খরচ ও ক্রেতা'}
            </span>
            {cat.capabilities.supportsRepairs ? (
              <Wrench className="w-4 h-4 text-amber-600" />
            ) : (
              <Users className="w-4 h-4 text-slate-600" />
            )}
          </div>
          {cat.capabilities.supportsRepairs ? (
            <>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tabular-nums">
                {toShopDigits(activeRepairs.length, language)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                {language === 'en' ? 'Expenses:' : 'মোট খরচ:'} {formatShopMoney(totalExpenses, language)}
              </div>
            </>
          ) : (
            <>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tabular-nums">
                {formatShopMoney(totalExpenses, language)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                {language === 'en' ? 'Customers:' : 'মোট ক্রেতা:'} {toShopDigits(data.customers.length, language)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Visiting Card Widget & Shop Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visiting Card Display */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <h3 className="font-extrabold text-sm text-slate-900">
                {language === 'en' ? 'Shop Visiting Card' : 'দোকানের ডিজিটাল ভিজিটিং কার্ড'}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              {assets.visitingCardDataUrl && (
                <>
                  <button
                    type="button"
                    onClick={() => setViewCardFull(true)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    title={language === 'en' ? 'View Full' : 'বড় করে দেখুন'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCard}
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer"
                    title={language === 'en' ? 'Download PNG' : 'ডাউনলোড করুন'}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onOpenVisitingCardModal}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>{assets.visitingCardDataUrl ? (language === 'en' ? 'Edit' : 'পরিবর্তন') : (language === 'en' ? 'Add Card' : 'কার্ড যুক্ত করুন')}</span>
              </button>
            </div>
          </div>

          {assets.visitingCardDataUrl ? (
            <div
              onClick={() => setViewCardFull(true)}
              className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer hover:opacity-95 transition"
            >
              <img
                src={assets.visitingCardDataUrl}
                alt={`${profile.shopName} Visiting Card`}
                className="w-full max-h-56 object-contain mx-auto"
              />
            </div>
          ) : (
            <div className="h-44 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-2">
              <p className="text-xs text-slate-500">
                {language === 'en'
                  ? 'No visiting card attached yet. Upload one or generate from your shop profile in 1 click.'
                  : 'এখনো কোনো ভিজিটিং কার্ড যুক্ত করা হয়নি। ১ ক্লিকে আপনার দোকানের কার্ড তৈরি বা আপলোড করুন।'}
              </p>
              <button
                type="button"
                onClick={onOpenVisitingCardModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
              >
                {language === 'en' ? 'Create / Upload Card' : 'কার্ড তৈরি বা আপলোড করুন'}
              </button>
            </div>
          )}
        </div>

        {/* Category-Specific Alerts & Quick Links */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{language === 'en' ? 'Smart Shop Alerts' : 'দোকানের গুরুত্বপূর্ণ সতর্কতা'}</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'en' ? 'Manage Stock' : 'স্টক দেখুন'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-extrabold text-slate-900">{item.name}</span>
                  <span className="text-amber-800 block text-[11px]">
                    {language === 'en' ? 'Low Stock Alert' : 'স্টক কমে গেছে'}
                  </span>
                </div>
                <span className="font-mono font-black text-amber-900">
                  {toShopDigits(item.stock, language)} {item.unit}
                </span>
              </div>
            ))}

            {soonExpiringItems.map((item) => (
              <div
                key={`exp-${item.id}`}
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-extrabold text-slate-900">{item.name}</span>
                  <span className="text-rose-700 block text-[11px]">
                    {language === 'en' ? 'Expiry Date Alert' : 'মেয়াদ শেষের দিকে'}
                  </span>
                </div>
                <span className="font-mono font-bold text-rose-800">{item.expiryDate}</span>
              </div>
            ))}

            {lowStockItems.length === 0 && soonExpiringItems.length === 0 && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                {data.products.length === 0
                  ? language === 'en'
                    ? 'Add your first product in Inventory to track stock & alerts.'
                    : 'স্টক ও সতর্কতা দেখতে পণ্যের তালিকায় আপনার প্রথম পণ্য যুক্ত করুন।'
                  : language === 'en'
                  ? 'All stock levels & dates look healthy.'
                  : 'সকল পণ্যের স্টক ও মেয়াদ স্বাভাবিক অবস্থায় রয়েছে।'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Visiting Card Preview Modal */}
      {viewCardFull && assets.visitingCardDataUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">{profile.shopName} — Visiting Card</h3>
              <button
                type="button"
                onClick={() => setViewCardFull(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={assets.visitingCardDataUrl}
              alt="Visiting Card Full"
              className="w-full rounded-2xl border border-slate-200"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDownloadCard}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'en' ? 'Download PNG' : 'PNG ডাউনলোড'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
