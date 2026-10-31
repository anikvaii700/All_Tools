import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Download,
  Sparkles,
  Type,
  Palette,
  Upload,
  RefreshCw,
  Sliders,
  Check,
  Info,
  Layers,
  Copy,
} from 'lucide-react';
import { ThumbnailConfig } from '../../types/creatorStudio';

interface ThumbnailStudioProps {
  initialTitle?: string;
  onShowToast?: (msg: string, icon?: string) => void;
}

export const ThumbnailStudio: React.FC<ThumbnailStudioProps> = ({
  initialTitle = '',
  onShowToast,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '9:16' | '4:5'>('16:9');
  const [headline, setHeadline] = useState(initialTitle || 'মোবাইল দিয়ে ভিডিও এডিটিং');
  const [subheadline, setSubheadline] = useState('মাত্র ৫ মিনিটে শিখুন গোপন কৌশল');
  const [badgeText, setBadgeText] = useState('🔥 ১০০% ফ্রি');
  const [bgGradient, setBgGradient] = useState<'sunset' | 'cyber' | 'emerald' | 'dark' | 'royal'>('cyber');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [badgeBg, setBadgeBg] = useState('#EF4444');
  const [fontSize, setFontSize] = useState(56);
  const [watermark, setWatermark] = useState('The MoSaFa Studio');
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);

  // Suggested High-CTR Bangla Thumbnail Headlines
  const ctrSuggestions = [
    '🔥 এই ৩টি ভুল কখনো করবেন না!',
    'মাত্র ৫ মিনিটে প্রফেশনাল রেজাল্ট',
    'গোপন ট্রিকস যা কেউ বলে না',
    '১০০% কাজ করবে — প্রমাণিত উপায়',
    'না দেখলে চরম মিস করবেন!',
  ];

  // Resolve Canvas dimensions based on aspect ratio
  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case '16:9':
        return { w: 1280, h: 720 };
      case '1:1':
        return { w: 1080, h: 1080 };
      case '9:16':
        return { w: 1080, h: 1920 };
      case '4:5':
        return { w: 1080, h: 1350 };
      default:
        return { w: 1280, h: 720 };
    }
  };

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = getCanvasDimensions();
    canvas.width = w;
    canvas.height = h;

    // Draw Background
    let grad = ctx.createLinearGradient(0, 0, w, h);
    if (bgGradient === 'cyber') {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#311042');
    } else if (bgGradient === 'sunset') {
      grad.addColorStop(0, '#881337');
      grad.addColorStop(0.5, '#c2410c');
      grad.addColorStop(1, '#b45309');
    } else if (bgGradient === 'emerald') {
      grad.addColorStop(0, '#022c22');
      grad.addColorStop(0.5, '#064e3b');
      grad.addColorStop(1, '#0f766e');
    } else if (bgGradient === 'royal') {
      grad.addColorStop(0, '#172554');
      grad.addColorStop(0.5, '#1e40af');
      grad.addColorStop(1, '#4338ca');
    } else {
      grad.addColorStop(0, '#09090b');
      grad.addColorStop(1, '#18181b');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative gradient circles
    const radGrad = ctx.createRadialGradient(w * 0.8, h * 0.3, 10, w * 0.8, h * 0.3, w * 0.5);
    radGrad.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    // Draw Uploaded Image if available
    if (uploadedImage) {
      try {
        const imgRatio = uploadedImage.width / uploadedImage.height;
        const targetH = h * 0.85;
        const targetW = targetH * imgRatio;
        const posX = w - targetW - 40;
        const posY = h - targetH;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 30;
        ctx.drawImage(uploadedImage, posX, posY, targetW, targetH);
        ctx.restore();
      } catch (e) {
        console.warn('Image draw error', e);
      }
    }

    // Draw Badge (e.g. "🔥 ১০০% ফ্রি")
    if (badgeText.trim()) {
      ctx.save();
      const badgeX = 60;
      const badgeY = 60;
      ctx.font = 'bold 32px sans-serif';
      const textMetrics = ctx.measureText(badgeText);
      const paddingX = 24;
      const paddingY = 14;
      const badgeW = textMetrics.width + paddingX * 2;
      const badgeH = 50;

      // Rounded badge rect
      ctx.fillStyle = badgeBg;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 0;
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, badgeX + paddingX, badgeY + badgeH / 2);
      ctx.restore();
    }

    // Draw Main Headline
    ctx.save();
    ctx.font = `900 ${fontSize}px sans-serif`;
    ctx.fillStyle = textColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    const startX = 60;
    const startY = h * 0.42;
    const maxTextW = uploadedImage ? w * 0.55 : w - 120;

    // Word wrap
    const words = headline.split(' ');
    let line = '';
    let curY = startY;
    const lineHeight = fontSize * 1.25;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextW && n > 0) {
        ctx.fillText(line.trim(), startX, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), startX, curY);
    ctx.restore();

    // Draw Subheadline
    if (subheadline.trim()) {
      ctx.save();
      const subSize = Math.max(24, Math.round(fontSize * 0.52));
      ctx.font = `bold ${subSize}px sans-serif`;
      ctx.fillStyle = '#FBBF24'; // Yellow pop
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.fillText(subheadline, startX, curY + lineHeight * 0.95);
      ctx.restore();
    }

    // Watermark / Branding
    if (watermark.trim()) {
      ctx.save();
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`⚡ ${watermark}`, 60, h - 35);
      ctx.restore();
    }
  }, [aspectRatio, headline, subheadline, badgeText, bgGradient, textColor, badgeBg, fontSize, watermark, uploadedImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        if (onShowToast) {
          onShowToast('ছবি ক্যানভাসে যুক্ত হয়েছে!', '🖼️');
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleDownload = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `mosafa_thumbnail_${aspectRatio}_${Date.now()}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, 0.95);
    link.click();
    if (onShowToast) {
      onShowToast(`উচ্চ মানের ${format.toUpperCase()} থাম্বনেইল ডাউনলোড হয়েছে!`, '📥');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              থাম্বনেইল ও ইমেজ ক্যানভাস স্টুডিও 🎨
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              ইউটিউব, ফেসবুক, রিলস ও ব্লগের জন্য হাই-সিটিআর বাংলা থাম্বনেইল ও কাভার ডিজাইনার
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">সরাসরি ব্রাউজার রেন্ডারিং:</span> কোনো ফেক এআই ইমেজ নয়, এটি একটি রিয়েল ক্যানভাস ইঞ্জিন যা আপনার ব্রাউজারে ফুল HD রেজোলিউশনে থাম্বনেইল তৈরি করে দেয়।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>ডিজাইন সেটিংস</span>
            <span className="text-[11px] text-slate-400">ক্যানভাস কন্ট্রোল</span>
          </h3>

          {/* Aspect Ratio Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              প্ল্যাটফর্ম ও অনুপাত (Aspect Ratio)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '16:9', label: '16:9 (ইউটিউব)' },
                { id: '1:1', label: '1:1 (ফেসবুক)' },
                { id: '9:16', label: '9:16 (রিলস)' },
                { id: '4:5', label: '4:5 (ইন্সটা)' },
              ].map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setAspectRatio(ratio.id as any)}
                  className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border text-center ${
                    aspectRatio === ratio.id
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              প্রধান বড় শিরোনাম (Headline)
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-amber-500 outline-hidden"
              placeholder="যেমন: মোবাইল দিয়ে ভিডিও এডিটিং"
            />
          </div>

          {/* Subheadline */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              সাব-হেডলাইন (হলুদ হাইলাইট)
            </label>
            <input
              type="text"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-amber-500 outline-hidden"
              placeholder="যেমন: মাত্র ৫ মিনিটে শিখুন"
            />
          </div>

          {/* Badge Text */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ব্যাজ টেক্সট (Badge)
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-amber-500 outline-hidden"
                placeholder="যেমন: 🔥 ভাইরাল"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ব্যাজ ব্যাকগ্রাউন্ড
              </label>
              <select
                value={badgeBg}
                onChange={(e) => setBadgeBg(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="#EF4444">লাল (Red Pop)</option>
                <option value="#10B981">সবুজ (Emerald)</option>
                <option value="#F59E0B">কমলা (Amber)</option>
                <option value="#6366F1">বেগুনী (Indigo)</option>
              </select>
            </div>
          </div>

          {/* Background Gradient */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'cyber', name: 'সাইবার', bg: 'bg-gradient-to-r from-slate-900 to-indigo-950' },
                { id: 'sunset', name: 'সানসেট', bg: 'bg-gradient-to-r from-rose-900 to-amber-700' },
                { id: 'emerald', name: 'গ্রিন', bg: 'bg-gradient-to-r from-emerald-950 to-teal-800' },
                { id: 'royal', name: 'রয়েল ব্লু', bg: 'bg-gradient-to-r from-blue-950 to-indigo-800' },
                { id: 'dark', name: 'ডার্ক', bg: 'bg-slate-900' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setBgGradient(g.id as any)}
                  className={`h-9 rounded-xl border text-[10px] font-bold text-white transition flex items-center justify-center cursor-pointer ${g.bg} ${
                    bgGradient === g.id ? 'ring-2 ring-amber-400 scale-105' : 'opacity-80'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size & Branding Watermark */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ফন্ট সাইজ ({fontSize}px)
              </label>
              <input
                type="range"
                min={36}
                max={84}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ওয়াটারমার্ক
              </label>
              <input
                type="text"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-hidden"
              />
            </div>
          </div>

          {/* Image Upload on Thumbnail */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              নিজের ছবি বা লোগো যোগ করুন (PNG/JPG)
            </label>
            <div className="flex items-center gap-2">
              <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200">
                <Upload className="w-3.5 h-3.5" />
                <span>ফাইল সিলেক্ট করুন</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {uploadedImage && (
                <button
                  type="button"
                  onClick={() => setUploadedImage(null)}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  ছবি রিমুভ করুন
                </button>
              )}
            </div>
          </div>

          {/* High-CTR Ideas quick insert */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500">
              💡 ভাইরাল থাম্বনেইল টেক্সট আইডিয়া:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ctrSuggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setHeadline(sug)}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-amber-100 text-slate-700 transition"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Canvas Preview Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>লাইভ থাম্বনেইল প্রিভিউ</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({aspectRatio === '16:9' ? '1280x720' : aspectRatio})
                </span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload('png')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG ডাউনলোড (HD)</span>
                </button>
              </div>
            </div>

            {/* Canvas Container with responsive scaling */}
            <div className="w-full bg-slate-900/10 rounded-2xl p-2 sm:p-4 flex items-center justify-center overflow-hidden border border-slate-200">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-xl shadow-2xl transition"
                style={{
                  maxHeight: '440px',
                  objectFit: 'contain',
                }}
              />
            </div>

            <div className="text-center text-xs text-slate-500">
              ✨ থাম্বনেইলটি সম্পূর্ণ প্রস্তুত হলে PNG ডাউনলোড বাটনে ক্লিক করে ফুল রেজোলিউশনে সেভ করে নিন।
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
