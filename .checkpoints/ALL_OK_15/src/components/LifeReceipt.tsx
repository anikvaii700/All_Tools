import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Receipt,
  Download,
  Copy,
  Clock,
  Moon,
  Smartphone,
  Briefcase,
  Car,
  Utensils,
  Smile,
  Sparkles,
  RotateCcw,
  Palette,
  Check,
} from 'lucide-react';

interface LifeReceiptProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export type ReceiptTheme = 'vintage' | 'thermal' | 'luxury';

const toBanglaNum = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
};

export const LifeReceipt: React.FC<LifeReceiptProps> = ({ onBackToHub, onShowToast }) => {
  const [age, setAge] = useState<number | string>(24);
  const [userName, setUserName] = useState<string>('মোফাচ্ছির আহমেদ');
  const [theme, setTheme] = useState<ReceiptTheme>('vintage');

  // Daily hours
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [phoneHours, setPhoneHours] = useState<number>(4.5);
  const [workHours, setWorkHours] = useState<number>(6.0);
  const [commuteHours, setCommuteHours] = useState<number>(1.5);
  const [eatingHours, setEatingHours] = useState<number>(2.0);
  const [leisureHours, setLeisureHours] = useState<number>(2.5);

  const receiptCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const parsedAge = typeof age === 'number' ? age : parseInt(age, 10) || 1;
  const totalDaysLived = Math.max(1, Math.round(parsedAge * 365.25));

  const calcTotalHours = (dailyH: number) => Math.round(dailyH * totalDaysLived);
  const calcTotalYears = (dailyH: number) => ((dailyH * totalDaysLived) / (24 * 365.25)).toFixed(1);

  const totalSleepHours = calcTotalHours(sleepHours);
  const totalPhoneHours = calcTotalHours(phoneHours);
  const totalWorkHours = calcTotalHours(workHours);
  const totalCommuteHours = calcTotalHours(commuteHours);
  const totalEatingHours = calcTotalHours(eatingHours);
  const totalLeisureHours = calcTotalHours(leisureHours);

  const dailyTotal = sleepHours + phoneHours + workHours + commuteHours + eatingHours + leisureHours;

  const items = [
    { name: '১. ঘুম ও বিশ্রাম', h: totalSleepHours, y: calcTotalYears(sleepHours), daily: sleepHours },
    { name: '২. মোবাইল ও সোশ্যাল মিডিয়া', h: totalPhoneHours, y: calcTotalYears(phoneHours), daily: phoneHours },
    { name: '৩. ক্যারিয়ার ও পড়াশোনা', h: totalWorkHours, y: calcTotalYears(workHours), daily: workHours },
    { name: '৪. যাতায়াত ও জ্যামে থাকা', h: totalCommuteHours, y: calcTotalYears(commuteHours), daily: commuteHours },
    { name: '৫. আহার ও নিত্যকাজ', h: totalEatingHours, y: calcTotalYears(eatingHours), daily: eatingHours },
    { name: '৬. বিনোদন, আড্ডা ও অবসর', h: totalLeisureHours, y: calcTotalYears(leisureHours), daily: leisureHours },
  ];

  // Copy Full Receipt Text
  const copyReceiptText = async () => {
    let text = `🧾 MoSaFa Life Receipt (জীবন হিসাব ক্যাশ মেমো):\n`;
    text += `গ্রাহকের নাম: ${userName || 'সম্মানিত ইউজার'}\n`;
    text += `বর্তমান বয়স: ${toBanglaNum(age)} বছর (~${toBanglaNum(totalDaysLived.toLocaleString('en-US'))} দিন)\n`;
    text += `তারিখ: ${new Date().toLocaleDateString('bn-BD')}\n`;
    text += `-------------------------------------\n`;
    text += `খাত / দৈনন্দিন অভ্যাস | মোট ঘণ্টা | বছর\n`;
    text += `-------------------------------------\n`;
    items.forEach((it) => {
      text += `${it.name}: ${toBanglaNum(it.h.toLocaleString('en-US'))} ঘণ্টা (~${toBanglaNum(it.y)} বছর)\n`;
    });
    text += `-------------------------------------\n`;
    text += `দৈনিক অতিবাহিত: ${toBanglaNum(dailyTotal.toFixed(1))} ঘণ্টা / ২৪ ঘণ্টা\n`;
    text += `সময়ের সঠিক ব্যবহারই জীবনের শ্রেষ্ঠ সম্পদ • The MoSaFa Tools`;

    try {
      await navigator.clipboard.writeText(text);
      onShowToast('সম্পূর্ণ রশিদের বিবরণ কপি হয়েছে! 📋', '✅');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onShowToast('সম্পূর্ণ রশিদের বিবরণ কপি হয়েছে! 📋', '✅');
    }
  };

  // High-Resolution Themed Receipt Canvas Generator
  const downloadReceipt = () => {
    const canvas = receiptCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 640;
    const H = 1000;
    canvas.width = W;
    canvas.height = H;

    if (theme === 'vintage') {
      // ----------------------------------------------------
      // THEME 1: ঐতিহ্যবাহী বাংলা ক্যাশ মেমো (Warm Parchment & Stamp)
      // ----------------------------------------------------
      ctx.fillStyle = '#fefce8';
      ctx.fillRect(0, 0, W, H);

      // Vintage Ornamental Double Border
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(28, 28, W - 56, H - 56);

      // Top Header Calligraphy
      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('বিসমিল্লাহির রাহমানির রাহিম', W / 2, 58);

      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
      ctx.fillText('দি মোফাচ্ছির লাইফ ক্যাশ মেমো', W / 2, 95);

      ctx.fillStyle = '#4b5563';
      ctx.font = '14px "Hind Siliguri", sans-serif';
      ctx.fillText('জীবনকাল সময় ব্যবহারের সত্য ও বস্তুনিষ্ঠ হিসাব বিবরণী', W / 2, 122);

      // Divider line
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 140);
      ctx.lineTo(W - 40, 140);
      ctx.stroke();

      // Customer info
      ctx.textAlign = 'left';
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.fillText(`গ্রাহকের নাম: ${userName || 'সম্মানিত ইউজার'}`, 45, 175);
      ctx.fillText(`বর্তমান বয়স: ${toBanglaNum(age)} বছর (${toBanglaNum(totalDaysLived.toLocaleString('en-US'))} দিন)`, 45, 204);

      ctx.textAlign = 'right';
      ctx.fillText(`মেমো নং: MSF-${age}${Date.now().toString().slice(-4)}`, W - 45, 175);
      ctx.fillText(`তারিখ: ${new Date().toLocaleDateString('bn-BD')}`, W - 45, 204);

      // Table Box
      const tableY = 230;
      ctx.fillStyle = '#065f46';
      ctx.fillRect(40, tableY, W - 80, 36);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('খাত ও প্রাত্যহিক অভ্যাস', 55, tableY + 24);
      ctx.textAlign = 'right';
      ctx.fillText('মোট ঘণ্টা', 430, tableY + 24);
      ctx.fillText('বছর হিসেবে', W - 55, tableY + 24);

      // Table Rows
      let rowY = tableY + 68;
      items.forEach((it, idx) => {
        if (idx % 2 === 1) {
          ctx.fillStyle = 'rgba(6, 95, 70, 0.05)';
          ctx.fillRect(40, rowY - 26, W - 80, 40);
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = '#111827';
        ctx.font = '600 15px "Hind Siliguri", sans-serif';
        ctx.fillText(it.name, 55, rowY);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#065f46';
        ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
        ctx.fillText(`${toBanglaNum(it.h.toLocaleString('en-US'))} ঘণ্টা`, 430, rowY);

        ctx.fillStyle = '#991b1b';
        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.fillText(`~${toBanglaNum(it.y)} বছর`, W - 55, rowY);

        rowY += 45;
      });

      // Bottom Total Row
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(40, rowY);
      ctx.lineTo(W - 40, rowY);
      ctx.stroke();

      rowY += 32;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.fillText(`দৈনিক গড় ব্যবহার: ${toBanglaNum(dailyTotal.toFixed(1))} ঘণ্টা / ২৪ ঘণ্টা`, 45, rowY);

      // Traditional Red Stamp: অনুমোদিত / যাচাইকৃত ✓
      ctx.save();
      ctx.translate(W - 140, rowY + 60);
      ctx.rotate(-0.15);
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 50, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#b91c1c';
      ctx.textAlign = 'center';
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.fillText('পরিশোধিত', 0, -8);
      ctx.font = 'bold 13px "Hind Siliguri", sans-serif';
      ctx.fillText('THE MOSAFA', 0, 12);
      ctx.fillText('✓ APPROVED', 0, 28);
      ctx.restore();

      // Signatures
      const sigY = H - 110;
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, sigY);
      ctx.lineTo(210, sigY);
      ctx.moveTo(W - 210, sigY);
      ctx.lineTo(W - 60, sigY);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = 'bold 13px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#4b5563';
      ctx.fillText('গ্রাহকের স্বাক্ষর', 135, sigY + 22);
      ctx.fillText('হিসাবরক্ষক স্বাক্ষর', W - 135, sigY + 22);

      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
      ctx.fillText('The MoSaFa Tools • সময়ের সঠিক ব্যবহারই জীবনের মূলধন', W / 2, H - 45);
    } else if (theme === 'thermal') {
      // ----------------------------------------------------
      // THEME 2: আধুনিক থার্মাল পিওএস রিসিট (Thermal POS Slip)
      // ----------------------------------------------------
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, W, H);

      // Top Zigzag Cut
      ctx.fillStyle = '#e2e8f0';
      const zz = 10;
      for (let x = 0; x < W; x += zz * 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + zz, zz);
        ctx.lineTo(x + zz * 2, 0);
        ctx.fill();
      }

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, W - 40, H - 40);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('*** MoSaFa Life POS Slip ***', W / 2, 70);

      ctx.font = '14px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('জীবনকাল সময় ব্যবহারের ইলেকট্রনিক মেমো', W / 2, 98);

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(35, 120);
      ctx.lineTo(W - 35, 120);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.textAlign = 'left';
      ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(`গ্রাহক: ${userName || 'সম্মানিত ইউজার'}`, 45, 150);
      ctx.fillText(`বয়স: ${toBanglaNum(age)} বছর (~${toBanglaNum(totalDaysLived.toLocaleString('en-US'))} দিন)`, 45, 178);
      ctx.fillText(`তারিখ: ${new Date().toLocaleDateString('bn-BD')} (${toBanglaNum(new Date().toLocaleTimeString('bn-BD'))})`, 45, 206);

      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(35, 226);
      ctx.lineTo(W - 35, 226);
      ctx.stroke();
      ctx.setLineDash([]);

      // Table
      let rY = 260;
      items.forEach((it) => {
        ctx.textAlign = 'left';
        ctx.font = '600 15px "Hind Siliguri", sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(it.name, 45, rY);

        ctx.textAlign = 'right';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(`${toBanglaNum(it.h.toLocaleString('en-US'))}h`, 430, rY);

        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.fillText(`~${toBanglaNum(it.y)} বছর`, W - 45, rY);

        rY += 46;
      });

      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(35, rY);
      ctx.lineTo(W - 35, rY);
      ctx.stroke();
      ctx.setLineDash([]);

      rY += 35;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      ctx.fillText(`দৈনিক মোট অতিবাহিত: ${toBanglaNum(dailyTotal.toFixed(1))} ঘণ্টা / ২৪ ঘণ্টা`, 45, rY);

      // Barcode
      rY += 65;
      ctx.textAlign = 'center';
      ctx.font = '42px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('||||||| | ||||| |||| |||||||| ||||| | |||||', W / 2, rY);

      rY += 30;
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`SLIP NO: MSF-LIFE-${age}X${Date.now().toString().slice(-4)}`, W / 2, rY);

      rY += 30;
      ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('ধন্যবাদ • সময়ের সঠিক ব্যবহারই আসল সমৃদ্ধি', W / 2, rY);

      // Bottom Zigzag Cut
      ctx.fillStyle = '#e2e8f0';
      for (let x = 0; x < W; x += zz * 2) {
        ctx.beginPath();
        ctx.moveTo(x, H);
        ctx.lineTo(x + zz, H - zz);
        ctx.lineTo(x + zz * 2, H);
        ctx.fill();
      }
    } else {
      // ----------------------------------------------------
      // THEME 3: রয়্যাল গোল্ডেন মেমো (Royal Midnight & Gold)
      // ----------------------------------------------------
      const darkGrad = ctx.createLinearGradient(0, 0, W, H);
      darkGrad.addColorStop(0, '#090d16');
      darkGrad.addColorStop(0.5, '#1e1b4b');
      darkGrad.addColorStop(1, '#020617');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, W, H);

      // Gold Borders
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.strokeRect(25, 25, W - 50, H - 50);

      ctx.strokeStyle = 'rgba(253, 224, 71, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(35, 35, W - 70, H - 70);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 30px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ দি মোফাচ্ছির রয়্যাল লাইফ মেমো ★', W / 2, 85);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px "Hind Siliguri", sans-serif';
      ctx.fillText('আমৃত্যু অমূল্য সময়ের সুবর্ণ হিসাব ও আত্মোপলব্ধি', W / 2, 118);

      // User pill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(50, 145, W - 100, 55, 16);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${userName || 'সম্মানিত ব্যক্তি'} • বয়স: ${toBanglaNum(age)} বছর (~${toBanglaNum(totalDaysLived.toLocaleString('en-US'))} দিন)`, W / 2, 180);

      let rY = 240;
      items.forEach((it) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.roundRect(50, rY - 22, W - 100, 42, 12);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 15px "Hind Siliguri", sans-serif';
        ctx.fillText(it.name, 65, rY + 5);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
        ctx.fillText(`${toBanglaNum(it.h.toLocaleString('en-US'))} ঘণ্টা`, 430, rY + 5);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
        ctx.fillText(`~${toBanglaNum(it.y)} বছর`, W - 65, rY + 5);

        rY += 52;
      });

      rY += 30;
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`দৈনিক ব্যবহার: ${toBanglaNum(dailyTotal.toFixed(1))} ঘণ্টা / ২৪ ঘণ্টা`, W / 2, rY);

      rY += 45;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "Hind Siliguri", sans-serif';
      ctx.fillText('The MoSaFa Tools • প্রতিটি মুহূর্তকে মূল্যবান ও অর্থপূর্ণ করুন', W / 2, H - 55);
    }

    const link = document.createElement('a');
    link.download = `MoSaFa-Life-Receipt-${theme}-${userName}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast(`আকর্ষণীয় ${theme.toUpperCase()} রশিদ ডাউনলোড সম্পন্ন! 🧾`, '🎉');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">MoSaFa Life Receipt</h1>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-300">
                ৩টি আকর্ষণীয় টেমপ্লেট
              </span>
            </div>
            <p className="text-xs text-slate-500">বাংলা ফন্টে জীবন সময় ব্যবহারের আকর্ষণীয় ডিজিটাল মেমো রিসিট</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyReceiptText}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="রশিদ কপি করুন"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">রশিদ কপি</span>
          </button>

          <button
            onClick={downloadReceipt}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>রশিদ (PNG)</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Input Settings */}
        <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          {/* Template Style Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-600" />
              <span>রশিদের টেমপ্লেট ডিজাইন নির্বাচন করুন:</span>
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'vintage', label: 'ঐতিহ্যবাহী ক্যাশ মেমো', sub: 'স্ট্যাম্প ও ক্লাসিক' },
                { id: 'thermal', label: 'থার্মাল পিওএস রিসিট', sub: 'বারকোড ও আধুনিক' },
                { id: 'luxury', label: 'রয়্যাল গোল্ডেন মেমো', sub: 'ডার্ক ও সোনালী' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as ReceiptTheme)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    theme === t.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-indigo-400'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold text-[11px] block">{t.label}</span>
                  <span className={`text-[9px] block ${theme === t.id ? 'text-slate-300' : 'text-slate-400'}`}>
                    {t.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>ব্যক্তিগত তথ্য ও দৈনিক সময় ব্যয়:</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">আপনার নাম:</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">বর্তমান বয়স (বছর):</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={age === '' || Number.isNaN(Number(age)) ? '' : age}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAge(val === '' ? '' : parseInt(val, 10) || '');
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Daily Habit Sliders */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> দৈনিক ঘুম ও বিশ্রাম:
                  </span>
                  <span>{toBanglaNum(sleepHours)} ঘণ্টা/দিন</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="14"
                  step="0.5"
                  value={Number.isNaN(sleepHours) ? 7.5 : sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value) || 7.5)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-pink-500" /> মোবাইল ও সোশ্যাল মিডিয়া:
                  </span>
                  <span>{toBanglaNum(phoneHours)} ঘণ্টা/দিন</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="14"
                  step="0.5"
                  value={Number.isNaN(phoneHours) ? 4.5 : phoneHours}
                  onChange={(e) => setPhoneHours(parseFloat(e.target.value) || 4.5)}
                  className="w-full accent-pink-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" /> কাজ বা পড়াশোনা:
                  </span>
                  <span>{toBanglaNum(workHours)} ঘণ্টা/দিন</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  step="0.5"
                  value={Number.isNaN(workHours) ? 6 : workHours}
                  onChange={(e) => setWorkHours(parseFloat(e.target.value) || 6)}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-amber-500" /> যাতায়াত (Commute):
                  </span>
                  <span>{toBanglaNum(commuteHours)} ঘণ্টা/দিন</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6"
                  step="0.5"
                  value={Number.isNaN(commuteHours) ? 1.5 : commuteHours}
                  onChange={(e) => setCommuteHours(parseFloat(e.target.value) || 1.5)}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-emerald-500" /> আহার ও প্রাত্যহিক কাজ:
                  </span>
                  <span>{toBanglaNum(eatingHours)} ঘণ্টা/দিন</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={Number.isNaN(eatingHours) ? 2 : eatingHours}
                  onChange={(e) => setEatingHours(parseFloat(e.target.value) || 2)}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-purple-500" /> অবসর, আড্ডা ও বিনোদন:
                  </span>
                  <span>{toBanglaNum(leisureHours)} ঘণ্টা/দিন</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={Number.isNaN(leisureHours) ? 2.5 : leisureHours}
                  onChange={(e) => setLeisureHours(parseFloat(e.target.value) || 2.5)}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-medium">
              দৈনিক মোট সময়: <strong>{toBanglaNum(dailyTotal.toFixed(1))} ঘণ্টা / ২৪ ঘণ্টা</strong>।
            </div>
          </div>
        </div>

        {/* Right: Live Themed Receipt Preview */}
        <div className="md:col-span-6 flex flex-col items-center w-full">
          {/* THEME PREVIEW 1: VINTAGE */}
          {theme === 'vintage' && (
            <div className="w-full max-w-sm bg-amber-50/60 p-6 rounded-2xl shadow-xl border-4 border-emerald-900/80 text-slate-900 font-sans text-xs relative overflow-hidden ring-1 ring-amber-300">
              <div className="text-center pb-3 border-b-2 border-emerald-800">
                <span className="text-[10px] text-red-700 font-bold block mb-1">বিসমিল্লাহির রাহমানির রাহিম</span>
                <h2 className="text-base font-black tracking-wide text-emerald-900">
                  দি মোফাচ্ছির লাইফ ক্যাশ মেমো
                </h2>
                <p className="text-[11px] text-slate-600 mt-0.5">জীবনকাল সময় ব্যবহারের সত্য ও বস্তুনিষ্ঠ বিবরণী</p>
              </div>

              <div className="py-2.5 text-[11px] border-b border-emerald-700/40 flex justify-between">
                <div>
                  <div>গ্রাহক: <strong className="text-emerald-950">{userName || 'আপনি'}</strong></div>
                  <div>বয়স: {toBanglaNum(age)} বছর (~{toBanglaNum(totalDaysLived.toLocaleString('en-US'))} দিন)</div>
                </div>
                <div className="text-right text-slate-500">
                  <div>মেমো: MSF-{age}</div>
                  <div>তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
                </div>
              </div>

              <div className="py-3 space-y-2 border-b-2 border-emerald-800">
                <div className="flex justify-between font-bold text-[11px] text-emerald-900 pb-1 border-b border-emerald-200">
                  <span>অভ্যাস / খাত</span>
                  <span>মোট ঘণ্টা / বছর</span>
                </div>
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <span className="font-medium text-slate-800">{it.name}</span>
                    <span className="font-bold text-emerald-900">
                      {toBanglaNum(it.h.toLocaleString('en-US'))}h <span className="text-red-700">(~{toBanglaNum(it.y)} বছর)</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Red Stamp Badge */}
              <div className="my-3 flex items-center justify-between">
                <div className="text-[10px] text-slate-600">
                  দৈনিক গড়: <strong>{toBanglaNum(dailyTotal.toFixed(1))} ঘণ্টা / ২৪ ঘণ্টা</strong>
                </div>
                <div className="px-3 py-1 rounded-full border-2 border-red-700 text-red-700 font-black text-[10px] -rotate-6">
                  পরিশোধিত ✓ APPROVED
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-emerald-900 font-bold border-t border-slate-300">
                The MoSaFa Tools • সময়ের সঠিক ব্যবহারই জীবনের শ্রেষ্ঠ মূলধন
              </div>
            </div>
          )}

          {/* THEME PREVIEW 2: THERMAL */}
          {theme === 'thermal' && (
            <div className="w-full max-w-sm bg-slate-50 p-6 rounded-2xl shadow-xl border-2 border-slate-300 text-slate-900 font-sans text-xs relative overflow-hidden">
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                <h2 className="text-base font-black tracking-wide text-slate-900">
                  *** MoSaFa Life POS Slip ***
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">জীবনকাল সময় ব্যবহারের ডিজিটাল মেমো</p>
              </div>

              <div className="py-3 text-[11px] border-b border-dashed border-slate-300 space-y-1 font-medium">
                <div>গ্রাহকের নাম: <strong className="text-slate-900">{userName || 'আপনি'}</strong></div>
                <div>বর্তমান বয়স: {toBanglaNum(age)} বছর (~{toBanglaNum(totalDaysLived.toLocaleString('en-US'))} দিন)</div>
                <div>তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
              </div>

              <div className="py-3 space-y-2 border-b-2 border-dashed border-slate-300">
                <div className="flex justify-between font-bold text-[11px] text-slate-500 pb-1 border-b border-slate-200">
                  <span>অভ্যাস / খাত</span>
                  <span>ঘণ্টা / বছর হিসেব</span>
                </div>
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <span>{it.name}</span>
                    <span className="font-bold">{toBanglaNum(it.h.toLocaleString('en-US'))}h <span className="text-rose-600">(~{toBanglaNum(it.y)} বছর)</span></span>
                  </div>
                ))}
              </div>

              <div className="pt-4 text-center">
                <p className="text-3xl tracking-widest font-black select-none text-slate-800 opacity-90 font-mono">
                  ||||||||||||||||||||||||||||||||
                </p>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">
                  SLIP: MSF-LIFE-{age}X{new Date().getFullYear()}
                </span>
                <span className="text-[11px] text-slate-600 font-bold block mt-1">
                  সময়ের মূল্যই জীবনের আসল সম্পদ • The MoSaFa Tools
                </span>
              </div>
            </div>
          )}

          {/* THEME PREVIEW 3: LUXURY */}
          {theme === 'luxury' && (
            <div className="w-full max-w-sm bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 p-6 rounded-2xl shadow-2xl border-2 border-amber-500/80 text-white font-sans text-xs relative overflow-hidden">
              <div className="text-center pb-3 border-b border-amber-500/40">
                <h2 className="text-base font-black tracking-wide text-amber-300">
                  ★ দি মোফাচ্ছির রয়্যাল লাইফ মেমো ★
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">আমৃত্যু অমূল্য সময়ের সুবর্ণ হিসাব ও আত্মোপলব্ধি</p>
              </div>

              <div className="py-2.5 text-[11px] border-b border-amber-500/20 text-slate-300">
                <div>গ্রাহক: <strong className="text-white">{userName || 'আপনি'}</strong> • বয়স: {toBanglaNum(age)} বছর</div>
                <div className="text-[10px] text-amber-200/80 mt-0.5">মোট অতিবাহিত দিন: ~{toBanglaNum(totalDaysLived.toLocaleString('en-US'))} দিন</div>
              </div>

              <div className="py-3 space-y-2 border-b border-amber-500/30">
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px] bg-white/5 p-1.5 rounded-lg">
                    <span className="text-slate-200">{it.name}</span>
                    <span className="font-bold text-sky-400">
                      {toBanglaNum(it.h.toLocaleString('en-US'))}h <span className="text-amber-300">(~{toBanglaNum(it.y)} বছর)</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 text-center text-[11px] text-amber-200/90 font-medium">
                The MoSaFa Tools • প্রতিটি মুহূর্তকে মূল্যবান ও অর্থপূর্ণ করুন
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Hidden canvas for PNG export */}
      <canvas ref={receiptCanvasRef} className="hidden" />
    </div>
  );
};
