import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  CreditCard,
  Download,
  Globe,
  KeyRound,
  LogOut,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { SHOP_CATEGORIES, getShopCategoryConfig } from '../shopCategoriesConfig';
import { processShopImageUpload } from '../shopImageUtils';
import { useShopAuth } from '../ShopAuthContext';
import { ShopCategoryId, ShopLanguage, ShopProfile } from '../types';
import { ShopCategoryIcon } from './ShopCategoryIcon';

interface ShopSettingsViewProps {
  profile: ShopProfile;
  language: ShopLanguage;
  onShowToast: (msg: string, icon?: string) => void;
  onOpenVisitingCardModal: () => void;
}

export const ShopSettingsView: React.FC<ShopSettingsViewProps> = ({
  profile,
  language,
  onShowToast,
  onOpenVisitingCardModal,
}) => {
  const {
    shopAssets,
    updateShopProfile,
    switchShopCategory,
    saveShopAsset,
    removeShopAsset,
    changeShopPassword,
    setLanguage,
    triggerSplashPreview,
    logoutShop,
  } = useShopAuth();

  const { isInstalled, isInstallable, install } = usePWAInstall();

  const [form, setForm] = useState({
    shopName: profile.shopName || '',
    tagline: profile.tagline || '',
    ownerName: profile.ownerName || '',
    phone: profile.phone || '',
    email: profile.email || '',
    website: profile.website || '',
    address: profile.address || '',
    tradeLicense: profile.tradeLicense || '',
    binVatNumber: profile.binVatNumber || '',
    bkashNumber: profile.bkashNumber || '',
    nagadNumber: profile.nagadNumber || '',
    bankName: profile.bankName || '',
    bankAccountNumber: profile.bankAccountNumber || '',
    religiousHeader: profile.religiousHeader || 'বিসমিল্লাহির রাহমানির রাহিম',
    defaultInvoiceFooter: profile.defaultInvoiceFooter || '',
    brandColor: profile.brandColor || '#059669',
  });

  const [saving, setSaving] = useState(false);
  const [selectedNewCat, setSelectedNewCat] = useState<ShopCategoryId>(profile.shopCategory);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const activeCategory = getShopCategoryConfig(profile.shopCategory);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateShopProfile(form);
      onShowToast(language === 'en' ? 'Shop settings saved!' : 'দোকানের তথ্য সফলভাবে সংরক্ষিত হয়েছে!', '✅');
    } catch (err: any) {
      onShowToast(err?.message || 'সংরক্ষণ ব্যর্থ হয়েছে', '⚠️');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { dataUrl, mimeType } = await processShopImageUpload(file, 'logo');
      await saveShopAsset('branding_logo', 'logo', mimeType, dataUrl);
      onShowToast(language === 'en' ? 'Shop logo updated!' : 'দোকানের লোগো আপডেট হয়েছে!', '🖼️');
    } catch (err: any) {
      onShowToast(err?.message || 'লোগো আপলোড ব্যর্থ হয়েছে', '⚠️');
    }
  };

  const handleSwitchCategory = async () => {
    if (selectedNewCat === profile.shopCategory) return;
    try {
      await switchShopCategory(selectedNewCat);
      onShowToast(
        language === 'en'
          ? 'Shop category updated cleanly!'
          : 'দোকানের ধরন সফলভাবে পরিবর্তন হয়েছে! সকল পণ্য ও নথি সুরক্ষিত আছে।',
        '✨'
      );
    } catch (err: any) {
      onShowToast(err?.message || 'পরিবর্তন করা যায়নি', '⚠️');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    try {
      await changeShopPassword(currentPass, newPass);
      setCurrentPass('');
      setNewPass('');
      setPassMsg(language === 'en' ? 'Password updated!' : 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
    } catch (err: any) {
      setPassMsg(err?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Branding: Logo & Visiting Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Logo Manager */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">
            {language === 'en' ? 'Shop Logo' : 'দোকানের লোগো'}
          </h3>
          <div className="flex items-center gap-4">
            {shopAssets.logoDataUrl ? (
              <img
                src={shopAssets.logoDataUrl}
                alt={profile.shopName}
                className="w-20 h-20 rounded-2xl object-contain border border-slate-200 bg-white p-1"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black"
                style={{ backgroundColor: profile.brandColor || '#059669' }}
              >
                {(profile.shopName || 'S').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-2 flex-1">
              <label className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{shopAssets.logoDataUrl ? (language === 'en' ? 'Replace Logo' : 'লোগো পরিবর্তন') : (language === 'en' ? 'Upload Logo' : 'লোগো আপলোড')}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
              {shopAssets.logoDataUrl && (
                <button
                  type="button"
                  onClick={() => removeShopAsset('branding_logo')}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Remove Logo' : 'লোগো মুছুন'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Visiting Card Manager */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              {language === 'en' ? 'Visiting Card' : 'ভিজিটিং কার্ড'}
            </h3>
            <button
              type="button"
              onClick={triggerSplashPreview}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>{language === 'en' ? 'Preview Splash' : 'স্প্ল্যাশ স্ক্রিন দেখুন'}</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            {shopAssets.visitingCardDataUrl ? (
              <img
                src={shopAssets.visitingCardDataUrl}
                alt="Visiting Card"
                className="w-32 h-20 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-32 h-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[11px] text-slate-400">
                No Card
              </div>
            )}
            <div className="flex-1 space-y-2">
              <button
                type="button"
                onClick={onOpenVisitingCardModal}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{shopAssets.visitingCardDataUrl ? (language === 'en' ? 'Edit / Replace Card' : 'কার্ড পরিবর্তন বা তৈরি') : (language === 'en' ? 'Add Card' : 'কার্ড যোগ করুন')}</span>
              </button>
              {shopAssets.visitingCardDataUrl && (
                <button
                  type="button"
                  onClick={() => removeShopAsset('branding_card')}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Remove Card' : 'কার্ড মুছুন'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shop Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900">
            {language === 'en' ? 'Shop Information & Cash Memo Auto-Fill' : 'দোকানের তথ্য (ক্যাশ মেমোতে অটো ব্যবহৃত হবে)'}
          </h3>
          <button
            type="button"
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">{language === 'en' ? 'Shop Name' : 'দোকানের নাম'}</label>
            <input
              type="text"
              required
              value={form.shopName}
              onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">{language === 'en' ? 'Owner Name' : 'মালিকের নাম'}</label>
            <input
              type="text"
              required
              value={form.ownerName}
              onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">{language === 'en' ? 'Phone' : 'মোবাইল নম্বর'}</label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">{language === 'en' ? 'Tagline' : 'স্লোগান / বিবরণ'}</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">{language === 'en' ? 'Address' : 'ঠিকানা'}</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">bKash</label>
            <input
              type="text"
              value={form.bkashNumber}
              onChange={(e) => setForm((f) => ({ ...f, bkashNumber: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nagad</label>
            <input
              type="text"
              value={form.nagadNumber}
              onChange={(e) => setForm((f) => ({ ...f, nagadNumber: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">{language === 'en' ? 'Religious Header' : 'মেমোর উপরের দোয়া / শিরোনাম'}</label>
            <input
              type="text"
              value={form.religiousHeader}
              onChange={(e) => setForm((f) => ({ ...f, religiousHeader: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">{language === 'en' ? 'Email' : 'ইমেইল'}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? '...' : language === 'en' ? 'Save Profile Changes' : 'তথ্য সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>

      {/* Shop Category Switcher */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 text-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              {language === 'en' ? 'Change Shop Category' : 'দোকানের ক্যাটাগরি পরিবর্তন করুন'}
            </h3>
            <p className="text-slate-500 mt-0.5">
              {language === 'en'
                ? 'Active Category: '
                : 'বর্তমান ক্যাটাগরি: '}
              <strong className="text-emerald-700">
                {language === 'en' ? activeCategory.nameEn : activeCategory.nameBn}
              </strong>
              {' — '}
              {language === 'en'
                ? 'Existing products, invoices & customers remain preserved.'
                : 'পরিবর্তন করলেও আপনার পূর্বের সকল পণ্য, মেমো ও ক্রেতার ডাটা অক্ষত থাকবে।'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {SHOP_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedNewCat(c.id)}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition ${
                selectedNewCat === c.id
                  ? 'border-emerald-600 bg-emerald-50 font-extrabold text-emerald-900'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 font-semibold'
              }`}
            >
              <ShopCategoryIcon iconName={c.iconName} className="w-4 h-4 shrink-0" />
              <span className="truncate">{language === 'en' ? c.nameEn : c.nameBn}</span>
            </button>
          ))}
        </div>

        {selectedNewCat !== profile.shopCategory && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {selectedNewCat === 'mobile-shop'
                  ? language === 'en'
                    ? 'Switching to Mobile Shop enables the classic Mobile Shop default interface.'
                    : 'মোবাইল শপে পরিবর্তন করলে ক্লাসিক মোবাইল শপ ক্যাশ মেমো ইন্টারফেস চালু হবে।'
                  : language === 'en'
                  ? 'Dashboard & product custom fields will adapt to the newly selected shop type.'
                  : 'নতুন ক্যাটাগরি অনুযায়ী ড্যাশবোর্ড ও পণ্যের ধরন আপডেট হবে।'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSwitchCategory}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Confirm Switch' : 'পরিবর্তন নিশ্চিত করুন'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Password & App Install / Logout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        <form onSubmit={handleChangePassword} className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
            <KeyRound className="w-4 h-4 text-slate-700" />
            <span>{language === 'en' ? 'Change Password' : 'পাসওয়ার্ড পরিবর্তন করুন'}</span>
          </div>
          <input
            type="password"
            required
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            placeholder={language === 'en' ? 'Current password' : 'বর্তমান পাসওয়ার্ড'}
            className="w-full p-2.5 rounded-xl border border-slate-300"
          />
          <input
            type="password"
            required
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder={language === 'en' ? 'New password (min 6 chars)' : 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)'}
            className="w-full p-2.5 rounded-xl border border-slate-300"
          />
          {passMsg && <div className="font-bold text-emerald-700">{passMsg}</div>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
          >
            {language === 'en' ? 'Update Password' : 'পাসওয়ার্ড আপডেট করুন'}
          </button>
        </form>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>{language === 'en' ? 'Install Shop App (PWA)' : 'মোবাইল ও ডেস্কটপে অ্যাপ ইনস্টল'}</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              {language === 'en'
                ? 'Install My Digital Shop Management as a fast offline-ready Progressive Web App on your phone or PC. Custom-branded native Android APK generation requires separate Android Gradle signing.'
                : 'ব্রাউজার থেকে সরাসরি হোম-স্ক্রিন অ্যাপ (PWA) হিসেবে ইনস্টল করে ব্যবহার করুন। প্রতিটি দোকানের আলাদা নেটিভ সাইনড APK ফাইল তৈরির জন্য আলাদা অ্যান্ড্রয়েড গ্রেডল বিল্ড পাইপলাইন প্রয়োজন হয়।'}
            </p>
            {isInstalled ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-800">
                {language === 'en' ? 'Already installed as App' : 'অ্যাপ ইতিমধ্যেই ইনস্টল করা আছে'}
              </div>
            ) : isInstallable ? (
              <button
                type="button"
                onClick={install}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'en' ? 'Install PWA App Now' : 'অ্যাপ হিসেবে ইনস্টল করুন'}</span>
              </button>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-semibold">
                {language === 'en'
                  ? 'Use your browser menu ("Add to Home screen" or "Install app") to install.'
                  : 'ব্রাউজার মেনু থেকে "Add to Home screen" বা "Install app" সিলেক্ট করুন।'}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={logoutShop}
            className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'en' ? 'Sign Out from This Shop' : 'এই দোকান থেকে লগআউট করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
