import React, { useState, useRef } from 'react';
import { ArrowLeft, RotateCcw, Sparkles, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CoinTossProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const CoinToss: React.FC<CoinTossProps> = ({ onBackToHub, onShowToast }) => {
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [flipDurationMode, setFlipDurationMode] = useState<'normal' | 'suspense'>('normal');
  const [angle, setAngle] = useState<number>(0);

  const coinRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    const finalIsHeads = Math.random() > 0.5;
    const duration = flipDurationMode === 'suspense' ? 12000 : 2800;
    const baseRotations = flipDurationMode === 'suspense' ? 24 : 8;

    const startAngle = angle;
    const normalizedStart = Math.ceil(startAngle / 360) * 360;
    const targetEndAngle = normalizedStart + baseRotations * 360 + (finalIsHeads ? 0 : 180);
    const totalDelta = targetEndAngle - startAngle;

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Cubic ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalDelta * easeProgress;

      setAngle(currentAngle);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setAngle(targetEndAngle);
        setIsFlipping(false);
        const res = finalIsHeads ? 'heads' : 'tails';
        setResult(res);

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.65 },
          });
        } catch {}
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const copyCoinResult = async () => {
    if (!result) return;
    const text = `🪙 কয়েন টসের ফলাফল: ${result === 'heads' ? 'হেড (HEADS) 👑' : 'টেল (TAILS) 🌾'}\n` +
      `The MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('টসের ফলাফল কপি হয়েছে! 📋', '🪙');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.body.removeChild(ta);
      onShowToast('টসের ফলাফল কপি হয়েছে! 📋', '🪙');
    }
  };

  const resetCoin = () => {
    if (isFlipping) return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setAngle(0);
    setResult(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="w-full max-w-2xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-purple-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">কয়েন টস ও সিদ্ধান্ত মেকার</h1>
            <p className="text-xs text-slate-500">দ্বিধাদ্বন্দ্ব দূর করতে র্যান্ডম চয়েস</p>
          </div>
        </div>

        {/* Speed mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setFlipDurationMode('normal')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              flipDurationMode === 'normal' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            দ্রুত টস ⚡
          </button>
          <button
            onClick={() => setFlipDurationMode('suspense')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              flipDurationMode === 'suspense' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            রুদ্ধশ্বাস সাসপেন্স ⏳
          </button>
        </div>
      </header>

      <main className="max-w-2xl w-full mx-auto px-4 py-8 flex-1 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          {/* 3D Coin Container */}
          <div
            className="py-10 relative flex items-center justify-center"
            style={{ perspective: 1200 }}
          >
            {/* Glow when flipping */}
            <div
              className={`absolute w-52 h-52 rounded-full bg-amber-400/25 blur-2xl transition-opacity duration-500 pointer-events-none ${
                isFlipping ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* 3D Coin Element */}
            <div
              ref={coinRef}
              onClick={flipCoin}
              className="relative w-40 h-40 select-none cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateY(${angle}deg)`,
                transition: isFlipping ? 'none' : 'transform 0.4s ease-out',
              }}
            >
              {/* Front Face: Heads (হেড) */}
              <div
                className="absolute inset-0 rounded-full border-4 border-yellow-300 shadow-2xl flex flex-col items-center justify-center select-none"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #fef08a, #eab308 60%, #ca8a04)',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)',
                  boxShadow:
                    '0 12px 25px -5px rgba(202, 138, 4, 0.45), inset 0 2px 5px rgba(255, 255, 255, 0.8), inset 0 -4px 6px rgba(161, 98, 7, 0.6)',
                }}
              >
                <div className="absolute inset-2.5 rounded-full border-2 border-dashed border-amber-600/40 pointer-events-none" />
                <span className="text-amber-950 text-3xl font-black tracking-wider drop-shadow-sm select-none">
                  হেড
                </span>
                <span className="text-[11px] font-bold text-amber-900/80 tracking-widest uppercase select-none mt-0.5">
                  HEADS
                </span>
              </div>

              {/* Back Face: Tails (টেল) */}
              <div
                className="absolute inset-0 rounded-full border-4 border-yellow-300 shadow-2xl flex flex-col items-center justify-center select-none"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #fef08a, #eab308 60%, #ca8a04)',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  boxShadow:
                    '0 12px 25px -5px rgba(202, 138, 4, 0.45), inset 0 2px 5px rgba(255, 255, 255, 0.8), inset 0 -4px 6px rgba(161, 98, 7, 0.6)',
                }}
              >
                <div className="absolute inset-2.5 rounded-full border-2 border-dashed border-amber-600/40 pointer-events-none" />
                <span className="text-amber-950 text-3xl font-black tracking-wider drop-shadow-sm select-none">
                  টেল
                </span>
                <span className="text-[11px] font-bold text-amber-900/80 tracking-widest uppercase select-none mt-0.5">
                  TAILS
                </span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="mb-6">
            {isFlipping ? (
              <div>
                <h3 className="text-xl font-bold text-purple-700 animate-pulse">
                  কয়েন ঘুরছে... অপেক্ষা করুন! ⏳
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {flipDurationMode === 'suspense'
                    ? 'রুদ্ধশ্বাস সাসপেন্স তৈরি হচ্ছে...'
                    : 'নিখুঁত ও পক্ষপাতহীন র্যান্ডম ফলাফল আসছে...'}
                </p>
              </div>
            ) : result ? (
              <div className="animate-in zoom-in-95 duration-200">
                <span className="inline-block px-3 py-1 rounded-xl bg-purple-100 text-purple-700 text-sm font-black mb-2">
                  🎉 চূড়ান্ত ফলাফল
                </span>
                <h3 className="text-3xl font-black text-slate-900">
                  {result === 'heads' ? 'হেড (HEADS)' : 'টেল (TAILS)'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  সিদ্ধান্ত নির্ধারিত হয়ে গেছে! দ্বিধা ছেড়ে শুরু করুন।
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  টস করার জন্য বাটনে চাপ দিন
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  কয়েনের ওপর বা নিচের বাটনে ক্লিক করে টস করুন
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={flipCoin}
              disabled={isFlipping}
              className={`w-full sm:w-auto py-3.5 px-8 rounded-2xl text-white font-extrabold text-sm shadow-lg shadow-purple-200 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                isFlipping
                  ? 'opacity-60 cursor-not-allowed bg-purple-600'
                  : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isFlipping ? 'কয়েন ঘুরছে...' : 'কয়েন টস করুন 🪙'}</span>
            </button>

            {result && !isFlipping && (
              <>
                <button
                  onClick={copyCoinResult}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition border border-purple-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>ফলাফল কপি 📋</span>
                </button>
                <button
                  onClick={resetCoin}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>পুনরায় রিসেট করুন 🔄</span>
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
