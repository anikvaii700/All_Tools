import React, { useState } from 'react';
import {
  X,
  Lock,
  Phone,
  User,
  Sparkles,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Gift,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBonusPrompt?: number | null;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialBonusPrompt,
  onSuccess,
}) => {
  const { loginWithGoogle, loginOrRegisterWithPhone, isLoading } = useAuth();
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');

  // Phone registration state
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    try {
      await loginWithGoogle();
      setSuccessMessage('গুগল অ্যাকাউন্ট সফলভাবে সংযুক্ত হয়েছে! 🎉');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      setErrorMessage(
        err?.message?.includes('popup-closed')
          ? 'লগইন উইন্ডো বন্ধ করা হয়েছে। আবার চেষ্টা করুন।'
          : 'গুগল সাইন-ইনে সমস্যা হয়েছে। মোবাইল নাম্বার দিয়ে চেষ্টা করুন।'
      );
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (cleanPhone.length < 11) {
      setErrorMessage('সঠিক ১১ ডিজিটের মোবাইল নাম্বার লিখুন (যেমন: 017xxxxxxxx)');
      return;
    }
    if (pin.length < 4) {
      setErrorMessage('ন্যূনতম ৪ ডিজিটের সিকিউর পিন বা পাসওয়ার্ড দিন');
      return;
    }

    try {
      setSubmitting(true);
      await loginOrRegisterWithPhone(cleanPhone, pin, name.trim() || undefined);
      setSuccessMessage('মোবাইল অ্যাকাউন্ট সফলভাবে সংরক্ষিত হয়েছে! 🎉');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'অ্যাকাউন্টে প্রবেশ করতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative bg-gradient-to-br from-rose-600 via-pink-600 to-indigo-700 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-rose-100 mb-3">
            <Gift className="w-3.5 h-3.5 text-yellow-300" />
            <span>ফ্রি মেম্বারশিপ ও ক্যাশব্যাক রিওয়ার্ড</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight mb-1">
            {initialBonusPrompt ? 'কয়েন বোনাস ক্লেইম করুন!' : 'The MoSaFa একাউন্ট'}
          </h2>
          <p className="text-xs text-rose-100 font-medium leading-relaxed max-w-xs mx-auto">
            {initialBonusPrompt
              ? `অভিনন্দন! আপনি জিতেছেন ${initialBonusPrompt} কয়েন! অ্যাকাউন্ট খুললেই এই ব্যালেন্স ওয়ালেটে যোগ হবে।`
              : 'লগইন করে প্রতিদিনের ফ্রি স্পিন ও কয়েন রিওয়ার্ড জিতুন, ভবিষ্যতে টাকার সমমূল্যে ক্যাশআউট করুন!'}
          </p>

          {/* Bonus callout tag */}
          <div className="mt-4 bg-yellow-400 text-slate-950 px-4 py-2 rounded-2xl font-extrabold text-xs shadow-lg inline-flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-900" />
            <span>নতুন অ্যাকাউন্টে ১৫০ ফ্রি ওয়েলকাম কয়েন! 🎁</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Google Sign In */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || submitting}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border-2 border-slate-200 hover:border-rose-400 shadow-sm hover:shadow transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {/* Google G Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>জিমেইল দিয়ে সরাসরি ১-ক্লিক সাইন ইন</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider absolute">
                অথবা মোবাইল নাম্বার দিয়ে
              </span>
            </div>

            {/* Toggle button if folded */}
            {authMethod !== 'phone' ? (
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Phone className="w-4 h-4 text-slate-600" />
                <span>মোবাইল নাম্বার দিয়ে রেজিষ্টার / লগইন করতে ক্লিক করুন</span>
              </button>
            ) : (
              <form onSubmit={handlePhoneSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    আপনার নাম (ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: অনিক আহমেদ"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নাম্বার <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ৪ ডিজিটের সিকিউর পিন বা পাসওয়ার্ড <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="যেমন: 1234"
                      maxLength={8}
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 font-medium tracking-widest"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-rose-200 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>অ্যাকাউন্টে প্রবেশ করুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Guarantees & Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3 text-left">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 font-medium">১০০% ফ্রি ও নিরাপদ ডেটা এনক্রিপশন</p>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 font-medium">প্রতিদিন স্পিন ঘুরে ইনস্ট্যান্ট কয়েন</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            অ্যাকাউন্ট না খুলেও আপনি সাইটের সব টুলস ফ্রি ব্যবহার করতে পারবেন।
          </p>
        </div>
      </div>
    </div>
  );
};
