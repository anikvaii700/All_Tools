import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Search,
  Calendar,
  User,
  Heart,
  Compass,
  Star,
  CheckCircle,
  Copy,
  Download,
  Share2,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  Lightbulb,
  Award,
  Flame,
  Droplets,
  Wind,
  Mountain,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  NameEntry,
  ZodiacInfo,
  calculateWesternZodiac,
  getOrCreateNameProfile,
  transliterateToEnglish,
} from '../data/namesDatabase';

interface NameRevealProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const NameReveal: React.FC<NameRevealProps> = ({ onBackToHub, onShowToast }) => {
  // Form State
  const [nameInput, setNameInput] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer-not-to-say'>('prefer-not-to-say');
  const [birthDate, setBirthDate] = useState<string>('');
  const [originHint, setOriginHint] = useState<string>('auto');
  const [hideBirthDateInImage, setHideBirthDateInImage] = useState<boolean>(true);

  // Validation
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Result State
  const [hasResult, setHasResult] = useState<boolean>(false);
  const [resultProfile, setResultProfile] = useState<NameEntry | null>(null);
  const [zodiacInfo, setZodiacInfo] = useState<ZodiacInfo | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Custom meaning refinement modal/inline toggle
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customMeaning, setCustomMeaning] = useState<string>('');
  const [customOrigin, setCustomOrigin] = useState<string>('বাংলা');

  // Canvas ref for image export
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Quick Inline Birth Date Picker when viewing results
  const [inlineBirthDate, setInlineBirthDate] = useState<string>('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setErrorMsg('অনুগ্রহ করে আপনার নামটি লিখুন।');
      return;
    }
    setErrorMsg('');

    const origin = originHint === 'auto' ? undefined : originHint;
    const profile = getOrCreateNameProfile(trimmed, origin, gender, birthDate);
    setResultProfile(profile);

    const zodiac = calculateWesternZodiac(birthDate, profile.ageInfo?.stage);
    setZodiacInfo(zodiac);

    setHasResult(true);

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleApplyInlineBirthDate = () => {
    if (!inlineBirthDate) return;
    setBirthDate(inlineBirthDate);
    const origin = originHint === 'auto' ? undefined : originHint;
    const updatedProfile = getOrCreateNameProfile(nameInput.trim(), origin, gender, inlineBirthDate);
    setResultProfile(updatedProfile);
    const zodiac = calculateWesternZodiac(inlineBirthDate, updatedProfile.ageInfo?.stage);
    setZodiacInfo(zodiac);
    onShowToast('জন্মতারিখ ও বয়স অনুযায়ী ফলাফল আপডেট হয়েছে! ♈', '✨');
  };

  const handleSaveCustomRefinement = () => {
    if (!resultProfile) return;
    setResultProfile({
      ...resultProfile,
      meaning: customMeaning.trim() || resultProfile.meaning,
      origin: (customOrigin as any) || resultProfile.origin,
    });
    setShowCustomModal(false);
    onShowToast('নামের তথ্য আপডেট হয়েছে!', '✅');
  };

  const handleReset = () => {
    setHasResult(false);
    setResultProfile(null);
    setZodiacInfo(null);
    setNameInput('');
    setBirthDate('');
    setInlineBirthDate('');
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyResultText = async () => {
    if (!resultProfile) return;
    const text =
      `✨ নামের গোপন গল্প — The MoSaFa Tools ✨\n` +
      `নাম: ${resultProfile.bangla} (${resultProfile.english})\n` +
      (resultProfile.ageInfo ? `বয়স: ${resultProfile.ageInfo.ageTextBn} (${resultProfile.ageInfo.stageBn})\n` : '') +
      `“${resultProfile.headline}”\n\n` +
      `📖 অধ্যায় ১: নামের অর্থ ও উৎস\n` +
      `• অর্থ: ${resultProfile.meaning}\n` +
      `• উৎস: ${resultProfile.origin}\n\n` +
      `♈ অধ্যায় ২: রাশি ও স্বভাব\n` +
      (zodiacInfo
        ? `• রাশি: ${zodiacInfo.nameBn} (${zodiacInfo.nameEn})\n• স্বভাব: ${zodiacInfo.trait}\n\n`
        : `• রাশি: জন্মতারিখ দিয়ে সঠিক রাশি জানুন\n\n`) +
      `🌟 অধ্যায় ৩: ব্যক্তিত্ব ও সেরা গুণ\n` +
      `• ধরন: ${resultProfile.personalityCategory}\n` +
      `• স্বভাব: ${resultProfile.personalityDescription}\n` +
      `• সেরা গুণ: ${resultProfile.positiveTraits.slice(0, 3).join(', ')}\n\n` +
      `💡 অধ্যায় ৪: ভবিষ্যৎ ও পরামর্শ\n` +
      `• ভবিষ্যৎ: ${resultProfile.futurePossibilities[0] || ''}\n` +
      `• পরামর্শ: ${resultProfile.practicalAdvice.slice(0, 2).join(' ')}\n\n` +
      `🔗 আপনার নামের গল্প জানতে ভিজিট করুন: The MoSaFa Tools`;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      onShowToast('ফলাফলের ৪টি অধ্যায় কপি হয়েছে! 📋', '✅');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      onShowToast('ফলাফলের ৪টি অধ্যায় কপি হয়েছে! 📋', '✅');
    }
  };

  // Helper function to render the High-Resolution Shareable Canvas (1200x1280) - 4 Chapters
  const drawPosterCanvas = async (): Promise<HTMLCanvasElement | null> => {
    if (!resultProfile) return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const W = 1200;
    const H = 1260;
    canvas.width = W;
    canvas.height = H;

    // Helper text wrap
    const wrapText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
      maxLines = 4
    ) => {
      const words = text.split(' ');
      let line = '';
      let curY = y;
      let count = 0;

      for (let i = 0; i < words.length; i++) {
        const test = line ? `${line} ${words[i]}` : words[i];
        const m = ctx.measureText(test);
        if (m.width > maxWidth && i > 0) {
          ctx.fillText(line, x, curY);
          line = words[i];
          curY += lineHeight;
          count++;
          if (count >= maxLines) break;
        } else {
          line = test;
        }
      }
      if (line && count < maxLines) {
        ctx.fillText(line, x, curY);
        curY += lineHeight;
      }
      return curY;
    };

    // 1. Celestial Deep Navy Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#0a0d24');
    bgGrad.addColorStop(0.3, '#10163a');
    bgGrad.addColorStop(0.7, '#1b1242');
    bgGrad.addColorStop(1, '#0c0b20');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Decorative Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 60; i++) {
      const sx = (Math.sin(i * 99) * 0.5 + 0.5) * W;
      const sy = (Math.cos(i * 77) * 0.5 + 0.5) * H;
      const sz = (i % 3) + 1;
      ctx.beginPath();
      ctx.arc(sx, sy, sz, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer Glow Border
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // 2. Header Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText('✨ THE MOSAFA TOOLS • নামের গোপন গল্প ✨', W / 2, 75);

    // 3. Decorative Avatar & Monogram Circle
    const avatarCenterX = W / 2;
    const avatarCenterY = 150;
    const avatarRadius = 45;

    // Outer radiant ring
    const ringGrad = ctx.createLinearGradient(
      avatarCenterX - 50,
      avatarCenterY - 50,
      avatarCenterX + 50,
      avatarCenterY + 50
    );
    ringGrad.addColorStop(0, '#38bdf8');
    ringGrad.addColorStop(0.5, '#818cf8');
    ringGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
    ctx.fill();

    // Monogram Initial
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "Hind Siliguri", sans-serif';
    const initialChar = resultProfile.bangla.charAt(0) || 'ম';
    ctx.fillText(initialChar, avatarCenterX, avatarCenterY + 15);

    // 4. Name & Headline
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px "Hind Siliguri", sans-serif';
    ctx.fillText(resultProfile.bangla, W / 2, 245);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '21px "Hind Siliguri", sans-serif';
    ctx.fillText(
      `${resultProfile.english} • উৎস: ${resultProfile.origin}`,
      W / 2,
      282
    );

    // Short headline banner
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
    ctx.fillText(`“${resultProfile.headline}”`, W / 2, 316);

    if (resultProfile.ageInfo) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
      ctx.fillText(
        `🎂 বয়স: ${resultProfile.ageInfo.ageTextBn} (${resultProfile.ageInfo.stageBn})`,
        W / 2,
        344
      );
    }

    // 5. Four Chapters Layout (2 cols x 2 rows)
    const cardW = 525;
    const cardH = 338;
    const col1X = 65;
    const col2X = 610;

    const row1Y = 365;
    const row2Y = 730;

    const drawCardBox = (
      x: number,
      y: number,
      title: string,
      iconEmoji: string,
      accentBorder: string
    ) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 20);
      ctx.fill();

      ctx.strokeStyle = accentBorder;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Card Header
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.roundRect(x, y, cardW, 52, [20, 20, 0, 0]);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
      ctx.fillText(`${iconEmoji} ${title}`, x + 20, y + 35);
    };

    // Card 1: অধ্যায় ১ - নামের অর্থ ও উৎস
    drawCardBox(col1X, row1Y, 'অধ্যায় ১: নামের অর্থ ও উৎস', '📖', '#38bdf8');
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText(`ভাষাগত উৎস: ${resultProfile.origin}`, col1X + 22, row1Y + 85);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = '22px "Hind Siliguri", sans-serif';
    wrapText(resultProfile.meaning, col1X + 22, row1Y + 125, cardW - 44, 34, 5);

    // Card 2: অধ্যায় ২ - রাশি ও স্বভাব
    drawCardBox(col2X, row1Y, 'অধ্যায় ২: রাশি ও স্বভাব', '♈', '#a855f7');
    if (zodiacInfo) {
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
      ctx.fillText(
        `${zodiacInfo.symbol} ${zodiacInfo.nameBn} (${zodiacInfo.nameEn})`,
        col2X + 22,
        row1Y + 90
      );

      ctx.fillStyle = '#c084fc';
      ctx.font = '18px "Hind Siliguri", sans-serif';
      ctx.fillText(
        `তারিখ: ${zodiacInfo.dateRangeBn} • উপাদান: ${zodiacInfo.element}`,
        col2X + 22,
        row1Y + 124
      );

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '20px "Hind Siliguri", sans-serif';
      wrapText(zodiacInfo.trait, col2X + 22, row1Y + 165, cardW - 44, 32, 4);
    } else {
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
      ctx.fillText('রাশি জানতে জন্মতারিখ যোগ করুন', col2X + 22, row1Y + 95);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '19px "Hind Siliguri", sans-serif';
      wrapText(
        'সঠিক রাশি জানার জন্য জন্মতারিখ প্রয়োজন। নামের অক্ষরের ওপর ভিত্তি করে রাশি অনুমান করা সঠিক নয়।',
        col2X + 22,
        row1Y + 145,
        cardW - 44,
        30,
        4
      );
    }

    // Card 3: অধ্যায় ৩ - ব্যক্তিত্ব ও সেরা গুণ
    drawCardBox(col1X, row2Y, 'অধ্যায় ৩: ব্যক্তিত্ব ও সেরা গুণ', '🌟', '#f59e0b');
    ctx.fillStyle = '#fde68a';
    ctx.font = '20px "Hind Siliguri", sans-serif';
    const nextY3 = wrapText(
      resultProfile.personalityDescription,
      col1X + 22,
      row2Y + 85,
      cardW - 44,
      30,
      3
    );

    let curPy = Math.max(nextY3 + 10, row2Y + 175);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText('প্রধান গুণাবলি:', col1X + 22, curPy);
    curPy += 28;

    resultProfile.positiveTraits.slice(0, 3).forEach((trait) => {
      ctx.fillStyle = '#4ade80';
      ctx.fillText('✔', col1X + 22, curPy);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '19px "Hind Siliguri", sans-serif';
      curPy = wrapText(trait, col1X + 48, curPy, cardW - 65, 26, 1) + 6;
    });

    // Card 4: অধ্যায় ৪ - ভবিষ্যৎ ও পরামর্শ
    drawCardBox(col2X, row2Y, 'অধ্যায় ৪: ভবিষ্যৎ ও পরামর্শ', '💡', '#10b981');
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText('উজ্জ্বল সম্ভাবনা:', col2X + 22, row2Y + 85);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = '20px "Hind Siliguri", sans-serif';
    const nextY4 = wrapText(
      `✦ ${resultProfile.futurePossibilities[0] || 'পরিশ্রম ও সততার মাধ্যমে সাফল্য অর্জন সম্ভব।'}`,
      col2X + 22,
      row2Y + 115,
      cardW - 44,
      30,
      3
    );

    let curAy = Math.max(nextY4 + 10, row2Y + 205);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText('দরকারি পরামর্শ:', col2X + 22, curAy);
    curAy += 28;

    resultProfile.practicalAdvice.slice(0, 2).forEach((adv) => {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('➤', col2X + 22, curAy);
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '19px "Hind Siliguri", sans-serif';
      curAy = wrapText(adv, col2X + 46, curAy, cardW - 65, 26, 2) + 6;
    });

    // 6. Bottom Disclaimer & Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Hind Siliguri", sans-serif';
    ctx.fillText(
      '⚠️ বিনোদন নোট: এটি ইতিবাচক বিনোদনের উদ্দেশ্যে তৈরি। ভবিষ্যৎ গড়ে ওঠে মানুষের সততা ও পরিশ্রমে।',
      W / 2,
      H - 75
    );

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 17px "Hind Siliguri", sans-serif';
    ctx.fillText('The MoSaFa Tools • www.themosafa.com', W / 2, H - 45);

    return canvas;
  };

  const handleDownloadImage = async () => {
    onShowToast('ছবি প্রস্তুত হচ্ছে... 🎨', '⏳');
    const canvas = await drawPosterCanvas();
    if (!canvas) return;

    try {
      const link = document.createElement('a');
      const safeName = resultProfile?.bangla.replace(/\s+/g, '_') || 'নাম';
      link.download = `MoSaFa-NameReveal-${safeName}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      onShowToast('ফলাফল কার্ড ডাউনলোড সম্পন্ন! 📥', '🎉');
    } catch {
      onShowToast('ডাউনলোডে সমস্যা হয়েছে। আবার চেষ্টা করুন।', '⚠️');
    }
  };

  const handleShareImage = async () => {
    const canvas = await drawPosterCanvas();
    if (!canvas) return;

    if (navigator.share) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            handleDownloadImage();
            return;
          }
          const file = new File([blob], 'name-reveal.png', { type: 'image/png' });
          await navigator.share({
            title: `নামের গোপন গল্প - ${resultProfile?.bangla}`,
            text: `আমার নামের গোপন অর্থ ও বৈশিষ্ট্য দেখুন The MoSaFa Tools-এ!\nনাম: ${resultProfile?.bangla}`,
            files: [file],
          });
          onShowToast('শেয়ার সম্পন্ন হয়েছে! 🚀', '✅');
        });
        return;
      } catch {
        // Fallback to regular download
      }
    }

    // Fallback
    handleDownloadImage();
    onShowToast(
      'ডাউনলোড করা ছবিটি আপনার ফেসবুক, মেসেঞ্জার বা হোয়াটসঅ্যাপে সহজে আপলোড করুন! 📱',
      'ℹ️'
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* Hidden canvas for high-resolution PNG rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Navigation Bar */}
      <nav className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-800">
        <button
          onClick={onBackToHub}
          className="px-3.5 py-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/80 transition flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-rose-400" />
          <span>সকল টুলসে ফিরুন</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>১০০% অফলাইন ও নিরাপদ</span>
        </div>
      </nav>

      {/* Section A: Celestial Hero Banner */}
      <header className="relative w-full max-w-5xl mx-auto px-4 pt-8 pb-6 text-center">
        <div className="absolute inset-0 -top-8 bg-gradient-to-b from-indigo-900/40 via-purple-900/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>MoSaFa Name Reveal • স্পেশাল এডিশন</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-indigo-200 mb-3 tracking-tight">
          নামের গোপন গল্প
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          নাম লিখুন, জানুন এর অর্থ, রাশি ও সম্ভাব্য ভবিষ্যৎ
        </p>

        {/* Decorative Crescent Moon & Stars Icon */}
        <div className="flex items-center justify-center gap-3 mt-4 text-amber-300/80">
          <span className="text-base">✦</span>
          <span className="text-xl">🌙</span>
          <span className="text-base">✦</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto px-4 pb-16 flex-1 space-y-8">
        {/* Name Input Form Box */}
        <section className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative overflow-hidden">
          {/* Subtle Decorative top stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Name Input */}
            <div>
              <label
                htmlFor="user-name-input"
                className="block text-sm font-bold text-slate-800 mb-2 flex items-center justify-between"
              >
                <span>
                  আপনার নাম লিখুন <span className="text-rose-500">*</span>
                </span>
                <span className="text-xs font-normal text-slate-500">বাংলা বা ইংরেজিতে</span>
              </label>
              <div className="relative">
                <input
                  id="user-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="যেমন: মোফাচ্ছির, তানভীর, আয়শা, প্রিয়ম, Mofassir..."
                  className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 border text-slate-900 font-medium text-base focus:outline-none focus:ring-3 transition ${
                    errorMsg
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                      : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-600'
                  }`}
                />
                <User className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errorMsg && (
                <p className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>

            {/* Optional Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Optional Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  লিঙ্গ নির্বাচন (ঐচ্ছিক):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'male', label: 'পুরুষ' },
                    { id: 'female', label: 'মহিলা' },
                    { id: 'prefer-not-to-say', label: 'অন্যান্য / সাধারণ' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                        gender === g.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Birth Date for accurate Western Zodiac */}
              <div>
                <label
                  htmlFor="birth-date-input"
                  className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between"
                >
                  <span>জন্মতারিখ (ঐচ্ছিক - রাশির জন্য):</span>
                  <span className="text-[11px] font-normal text-indigo-600">পাশ্চাত্য জ্যোতিষ</span>
                </label>
                <div className="relative">
                  <input
                    id="birth-date-input"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * রাশি গণনার জন্য জন্মতারিখ প্রয়োজন। না দিলেও অন্য সব ফলাফল পাওয়া যাবে।
                </p>
              </div>
            </div>

            {/* Optional Origin Hint & Privacy Checkbox */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-center border-t border-slate-100">
              <div>
                <label
                  htmlFor="origin-hint-select"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  ভাষাগত সম্ভাব্য উৎস (ঐচ্ছিক):
                </label>
                <select
                  id="origin-hint-select"
                  value={originHint}
                  onChange={(e) => setOriginHint(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="auto">✨ স্বয়ংক্রিয় শনাক্তকরণ (অটো)</option>
                  <option value="বাংলা">বাংলা</option>
                  <option value="আরবি">আরবি</option>
                  <option value="ফারসি">ফারসি</option>
                  <option value="সংস্কৃত">সংস্কৃত</option>
                  <option value="আধুনিক / মিশ্র">আধুনিক / মিশ্র</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-4">
                <input
                  type="checkbox"
                  id="hide-birth-date"
                  checked={hideBirthDateInImage}
                  onChange={(e) => setHideBirthDateInImage(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor="hide-birth-date"
                  className="text-xs font-medium text-slate-600 cursor-pointer select-none"
                >
                  শেয়ারিং ছবিতে জন্মতারিখ গোপন রাখুন (গোপনীয়তা নিশ্চিত)
                </label>
              </div>
            </div>

            {/* Large Prominent Submit Button */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-indigo-200 transition duration-200 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>ফলাফল দেখুন 🔮</span>
            </button>
          </form>

          {/* Small Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100 text-slate-600 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-base">📖</span>
              <div>
                <p className="font-bold text-slate-800">সহজ নামের অর্থ</p>
                <p className="text-[11px] text-slate-500">বাংলা, আরবি ও অন্যান্য ভাষা</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-base">♈</span>
              <div>
                <p className="font-bold text-slate-800">রাশি ও স্বভাব</p>
                <p className="text-[11px] text-slate-500">জন্মতারিখ দিয়ে রাশি জানুন</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-base">🛡️</span>
              <div>
                <p className="font-bold text-slate-800">সম্পূর্ণ নিরাপদ</p>
                <p className="text-[11px] text-slate-500">কোনো তথ্য জমা রাখা হয় না</p>
              </div>
            </div>
          </div>
        </section>

        {/* Informative Disclaimer Banner */}
        <section className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-300 font-bold">সহজ নোট:</strong> এই টুলটি মূলত সামাজিক বিনোদন ও ইতিবাচক অনুপ্রেরণার জন্য তৈরি। মানুষের ভবিষ্যৎ ও সাফল্য নির্ভর করে তার নিজস্ব মেধা, সততা ও পরিশ্রমের ওপর।
          </p>
        </section>

        {/* SECTION B: RESULT CARD DISPLAY (When result generated) */}
        {hasResult && resultProfile && (
          <section className="bg-slate-950 rounded-3xl border-2 border-indigo-500/40 shadow-2xl p-5 sm:p-8 space-y-8 animate-fadeIn">
            {/* Header of Result Card */}
            <div className="text-center relative pb-6 border-b border-slate-800">
              {/* Branding badge in corner */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                  THE MOSAFA TOOLS
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomMeaning(resultProfile.meaning);
                    setCustomOrigin(resultProfile.origin);
                    setShowCustomModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-amber-400" />
                  <span>তথ্য এডিট / সংশোধন</span>
                </button>
              </div>

              {/* Decorative Monogram Avatar */}
              <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 shadow-xl mb-4">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white shadow-inner">
                  {resultProfile.bangla.charAt(0) || 'ম'}
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {resultProfile.bangla}
              </h2>
              <p className="text-sm font-semibold text-indigo-300 mt-1">
                {resultProfile.english} • উৎস: {resultProfile.origin}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {resultProfile.ageInfo && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 text-xs sm:text-sm font-bold shadow-sm">
                    <span>🎂 বয়স: {resultProfile.ageInfo.ageTextBn} ({resultProfile.ageInfo.stageBn})</span>
                  </div>
                )}
                <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold">
                  “{resultProfile.headline}”
                </div>
              </div>
            </div>

            {/* Four Chapters Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Chapter 1: অধ্যায় ১: নামের অর্থ ও উৎস */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col justify-between shadow-lg hover:border-cyan-500/50 transition">
                <div>
                  <div className="flex items-center gap-2.5 mb-3.5">
                    <span className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-base">
                      📖
                    </span>
                    <h3 className="font-bold text-base text-cyan-300">
                      অধ্যায় ১: নামের অর্থ ও উৎস
                    </h3>
                  </div>
                  <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium">
                    {resultProfile.meaning}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    ভাষাগত উৎস: <strong className="text-cyan-300">{resultProfile.origin}</strong>
                  </span>
                  <span className="text-cyan-400/90 font-medium">সহজ ও স্পষ্ট অর্থ</span>
                </div>
              </div>

              {/* Chapter 2: অধ্যায় ২: রাশি ও স্বভাব */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex flex-col justify-between shadow-lg hover:border-purple-500/50 transition">
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-base">
                        ♈
                      </span>
                      <h3 className="font-bold text-base text-purple-300">
                        অধ্যায় ২: রাশি ও স্বভাব
                      </h3>
                    </div>
                    {zodiacInfo && (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-200 border border-purple-500/40 font-bold">
                        {zodiacInfo.symbol} {zodiacInfo.nameBn}
                      </span>
                    )}
                  </div>

                  {zodiacInfo ? (
                    <div className="space-y-2.5">
                      <p className="text-xs text-purple-200/90 font-semibold">
                        পাশ্চাত্য রাশি: {zodiacInfo.nameEn} ({zodiacInfo.dateRangeBn}) • উপাদান: {zodiacInfo.element}
                      </p>
                      <p className="text-slate-100 text-sm sm:text-base leading-relaxed">
                        {zodiacInfo.trait}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-slate-300 space-y-2">
                      <p className="font-bold text-amber-300 text-sm">রাশি জানতে জন্মতারিখ যোগ করুন</p>
                      <p className="text-slate-400 leading-relaxed text-xs">
                        সঠিক রাশি জানার জন্য জন্মতারিখ প্রয়োজন। নামের অক্ষরের ওপর ভিত্তি করে রাশি অনুমান করা সঠিক নয়।
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="date"
                          value={inlineBirthDate}
                          onChange={(e) => setInlineBirthDate(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={handleApplyInlineBirthDate}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition active:scale-95"
                        >
                          রাশি দেখুন
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                  {zodiacInfo ? 'জন্মতারিখ অনুযায়ী রাশি নির্ধারিত' : 'জন্মতারিখ ছাড়া মোড'}
                </div>
              </div>

              {/* Chapter 3: অধ্যায় ৩: ব্যক্তিত্ব ও সেরা গুণ */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col justify-between shadow-lg hover:border-amber-500/50 transition">
                <div>
                  <div className="flex items-center gap-2.5 mb-3.5">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
                      🌟
                    </span>
                    <h3 className="font-bold text-base text-amber-300">
                      অধ্যায় ৩: ব্যক্তিত্ব ও সেরা গুণ
                    </h3>
                  </div>
                  <p className="text-slate-100 text-sm sm:text-base leading-relaxed mb-3">
                    {resultProfile.personalityDescription}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-bold text-amber-400/90">প্রধান গুণাবলি:</p>
                    {resultProfile.positiveTraits.slice(0, 3).map((trait, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-amber-400/80 font-medium">
                  ধরন: {resultProfile.personalityCategory}
                </div>
              </div>

              {/* Chapter 4: অধ্যায় ৪: ভবিষ্যৎ ও পরামর্শ */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col justify-between shadow-lg hover:border-emerald-500/50 transition">
                <div>
                  <div className="flex items-center gap-2.5 mb-3.5">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                      💡
                    </span>
                    <h3 className="font-bold text-base text-emerald-300">
                      অধ্যায় ৪: ভবিষ্যৎ ও পরামর্শ
                    </h3>
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-bold text-emerald-400/90">উজ্জ্বল সম্ভাবনা:</p>
                    <p className="text-slate-100 text-sm sm:text-base leading-relaxed flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✦</span>
                      <span>
                        {resultProfile.futurePossibilities[0] ||
                          'পরিশ্রম ও সততার মাধ্যমে সাফল্য অর্জন সম্ভব।'}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-bold text-emerald-400/90">দরকারি পরামর্শ:</p>
                    {resultProfile.practicalAdvice.slice(0, 2).map((adv, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                        <span className="text-cyan-400 font-bold shrink-0">➤</span>
                        <span>{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                  {resultProfile.ageInfo?.stage === 'infant' || resultProfile.ageInfo?.stage === 'child'
                    ? 'মা-বাবার স্নেহ ও সুন্দর পরিচর্যার পরামর্শ'
                    : 'ইতিবাচক অনুপ্রেরণা ও বাস্তবমুখী পরামর্শ'}
                </div>
              </div>
            </div>

            {/* Action Buttons Below Result */}
            <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDownloadImage}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-900/50 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>ছবি ডাউনলোড করুন</span>
              </button>

              <button
                type="button"
                onClick={handleShareImage}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-purple-900/50 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>শেয়ার করুন</span>
              </button>

              <button
                type="button"
                onClick={copyResultText}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {isCopied ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
                <span>{isCopied ? 'কপি হয়েছে!' : 'ফলাফল কপি করুন'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>আবার চেষ্টা করুন</span>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Custom Meaning Refinement Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-100 animate-fadeIn">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>নামের অর্থ ও উৎস কাস্টমাইজ করুন</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              আপনার নামের যদি কোনো বিশেষ বা পারিবারিক অর্থ থাকে, তা লিখে নিলে রেজাল্ট ও ছবিতে সেই অর্থ
              যুক্ত হবে।
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                অর্থ বা তাৎপর্য:
              </label>
              <textarea
                rows={3}
                value={customMeaning}
                onChange={(e) => setCustomMeaning(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ভাষাগত উৎস:
              </label>
              <select
                value={customOrigin}
                onChange={(e) => setCustomOrigin(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="বাংলা">বাংলা</option>
                <option value="আরবি">আরবি</option>
                <option value="ফারসি">ফারসি</option>
                <option value="সংস্কৃত">সংস্কৃত</option>
                <option value="হিব্রু">হিব্রু</option>
                <option value="তুর্কি">তুর্কি</option>
                <option value="আধুনিক / মিশ্র">আধুনিক / মিশ্র</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveCustomRefinement}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
