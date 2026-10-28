import React, { useState, useRef } from 'react';
import { ArrowLeft, Heart, Sparkles, RefreshCw, Copy, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickLoveProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const QuickLove: React.FC<QuickLoveProps> = ({ onBackToHub, onShowToast }) => {
  const [name1, setName1] = useState<string>('');
  const [name2, setName2] = useState<string>('');
  const [percent, setPercent] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const calculate = () => {
    const p1 = name1.trim();
    const p2 = name2.trim();

    if (!p1 || !p2) {
      alert('দয়া করে দুজনের নাম লিখুন');
      return;
    }

    let hash = 0;
    const combined = p1.toLowerCase() + p2.toLowerCase();
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }

    const calculated = 65 + Math.abs(hash % 34);
    setPercent(calculated);

    let msg = '';
    if (calculated >= 90) msg = '💖 অসাধারণ রসায়ন ও গভীর মনের টান!';
    else if (calculated >= 80) msg = '✨ চমৎকার মেলবন্ধন ও সুন্দর ভবিষ্যতের সম্ভাবনা!';
    else if (calculated >= 70) msg = '🌸 ভালো বোঝাপড়া, নিয়মিত সময় দিলে আরও মধুর হবে!';
    else msg = '🌱 একে অপরকে আরও জানা ও বোঝার চেষ্টা করুন!';

    setMessage(msg);

    if (calculated >= 80) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const copyResult = async () => {
    const text = `💖 কুইক লাভ মিটার (The MoSaFa Tools):\n` +
      `${name1} + ${name2} = ${percent}%\n` +
      `${message}\n` +
      `The MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('লাভ স্কোর কপি হয়েছে! 📋', '💖');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onShowToast('লাভ স্কোর কপি হয়েছে! 📋', '💖');
    }
  };

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 600;
    const H = 600;
    canvas.width = W;
    canvas.height = H;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#be185d');
    grad.addColorStop(0.5, '#e11d48');
    grad.addColorStop(1, '#881337');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 4;
    ctx.strokeRect(25, 25, W - 50, H - 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE MOSAFA TOOLS • কুইক লাভ পারসেন্টেজ', W / 2, 70);

    ctx.fillStyle = '#fce7f3';
    ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
    ctx.fillText(`${name1} 💕 ${name2}`, W / 2, 140);

    ctx.fillStyle = '#fdf2f8';
    ctx.beginPath();
    ctx.arc(W / 2, 280, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#e11d48';
    ctx.font = 'black 64px "Hind Siliguri", sans-serif';
    ctx.fillText(`${percent}%`, W / 2, 305);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText(message, W / 2, 440);

    ctx.fillStyle = '#fbcfe8';
    ctx.font = '14px "Hind Siliguri", sans-serif';
    ctx.fillText('The MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল', W / 2, 540);

    const link = document.createElement('a');
    link.download = `MoSaFa-Quick-Love-${name1}-${name2}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('লাভ কার্ড ডাউনলোড সম্পন্ন! 💖', '🎉');
  };

  const handleReset = () => {
    setName1('');
    setName2('');
    setPercent(null);
    setMessage('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-rose-50/50">
      <header className="w-full max-w-2xl mx-auto px-4 py-4 flex items-center justify-between border-b border-rose-200/60">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-rose-600 border border-rose-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">কুইক লাভ পারসেন্টেজ (%)</h1>
            <p className="text-xs text-rose-700/80">নাম মিলিয়ে দ্রুত ভালোবাসার হার জানুন</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl w-full mx-auto px-4 py-8 flex-1 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-rose-100">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 mb-3">
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-1">দুজনের নাম লিখুন</h2>
          <p className="text-xs text-slate-500 mb-6">এক ক্লিকে ভালোবাসার শতকরা হার জেনে নিন</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <input
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="১ম জনের নাম..."
              className="px-4 py-3 rounded-2xl bg-rose-50/40 border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            />
            <input
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="২য় জনের নাম..."
              className="px-4 py-3 rounded-2xl bg-rose-50/40 border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={calculate}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-pink-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>ভালোবাসার শতাংশ মাপুন 💖</span>
            </button>
            {percent !== null && (
              <button
                onClick={handleReset}
                className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition cursor-pointer"
                title="রিসেট"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {percent !== null && (
            <div className="mt-8 pt-6 border-t border-rose-100 animate-in zoom-in-95 duration-200">
              <span className="text-5xl sm:text-6xl font-extrabold text-pink-600 block mb-2">
                {percent}%
              </span>
              <p className="text-base font-bold text-slate-800">{message}</p>
              <p className="text-xs text-slate-400 mt-2 mb-6">
                {name1} এবং {name2}-এর মধ্যে মিষ্টি বন্ধুত্বের সম্ভাবনা!
              </p>

              {/* Action Buttons: Copy and Download */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={copyResult}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  <span>স্কোর কপি</span>
                </button>
                <button
                  onClick={downloadCard}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 text-white text-xs font-bold shadow-md shadow-pink-200 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>কার্ড ডাউনলোড (PNG)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
