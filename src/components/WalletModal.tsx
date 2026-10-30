import React from 'react';
import {
  X,
  Coins,
  Wallet,
  ArrowUpRight,
  Sparkles,
  Calendar,
  LogOut,
  ShieldCheck,
  RotateCw,
  Gift,
  Clock,
} from 'lucide-react';
import { useAuth, getTodayDateString } from '../context/AuthContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpinner: () => void;
  onOpenAuth: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onOpenSpinner,
  onOpenAuth,
}) => {
  const { user, isLoggedIn, logout, canSpinToday, transactions } = useAuth();

  if (!isOpen) return null;

  const coins = user?.coins || 0;
  // 1,000 coins = 10 BDT (0.01 BDT per coin)
  const approxCashBDT = (coins * 0.01).toFixed(2);
  const isSpunToday = !canSpinToday();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-amber-100 mb-2">
            <Wallet className="w-3.5 h-3.5 text-yellow-200" />
            <span>The MoSaFa কয়েন ওয়ালেট</span>
          </div>

          {/* User Info */}
          {isLoggedIn && user ? (
            <div className="flex items-center justify-center gap-2 mb-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border-2 border-white shadow"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/30 text-white font-extrabold flex items-center justify-center text-xs">
                  {user.displayName.charAt(0)}
                </div>
              )}
              <span className="font-bold text-sm tracking-wide text-white">
                {user.displayName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px]">
                সক্রিয়
              </span>
            </div>
          ) : (
            <p className="text-xs text-amber-100 font-medium mb-3">
              ফ্রি ভিজিটর মোড (গেস্ট ওয়ালেট)
            </p>
          )}

          {/* Coin Balance Card */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-xs mx-auto shadow-inner">
            <p className="text-xs text-amber-100 font-medium mb-1">মোট অর্জিত কয়েন ব্যালেন্স</p>
            <div className="flex items-center justify-center gap-2">
              <Coins className="w-8 h-8 text-yellow-300 animate-bounce" />
              <span className="text-4xl font-black text-white tracking-tight">
                {coins.toLocaleString('bn-BD')}
              </span>
              <span className="text-sm font-bold text-amber-200">কয়েন</span>
            </div>
            <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-xs text-amber-100">
              <span>আনুমানিক নগদ মান:</span>
              <span className="font-extrabold text-yellow-200 text-sm">
                ৳ {approxCashBDT} টাকা
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Action Button: Daily Spin */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <RotateCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">আজকের লাকি স্পিন</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isSpunToday ? 'আজকের স্পিন গ্রহণ করা হয়েছে ✅' : 'এখনই ঘুরিয়ে ১০০-১০০০ কয়েন জিতুন!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenSpinner();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-sm ${
                isSpunToday
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
              }`}
            >
              {isSpunToday ? 'স্পিন দেখুন' : 'স্পিন করুন 🎁'}
            </button>
          </div>

          {/* Cashout Notice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-2.5">
              <Gift className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-slate-900 mb-1">
                  ভবিষ্যতে নগদ টাকা ও বিকাশ রিডিম সুবিধা
                </h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  ব্যবহারকারীদের উৎসাহিত করার জন্য এই রিওয়ার্ড সিস্টেম তৈরি হয়েছে। প্রতিদিন অ্যাপে এসে স্পিন করুন ও কয়েন জমা করুন। নির্দিষ্ট কয়েন লক্ষ্য পূরণ হলে সরাসরি বিকাশ, নগদ বা রিচার্জে ক্যাশআউট নেওয়ার ব্যবস্থা খুব শীঘ্রই উন্মুক্ত করা হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Account status or register prompt */}
          {!isLoggedIn ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <p className="text-xs font-bold text-rose-900 mb-2">
                কয়েন ব্যালেন্স সুরক্ষিত রাখতে ফ্রি একাউন্ট তৈরি করুন!
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
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-600 flex items-center justify-between">
                <span>সাম্প্রতিক হিস্ট্রি</span>
                <span className="text-[10px] text-slate-400">রিয়েলটাইম আপডেট</span>
              </h4>
              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">{tx.date}</p>
                      </div>
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        +{tx.amount} কয়েন
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                    দৈনিক স্পিন ঘোরান এবং কয়েন অর্জন করুন!
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1.5 cursor-pointer py-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>লগআউট করুন</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
