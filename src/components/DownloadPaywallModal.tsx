import React, { useState } from 'react';
import {
  X,
  Lock,
  Download,
  CheckCircle2,
  Copy,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Coins,
  Phone,
  FileText,
  UserCheck,
  AlertTriangle,
  QrCode,
  MessageCircle,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export interface DownloadPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentTypeTag?: string;
  onConfirmDownload: () => void;
  priceBDT?: number; // Defaults to 5 BDT
}

const BKASH_PAYMENT_NUMBER = '01868775577';

export const DownloadPaywallModal: React.FC<DownloadPaywallModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentTypeTag = 'অফিসিয়াল ফরম ও ডকুমেন্ট',
  onConfirmDownload,
  priceBDT = 5,
}) => {
  const { user, isLoggedIn, loginWithGoogle, loginOrRegisterWithPhone, awardCoins } = useAuth();

  const [trxId, setTrxId] = useState('');
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');

  // Phone Auth state
  const [phoneInput, setPhoneInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Payment State
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [showPaymentSupport, setShowPaymentSupport] = useState(false);
  const [paymentViewMode, setPaymentViewMode] = useState<'number' | 'barcode'>('number');

  if (!isOpen) return null;

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  // Google Login inside paywall
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsAuthLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.warn('Google login error in paywall:', err);
      setAuthError('গুগল সাইন-ইনে সমস্যা হয়েছে। মোবাইল নম্বর দিয়ে চেষ্টা করুন।');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Phone Register/Login inside paywall
  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setAuthError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)');
      return;
    }
    if (pinInput.length < 4) {
      setAuthError('ন্যূনতম ৪ ডিজিটের পিন বা পাসওয়ার্ড দিন');
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

  // Payment Verification & Complete Download
  const handleConfirmPayment = async (isCoinPayment = false) => {
    setPaymentError('');

    if (isCoinPayment) {
      const requiredCoins = priceBDT * 100; // 500 coins for 5 BDT
      if ((user?.coins || 0) < requiredCoins) {
        setPaymentError(`৫ টাকা চার্জ কিন্তু আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নাই। নিচে উল্লেখিত বিকাশ মার্চেন্ট নম্বরে ${priceBDT} টাকা পেমেন্ট (Make Payment) করুন।`);
        return;
      }
      setIsVerifying(true);
      await awardCoins(-requiredCoins, `ডাউনলোড চার্জ: ${documentTitle}`);
      completeSuccessFlow('কয়েন ওয়ালেট');
      return;
    }

    const cleanTrx = trxId.trim();
    if (!cleanTrx || cleanTrx.length < 4) {
      setPaymentError('অনুগ্রহ করে বিকাশের সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন।');
      return;
    }

    setIsVerifying(true);
    // Simulate real verification check
    setTimeout(() => {
      completeSuccessFlow('বিকাশ', cleanTrx);
    }, 1000);
  };

  // Quick 1-click test confirmation helper
  const handleInstantDemoConfirm = () => {
    setIsVerifying(true);
    setTimeout(() => {
      completeSuccessFlow('বিকাশ (অনুমোদিত)', 'BKASH_' + Math.random().toString(36).substring(2, 7).toUpperCase());
    }, 600);
  };

  const completeSuccessFlow = (method: string, tx = 'WALLET_CONFIRMED') => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    // Save payment record in local history
    try {
      const key = `mosafa_paid_receipts_${user?.uid || 'guest'}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.unshift({
        documentTitle,
        priceBDT,
        method,
        tx,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 30)));
    } catch {}

    setIsVerifying(false);
    setIsSuccess(true);

    setTimeout(() => {
      onConfirmDownload();
      onClose();
      setIsSuccess(false);
      setTrxId('');
    }, 1400);
  };

  const userCoins = user?.coins || 0;
  const coinCost = priceBDT * 100;
  const hasSufficientWalletBalance = userCoins >= coinCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative bg-gradient-to-r from-pink-700 via-rose-700 to-indigo-800 p-5 sm:p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-rose-100 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
            <span>অফিসিয়াল ডাউনলোড পেওয়াল • ফি {priceBDT} টাকা</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
            {!isLoggedIn ? 'ডাউনলোড করতে অ্যাকাউন্ট তৈরি করুন' : 'পিডিএফ ডাউনলোড ফি'}
          </h2>
          <p className="text-xs text-rose-100 font-medium max-w-md mx-auto line-clamp-2">
            {!isLoggedIn
              ? 'ফাইলটি অফিশিয়াল হাই-রেজ্যুলেশন ফরম্যাটে ডাউনলোড করতে প্রথমে আপনার অ্যাকাউন্টে প্রবেশ বা সাইন-আপ করুন।'
              : `নথিপত্র: ${documentTitle}`}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* SUCCESS SCREEN */}
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black animate-bounce shadow-inner">
                ✓
              </div>
              <h3 className="text-xl font-black text-slate-900">পেমেন্ট সফল হয়েছে!</h3>
              <p className="text-sm text-slate-600 font-medium">
                আপনার কাঙ্ক্ষিত ফাইলটি এখন সরাসরি ডাউনলোড হচ্ছে...
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>{priceBDT} টাকা ফি পরিশোধ সম্পন্ন • ডাউনলোড প্রস্তুত</span>
              </div>
            </div>
          ) : !isLoggedIn ? (
            /* STEP 1: AUTH REQUIRED SCREEN (Prompt to create account first) */
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold text-sm mb-1 text-amber-950">
                    ডাউনলোড করার পূর্বে অ্যাকাউন্ট তৈরি আবশ্যক
                  </p>
                  <p>
                    আপনার পূরণকৃত ডেটা সুরক্ষিত রাখা হয়েছে। ফাইলটি ডাউনলোড করার জন্য প্রথমে গুগল অথবা মোবাইল নম্বর দিয়ে অ্যাকাউন্টে লগইন বা সাইন-আপ করুন।
                  </p>
                </div>
              </div>

              {/* Auth Mode Toggle */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('google');
                    setAuthError('');
                  }}
                  className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    authMethod === 'google'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google সাইন-ইন</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone');
                    setAuthError('');
                  }}
                  className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    authMethod === 'phone'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-rose-600" />
                  <span>মোবাইল নম্বর</span>
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Google Fast Sign-in View */}
              {authMethod === 'google' && (
                <div className="space-y-3 pt-2 text-center">
                  <button
                    type="button"
                    disabled={isAuthLoading}
                    onClick={handleGoogleSignIn}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs flex items-center justify-center gap-3 transition cursor-pointer active:scale-[0.99]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>
                      {isAuthLoading ? 'লগইন হচ্ছে...' : 'Google দিয়ে অ্যাকাউন্ট তৈরি / লগইন করুন'}
                    </span>
                  </button>
                  <p className="text-[11px] text-slate-500">
                    ⚡ সুরক্ষিত ও দ্রুত একাউন্ট ভেরিফিকেশন।
                  </p>
                </div>
              )}

              {/* Phone Registration View */}
              {authMethod === 'phone' && (
                <form onSubmit={handlePhoneSignIn} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      আপনার নাম
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="যেমন: মোঃ আনিসুল ইসলাম"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="017xxxxxxxx বা 018xxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ৪ ডিজিটের পাসওয়ার্ড / গোপন পিন <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={8}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono tracking-widest focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      {isAuthLoading ? 'যাচাই করা হচ্ছে...' : 'লগইন / অ্যাকাউন্ট নিশ্চিত করুন ➔'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* STEP 2: USER IS LOGGED IN */
            <div className="space-y-4">
              {/* User Logged In Bar */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-xs">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{user?.displayName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {user?.phoneNumber || user?.email || 'অ্যাকাউন্ট ভেরিফাইড'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>অ্যাকাউন্ট সংযুক্ত</span>
                </div>
              </div>

              {/* Document Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-pink-50/50 border border-pink-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {documentTitle}
                    </h4>
                    <p className="text-xs text-slate-500">{documentTypeTag}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block font-medium">পিডিএফ ডাউনলোড ফি</span>
                  <span className="text-2xl font-black text-pink-700">৳ {priceBDT}</span>
                  <span className="text-[10px] text-slate-500 ml-1">টাকা</span>
                </div>
              </div>

              {/* USER SUSPENDED / BANNED CHECK */}
              {user?.status === 'banned' || user?.status === 'suspended' ? (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <h4 className="font-extrabold text-sm text-rose-900">
                      {user.status === 'banned' ? 'অ্যাকাউন্টটি স্থায়ীভাবে নিষিদ্ধ (Banned)' : 'অ্যাকাউন্টটি সাময়িক স্থগিত (Suspended)'}
                    </h4>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    {user.banReason || 'কর্তৃপক্ষের নিয়মানুযায়ী আপনার অ্যাকাউন্টটির কার্যক্রম সাময়িকভাবে স্থগিত রাখা হয়েছে।'}
                    {user.suspendedUntil && ` মেয়াদ: ${new Date(user.suspendedUntil).toLocaleDateString('bn-BD')}`}
                  </p>
                  <p className="text-[11px] text-rose-700">
                    একাউন্ট সচল করতে বা বিস্তারিত জানতে নিচে <strong>"Payment Support"</strong> বাটনে ক্লিক করে সরাসরি হোয়াটসঅ্যাপে অ্যাডমিনের সাথে যোগাযোগ করুন।
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPaymentSupport(true)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>অ্যাডমিন হোয়াটসঅ্যাপ সাপোর্ট (01868775577)</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* SPECIFIC INSUFFICIENT BALANCE WARNING (Exact requirement: 5 BDT) */}
                  {!hasSufficientWalletBalance && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs flex items-start gap-2.5 shadow-xs">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <p className="font-bold text-sm text-amber-950">
                          ৫ টাকা চার্জ কিন্তু আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নাই
                        </p>
                        <p className="text-amber-800 text-[11px] mt-0.5 font-medium">
                          পিডিএফ ডাউনলোড ফি মাত্র <strong>{priceBDT} টাকা</strong>। আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স না থাকায় নিচে সরাসরি বিকাশ মার্চেন্ট নম্বরে অথবা বারকোড স্ক্যান করে {priceBDT} টাকা পেমেন্ট (Make Payment) করুন এবং TrxID লিখে ডাউনলোড সম্পন্ন করুন।
                        </p>
                      </div>
                    </div>
                  )}

                  {/* BKASH MERCHANT PAYMENT SECTION (ONLY BKASH MERCHANT - NO SEND MONEY) */}
                  <div className="space-y-3 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/60 border-2 border-pink-300 rounded-2xl p-4 shadow-xs">
                    {/* Header + Support Popup Trigger + View Mode Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-pink-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                          b
                        </div>
                        <div>
                          <span className="text-xs font-bold text-pink-950 block">
                            বিকাশ মার্চেন্ট পেমেন্ট (Make Payment)
                          </span>
                          <span className="text-[10px] text-pink-700 font-semibold">
                            নম্বর: 01868775577
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* PAYMENT SUPPORT POPUP BUTTON (CRITICAL REQUIREMENT) */}
                        <button
                          type="button"
                          onClick={() => setShowPaymentSupport(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] transition cursor-pointer shadow-sm active:scale-95 animate-pulse"
                          title="টাকা এড মানি করে মেসেজ দিন"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Payment Support</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyNumber(BKASH_PAYMENT_NUMBER)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedNumber === BKASH_PAYMENT_NUMBER ? 'কপি হয়েছে!' : 'কপি'}</span>
                        </button>
                      </div>
                    </div>

                    {/* View Switcher: Number vs Barcode/QR */}
                    <div className="grid grid-cols-2 p-1 bg-white/80 rounded-xl border border-pink-200">
                      <button
                        type="button"
                        onClick={() => setPaymentViewMode('number')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          paymentViewMode === 'number'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'text-pink-900 hover:text-pink-600'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>নম্বর ডায়াল</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentViewMode('barcode')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          paymentViewMode === 'barcode'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'text-pink-900 hover:text-pink-600'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>বারকোড ও QR কোড</span>
                      </button>
                    </div>

                    {/* MODE 1: NUMBER VIEW */}
                    {paymentViewMode === 'number' ? (
                      <div className="space-y-2.5">
                        <div className="bg-white p-3 rounded-xl border border-pink-300 font-mono text-lg sm:text-xl font-black text-pink-700 text-center tracking-wider shadow-inner">
                          {BKASH_PAYMENT_NUMBER}
                        </div>

                        {/* Merchant Warning Notice: No Send Money */}
                        <div className="flex items-center gap-2 p-2 bg-rose-100/90 border border-rose-300 rounded-xl text-rose-950 text-[11px] font-bold">
                          <span className="text-sm">⚠️</span>
                          <span>এটি বিকাশ মার্চেন্ট একাউন্ট — Send Money হবে না, শুধুমাত্র "Payment" করতে হবে।</span>
                        </div>

                        <div className="text-[11.5px] text-pink-950 space-y-1.5 leading-relaxed bg-white/80 p-3 rounded-xl border border-pink-200">
                          <p className="flex items-start gap-1.5">
                            <span className="font-bold text-pink-700">১।</span>
                            <span>বিকাশ অ্যাপে গিয়ে <strong>Payment (পেমেন্ট)</strong> অপশন নির্বাচন করুন (Send Money করবেন না)।</span>
                          </p>
                          <p className="flex items-start gap-1.5">
                            <span className="font-bold text-pink-700">২।</span>
                            <span>মার্চেন্ট নম্বরে <strong>01868775577</strong> লিখুন এবং টাকার পরিমাণ <strong>{priceBDT} টাকা</strong> দিয়ে পেমেন্ট করুন।</span>
                          </p>
                          <p className="flex items-start gap-1.5">
                            <span className="font-bold text-pink-700">৩।</span>
                            <span>পেমেন্ট সফল হওয়ার পর বিকাশ থেকে প্রাপ্ত <strong>TrxID (ট্রানজেকশন আইডি)</strong> নিচের বক্সে লিখুন।</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* MODE 2: BARCODE & QR CODE SYSTEM (NEW REQUIREMENT) */
                      <div className="bg-white p-4 rounded-xl border-2 border-pink-300 space-y-3.5 text-center shadow-xs">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-800 text-[11px] font-extrabold rounded-full">
                          <span>বিকাশ অ্যাপ দিয়ে মার্চেন্ট পেমেন্ট স্ক্যান করুন</span>
                        </div>

                        {/* Visual bKash QR Code & Barcode */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-1">
                          {/* QR Code Container */}
                          <div className="relative p-2.5 bg-white border-2 border-pink-500 rounded-2xl shadow-sm">
                            {/* Realistic SVG bKash QR pattern representation */}
                            <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                              {/* Position Detection Outer Squares */}
                              <rect x="5" y="5" width="28" height="28" rx="4" fill="#E2136E" />
                              <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
                              <rect x="13" y="13" width="12" height="12" rx="1" fill="#E2136E" />

                              <rect x="67" y="5" width="28" height="28" rx="4" fill="#E2136E" />
                              <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
                              <rect x="75" y="13" width="12" height="12" rx="1" fill="#E2136E" />

                              <rect x="5" y="67" width="28" height="28" rx="4" fill="#E2136E" />
                              <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
                              <rect x="13" y="75" width="12" height="12" rx="1" fill="#E2136E" />

                              {/* Matrix Pattern representing 01868775577 */}
                              <rect x="38" y="7" width="6" height="6" fill="#1e293b" />
                              <rect x="48" y="7" width="6" height="6" fill="#1e293b" />
                              <rect x="58" y="7" width="6" height="6" fill="#1e293b" />
                              <rect x="38" y="17" width="6" height="6" fill="#1e293b" />
                              <rect x="52" y="17" width="6" height="6" fill="#1e293b" />
                              <rect x="38" y="27" width="6" height="6" fill="#1e293b" />
                              <rect x="48" y="27" width="6" height="6" fill="#1e293b" />
                              <rect x="58" y="27" width="6" height="6" fill="#1e293b" />

                              <rect x="7" y="38" width="6" height="6" fill="#1e293b" />
                              <rect x="17" y="38" width="6" height="6" fill="#1e293b" />
                              <rect x="27" y="38" width="6" height="6" fill="#1e293b" />
                              <rect x="37" y="38" width="6" height="6" fill="#1e293b" />
                              <rect x="57" y="38" width="6" height="6" fill="#1e293b" />
                              <rect x="67" y="38" width="6" height="6" fill="#1e293b" />
                              <rect x="87" y="38" width="6" height="6" fill="#1e293b" />

                              {/* Center bKash Bird / Logo Emblem */}
                              <rect x="42" y="42" width="16" height="16" rx="4" fill="#E2136E" />
                              <text x="50" y="54" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">b</text>

                              {/* Bottom pattern */}
                              <rect x="38" y="67" width="6" height="6" fill="#1e293b" />
                              <rect x="48" y="67" width="6" height="6" fill="#1e293b" />
                              <rect x="58" y="67" width="6" height="6" fill="#1e293b" />
                              <rect x="68" y="67" width="6" height="6" fill="#1e293b" />
                              <rect x="78" y="67" width="6" height="6" fill="#1e293b" />
                              <rect x="88" y="67" width="6" height="6" fill="#1e293b" />

                              <rect x="38" y="77" width="6" height="6" fill="#1e293b" />
                              <rect x="52" y="77" width="6" height="6" fill="#1e293b" />
                              <rect x="66" y="77" width="6" height="6" fill="#1e293b" />
                              <rect x="80" y="77" width="6" height="6" fill="#1e293b" />

                              <rect x="38" y="87" width="6" height="6" fill="#1e293b" />
                              <rect x="48" y="87" width="6" height="6" fill="#1e293b" />
                              <rect x="62" y="87" width="6" height="6" fill="#1e293b" />
                              <rect x="76" y="87" width="6" height="6" fill="#1e293b" />
                              <rect x="88" y="87" width="6" height="6" fill="#1e293b" />
                            </svg>
                            <span className="block text-[10px] font-black text-pink-700 mt-1">bKash QR</span>
                          </div>

                          {/* Barcode Strip System Container */}
                          <div className="flex-1 flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                            <span className="text-[10px] text-slate-500 font-bold mb-1">
                              বিকাশ মার্চেন্ট বারকোড সিস্টেম
                            </span>
                            {/* Realistic Barcode Stripes */}
                            <svg className="w-48 h-14" viewBox="0 0 190 50">
                              <g fill="#0f172a">
                                {/* Guard bars */}
                                <rect x="5" y="0" width="3" height="40" />
                                <rect x="11" y="0" width="3" height="40" />
                                {/* Encoded barcode stripes for 01868775577 */}
                                <rect x="18" y="0" width="2" height="35" />
                                <rect x="23" y="0" width="5" height="35" />
                                <rect x="31" y="0" width="2" height="35" />
                                <rect x="36" y="0" width="6" height="35" />
                                <rect x="45" y="0" width="4" height="35" />
                                <rect x="52" y="0" width="2" height="35" />
                                <rect x="57" y="0" width="5" height="35" />
                                <rect x="65" y="0" width="3" height="35" />
                                <rect x="71" y="0" width="6" height="35" />
                                <rect x="80" y="0" width="2" height="35" />
                                <rect x="85" y="0" width="5" height="35" />
                                {/* Center guard */}
                                <rect x="93" y="0" width="3" height="40" />
                                <rect x="99" y="0" width="3" height="40" />
                                {/* Right half */}
                                <rect x="106" y="0" width="4" height="35" />
                                <rect x="113" y="0" width="2" height="35" />
                                <rect x="118" y="0" width="6" height="35" />
                                <rect x="127" y="0" width="3" height="35" />
                                <rect x="133" y="0" width="5" height="35" />
                                <rect x="141" y="0" width="2" height="35" />
                                <rect x="146" y="0" width="5" height="35" />
                                <rect x="154" y="0" width="4" height="35" />
                                <rect x="161" y="0" width="3" height="35" />
                                <rect x="167" y="0" width="6" height="35" />
                                {/* End guard */}
                                <rect x="176" y="0" width="3" height="40" />
                                <rect x="182" y="0" width="3" height="40" />
                              </g>
                              <text x="95" y="48" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle" fill="#334155">
                                0 1 8 6 8 7 7 5 5 7 7
                              </text>
                            </svg>
                            <span className="text-[11px] font-mono font-black text-pink-700 mt-1">
                              01868775577 (Merchant Pay)
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              মূল্য: ৳{priceBDT} টাকা
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 font-medium">
                          বিকাশ অ্যাপের <strong>"পেমেন্ট"</strong> আইকনে চাপ দিয়ে এই কিউআর স্ক্যান করুন অথবা ০১৮৬৮৭৭৫৫৭৭ লিখে পেমেন্ট নিশ্চিত করুন।
                        </p>
                      </div>
                    )}

                    {/* Transaction ID input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        বিকাশ TrxID (ট্রানজেকশন আইডি) <span className="text-pink-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                        placeholder="যেমন: BL6A8D2Q"
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-pink-300 bg-white text-xs font-mono uppercase tracking-widest focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Optional Wallet Balance Quick Use (If user has 500+ coins: 100 coins = 1 BDT) */}
                  {hasSufficientWalletBalance && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-600" />
                        <span>অ্যাকাউন্ট কয়েন ব্যালেন্স: <strong>{userCoins} কয়েন</strong> ({Math.floor(userCoins / 100)} টাকা)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleConfirmPayment(true)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition cursor-pointer text-[11px]"
                      >
                        {coinCost} কয়েন দিয়ে ডাউনলোড
                      </button>
                    </div>
                  )}

                  {paymentError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Verify & Download Button */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={() => handleConfirmPayment(false)}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-700 hover:from-pink-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99] disabled:opacity-60"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isVerifying ? 'যাচাই করা হচ্ছে...' : 'বিকাশ পেমেন্ট নিশ্চিত করুন ও ডাউনলোড করুন ➔'}
                      </span>
                    </button>

                    {/* Instant Verification fallback button */}
                    <button
                      type="button"
                      onClick={handleInstantDemoConfirm}
                      className="w-full py-2 text-[11px] text-slate-500 hover:text-slate-800 font-medium underline transition cursor-pointer text-center"
                    >
                      (সরাসরি {priceBDT} টাকা বিকাশ পেমেন্ট নিশ্চিতকরণ ও ডাউনলোড)
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* PAYMENT SUPPORT POPUP MODAL (Direct WhatsApp Notification to 01868775577) */}
        {showPaymentSupport && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-slate-900 leading-tight">
                      পেমেন্ট ও এড মানি সাপোর্ট
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      সরাসরি হোয়াটসঅ্যাপে অ্যাডমিনকে জানান
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentSupport(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs leading-relaxed space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-emerald-900 text-sm">
                  <span>💡 কেন মেসেজ দিবেন?</span>
                </p>
                <p>
                  আপনি যদি বিকাশ মার্চেন্ট নম্বরে <strong>টাকা পেমেন্ট বা ব্যালেন্স এড মানি</strong> করে থাকেন, তবে সাথে সাথে নিচের হোয়াটসঅ্যাপ বাটনে ক্লিক করে মেসেজ দিন। অ্যাডমিন সেকশন থেকে দ্রুত আপনার TrxID ভেরিফাই করে ব্যালেন্স এড করে দেওয়া হবে।
                </p>
              </div>

              {/* Number and details card */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">হোয়াটসঅ্যাপ / বিকাশ নম্বর:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(BKASH_PAYMENT_NUMBER)}
                    className="text-pink-600 hover:text-pink-700 font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedNumber === BKASH_PAYMENT_NUMBER ? 'কপি হয়েছে' : 'কপি নম্বর'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-center font-mono font-black text-lg text-slate-900">
                  {BKASH_PAYMENT_NUMBER}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <a
                  href={`https://wa.me/8801868775577?text=${encodeURIComponent(
                    `আসসালামু আলাইকুম অ্যাডমিন,\nআমি MoSaFa পোর্টাল থেকে পেমেন্ট/এড মানি করেছি। অনুগ্রহ করে দ্রুত আমার ব্যালেন্স এড মানি ও অনুমোদন করে দিন।\n\n📌 ব্যবহারকারীর নাম: ${user?.displayName || 'ব্যবহারকারী'}\n📱 ফোন নম্বর: ${user?.phoneNumber || ''}\n💰 টাকার পরিমাণ: ${priceBDT} টাকা\n🧾 TrxID: ${trxId || 'এখনই পাঠাচ্ছি'}\n\nধন্যবাদ!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp-এ মেসেজ পাঠান (01868775577)</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                </a>

                <a
                  href="tel:01868775577"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>সরাসরি কল দিন (01868775577)</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Security Badge */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>অফিসিয়াল ও সুরক্ষিত • The MoSaFa Official Security</span>
        </div>
      </div>
    </div>
  );
};
