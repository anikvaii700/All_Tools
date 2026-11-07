import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  Wallet,
  CreditCard,
  RotateCw,
  Gift,
  Copy,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  ArrowRight,
  LogOut,
  ShieldCheck,
  MessageCircle,
  UserCheck,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { adminUserService, DepositRequest } from '../services/adminUserService';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpinner: () => void;
  onOpenAuth: () => void;
  onOpenCvProfile?: () => void;
}

const BKASH_MERCHANT_NUMBER = '01868775577';

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onOpenSpinner,
  onOpenAuth,
  onOpenCvProfile,
}) => {
  const {
    user,
    isLoggedIn,
    logout,
    canSpinToday,
    transactions,
    addMainBalance,
    convertCoinsToMainBalance,
  } = useAuth();

  const [activeSection, setActiveSection] = useState<'overview' | 'add-money' | 'convert-coins'>('overview');
  const [addMoneyAmount, setAddMoneyAmount] = useState<number>(50); // Minimum 50 BDT
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>(() =>
    adminUserService.getDepositRequests()
  );

  useEffect(() => {
    const unsub = adminUserService.subscribeDeposits((reqs) => {
      setDepositRequests(reqs);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const mainBalance = Number(user?.balance || 0);
  const coins = Number(user?.coins || 0);
  const isSpunToday = !canSpinToday();

  const myDeposits = depositRequests.filter(
    (d) =>
      (user?.uid && d.userId === user.uid) ||
      (user?.phoneNumber && d.userPhone === user.phoneNumber) ||
      (user?.email && d.userEmail === user.email)
  );

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(BKASH_MERCHANT_NUMBER);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // Add Money Handler (Minimum 50 BDT - Submits for Admin TrxID verification)
  const handleAddMoney = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMessage(null);

    if (addMoneyAmount < 50) {
      setMessage({ type: 'error', text: 'মিনিমাম ৫০ টাকা এড মানি করতে পারবেন।' });
      return;
    }
    const cleanTrx = trxId.trim();
    if (!cleanTrx || cleanTrx.length < 4) {
      setMessage({ type: 'error', text: 'অনুগ্রহ করে বিকাশের সঠিক TrxID লিখুন।' });
      return;
    }

    setIsProcessing(true);
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
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {}
      setMessage({
        type: 'success',
        text: `৳${addMoneyAmount} টাকা এড মানি রিকোয়েস্ট সফলভাবে জমা হয়েছে! (TrxID: ${cleanTrx})। অ্যাডমিন বিকাশ স্টেটমেন্ট যাচাই করে অনুমোদন করলেই মূল ব্যালেন্সে টাকা যুক্ত হবে।`,
      });
      setTrxId('');
      setIsProcessing(false);
      setActiveSection('overview');
    } catch (err: any) {
      setIsProcessing(false);
      setMessage({ type: 'error', text: err?.message || 'এড মানি করতে সমস্যা হয়েছে।' });
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
      setMessage({
        type: 'success',
        text: 'পরীক্ষামূলক ৳৫০ টাকা আপনার মূল ব্যালেন্সে যোগ হয়েছে!',
      });
      setIsProcessing(false);
      setActiveSection('overview');
    } catch (err: any) {
      setIsProcessing(false);
      setMessage({ type: 'error', text: err?.message || 'সমস্যা হয়েছে' });
    }
  };

  // Coin to Main Balance Conversion (100 coins = 1 BDT)
  const handleConvertCoins = async (coinsToConvert: number) => {
    setMessage(null);
    if (coinsToConvert < 100) {
      setMessage({ type: 'error', text: 'কনভার্ট করতে ন্যূনতম ১০০ কয়েন প্রয়োজন।' });
      return;
    }
    if (coins < coinsToConvert) {
      setMessage({ type: 'error', text: 'আপনার একাউন্টে পর্যাপ্ত কয়েন নেই।' });
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
        setMessage({ type: 'success', text: res.message });
        setActiveSection('overview');
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setIsProcessing(false);
      setMessage({ type: 'error', text: err?.message || 'কয়েন কনভার্ট করতে সমস্যা হয়েছে।' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-rose-200 mb-2 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>The MoSaFa ডিজিটাল ওয়ালেট</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full border border-white/40 shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-extrabold flex items-center justify-center text-xs">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <h3 className="font-bold text-base text-white tracking-tight">
              {user?.displayName || 'ব্যবহারকারী ওয়ালেট'}
            </h3>
            {isLoggedIn && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                ভেরিফাইড
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            মূল ব্যালেন্স ও কয়েন ব্যালেন্স পৃথকভাবে পরিচালিত
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Feedback Banner */}
          {message && (
            <div
              className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* TWO SEPARATE BALANCE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. মূল ব্যালেন্স (Main Balance) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/15 border-2 border-emerald-500/30 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>মূল ব্যালেন্স (Main)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded-md">
                    টাকা
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight my-1">
                  ৳ {mainBalance.toFixed(2)}
                </div>
                <p className="text-[11px] text-emerald-900 font-medium leading-relaxed">
                  সকল সরকারি ফরম, রসিদ ও আবেদনপত্র ডাউনলোড ফি (প্রতিটি ৫ টাকা)।
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('add-money')}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>টাকা লোড করুন (মিন. ৫০৳)</span>
                </button>
              </div>
            </div>

            {/* 2. কয়েন ব্যালেন্স (Coin Balance) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/15 border-2 border-amber-500/30 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>কয়েন ব্যালেন্স (Coins)</span>
                  </span>
                  <span className="text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-md">
                    পয়েন্ট
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight my-1">
                  {coins.toLocaleString('bn-BD')}
                </div>
                <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                  স্পিন ও অ্যাক্টিভিটি থেকে অর্জিত। ১০০ কয়েন = ১ টাকা মূল মান।
                </p>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSection('convert-coins')}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1 transition cursor-pointer"
                  title="কয়েন কনভার্ট করে মূল ব্যালেন্সে নিন"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>কনভার্ট করুন 🔄</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSpinner();
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  title="লাকি স্পিন"
                >
                  <Gift className="w-3.5 h-3.5 text-yellow-300" />
                  <span>স্পিন</span>
                </button>
              </div>
            </div>
          </div>

          {/* CV Profile & Auto-fill Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 border border-indigo-200 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-black text-indigo-950">সিভি মাস্টার প্রোফাইল (Auto-Fill)</h5>
                <p className="text-[10px] text-indigo-700 font-medium">
                  একবার তথ্য সেভ করে রাখলে যে কোনো সিভি ফরম্যাটে স্বয়ংক্রিয়ভাবে অটু-ফিল হবে
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCvProfile?.();
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0 active:scale-95"
            >
              প্রোফাইল ওপেন ➔
            </button>
          </div>

          {/* SECTION: ADD MONEY (MINIMUM 50 BDT) */}
          {activeSection === 'add-money' && (
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-emerald-300 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>মূল ব্যালেন্সে টাকা লোড করুন</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveSection('overview')}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>

              {/* Min 50 BDT rule notice */}
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold">
                ⚠️ <strong>মিনিমাম ৫০ টাকা</strong> এড মানি করতে পারবেন। প্রতিটি রিচার্জ দিয়ে ১০টি সরকারি ফরম ডাউনলোড করতে পারবেন।
              </div>

              {/* Amount buttons */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  টাকার পরিমাণ (মিনিমাম ৫০ টাকা)
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAddMoneyAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                        addMoneyAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              {/* bKash Merchant Box */}
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
                <p className="text-[10px] text-pink-900 font-medium">
                  বিকাশ অ্যাপের <strong>Payment</strong> অপশন থেকে <strong>৳{addMoneyAmount} টাকা</strong> পাঠিয়ে TrxID লিখুন।
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleAddMoney}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'যাচাই করা হচ্ছে...' : `৳${addMoneyAmount} টাকা রিচার্জ করুন ➔`}</span>
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

          {/* SECTION: CONVERT COINS TO MAIN BALANCE */}
          {activeSection === 'convert-coins' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <span>কয়েন ব্যালেন্স কনভার্টার</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveSection('overview')}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                <p className="font-bold text-amber-900">কনভার্ট রেট: ১০০ কয়েন = ১ টাকা মূল ব্যালেন্স</p>
                <p className="text-[11px] text-slate-600">
                  আপনার মোট কয়েন: <strong>{coins} কয়েন</strong> (সর্বোচ্চ কনভার্ট মান: ৳{Math.floor(coins / 100)} টাকা)
                </p>
              </div>

              {/* Conversion Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[100, 300, 500].map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={coins < c || isProcessing}
                    onClick={() => handleConvertCoins(c)}
                    className="py-2.5 px-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-extrabold text-[11px] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center shadow-2xs"
                  >
                    <span>{c} কয়েন</span>
                    <span className="text-[10px] text-emerald-700 font-bold">= ৳{c / 100} টাকা</span>
                  </button>
                ))}
              </div>

              {coins >= 100 && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleConvertCoins(Math.floor(coins / 100) * 100)}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5 text-yellow-200" />
                  <span>সব কয়েন ({Math.floor(coins / 100) * 100}) কনভার্ট করে ৳{Math.floor(coins / 100)} টাকা নিন ➔</span>
                </button>
              )}
            </div>
          )}

          {/* Account status or register prompt if guest */}
          {!isLoggedIn ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <p className="text-xs font-bold text-rose-900 mb-2">
                ব্যালেন্স ও কয়েন স্থায়ীভাবে সংরক্ষণ করতে অ্যাকাউন্ট তৈরি করুন!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer hover:from-rose-700 hover:to-pink-700 transition"
              >
                ১ ক্লিকে অ্যাকাউন্ট তৈরি করুন
              </button>
            </div>
          ) : (
            /* Transactions History */
            <div className="space-y-2 pt-1">
              {/* My bKash Add Money Requests */}
              {myDeposits.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>আপনার বিকাশ এড মানি রিকোয়েস্ট</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold">এডমিন যাচাই</span>
                  </h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {myDeposits.slice(0, 3).map((dep) => (
                      <div
                        key={dep.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          dep.status === 'pending'
                            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                            : dep.status === 'approved'
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50/80 border-rose-200 text-rose-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span>৳{dep.amount} টাকা</span>
                            <span className="font-mono text-[10px] bg-white/70 px-1 rounded border">
                              TrxID: {dep.trxId}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-80 mt-0.5">
                            {dep.status === 'pending'
                              ? '⏳ অ্যাডমিন বিকাশ স্টেটমেন্ট যাচাই করছেন...'
                              : dep.status === 'approved'
                              ? '✓ অনুমোদিত! মূল ব্যালেন্সে যুক্ত হয়েছে।'
                              : `✕ বাতিল: ${dep.adminNote || 'তথ্য সঠিক ছিল না'}`}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                            dep.status === 'pending'
                              ? 'bg-amber-500 text-white animate-pulse'
                              : dep.status === 'approved'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {dep.status === 'pending' ? 'যাচাই চলছে' : dep.status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>সাম্প্রতিক লেনদেন হিস্ট্রি</span>
                <span className="text-[10px] text-slate-400">রিয়েলটাইম আপডেট</span>
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="pr-2">
                        <p className="font-bold text-slate-800 line-clamp-1">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">{tx.date}</p>
                      </div>
                      <span
                        className={`font-extrabold text-xs px-2 py-0.5 rounded-md shrink-0 ${
                          tx.amount >= 0
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {tx.unit === 'bdt'
                          ? `${tx.amount >= 0 ? '+' : ''}৳${tx.amount} টাকা`
                          : `${tx.amount >= 0 ? '+' : ''}${tx.amount} কয়েন`}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                    এখনো কোনো লেনদেন নেই।
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href="https://wa.me/8801868775577"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>পেমেন্ট সাপোর্ট (01868775577)</span>
                </a>
                <button
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
