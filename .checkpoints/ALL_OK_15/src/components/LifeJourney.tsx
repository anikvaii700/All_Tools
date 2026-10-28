import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Smartphone,
  Plus,
  Trash2,
  Download,
  Share2,
  Sparkles,
  Clock,
  Compass,
  Check,
  Copy,
} from 'lucide-react';

interface LifeJourneyProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export interface LifeEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  category: 'childhood' | 'education' | 'career' | 'family' | 'achievement' | 'travel' | 'memory';
}

export interface PhoneHistoryItem {
  id: string;
  brand: string;
  model: string;
  yearAcquired: number;
  yearsUsed: number;
  memory: string;
}

// Comprehensive Phone Brands & Models in Bangladesh
export const PHONE_DATABASE: Record<string, string[]> = {
  Samsung: [
    'Galaxy S24 Ultra',
    'Galaxy S23',
    'Galaxy S22',
    'Galaxy S21 FE',
    'Galaxy S20',
    'Galaxy A55',
    'Galaxy A54 5G',
    'Galaxy A53',
    'Galaxy A52',
    'Galaxy A34',
    'Galaxy A14',
    'Galaxy A12',
    'Galaxy M34',
    'Galaxy J7 Prime',
    'Galaxy J7',
    'Galaxy J2',
    'Guru Music 2 (বাটন)',
    'Metro 313',
    'অন্য মডেল...',
  ],
  'Apple (iPhone)': [
    'iPhone 16 Pro Max',
    'iPhone 16',
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'iPhone 15',
    'iPhone 14 Pro Max',
    'iPhone 14',
    'iPhone 13 Pro',
    'iPhone 13',
    'iPhone 12',
    'iPhone 11',
    'iPhone XR',
    'iPhone X',
    'iPhone 8 Plus',
    'iPhone 7 Plus',
    'iPhone 6s',
    'iPhone 5s',
    'iPhone 4',
    'অন্য মডেল...',
  ],
  'Xiaomi / Redmi / Poco': [
    'Redmi Note 13 Pro',
    'Redmi Note 12',
    'Redmi Note 11',
    'Redmi Note 10 Pro',
    'Redmi Note 9',
    'Redmi Note 8',
    'Redmi Note 7',
    'Redmi Note 5 Pro',
    'Redmi 9A',
    'Redmi 8',
    'Poco X3 Pro',
    'Poco M3',
    'Xiaomi 13',
    'Mi 11X',
    'Mi A1',
    'অন্য মডেল...',
  ],
  Realme: [
    'Realme 12 Pro+',
    'Realme 11',
    'Realme 10',
    'Realme 9 Pro',
    'Realme 8',
    'Realme 7',
    'Realme 6',
    'Realme 5 Pro',
    'Realme C55',
    'Realme C35',
    'Realme C21',
    'GT Master Edition',
    'অন্য মডেল...',
  ],
  Vivo: [
    'Vivo V30',
    'Vivo V29',
    'Vivo V27',
    'Vivo V25',
    'Vivo V20',
    'Vivo Y200',
    'Vivo Y27',
    'Vivo Y20',
    'Vivo Y16',
    'Vivo Y11',
    'Vivo X100',
    'অন্য মডেল...',
  ],
  Oppo: [
    'Oppo Reno 11',
    'Oppo Reno 10',
    'Oppo Reno 8',
    'Oppo F21 Pro',
    'Oppo F19',
    'Oppo F17 Pro',
    'Oppo A78',
    'Oppo A58',
    'Oppo A57',
    'Oppo A16',
    'অন্য মডেল...',
  ],
  OnePlus: [
    'OnePlus 12',
    'OnePlus 11',
    'OnePlus 10 Pro',
    'OnePlus 9 Pro',
    'OnePlus 8T',
    'OnePlus 7 Pro',
    'OnePlus Nord 3',
    'OnePlus Nord CE 3 Lite',
    'OnePlus Nord CE 2',
    'OnePlus 6T',
    'অন্য মডেল...',
  ],
  Symphony: [
    'Symphony Z45',
    'Symphony Z35',
    'Symphony Z30',
    'Symphony Z25',
    'Symphony W68 (কিংবদন্তি)',
    'Symphony W25',
    'Symphony Xplorer W15',
    'Symphony B17 (বাটন)',
    'Symphony D54',
    'Symphony Roar V150',
    'অন্য মডেল...',
  ],
  Walton: [
    'Walton Primo S8',
    'Walton Primo RX8',
    'Walton Primo RM4',
    'Walton Primo GH9',
    'Walton Primo HM5',
    'Walton Olvio L28 (বাটন)',
    'Walton Primo E10',
    'অন্য মডেল...',
  ],
  Nokia: [
    'Nokia 1100 (সর্বকালের সেরা)',
    'Nokia 3310',
    'Nokia 105',
    'Nokia 1280',
    'Nokia 216',
    'Nokia 5310 XpressMusic',
    'Nokia 6300',
    'Nokia N73',
    'Nokia N95',
    'Nokia Lumia 520',
    'Nokia 6.1 Plus',
    'Nokia C20',
    'অন্য মডেল...',
  ],
  'Google Pixel': [
    'Pixel 9 Pro',
    'Pixel 8 Pro',
    'Pixel 8',
    'Pixel 7 Pro',
    'Pixel 7',
    'Pixel 6a',
    'Pixel 5',
    'Pixel 4a',
    'Pixel 3 XL',
    'অন্য মডেল...',
  ],
  Motorola: [
    'Moto G84',
    'Moto G54',
    'Moto G32',
    'Moto G9 Plus',
    'Moto E7 Plus',
    'Moto G (1st Gen)',
    'Razr 40',
    'অন্য মডেল...',
  ],
  Infinix: [
    'Infinix Hot 40 Pro',
    'Infinix Hot 30',
    'Infinix Hot 20',
    'Infinix Note 30 Pro',
    'Infinix Note 12',
    'Infinix Smart 8',
    'Infinix Zero 30',
    'অন্য মডেল...',
  ],
  Tecno: [
    'Tecno Camon 30',
    'Tecno Camon 20 Pro',
    'Tecno Spark 20',
    'Tecno Spark 10',
    'Tecno Pova 5',
    'Tecno Pop 7',
    'অন্য মডেল...',
  ],
  'অন্যান্য (কাস্টম ব্রান্ড)': ['কাস্টম মডেল লিখুন...'],
};

