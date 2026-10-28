import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Star,
  Copy,
  Share2,
  Palette,
  PlusCircle,
  Dices,
  Download,
  X,
  Check,
} from 'lucide-react';
import { BANGLA_STATUSES, BanglaStatus, CATEGORY_META } from '../data/banglaStatuses';

interface BanglaStatusHubProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const BanglaStatusHub: React.FC<BanglaStatusHubProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [customStatuses, setCustomStatuses] = useState<BanglaStatus[]>([]);
  const [pageLimit, setPageLimit] = useState<number>(30);

  // Card Maker Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [cardText, setCardText] = useState<string>('');
  const [cardAuthor, setCardAuthor] = useState<string>('The MoSaFa Tools');
  const [cardTheme, setCardTheme] = useState<string>('rose');
  const [cardFontSize, setCardFontSize] = useState<number>(28);

  // Create Status Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newStatusText, setNewStatusText] = useState<string>('');
  const [newStatusCategory, setNewStatusCategory] = useState<BanglaStatus['cat']>('love');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load favorites & custom statuses from localStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem('mosafa_status_favorites');
      if (storedFavs) setFavorites(JSON.parse(storedFavs));

      const storedCustom = localStorage.getItem('mosafa_custom_statuses');
      if (storedCustom) setCustomStatuses(JSON.parse(storedCustom));
    } catch {
      // LocalStorage access error
    }
  }, []);

  const saveFavorites = (newFavs: string[]) => {
    setFavorites(newFavs);
    try {
      localStorage.setItem('mosafa_status_favorites', JSON.stringify(newFavs));
    } catch {}
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      const updated = favorites.filter((f) => f !== id);
      saveFavorites(updated);
      onShowToast('প্রিয় তালিকা থেকে সরানো হয়েছে', '⭐');
    } else {
      const updated = [...favorites, id];
      saveFavorites(updated);
      onShowToast('প্রিয় তালিকায় যুক্ত হয়েছে! ⭐', '💖');
    }
  };

  // Combine custom + preset statuses
  const allStatuses: BanglaStatus[] = [...customStatuses, ...BANGLA_STATUSES];

  // Filtering
  const filteredStatuses = allStatuses.filter((item) => {
    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'favorites'
        ? favorites.includes(item.id)
        : item.cat === activeCategory;

    const matchesQuery =
      !searchQuery.trim() || item.text.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  const displayedStatuses = filteredStatuses.slice(0, pageLimit);

  // 1-click Copy
  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('স্ট্যাটাস কপি হয়েছে! 📋', '✅');
    } catch {
      onShowToast('স্ট্যাটাস কপি হয়েছে! 📋', '✅');
    }
  };

  // WhatsApp Share
  const shareWhatsApp = (text: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      text + '\n\n— The MoSaFa Tools'
    )}`;
    window.open(url, '_blank');
  };

  // Open Card Maker
  const openCardMaker = (text: string) => {
    setCardText(text);
    setIsCardModalOpen(true);
  };

  // Draw on Canvas whenever Card Maker options change
  useEffect(() => {
    if (!isCardModalOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    // Theme background
    let grad = ctx.createLinearGradient(0, 0, W, H);
    if (cardTheme === 'purple') {
      grad.addColorStop(0, '#581c87');
      grad.addColorStop(0.5, '#4c1d95');
      grad.addColorStop(1, '#831843');
    } else if (cardTheme === 'dark') {
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
    } else if (cardTheme === 'emerald') {
      grad.addColorStop(0, '#064e3b');
      grad.addColorStop(0.5, '#065f46');
      grad.addColorStop(1, '#115e59');
    } else if (cardTheme === 'sunset') {
      grad.addColorStop(0, '#9a3412');
      grad.addColorStop(0.5, '#c2410c');
      grad.addColorStop(1, '#be123c');
    } else if (cardTheme === 'blue') {
      grad.addColorStop(0, '#0c4a6e');
      grad.addColorStop(0.5, '#0369a1');
      grad.addColorStop(1, '#3730a3');
    } else {
      // Rose
      grad.addColorStop(0, '#be123c');
      grad.addColorStop(0.5, '#e11d48');
      grad.addColorStop(1, '#db2777');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle circle accents
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 330, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 360, 0, Math.PI * 2);
    ctx.stroke();

    // Elegant Outer Double Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(46, 46, W - 92, H - 92);

    // Quotation Mark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = 'bold 84px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('“', W / 2, 175);

    // Wrapped Text
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${cardFontSize}px "Hind Siliguri", sans-serif`;

    const maxWidth = W - 180;
    const lineHeight = cardFontSize * 1.6;
    const words = (cardText || 'আপনার সুন্দর কথা...').split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const test = currentLine ? `${currentLine} ${words[i]}` : words[i];
      if (ctx.measureText(test).width > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = test;
      }
    }
    if (currentLine) lines.push(currentLine);

    const totalHeight = lines.length * lineHeight;
    let startY = 370 - totalHeight / 2 + lineHeight / 2;

    for (let j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], W / 2, startY + j * lineHeight);
    }

    // Divider
    ctx.beginPath();
    ctx.moveTo(W / 2 - 90, H - 180);
    ctx.lineTo(W / 2 + 90, H - 180);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Author
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '600 24px "Hind Siliguri", sans-serif';
    ctx.fillText(cardAuthor || 'The MoSaFa Tools', W / 2, H - 130);

    // Footer Brand
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '400 16px "Hind Siliguri", sans-serif';
    ctx.fillText('The MoSaFa Tools • সকল ফ্রি অনলাইন টুলস হাব', W / 2, H - 90);
  }, [isCardModalOpen, cardText, cardAuthor, cardTheme, cardFontSize]);

  const downloadCardImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Bangla-Status-MoSaFa-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('ছবি ডাউনলোড সম্পন্ন হয়েছে! 📥', '🎉');
  };

  // Random Status Picker
  const triggerRandomStatus = () => {
    if (!allStatuses.length) return;
    const rand = allStatuses[Math.floor(Math.random() * allStatuses.length)];
    openCardMaker(rand.text);
    onShowToast('র‍্যান্ডম স্ট্যাটাস কার্ড তৈরি হয়েছে! 🎲', '✨');
  };

  // Save Custom Status
  const handleSaveCustom = (andOpenCard = false) => {
    if (!newStatusText.trim()) {
      alert('দয়া করে আপনার স্ট্যাটাসটি লিখুন');
      return;
    }
    const newEntry: BanglaStatus = {
      id: `custom_${Date.now()}`,
      cat: newStatusCategory,
      text: newStatusText.trim(),
    };
    const updated = [newEntry, ...customStatuses];
    setCustomStatuses(updated);
    try {
      localStorage.setItem('mosafa_custom_statuses', JSON.stringify(updated));
    } catch {}

    setNewStatusText('');
    setIsCreateModalOpen(false);

    if (andOpenCard) {
      openCardMaker(newEntry.text);
    } else {
      onShowToast('নতুন স্ট্যাটাস সফলভাবে সেভ হয়েছে! 💾', '✨');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 via-violet-50/20 to-slate-100">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between border-b border-violet-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-800 hover:text-violet-600 shadow-xs transition flex items-center gap-1.5 text-xs font-bold cursor-pointer border border-slate-300 bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                বাংলা স্ট্যাটাস ও ক্যাপশন হাব
              </h1>
              <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">
                The MoSaFa
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              ১০টি ক্যাটাগরির ১০০০+ সেরা বাংলা স্ট্যাটাস ও ফটো কার্ড মেকার
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerRandomStatus}
            type="button"
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer bg-violet-50 text-violet-700 border border-violet-200"
            title="র‍্যান্ডম স্ট্যাটাস কার্ড"
          >
            <Dices className="w-4 h-4" />
            <span className="hidden sm:inline">র‍্যান্ডম</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            type="button"
            className="px-3 py-1.5 sm:py-2 text-xs font-bold rounded-xl text-white shadow-md transition flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নিজের স্ট্যাটাস</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 flex-1">
        {/* Search & Category Filter Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            {/* Search Bar */}
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="স্ট্যাটাস খুঁজুন... যেমন: ভালোবাসা, কষ্ট, বন্ধু, নামাজ, হাসি"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            {/* Total Count & Favorite Filter Switch */}
            <div className="flex items-center gap-2 text-xs font-semibold w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                মোট: {filteredStatuses.length} টি
              </span>
              <button
                onClick={() =>
                  setActiveCategory(activeCategory === 'favorites' ? 'all' : 'favorites')
                }
                className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1 cursor-pointer ${
                  activeCategory === 'favorites'
                    ? 'border-amber-400 bg-amber-400 text-amber-950 font-bold'
                    : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>প্রিয়</span>
                <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {favorites.length}
                </span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveCategory(key);
                  setPageLimit(30);
                }}
                className={`px-3.5 py-1.5 rounded-xl shrink-0 transition cursor-pointer ${
                  activeCategory === key
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {meta.name}
              </button>
            ))}
          </div>
        </div>

        {/* Statuses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedStatuses.map((item) => {
            const isFav = favorites.includes(item.id);
            const catMeta = CATEGORY_META[item.cat];

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-violet-300 transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        catMeta ? catMeta.color : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {catMeta ? catMeta.name.split(' ')[1] : 'স্ট্যাটাস'}
                    </span>

                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-1.5 rounded-xl hover:bg-amber-50 transition text-sm cursor-pointer ${
                        isFav ? 'text-amber-500 scale-110' : 'text-slate-300 hover:text-amber-400'
                      }`}
                      title={isFav ? 'প্রিয় থেকে সরান' : 'প্রিয় তালিকায় যুক্ত করুন'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed select-all">
                    {item.text}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                  <button
                    onClick={() => copyText(item.text)}
                    className="flex-1 min-w-[70px] py-2 px-2.5 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি</span>
                  </button>

                  <button
                    onClick={() => shareWhatsApp(item.text)}
                    className="flex-1 min-w-[85px] py-2 px-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
                    title="হোয়াটসঅ্যাপে পাঠান"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => openCardMaker(item.text)}
                    className="flex-1 min-w-[85px] py-2 px-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md transition active:scale-95 cursor-pointer"
                    title="ফটো কার্ড তৈরি ও ডাউনলোড"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>কার্ড মেকার</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {filteredStatuses.length > pageLimit && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 pb-4 text-center">
            <button
              onClick={() => setPageLimit((prev) => prev + 30)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>✨ আরও ৩০টি স্ট্যাটাস লোড করুন</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                ({pageLimit} / {filteredStatuses.length})
              </span>
            </button>
            <button
              onClick={() => setPageLimit(filteredStatuses.length)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition cursor-pointer"
            >
              সবগুলো ({filteredStatuses.length}টি) একসাথে দেখুন
            </button>
          </div>
        )}

        {/* Empty state */}
        {filteredStatuses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <span className="text-4xl block mb-2">💬</span>
            <h3 className="text-base font-bold text-slate-800">কোনো স্ট্যাটাস পাওয়া যায়নি!</h3>
            <p className="text-xs text-slate-500 mt-1">
              অন্য কোনো শব্দ দিয়ে সার্চ করুন অথবা ক্যাটাগরি পরিবর্তন করুন।
            </p>
          </div>
        )}
      </main>

      {/* PHOTO CARD MAKER MODAL */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-violet-600" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    সোশ্যাল পোস্ট ফটো কার্ড মেকার
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ছবি হিসেবে ডাউনলোড করে ফেসবুক বা ইনস্টাগ্রামে পোস্ট করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCardModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Canvas Preview */}
            <div className="flex flex-col items-center justify-center mb-5">
              <canvas
                ref={canvasRef}
                className="w-full max-w-[340px] sm:max-w-[380px] aspect-square rounded-2xl shadow-xl border border-slate-200 bg-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-2">
                লাইভ প্রিভিউ (৮০০ x ৮০০ হাই-কোয়ালিটি PNG)
              </span>
            </div>

            {/* Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  ব্যাকগ্রাউন্ড থিম সিলেক্ট করুন:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'rose', label: 'রোমান্টিক রোজ', grad: 'from-rose-500 to-pink-600' },
                    { id: 'purple', label: 'রয়্যাল পার্পল', grad: 'from-violet-600 to-purple-800' },
                    { id: 'dark', label: 'মিডনাইট ডার্ক', grad: 'from-slate-900 to-indigo-950' },
                    { id: 'emerald', label: 'এমেরাল্ড গ্রিন', grad: 'from-emerald-600 to-teal-800' },
                    { id: 'sunset', label: 'সানসেট অরেঞ্জ', grad: 'from-amber-600 to-rose-600' },
                    { id: 'blue', label: 'ওশান ব্লু', grad: 'from-blue-600 to-indigo-700' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCardTheme(t.id)}
                      className={`p-1.5 rounded-xl border flex items-center gap-1.5 font-semibold transition cursor-pointer ${
                        cardTheme === t.id
                          ? 'border-violet-600 bg-violet-50 text-violet-900 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${t.grad}`} />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between font-bold text-slate-700 mb-1">
                  <span>ফন্ট সাইজ অ্যাডজাস্ট:</span>
                  <span>{cardFontSize} px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="36"
                  value={Number.isNaN(cardFontSize) ? 24 : cardFontSize}
                  onChange={(e) => setCardFontSize(parseInt(e.target.value, 10) || 24)}
                  className="w-full accent-violet-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  কার্ডের টেক্সট কাস্টমাইজ করুন:
                </label>
                <textarea
                  rows={3}
                  value={cardText}
                  onChange={(e) => setCardText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  স্বাক্ষর / নাম / পেজ ব্র্যান্ডিং:
                </label>
                <input
                  type="text"
                  value={cardAuthor}
                  onChange={(e) => setCardAuthor(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                onClick={downloadCardImage}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 text-white font-bold text-xs shadow-md shadow-violet-200 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ছবি ডাউনলোড করুন (PNG) 📥</span>
              </button>
              <button
                onClick={() => copyText(cardText)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                📋 টেক্সট কপি
              </button>
              <button
                onClick={() => setIsCardModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM STATUS MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-violet-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    নিজের নতুন স্ট্যাটাস তৈরি করুন
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    আপনার নিজস্ব উক্তি লিখে ফটো কার্ড তৈরি বা সেভ করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ক্যাটাগরি নির্ধারণ করুন:
                </label>
                <select
                  value={newStatusCategory}
                  onChange={(e) => setNewStatusCategory(e.target.value as BanglaStatus['cat'])}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs text-slate-800"
                >
                  <option value="love">❤️ ভালোবাসা ও রোমান্টিক</option>
                  <option value="sad">💔 কষ্ট ও বিরহ</option>
                  <option value="islamic">🤲 ইসলামিক উক্তি</option>
                  <option value="friendship">🤝 বন্ধুত্ব ও আড্ডা</option>
                  <option value="attitude">🔥 এটিটিউড ও ব্যক্তিত্ব</option>
                  <option value="motivation">💡 অনুপ্রেরণা ও সাফল্য</option>
                  <option value="funny">😂 ফানি ও হাসির ক্যাপশন</option>
                  <option value="alone">🌧️ একাকীত্ব ও বাস্তবতা</option>
                  <option value="birthday">🎂 জন্মদিনের শুভেচ্ছা</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  আপনার স্ট্যাটাস লিখুন:
                </label>
                <textarea
                  rows={4}
                  value={newStatusText}
                  onChange={(e) => setNewStatusText(e.target.value)}
                  placeholder="এখানে আপনার মনমতো বাংলা স্ট্যাটাস বা ক্যাপশন লিখুন..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs sm:text-sm text-slate-800"
                />
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleSaveCustom(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                🎨 ফটো কার্ড তৈরি করুন
              </button>
              <button
                onClick={() => handleSaveCustom(false)}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
              >
                💾 তালিকায় সেভ করুন
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition cursor-pointer"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
