import React, { useState, useMemo } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WelcomeAuthScreenProps {
  onSkip: () => void;
  onSuccess?: () => void;
  isModal?: boolean;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
}

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({
  onSkip,
  onSuccess,
  isModal = false,
  onClose,
  initialMode = 'login',
}) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginOrRegisterWithPhone,
    resetPassword,
    isLoading,
  } = useAuth();

  // Sliding state: false = Login view, true = Register view
  const [isRegister, setIsRegister] = useState<boolean>(initialMode === 'register');

  // Input states for Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Input states for Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Status & feedback
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleCopyCurrentDomain = () => {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    if (currentHost && navigator?.clipboard) {
      navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleSwitchToRegister = () => {
    clearMessages();
    setIsForgotPassword(false);
    setIsRegister(true);
  };

  const handleSwitchToLogin = () => {
    clearMessages();
    setIsForgotPassword(false);
    setIsRegister(false);
  };

  // Google 1-Click Login
  const handleGoogleLogin = async () => {
    clearMessages();
    try {
      setSubmitting(true);
      await loginWithGoogle();
      setSuccessMessage('গুগল অ্যাকাউন্ট সফলভাবে সংযুক্ত হয়েছে! 🎉');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        onSkip();
      }, 700);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/popup-closed-by-user' || msg.includes('popup-closed')) {
        setErrorMessage('সাইন-ইন উইন্ডো বন্ধ করা হয়েছে। আবার চেষ্টা করুন।');
      } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
        setErrorMessage(
          `ফায়ারবেসে বর্তমান প্রিভিউ ডোমেইনটি (${currentHost}) Authorized Domains তালিকায় যুক্ত করা নেই। এটি শুধু এই প্রিভিউ লিংকটির জন্য—আপনার মূল ওয়েবসাইটে (tools.mosafabd.com) এটি ঘটবে না কারণ tools.mosafabd.com ইতিমধ্যে ফায়ারবেসে যুক্ত রয়েছে।`
        );
      } else if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
        setErrorMessage(
          'ব্রাউজার পপআপ উইন্ডো ব্লক করেছে। পপআপ Allow করুন অথবা নিচে সরাসরি ইমেইল/মোবাইল দিয়ে লগইন করুন।'
        );
      } else {
        setErrorMessage(
          msg ? `গুগল সাইন-ইনে সমস্যা: ${msg}। নিচে সরাসরি ইমেইল বা ফোন দিয়ে লগইন করুন।` : 'গুগল সাইন-ইনে সমস্যা হয়েছে। নিচে ইমেইল বা ফোন দিয়ে চেষ্টা করুন।'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Login Submit (Supports Email or Phone Number)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const id = loginEmail.trim();
    if (!id) {
      setErrorMessage('ইমেইল এড্রেস অথবা মোবাইল নাম্বার লিখুন');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('পাসওয়ার্ড লিখুন');
      return;
    }

    try {
      setSubmitting(true);
      // If user typed a phone number (e.g. 017...)
      if (/^[0-9+]{11,14}$/.test(id.replace(/\s+/g, ''))) {
        await loginOrRegisterWithPhone(id, loginPassword);
      } else {
        await loginWithEmail(id, loginPassword);
      }
      setSuccessMessage('লগইন সফল হয়েছে! স্বাগতম। 🎉');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        onSkip();
      }, 700);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        setErrorMessage('ইমেইল বা পাসওয়ার্ড সঠিক নয়। দয়া করে পরীক্ষা করুন।');
      } else {
        setErrorMessage(err?.message || 'লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const id = regEmail.trim();
    if (!id) {
      setErrorMessage('ইমেইল এড্রেস অথবা মোবাইল নাম্বার লিখুন');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে');
      return;
    }

    try {
      setSubmitting(true);
      if (/^[0-9+]{11,14}$/.test(id.replace(/\s+/g, ''))) {
        await loginOrRegisterWithPhone(id, regPassword, regName.trim() || undefined);
      } else {
        await registerWithEmail(id, regPassword, regName.trim() || undefined);
      }
      setSuccessMessage('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বাগতম। 🎉');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        onSkip();
      }, 700);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setErrorMessage('এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট রয়েছে। লগইন করুন।');
      } else {
        setErrorMessage(err?.message || 'রেজিস্ট্রেশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Forgot password submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    const cleanEmail = resetEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('সঠিক ইমেইল এড্রেস লিখুন');
      return;
    }
    try {
      setSubmitting(true);
      await resetPassword(cleanEmail);
      setSuccessMessage('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে। ইনবক্স চেক করুন!');
    } catch (err: any) {
      setErrorMessage('পাসওয়ার্ড রিসেট ইমেইল পাঠাতে ব্যর্থ হয়েছে। ইমেইল সঠিক কি না পরীক্ষা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const renderErrorBanner = (msg: string) => {
    if (!msg) return null;
    const isDomainError = msg.includes('Authorized Domains');
    return (
      <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start justify-between gap-2 shadow-2xs animate-in fade-in duration-200">
        <div className="flex items-start gap-2 flex-1">
          <span className="shrink-0 text-sm mt-0.5">⚠️</span>
          <div className="flex-1 space-y-1.5">
            <p className="leading-snug">{msg}</p>
            {isDomainError && (
              <button
                type="button"
                onClick={handleCopyCurrentDomain}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-white text-rose-800 border border-rose-300 rounded-md hover:bg-rose-100 transition cursor-pointer shadow-2xs"
              >
                {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDomain ? 'ডোমেইন কপি হয়েছে!' : 'প্রিভিউ ডোমেইন কপি করুন'}</span>
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setErrorMessage('')}
          className="text-rose-400 hover:text-rose-700 p-0.5 text-xs font-bold shrink-0 cursor-pointer"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      </div>
    );
  };

  return (
    <div
      className={`${
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-[6px] animate-in fade-in duration-300'
          : 'min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 bg-[#EDF2F4] relative overflow-y-auto font-sans'
      }`}
    >
      {/* Decorative ambient background glows */}
      {!isModal && (
        <>
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#00C8D7]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#003B4A]/20 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* =========================================================================
          DESKTOP SLIDING SPLIT-SCREEN CONTAINER (Hidden on Mobile)
      ========================================================================= */}
      <div
        className="hidden md:flex relative w-full max-w-[860px] h-[530px] bg-white rounded-[32px] shadow-2xl border border-slate-200/90 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-40 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* -----------------------------------------------------------------------
            FORM 1: REGISTRATION FORM (Positioned on the Left half, 0% to 50%)
        ----------------------------------------------------------------------- */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full p-8 lg:p-10 flex flex-col justify-between transition-all duration-700 ease-in-out ${
            isRegister
              ? 'opacity-100 z-10 translate-x-0 pointer-events-auto'
              : 'opacity-0 z-0 -translate-x-8 pointer-events-none'
          }`}
        >
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-1">
              Registration
            </h2>
            <p className="text-xs text-slate-500 text-center font-medium mb-4">
              নতুন অ্যাকাউন্ট তৈরি করতে তথ্য পূরণ করুন
            </p>

            {/* Error & Success Messages */}
            {isRegister && renderErrorBanner(errorMessage)}
            {successMessage && isRegister && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Username / আপনার নাম"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-100/90 border border-transparent focus:border-[#00C8D7] focus:bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none transition"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Email or Mobile / ইমেইল বা ফোন"
                    required
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-100/90 border border-transparent focus:border-[#00C8D7] focus:bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Password / পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                    required
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-100/90 border border-transparent focus:border-[#00C8D7] focus:bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#003B4A] to-[#00C8D7] hover:brightness-110 active:scale-[0.99] text-white font-extrabold text-sm rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Register</span>
                )}
              </button>
            </form>
          </div>

          <div>
            <p className="text-[11px] text-slate-400 text-center mb-2">or register with social platforms</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-10 h-10 rounded-xl border border-slate-200 hover:border-[#00C8D7] bg-white flex items-center justify-center shadow-2xs hover:shadow transition cursor-pointer"
                title="Google Sign In"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>
            </div>

            {/* Guest Skip */}
            <div className="mt-3 text-center border-t border-slate-100 pt-2.5">
              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-bold text-slate-500 hover:text-[#003B4A] transition cursor-pointer"
              >
                এখন অ্যাকাউন্ট করবো না — সরাসরি প্রবেশ করুন ➔
              </button>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            FORM 2: LOGIN FORM (Positioned on the Right half, 50% to 100%)
        ----------------------------------------------------------------------- */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full p-8 lg:p-10 flex flex-col justify-between transition-all duration-700 ease-in-out ${
            !isRegister
              ? 'opacity-100 z-10 translate-x-0 pointer-events-auto'
              : 'opacity-0 z-0 translate-x-8 pointer-events-none'
          }`}
        >
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-1">
              Login
            </h2>
            <p className="text-xs text-slate-500 text-center font-medium mb-4">
              আপনার অ্যাকাউন্টে প্রবেশ করুন
            </p>

            {/* Error & Success Messages */}
            {!isRegister && renderErrorBanner(errorMessage)}
            {successMessage && !isRegister && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {isForgotPassword ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3 pt-2">
                <p className="text-xs text-slate-600 text-center">
                  আপনার ইমেইল দিন, পাসওয়ার্ড রিসেট লিংক পাঠানো হবে
                </p>
                <div className="relative">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="example@mail.com"
                    required
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-100/90 border border-transparent focus:border-[#00C8D7] focus:bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none transition"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-gradient-to-r from-[#003B4A] to-[#00C8D7] text-white font-bold text-xs rounded-full shadow-md"
                >
                  রিসেট লিংক পাঠান
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 pt-1"
                >
                  লগইনে ফিরে যান
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Username, Email or Mobile"
                      required
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-100/90 border border-transparent focus:border-[#00C8D7] focus:bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none transition"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-100/90 border border-transparent focus:border-[#00C8D7] focus:bg-white text-xs sm:text-sm font-medium text-slate-800 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setIsForgotPassword(true);
                      setResetEmail(loginEmail);
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-[#00C8D7] cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#003B4A] to-[#00C8D7] hover:brightness-110 active:scale-[0.99] text-white font-extrabold text-sm rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </form>
            )}
          </div>

          <div>
            <p className="text-[11px] text-slate-400 text-center mb-2">or login with social platforms</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-10 h-10 rounded-xl border border-slate-200 hover:border-[#00C8D7] bg-white flex items-center justify-center shadow-2xs hover:shadow transition cursor-pointer"
                title="Google Sign In"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>
            </div>

            {/* Guest Skip */}
            <div className="mt-3 text-center border-t border-slate-100 pt-2.5">
              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-bold text-slate-500 hover:text-[#003B4A] transition cursor-pointer"
              >
                এখন অ্যাকাউন্ট করবো না — সরাসরি প্রবেশ করুন ➔
              </button>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            THE SLIDING COLORED PANEL (Motion: Left to Right & Right to Left)
        ----------------------------------------------------------------------- */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full z-30 transition-all duration-700 ease-in-out text-white flex flex-col items-center justify-center p-8 text-center shadow-2xl select-none ${
            isRegister
              ? 'translate-x-full rounded-l-[140px] bg-gradient-to-br from-[#002B36] via-[#003B4A] to-[#009DB0]'
              : 'translate-x-0 rounded-r-[140px] bg-gradient-to-br from-[#00D2DF] via-[#00B4C4] to-[#003B4A]'
          }`}
        >
          {isRegister ? (
            /* Content when Panel is on the RIGHT (Showing Register view) */
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center max-w-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-xs font-black text-white mb-4 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-200 animate-pulse" />
                <span>MoSaFa Tools</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-xs sm:text-sm text-cyan-100 font-medium mb-6 leading-relaxed">
                Already have an Account?
              </p>
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="px-8 py-2.5 rounded-full border-2 border-white text-white font-extrabold text-sm hover:bg-white hover:text-[#003B4A] transition-all duration-300 cursor-pointer shadow-md hover:scale-105"
              >
                Login
              </button>
            </div>
          ) : (
            /* Content when Panel is on the LEFT (Showing Login view) */
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center max-w-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-xs font-black text-white mb-4 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-200 animate-pulse" />
                <span>MoSaFa Tools</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                Hello, Welcome
              </h2>
              <p className="text-xs sm:text-sm text-cyan-100 font-medium mb-6 leading-relaxed">
                Don't have an Account?
              </p>
              <button
                type="button"
                onClick={handleSwitchToRegister}
                className="px-8 py-2.5 rounded-full border-2 border-white text-white font-extrabold text-sm hover:bg-white hover:text-[#003B4A] transition-all duration-300 cursor-pointer shadow-md hover:scale-105"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MOBILE SLIDING VERTICAL CONTAINER (Top to Bottom & Bottom to Top)
      ========================================================================= */}
      <div
        className="md:hidden relative w-full max-w-[390px] h-[580px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-40 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* -----------------------------------------------------------------------
            MOBILE FORM AREA (65% height)
        ----------------------------------------------------------------------- */}
        <div
          className={`w-full h-[65%] p-5 sm:p-6 flex flex-col justify-between transition-all duration-700 ease-in-out ${
            isRegister ? 'order-1' : 'order-2'
          }`}
        >
          {isRegister ? (
            /* Mobile Registration Form */
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 text-center mb-0.5">Registration</h3>
                <p className="text-[11px] text-slate-500 text-center mb-3">নতুন অ্যাকাউন্ট তৈরি করতে তথ্য দিন</p>

                {renderErrorBanner(errorMessage)}
                {successMessage && (
                  <div className="mb-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                    ✅ {successMessage}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Username / আপনার নাম"
                      className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-100 text-xs font-medium text-slate-800 outline-none"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Email or Mobile"
                      required
                      className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-100 text-xs font-medium text-slate-800 outline-none"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                  </div>

                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Password (৬+ অক্ষর)"
                      required
                      className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-100 text-xs font-medium text-slate-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3 text-slate-400"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-gradient-to-r from-[#003B4A] to-[#00C8D7] text-white font-extrabold text-xs rounded-full shadow-md"
                  >
                    Register
                  </button>
                </form>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2 px-3 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={onSkip}
                  className="text-[11px] font-bold text-slate-500 hover:text-[#003B4A] mt-2 block mx-auto"
                >
                  এখন অ্যাকাউন্ট করবো না — সরাসরি প্রবেশ করুন ➔
                </button>
              </div>
            </div>
          ) : (
            /* Mobile Login Form */
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 text-center mb-0.5">Login</h3>
                <p className="text-[11px] text-slate-500 text-center mb-3">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>

                {renderErrorBanner(errorMessage)}
                {successMessage && (
                  <div className="mb-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                    ✅ {successMessage}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-2.5">
                  <div className="relative">
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Username, Email or Mobile"
                      required
                      className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-100 text-xs font-medium text-slate-800 outline-none"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                  </div>

                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-slate-100 text-xs font-medium text-slate-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-400"
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        setIsForgotPassword(true);
                        setResetEmail(loginEmail);
                      }}
                      className="text-[10px] font-medium text-slate-500 hover:text-[#00C8D7]"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 bg-gradient-to-r from-[#003B4A] to-[#00C8D7] text-white font-extrabold text-xs rounded-full shadow-md"
                  >
                    Login
                  </button>
                </form>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2 px-3 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={onSkip}
                  className="text-[11px] font-bold text-slate-500 hover:text-[#003B4A] mt-2 block mx-auto"
                >
                  এখন অ্যাকাউন্ট করবো না — সরাসরি প্রবেশ করুন ➔
                </button>
              </div>
            </div>
          )}
        </div>

        {/* -----------------------------------------------------------------------
            MOBILE SLIDING COLORED PANEL (35% height, slides top <-> bottom)
        ----------------------------------------------------------------------- */}
        <div
          className={`w-full h-[35%] transition-all duration-700 ease-in-out text-white flex flex-col items-center justify-center p-6 text-center select-none shadow-lg ${
            isRegister
              ? 'order-2 rounded-t-[60px] bg-gradient-to-br from-[#002B36] via-[#003B4A] to-[#009DB0]'
              : 'order-1 rounded-b-[60px] bg-gradient-to-br from-[#00D2DF] via-[#00B4C4] to-[#003B4A]'
          }`}
        >
          {isRegister ? (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-[10px] font-black text-white mb-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 animate-pulse" />
                <span>MoSaFa Tools</span>
              </div>
              <h3 className="text-xl font-black text-white mb-0.5">Welcome Back!</h3>
              <p className="text-[11px] text-cyan-100 font-medium mb-2.5">Already have an Account?</p>
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className="px-6 py-1 rounded-full border-2 border-white text-white font-extrabold text-xs hover:bg-white hover:text-[#003B4A] transition cursor-pointer shadow-sm"
              >
                Login
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in duration-500">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-[10px] font-black text-white mb-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 animate-pulse" />
                <span>MoSaFa Tools</span>
              </div>
              <h3 className="text-xl font-black text-white mb-0.5">Hello, Welcome</h3>
              <p className="text-[11px] text-cyan-100 font-medium mb-2.5">Don't have an Account?</p>
              <button
                type="button"
                onClick={handleSwitchToRegister}
                className="px-6 py-1 rounded-full border-2 border-white text-white font-extrabold text-xs hover:bg-white hover:text-[#003B4A] transition cursor-pointer shadow-sm"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