const DEFAULT_LIFE_EVENTS: LifeEvent[] = [
  {
    id: 'evt_1',
    year: 2005,
    title: 'স্কুল জীবনের সূচনা',
    description: 'প্রাথমিক বিদ্যালয়ে ভর্তি ও নতুন বন্ধুদের সাথে পরিচয়ের সোনালী স্মৃতি।',
    category: 'education',
  },
  {
    id: 'evt_2',
    year: 2018,
    title: 'প্রথম কর্মজীবন ও ক্যারিয়ার শুরু',
    description: 'নিজস্ব আয়ের সূচনা এবং প্রফেশনাল জীবনে প্রথম পদক্ষেপ গ্রহণ।',
    category: 'career',
  },
  {
    id: 'evt_3',
    year: 2022,
    title: 'কক্সবাজার সমুদ্র ভ্রমণ',
    description: 'পরিবার ও বন্ধুদের সাথে প্রথম সমুদ্র দর্শন ও সূর্যাস্তের মনোরম অনুভূতি।',
    category: 'travel',
  },
];

const DEFAULT_PHONE_HISTORY: PhoneHistoryItem[] = [
  {
    id: 'ph_1',
    brand: 'Nokia',
    model: '1100 (সর্বকালের সেরা)',
    yearAcquired: 2012,
    yearsUsed: 3,
    memory: 'জীবনের প্রথম বাটন ফোন! স্নেক গেম আর টর্চ লাইটের অসাধারণ স্মৃতি।',
  },
  {
    id: 'ph_2',
    brand: 'Symphony',
    model: 'W68 (কিংবদন্তি)',
    yearAcquired: 2015,
    yearsUsed: 2,
    memory: 'প্রথম অ্যান্ড্রয়েড স্মার্টফোন, ফেসবুক ও ইন্টারনেটের দুনিয়ায় পদার্পণ।',
  },
  {
    id: 'ph_3',
    brand: 'Xiaomi / Redmi / Poco',
    model: 'Redmi Note 7',
    yearAcquired: 2019,
    yearsUsed: 4,
    memory: 'দারুণ ক্যামেরা ও ব্যাটারি লাইফ। বহু ভ্রমণ আর স্মৃতি ক্যামেরাবন্দী করার সঙ্গী।',
  },
];

const toBanglaNum = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
};

