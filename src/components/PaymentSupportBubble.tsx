import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Copy,
  CheckCircle2,
  X,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PaymentSupportBubbleProps {
  onOpenAddMoney?: () => void;
}

const BKASH_MERCHANT_NUMBER = '01868775577';

export const PaymentSupportBubble: React.FC<PaymentSupportBubbleProps> = ({ onOpenAddMoney }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BKASH_MERCHANT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    'আসসালামু আলাইকুম, The MoSaFa Tools-এ পেমেন্ট / ব্যালেন্স এড মানি সংক্রান্ত বিষয়ে আমার সহায়তা প্রয়োজন।'
  );
  const whatsappUrl = `https://wa.me/8801868775577?text=${whatsappMessage}`;

  return (
    <>
      {/* Floating Corner Bubble Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 print:hidden select-none">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-xl shadow-emerald-950/25 border-2 border-emerald-300/60 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 animate-pulse"
          title="পেমেন্ট ও এড মানি সাপোর্ট"
          aria-label="পেমেন্ট সাপোর্ট"
        >
          {/* Notification Ping Ring */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border-2 border-white"></span>
          </span>

          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <CreditCard className="w-3.5 h-3.5 text-yellow-200" />
          </div>

          <div className="flex flex-col text-left">
            <span className="font-black text-[12px] tracking-tight leading-tight flex items-center gap-1">
              <span>পেমেন্ট সাপোর্ট</span>
              <span className="text-[10px] bg-emerald-800/80 text-emerald-100 px-1.5 py-0.2 rounded-full font-sans uppercase">
                24/7
              </span>
            </span>
            <span className="text-[10px] text-emerald-100 font-semibold opacity-90 hidden sm:inline">
              টাকা লোড ও এড মানি সহায়তা
            </span>
          </div>

          <MessageCircle className="w-4 h-4 ml-0.5 text-emerald-200 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Popup Bubble Drawer / Card */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full sm:w-96 bg-white rounded-3xl shadow-2xl border-2 border-emerald-400/80 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-right-8 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-4 sm:p-5 text-white">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/60 text-emerald-200 text-[10px] font-bold mb-1.5 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-yellow-300" />
                <span>The MoSaFa অফিশিয়াল হেল্পডেস্ক</span>
              </div>

              <h3 className="text-lg font-black tracking-tight leading-tight flex items-center gap-2">
                <span>পেমেন্ট ও এড মানি সাপোর্ট</span>
                <span className="text-xl">💳</span>
              </h3>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                ব্যালেন্সে টাকা লোড বা যেকোনো পেমেন্ট সমস্যায় সরাসরি কথা বলুন।
              </p>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Add Money Minimum Rule Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>ব্যালেন্স এড মানি নিয়মাবলী</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  • <strong>মিনিমাম ৫০ টাকা</strong> ব্যালেন্সে এড মানি করা যাবে।
                  <br />
                  • প্রতি পিডিএফ ডাউনলোড ফি মাত্র <strong>৫ টাকা</strong> (মূল ব্যালেন্স থেকে কর্তন হবে)।
                  <br />
                  • চাইলে আপনার <strong>কয়েন ব্যালেন্স কনভার্ট</strong> করেও মূল ব্যালেন্সে যোগ করতে পারেন (১০০ কয়েন = ১ টাকা)।
                </p>
              </div>

              {/* bKash Merchant Box */}
              <div className="p-3.5 rounded-2xl bg-pink-50 border-2 border-pink-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-pink-600 text-white font-black flex items-center justify-center text-[10px]">
                      b
                    </span>
                    <span>বিকাশ মার্চেন্ট নম্বর (Make Payment)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-[10px] transition cursor-pointer"
                  >
                    {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-pink-300 text-center font-mono font-black text-lg text-pink-700 tracking-wider">
                  {BKASH_MERCHANT_NUMBER}
                </div>
                <p className="text-[10px] text-pink-900 font-medium">
                  ⚠️ বিকাশ অ্যাপের <strong>"Payment"</strong> অপশন থেকে ন্যূনতম ৫০ টাকা পেমেন্ট করবেন (Send Money নয়)।
                </p>
              </div>

              {/* Direct Support Actions */}
              <div className="space-y-2 pt-1">
                {/* WhatsApp Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে মেসেজ দিন (তাৎক্ষণিক সমাধান)</span>
                  <ExternalLink className="w-3 h-3 opacity-80 ml-auto" />
                </a>

                {/* Direct Call Button */}
                <a
                  href="tel:01868775577"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>সরাসরি কল করুন: 01868775577</span>
                </a>

                {/* Optional trigger to open Add Money directly in modal */}
                {onOpenAddMoney && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAddMoney();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer mt-1"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                    <span>ব্যালেন্সে টাকা লোড করুন (মিনিমাম ৫০ টাকা) ➔</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-500 font-medium">
                The MoSaFa Tools • বিশ্বস্ত ও নিরাপদ বাংলা ডিজিটাল সেবা
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
