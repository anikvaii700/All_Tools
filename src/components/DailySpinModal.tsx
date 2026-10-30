import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Coins,
  Gift,
  ArrowRight,
  RotateCw,
  Trophy,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DailySpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthWithBonus: (bonus: number) => void;
}

// Exactly 10 slices as requested: 100 to 1000 coins
export const WHEEL_SLICES = [
  { value: 100, label: '১০০', color: '#f43f5e', textColor: '#ffffff' },
  { value: 200, label: '২০০', color: '#8b5cf6', textColor: '#ffffff' },
  { value: 300, label: '৩০০', color: '#06b6d4', textColor: '#ffffff' },
  { value: 400, label: '৪০০', color: '#10b981', textColor: '#ffffff' },
  { value: 500, label: '৫০০', color: '#f59e0b', textColor: '#ffffff' },
  { value: 600, label: '৬০০', color: '#ec4899', textColor: '#ffffff' },
  { value: 700, label: '৭০০', color: '#6366f1', textColor: '#ffffff' },
  { value: 800, label: '৮০০', color: '#14b8a6', textColor: '#ffffff' },
  { value: 900, label: '৯০০', color: '#f97316', textColor: '#ffffff' },
  { value: 1000, label: '১০০০', color: '#eab308', textColor: '#0f172a' },
];

