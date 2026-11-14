import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  Image as ImageIcon,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Palette,
  Phone,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { SHOP_CATEGORIES, getShopCategoryConfig } from '../shopCategoriesConfig';
import { SHOP_I18N } from '../shopI18n';
import { processShopImageUpload, renderVisitingCardDataUrl } from '../shopImageUtils';
import { useShopAuth } from '../ShopAuthContext';
import { ShopCategoryId, ShopRegistrationDraft, VisitingCardTemplateId } from '../types';
import { ShopCategoryIcon } from './ShopCategoryIcon';
import { VisitingCardStudioModal } from './VisitingCardStudioModal';

interface ShopAuthAndWizardProps {
  onBackToPortal: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

const ACCENT_SWATCHES = ['#059669', '#2563eb', '#4f46e5', '#db2777', '#d97706', '#0d9488', '#e11d48', '#0f172a'];

export const ShopAuthAndWizard: React.FC<ShopAuthAndWizardProps> = ({
  onBackToPortal,
  onShowToast,
}) => {
  const {
    language,
    setLanguage,
    loginWithPhone,
    loginWithEmail,
    registerShopAccount,
    sendRecoveryEmail,
  } = useShopAuth();

  const t = SHOP_I18N[language];
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login states
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Recovery Modal
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');

  // 7-Step Registration Wizard State
  const [step, setStep] = useState<number>(1);
  const [regBusy, setRegBusy] = useState(false);
  const [regError, setRegError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isCardStudioOpen, setIsCardStudioOpen] = useState(false);

  const [draft, setDraft] = useState<ShopRegistrationDraft>({
    shopCategory: 'mobile-shop',
    shopName: '',
    tagline: '',
    brandColor: '#059669',
    ownerName: '',
    phone: '',
    logoDataUrl: '',
    visitingCardDataUrl: '',
    visitingCardMode: 'none',
    visitingCardTemplate: 'modern-emerald',
    address: '',
    email: '',
    website: '',
    tradeLicense: '',
    binVatNumber: '',
    bkashNumber: '',
    nagadNumber: '',
    authMethod: 'phone',
    loginEmail: '',
    password: '',
    confirmPassword: '',
    language,
  });

  const selectedCat = getShopCategoryConfig(draft.shopCategory);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginBusy(true);
    try {
      if (loginMethod === 'phone') {
        await loginWithPhone(loginPhone, loginPassword);
      } else {
        await loginWithEmail(loginEmail, loginPassword);
      }
      onShowToast(
        language === 'en' ? 'Signed in to your shop!' : 'দোকান অ্যাকাউন্টে সফলভাবে প্রবেশ করেছেন!',
        '🏪'
      );
    } catch (err: any) {
      setLoginError(err?.message || 'লগইন ব্যর্থ হয়েছে।');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRegError('');
    try {
      const { dataUrl } = await processShopImageUpload(file, 'logo');
      setDraft((prev) => ({ ...prev, logoDataUrl: dataUrl }));
      onShowToast(language === 'en' ? 'Shop logo ready!' : 'দোকানের লোগো আপলোড সম্পন্ন!', '🖼️');
    } catch (err: any) {
      setRegError(err?.message || 'লোগো আপলোড করা যায়নি');
    }
  };

  const handleQuickGenerateCard = async (tpl: VisitingCardTemplateId) => {
    setRegError('');
    try {
      const url = await renderVisitingCardDataUrl({
        template: tpl,
        shopName: draft.shopName || 'My Digital Shop',
        categoryLabel: language === 'en' ? selectedCat.nameEn : selectedCat.nameBn,
        tagline: draft.tagline,
        ownerName: draft.ownerName || 'Proprietor',
        phone: draft.phone || '017XXXXXXXX',
        email: draft.email,
        website: draft.website,
        address: draft.address || 'Bangladesh',
        logoDataUrl: draft.logoDataUrl,
        accentColor: draft.brandColor,
      });
      setDraft((prev) => ({
        ...prev,
        visitingCardDataUrl: url,
        visitingCardMode: 'created',
        visitingCardTemplate: tpl,
      }));
    } catch {
      setRegError('ভিজিটিং কার্ড তৈরি করতে সমস্যা হয়েছে।');
    }
  };

  const validateStep = (targetStep: number): boolean => {
    setRegError('');
    if (targetStep === 2 && !draft.shopName.trim()) {
      setRegError(language === 'en' ? 'Please enter your shop name.' : 'অনুগ্রহ করে আপনার দোকানের নাম লিখুন।');
      return false;
    }
    if (targetStep === 3) {
      if (!draft.ownerName.trim()) {
        setRegError(language === 'en' ? 'Please enter owner name.' : 'দোকানের মালিকের নাম লিখুন।');
        return false;
      }
      if (draft.phone.replace(/[^0-9]/g, '').length < 10) {
        setRegError(
          language === 'en' ? 'Please enter a valid 11-digit mobile number.' : 'সঠিক মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)।'
        );
        return false;
      }
    }
    if (targetStep === 6 && !draft.address.trim()) {
      setRegError(language === 'en' ? 'Please enter your shop address.' : 'অনুগ্রহ করে দোকানের ঠিকানা লিখুন।');
      return false;
    }
    return true;
  };

  const goNextStep = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(7, s + 1));
  };

  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!validateStep(2) || !validateStep(3) || !validateStep(6)) return;

    if (draft.authMethod === 'email' && !draft.loginEmail.trim().includes('@')) {
      setRegError(language === 'en' ? 'Enter a valid login email.' : 'লগইনের জন্য সঠিক ইমেইল দিন।');
      return;
    }
    if (draft.password.length < 6) {
      setRegError(language === 'en' ? 'Password must be at least 6 characters.' : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (draft.password !== draft.confirmPassword) {
      setRegError(language === 'en' ? 'Passwords do not match.' : 'পাসওয়ার্ড এবং নিশ্চিত পাসওয়ার্ড মেলেনি।');
      return;
    }

    setRegBusy(true);
    try {
      await registerShopAccount({ ...draft, language });
      onShowToast(
        language === 'en' ? 'Your Digital Shop is ready!' : 'অভিনন্দন! আপনার ডিজিটাল দোকান তৈরি হয়েছে!',
        '🎉'
      );
    } catch (err: any) {
      setRegError(err?.message || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।');
    } finally {
      setRegBusy(false);
    }
  };

  const STEP_TITLES = [
    { num: 1, bn: 'দোকানের ধরন', en: 'Shop Category' },
    { num: 2, bn: 'দোকানের নাম', en: 'Shop Name' },
    { num: 3, bn: 'মালিকের তথ্য', en: 'Owner Info' },
    { num: 4, bn: 'দোকানের লোগো', en: 'Shop Logo' },
    { num: 5, bn: 'ভিজিটিং কার্ড', en: 'Visiting Card' },
    { num: 6, bn: 'ঠিকানা ও যোগাযোগ', en: 'Address & Info' },
    { num: 7, bn: 'লগইন ও নিশ্চিতকরণ', en: 'Credentials' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToPortal}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t.backToMainPortal}</span>
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                {t.appName}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {t.independentNotice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <span>{t.switchLanguage}</span>
            </button>

            <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                  mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {language === 'en' ? 'Sign In' : 'লগইন'}
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                  mode === 'register' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                {language === 'en' ? 'New Shop' : 'নতুন দোকান'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-10 flex-1">
        {/* Independent Account Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="leading-relaxed">
            <span className="font-extrabold">
              {language === 'en' ? 'Private Multi-User Shop System: ' : 'স্বতন্ত্র ও সুরক্ষিত দোকান সিস্টেম: '}
            </span>
            <span>{t.independentNotice}</span>
          </div>
        </div>

        {mode === 'login' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Login Card */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.loginTitle}</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {language === 'en'
                    ? 'Access your shop dashboard, inventory, Cash Memos & visiting card from any device.'
                    : 'যেকোনো মোবাইল বা কম্পিউটার থেকে আপনার দোকানের স্টক, ক্যাশ মেমো ও হিসাব পরিচালনা করুন।'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('phone');
                    setLoginError('');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                    loginMethod === 'phone' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.phoneLoginTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setLoginError('');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                    loginMethod === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{t.emailLoginTab}</span>
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginMethod === 'phone' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.phoneLabel}</label>
                    <input
                      type="tel"
                      required
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.emailLabel}</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="shop@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">{t.passwordLabel}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRecovery(true);
                        setRecoveryMessage('');
                      }}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      {t.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPass ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginBusy}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loginBusy ? '...' : t.loginButton}</span>
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {language === 'en' ? "Don't have a shop account yet?" : 'এখনো আপনার দোকানের অ্যাকাউন্ট নেই?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setStep(1);
                    setRegError('');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  {t.createAccountButton}
                </button>
              </div>
            </div>

            {/* Side Overview */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">
                {language === 'en'
                  ? '12 Tailored Shop Experiences Included'
                  : '১২ ধরনের দোকানের জন্য উপযোগী ডিজিটাল ম্যানেজমেন্ট'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'en'
                  ? 'Mobile Shops get the full classic Mobile Point Cash Memo suite by default. Other shops get tailored product fields, units, expiry or repair tracking.'
                  : 'মোবাইল শপের জন্য বিদ্যমান সম্পূর্ণ মোবাইল শপ ক্যাশ মেমো সিস্টেম অপরিবর্তিত থাকবে, এবং অন্যান্য ১১ ক্যাটাগরির জন্য কাস্টম পণ্য, স্টক, বাকি খাতা ও রিপোর্ট সুবিধা পাবেন।'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SHOP_CATEGORIES.slice(0, 8).map((cat) => (
                  <div
                    key={cat.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[11px] font-bold text-slate-700"
                  >
                    <ShopCategoryIcon iconName={cat.iconName} className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{language === 'en' ? cat.nameEn : cat.nameBn}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setStep(1);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold cursor-pointer"
              >
                {language === 'en' ? 'Explore All 12 Categories & Register' : '১২টি ক্যাটাগরি দেখুন ও দোকান খুলুন'}
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================
             7-STEP DYNAMIC SHOP REGISTRATION WIZARD
             ================================================================ */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Step Progress Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                    {t.stepOf} {step} / 7 — {language === 'en' ? STEP_TITLES[step - 1].en : STEP_TITLES[step - 1].bn}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                    {t.registerTitle}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  {language === 'en' ? 'Already registered? Sign In' : 'আগে অ্যাকাউন্ট খোলা থাকলে লগইন করুন'}
                </button>
              </div>

              {/* 7-Step Stepper */}
              <div className="grid grid-cols-7 gap-1.5">
                {STEP_TITLES.map((item) => {
                  const done = step > item.num;
                  const active = step === item.num;
                  return (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => {
                        if (item.num < step) setStep(item.num);
                      }}
                      className={`text-left transition ${item.num < step ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <div
                        className={`h-2 rounded-full mb-1.5 transition-all ${
                          done ? 'bg-emerald-600' : active ? 'bg-slate-900' : 'bg-slate-200'
                        }`}
                      />
                      <span
                        className={`hidden md:block text-[10px] font-bold truncate ${
                          active ? 'text-slate-900' : done ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {item.num}. {language === 'en' ? item.en : item.bn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleFinalRegister} className="p-6 sm:p-8 space-y-6">
              {/* STEP 1: Select Shop Category */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'en'
                        ? 'Step 1: Select Your Shop Category'
                        : 'ধাপ ১: আপনার দোকানের ধরন নির্বাচন করুন'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'en'
                        ? 'Your dashboard, product fields, units & Cash Memo template adapt automatically to your shop type.'
                        : 'আপনার নির্বাচিত ধরন অনুযায়ী ড্যাশবোর্ড, পণ্যের ঘর, একক এবং ক্যাশ মেমো টেমপ্লেট সেট হবে।'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SHOP_CATEGORIES.map((cat) => {
                      const isSelected = draft.shopCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              shopCategory: cat.id as ShopCategoryId,
                              brandColor: cat.accentColor,
                            }))
                          }
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                            style={{ backgroundColor: cat.accentColor }}
                          >
                            <ShopCategoryIcon iconName={cat.iconName} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-sm font-extrabold text-slate-900">
                                {language === 'en' ? cat.nameEn : cat.nameBn}
                              </span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              {language === 'en' ? cat.descEn : cat.descBn}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: Enter Shop Name */}
              {step === 2 && (
                <div className="max-w-xl space-y-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'en'
                        ? 'Step 2: Enter Your Shop Name & Branding'
                        : 'ধাপ ২: আপনার দোকানের নাম ও ব্র্যান্ড পরিচিতি লিখুন'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'en'
                        ? 'This name appears on your Cash Memos, Money Receipts, Visiting Card & Splash Screen.'
                        : 'এই নাম আপনার ক্যাশ মেমো, মানি রিসিট, ভিজিটিং কার্ড ও স্প্ল্যাশ স্ক্রিনে স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে।'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'en' ? 'Shop / Business Name *' : 'দোকান / প্রতিষ্ঠানের নাম *'}
                    </label>
                    <input
                      type="text"
                      value={draft.shopName}
                      onChange={(e) => setDraft((p) => ({ ...p, shopName: e.target.value }))}
                      placeholder={
                        language === 'en' ? 'e.g. Dhaka Mobile Point' : 'যেমন: মোসাফা মোবাইল পয়েন্ট / বিসমিল্লাহ স্টোর'
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'en' ? 'Shop Tagline / Slogan (Optional)' : 'দোকানের স্লোগান বা সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)'}
                    </label>
                    <input
                      type="text"
                      value={draft.tagline}
                      onChange={(e) => setDraft((p) => ({ ...p, tagline: e.target.value }))}
                      placeholder={
                        language === 'en'
                          ? 'Trusted quality & wholesale/retail'
                          : 'যেমন: শতভাগ অরিজিনাল পণ্য ও নির্ভরযোগ্য সার্ভিসিং'
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Brand Accent Color' : 'দোকানের থিম কালার'}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ACCENT_SWATCHES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setDraft((p) => ({ ...p, brandColor: color }))}
                          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center cursor-pointer transition ${
                            draft.brandColor === color ? 'border-slate-900 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {draft.brandColor === color && <Check className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Owner's Name & Mobile Number */}
              {step === 3 && (
                <div className="max-w-xl space-y-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'en'
                        ? "Step 3: Owner's Name & Mobile Number"
                        : 'ধাপ ৩: দোকানের মালিকের নাম ও মোবাইল নম্বর'}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'en' ? 'Owner / Proprietor Name *' : 'স্বত্বাধিকারী / মালিকের নাম *'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={draft.ownerName}
                        onChange={(e) => setDraft((p) => ({ ...p, ownerName: e.target.value }))}
                        placeholder={language === 'en' ? 'Full name' : 'যেমন: মো: রফিকুল ইসলাম'}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'en' ? 'Shop Contact Mobile Number *' : 'যোগাযোগ ও অ্যাকাউন্টের মোবাইল নম্বর *'}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={draft.phone}
                        onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="017XXXXXXXX"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Upload Shop Logo */}
              {step === 4 && (
                <div className="max-w-xl space-y-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'en' ? 'Step 4: Upload Your Shop Logo' : 'ধাপ ৪: দোকানের লোগো আপলোড করুন'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'en'
                        ? 'Optional — PNG, JPG, JPEG or WebP. If skipped, a clean monogram badge will be used automatically.'
                        : 'ঐচ্ছিক — PNG, JPG বা WebP আপলোড করুন। স্কিপ করলে দোকানের নামের প্রথম অক্ষর দিয়ে মনোগ্রাম ব্যবহৃত হবে।'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    {draft.logoDataUrl ? (
                      <div className="w-28 h-28 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        <img src={draft.logoDataUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div
                        className="w-28 h-28 rounded-2xl flex items-center justify-center text-white text-4xl font-black shrink-0 shadow-xs"
                        style={{ backgroundColor: draft.brandColor || '#059669' }}
                      >
                        {(draft.shopName || 'S').trim().charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="space-y-3 flex-1 w-full">
                      <label className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4 text-emerald-700" />
                        <span>
                          {draft.logoDataUrl
                            ? language === 'en'
                              ? 'Replace Shop Logo'
                              : 'অন্য লোগো পরিবর্তন করুন'
                            : language === 'en'
                            ? 'Choose Logo Image (PNG / JPG / WebP)'
                            : 'লোগোর ছবি আপলোড করুন (PNG/JPG/WebP)'}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          className="hidden"
                          onChange={handleLogoFileChange}
                        />
                      </label>

                      {draft.logoDataUrl && (
                        <button
                          type="button"
                          onClick={() => setDraft((p) => ({ ...p, logoDataUrl: '' }))}
                          className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Remove & Use Monogram' : 'লোগো সরান (মনোগ্রাম ব্যবহার)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Upload or Create Visiting Card */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'en'
                        ? 'Step 5: Upload or Create Your Shop Visiting Card'
                        : 'ধাপ ৫: দোকানের ভিজিটিং কার্ড আপলোড বা তৈরি করুন'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'en'
                        ? 'Your visiting card appears on your shop dashboard for quick customer sharing & download.'
                        : 'আপনার ভিজিটিং কার্ডটি ড্যাশবোর্ডে সংরক্ষিত থাকবে এবং ক্রেতাদের সাথে সরাসরি শেয়ার ও ডাউনলোড করতে পারবেন।'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <span>{language === 'en' ? 'Instant Digital Card Generator' : 'তাৎক্ষণিক ভিজিটিং কার্ড তৈরি'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {language === 'en'
                          ? 'Click any template to generate a card using your shop name, logo, and owner info:'
                          : 'নিচের যেকোনো ডিজাইনে ক্লিক করলে অটোমেটিক আপনার দোকানের কার্ড তৈরি হবে:'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            ['modern-emerald', 'মডার্ন এমারেল্ড'],
                            ['executive-navy', 'এক্সিকিউটিভ নেভি'],
                            ['royal-gold', 'রয়েল গোল্ড'],
                            ['minimal-clean', 'মিনিমাল হোয়াইট'],
                          ] as Array<[VisitingCardTemplateId, string]>
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => handleQuickGenerateCard(id)}
                            className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                              draft.visitingCardMode === 'created' && draft.visitingCardTemplate === id
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCardStudioOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Open Full Card Studio' : 'ভিজিটিং কার্ড স্টুডিও ওপেন করুন'}</span>
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            {language === 'en' ? 'Visiting Card Preview' : 'কার্ড প্রিভিউ'}
                          </span>
                          {draft.visitingCardDataUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setDraft((p) => ({
                                  ...p,
                                  visitingCardDataUrl: '',
                                  visitingCardMode: 'none',
                                }))
                              }
                              className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              {language === 'en' ? 'Remove' : 'মুছুন'}
                            </button>
                          )}
                        </div>
                        {draft.visitingCardDataUrl ? (
                          <img
                            src={draft.visitingCardDataUrl}
                            alt="Visiting Card Preview"
                            className="w-full h-44 object-contain rounded-xl border border-slate-200 bg-slate-50"
                          />
                        ) : (
                          <div className="h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-xs text-slate-400">
                            <ImageIcon className="w-6 h-6 mb-1" />
                            <span>{language === 'en' ? 'No card selected (Optional)' : 'কার্ড তৈরি বা আপলোড করুন (ঐচ্ছিক)'}</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsCardStudioOpen(true)}
                        className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Upload Existing Card Image' : 'আগের কার্ডের ছবি আপলোড করুন'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Address & Contact Information */}
              {step === 6 && (
                <div className="max-w-2xl space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {language === 'en'
                        ? 'Step 6: Shop Address & Business Details'
                        : 'ধাপ ৬: দোকানের ঠিকানা ও অন্যান্য তথ্য'}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'en' ? 'Full Shop Address *' : 'দোকানের সম্পূর্ণ ঠিকানা *'}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <textarea
                        rows={2}
                        value={draft.address}
                        onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
                        placeholder={
                          language === 'en'
                            ? 'Shop #, Market Name, Area, District'
                            : 'যেমন: দোকান নং-১২, ২য় তলা, নিউ মার্কেট, ঢাকা'
                        }
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Shop Email (Optional)' : 'দোকানের ইমেইল (ঐচ্ছিক)'}
                      </label>
                      <input
                        type="email"
                        value={draft.email}
                        onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                        placeholder="shop@domain.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Website / FB Page (Optional)' : 'ওয়েবসাইট / ফেসবুক পেজ (ঐচ্ছিক)'}
                      </label>
                      <input
                        type="text"
                        value={draft.website}
                        onChange={(e) => setDraft((p) => ({ ...p, website: e.target.value }))}
                        placeholder="fb.com/myshop"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'bKash Number (for Memos)' : 'বিকাশ নম্বর (মেমোর জন্য ঐচ্ছিক)'}
                      </label>
                      <input
                        type="text"
                        value={draft.bkashNumber}
                        onChange={(e) => setDraft((p) => ({ ...p, bkashNumber: e.target.value }))}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'en' ? 'Trade License / BIN (Optional)' : 'ট্রেড লাইসেন্স / ভ্যাট নম্বর (ঐচ্ছিক)'}
                      </label>
                      <input
                        type="text"
                        value={draft.tradeLicense}
                        onChange={(e) => setDraft((p) => ({ ...p, tradeLicense: e.target.value }))}
                        placeholder="TRAD/DSCC/..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Credentials & Confirm */}
              {step === 7 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {language === 'en'
                          ? 'Step 7: Create Your Shop Login Credentials'
                          : 'ধাপ ৭: দোকান অ্যাকাউন্টের পাসওয়ার্ড তৈরি ও নিশ্চিত করুন'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {language === 'en'
                          ? 'Use these credentials to log in securely from any device.'
                          : 'এই তথ্য ব্যবহার করে যেকোনো ডিভাইস থেকে নিরাপদে লগইন করতে পারবেন।'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setDraft((p) => ({ ...p, authMethod: 'phone' }))}
                        className={`py-2 px-3 rounded-lg text-xs font-bold cursor-pointer ${
                          draft.authMethod === 'phone' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {language === 'en' ? 'Login with Mobile' : 'মোবাইল নম্বর দিয়ে লগইন'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            authMethod: 'email',
                            loginEmail: p.loginEmail || p.email,
                          }))
                        }
                        className={`py-2 px-3 rounded-lg text-xs font-bold cursor-pointer ${
                          draft.authMethod === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                        }`}
                      >
                        {language === 'en' ? 'Login with Email (supports reset)' : 'ইমেইল দিয়ে লগইন'}
                      </button>
                    </div>

                    {draft.authMethod === 'phone' ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-slate-500">
                          {language === 'en' ? 'Login Mobile Number: ' : 'লগইন মোবাইল নম্বর: '}
                        </span>
                        <span className="font-mono font-extrabold text-slate-900">{draft.phone}</span>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t.emailLabel} *</label>
                        <input
                          type="email"
                          value={draft.loginEmail}
                          onChange={(e) => setDraft((p) => ({ ...p, loginEmail: e.target.value }))}
                          placeholder="owner-shop@gmail.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.passwordLabel} *</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={draft.password}
                          onChange={(e) => setDraft((p) => ({ ...p, password: e.target.value }))}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.confirmPasswordLabel} *</label>
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={draft.confirmPassword}
                        onChange={(e) => setDraft((p) => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  {/* Summary Preview */}
                  <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      {draft.logoDataUrl ? (
                        <img
                          src={draft.logoDataUrl}
                          alt="Shop Logo"
                          className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-200 p-1"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl"
                          style={{ backgroundColor: draft.brandColor }}
                        >
                          {(draft.shopName || 'S').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-sm text-slate-900">{draft.shopName || '---'}</div>
                        <div className="text-[11px] text-emerald-700 font-bold">
                          {language === 'en' ? selectedCat.nameEn : selectedCat.nameBn}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-3 space-y-1.5 text-slate-600">
                      <div>
                        <span className="font-bold text-slate-800">{language === 'en' ? 'Owner: ' : 'মালিক: '}</span>
                        {draft.ownerName}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">{language === 'en' ? 'Phone: ' : 'মোবাইল: '}</span>
                        <span className="font-mono">{draft.phone}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">{language === 'en' ? 'Address: ' : 'ঠিকানা: '}</span>
                        {draft.address}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">
                          {language === 'en' ? 'Visiting Card: ' : 'ভিজিটিং কার্ড: '}
                        </span>
                        {draft.visitingCardDataUrl
                          ? language === 'en'
                            ? 'Ready'
                            : 'সংযুক্ত করা হয়েছে'
                          : language === 'en'
                          ? 'Add later in Dashboard'
                          : 'পরে যোগ করা যাবে'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {regError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                  {regError}
                </div>
              )}

              {/* Wizard Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={step === 1 || regBusy}
                  onClick={() => {
                    setRegError('');
                    setStep((s) => Math.max(1, s - 1));
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.prevStep}</span>
                </button>

                {step < 7 ? (
                  <button
                    type="button"
                    onClick={goNextStep}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t.nextStep}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={regBusy}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{regBusy ? '...' : t.completeRegistration}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Recovery Modal */}
      {showRecovery && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {language === 'en' ? 'Shop Account Recovery' : 'অ্যাকাউন্ট রিকভারি ও পাসওয়ার্ড রিসেট'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'en'
                    ? 'Enter the email address used to register your shop'
                    : 'ইমেইল দিয়ে খোলা দোকানের জন্য রিসেট লিংক পাঠানো হবে'}
                </p>
              </div>
            </div>

            <input
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              placeholder="shop@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
            />

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {language === 'en'
                ? 'Note: If you registered with Mobile Number only (without email login), sign in from a trusted session or change password in Shop Settings.'
                : 'দ্রষ্টব্য: মোবাইল নম্বর দিয়ে খোলা অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তনের জন্য সেটিংস থেকে পাসওয়ার্ড আপডেট অপশন ব্যবহার করুন অথবা লগইন ইমেইল যুক্ত করুন।'}
            </p>

            {recoveryMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                {recoveryMessage}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRecovery(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={recoveryBusy}
                onClick={async () => {
                  setRecoveryBusy(true);
                  setRecoveryMessage('');
                  try {
                    await sendRecoveryEmail(recoveryEmail);
                    setRecoveryMessage(
                      language === 'en'
                        ? 'Password reset link sent to your email inbox.'
                        : 'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।'
                    );
                  } catch (err: any) {
                    setRecoveryMessage(err?.message || 'ইমেইল পাঠানো যায়নি।');
                  } finally {
                    setRecoveryBusy(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {recoveryBusy ? '...' : language === 'en' ? 'Send Reset Link' : 'রিসেট লিংক পাঠান'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visiting Card Studio inside Step 5 */}
      <VisitingCardStudioModal
        isOpen={isCardStudioOpen}
        onClose={() => setIsCardStudioOpen(false)}
        language={language}
        shopName={draft.shopName || 'My Digital Shop'}
        categoryLabel={language === 'en' ? selectedCat.nameEn : selectedCat.nameBn}
        tagline={draft.tagline}
        ownerName={draft.ownerName || 'Shop Owner'}
        phone={draft.phone || '017XXXXXXXX'}
        email={draft.email}
        website={draft.website}
        address={draft.address || 'Bangladesh'}
        logoDataUrl={draft.logoDataUrl}
        accentColor={draft.brandColor}
        initialMode={draft.visitingCardMode}
        initialTemplate={draft.visitingCardTemplate}
        initialCardDataUrl={draft.visitingCardDataUrl}
        onSaveCard={({ dataUrl, mode: cardMode, template }) => {
          setDraft((p) => ({
            ...p,
            visitingCardDataUrl: dataUrl,
            visitingCardMode: cardMode,
            visitingCardTemplate: template,
          }));
        }}
        onRemoveCard={() => {
          setDraft((p) => ({
            ...p,
            visitingCardDataUrl: '',
            visitingCardMode: 'none',
          }));
        }}
      />
    </div>
  );
};