export const LifeJourney: React.FC<LifeJourneyProps> = ({ onBackToHub, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'life' | 'phones'>('all');
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(DEFAULT_LIFE_EVENTS);
  const [phones, setPhones] = useState<PhoneHistoryItem[]>(DEFAULT_PHONE_HISTORY);

  // Life Event Modal State
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [eventYear, setEventYear] = useState<number | string>(2023);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDesc, setEventDesc] = useState<string>('');
  const [eventCategory, setEventCategory] = useState<LifeEvent['category']>('memory');

  // Phone Modal State (Company -> Model Dropdowns)
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('Samsung');
  const [selectedModel, setSelectedModel] = useState<string>('Galaxy A54 5G');
  const [customModelInput, setCustomModelInput] = useState<string>('');
  const [phoneYear, setPhoneYear] = useState<number | string>(2023);
  const [phoneUsedYears, setPhoneUsedYears] = useState<number | string>(2);
  const [phoneMemory, setPhoneMemory] = useState<string>('');

  const summaryCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // When selectedBrand changes, update selectedModel to the first option in that brand
  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    const models = PHONE_DATABASE[brand] || [];
    setSelectedModel(models[0] || 'অন্য মডেল...');
  };

  // Load from localStorage
  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem('mosafa_life_events');
      if (storedEvents) setLifeEvents(JSON.parse(storedEvents));
      const storedPhones = localStorage.getItem('mosafa_phone_history');
      if (storedPhones) setPhones(JSON.parse(storedPhones));
    } catch {}
  }, []);

  const saveEvents = (updated: LifeEvent[]) => {
    setLifeEvents(updated);
    try {
      localStorage.setItem('mosafa_life_events', JSON.stringify(updated));
    } catch {}
  };

  const savePhones = (updated: PhoneHistoryItem[]) => {
    setPhones(updated);
    try {
      localStorage.setItem('mosafa_phone_history', JSON.stringify(updated));
    } catch {}
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    const newEvt: LifeEvent = {
      id: `evt_${Date.now()}`,
      year: Number(eventYear) || 2024,
      title: eventTitle.trim(),
      description: eventDesc.trim(),
      category: eventCategory,
    };
    const updated = [...lifeEvents, newEvt].sort((a, b) => a.year - b.year);
    saveEvents(updated);
    setEventTitle('');
    setEventDesc('');
    setIsEventModalOpen(false);
    onShowToast('জীবন ঘটনা সফলভাবে যুক্ত হয়েছে! 🌟', '✅');
  };

  const handleAddPhone = (e: React.FormEvent) => {
    e.preventDefault();
    const finalModel =
      selectedModel === 'অন্য মডেল...' || selectedBrand === 'অন্যান্য (কাস্টম ব্রান্ড)'
        ? customModelInput.trim() || 'কাস্টম মডেল'
        : selectedModel;

    const newPh: PhoneHistoryItem = {
      id: `ph_${Date.now()}`,
      brand: selectedBrand,
      model: finalModel,
      yearAcquired: Number(phoneYear) || 2024,
      yearsUsed: Number(phoneUsedYears) || 1,
      memory: phoneMemory.trim(),
    };
    const updated = [...phones, newPh].sort((a, b) => a.yearAcquired - b.yearAcquired);
    savePhones(updated);
    setCustomModelInput('');
    setPhoneMemory('');
    setIsPhoneModalOpen(false);
    onShowToast(`${selectedBrand} ${finalModel} ফোন যুক্ত হয়েছে! 📱`, '✅');
  };

  const deleteEvent = (id: string) => {
    saveEvents(lifeEvents.filter((item) => item.id !== id));
    onShowToast('ঘটনা মুছে ফেলা হয়েছে', '🗑️');
  };

  const deletePhone = (id: string) => {
    savePhones(phones.filter((item) => item.id !== id));
    onShowToast('মোবাইল রেকর্ড মুছে ফেলা হয়েছে', '🗑️');
  };

  // Export JSON
  const exportDataJson = () => {
    const data = { lifeEvents, phones };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MoSaFa-Life-Journey-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('ডাটা ব্যাকআপ ডাউনলোড হয়েছে! 💾', '✅');
  };

  // Download Visual Summary Card
  const downloadSummaryCard = () => {
    const canvas = summaryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 940;
    canvas.width = W;
    canvas.height = H;

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(25, 25, W - 50, H - 50);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('আমার জীবন ও প্রযুক্তি জার্নি 🌟', W / 2, 85);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
    ctx.fillText(
      `স্মরণীয় ঘটনা: ${toBanglaNum(lifeEvents.length)} টি  •  ব্যবহৃত মোবাইল: ${toBanglaNum(phones.length)} টি মডেল`,
      W / 2,
      120
    );

    let y = 175;
    ctx.textAlign = 'left';

    // Section 1: Top Life Milestones
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
    ctx.fillText('📅 স্মরণীয় জীবনের মাইলফলক:', 55, y);
    y += 35;

    lifeEvents.slice(0, 4).forEach((evt) => {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.fillText(`• ${toBanglaNum(evt.year)}: ${evt.title}`, 65, y);
      y += 24;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px "Hind Siliguri", sans-serif';
      ctx.fillText(`   ${evt.description.slice(0, 55)}...`, 65, y);
      y += 30;
    });

    // Section 2: Phone Milestones
    y += 25;
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
    ctx.fillText('📱 মোবাইল প্রযুক্তির বিবর্তন (ফোন ইতিহাস):', 55, y);
    y += 35;

    phones.slice(0, 5).forEach((ph) => {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
      ctx.fillText(
        `• ${toBanglaNum(ph.yearAcquired)}: ${ph.brand} ${ph.model} (${toBanglaNum(ph.yearsUsed)} বছর ব্যবহৃত)`,
        65,
        y
      );
      y += 24;
      if (ph.memory) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px "Hind Siliguri", sans-serif';
        ctx.fillText(`   স্মৃতি: ${ph.memory.slice(0, 55)}...`, 65, y);
        y += 28;
      }
    });

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '13px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('The MoSaFa Tools • লাইফ ও ফোন জার্নি টাইমলাইন', W / 2, H - 45);

    const link = document.createElement('a');
    link.download = `MoSaFa-Life-Phone-Journey-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onShowToast('টাইমলাইন ছবি সফলভাবে ডাউনলোড হয়েছে! 📥', '🎉');
  };

  const copyTimelineSummary = async () => {
    let text = `⏳ MoSaFa Life & Phone Journey:\n\n`;
    text += `📱 ব্যবহৃত মোবাইল সমূহ (${phones.length}টি):\n`;
    phones.forEach((p, i) => {
      text += `${i + 1}. ${p.brand} ${p.model} (${p.yearAcquired} সাল - ${p.yearsUsed} বছর) ${p.memory ? '• ' + p.memory : ''}\n`;
    });
    text += `\n📅 জীবনের মাইলফলক সমূহ (${lifeEvents.length}টি):\n`;
    lifeEvents.forEach((e, i) => {
      text += `${i + 1}. [${e.year}] ${e.title} - ${e.description}\n`;
    });
    text += `\nThe MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল`;
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('জার্নি সারসংক্ষেপ কপি হয়েছে! 📋', '✅');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onShowToast('জার্নি সারসংক্ষেপ কপি হয়েছে! 📋', '✅');
    }
  };

  const distinctBrands = Array.from(new Set(phones.map((p) => p.brand))).length;
  const firstPhone = phones.length > 0 ? phones[0] : null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-white text-slate-700 hover:text-cyan-600 border border-slate-200 shadow-xs transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>সকল টুলস</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">MoSaFa Life Journey</h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold border border-cyan-200">
                জীবন ও ফোন জার্নি
              </span>
            </div>
            <p className="text-xs text-slate-500">স্মরণীয় মাইলফলক ও অটো ড্রপডাউনে ব্যবহৃত মোবাইলের ইতিহাস</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyTimelineSummary}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1 active:scale-95"
            title="টাইমলাইন সারসংক্ষেপ কপি করুন"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">কপি</span>
          </button>
          <button
            onClick={exportDataJson}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>
          <button
            onClick={downloadSummaryCard}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md shadow-cyan-200 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>কার্ড ডাউনলোড</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 flex-1">
        {/* Milestone Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-2xl font-black text-cyan-600 block">{toBanglaNum(lifeEvents.length)}</span>
            <span className="text-xs font-bold text-slate-600">স্মরণীয় ঘটনা</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-2xl font-black text-purple-600 block">{toBanglaNum(phones.length)}</span>
            <span className="text-xs font-bold text-slate-600">ব্যবহৃত ফোন মডেল</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-2xl font-black text-emerald-600 block">{toBanglaNum(distinctBrands)}</span>
            <span className="text-xs font-bold text-slate-600">মোবাইল কোম্পানি</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
            <span className="text-sm font-black text-amber-600 block truncate">
              {firstPhone ? `${firstPhone.brand} ${firstPhone.model}` : 'নেই'}
            </span>
            <span className="text-xs font-bold text-slate-600">প্রথম মোবাইল</span>
          </div>
        </div>

        {/* Action Buttons & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              সবকিছু টাইমলাইনে
            </button>
            <button
              onClick={() => setActiveTab('life')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'life' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              📅 জীবন ঘটনা ({toBanglaNum(lifeEvents.length)})
            </button>
            <button
              onClick={() => setActiveTab('phones')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'phones' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              📱 মোবাইল জার্নি ({toBanglaNum(phones.length)})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ঘটনা যুক্ত করুন</span>
            </button>
            <button
              onClick={() => setIsPhoneModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ফোন যুক্ত করুন</span>
            </button>
          </div>
        </div>

        {/* Chronological Timeline */}
        <div className="space-y-4">
          {activeTab !== 'phones' &&
            lifeEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-cyan-300 transition flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] text-cyan-600 font-bold uppercase">সাল</span>
                    <span className="text-sm font-black text-cyan-800">{toBanglaNum(evt.year)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-slate-900">{evt.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {evt.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteEvent(evt.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

          {activeTab !== 'life' &&
            phones.map((ph, idx) => (
              <div
                key={ph.id}
                className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs hover:border-purple-300 transition flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <span className="text-[10px] font-bold text-purple-700">{toBanglaNum(ph.yearAcquired)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-slate-900">
                        {ph.brand} {ph.model}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {toBanglaNum(ph.yearsUsed)} বছর ব্যবহৃত
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          প্রথম ফোন 🏆
                        </span>
                      )}
                    </div>
                    {ph.memory && <p className="text-xs text-slate-600 leading-relaxed">স্মৃতি: {ph.memory}</p>}
                  </div>
                </div>
                <button
                  onClick={() => deletePhone(ph.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>
      </main>

      {/* Hidden canvas for summary card */}
      <canvas ref={summaryCanvasRef} className="hidden" />

      {/* Add Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">নতুন জীবন ঘটনা যুক্ত করুন</h3>
            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">বছর / সাল:</label>
                <input
                  type="number"
                  required
                  value={eventYear === '' || Number.isNaN(Number(eventYear)) ? '' : eventYear}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEventYear(val === '' ? '' : parseInt(val, 10) || '');
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">শিরোনাম:</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="যেমন: এইচএসসি পরীক্ষা সম্পন্ন"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">বিবরণ / স্মৃতি:</label>
                <textarea
                  rows={3}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="সংক্ষেপে ঘটনাটি সম্পর্কে লিখুন..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">ক্যাটাগরি:</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as LifeEvent['category'])}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="education">পড়াশোনা ও শিক্ষা</option>
                  <option value="career">ক্যারিয়ার ও চাকরি</option>
                  <option value="family">পরিবার ও বিয়ে</option>
                  <option value="achievement">অর্জন ও পুরষ্কার</option>
                  <option value="travel">ভ্রমণ ও রোমাঞ্চ</option>
                  <option value="childhood">শৈশব ও কৈশোর</option>
                  <option value="memory">বিশেষ স্মৃতি</option>
                </select>
              </div>
              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Phone Modal: COMPANY -> MODEL DROPDOWN */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Smartphone className="w-5 h-5 text-purple-600" />
              <span>মোবাইল রেকর্ড নির্বাচন করুন</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              প্রথমে কোম্পানি এবং পরে মডেল অটো ড্রপডাউন করে নির্বাচন করুন
            </p>

            <form onSubmit={handleAddPhone} className="space-y-3 text-xs">
              {/* STEP 1: কোম্পানি ড্রপডাউন */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ১. মোবাইল কোম্পানি নির্বাচন করুন:
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 bg-purple-50/50 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {Object.keys(PHONE_DATABASE).map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 2: মডেল ড্রপডাউন */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ২. মডেল নির্বাচন করুন ({selectedBrand}):
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {(PHONE_DATABASE[selectedBrand] || []).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* কাস্টম মডেল ইনপুট (যদি অন্য মডেল সিলেক্ট হয়) */}
              {(selectedModel === 'অন্য মডেল...' || selectedBrand === 'অন্যান্য (কাস্টম ব্রান্ড)') && (
                <div>
                  <label className="block font-bold text-purple-700 mb-1">
                    মডেলের নাম লিখুন:
                  </label>
                  <input
                    type="text"
                    required
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    placeholder="যেমন: Galaxy Grand Prime..."
                    className="w-full p-2.5 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">কেনার বছর:</label>
                  <input
                    type="number"
                    required
                    value={phoneYear === '' || Number.isNaN(Number(phoneYear)) ? '' : phoneYear}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPhoneYear(val === '' ? '' : parseInt(val, 10) || '');
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ব্যবহারের মেয়াদ (বছর):</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={phoneUsedYears === '' || Number.isNaN(Number(phoneUsedYears)) ? '' : phoneUsedYears}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPhoneUsedYears(val === '' ? '' : parseInt(val, 10) || '');
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ব্যক্তিগত স্মৃতি / অভিজ্ঞতা:</label>
                <textarea
                  rows={2}
                  value={phoneMemory}
                  onChange={(e) => setPhoneMemory(e.target.value)}
                  placeholder="ফোনটি কেনার আনন্দ বা কোনো বিশেষ স্মৃতি..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