export const DailySpinModal: React.FC<DailySpinModalProps> = ({
  isOpen,
  onClose,
  onOpenAuthWithBonus,
}) => {
  const { user, isLoggedIn, canSpinToday, recordDailySpin } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonAmount, setWonAmount] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize realistic tick sounds using Web Audio API
  const playTickSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio fallback
    }
  };

  const playFanfareSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
      });
    } catch {}
  };

  if (!isOpen) return null;

  const sliceAngle = 360 / WHEEL_SLICES.length; // 36 degrees per slice
  const availableToSpin = canSpinToday();

  const handleSpinClick = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    setWonAmount(null);

    let chosenSliceIndex: number;

    if (!isLoggedIn) {
      // RULE FOR GUEST (NO ACCOUNT):
      // Must ALWAYS land on the high slots ABOVE 600 (700, 800, 900, 1000)
      // indices: 6 (700), 7 (800), 8 (900), 9 (1000)
      const guestEligibleIndices = [6, 7, 8, 9];
      chosenSliceIndex =
        guestEligibleIndices[Math.floor(Math.random() * guestEligibleIndices.length)];
    } else {
      // RULE FOR LOGGED IN ACCOUNT:
      // Must NEVER exceed 600: "তবে ৬০০ এর বেশি কারো যেন না লাগে। সর্বোচ্চ ৬০০ এর ঘর পর্যন্ত লাগবে বাকিগুলো লাগবে না।"
      // Allowed slices: 100, 200, 300, 400, 500, 600 (indices 0 to 5)
      const userEligibleIndices = [0, 1, 2, 3, 4, 5];
      chosenSliceIndex =
        userEligibleIndices[Math.floor(Math.random() * userEligibleIndices.length)];
    }

    const prize = WHEEL_SLICES[chosenSliceIndex];

    // The top pointer is positioned at 270 degrees (or 90deg offset from 0).
    // Slices are drawn starting at index 0.
    // Center angle of slice i = (i * sliceAngle) + (sliceAngle / 2)
    // To have slice i under the top pointer (at 270 degrees / -90 degrees):
    const sliceCenterAngle = chosenSliceIndex * sliceAngle + sliceAngle / 2;
    // Extra full spins for thrill: 6 to 8 full 360 rotations
    const fullSpins = 360 * 7;
    // Target stop angle (taking pointer at top, i.e., 270 deg)
    const targetAngle = fullSpins + (360 - sliceCenterAngle + 270);

    setRotation(targetAngle);

    // Audio ticks during spin
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      if (tickCount < 30) {
        playTickSound();
      } else {
        clearInterval(interval);
      }
    }, 120);

    // Spin duration: 4.5 seconds
    setTimeout(async () => {
      setIsSpinning(false);
      setWonAmount(prize.value);
      setShowResult(true);
      playFanfareSound();

      // Explode confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#eab308', '#8b5cf6', '#10b981'],
      });

      if (isLoggedIn) {
        // Record into user's account and Firestore immediately
        await recordDailySpin(prize.value);
      }
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pt-6 pb-2 px-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-black mb-2">
            <Gift className="w-3.5 h-3.5 text-rose-500" />
            <span>দৈনিক লাকি স্পিনার ও কয়েন রিওয়ার্ড</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            আজকের স্পিন ঘুরিয়ে কয়েন জিতুন!
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isLoggedIn
              ? `স্বাগতম ${user?.displayName || ''}! প্রতিদিন ১ বার স্পিন করে ১০০ থেকে ১০০০ কয়েন পর্যন্ত জিতুন।`
              : 'ফ্রি ভিজিটর স্পিন! ১০০ থেকে ১০০০ কয়েন জেতার বিশাল সুযোগ!'}
          </p>
        </div>

        {/* Wheel Section */}
        <div className="relative py-4 flex items-center justify-center overflow-hidden">
          {/* Top Indicator / Pointer Arrow */}
          <div className="absolute top-2 z-20 flex flex-col items-center drop-shadow-md">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-500 filter drop-shadow"></div>
            <div className="w-2.5 h-2.5 bg-amber-600 rounded-full -mt-1 border border-white"></div>
          </div>

          {/* SVG Rotating Wheel */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center p-2">
            {/* Outer Golden Glow Border */}
            <div className="absolute inset-0 rounded-full border-8 border-amber-400 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.35)]"></div>

            <svg
              viewBox="0 0 300 300"
              className="w-full h-full rounded-full transition-transform ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: isSpinning ? '4500ms' : '0ms',
                transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
              }}
            >
              {WHEEL_SLICES.map((slice, index) => {
                const startAngle = index * sliceAngle;
                const endAngle = startAngle + sliceAngle;
                const radStart = (Math.PI / 180) * startAngle;
                const radEnd = (Math.PI / 180) * endAngle;

                const cx = 150;
                const cy = 150;
                const r = 142;

                const x1 = cx + r * Math.cos(radStart);
                const y1 = cy + r * Math.sin(radStart);
                const x2 = cx + r * Math.cos(radEnd);
                const y2 = cy + r * Math.sin(radEnd);

                const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
                const textAngle = startAngle + sliceAngle / 2;
                const textRad = (Math.PI / 180) * textAngle;
                const tx = cx + r * 0.65 * Math.cos(textRad);
                const ty = cy + r * 0.65 * Math.sin(textRad);

                return (
                  <g key={index}>
                    <path d={d} fill={slice.color} stroke="#ffffff" strokeWidth="2.5" />
                    <text
                      x={tx}
                      y={ty}
                      fill={slice.textColor}
                      fontSize="14"
                      fontWeight="900"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                    >
                      {slice.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Center MoSaFa Knob */}
            <div className="absolute w-20 h-20 rounded-full bg-slate-900 border-4 border-amber-400 shadow-xl flex flex-col items-center justify-center text-white z-10">
              <span className="text-[10px] font-black text-amber-300 tracking-wider">MoSaFa</span>
              <span className="text-[11px] font-extrabold text-white">SPIN</span>
              <Coins className="w-3.5 h-3.5 text-yellow-400 mt-0.5" />
            </div>
          </div>
        </div>

        {/* Spin Controls & Status */}
        <div className="px-6 pb-6">
          {!showResult ? (
            <div>
              {availableToSpin ? (
                <button
                  type="button"
                  onClick={handleSpinClick}
                  disabled={isSpinning}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white font-black text-base rounded-2xl shadow-xl shadow-rose-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>{isSpinning ? 'ভাগ্যের চাকা ঘুরছে...' : 'এখনই স্পিন করুন! 🎯'}</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-700 font-extrabold text-sm mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>আজকের দৈনিক স্পিন সম্পন্ন হয়েছে!</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    পরবর্তী স্পিন আগামীকাল আনলক হবে। নিয়মিত সাইট ও অ্যাপ ব্যবহার করে সাথে থাকুন!
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Celebration & Result Banner */
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 border-2 border-amber-300 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-center gap-2 text-amber-600 font-black text-sm mb-1">
                <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                <span>দারুণ উপহার!</span>
              </div>

              <div className="my-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  +{wonAmount?.toLocaleString('bn-BD')}
                </span>
                <span className="text-sm font-extrabold text-rose-600 ml-1.5">কয়েন জয়ী! 🎉</span>
              </div>

              {isLoggedIn ? (
                /* Logged In Result: Already saved to account */
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                    এই পয়েন্ট সফলভাবে আপনার অ্যাকাউন্টে যোগ করা হয়েছে। বর্তমানে আপনার ওয়ালেটে সংরক্ষিত আছে।
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    ধন্যবাদ, সম্পন্ন করুন
                  </button>
                </div>
              ) : (
                /* Guest Result: Urge Account Creation */
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-700 font-medium leading-relaxed">
                    ⚠️ <strong>মনোযোগ দিন:</strong> আপনি ভিজিটর মোডে স্পিন করেছেন। এই{' '}
                    <span className="text-rose-600 font-bold">{wonAmount} কয়েন</span> ব্যালেন্সে
                    সুরক্ষিত রাখতে এবং ভবিষ্যতে নগদ টাকায় রূপান্তর করতে এখনই ফ্রি অ্যাকাউন্ট তৈরি
                    করুন!
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthWithBonus(wonAmount || 1000);
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-200 transition cursor-pointer flex items-center justify-center gap-2 animate-pulse"
                  >
                    <span>অ্যাকাউন্ট তৈরি করে কয়েন জমা করুন 🚀</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Value promise indicator */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>প্রতি ১,০০০ কয়েন = ১০ টাকা নগদ / বিকাশ সমমূল্য (ভবিষ্যত ক্যাশআউট)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
