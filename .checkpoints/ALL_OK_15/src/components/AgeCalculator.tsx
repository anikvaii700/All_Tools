import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, Cake, Clock, Download, Share2, Sparkles, RotateCcw, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AgeCalculatorProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

const BENGALI_MONTHS = [
  'জানুয়ারি (০১)',
  'ফেব্রুয়ারি (০২)',
  'মার্চ (০৩)',
  'এপ্রিল (০৪)',
  'মে (০৫)',
  'জুন (০৬)',
  'জুলাই (০৭)',
  'আগস্ট (০৮)',
  'সেপ্টেম্বর (০৯)',
  'অক্টোবর (১০)',
  'নভেম্বর (১১)',
  'ডিসেম্বর (১২)',
];

const BENGALI_DAY_NAMES = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];

const toBanglaNum = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
};

export const AgeCalculator: React.FC<AgeCalculatorProps> = ({ onBackToHub, onShowToast }) => {
  const today = new Date();

  // Birth Date States (দিন / মাস / বছর)
  const [birthDay, setBirthDay] = useState<number>(1);
  const [birthMonth, setBirthMonth] = useState<number>(1); // 1-12
  const [birthYear, setBirthYear] = useState<number>(2000);

  // Target Date States (আজকের বা নির্দিষ্ট দিন / মাস / বছর)
  const [targetDay, setTargetDay] = useState<number>(today.getDate());
  const [targetMonth, setTargetMonth] = useState<number>(today.getMonth() + 1);
  const [targetYear, setTargetYear] = useState<number>(today.getFullYear());

  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  // Results
  const [years, setYears] = useState<number>(0);
  const [months, setMonths] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [nextBdayDays, setNextBdayDays] = useState<number>(0);
  const [nextBdayDayName, setNextBdayDayName] = useState<string>('');
  const [totalWeeks, setTotalWeeks] = useState<number>(0);
  const [totalDaysLived, setTotalDaysLived] = useState<number>(0);
  const [birthWeekday, setBirthWeekday] = useState<string>('');

  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Years list for dropdown (1940 to 2026)
  const currentYear = today.getFullYear();
  const yearsList = Array.from({ length: currentYear - 1939 }, (_, i) => currentYear - i);

  // Days list (1 to 31)
  const daysList = Array.from({ length: 31 }, (_, i) => i + 1);

  const calculateAge = () => {
    // Construct Date objects (month is 0-indexed in JS)
    const birth = new Date(birthYear, birthMonth - 1, birthDay);
    const target = new Date(targetYear, targetMonth - 1, targetDay);

    if (isNaN(birth.getTime()) || isNaN(target.getTime())) {
      alert('সঠিক দিন, মাস ও বছর নির্বাচন করুন');
      return;
    }

    if (birth > target) {
      alert('জন্মতারিখ বর্তমান বা গণনার তারিখের চেয়ে বড় হতে পারে না!');
      return;
    }

    let y = target.getFullYear() - birth.getFullYear();
    let m = target.getMonth() - birth.getMonth();
    let d = target.getDate() - birth.getDate();

    if (d < 0) {
      m--;
      const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      d += prevMonthLastDay;
    }

    if (m < 0) {
      y--;
      m += 12;
    }

    setYears(y);
    setMonths(m);
    setDays(d);

    // Birth day of week
    setBirthWeekday(BENGALI_DAY_NAMES[birth.getDay()]);

    // Next Birthday countdown
    let nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday.setFullYear(target.getFullYear() + 1);
    }
    const diffTime = nextBday.getTime() - target.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setNextBdayDays(diffDays);
    setNextBdayDayName(BENGALI_DAY_NAMES[nextBday.getDay()]);

    // Total stats
    const totalDiffTime = target.getTime() - birth.getTime();
    const totalD = Math.floor(totalDiffTime / (1000 * 60 * 60 * 24));
    setTotalDaysLived(totalD);
    setTotalWeeks(Math.floor(totalD / 7));

    setHasCalculated(true);

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const copyResultText = async () => {
    const text = `📅 আমার বয়স হিসাব (The MoSaFa Tools):\n` +
      `জন্মতারিখ: ${toBanglaNum(birthDay)} ${BENGALI_MONTHS[birthMonth - 1].split(' ')[0]} ${toBanglaNum(birthYear)} (${birthWeekday})\n` +
      `বর্তমান বয়স: ${toBanglaNum(years)} বছর, ${toBanglaNum(months)} মাস, ${toBanglaNum(days)} দিন\n` +
      `পরবর্তী জন্মদিন: আর মাত্র ${toBanglaNum(nextBdayDays)} দিন বাকি (${nextBdayDayName})\n` +
      `মোট অতিবাহিত দিন: ${toBanglaNum(totalDaysLived)} দিন (${toBanglaNum(totalWeeks)} সপ্তাহ)\n` +
      `The MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('বয়সের ফলাফল কপি হয়েছে! 📋', '✅');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onShowToast('বয়সের ফলাফল কপি হয়েছে! 📋', '✅');
    }
  };

  useEffect(() => {
    calculateAge();
  }, []);

  const downloadAgeCard = () => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 840;
    canvas.width = W;
    canvas.height = H;

    // Background Gradient - Festive Emerald Theme
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(0.5, '#047857');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Double Ornate Border
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 4;
    ctx.strokeRect(25, 25, W - 50, H - 50);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(35, 35, W - 70, H - 70);

    // Header Title
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE MOSAFA TOOLS • বয়স ও জীবন পরিসংখ্যান', W / 2, 75);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
    ctx.fillText('আপনার নিখুঁত বয়স সনদ 🎂', W / 2, 125);

    // Birth info banner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(60, 160, W - 120, 60, 16);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText(
      `জন্মতারিখ: ${toBanglaNum(birthDay)} ${BENGALI_MONTHS[birthMonth - 1].split(' ')[0]} ${toBanglaNum(birthYear)} (${birthWeekday})`,
      W / 2,
      198
    );

    // Age Highlights - 3 Circle/Cards
    const drawBox = (x: number, y: number, value: string, label: string) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(x, y, 190, 130, 20);
      ctx.fill();
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 44px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(value, x + 95, y + 65);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.fillText(label, x + 95, y + 105);
    };

    drawBox(80, 250, toBanglaNum(years), 'বছর');
    drawBox(305, 250, toBanglaNum(months), 'মাস');
    drawBox(530, 250, toBanglaNum(days), 'দিন');

    // Milestone Details
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText('🌟 জীবনের বিস্তারিত পরিসংখ্যান:', 80, 440);

    const stats = [
      `• পরবর্তী জন্মদিন: আর মাত্র ${toBanglaNum(nextBdayDays)} দিন বাকি (বার: ${nextBdayDayName})`,
      `• মোট অতিবাহিত সপ্তাহ: প্রায় ${toBanglaNum(totalWeeks)} সপ্তাহ`,
      `• মোট বেঁচে থাকার দিন: প্রায় ${toBanglaNum(totalDaysLived)} দিন`,
      `• গণনার তারিখ: ${toBanglaNum(targetDay)} ${BENGALI_MONTHS[targetMonth - 1].split(' ')[0]} ${toBanglaNum(targetYear)}`,
    ];

    let statY = 485;
    ctx.font = '17px "Hind Siliguri", sans-serif';
    stats.forEach((st) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(st, 90, statY);
      statY += 40;
    });

    // Decorative divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 680);
    ctx.lineTo(W - 80, 680);
    ctx.stroke();

    // Footer
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The MoSaFa Tools • সকল ফ্রি অনলাইন টুলস পোর্টাল', W / 2, 730);

    const link = document.createElement('a');
    link.download = `MoSaFa-Age-Card-${birthYear}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('বয়স কার্ড সফলভাবে ডাউনলোড হয়েছে! 🎂', '🎉');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="w-full max-w-3xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-emerald-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">বয়স ক্যালকুলেটর (দিন / মাস / বছর)</h1>
            <p className="text-xs text-slate-500">নিখুঁত বছর, মাস ও দিনের পুঙ্খানুপুঙ্খ হিসাব</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyResultText}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="বয়সের হিসাব কপি করুন"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-600" />
            <span>কপি ফলাফল</span>
          </button>
          <button
            onClick={downloadAgeCard}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>কার্ড ডাউনলোড</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          {/* SECTION 1: BIRTH DATE DROPDOWNS (দিন / মাস / বছর) */}
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <label className="block text-xs font-bold text-emerald-950 mb-2.5 flex items-center gap-1.5">
              <Cake className="w-4 h-4 text-emerald-600" />
              <span>আপনার জন্মতারিখ নির্বাচন করুন (দিন / মাস / বছর):</span>
            </label>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* দিন */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">দিন (Day):</span>
                <select
                  value={Number.isNaN(birthDay) ? 1 : birthDay}
                  onChange={(e) => setBirthDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2.5 rounded-xl bg-white border border-emerald-200 text-slate-800 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {daysList.map((d) => (
                    <option key={d} value={d}>
                      {toBanglaNum(d)} তারিখ
                    </option>
                  ))}
                </select>
              </div>

              {/* মাস */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">মাস (Month):</span>
                <select
                  value={Number.isNaN(birthMonth) ? 1 : birthMonth}
                  onChange={(e) => setBirthMonth(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2.5 rounded-xl bg-white border border-emerald-200 text-slate-800 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {BENGALI_MONTHS.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* বছর */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">বছর (Year):</span>
                <select
                  value={Number.isNaN(birthYear) ? 2000 : birthYear}
                  onChange={(e) => setBirthYear(parseInt(e.target.value, 10) || 2000)}
                  className="w-full p-2.5 rounded-xl bg-white border border-emerald-200 text-slate-800 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {toBanglaNum(y)} সাল
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: TARGET / AS-OF DATE DROPDOWNS (দিন / মাস / বছর) */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>কোন তারিখ পর্যন্ত হিসাব করতে চান? (ডিফল্ট: আজকের তারিখ):</span>
            </label>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* দিন */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">দিন (Day):</span>
                <select
                  value={Number.isNaN(targetDay) ? 1 : targetDay}
                  onChange={(e) => setTargetDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {daysList.map((d) => (
                    <option key={d} value={d}>
                      {toBanglaNum(d)}
                    </option>
                  ))}
                </select>
              </div>

              {/* মাস */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">মাস (Month):</span>
                <select
                  value={Number.isNaN(targetMonth) ? 1 : targetMonth}
                  onChange={(e) => setTargetMonth(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {BENGALI_MONTHS.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* বছর */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">বছর (Year):</span>
                <select
                  value={Number.isNaN(targetYear) ? 2024 : targetYear}
                  onChange={(e) => setTargetYear(parseInt(e.target.value, 10) || 2024)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {toBanglaNum(y)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={calculateAge}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>বয়স হিসাব করুন 📅</span>
          </button>

          {/* Results Box */}
          {hasCalculated && (
            <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in duration-300">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
                আপনার বর্তমান সঠিক বয়স
              </h3>

              {/* দিন / মাস / বছর Results */}
              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-xs">
                  <span className="text-2xl sm:text-4xl font-black text-emerald-700">
                    {toBanglaNum(years)}
                  </span>
                  <span className="block text-xs font-bold text-emerald-900 mt-1">বছর</span>
                </div>
                <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100 shadow-xs">
                  <span className="text-2xl sm:text-4xl font-black text-teal-700">
                    {toBanglaNum(months)}
                  </span>
                  <span className="block text-xs font-bold text-teal-900 mt-1">মাস</span>
                </div>
                <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-100 shadow-xs">
                  <span className="text-2xl sm:text-4xl font-black text-cyan-700">
                    {toBanglaNum(days)}
                  </span>
                  <span className="block text-xs font-bold text-cyan-900 mt-1">দিন</span>
                </div>
              </div>

              {/* Next Birthday & Life stats */}
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center flex items-center justify-center gap-2">
                  <Cake className="w-5 h-5 text-rose-500" />
                  <div>
                    <span className="text-xs text-slate-500 font-medium">পরবর্তী জন্মদিন আসতে বাকি:</span>
                    <p className="text-sm sm:text-base font-bold text-slate-800">
                      আর মাত্র <strong className="text-rose-600">{toBanglaNum(nextBdayDays)}</strong> দিন বাকি (বার:{' '}
                      {nextBdayDayName})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block mb-0.5">মোট অতিবাহিত সপ্তাহ:</span>
                    <span className="font-extrabold text-slate-800 text-sm flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      {toBanglaNum(totalWeeks)} সপ্তাহ
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block mb-0.5">মোট অতিবাহিত দিন:</span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {toBanglaNum(totalDaysLived)} দিন
                    </span>
                  </div>
                </div>

                {/* Quick Result Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={copyResultText}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Copy className="w-4 h-4 text-emerald-600" />
                    <span>ফলাফল কপি করুন</span>
                  </button>
                  <button
                    onClick={downloadAgeCard}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>বয়স সনদ কার্ড (PNG)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Hidden canvas for Age Card download */}
      <canvas ref={cardCanvasRef} className="hidden" />
    </div>
  );
};
