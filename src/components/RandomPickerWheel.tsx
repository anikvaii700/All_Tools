import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  RotateCw,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
  Shuffle,
  Bookmark,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RandomPickerWheelProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

const PRESET_LISTS: { [key: string]: string[] } = {
  food: ['বিরিয়ানি', 'খিচুড়ি', 'বার্গার', 'পিজ্জা', 'তেহারি', 'ফুচকা', 'কাচ্চি', 'ফ্রায়েড রাইস'],
  travel: ['কক্সবাজার', 'সাজেক ভ্যালি', 'শ্রীমঙ্গল', 'বান্দরবান', 'কুয়াকাটা', 'জাফলং'],
  bill: ['আমি দিব 😅', 'সবাই মিলে শেয়ার', 'যে আগে শেষ করবে', 'সবচেয়ে বড় জন', 'যার পকেট গরম!'],
  activity: ['মুভি দেখা', 'বই পড়া', 'বাইরে হাঁটা', 'গেম খেলা', 'গান শোনা', 'একটু ঘুম দেওয়া'],
};

const SECTOR_COLORS = [
  '#f43f5e',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#3b82f6',
  '#14b8a6',
  '#e11d48',
  '#6366f1',
];

export const RandomPickerWheel: React.FC<RandomPickerWheelProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  const [options, setOptions] = useState<string[]>([
    'বিরিয়ানি 🍗',
    'কাচ্চি 🍛',
    'বার্গার 🍔',
    'পিজ্জা 🍕',
    'ফুচকা 🥟',
    'তেহারি 🍲',
  ]);
  const [newOption, setNewOption] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [currentAngle, setCurrentAngle] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load saved custom options
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mosafa_wheel_options');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 2) setOptions(parsed);
      }
    } catch {}
  }, []);

  const saveOptionsToLocal = (opts: string[]) => {
    setOptions(opts);
    try {
      localStorage.setItem('mosafa_wheel_options', JSON.stringify(opts));
    } catch {}
  };

  // Web Audio click tick
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {}
  };

  // Draw Wheel on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 500;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const radius = center - 25;

    ctx.clearRect(0, 0, size, size);

    if (options.length === 0) return;

    const arc = (Math.PI * 2) / options.length;

    // Draw Wheel Sectors
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((currentAngle * Math.PI) / 180);

    options.forEach((opt, idx) => {
      const startAngle = idx * arc;
      const endAngle = startAngle + arc;

      // Slice
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = SECTOR_COLORS[idx % SECTOR_COLORS.length];
      ctx.fill();

      // Border line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Text inside slice
      ctx.save();
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;

      const maxLabelLen = 14;
      const displayLabel = opt.length > maxLabelLen ? opt.slice(0, maxLabelLen) + '...' : opt;
      ctx.fillText(displayLabel, radius - 28, 5);
      ctx.restore();
    });

    // Center Hub Pin
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.restore();

    // Draw Top Pointer Triangle (Stationary, pointing down at angle 270 deg / top)
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(center - 16, 8);
    ctx.lineTo(center + 16, 8);
    ctx.lineTo(center, 42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }, [options, currentAngle]);

  const spinWheel = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setSelectedResult(null);

    // Genuinely pick a random winning index
    const winningIndex = Math.floor(Math.random() * options.length);
    const arcDeg = 360 / options.length;

    // Top pointer is at 270 degrees.
    // Winning sector's center: winningIndex * arcDeg + arcDeg / 2
    // Angle needed: (270 - (winningIndex * arcDeg + arcDeg / 2)) % 360
    const targetSectorAngle = (270 - (winningIndex * arcDeg + arcDeg / 2) + 360) % 360;

    const baseRotations = reducedMotion ? 3 : 8;
    const duration = reducedMotion ? 1800 : 4500;
    const startAngle = currentAngle % 360;
    const totalRotation = 360 * baseRotations + targetSectorAngle - startAngle + (targetSectorAngle < startAngle ? 360 : 0);

    const startTime = performance.now();
    let lastTickAngle = startAngle;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth Quintic ease-out
      const ease = 1 - Math.pow(1 - progress, 5);
      const angle = startAngle + totalRotation * ease;

      setCurrentAngle(angle);

      // Play tick sound when passing sector border
      if (Math.abs(angle - lastTickAngle) >= arcDeg) {
        playTickSound();
        lastTickAngle = angle;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winner = options[winningIndex];
        setSelectedResult(winner);
        playTickSound();

        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOption.trim()) return;
    if (options.includes(newOption.trim())) {
      onShowToast('এই অপশনটি ইতিমধ্যেই রয়েছে!', '⚠️');
      return;
    }
    const updated = [...options, newOption.trim()];
    saveOptionsToLocal(updated);
    setNewOption('');
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) {
      onShowToast('কমপক্ষে ২টি অপশন থাকা আবশ্যক!', '⚠️');
      return;
    }
    const updated = options.filter((_, i) => i !== idx);
    saveOptionsToLocal(updated);
  };

  const loadPreset = (key: string) => {
    const list = PRESET_LISTS[key];
    if (list) {
      saveOptionsToLocal(list);
      setSelectedResult(null);
      onShowToast('প্রিসেট তালিকা লোড হয়েছে! 📋', '✅');
    }
  };

  const shuffleOptions = () => {
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    saveOptionsToLocal(shuffled);
    onShowToast('তালিকা এলোমেলো করা হয়েছে! 🔀', '✨');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-purple-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">Random Picker Wheel</h1>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200">
                সিদ্ধান্ত চাকা
              </span>
            </div>
            <p className="text-xs text-slate-500">খাবার, ভ্রমণ বা যেকোনো সিদ্ধান্তে ঘুরিয়ে নিন র‍্যান্ডম লাকি হুইল</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-purple-600 shadow-xs transition cursor-pointer"
            title="সাউন্ড অন/অফ"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
              reducedMotion ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
            title="দ্রুত ঘূর্ণন মোড"
          >
            {reducedMotion ? 'গতিশীল' : 'স্বাভাবিক'}
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Canvas Wheel */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain select-none" />
          </div>

          {/* Selected Result Box */}
          <div className="mt-5 w-full text-center">
            {selectedResult ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border border-purple-200 animate-in zoom-in-95 duration-200">
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block mb-0.5">
                  🎉 নির্বাচিত ফলাফল:
                </span>
                <span className="text-2xl font-black text-slate-900">{selectedResult}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">
                {isSpinning ? 'চাকা ঘুরছে... ভাগ্য নির্ধারণ চলছে! ⏳' : 'চাকা ঘোরাতে নিচের বাটনে ক্লিক করুন'}
              </p>
            )}
          </div>

          <div className="mt-4 flex gap-3 w-full max-w-sm">
            <button
              onClick={spinWheel}
              disabled={isSpinning || options.length < 2}
              className={`flex-1 py-3.5 px-6 rounded-2xl text-white font-extrabold text-sm sm:text-base shadow-lg shadow-purple-200 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                isSpinning
                  ? 'opacity-60 cursor-not-allowed bg-purple-600'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'ঘুরছে...' : 'স্পিন করুন 🎡'}</span>
            </button>
            <button
              onClick={shuffleOptions}
              disabled={isSpinning}
              className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="এলোমেলো করুন"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Options Manager & Presets */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Presets */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-600 mb-2">জনপ্রিয় প্রিসেট তালিকা:</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => loadPreset('food')}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold border border-rose-200 transition text-left cursor-pointer"
              >
                🍕 আজকের খাবার
              </button>
              <button
                onClick={() => loadPreset('travel')}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 transition text-left cursor-pointer"
              >
                🏖️ কোথায় ঘুরতে যাব
              </button>
              <button
                onClick={() => loadPreset('bill')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition text-left cursor-pointer"
              >
                💸 কে বিল দিবে
              </button>
              <button
                onClick={() => loadPreset('activity')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition text-left cursor-pointer"
              >
                🎮 অলস সময়ে কী করব
              </button>
            </div>
          </div>

          {/* Add Option Form */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 mb-2">নতুন অপশন যুক্ত করুন:</h4>
            <form onSubmit={handleAddOption} className="flex gap-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="যেমন: ফুচকা, কক্সবাজার..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>যোগ</span>
              </button>
            </form>
          </div>

          {/* Options List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-h-[300px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">বর্তমান অপশনসমূহ ({options.length}টি):</span>
              <span className="text-[10px] text-slate-400">কমপক্ষে ২টি প্রয়োজন</span>
            </div>
            <div className="space-y-1.5">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }}
                    />
                    <span className="truncate font-medium">{opt}</span>
                  </div>
                  <button
                    onClick={() => removeOption(idx)}
                    disabled={isSpinning}
                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
