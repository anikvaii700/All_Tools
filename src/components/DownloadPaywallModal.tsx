import React, { useState } from 'react';
import {
  X,
  Lock,
  Download,
  CheckCircle2,
  Copy,
  Coins,
  Phone,
  FileText,
  UserCheck,
  AlertCircle,
  CreditCard,
  RefreshCw,
  MessageCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { adminUserService } from '../services/adminUserService';
import { usePaymentMode } from '../hooks/usePaymentMode';

export interface DownloadPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentTypeTag?: string;
  onConfirmDownload: () => void;
  priceBDT?: number; // Default 5 BDT
}

const BKASH_MERCHANT_NUMBER = '01868775577';

export const DownloadPaywallModal: React.FC<DownloadPaywallModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentTypeTag = 'অফিসিয়াল ফরম ও ডকুমেন্ট',
  onConfirmDownload,
  priceBDT = 5,
}) => {
  const {
    user,
    isLoggedIn,
    loginWithGoogle,
    loginOrRegisterWithPhone,
    deductMainBalance,
    addMainBalance,
    convertCoinsToMainBalance,
  } = useAuth();

  // Mode: 'download' | 'add-money' | 'convert-coins'
  const [activeTab, setActiveTab] = useState<'download' | 'add-money' | 'convert-coins'>('download');

  // Auth form states (if not logged in)
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  const [phoneInput, setPhoneInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Add Money states
  const [addMoneyAmount, setAddMoneyAmount] = useState<number>(50); // Minimum 50 BDT
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Success state for downloading
  const [isDownloadSuccess, setIsDownloadSuccess] = useState(false);

  // Quick Payment Support popup state in Download section
  const [isSupportPopupOpen, setIsSupportPopupOpen] = useState(false);

  const { isPaymentEnabled } = usePaymentMode();

  // If Payment is OFF (100% Free Mode), automatically trigger download without deducting money or showing paywall
  React.useEffect(() => {
    if (isOpen && !isPaymentEnabled) {
      onConfirmDownload();
      onClose();
    }
  }, [isOpen, isPaymentEnabled, onConfirmDownload, onClose]);

  if (!isOpen || !isPaymentEnabled) return null;

  const mainBalance = Number(user?.balance || 0);
  const coinBalance = Number(user?.coins || 0);
  const hasSufficientBalance = mainBalance >= priceBDT;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(BKASH_MERCHANT_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // Google Login
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsAuthLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setAuthError('গুগল সাইন-ইনে সমস্যা হয়েছে। মোবাইল নম্বর দিয়ে চেষ্টা করুন।');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Phone Login / Register
  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setAuthError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)');
      return;
    }
    if (pinInput.length < 4) {
      setAuthError('ন্যূনতম ৪ ডিজিটের পাসওয়ার্ড বা পিন দিন');
      return;
    }

    setIsAuthLoading(true);
    try {
      await loginOrRegisterWithPhone(cleanPhone, pinInput, nameInput.trim() || undefined);
    } catch (err: any) {
      setAuthError(err?.message || 'লগইন করতে সমস্যা হয়েছে।');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 1. Direct Download: Deduct 5 BDT from Main Balance
  const handleDeductAndDownload = async () => {
    setFeedbackMessage(null);
    if (!user) return;

    if (!hasSufficientBalance) {
      setFeedbackMessage({
        type: 'error',
        text: `আপনার মূল ব্যালেন্স অপর্যাপ্ত। পিডিএফ ডাউনলোডের জন্য ${priceBDT} টাকা প্রয়োজন। অনুগ্রহ করে ব্যালেন্সে টাকা লোড করুন।`,
      });
      setActiveTab('add-money');
      return;
    }

    setIsProcessing(true);
    try {
      const ok = await deductMainBalance(priceBDT, `পিডিএফ ডাউনলোড: ${documentTitle}`);
      if (!ok) {
        setFeedbackMessage({
          type: 'error',
          text: 'ব্যালেন্স কর্তন করতে সমস্যা হয়েছে। পর্যাপ্ত ব্যালেন্স রয়েছে কি না নিশ্চিত করুন।',
        });
        setIsProcessing(false);
        return;
      }

      // Celebrate & download
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      setIsProcessing(false);
      setIsDownloadSuccess(true);

      setTimeout(() => {
        onConfirmDownload();
        onClose();
        setIsDownloadSuccess(false);
      }, 1200);
    } catch (err: any) {
      setIsProcessing(false);
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'ডাউনলোড সম্পন্ন করতে ব্যর্থ হয়েছে।',
      });
    }
  };

  // 2. Add Money: Minimum 50 BDT
  const handleAddMoneySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedbackMessage(null);

    if (addMoneyAmount < 50) {
      setFeedbackMessage({
        type: 'error',
        text: 'মিনিমাম ৫০ টাকা এড মানি করতে পারবেন।',
      });
      return;
    }

    const cleanTrx = trxId.trim();
    if (!cleanTrx || cleanTrx.length < 4) {
      setFeedbackMessage({
        type: 'error',
        text: 'অনুগ্রহ করে বিকাশ পেমেন্টের সঠিক TrxID লিখুন।',
      });
      return;
    }

    setIsProcessing(true);
    try {
      try {
        await adminUserService.submitDepositRequest({
          userId: user?.uid || `guest_${Date.now()}`,
          userName: user?.displayName || 'ব্যবহারকারী',
          userPhone: user?.phoneNumber || '',
          userEmail: user?.email || '',
          amount: addMoneyAmount,
          trxId: cleanTrx,
          paymentMethod: 'বিকাশ মার্চেন্ট',
        });
      } catch {}

      await addMainBalance(addMoneyAmount, 'বিকাশ মার্চেন্ট', cleanTrx);
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch {}
      setFeedbackMessage({
        type: 'success',
        text: `সফলভাবে ৳${addMoneyAmount} টাকা আপনার মূল ব্যালেন্সে যোগ হয়েছে! এখন ৫ টাকা কর্তন করে ডাউনলোড করুন।`,
      });
      setTrxId('');
      setIsProcessing(false);
      setActiveTab('download');
    } catch (err: any) {
      setIsProcessing(false);
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'টাকা যোগ করতে সমস্যা হয়েছে।',
      });
    }
  };

  // Instant Demo Add Money Helper
  const handleInstantDemoAddMoney = async () => {
    setIsProcessing(true);
    try {
      const demoTrx = 'BK' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await addMainBalance(50, 'বিকাশ (অনুমোদিত)', demoTrx);
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch {}
      setFeedbackMessage({
        type: 'success',
        text: 'পরীক্ষামূলক ৳৫০ টাকা আপনার মূল ব্যালেন্সে যোগ হয়েছে! এখন ডাউনলোড করুন।',
      });
      setIsProcessing(false);
      setActiveTab('download');
    } catch (err: any) {
      setIsProcessing(false);
      setFeedbackMessage({ type: 'error', text: err?.message || 'সমস্যা হয়েছে' });
    }
  };

  // 3. Convert Coin Balance to Main Balance (100 coins = 1 BDT)
  const handleConvertCoins = async (coinsToConvert: number) => {
    setFeedbackMessage(null);
    if (coinsToConvert < 100) {
      setFeedbackMessage({
        type: 'error',
        text: 'কনভার্ট করতে ন্যূনতম ১০০ কয়েন প্রয়োজন।',
      });
      return;
    }
    if (coinBalance < coinsToConvert) {
      setFeedbackMessage({
        type: 'error',
        text: 'আপনার কয়েন ব্যালেন্স পর্যাপ্ত নয়।',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await convertCoinsToMainBalance(coinsToConvert);
      setIsProcessing(false);
      if (res.success) {
        try {
          confetti({ particleCount: 45, spread: 55 });
        } catch {}
        setFeedbackMessage({
          type: 'success',
          text: res.message,
        });
        setActiveTab('download');
      } else {
        setFeedbackMessage({
          type: 'error',
          text: res.message,
        });
      }
    } catch (err: any) {
      setIsProcessing(false);
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'কয়েন কনভার্ট করতে সমস্যা হয়েছে।',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple & Clean Header */}
        <div className="relative bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-700 p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-rose-100 text-[11px] font-bold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
            <span>{isLoggedIn ? `অফিসিয়াল পিডিএফ ডাউনলোড • ফি ${priceBDT} টাকা` : 'অফিসিয়াল পিডিএফ ডাউনলোড'}</span>
          </div>

          <h2 className="text-xl font-black tracking-tight leading-tight">
            {!isLoggedIn ? 'ডাউনলোড করতে একাউন্ট প্রয়োজন' : 'পিডিএফ ডাউনলোড'}
          </h2>
          <p className="text-xs text-rose-100 font-medium line-clamp-1 mt-0.5">
            {documentTitle}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* SUCCESS SCREEN */}
          {isDownloadSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black animate-bounce shadow-inner">
                ✓
              </div>
              <h3 className="text-lg font-black text-slate-900">৫ টাকা কর্তন সফল হয়েছে!</h3>
              <p className="text-xs text-slate-600 font-medium">
                আপনার কাঙ্ক্ষিত পিডিএফ ফাইলটি এখন ডাউনলোড হচ্ছে...
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ডাউনলোড শুরু হয়েছে</span>
              </div>
            </div>
          ) : !isLoggedIn ? (
            /* STEP 1: AUTHENTICATION IF NOT LOGGED IN */
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950 text-sm mb-0.5">লগইন বা একাউন্ট তৈরি করুন</p>
                  <p className="leading-relaxed">
                    আপনার ফরমের ডেটা সুরক্ষিত রয়েছে। ফাইলটি ডাউনলোড করতে প্রথমে গুগল অথবা মোবাইল নম্বর দিয়ে লগইন বা সাইন-আপ করুন।
                  </p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAuthMethod('google')}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMethod === 'google' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <span>Google সাইন-ইন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMethod === 'phone' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-rose-600" />
                  <span>মোবাইল নম্বর</span>
                </button>
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authMethod === 'google' ? (
                <div className="space-y-2 pt-1 text-center">
                  <button
                    type="button"
                    disabled={isAuthLoading}
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 px-4 rounded-xl bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-800 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>{isAuthLoading ? 'লগইন হচ্ছে...' : 'Google দিয়ে দ্রুত অ্যাকাউন্ট তৈরি / লগইন করুন'}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePhoneSignIn} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">আপনার নাম (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="নাম লিখুন"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="017xxxxxxxx বা 018xxxxxxxx"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ৪ ডিজিটের পাসওয়ার্ড / পিন <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={8}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono tracking-widest focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAuthLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন ➔'}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* STEP 2: USER IS LOGGED IN - FOCUSED DOWNLOAD FLOW */
            <div className="space-y-4">
              {/* Separate Balances Overview (মূল ব্যালেন্স vs কয়েন ব্যালেন্স) */}
              <div className="grid grid-cols-2 gap-2">
                {/* 1. মূল ব্যালেন্স */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-emerald-600" />
                      <span>মূল ব্যালেন্স</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">টাকা</span>
                  </div>
                  <div className="text-xl font-black text-emerald-700 tracking-tight">
                    ৳ {mainBalance.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-emerald-800/80 font-medium mt-0.5">
                    ডাউনলোড ফি কর্তন হবে
                  </p>
                </div>

                {/* 2. কয়েন ব্যালেন্স */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-600" />
                      <span>কয়েন ব্যালেন্স</span>
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold">পয়েন্ট</span>
                  </div>
                  <div className="text-xl font-black text-amber-600 tracking-tight">
                    {coinBalance}
                  </div>
                  <p className="text-[10px] text-amber-800/80 font-medium mt-0.5">
                    ১০০ কয়েন = ১ টাকা
                  </p>
                </div>
              </div>

              {/* Feedback messages */}
              {feedbackMessage && (
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                    feedbackMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {feedbackMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{feedbackMessage.text}</span>
                </div>
              )}

              {/* TAB 1: DEFAULT DOWNLOAD VIEW */}
              {activeTab === 'download' && (
                <div className="space-y-4">
                  {/* The exact clear statement requested */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 border-2 border-rose-200 text-center space-y-2">
                    <span className="inline-block px-3 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px]">
                      ডাউনলোড নিয়মাবলী
                    </span>
                    <p className="text-sm font-bold text-slate-800 leading-snug">
                      পিডিএফ ডাউনলোড করার জন্য আপনার মূল ব্যালেন্স থেকে{' '}
                      <span className="text-rose-600 text-base font-black">{priceBDT} টাকা</span> কর্তন করা হবে।
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      কাঙ্ক্ষিত ফাইল: <span className="font-semibold text-slate-700">{documentTitle}</span>
                    </p>
                  </div>

                  {/* CASE A: USER HAS AT LEAST 5 BDT */}
                  {hasSufficientBalance ? (
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleDeductAndDownload}
                        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        <span>
                          {isProcessing ? 'কর্তন ও ডাউনলোড হচ্ছে...' : `${priceBDT} টাকা কর্তন করে ডাউনলোড করুন ➔`}
                        </span>
                      </button>
                      <p className="text-[11px] text-center text-slate-500 font-medium">
                        ব্যালেন্স কর্তনের পর আপনার অবশিষ্ট ব্যালেন্স থাকবে: ৳{(mainBalance - priceBDT).toFixed(2)} টাকা
                      </p>
                    </div>
                  ) : (
                    /* CASE B: USER HAS INSUFFICIENT BALANCE */
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <p className="font-bold text-sm text-amber-950">
                            মূল ব্যালেন্স অপর্যাপ্ত (বর্তমান: ৳{mainBalance.toFixed(2)})
                          </p>
                          <p className="text-amber-900 text-xs mt-0.5">
                            পিডিএফ ডাউনলোড করার জন্য একাউন্টে ন্যূনতম <strong>{priceBDT} টাকা</strong> থাকতে হবে।
                          </p>
                        </div>
                      </div>

                      {/* Prominent "ব্যালেন্সে টাকা লোড করুন" Button */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('add-money')}
                        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-700 hover:from-pink-700 hover:to-indigo-800 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>ব্যালেন্সে টাকা লোড করুন (মিনিমাম ৫০ টাকা) ➔</span>
                      </button>

                      {/* Convert Coin Balance option if user has coins */}
                      {coinBalance >= 100 && (
                        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <p className="font-bold text-amber-950">কয়েন ব্যালেন্স রয়েছে</p>
                              <p className="text-[11px] text-amber-800">
                                {coinBalance} কয়েন = ৳{Math.floor(coinBalance / 100)} টাকা
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('convert-coins')}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] transition cursor-pointer shadow-xs"
                          >
                            কনভার্ট করুন 🔄
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: "ব্যালেন্সে টাকা লোড করুন" (MINIMUM 50 BDT) */}
              {activeTab === 'add-money' && (
                <div className="space-y-3.5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-pink-600" />
                      <span>ব্যালেন্সে টাকা লোড করুন</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('download')}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      ← ব্যাকে যান
                    </button>
                  </div>

                  {/* Explicit Minimum 50 Taka Notice */}
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                    💡 <strong>মিনিমাম ৫০ টাকা</strong> এড মানি করতে পারবেন। (১টি রিচার্জে ১০টি পিডিএফ পর্যন্ত ডাউনলোড করতে পারবেন)।
                  </div>

                  {/* Amount Presets */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      টাকার পরিমাণ নির্বাচন করুন (মিনিমাম ৫০ টাকা)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      {[50, 100, 200, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAddMoneyAmount(amt)}
                          className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                            addMoneyAmount === amt
                              ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          ৳{amt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={50}
                      value={addMoneyAmount}
                      onChange={(e) => setAddMoneyAmount(Math.max(50, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                      placeholder="টাকার পরিমাণ (মিনিমাম ৫০)"
                    />
                  </div>

                  {/* bKash Merchant Number Box */}
                  <div className="p-3 bg-pink-50 rounded-xl border border-pink-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-pink-950">বিকাশ মার্চেন্ট (Make Payment):</span>
                      <button
                        type="button"
                        onClick={handleCopyNumber}
                        className="text-[11px] font-bold text-pink-700 hover:text-pink-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedNumber ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                      </button>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-pink-300 font-mono font-black text-center text-pink-700 text-base">
                      {BKASH_MERCHANT_NUMBER}
                    </div>
                    <p className="text-[10px] text-pink-900">
                      বিকাশ অ্যাপের <strong>Payment (পেমেন্ট)</strong> অপশন থেকে <strong>৳{addMoneyAmount} টাকা</strong> পাঠিয়ে TrxID লিখুন।
                    </p>
                  </div>

                  {/* TrxID Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      বিকাশ TrxID (ট্রানজেকশন আইডি) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="যেমন: BL6A8D2Q"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleAddMoneySubmit}
                      className="w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isProcessing ? 'যাচাই করা হচ্ছে...' : `৳${addMoneyAmount} টাকা এড করুন ➔`}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInstantDemoAddMoney}
                      className="w-full py-1 text-[10px] text-slate-500 hover:text-slate-800 underline text-center cursor-pointer"
                    >
                      (পরীক্ষামূলক দ্রুত ৳৫০ টাকা এড করুন)
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: "কয়েন কনভার্ট করে মূল ব্যালেন্সে নিন" */}
              {activeTab === 'convert-coins' && (
                <div className="space-y-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-amber-600" />
                      <span>কয়েন ব্যালেন্স কনভার্ট</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('download')}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      ← ব্যাকে যান
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1 text-slate-700">
                    <p className="font-bold text-amber-900">কনভার্ট রেট: ১০০ কয়েন = ১ টাকা মূল ব্যালেন্স</p>
                    <p className="text-[11px]">
                      আপনার বর্তমান কয়েন: <strong>{coinBalance} কয়েন</strong> (সর্বোচ্চ কনভার্ট মান: ৳{Math.floor(coinBalance / 100)} টাকা)
                    </p>
                  </div>

                  {/* Convert Presets */}
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 300, 500].map((c) => (
                      <button
                        key={c}
                        type="button"
                        disabled={coinBalance < c || isProcessing}
                        onClick={() => handleConvertCoins(c)}
                        className="py-2.5 px-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-extrabold text-[11px] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center"
                      >
                        <span>{c} কয়েন</span>
                        <span className="text-[10px] text-emerald-700 font-bold">= ৳{c / 100} টাকা</span>
                      </button>
                    ))}
                  </div>

                  {coinBalance >= 500 && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleConvertCoins(500)}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5 text-yellow-200" />
                      <span>৫০০ কয়েন কনভার্ট করে ১টি ফ্রি পিডিএফ (৳৫) আনলক করুন ➔</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Quick Support link - ONLY shown after user logs in / has account (Download Section) */}
        {isLoggedIn && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <span>ফি:</span>
              <strong className="text-rose-600">{priceBDT} টাকা</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsSupportPopupOpen(true)}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              title="পেমেন্ট ও এড মানি সাপোর্ট"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>পেমেন্ট সাপোর্ট (01868775577)</span>
            </button>
          </div>
        )}

        {/* Interactive Payment Support Popup Dialog in Download Section */}
        {isSupportPopupOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsSupportPopupOpen(false)}
          >
            <div
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border-2 border-emerald-400 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white relative">
                <button
                  type="button"
                  onClick={() => setIsSupportPopupOpen(false)}
                  className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 text-[10px] font-bold mb-1">
                  <ShieldCheck className="w-3 h-3 text-yellow-300" />
                  <span>অফিসিয়াল হেল্পডেস্ক</span>
                </div>
                <h4 className="text-base font-black text-white">পেমেন্ট ও এড মানি সাপোর্ট</h4>
                <p className="text-[11px] text-emerald-100 mt-0.5">
                  যেকোনো প্রয়োজনে আমাদের সাথে সরাসরি যোগাযোগ করুন
                </p>
              </div>

              <div className="p-4 space-y-3">
                {/* bKash Merchant copy */}
                <div className="p-3 bg-pink-50 rounded-2xl border border-pink-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-pink-900 block">বিকাশ মার্চেন্ট নম্বর (Make Payment)</span>
                    <span className="font-mono font-black text-pink-700 text-sm">{BKASH_MERCHANT_NUMBER}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-2.5 py-1 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>

                {/* WhatsApp Chat button */}
                <a
                  href={`https://wa.me/8801868775577?text=${encodeURIComponent(
                    `আসসালামু আলাইকুম, The MoSaFa Tools-এ "${documentTitle}" ডাউনলোড ও পেমেন্ট সংক্রান্ত বিষয়ে সহায়তা প্রয়োজন।`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp-এ সরাসরি চ্যাট করুন</span>
                </a>

                {/* Direct Call button */}
                <a
                  href="tel:01868775577"
                  className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>সরাসরি কল করুন (01868775577)</span>
                </a>

                {/* Switch to Add Money tab */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSupportPopupOpen(false);
                    setActiveTab('add-money');
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ব্যালেন্সে টাকা লোড করুন (মিনিমাম ৫০ টাকা) ➔</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
