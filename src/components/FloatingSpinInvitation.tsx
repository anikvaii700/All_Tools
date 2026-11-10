import React, { useState, useEffect } from 'react';
import { Sparkles, X, Gift, RotateCw, CheckCircle2 } from 'lucide-react';

interface FloatingSpinInvitationProps {
  onOpenSpin: () => void;
  canSpin: boolean;
}

const BALLOON_DISMISSED_KEY = 'mosafa_spin_balloon_dismissed';

export const FloatingSpinInvitation: React.FC<FloatingSpinInvitationProps> = ({
  onOpenSpin,
  canSpin,
}) => {
  const [showBalloon, setShowBalloon] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem(BALLOON_DISMISSED_KEY);
      if (!isDismissed && canSpin) {
        // Show greeting balloon after a brief subtle delay
        const timer = setTimeout(() => {
          setShowBalloon(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Session storage fallback
    }
  }, [canSpin]);

  const handleDismissBalloon = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBalloon(false);
    try {
      sessionStorage.setItem(BALLOON_DISMISSED_KEY, 'true');
    } catch {}
  };

  // Once user has spun for the day, do not render or show any spinner button/popup on the page
  if (!canSpin) {
    return null;
  }

  return (
    <aside
      aria-label="Daily Spin Invitation"
      className="fixed bottom-20 md:bottom-7 right-4 md:right-7 z-40 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Dismissible Floating Greeting Balloon */}
      {showBalloon && canSpin && (
        <div
          onClick={onOpenSpin}
          className="mb-3 max-w-[260px] sm:max-w-xs bg-gradient-to-r from-slate-900 via-[#003B4A] to-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-cyan-400/30 backdrop-blur-md animate-in slide-in-from-bottom-3 fade-in duration-300 cursor-pointer relative group hover:border-cyan-300 transition-all"
        >
          {/* Arrow pointing to button */}
          <div className="absolute -bottom-2 right-6 w-3 h-3 bg-[#003B4A] rotate-45 border-r border-b border-cyan-400/30" />

          {/* Balloon Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span>দৈনিক লাকি স্পিন</span>
            </div>
            <button
              type="button"
              onClick={handleDismissBalloon}
              className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
              title="বন্ধ করুন"
              aria-label="Dismiss spin invitation"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <p className="text-[12px] text-cyan-100 font-medium leading-snug mt-1.5">
            আজকের স্পিন করেছেন? চাকা ঘুরিয়ে জিতে নিন ১০০০ কয়েন পর্যন্ত ফ্রি রিওয়ার্ড!
          </p>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold text-amber-400">
            <span className="flex items-center gap-1 underline underline-offset-2">
              এখনই স্পিন করুন ➔
            </span>
            <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-400/30">
              ১ম স্পিন ফ্রি
            </span>
          </div>
        </div>
      )}

      {/* Floating Main Circular Action Button */}
      <div className="relative group">
        {/* Glowing pulse ring if user can spin today */}
        {canSpin && (
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 opacity-75 blur-xs group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
        )}

        <button
          type="button"
          onClick={onOpenSpin}
          className={`relative flex items-center gap-2.5 px-4 py-3 sm:py-3.5 rounded-full font-black text-xs sm:text-sm shadow-xl transition-all duration-200 active:scale-95 cursor-pointer border ${
            canSpin
              ? 'bg-gradient-to-r from-[#003B4A] via-[#005566] to-[#00C8D7] text-white border-cyan-300/40 hover:brightness-110 shadow-cyan-900/30'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 shadow-slate-950/40'
          }`}
          title={canSpin ? 'আজকের ফ্রি লাকি স্পিন খুলুন' : 'আজকের স্পিন সম্পন্ন হয়েছে'}
          aria-label="Open Lucky Spin Wheel"
        >
          {/* Wheel / Gift Icon */}
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
              canSpin
                ? 'bg-white/20 text-white backdrop-blur-xs group-hover:rotate-180 transition-transform duration-700'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {canSpin ? (
              <RotateCw className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-spin" style={{ animationDuration: '6s' }} />
            ) : (
              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-400" />
            )}
          </div>

          {/* Text Labels */}
          <div className="flex flex-col text-left">
            <span className="leading-tight flex items-center gap-1.5 font-bold">
              {canSpin ? 'লাকি স্পিন' : 'স্পিন সম্পন্ন'}
              {canSpin && (
                <span className="px-1.5 py-0.2 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  ফ্রি
                </span>
              )}
            </span>
            <span className="text-[10px] text-cyan-200/90 font-medium leading-none mt-0.5">
              {canSpin ? 'পয়েন্ট জিতুন 🎁' : 'আগামীকাল আবার'}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};
