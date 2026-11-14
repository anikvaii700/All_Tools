import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Edit2,
  Minus,
  Package,
  Plus,
  Receipt,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { getShopCategoryConfig } from '../shopCategoriesConfig';
import { formatShopMoney, SHOP_I18N, toShopDigits } from '../shopI18n';
import { ShopLanguage, ShopProduct, ShopProfile } from '../types';
import { ShopDataState } from '../useShopData';

interface ShopInventoryViewProps {
  profile: ShopProfile;
  data: ShopDataState;
  language: ShopLanguage;
  onShowToast: (msg: string, icon?: string) => void;
  onBillProduct?: (product: ShopProduct) => void;
}

export const ShopInventoryView: React.FC<ShopInventoryViewProps> = ({
  profile,
  data,
  language,
  onShowToast,
  onBillProduct,
}) => {
  const cat = getShopCategoryConfig(profile.shopCategory);
  const t = SHOP_I18N[language];
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const presetCats = language === 'en' ? cat.presetCategoriesEn : cat.presetCategoriesBn;

  const emptyForm = (): Omit<ShopProduct, 'id' | 'shopId' | 'ownerUid' | 'createdAt' | 'updatedAt'> => ({
    name: '',
    sku: '',
    category: presetCats[0] || '',
    brand: '',
    model: '',
    unit: cat.defaultUnits[0] || 'piece',
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 1,
    minStockAlert: 3,
    warranty: '',
    expiryDate: '',
    batchNumber: '',
    customFields: {},
    notes: '',
    isActive: true,
  });

  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setIsModalOpen(true);
  };

  const openEdit = (p: ShopProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      sku: p.sku || '',
      category: p.category || '',
      brand: p.brand || '',
      model: p.model || '',
      unit: p.unit || 'piece',
      purchasePrice: p.purchasePrice || 0,
      sellingPrice: p.sellingPrice || 0,
      stock: p.stock || 0,
      minStockAlert: p.minStockAlert ?? 3,
      warranty: p.warranty || '',
      expiryDate: p.expiryDate || '',
      batchNumber: p.batchNumber || '',
      customFields: { ...(p.customFields || {}) },
      notes: p.notes || '',
      isActive: p.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      onShowToast(language === 'en' ? 'Enter product name' : 'পণ্যের নাম লিখুন', '⚠️');
      return;
    }
    const now = new Date().toISOString();
    const id = editingId || `prd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const existing = editingId ? data.products.find((p) => p.id === editingId) : undefined;

    await data.upsertItem<ShopProduct>('products', {
      id,
      shopId: profile.shopId,
      ownerUid: profile.ownerUid,
      ...form,
      name: form.name.trim(),
      purchasePrice: Number(form.purchasePrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      stock: Math.max(0, Number(form.stock) || 0),
      minStockAlert: Math.max(0, Number(form.minStockAlert) || 0),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });

    setIsModalOpen(false);
    onShowToast(
      language === 'en' ? 'Product saved!' : 'পণ্য সফলভাবে সংরক্ষিত হয়েছে!',
      '✅'
    );
  };

  const adjustStock = async (p: ShopProduct, delta: number) => {
    const nextStock = Math.max(0, (p.stock || 0) + delta);
    await data.upsertItem<ShopProduct>('products', {
      ...p,
      stock: nextStock,
      updatedAt: new Date().toISOString(),
    });
  };

  const filteredProducts = useMemo(() => {
    return data.products.filter((p) => {
      const q = search.trim().toLowerCase();
      const customText = Object.values(p.customFields || {}).join(' ').toLowerCase();
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.model || '').toLowerCase().includes(q) ||
        customText.includes(q);
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchQ && matchCat;
    });
  }, [data.products, search, categoryFilter]);

  const totalStockValue = data.products.reduce(
    (sum, p) => sum + (p.purchasePrice || p.sellingPrice || 0) * (p.stock || 0),
    0
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900">
            {language === 'en' ? cat.terminology.inventoryTitleEn : cat.terminology.inventoryTitleBn}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {language === 'en' ? 'Total items:' : 'মোট পণ্য:'} {toShopDigits(data.products.length, language)} •{' '}
            {language === 'en' ? 'Stock value:' : 'মজুত মূল্য:'} {formatShopMoney(totalStockValue, language)}
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addProduct}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              cat.capabilities.supportsImeiOrSerial
                ? language === 'en'
                  ? 'Search name, brand, model, IMEI/Serial...'
                  : 'নাম, ব্র্যান্ড, মডেল বা IMEI/সিরিয়াল দিয়ে খুঁজুন...'
                : t.searchPlaceholder
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700"
        >
          <option value="all">{language === 'en' ? 'All Categories' : 'সকল ক্যাটাগরি'}</option>
          {presetCats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid / List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">{t.noDataYet}</p>
          <button
            type="button"
            onClick={openAdd}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
          >
            {t.addProduct}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const isLow = p.stock <= (p.minStockAlert ?? 3);
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500">
                        {p.category || (language === 'en' ? 'General' : 'সাধারণ')}
                        {p.brand ? ` • ${p.brand}` : ''}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{p.name}</h3>
                    </div>
                    {isLow && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{language === 'en' ? 'Low' : 'কম স্টক'}</span>
                      </span>
                    )}
                  </div>

                  {/* Category-specific fields summary */}
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    {p.model && (
                      <div>
                        <span className="font-bold">{language === 'en' ? 'Model:' : 'মডেল:'}</span> {p.model}
                      </div>
                    )}
                    {Object.entries(p.customFields || {})
                      .filter(([, val]) => Boolean(val))
                      .map(([k, val]) => {
                        const fieldDef = cat.customProductFields.find((f) => f.key === k);
                        return (
                          <div key={k}>
                            <span className="font-bold">
                              {fieldDef ? (language === 'en' ? fieldDef.labelEn : fieldDef.labelBn) : k}:
                            </span>{' '}
                            <span className="font-mono">{val}</span>
                          </div>
                        );
                      })}
                    {cat.capabilities.supportsWarranty && p.warranty && (
                      <div>
                        <span className="font-bold">{language === 'en' ? 'Warranty:' : 'ওয়ারেন্টি:'}</span> {p.warranty}
                      </div>
                    )}
                    {cat.capabilities.supportsExpiryAndBatch && (p.expiryDate || p.batchNumber) && (
                      <div className="text-rose-700 font-semibold">
                        {p.batchNumber ? `Batch: ${p.batchNumber} ` : ''}
                        {p.expiryDate ? `• Exp: ${p.expiryDate}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">
                        {language === 'en' ? 'Selling Price' : 'বিক্রয় মূল্য'}
                      </span>
                      <span className="text-sm font-black text-emerald-700 tabular-nums">
                        {formatShopMoney(p.sellingPrice, language)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustStock(p, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-[52px] text-center font-mono text-xs font-extrabold text-slate-900">
                        {toShopDigits(p.stock, language)} {p.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustStock(p, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {onBillProduct && (
                      <button
                        type="button"
                        onClick={() => onBillProduct(p)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>{language === 'en' ? 'Bill Item' : 'মেমোতে যোগ করুন'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title={language === 'en' ? 'Edit' : 'এডিট'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => data.deleteItem('products', p.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                      title={language === 'en' ? 'Delete' : 'মুছুন'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingId
                  ? language === 'en'
                    ? 'Edit Product'
                    : 'পণ্য আপডেট করুন'
                  : `${t.addProduct} (${language === 'en' ? cat.nameEn : cat.nameBn})`}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Product Name *' : 'পণ্যের নাম *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Category' : 'ক্যাটাগরি'}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  >
                    {presetCats.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Brand / Company' : 'ব্র্যান্ড / কোম্পানি'}
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Model / Code (SKU)' : 'মডেল / কোড'}
                  </label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Dynamic Shop-Type Custom Fields */}
              {cat.customProductFields.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    {language === 'en'
                      ? `${cat.nameEn} Specific Details`
                      : `${cat.nameBn} বিশেষ তথ্য`}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cat.customProductFields.map((field) => (
                      <div key={field.key}>
                        <label className="block font-bold text-slate-700 mb-1">
                          {language === 'en' ? field.labelEn : field.labelBn}
                        </label>
                        <input
                          type="text"
                          value={form.customFields[field.key] || ''}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              customFields: { ...f.customFields, [field.key]: e.target.value },
                            }))
                          }
                          placeholder={language === 'en' ? field.placeholderEn : field.placeholderBn}
                          className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Purchase Price' : 'ক্রয় মূল্য'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.purchasePrice}
                    onChange={(e) => setForm((f) => ({ ...f, purchasePrice: Number(e.target.value) || 0 }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Selling Price *' : 'বিক্রয় মূল্য *'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={form.sellingPrice}
                    onChange={(e) => setForm((f) => ({ ...f, sellingPrice: Number(e.target.value) || 0 }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Stock Qty' : 'স্টক পরিমাণ'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) || 0 }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Unit' : 'একক'}
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  >
                    {cat.defaultUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Warranty / Expiry Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cat.capabilities.supportsWarranty && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {language === 'en' ? 'Warranty Period' : 'ওয়ারেন্টি'}
                    </label>
                    <input
                      type="text"
                      value={form.warranty}
                      onChange={(e) => setForm((f) => ({ ...f, warranty: e.target.value }))}
                      placeholder={language === 'en' ? 'e.g. 1 Year' : 'যেমন: ১ বছর অফিশিয়াল'}
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                )}
                {cat.capabilities.supportsExpiryAndBatch && (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Batch Number' : 'ব্যাচ নম্বর'}
                      </label>
                      <input
                        type="text"
                        value={form.batchNumber}
                        onChange={(e) => setForm((f) => ({ ...f, batchNumber: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Expiry Date' : 'মেয়াদ উত্তীর্ণের তারিখ'}
                      </label>
                      <input
                        type="date"
                        value={form.expiryDate}
                        onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'en' ? 'Min Stock Alert' : 'স্টক সতর্কতা সীমা'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minStockAlert}
                    onChange={(e) => setForm((f) => ({ ...f, minStockAlert: Number(e.target.value) || 0 }))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
