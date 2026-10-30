import React from 'react';
import {
  Layers,
  Bus,
  Zap,
  BookOpen,
  Smartphone,
  Laptop,
  Globe,
  Menu,
  Compass,
  FileText,
  GraduationCap,
  Share2,
  Heart,
  Keyboard,
  Calendar,
  Coins,
  Sparkles,
  MessageSquare,
  MessageSquareHeart,
  Palette,
  Users,
  Brain,
  Wallet,
  Receipt,
  UserCheck,
  Search,
  Home,
  Languages,
  RotateCw,
  Gift,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BanglaLiveDateTimeWidget } from './BanglaLiveDateTimeWidget';

export type DeviceSector = 'all' | 'desktop' | 'mobile';

interface HeaderProps {
  onNavigateHome: () => void;
  onNavigateTool?: (tool: any) => void;
  onOpenMobileInstall: () => void;
  onDirectInstall?: () => void;
  onOpenShare?: () => void;
  deviceSector?: DeviceSector;
  onSelectDeviceSector?: (sector: DeviceSector) => void;
  onOpenLiveUpdate?: () => void;
  isUpdateOn?: boolean;
  currentVersion?: string;
  updateAvailable?: boolean;
  onOpenSpinModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenWalletModal?: () => void;
  onOpenDeveloperContact?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateHome,
  onNavigateTool,
  onOpenMobileInstall,
  onDirectInstall,
  onOpenShare,
  onOpenDeveloperContact,
  onOpenAdminPanel,
  deviceSector = 'all',
  onSelectDeviceSector,
  onOpenLiveUpdate,
  isUpdateOn = true,
  currentVersion = '3.0.0',
  updateAvailable = false,
  onOpenSpinModal,
  onOpenAuthModal,
  onOpenWalletModal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [menuSearch, setMenuSearch] = React.useState('');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { user, isLoggedIn, canSpinToday } = useAuth();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toBanglaNum = (n: number | string): string => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
  };

  // Complete Tools in categorized list
  const allToolsList = [
    // 1. শিক্ষা ও ক্যারিয়ার
    { id: 'studymate-bd', name: 'StudyMate BD 🎓 (AI প্রাইভেট টিউটর)', icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />, category: 'শিক্ষা ও ক্যারিয়ার', badge: 'AI টিউটর' },
    { id: 'application-writer', name: 'MoSaFa Application Writer (দরখাস্ত ও অফিসিয়াল চিঠি)', icon: <FileText className="w-3.5 h-3.5 text-blue-600" />, category: 'শিক্ষা ও ক্যারিয়ার', badge: 'দরখাস্ত' },
    { id: 'cv-maker', name: 'The MoSaFa CV Maker (১০০টি সিভি ও রেজিউম)', icon: <FileText className="w-3.5 h-3.5 text-rose-600" />, category: 'শিক্ষা ও ক্যারিয়ার', badge: 'সিভি মেকার' },
    { id: 'voter-transfer-form', name: 'ভোটার স্থানান্তর ফরম (ফরম-১৩ অটো ফিল)', icon: <FileText className="w-3.5 h-3.5 text-emerald-600" />, category: 'শিক্ষা ও ক্যারিয়ার', badge: 'অফিসিয়াল' },

    // 2. কন্টেন্ট, পোস্টার ও বই
    { id: 'pdf-toolkit', name: 'MoSaFa PDF Toolkit (PDF টুলবক্স)', icon: <FileText className="w-3.5 h-3.5 text-rose-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'PDF টুলস' },
    { id: 'poster-studio', name: 'MoSaFa Poster Studio (পোস্টার ও স্লোগান)', icon: <Palette className="w-3.5 h-3.5 text-rose-500" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'ডিজাইন' },
    { id: 'golpo-ghor', name: 'গল্পের ঘর (জনপ্রিয় সকল বই ও গল্প)', icon: <BookOpen className="w-3.5 h-3.5 text-amber-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'বই ও গল্প' },
    { id: 'bangla-status', name: 'বাংলা স্ট্যাটাস ও ক্যাপশন হাব (১০০০+)', icon: <MessageSquareHeart className="w-3.5 h-3.5 text-violet-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'ক্যাপশন' },
    { id: 'typing-test', name: 'লিপি টাইピング টেস্ট (স্পিড পরীক্ষা)', icon: <Keyboard className="w-3.5 h-3.5 text-blue-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'টাইপিং' },
    { id: 'bangla-text-converter', name: 'MoSaFa বাংলা টেক্সট কনভার্টার', icon: <Languages className="w-3.5 h-3.5 text-emerald-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'কনভার্টার' },

    // 3. মানচিত্র, যাতায়াত ও ইউটিলিটি
    { id: 'bangladesh-map', name: 'MoSaFa My Bangladesh Map (ভ্রমণ মানচিত্র)', icon: <Compass className="w-3.5 h-3.5 text-emerald-600" />, category: 'যাতায়াত ও ইউটিলিটি', badge: 'ম্যাপ' },
    { id: 'bus-fare', name: 'ঢাকা ও আন্তঃজেলা বাস ভাড়া তালিকা', icon: <Bus className="w-3.5 h-3.5 text-sky-600" />, category: 'যাতায়াত ও ইউটিলিটি', badge: 'বাস ভাড়া' },
    { id: 'prepaid-meter', name: 'বিদ্যুৎ প্রিপেইড মিটার হিসাব সহকারী', icon: <Zap className="w-3.5 h-3.5 text-emerald-600" />, category: 'যাতায়াত ও ইউটিলিটি', badge: 'বিদ্যুৎ' },

    // 4. বিনোদন, প্রেম ও কুইজ
    { id: 'love-test', name: 'প্রেম টেস্ট (বাস্তব পরীক্ষা ও সনদপত্র)', icon: <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />, category: 'বিনোদন ও কুইজ', badge: 'ভাইরাল' },
    { id: 'bangla-quiz', name: 'বাংলা সাধারণ জ্ঞান ও মেধা কুইজ', icon: <Brain className="w-3.5 h-3.5 text-indigo-600" />, category: 'বিনোদন ও কুইজ', badge: 'কুইজ' },
    { id: 'random-picker', name: 'র‍্যান্ডম পিকার হুইল (ভাগ্যের চাকা)', icon: <Compass className="w-3.5 h-3.5 text-purple-600" />, category: 'বিনোদন ও কুইজ', badge: 'চাকা' },
    { id: 'decision-maker', name: 'কয়েন টস ও সিদ্ধান্ত (৩ডি স্পিন)', icon: <Coins className="w-3.5 h-3.5 text-amber-600" />, category: 'বিনোদন ও কুইজ', badge: '৩ডি টস' },
    { id: 'name-reveal', name: 'নামের গোপন রহস্য ও বিশ্লেষণ', icon: <Sparkles className="w-3.5 h-3.5 text-rose-500" />, category: 'বিনোদন ও কুইজ', badge: 'রহস্য' },
    { id: 'personality-reveal', name: 'ব্যক্তিত্ব টেস্ট ও স্বভাব বৈশিষ্ট্য', icon: <UserCheck className="w-3.5 h-3.5 text-teal-600" />, category: 'বিনোদন ও কুইজ', badge: 'ব্যক্তিত্ব' },

    // 5. হিসাব, ব্যবসা ও পরিবার
    { id: 'invoice-maker', name: 'MoSaFa Invoice Maker (ইনভয়েস ও মানি রিসিট)', icon: <Receipt className="w-3.5 h-3.5 text-emerald-600" />, category: 'হিসাব ও পরিবার', badge: 'ইনভয়েস' },
    { id: 'daily-hishab', name: 'দৈনিক হিসাব খাতা (আয়-ব্যয় ট্র্যাকার)', icon: <Wallet className="w-3.5 h-3.5 text-emerald-600" />, category: 'হিসাব ও পরিবার', badge: 'হিসাব' },
    { id: 'age-calc', name: 'বয়স ক্যালকুলেটর (নিখুঁত দিনক্ষণ)', icon: <Calendar className="w-3.5 h-3.5 text-cyan-600" />, category: 'হিসাব ও পরিবার', badge: 'বয়স' },
    { id: 'life-receipt', name: 'লাইফ রসিদ মেকার (মজার রসিদ)', icon: <Receipt className="w-3.5 h-3.5 text-slate-700" />, category: 'হিসাব ও পরিবার', badge: 'রসিদ' },
  ];

  const filteredMenuItems = allToolsList.filter(
    (item) =>
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(menuSearch.toLowerCase())
  );

  // 5-Click Easter Egg trigger on "The MoSaFa" to open Admin Panel (mobile & desktop)
  const clickCountRef = React.useRef(0);
  const clickTimerRef = React.useRef<any>(null);
  const [easterEggActive, setEasterEggActive] = React.useState(false);

  const handleBrandClick = () => {
    clickCountRef.current += 1;

    // First click always navigates home
    if (clickCountRef.current === 1) {
      onNavigateHome();
    }

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      setEasterEggActive(true);
      setTimeout(() => setEasterEggActive(false), 2000);
      onOpenAdminPanel?.();
      return;
    }

    // Reset after 1.6 seconds without clicks
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1600);
  };

  return (
    <header className="w-full pt-4 sm:pt-6 pb-2 z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo - Clicking 5 times rapidly unlocks Admin Panel */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleBrandClick}
            type="button"
            className={`flex items-center gap-2 sm:gap-3 group text-left cursor-pointer transition select-none active:scale-95 ${
              easterEggActive ? 'ring-2 ring-indigo-500 rounded-2xl p-1 bg-indigo-50/50' : ''
            }`}
            title="The MoSaFa Tools"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition shrink-0">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  The MoSaFa
                </span>
                <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Tools
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden xs:block">
                সকল ফ্রি অনলাইন টুলস এক ক্লিকে
              </p>
            </div>
          </button>
        </div>

        {/* Right Corner: Only Hamburger Menu (☰) — All options inside as requested */}
        <div className="flex items-center gap-2">
          {/* থ্রি লাইন মেনু (☰) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition cursor-pointer shadow-xs relative ${
                isMenuOpen
                  ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-400'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
              title="সকল অপশন ও টুলস মেনু (☰)"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
              {/* Notification dot if daily spin is available or update is ready */}
              {(canSpinToday() || updateAvailable) && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-ping"></span>
              )}
              {(canSpinToday() || updateAvailable) && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full"></span>
              )}
            </button>

            {/* ☰ Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-12 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                  <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>সকল টুলস ডিরেক্টরি</span>
                    <span className="bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full text-[10px]">
                      ২৫টি
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onNavigateHome();
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Home className="w-3 h-3" />
                    <span>হোম পেজ</span>
                  </button>
                </div>

                {/* Quick Spin & Account inside Menu */}
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSpinModal?.();
                    }}
                    className="p-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 border border-amber-200 text-left cursor-pointer flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Gift className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                        লাকি স্পিন
                      </span>
                      <span className="text-[9px] text-amber-700 font-semibold">
                        {canSpinToday() ? '১০০-১০০০ কয়েন' : 'সম্পন্ন ✅'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (isLoggedIn) {
                        onOpenWalletModal?.();
                      } else {
                        onOpenAuthModal?.();
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left cursor-pointer flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                      <Wallet className="w-3.5 h-3.5 text-yellow-300" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                        {isLoggedIn ? 'আমার ওয়ালেট' : 'লগইন / একাউন্ট'}
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold">
                        {isLoggedIn ? `${user?.coins || 0} কয়েন` : 'বোনাস নিন'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Device Sector inside Menu */}
                {onSelectDeviceSector && (
                  <div className="mb-2 p-1 bg-slate-100 rounded-2xl flex items-center gap-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDeviceSector('all');
                        setIsMenuOpen(false);
                      }}
                      className={`flex-1 py-1 px-1.5 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                        deviceSector === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>সবগুলো</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDeviceSector('desktop');
                        setIsMenuOpen(false);
                      }}
                      className={`flex-1 py-1 px-1.5 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                        deviceSector === 'desktop'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-indigo-600'
                      }`}
                    >
                      <Laptop className="w-3 h-3" />
                      <span>কম্পিউটার</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectDeviceSector('mobile');
                        setIsMenuOpen(false);
                      }}
                      className={`flex-1 py-1 px-1.5 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-1 ${
                        deviceSector === 'mobile'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-rose-600'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>মোবাইল</span>
                    </button>
                  </div>
                )}

                {/* Search inside menu */}
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder={`টুল খুঁজুন... (${toBanglaNum(allToolsList.length)}টির মধ্যে)`}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                {/* সরাসরি অ্যাপ ইনস্টল অপশন (ত্রি লাইনের ভিতরে) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onDirectInstall) {
                      onDirectInstall();
                    } else {
                      onOpenMobileInstall();
                    }
                  }}
                  className="w-full mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white shadow-sm flex items-center justify-between gap-2.5 transition cursor-pointer active:scale-98 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs font-bold leading-tight block">
                        সরাসরি অ্যাপ ইনস্টল 📲
                      </span>
                      <span className="text-[10px] text-rose-100 block">
                        হোম স্ক্রিনে ইনস্টল ও QR কোড
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold bg-white text-rose-600 px-2.5 py-1 rounded-xl shadow-xs shrink-0">
                    ইনস্টল
                  </span>
                </button>

                {onOpenDeveloperContact && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenDeveloperContact();
                    }}
                    className="w-full mb-2 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition flex items-center justify-between gap-2 group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 transition">
                        <MessageSquare className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block leading-tight">
                          সরাসরি ডেভেলপার সাপোর্ট
                        </span>
                        <span className="text-[9px] text-slate-500">মেসেজ ও সহায়তা</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      মেসেজ দিন
                    </span>
                  </button>
                )}

                {/* লাইভ অটো-আপডেট স্ট্যাটাস মেনু আইটেম */}
                {onOpenLiveUpdate && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenLiveUpdate();
                    }}
                    className={`w-full mb-2 p-2 rounded-xl border flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                      updateAvailable
                        ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                        : isUpdateOn
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          updateAvailable
                            ? 'bg-rose-500 animate-ping'
                            : isUpdateOn
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>
                        {updateAvailable
                          ? 'নতুন আপডেট প্রস্তুত রয়েছে!'
                          : `লাইভ সিঙ্ক: ${isUpdateOn ? 'Update ON' : 'Update OFF'}`}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                      v{currentVersion}
                    </span>
                  </button>
                )}

                {/* Scrollable list of ALL 25 TOOLS */}
                <div className="overflow-y-auto space-y-1 pr-1 flex-1">
                  {filteredMenuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onNavigateTool?.(item.id);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-between transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          {item.icon}
                        </div>
                        <span className="truncate group-hover:text-rose-600 transition">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full shrink-0">
                        {item.badge}
                      </span>
                    </button>
                  ))}

                  {filteredMenuItems.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      কোনো টুল মেলেনি
                    </div>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onNavigateHome();
                    }}
                    className="text-xs font-bold text-slate-700 hover:text-rose-600 transition cursor-pointer"
                  >
                    🏠 সকল {toBanglaNum(allToolsList.length)}টি টুলস গ্রিড ভিউ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* লাইভ বর্তমান ডেট, টাইম, বার ও বঙ্গাব্দ-হিজরি ক্যালেন্ডার উইজেট */}
      <div className="max-w-6xl mx-auto px-4 mt-3 sm:mt-4 flex justify-center">
        <BanglaLiveDateTimeWidget />
      </div>
    </header>
  );
};
