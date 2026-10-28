import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Download,
  Sparkles,
  Award,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoveTestProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const LoveTest: React.FC<LoveTestProps> = ({ onBackToHub, onShowToast }) => {
  const [step, setStep] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Form State
  const [person1Name, setPerson1Name] = useState<string>('অনিক');
  const [person2Name, setPerson2Name] = useState<string>('অনিকা');
  const [person1Age, setPerson1Age] = useState<number | string>(24);
  const [person2Age, setPerson2Age] = useState<number | string>(22);
  const [relDuration, setRelDuration] = useState<string>('১ থেকে ৩ বছর');

  // Step 2
  const [p1BirthOrder, setP1BirthOrder] = useState<string>('বড় সন্তান (দায়িত্বশীল)');
  const [p2BirthOrder, setP2BirthOrder] = useState<string>('ছোট সন্তান (খুনসুটি ও আদুরে)');
  const [p1Complexion, setP1Complexion] = useState<string>('মিষ্টি শ্যামলা ও আকর্ষণীয়');
  const [p2Complexion, setP2Complexion] = useState<string>('উজ্জ্বল ফর্সা ও মায়াবী');
  const [p1FamilyAccept, setP1FamilyAccept] = useState<string>('১০০% মেনে নিয়েছে ও বিয়ের কথা চলছে');
  const [p2FamilyAccept, setP2FamilyAccept] = useState<string>('১০০% মেনে নিয়েছে ও বিয়ের কথা চলছে');

  // Step 3
  const [qFightEgo, setQFightEgo] = useState<string>('both_calm');
  const [qBillShare, setQBillShare] = useState<string>('balanced');
  const [qFutureMarriage, setQFutureMarriage] = useState<string>('serious');
  const [qHardTimes, setQHardTimes] = useState<string>('always_there');
  const [qLoyaltyTrust, setQLoyaltyTrust] = useState<string>('full_trust');

  // Step 4
  const [traitHonesty, setTraitHonesty] = useState<number>(5);
  const [traitCaring, setTraitCaring] = useState<number>(5);
  const [traitSacrifice, setTraitSacrifice] = useState<number>(4);
  const [traitEffort, setTraitEffort] = useState<number>(5);
  const [traitSelfless, setTraitSelfless] = useState<number>(5);

  // Step 5 Result
  const [score, setScore] = useState<number>(88);
  const [displayScore, setDisplayScore] = useState<number>(0);
  const [verdictTitle, setVerdictTitle] = useState<string>('');
  const [verdictColor, setVerdictColor] = useState<string>('');
  const [analysisText, setAnalysisText] = useState<string>('');
  const [adviceText, setAdviceText] = useState<string>('');

  const certCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play audio tone with Web Audio API
  const playSound = (freq = 520, type: OscillatorType = 'sine', duration = 0.25) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // AudioContext not allowed or disabled
    }
  };

  const goToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person1Name.trim() || !person2Name.trim()) {
      alert('দয়া করে দুজনের নাম লিখুন');
      return;
    }
    playSound(440);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep3 = () => {
    playSound(480);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep4 = () => {
    playSound(520);
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateFinalVerdict = () => {
    let calculated = 50;

    if (p1FamilyAccept.includes('১০০%')) calculated += 12;
    else if (p1FamilyAccept.includes('ঘোর বিরোধী')) calculated -= 14;

    if (p2FamilyAccept.includes('১০০%')) calculated += 12;
    else if (p2FamilyAccept.includes('কোনোভাবেই রাজি নয়')) calculated -= 14;

    if (qFightEgo === 'both_calm') calculated += 10;
    else if (qFightEgo === 'silent_ego') calculated -= 15;

    if (qBillShare === 'balanced') calculated += 8;
    else if (qBillShare === 'one_sided') calculated -= 12;

    if (qFutureMarriage === 'serious') calculated += 15;
    else if (qFutureMarriage === 'avoiding') calculated -= 18;

    if (qHardTimes === 'always_there') calculated += 10;
    else if (qHardTimes === 'only_good_times') calculated -= 14;

    if (qLoyaltyTrust === 'full_trust') calculated += 10;
    else if (qLoyaltyTrust === 'suspicious') calculated -= 15;

    const traitsSum = traitHonesty + traitCaring + traitSacrifice + traitEffort + traitSelfless;
    calculated += (traitsSum - 15) * 1.5;

    calculated = Math.max(15, Math.min(99, Math.round(calculated)));
    setScore(calculated);

    let vTitle = '';
    let vColor = '';
    let aText = '';
    let advText = '';

    if (calculated >= 82) {
      vTitle = '💍 আজীবন একসঙ্গে থাকার খাঁটি সম্পর্ক';
      vColor = 'bg-emerald-50 text-emerald-700 border-emerald-300';
      aText = `${person1Name} এবং ${person2Name}-এর বোঝাপড়া, পারিবারিক সদিচ্ছা ও ত্যাগ স্বীকারের মনোভাব অত্যন্ত পরিপক্ক ও আন্তরিক। কোনো কৃত্রিমতা বা মেকি ভাব নেই।`;
      advText = 'দেরি না করে শুভ পরিণয়ের (বিয়ে) চূড়ান্ত সিদ্ধান্ত পরিবারের সম্মতিতে নিয়ে নেওয়া বুদ্ধিমানের কাজ হবে!';
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } else if (calculated >= 60) {
      vTitle = '💖 গভীর ভালোবাসা তবে কিছুটা ধৈর্য ও আপস প্রয়োজন';
      vColor = 'bg-amber-50 text-amber-700 border-amber-300';
      aText = `দুজনের মধ্যে টান আন্তরিক, তবে রাগ, পারিবারিক পরিস্থিতি বা ছোটখাটো ভুল বোঝাবুঝি নিয়ে মাঝে মাঝে অনিশ্চয়তা তৈরি হতে পারে।`;
      advText = 'অহংকার এড়িয়ে একে অপরকে আরও বেশি সময় দিন এবং খোলামেলা কথা বলে দূরত্ব দূর করুন।';
    } else {
      vTitle = '⚠️ সতর্কবার্তা: স্বার্থপরতা ও টাইমপাসের লক্ষণ';
      vColor = 'bg-rose-50 text-rose-700 border-rose-300';
      aText = `সম্পর্কটিতে একজন হয়তো আবেগ দিয়ে চেষ্টা করছেন কিন্তু অপরজনের দিক থেকে বিয়ের অনিহা বা অবহেলার স্পষ্ট ইঙ্গিত রয়েছে।`;
      advText = 'অন্ধের মতো বিশ্বাস না করে বাস্তববাদী হোন এবং নিজের আত্মসম্মান বিসর্জন দেবেন না!';
    }

    setVerdictTitle(vTitle);
    setVerdictColor(vColor);
    setAnalysisText(aText);
    setAdviceText(advText);

    playSound(660, 'triangle', 0.5);
    setStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Score meter count up
  useEffect(() => {
    if (step === 5) {
      let current = 0;
      setDisplayScore(0);
      const timer = setInterval(() => {
        current += 1;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(timer);
        } else {
          setDisplayScore(current);
        }
      }, 15);
      return () => clearInterval(timer);
    }
  }, [step, score]);

  const resetTest = () => {
    setPerson1Name('');
    setPerson2Name('');
    setPerson1Age(24);
    setPerson2Age(22);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateAndDownloadCertificate = () => {
    const canvas = certCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = 900;
    const h = 620;

    ctx.fillStyle = '#fff5f7';
    ctx.fillRect(0, 0, w, h);

    // Decorative Borders
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    // Header Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#be123c';
    ctx.font = 'bold 32px "Hind Siliguri", sans-serif';
    ctx.fillText('প্রেম ট্রাইব্যুনাল - সম্পর্ক সনদপত্র', w / 2, 85);

    ctx.fillStyle = '#64748b';
    ctx.font = '14px "Hind Siliguri", sans-serif';
    ctx.fillText('দুজনের সম্পর্ক, আনুগত্য, ভবিষ্যৎ মানসিকতা ও আন্তরিকতার সত্য সনদপত্র', w / 2, 115);

    // Names
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
    ctx.fillText(`${person1Name}  ❤️  ${person2Name}`, w / 2, 175);

    ctx.fillStyle = '#881337';
    ctx.font = '15px "Hind Siliguri", sans-serif';
    ctx.fillText(`বয়স: ${person1Age} ও ${person2Age} বছর | সম্পর্কের মেয়াদ: ${relDuration}`, w / 2, 210);

    // Score
    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 54px "Hind Siliguri", sans-serif';
    ctx.fillText(`${score}%`, w / 2, 280);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px "Hind Siliguri", sans-serif';
    ctx.fillText('খাঁটি ভালোবাসার নির্ভরযোগ্য স্কোর', w / 2, 310);

    // Verdict
    ctx.fillStyle = '#be123c';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText(verdictTitle, w / 2, 360);

    // Analysis snippet
    ctx.fillStyle = '#334155';
    ctx.font = '15px "Hind Siliguri", sans-serif';
    ctx.fillText(analysisText.slice(0, 75) + '...', w / 2, 400);

    // Footer
    const today = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#881337';
    ctx.font = '14px "Hind Siliguri", sans-serif';
    ctx.fillText(`তারিখ: ${today}`, 50, 540);
    ctx.fillText(`সনদ আইডি: TRUTH-${Math.floor(100000 + Math.random() * 900000)}`, 50, 565);

    ctx.textAlign = 'center';
    ctx.fillText('সার্টিফিকেট প্রদানকারী: The MoSaFa Tools', w / 2, 555);

    ctx.textAlign = 'right';
    ctx.fillText('প্রেম ট্রাইব্যুনাল কর্তৃক সত্যায়িত ⚖️', w - 50, 555);

    const link = document.createElement('a');
    link.download = `Love_Certificate_${person1Name}_${person2Name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('সনদপত্র সফলভাবে ডাউনলোড হয়েছে! 📜', '🎉');
  };

  const circumference = 314;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-rose-50/70 via-pink-50/40 to-rose-100/30">
      {/* Top Bar */}
      <header className="w-full max-w-2xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between border-b border-rose-200/60 sm:border-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 border border-rose-200 shadow-xs transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                প্রেম টেস্ট (Love Test)
              </h1>
              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                The MoSaFa
              </span>
            </div>
            <p className="text-[11px] text-rose-700/80 font-medium">ভালোবাসার খাঁটি সত্যতা ও উদ্দেশ্য নির্ণয়</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600 border border-rose-200 shadow-xs transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="সাউন্ড অন/অফ"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-rose-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden sm:inline">সাউন্ড</span>
          </button>

          {step > 1 && (
            <button
              onClick={resetTest}
              className="px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl bg-white/90 hover:bg-white text-rose-600 border border-rose-200 shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>নতুন টেস্ট</span>
            </button>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto px-4 mb-2">
        <div className="flex items-center justify-between text-xs font-semibold text-rose-900 mb-1.5">
          <span>
            {step === 1 && 'ধাপ ১: দুজনের নাম ও বয়স'}
            {step === 2 && 'ধাপ ২: পারিবারিক তথ্য ও গায়ের রং'}
            {step === 3 && 'ধাপ ৩: বাস্তব পরিস্থিতি যাচাই'}
            {step === 4 && 'ধাপ ৪: গুণাবলী ও রেটিং'}
            {step === 5 && 'ধাপ ৫: চূড়ান্ত রায় ও সনদপত্র'}
          </span>
          <span className="font-bold">{step * 20}%</span>
        </div>
        <div className="w-full bg-rose-200/60 h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${step * 20}%` }}
          />
        </div>
      </div>

      {/* Main Form Body */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-3 sm:py-5 flex flex-col justify-center">
        {/* STEP 1: Names & Ages */}
        {step === 1 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-100 border border-rose-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mb-2">
                <Heart className="w-7 h-7 fill-current" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">ধাপ ১: দুজনের নাম ও বয়স</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                যে দুজনের সম্পর্ক টেস্ট করবেন তাদের নাম ও বয়স লিখুন।
              </p>
            </div>

            <form onSubmit={goToStep2} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ১ম জনের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={person1Name}
                    onChange={(e) => setPerson1Name(e.target.value)}
                    placeholder="যেমন: অনিক"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-rose-50/40 border border-rose-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ২য় জনের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={person2Name}
                    onChange={(e) => setPerson2Name(e.target.value)}
                    placeholder="যেমন: অনিকা"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-rose-50/40 border border-rose-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-sm transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ১ম জনের বয়স <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={14}
                    max={90}
                    value={person1Age === '' || Number.isNaN(Number(person1Age)) ? '' : person1Age}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPerson1Age(val === '' ? '' : parseInt(val, 10) || '');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-rose-50/40 border border-rose-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ২য় জনের বয়স <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={14}
                    max={90}
                    value={person2Age === '' || Number.isNaN(Number(person2Age)) ? '' : person2Age}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPerson2Age(val === '' ? '' : parseInt(val, 10) || '');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-rose-50/40 border border-rose-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">সম্পর্কের বয়স কতদিন?</label>
                <select
                  value={relDuration}
                  onChange={(e) => setRelDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-rose-50/40 border border-rose-200 text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
                >
                  <option value="১-৬ মাস (সদ্য শুরু)">🌱 ১-৬ মাস (সদ্য ভালোলাগা বা শুরু)</option>
                  <option value="৬ মাস থেকে ১ বছর">💖 ৬ মাস থেকে ১ বছর</option>
                  <option value="১ থেকে ৩ বছর">💍 ১ থেকে ৩ বছর</option>
                  <option value="৩ থেকে ৫ বছর">⏳ ৩ থেকে ৫ বছর</option>
                  <option value="৫ বছরেরও বেশি সময়">💎 ৫+ বছরের গভীর সম্পর্ক</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
                >
                  <span>পরবর্তী ধাপে যান (পারিবারিক তথ্য)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Family & Appearance */}
        {step === 2 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-100 border border-rose-100">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্বের পেজ</span>
              </button>
              <span className="text-xs text-slate-400">ধাপ ২ / ৫</span>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">ধাপ ২: অবস্থান, গায়ের রং ও পারিবারিক সম্মতি</h2>
              <p className="text-xs text-slate-500 mt-0.5">দুজনের তথ্য নির্বাচন করুন</p>
            </div>

            <div className="space-y-4">
              <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
                <h3 className="text-xs font-bold text-rose-900 mb-2.5">👑 ১. পরিবারে কে কততম সন্তান?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <span className="font-bold text-rose-700">{person1Name}</span>-এর অবস্থান:
                    </label>
                    <select
                      value={p1BirthOrder}
                      onChange={(e) => setP1BirthOrder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="বড় সন্তান (দায়িত্বশীল)">বড় সন্তান (পরিবারের দায়িত্ব কাঁধে)</option>
                      <option value="মেজো সন্তান (অভিমানী ও চাপা স্বভাব)">মেজো সন্তান (অভিমানী ও কম্প্রোমাইজ স্বভাব)</option>
                      <option value="ছোট সন্তান (খুনসুটি ও আদুরে)">ছোট সন্তান (খুনসুটি প্রিয় ও আদুরে)</option>
                      <option value="একমাত্র সন্তান (খুব বেশি আদুরে)">একমাত্র সন্তান (পরিবারের চোখের মণি)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <span className="font-bold text-rose-700">{person2Name}</span>-এর অবস্থান:
                    </label>
                    <select
                      value={p2BirthOrder}
                      onChange={(e) => setP2BirthOrder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="বড় সন্তান (দায়িত্বশীল)">বড় সন্তান (পরিবারের দায়িত্ব কাঁধে)</option>
                      <option value="মেজো সন্তান (অভিমানী ও চাপা স্বভাব)">মেজো সন্তান (অভিমানী ও কম্প্রোমাইজ স্বভাব)</option>
                      <option value="ছোট সন্তান (খুনসুটি ও আদুরে)">ছোট সন্তান (খুনসুটি প্রিয় ও আদুরে)</option>
                      <option value="একমাত্র সন্তান (খুব বেশি আদুরে)">একমাত্র সন্তান (পরিবারের চোখের মণি)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
                <h3 className="text-xs font-bold text-rose-900 mb-2.5">✨ ২. দুজনের গায়ের রং কেমন?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <span className="font-bold text-rose-700">{person1Name}</span>-এর গায়ের রং:
                    </label>
                    <select
                      value={p1Complexion}
                      onChange={(e) => setP1Complexion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="উজ্জ্বল ফর্সা">উজ্জ্বল ফর্সা</option>
                      <option value="মিষ্টি শ্যামলা ও আকর্ষণীয়">মিষ্টি শ্যামলা ও আকর্ষণীয়</option>
                      <option value="উজ্জ্বল শ্যামবর্ণ">উজ্জ্বল শ্যামবর্ণ</option>
                      <option value="কালো বা চাপা শ্যামলা">কালো বা চাপা শ্যামলা</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <span className="font-bold text-rose-700">{person2Name}</span>-এর গায়ের রং:
                    </label>
                    <select
                      value={p2Complexion}
                      onChange={(e) => setP2Complexion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="উজ্জ্বল ফর্সা ও মায়াবী">উজ্জ্বল ফর্সা ও মায়াবী</option>
                      <option value="মিষ্টি শ্যামলা ও আকর্ষণীয়">মিষ্টি শ্যামলা ও আকর্ষণীয়</option>
                      <option value="উজ্জ্বল শ্যামবর্ণ">উজ্জ্বল শ্যামবর্ণ</option>
                      <option value="কালো বা চাপা শ্যামলা">কালো বা চাপা শ্যামলা</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100">
                <h3 className="text-xs font-bold text-rose-900 mb-2.5">👨‍👩‍👧 ৩. কার পরিবার কতটুকু মেনে নিয়েছে?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <span className="font-bold text-rose-700">{person1Name}</span>-এর পরিবার:
                    </label>
                    <select
                      value={p1FamilyAccept}
                      onChange={(e) => setP1FamilyAccept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="১০০% মেনে নিয়েছে ও বিয়ের কথা চলছে">১০০% মেনে নিয়েছে ও বিয়ের প্রস্তুতি</option>
                      <option value="এক শর্তে রাজি হতে পারে">এক শর্তে রাজি হতে পারে</option>
                      <option value="পরিবার এখনো কিছুই জানে না">পরিবার এখনো কিছুই জানে না</option>
                      <option value="পরিবার ঘোর বিরোধী বা তীব্র আপত্তি">পরিবার ঘোর বিরোধী বা তীব্র আপত্তি</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <span className="font-bold text-rose-700">{person2Name}</span>-এর পরিবার:
                    </label>
                    <select
                      value={p2FamilyAccept}
                      onChange={(e) => setP2FamilyAccept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="১০০% মেনে নিয়েছে ও বিয়ের কথা চলছে">১০০% মেনে নিয়েছে ও পরিবারের সম্মতি</option>
                      <option value="পড়াশোনা বা চাকরির পর রাজি হবে">চাকরি বা কেরিয়ারের পর রাজি হবে</option>
                      <option value="পরিবার এখনো কিছুই জানে না">পরিবার এখনো কিছুই জানে না</option>
                      <option value="পরিবার কোনোভাবেই রাজি নয়">পরিবার কোনোভাবেই রাজি নয়</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={goToStep3}
                  className="w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
                >
                  <span>পরবর্তী ধাপে যান (বাস্তব পরিস্থিতি যাচাই)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Psychological Scenarios */}
        {step === 3 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-100 border border-rose-100">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্বের পেজ</span>
              </button>
              <span className="text-xs text-slate-400">ধাপ ৩ / ৫</span>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">ধাপ ৩: বাস্তব পরিস্থিতি ও মনোভাব</h2>
              <p className="text-xs text-slate-500 mt-0.5">নিচের পরিস্থিতিগুলোতে দুজনের প্রতিক্রিয়া কেমন হয় তা সিলেক্ট করুন</p>
            </div>

            <div className="space-y-4">
              <div className="bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  ১. ঝগড়া হলে আগে কে কথা বলে বা অভিমান ভাঙায়?
                </label>
                <select
                  value={qFightEgo}
                  onChange={(e) => setQFightEgo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="both_calm">দুজনেই অল্পতেই মিটিয়ে ফেলে ও স্যরি বলে</option>
                  <option value="p1_always">অধিকাংশ সময় ১ম জন যেচে কথা বলে অভিমান ভাঙায়</option>
                  <option value="p2_always">অধিকাংশ সময় ২য় জন মানভঞ্জন করে</option>
                  <option value="silent_ego">দুজনেই জেদি, দিনের পর দিন ব্লক ও কথা বন্ধ থাকে</option>
                </select>
              </div>

              <div className="bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  ২. রেস্টুরেন্টে খাওয়া বা কেনাকাটার বিল দেওয়ার ব্যাপারে আচরণ কেমন?
                </label>
                <select
                  value={qBillShare}
                  onChange={(e) => setQBillShare(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="balanced">একেকদিন একেকজন দেয় অথবা মিলেমিশে শেয়ার করে</option>
                  <option value="one_sided">সবসময় একজনের পকেট থেকেই খরচ করানোর ধান্দা</option>
                  <option value="unconditional">যেকোনো একজন মন থেকে দেয়, অন্যজনও আন্তরিক খেয়াল রাখে</option>
                </select>
              </div>

              <div className="bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  ৩. ভবিষ্যৎ ও বিয়ে নিয়ে কথা উঠলে কার প্রতিক্রিয়া কেমন?
                </label>
                <select
                  value={qFutureMarriage}
                  onChange={(e) => setQFutureMarriage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="serious">দুজনেই খুব সিরিয়াস এবং পরিবারকে রাজি করানোর বাস্তব প্ল্যান রয়েছে</option>
                  <option value="avoiding">একজন বিয়ের কথা তুললেই অন্যজন এড়িয়ে যায় বা টপিক বদলায়</option>
                  <option value="unsure">পরিবার মানবে না বলে আগেই হাল ছেড়ে দেওয়ার অজুহাত দেয়</option>
                </select>
              </div>

              <div className="bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  ৪. বিপদে বা মন খারাপে কে কতটা পাশে থাকে?
                </label>
                <select
                  value={qHardTimes}
                  onChange={(e) => setQHardTimes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="always_there">রাত-দিন যেকোনো সময় মানসিকভাবে শক্তি ও সাহস জোগায়</option>
                  <option value="only_good_times">ভালো সময়ে মিষ্টি কথা কিন্তু সমস্যায় পড়লে বাহানা দেয়</option>
                  <option value="complaining">সমস্যার কথা শুনলে উল্টো নিজের মন খারাপ বলে রাগ দেখায়</option>
                </select>
              </div>

              <div className="bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  ৫. দুজনের মধ্যে বিশ্বাসের জায়গা কতটুকু মজবুত?
                </label>
                <select
                  value={qLoyaltyTrust}
                  onChange={(e) => setQLoyaltyTrust(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-rose-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="full_trust">১০০% বিশ্বাস, সোশ্যাল মিডিয়া নিয়ে অযথা সন্দেহ নেই</option>
                  <option value="suspicious">ফোনের স্ক্রিন লুকায় বা অন্য কারো সাথে চ্যাটিংয়ে সন্দেহ হয়</option>
                  <option value="over_possessive">অতিরিক্ত সন্দেহ ও কথায় কথায় প্রমাণ চাওয়া হয়</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={goToStep4}
                  className="w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
                >
                  <span>পরবর্তী ধাপে যান (গুণাবলী ও রেটিং)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Partner Traits */}
        {step === 4 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-100 border border-rose-100">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্বের পেজ</span>
              </button>
              <span className="text-xs text-slate-400">ধাপ ৪ / ৫</span>
            </div>

            <div className="text-center mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">ধাপ ৪: পার্টনারের গুণাবলী রেটিং</h2>
              <p className="text-xs text-slate-500 mt-0.5">১ থেকে ৫ পর্যন্ত রেটিং দিন (৫ = সেরা, ১ = একদম কম)</p>
            </div>

            <div className="space-y-3.5">
              <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">১. সততা ও বিশ্বস্ততা</span>
                  <span className="text-[10px] text-slate-500">কথা ও কাজে মিল এবং প্রতিশ্রুতি রক্ষা</span>
                </div>
                <select
                  value={Number.isNaN(traitHonesty) ? 5 : traitHonesty}
                  onChange={(e) => setTraitHonesty(parseInt(e.target.value, 10) || 5)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-600 cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (৫/৫)</option>
                  <option value={4}>⭐⭐⭐⭐ (৪/৫)</option>
                  <option value={3}>⭐⭐⭐ (৩/৫)</option>
                  <option value={2}>⭐⭐ (২/৫)</option>
                  <option value={1}>⭐ (১/৫)</option>
                </select>
              </div>

              <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">২. যত্ন ও আবেগীয় মূল্য</span>
                  <span className="text-[10px] text-slate-500">মন খারাপ বুঝা এবং খোঁজখবর নেওয়া</span>
                </div>
                <select
                  value={Number.isNaN(traitCaring) ? 5 : traitCaring}
                  onChange={(e) => setTraitCaring(parseInt(e.target.value, 10) || 5)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-600 cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (৫/৫)</option>
                  <option value={4}>⭐⭐⭐⭐ (৪/৫)</option>
                  <option value={3}>⭐⭐⭐ (৩/৫)</option>
                  <option value={2}>⭐⭐ (২/৫)</option>
                  <option value={1}>⭐ (১/৫)</option>
                </select>
              </div>

              <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">৩. ছাড় দেওয়ার মনোভাব</span>
                  <span className="text-[10px] text-slate-500">সম্পর্কের জন্য কম্প্রোমাইজ করার ইচ্ছা</span>
                </div>
                <select
                  value={Number.isNaN(traitSacrifice) ? 5 : traitSacrifice}
                  onChange={(e) => setTraitSacrifice(parseInt(e.target.value, 10) || 5)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-600 cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (৫/৫)</option>
                  <option value={4}>⭐⭐⭐⭐ (৪/৫)</option>
                  <option value={3}>⭐⭐⭐ (৩/৫)</option>
                  <option value={2}>⭐⭐ (২/৫)</option>
                  <option value={1}>⭐ (১/৫)</option>
                </select>
              </div>

              <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">৪. বিয়ের জন্য পারিবারিক চেষ্টা</span>
                  <span className="text-[10px] text-slate-500">পরিবারের সাথে কথা বলা ও শক্ত অবস্থান নেওয়া</span>
                </div>
                <select
                  value={Number.isNaN(traitEffort) ? 5 : traitEffort}
                  onChange={(e) => setTraitEffort(parseInt(e.target.value, 10) || 5)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-600 cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (৫/৫)</option>
                  <option value={4}>⭐⭐⭐⭐ (৪/৫)</option>
                  <option value={3}>⭐⭐⭐ (৩/৫)</option>
                  <option value={2}>⭐⭐ (২/৫)</option>
                  <option value={1}>⭐ (১/৫)</option>
                </select>
              </div>

              <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">৫. নিঃস্বার্থ ভালোবাসা</span>
                  <span className="text-[10px] text-slate-500">টাকা বা উপহারের কোনো ধান্দাবাজি নেই</span>
                </div>
                <select
                  value={Number.isNaN(traitSelfless) ? 5 : traitSelfless}
                  onChange={(e) => setTraitSelfless(parseInt(e.target.value, 10) || 5)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-600 cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (৫/৫)</option>
                  <option value={4}>⭐⭐⭐⭐ (৪/৫)</option>
                  <option value={3}>⭐⭐⭐ (৩/৫)</option>
                  <option value={2}>⭐⭐ (২/৫)</option>
                  <option value={1}>⭐ (১/৫)</option>
                </select>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={calculateFinalVerdict}
                  className="w-full py-4 px-6 rounded-2xl text-white font-extrabold text-sm sm:text-base shadow-xl shadow-rose-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>ফলাফল ও খাঁটি রায় দেখুন ⚖️</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Final Verdict & Certificate */}
        {step === 5 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-100 border border-rose-100 text-center">
            <div className="mb-4">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-700 tracking-wider uppercase">
                প্রেম ট্রাইব্যুনাল এর চূড়ান্ত রায়
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              <span className="text-rose-600 font-extrabold">{person1Name}</span>{' '}
              <span className="text-slate-400 text-sm">❤️</span>{' '}
              <span className="text-pink-600 font-extrabold">{person2Name}</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              বয়স: {person1Age} ও {person2Age} বছর • সম্পর্কের বয়স: {relDuration}
            </p>

            {/* Circular Meter */}
            <div className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="#ffe4e6" stroke-width="10" fill="transparent" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#loveRoseGradient)"
                  stroke-width="10"
                  stroke-linecap="round"
                  fill="transparent"
                  strokeDasharray="314"
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="loveRoseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900">{displayScore}%</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  খাঁটি স্কোর
                </span>
              </div>
            </div>

            {/* Verdict Badge */}
            <div className="mb-5">
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold border ${verdictColor}`}>
                {verdictTitle}
              </span>
            </div>

            {/* Analysis Box */}
            <div className="bg-rose-50/60 rounded-2xl p-4 sm:p-5 border border-rose-100 text-left mb-5 space-y-2.5">
              <h3 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-rose-600" />
                <span>গভীর বাস্তব পর্যালোচনা:</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{analysisText}</p>
              <div className="pt-2 border-t border-rose-100/80">
                <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                  পরামর্শ: {adviceText}
                </p>
              </div>
            </div>

            {/* Download Certificate Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={generateAndDownloadCertificate}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>সনদপত্র ডাউনলোড করুন 📜</span>
              </button>

              <button
                type="button"
                onClick={resetTest}
                className="py-3 px-4 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>নতুন করে টেস্ট 🔄</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Hidden Certificate Canvas */}
      <canvas ref={certCanvasRef} width={900} height={620} className="hidden" />
    </div>
  );
};
