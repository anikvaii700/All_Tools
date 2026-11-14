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
  Hand,
  Building2,
  Video,
  Briefcase,
  LogOut,
  LogIn,
  X,
  Store,
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
  onShowToast?: (message: string, icon?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateHome,
  onNavigateTool,
  onOpenMobileInstall,
  onDirectInstall,
  onOpenShare,
  onOpenDeveloperContact,
  onOpenAdminPanel,
  onShowToast,
  deviceSector = 'all',
  onSelectDeviceSector,
  onOpenLiveUpdate,
  isUpdateOn = true,
  currentVersion = '3.2.0',
  updateAvailable = false,
  onOpenSpinModal,
  onOpenAuthModal,
  onOpenWalletModal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [menuSearch, setMenuSearch] = React.useState('');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { user, isLoggedIn, canSpinToday, logout } = useAuth();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Lock background scroll on small screens
      if (window.innerWidth < 640) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
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
    { id: 'content-creator-studio', name: 'MoSaFa Content Creator Studio (কনটেন্ট স্টুডিও)', icon: <Video className="w-3.5 h-3.5 text-indigo-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'ক্রিয়েটর' },
    { id: 'pdf-toolkit', name: 'MoSaFa PDF Toolkit (PDF টুলবক্স)', icon: <FileText className="w-3.5 h-3.5 text-rose-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'PDF টুলস' },
    { id: 'poster-studio', name: 'MoSaFa Poster Studio (পোস্টার ও স্লোগান)', icon: <Palette className="w-3.5 h-3.5 text-rose-500" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'ডিজাইন' },
    { id: 'golpo-ghor', name: 'গল্পের ঘর (জনপ্রিয় সকল বই ও গল্প)', icon: <BookOpen className="w-3.5 h-3.5 text-amber-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'বই ও গল্প' },
    { id: 'bangla-status', name: 'বাংলা স্ট্যাটাস ও ক্যাপশন হাব (১০০০+)', icon: <MessageSquareHeart className="w-3.5 h-3.5 text-violet-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'ক্যাপশন' },
    { id: 'typing-test', name: 'লিপি টাইピング টেস্ট (স্পিড পরীক্ষা)', icon: <Keyboard className="w-3.5 h-3.5 text-blue-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'টাইপিং' },
    { id: 'bangla-text-converter', name: 'MoSaFa বাংলা টেক্সট কনভার্টার', icon: <Languages className="w-3.5 h-3.5 text-emerald-600" />, category: 'কন্টেন্ট ও ক্রিয়েটিভ', badge: 'কনভার্টার' },

    // 3. মানচিত্র, যাতায়াত ও ইউটিলিটি
    { id: 'bd-online-portal', name: 'MoSaFa BD Online Portal (বাংলাদেশ ডিরেক্টরি)', icon: <Building2 className="w-3.5 h-3.5 text-emerald-600" />, category: 'যাতায়াত ও ইউটিলিটি', badge: 'সার্ভিস ও জব' },
    { id: 'bangladesh-map', name: 'MoSaFa My Bangladesh Map (ভ্রমণ মানচিত্র)', icon: <Compass className="w-3.5 h-3.5 text-emerald-600" />, category: 'যাতায়াত ও ইউটিলিটি', badge: 'ম্যাপ' },
    { id: 'prepaid-meter', name: 'বিদ্যুৎ প্রিপেইড মিটার হিসাব সহকারী', icon: <Zap className="w-3.5 h-3.5 text-emerald-600" />, category: 'যাতায়াত ও ইউটিলিটি', badge: 'বিদ্যুৎ' },

    // 4. বিনোদন, প্রেম ও কুইজ
    { id: 'palmistry-ai', name: 'MoSaFa Palmistry AI (হস্তরেখা ও ভাগ্যরেখা)', icon: <Hand className="w-3.5 h-3.5 text-amber-600" />, category: 'বিনোদন ও কুইজ', badge: 'এআই হাত' },
    { id: 'love-test', name: 'প্রেম টেস্ট (বাস্তব পরীক্ষা ও সনদপত্র)', icon: <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />, category: 'বিনোদন ও কুইজ', badge: 'ভাইরাল' },
    { id: 'bangla-quiz', name: 'বাংলা সাধারণ জ্ঞান ও মেধা কুইজ', icon: <Brain className="w-3.5 h-3.5 text-indigo-600" />, category: 'বিনোদন ও কুইজ', badge: 'কুইজ' },
    { id: 'random-picker', name: 'র‍্যান্ডম পিকার হুইল (ভাগ্যের চাকা)', icon: <Compass className="w-3.5 h-3.5 text-purple-600" />, category: 'বিনোদন ও কুইজ', badge: 'চাকা' },
    { id: 'name-reveal', name: 'নামের গোপন রহস্য ও বিশ্লেষণ', icon: <Sparkles className="w-3.5 h-3.5 text-rose-500" />, category: 'বিনোদন ও কুইজ', badge: 'রহস্য' },

    // 5. হিসাব, ব্যবসা ও পরিবার
    { id: 'my-digital-shop', name: 'My Digital Shop Management (ডিজিটাল দোকান ম্যানেজমেন্ট)', icon: <Store className="w-3.5 h-3.5 text-emerald-700" />, category: 'হিসাব ও পরিবার', badge: 'দোকান সিস্টেম' },
    { id: 'all-form-fillup', name: 'MoSaFa All Form Fillup (সকল ফরম ফিলআপ ও রসিদ)', icon: <FileText className="w-3.5 h-3.5 text-rose-600" />, category: 'হিসাব ও পরিবার', badge: 'ফরম মেকার' },
    { id: 'entrepreneur-journey', name: 'MoSaFa Entrepreneur Journey (উদ্যোক্তা প্ল্যাটফর্ম)', icon: <Briefcase className="w-3.5 h-3.5 text-rose-600" />, category: 'হিসাব ও পরিবার', badge: 'উদ্যোক্তা' },
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

  const handleBrandClick = () => {
    clickCountRef.current += 1;

    // First click navigates home
    if (clickCountRef.current === 1) {
      onNavigateHome();
    }

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
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
      <div className="max-w-7xl 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo - Only admin knows that clicking 5 times unlocks admin panel */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleBrandClick}
            type="button"
            className="flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer transition select-none active:scale-95"
            title="MoSaFa Tools - অফিসিয়াল হোম"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white p-0.5 shadow-md shadow-indigo-100/80 border border-slate-200/90 group-hover:scale-105 transition shrink-0 flex items-center justify-center overflow-hidden aspect-square">
              <img
                src="/logo.png"
                alt="MoSaFa Tools Official Logo"
                className="w-full h-full object-contain aspect-square select-none pointer-events-none"
                loading="eager"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  MoSaFa
                </span>
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  Tools
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden xs:block">
                সকল প্রয়োজনীয় ডিজিটাল অনলাইন টুলস
              </p>
            </div>
          </button>
        </div>

        {/* Right Corner: Quick Balance Pill + Hamburger Menu (☰) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Balance Pill if Logged In */}
          {isLoggedIn && user ? (
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer border border-slate-700 shadow-2xs text-xs font-bold"
              title="মূল ব্যালেন্স ও কয়েন ওয়ালেট"
            >
              <span className="text-emerald-400 font-black">৳{(user.balance || 0).toFixed(0)}</span>
              <span className="text-slate-500 font-normal">|</span>
              <span className="text-amber-300 flex items-center gap-0.5 text-[11px]">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>{user.coins || 0}</span>
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003B4A]/10 hover:bg-[#003B4A]/15 text-[#003B4A] border border-[#003B4A]/25 transition cursor-pointer text-xs font-bold"
              title="লগইন বা একাউন্ট তৈরি করুন"
            >
              <span>লগইন</span>
              <span className="text-[10px] bg-[#00C8D7] text-[#003B4A] font-extrabold px-1.5 py-0.2 rounded-full">+৫০</span>
            </button>
          )}

          {/* Quick Header Share Button */}
          {onOpenShare && (
            <button
              type="button"
              onClick={onOpenShare}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 shadow-2xs hover:border-indigo-300 flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0"
              title="বন্ধুদের মাঝে সাইট শেয়ার করুন"
              aria-label="Share site"
            >
              <Share2 className="w-4 h-4 text-indigo-600" />
            </button>
          )}

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

            {/* ☰ Full Drawer on Mobile / Dropdown on Desktop */}
            {isMenuOpen && (
              <>
                {/* Mobile Backdrop Overlay */}
                <div
                  className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 sm:hidden animate-in fade-in duration-200"
                  onClick={() => setIsMenuOpen(false)}
                />

                {/* Drawer Container: On mobile it is a sleek right drawer taking full screen height; on desktop a floating rounded dropdown */}
                <div
                  className="fixed inset-y-0 right-0 w-[92vw] max-w-[380px] bg-white shadow-2xl z-50 p-4 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:mt-2 sm:w-96 sm:h-auto sm:max-h-[85vh] sm:rounded-3xl sm:border sm:border-slate-200 sm:p-3.5 sm:animate-in sm:fade-in sm:zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Bar with Brand & Close Button */}
                  <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-slate-100 px-0.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white p-0.5 border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="MoSaFa" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block leading-tight">
                          MoSaFa Tools ডিরেক্টরি
                        </span>
                        <span className="text-[10px] text-rose-600 font-bold">
                          {toBanglaNum(allToolsList.length)}টি অনলাইন টুলস
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onNavigateHome();
                        }}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-700 hover:text-rose-600 hover:bg-slate-100 flex items-center gap-1 cursor-pointer transition"
                        title="হোম পেজে যান"
                      >
                        <Home className="w-3.5 h-3.5 text-rose-500" />
                        <span className="hidden xs:inline">হোম</span>
                      </button>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition"
                        aria-label="মেনু বন্ধ করুন"
                        title="বন্ধ করুন (✕)"
                      >
                        <X className="w-4 h-4 text-slate-700" />
                      </button>
                    </div>
                  </div>

                  {/* 👤 অ্যাকাউন্ট ও লগআউট সেকশন (User Account / Logout / Login) */}
                  {isLoggedIn && user ? (
                    <div className="mb-2.5 p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#003B4A] text-white shadow-md border border-slate-700 shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00C8D7] to-cyan-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                            {user.displayName ? (
                              user.displayName.trim().charAt(0).toUpperCase()
                            ) : (
                              <User className="w-4 h-4 text-slate-900" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black truncate block leading-tight text-white">
                                {user.displayName || 'ব্যবহারকারী'}
                              </span>
                              <span className="text-[9px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded-full">
                                Active
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-300 truncate block font-mono">
                              {user.email || user.phoneNumber || 'MoSaFa একাউন্ট'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats: মূল ব্যালেন্স & কয়েন */}
                      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-white/10 backdrop-blur-xs mb-2.5 text-center text-xs">
                        <div>
                          <span className="text-[9px] text-slate-300 block font-medium">মূল ব্যালেন্স</span>
                          <span className="font-extrabold text-emerald-300">৳{(user.balance || 0).toFixed(0)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-300 block font-medium">পয়েন্ট / কয়েন</span>
                          <span className="font-extrabold text-amber-300 flex items-center justify-center gap-1">
                            <Coins className="w-3 h-3 text-amber-400" />
                            <span>{user.coins || 0}</span>
                          </span>
                        </div>
                      </div>

                      {/* মাই একাউন্ট ও লগআউট বাটন */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenWalletModal?.();
                          }}
                          className="py-1.5 px-2 rounded-xl bg-[#00C8D7] hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-98"
                        >
                          <Wallet className="w-3.5 h-3.5 text-slate-950" />
                          <span>মাই একাউন্ট</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            setIsMenuOpen(false);
                            try {
                              await logout();
                              onShowToast?.('সফলভাবে লগআউট হয়েছে 👋', '🚪');
                            } catch {
                              onShowToast?.('লগআউটে সমস্যা হয়েছে', '⚠️');
                            }
                          }}
                          className="py-1.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-300" />
                          <span>লগআউট</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Guest Mode Banner */
                    <div className="mb-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-100 border border-indigo-100 flex items-center justify-between gap-2.5 shadow-2xs shrink-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-slate-900 block leading-tight">
                            গেস্ট অ্যাকাউন্ট
                          </span>
                          <span className="text-[10px] text-slate-500 truncate block">
                            লগইন করলেই ৫০ কয়েন বোনাস
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenAuthModal?.();
                        }}
                        className="py-1.5 px-3 bg-gradient-to-r from-[#003B4A] to-[#00C8D7] hover:brightness-110 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer shrink-0 flex items-center gap-1 active:scale-98"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>লগইন / সাইন-আপ</span>
                      </button>
                    </div>
                  )}

                  {/* লাকি স্পিন ও সিভি কুইক শর্টকাট বাটন */}
                  <div className="grid grid-cols-2 gap-1.5 mb-2 shrink-0">
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
                        onNavigateTool?.('cv-maker');
                      }}
                      className="p-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 border border-emerald-200 text-left cursor-pointer flex items-center gap-2"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-950 block leading-tight">
                          সিভি প্রোফাইল
                        </span>
                        <span className="text-[9px] text-emerald-700 font-semibold">
                          অটো-ফিল ডাটা
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

                {/* ৩-লাইনের ভিতরে শেয়ার বাটন */}
                {onOpenShare && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenShare();
                    }}
                    className="w-full mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-sm flex items-center justify-between gap-2.5 transition cursor-pointer active:scale-98 text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                        <Share2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold leading-tight block">
                          বন্ধুদের মাঝে শেয়ার করুন 🚀
                        </span>
                        <span className="text-[10px] text-indigo-100 block">
                          অনলাইন সেবার দারুণ প্ল্যাটফর্ম বন্ধুদের পাঠান
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold bg-white text-indigo-700 px-2.5 py-1 rounded-xl shadow-xs shrink-0">
                      শেয়ার
                    </span>
                  </button>
                )}

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
            </>
          )}
          </div>
        </div>
      </div>

      {/* লাইভ বর্তমান ডেট, টাইম, বার ও বঙ্গাব্দ-হিজরি ক্যালেন্ডার উইজেট */}
      <div className="max-w-7xl 2xl:max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 mt-3 sm:mt-4 flex justify-center">
        <BanglaLiveDateTimeWidget />
      </div>
    </header>
  );
};
