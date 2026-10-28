import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Zap,
  Search,
  Calculator,
  HelpCircle,
  BookOpen,
  Phone,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Smartphone,
  CreditCard,
  Building,
  Store,
  DollarSign,
  Clock,
  Activity,
  Layers,
  Printer,
  Download,
  Upload,
  X,
  VolumeX,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  UTILITIES_DATA,
  METER_MODELS_DATA,
  SHORT_CODES_DATA,
  OFFICIAL_SOURCES_DATA,
  TROUBLESHOOTING_DATA,
  RECHARGE_GUIDES_DATA,
  calculateRechargeBreakdown,
  calculateBalanceRunway,
  UtilityId,
  MeterManufacturer,
  CodeCategory,
  ShortCodeItem,
  RechargeCalculationResult,
  RunwayResult,
} from '../data/prepaidMeterData';

interface PrepaidMeterHelperProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

type ActiveTab = 'codes' | 'calculator' | 'runway' | 'recharge-guide' | 'troubleshoot' | 'manuals';

export const PrepaidMeterHelper: React.FC<PrepaidMeterHelperProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  // Navigation & Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('codes');

  // Utility and Meter Selection
  const [selectedUtility, setSelectedUtility] = useState<UtilityId>('desco');
  const [selectedManufacturer, setSelectedManufacturer] = useState<MeterManufacturer | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CodeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Wizard state for meter identification
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardUtility, setWizardUtility] = useState<UtilityId>('desco');
  const [wizardBrand, setWizardBrand] = useState<MeterManufacturer | 'unknown'>('hexing');
  const [wizardPhase, setWizardPhase] = useState<'single' | 'three'>('single');

  // Recharge Calculator State
  const [rechargeAmount, setRechargeAmount] = useState<number>(1000);
  const [calcPhase, setCalcPhase] = useState<'single' | 'three'>('single');
  const [sanctionedLoad, setSanctionedLoad] = useState<number>(2); // kW
  const [isFirstRecharge, setIsFirstRecharge] = useState<boolean>(true);
  const [arrearsAmount, setArrearsAmount] = useState<number>(0);

  // Balance Runway Calculator State
  const [currentBalance, setCurrentBalance] = useState<number>(350);
  const [dailyCost, setDailyCost] = useState<number>(30);
  const [emergencyBuffer, setEmergencyBuffer] = useState<number>(50);

  // My Meter Profile (LocalStorage)
  const [savedUtility, setSavedUtility] = useState<UtilityId | null>(null);
  const [savedManufacturer, setSavedManufacturer] = useState<MeterManufacturer | null>(null);
  const [savedMeterNumber, setSavedMeterNumber] = useState<string>('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileMeterInput, setProfileMeterInput] = useState('');

  // Bookmarked / Favourite Codes (LocalStorage)
  const [favouriteCodes, setFavouriteCodes] = useState<string[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Troubleshooting Accordion State
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>('token-reject');

  // Backup / Import Modal State
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Print Preview
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Load Preferences & Bookmarks from LocalStorage
  useEffect(() => {
    try {
      const favs = localStorage.getItem('mosafa_meter_favourites');
      if (favs) setFavouriteCodes(JSON.parse(favs));

      const profUtil = localStorage.getItem('mosafa_meter_profile_util') as UtilityId;
      const profBrand = localStorage.getItem('mosafa_meter_profile_brand') as MeterManufacturer;
      const profNum = localStorage.getItem('mosafa_meter_profile_no');

      if (profUtil) {
        setSavedUtility(profUtil);
        setSelectedUtility(profUtil);
      }
      if (profBrand) {
        setSavedManufacturer(profBrand);
        setSelectedManufacturer(profBrand);
      }
      if (profNum) {
        setSavedMeterNumber(profNum);
        setProfileMeterInput(profNum);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Save Favourites
  const toggleFavourite = (codeId: string) => {
    setFavouriteCodes((prev) => {
      const exists = prev.includes(codeId);
      const next = exists ? prev.filter((id) => id !== codeId) : [...prev, codeId];
      try {
        localStorage.setItem('mosafa_meter_favourites', JSON.stringify(next));
      } catch (e) {}
      onShowToast(
        exists ? 'প্রিয় তালিকা থেকে কোডটি সরানো হয়েছে' : 'কোডটি প্রিয় তালিকায় সংরক্ষণ করা হয়েছে! ⭐',
        '🔖'
      );
      return next;
    });
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      onShowToast(`কোড "${code}" কপি করা হয়েছে! মিটারে টাইপ করুন।`, '📋');
      setTimeout(() => setCopiedCodeId(null), 2500);
    }
  };

  // Save Meter Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('mosafa_meter_profile_util', selectedUtility);
      localStorage.setItem('mosafa_meter_profile_brand', selectedManufacturer);
      localStorage.setItem('mosafa_meter_profile_no', profileMeterInput.trim());
      setSavedUtility(selectedUtility);
      setSavedManufacturer(selectedManufacturer === 'all' ? null : selectedManufacturer);
      setSavedMeterNumber(profileMeterInput.trim());
      setIsProfileModalOpen(false);
      onShowToast('আপনার মিটারের প্রোফাইল সফলভাবে সংরক্ষণ করা হয়েছে! ⚡', '✅');
    } catch (e) {
      onShowToast('ডাটা সংরক্ষণে সমস্যা হয়েছে', '⚠️');
    }
  };

  // Clear Saved Profile
  const handleClearProfile = () => {
    try {
      localStorage.removeItem('mosafa_meter_profile_util');
      localStorage.removeItem('mosafa_meter_profile_brand');
      localStorage.removeItem('mosafa_meter_profile_no');
      setSavedUtility(null);
      setSavedManufacturer(null);
      setSavedMeterNumber('');
      setProfileMeterInput('');
      setIsProfileModalOpen(false);
      onShowToast('সংরক্ষিত প্রোফাইল মুছে ফেলা হয়েছে', 'ℹ️');
    } catch (e) {}
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      app: 'MoSaFa Prepaid Meter Helper',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: {
        utility: savedUtility,
        manufacturer: savedManufacturer,
        meterNumber: savedMeterNumber,
      },
      favourites: favouriteCodes,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mosafa-prepaid-meter-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('আপনার সেটিংস ও প্রিয় কোড ব্যাকআপ ফাইল ডাউনলোড হয়েছে! 💾', '✅');
  };

  // Import JSON Backup
  const handleImportBackup = () => {
    try {
      const data = JSON.parse(importJsonText);
      if (data.favourites && Array.isArray(data.favourites)) {
        setFavouriteCodes(data.favourites);
        localStorage.setItem('mosafa_meter_favourites', JSON.stringify(data.favourites));
      }
      if (data.profile) {
        if (data.profile.utility) {
          setSavedUtility(data.profile.utility);
          setSelectedUtility(data.profile.utility);
          localStorage.setItem('mosafa_meter_profile_util', data.profile.utility);
        }
        if (data.profile.manufacturer) {
          setSavedManufacturer(data.profile.manufacturer);
          setSelectedManufacturer(data.profile.manufacturer);
          localStorage.setItem('mosafa_meter_profile_brand', data.profile.manufacturer);
        }
        if (data.profile.meterNumber) {
          setSavedMeterNumber(data.profile.meterNumber);
          localStorage.setItem('mosafa_meter_profile_no', data.profile.meterNumber);
        }
      }
      setIsBackupModalOpen(false);
      setImportJsonText('');
      onShowToast('ব্যাকআপ সফলভাবে পুনরুদ্ধার (Restore) করা হয়েছে! 🔄', '🎉');
    } catch (e) {
      onShowToast('অবৈধ JSON ফাইল! সঠিক ফরম্যাট দিন।', '⚠️');
    }
  };

  // Filtered Short Codes
  const filteredShortCodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SHORT_CODES_DATA.filter((item) => {
      // Utility match
      const matchesUtility =
        item.utility === 'all' || item.utility === selectedUtility;

      // Manufacturer match
      const matchesBrand =
        selectedManufacturer === 'all' ||
        item.manufacturer === 'all' ||
        item.manufacturer === selectedManufacturer;

      // Category match
      const matchesCat =
        selectedCategory === 'all' || item.category === selectedCategory;

      // Query match (code, Bengali title, English title, or description)
      const matchesQuery =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.titleBn.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.descriptionBn.toLowerCase().includes(q);

      return matchesUtility && matchesBrand && matchesCat && matchesQuery;
    });
  }, [selectedUtility, selectedManufacturer, selectedCategory, searchQuery]);

  // Selected Utility Object
  const currentUtilityObj = useMemo(() => {
    return UTILITIES_DATA.find((u) => u.id === selectedUtility) || UTILITIES_DATA[0];
  }, [selectedUtility]);

  // Dynamic Calculation Results
  const rechargeCalculationResult: RechargeCalculationResult = useMemo(() => {
    return calculateRechargeBreakdown({
      amount: Number(rechargeAmount) || 0,
      utility: selectedUtility,
      phase: calcPhase,
      sanctionedLoadKw: Number(sanctionedLoad) || 2,
      arrearsDeduction: Number(arrearsAmount) || 0,
      isFirstRechargeOfMonth: isFirstRecharge,
    });
  }, [rechargeAmount, selectedUtility, calcPhase, sanctionedLoad, arrearsAmount, isFirstRecharge]);

  // Balance Runway Result
  const runwayResult: RunwayResult = useMemo(() => {
    return calculateBalanceRunway(
      Number(currentBalance) || 0,
      Number(dailyCost) || 30,
      Number(emergencyBuffer) || 50
    );
  }, [currentBalance, dailyCost, emergencyBuffer]);

  // Complete Meter Identification Wizard
  const handleCompleteWizard = () => {
    setSelectedUtility(wizardUtility);
    if (wizardBrand !== 'unknown') {
      setSelectedManufacturer(wizardBrand);
    } else {
      setSelectedManufacturer('all');
    }
    setIsWizardOpen(false);
    onShowToast('মিটার প্রোফাইল সফলভাবে সেট করা হয়েছে! 🎯', '⚡');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHub}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="সকল টুলস-এ ফিরে যান"
            >
              <span>←</span>
              <span className="hidden sm:inline">সকল টুলস</span>
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 leading-tight">
                  MoSaFa Prepaid Meter Helper
                </h1>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                  বাংলাদেশ প্রিপেইড মিটার সহকারী
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50/80 hover:bg-sky-100 text-sky-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              <span>{savedMeterNumber ? 'আমার মিটার' : 'মিটার সেভ'}</span>
            </button>

            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="ডাটা ব্যাকআপ / পুনরুদ্ধার"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">ব্যাকআপ</span>
            </button>

            <a
              href="tel:16116"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs"
              title="জাতীয় বিদ্যুৎ হেল্পলাইন"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>হেল্পলাইন ১৬১১৬</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner with SVG Electricity Meter Illustration */}
      <section className="bg-gradient-to-b from-sky-50/80 via-teal-50/30 to-slate-50 border-b border-sky-100 py-6 sm:py-8 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-sky-200 shadow-2xs text-[11px] font-extrabold text-sky-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>বিপিডিবি, ডেসকো, ডিপিডিসি, ওজোপাডিকো ও পল্লী বিদ্যুৎ ভেরিফাইড গাইড</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              প্রিপেইড মিটার সহকারী
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              মিটারের শর্ট কোড, রিচার্জ হিসাব, ব্যালেন্স রানওয়ে ও জরুরি সমস্যার নির্ভরযোগ্য সমাধান এক জায়গায়।
            </p>

            {/* Quick Profile Status */}
            {savedUtility && (
              <div className="inline-flex items-center gap-2 pt-1 text-xs text-slate-700 font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>সেভ করা মিটার: <strong>{currentUtilityObj.shortName}</strong> {savedManufacturer && `(${savedManufacturer})`} {savedMeterNumber && `• নং ${savedMeterNumber}`}</span>
              </div>
            )}
          </div>

          {/* SVG Digital Prepaid Meter Art Illustration */}
          <div className="w-44 sm:w-52 md:w-60 shrink-0">
            <svg viewBox="0 0 240 220" className="w-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="20" width="200" height="185" rx="20" fill="#0f172a" />
              <rect x="25" y="25" width="190" height="175" rx="16" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              {/* LCD Display Screen */}
              <rect x="45" y="42" width="150" height="50" rx="8" fill="#0284c7" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="55" y="62" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">REM BAL: ৳ 350.40</text>
              <text x="55" y="80" fill="#4ade80" fontSize="12" fontFamily="monospace" fontWeight="bold">ACTIVE [801] Good</text>
              {/* LED Lights */}
              <circle cx="178" cy="55" r="4" fill="#ef4444" className="animate-pulse" />
              <circle cx="178" cy="72" r="4" fill="#22c55e" />
              {/* Keypad Buttons */}
              <g fill="#334155" stroke="#475569" strokeWidth="1">
                <rect x="45" y="105" width="30" height="18" rx="4" />
                <rect x="85" y="105" width="30" height="18" rx="4" />
                <rect x="125" y="105" width="30" height="18" rx="4" />
                <rect x="165" y="105" width="30" height="18" rx="4" fill="#0284c7" />

                <rect x="45" y="130" width="30" height="18" rx="4" />
                <rect x="85" y="130" width="30" height="18" rx="4" />
                <rect x="125" y="130" width="30" height="18" rx="4" />
                <rect x="165" y="130" width="30" height="18" rx="4" fill="#059669" />

                <rect x="45" y="155" width="30" height="18" rx="4" />
                <rect x="85" y="155" width="30" height="18" rx="4" />
                <rect x="125" y="155" width="30" height="18" rx="4" />
                <rect x="165" y="155" width="30" height="18" rx="4" fill="#dc2626" />
              </g>
              <text x="170" y="118" fill="#fff" fontSize="9" fontWeight="bold">801</text>
              <text x="168" y="143" fill="#fff" fontSize="8" fontWeight="bold">Enter</text>
              <text x="171" y="168" fill="#fff" fontSize="8" fontWeight="bold">Clr</text>
              {/* Pulse & Barcode text */}
              <rect x="45" y="182" width="150" height="10" rx="3" fill="#0f172a" />
              <text x="75" y="190" fill="#94a3b8" fontSize="7" fontFamily="monospace">STS COMPLIANT • 3200 imp/kWh</text>
            </svg>
          </div>
        </div>
      </section>

      {/* 6 Quick-Action Dashboard Cards Navigation */}
      <section className="max-w-6xl mx-auto px-4 -mt-4 w-full relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {[
            { id: 'codes', label: 'শর্ট কোড ডিরেক্টরি', icon: '🔢', color: 'border-sky-300 hover:border-sky-500' },
            { id: 'calculator', label: 'রিচার্জ ক্যালকুলেটর', icon: '🧮', color: 'border-teal-300 hover:border-teal-500' },
            { id: 'runway', label: 'ব্যালেন্স কত দিন চলবে', icon: '⏳', color: 'border-amber-300 hover:border-amber-500' },
            { id: 'recharge-guide', label: 'রিচার্জের নিয়ম', icon: '📱', color: 'border-emerald-300 hover:border-emerald-500' },
            { id: 'troubleshoot', label: 'সমস্যা ও সমাধান', icon: '🛡️', color: 'border-rose-300 hover:border-rose-500' },
            { id: 'manuals', label: 'অফিসিয়াল ম্যানুয়াল', icon: '📖', color: 'border-indigo-300 hover:border-indigo-500' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`p-3 rounded-2xl border text-center transition-all duration-200 bg-white shadow-2xs hover:shadow-md cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-sky-600 ring-2 ring-sky-500/20 bg-sky-50/50'
                  : 'border-slate-200 hover:border-sky-300'
              }`}
            >
              <span className="text-xl sm:text-2xl">{tab.icon}</span>
              <span className={`text-xs font-bold leading-tight ${activeTab === tab.id ? 'text-sky-900 font-black' : 'text-slate-700'}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        {/* Universal Utility & Manufacturer Selector Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                ধাপ ১: আপনার বিদ্যুৎ বিতরণ সংস্থা ও মিটার নির্বাচন করুন
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {currentUtilityObj.fullNameBn}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                আওতাভুক্ত এলাকা: {currentUtilityObj.coverageArea} • হেল্পলাইন: {currentUtilityObj.hotline}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setWizardStep(1);
                setIsWizardOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>মিটার শনাক্তকরণ উইজার্ড</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            {/* Utility Select */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                বিদ্যুৎ বিতরণ সংস্থা (Utility)
              </label>
              <select
                value={selectedUtility}
                onChange={(e) => setSelectedUtility(e.target.value as UtilityId)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {UTILITIES_DATA.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.shortName} — {u.nameBn}
                  </option>
                ))}
              </select>
            </div>

            {/* Manufacturer Brand Select */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                মিটার প্রস্তুতকারক ব্র্যান্ড (Brand)
              </label>
              <select
                value={selectedManufacturer}
                onChange={(e) => setSelectedManufacturer(e.target.value as MeterManufacturer | 'all')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">সকল ব্র্যান্ড (Hexing, Inhemeter, Wasion...)</option>
                <option value="hexing">হেক্সিং (Hexing)</option>
                <option value="inhemeter">ইনহিমিটার (Inhemeter)</option>
                <option value="wasion">ওয়াসিওন (Wasion)</option>
                <option value="linyang">লিনইয়াং (Linyang)</option>
                <option value="bseco">বিএসইসিও (BSECO)</option>
              </select>
            </div>

            {/* Helpline and Official Website Link */}
            <div className="flex items-end">
              <a
                href={currentUtilityObj.customerCareUrl || currentUtilityObj.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>অফিসিয়াল পোর্টাল</span>
                <ExternalLink className="w-3 h-3 text-sky-600" />
              </a>
            </div>
          </div>
        </div>

        {/* TAB 1: SHORT CODES DIRECTORY */}
        {activeTab === 'codes' && (
          <section className="space-y-4">
            {/* Search & Category Filter Toolbar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="কোড বা নাম দিয়ে খুঁজুন... (যেমন 801, ব্যালেন্স, ভোল্টেজ)"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 self-end">
                  <span>উপলব্ধ ভেরিফাইড কোড:</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold">
                    {filteredShortCodes.length}টি
                  </span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
                {[
                  { id: 'all', label: 'সকল কোড' },
                  { id: 'balance', label: '💰 ব্যালেন্স' },
                  { id: 'meter-number', label: '🔢 মিটার নম্বর' },
                  { id: 'last-recharge', label: '💳 শেষ রিচার্জ' },
                  { id: 'consumption', label: '⚡ ইউনিট ব্যবহার (kWh)' },
                  { id: 'voltage-current', label: '🔌 ভোল্টেজ ও কারেন্ট' },
                  { id: 'emergency', label: '🚨 ইমার্জেন্সি ব্যালেন্স' },
                  { id: 'alarm', label: '🔕 অ্যালার্ম বন্ধ' },
                  { id: 'date-time', label: '🕒 তারিখ ও সময়' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as CodeCategory | 'all')}
                    className={`px-3 py-1.5 rounded-xl transition font-bold cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Short Code Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShortCodes.map((item) => {
                const isFav = favouriteCodes.includes(item.id);
                const isCopied = copiedCodeId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 relative group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-sky-700 font-mono tracking-wider bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                            {item.code}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            যাচাইকৃত
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleFavourite(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition cursor-pointer"
                            title={isFav ? 'প্রিয় তালিকা থেকে সরান' : 'প্রিয় কোড করুন'}
                          >
                            <Bookmark className={`w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyCode(item.code, item.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                            title="কোড কপি করুন"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                          {item.titleBn}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium font-mono">
                          {item.titleEn}
                        </span>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {item.descriptionBn}
                        </p>
                      </div>

                      {/* Instructions on Keypad */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold text-slate-900 block mb-0.5">কীভাবে চাপবেন:</span>
                        <span className="text-[11px] leading-relaxed text-slate-600">{item.instructions}</span>
                      </div>
                    </div>

                    {/* Source and Verification Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span title={item.sourceTitle}>সূত্র: {item.sourceTitle.slice(0, 22)}...</span>
                      {item.officialSourceUrl && (
                        <a
                          href={item.officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 font-bold hover:underline flex items-center gap-0.5"
                        >
                          <span>ম্যানুয়াল</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredShortCodes.length === 0 && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                <span className="text-3xl block">🔍</span>
                <h4 className="text-base font-bold text-slate-800">
                  কোনো শর্ট কোড পাওয়া যায়নি
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  অন্য কোনো ব্র্যান্ড বা ক্যাটাগরি ফিল্টার করে দেখুন। অথবা আপনার মিটারের অফিসিয়াল ম্যানুয়াল চেক করুন।
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedManufacturer('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
                >
                  ফিল্টার রিসেট
                </button>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: RECHARGE CALCULATOR */}
        {activeTab === 'calculator' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">
                  সরকারি বিইআরসি ট্যারিফ অনুযায়ী হিসাব
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  রিচার্জ কর্তন ক্যালকুলেটর
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  টাকা রিচার্জ করলে ভ্যাট, ডিমান্ড চার্জ ও মিটার ভাড়া বাদে প্রকৃত কত টাকার বিদ্যুৎ পাবেন তা জানুন।
                </p>
              </div>

              <div className="space-y-3.5">
                {/* 1. Recharge Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    রিচার্জের পরিমাণ (টাকা ৳)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={100}
                      step={50}
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-extrabold text-base focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="absolute left-3 top-3 text-slate-400 font-bold">৳</span>
                  </div>
                  {/* Quick Pills */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-xs">
                    {[500, 1000, 1500, 2000, 3000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmount(amt)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 font-bold border border-slate-200 cursor-pointer"
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Phase selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মিটারের ফেজ (Phase)
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setCalcPhase('single')}
                      className={`py-2 rounded-xl border transition cursor-pointer ${
                        calcPhase === 'single'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      সিঙ্গেল ফেজ (১ ফেজ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcPhase('three')}
                      className={`py-2 rounded-xl border transition cursor-pointer ${
                        calcPhase === 'three'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      থ্রি ফেজ (৩ ফেজ)
                    </button>
                  </div>
                </div>

                {/* 3. Sanctioned Load (kW) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    অনুমোদিত লোড (Sanctioned Load kW)
                  </label>
                  <select
                    value={sanctionedLoad}
                    onChange={(e) => setSanctionedLoad(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value={1}>১ কিলোওয়াট (১ kW)</option>
                    <option value={2}>২ কিলোওয়াট (সাধারণ বাসা - ২ kW)</option>
                    <option value={3}>৩ কিলোওয়াট (৩ kW)</option>
                    <option value={4}>৪ কিলোওয়াট (৪ kW)</option>
                    <option value={5}>৫ কিলোওয়াট (৫ kW)</option>
                  </select>
                </div>

                {/* 4. First Recharge of Month Toggle */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isFirstRecharge}
                      onChange={(e) => setIsFirstRecharge(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600"
                    />
                    <span>এটি এই মাসের প্রথম রিচার্জ</span>
                  </label>
                  <p className="text-[11px] text-slate-500 pl-6">
                    (মিটার ভাড়া ও মাসিক ডিমান্ড চার্জ কেবল চলতি মাসের প্রথম রিচার্জে একবারই কাটা হয়)
                  </p>
                </div>

                {/* 5. Arrears / Previous Emergency Credit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    পূর্বের ইমার্জেন্সি ব্যালেন্স বা বকেয়া (যদি থাকে)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={arrearsAmount}
                    onChange={(e) => setArrearsAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="০ টাকা"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Breakdown Result Column */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                    ফলাফল সারসংক্ষেপ
                  </span>
                  <h4 className="text-xl font-black text-slate-900">
                    রিচার্জের বিস্তারিত হিসাব
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-semibold">নেট এনার্জি ক্রেডিট</span>
                  <span className="text-2xl sm:text-3xl font-black text-teal-600">
                    ৳{rechargeCalculationResult.netEnergyCredit}
                  </span>
                </div>
              </div>

              {/* Units Estimation Highlight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-teal-900 block">
                    আনুমানিক বিদ্যুৎ পাবেন (Units)
                  </span>
                  <span className="text-2xl font-black text-teal-800">
                    ~ {rechargeCalculationResult.approximateUnits} kWh (ইউনিট)
                  </span>
                  <span className="text-[11px] text-teal-700 block mt-0.5">
                    গড় আবাসিক রেট ৳৭.২০ হিসেবে হিসাবকৃত
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
                  ⚡
                </div>
              </div>

              {/* Deductions Breakdown Table */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-700 block">
                  কর্তন ও প্রণোদনার বিভাজন:
                </span>
                <div className="space-y-1.5 text-xs">
                  {rechargeCalculationResult.deductionsBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="font-extrabold text-slate-800 block">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-500 leading-snug block">
                          {item.description}
                        </span>
                      </div>
                      <span className="font-black text-slate-900 shrink-0 text-sm">
                        {item.label.includes('রিবেট') ? `+৳${item.amount}` : `-৳${item.amount}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Deductions Summary */}
              <div className="p-3 rounded-xl bg-slate-100 font-bold text-xs flex items-center justify-between text-slate-700">
                <span>মোট কর্তন (মিটার ভাড়া + ডিমান্ড চার্জ + ভ্যাট):</span>
                <span className="text-rose-600 font-black text-sm">
                  - ৳{rechargeCalculationResult.totalDeductions}
                </span>
              </div>

              {/* Assumptions & Disclaimers */}
              <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                {rechargeCalculationResult.assumptionsNotes.map((note, nIdx) => (
                  <p key={nIdx}>ℹ️ {note}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: BALANCE RUNWAY CALCULATOR */}
        {activeTab === 'runway' && (
          <section className="max-w-3xl mx-auto bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
                স্মার্ট বিদ্যুৎ বাজেট ও পরিকল্পনা
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                ব্যালেন্স কত দিন চলবে? (Balance Runway)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                আপনার বর্তমান অবশিষ্ট ব্যালেন্স ও দৈনিক গড় খরচের ওপর ভিত্তি করে জানুন কবে ব্যালেন্স শেষ হতে পারে।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বর্তমান অবশিষ্ট ব্যালেন্স (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  দৈনিক গড় খরচ (টাকা ৳)
                </label>
                <input
                  type="number"
                  min={5}
                  value={dailyCost}
                  onChange={(e) => setDailyCost(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  জরুরি রিজার্ভ বাফার (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  value={emergencyBuffer}
                  onChange={(e) => setEmergencyBuffer(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-extrabold text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Visual Runway Result Card */}
            <div
              className={`p-6 rounded-3xl border transition-all duration-200 text-center space-y-3 ${
                runwayResult.reminderStatus === 'critical'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : runwayResult.reminderStatus === 'warning'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white/80 shadow-2xs">
                <span>{runwayResult.reminderStatus === 'critical' ? '🚨 অতি জরুরি' : runwayResult.reminderStatus === 'warning' ? '⚠️ সতর্কবার্তা' : '✅ নিরাপদ ব্যালেন্স'}</span>
              </div>

              <div>
                <span className="text-4xl sm:text-5xl font-black block tracking-tight">
                  ~ {runwayResult.daysRemaining} দিন
                </span>
                <span className="text-xs font-bold block mt-1">
                  বর্তমান খরচে আনুমানিক আগামী <strong>{runwayResult.estimatedEndDate}</strong> তারিখ পর্যন্ত বিদ্যুৎ চলবে।
                </span>
              </div>

              <p className="text-xs font-medium max-w-md mx-auto leading-relaxed pt-2 border-t border-black/10">
                💡 {runwayResult.adviceBn}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <p>Formula: <code>আনুমানিক দিন = (বর্তমান ব্যালেন্স - বাফার) ÷ দৈনিক গড় খরচ</code></p>
              <p>এটি অতীতের গড় খরচের ওপর ভিত্তি করে অনুমান। এসি বা ভারী যন্ত্র চালালে দৈনিক খরচ বৃদ্ধি পেতে পারে।</p>
            </div>
          </section>
        )}

        {/* TAB 4: RECHARGE GUIDES */}
        {activeTab === 'recharge-guide' && (
          <section className="space-y-5">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
              <h3 className="text-lg font-black text-slate-900">
                প্রিপেইড বিদ্যুৎ মিটার রিচার্জ করার নিয়ম ও টোকেন এন্ট্রি
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                বিকাশ, নগদ, রকেট, ব্যাংক এবং ভেন্ডিং পয়েন্ট থেকে রিচার্জের পর টোকেন পাওয়ার উপায়।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RECHARGE_GUIDES_DATA.map((guide, gIdx) => (
                <div
                  key={gIdx}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                        {guide.methodId === 'bkash' ? '📱' : guide.methodId === 'nagad' ? '💳' : guide.methodId === 'rocket' ? '🏦' : '🏪'}
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {guide.titleBn}
                      </h4>
                    </div>

                    <div className="space-y-2 text-xs">
                      {guide.stepsBn.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {sIdx + 1}
                          </span>
                          <span className="text-slate-600 leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <span className="font-extrabold block">✅ সফলতার লক্ষণ:</span>
                      <p className="text-[11px] leading-relaxed">{guide.confirmationCheck}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <span className="font-extrabold block">💡 টোকেন না পেলে:</span>
                      <p className="text-[11px] leading-relaxed">{guide.tokenInstruction}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px]">
                    <a
                      href={guide.officialSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>{guide.officialSourceTitle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 5: TROUBLESHOOTING HELP CENTER */}
        {activeTab === 'troubleshoot' && (
          <section className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
              <h3 className="text-lg font-black text-slate-900">
                প্রিপেইড মিটারের সাধারণ সমস্যা ও প্রাথমিক সমাধান
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                টোকেন রিজেক্ট, ডিসপ্লে বন্ধ, অ্যালার্ম বাজা বা বিদ্যুৎ বিভ্রাটের নিরাপদ সমাধান।
              </p>
            </div>

            {/* Safety Alert Banner */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-black text-sm block">নিরাপত্তা সতর্কতা (Safety Advisory)</span>
                <p className="text-[11px] leading-relaxed">
                  কখনোই মিটারের সিল ভাঙবেন না, মিটার বক্স খুলবেন না বা লাইভ বৈদ্যুতিক তার স্পর্শ করবেন না। এটি আইনত দণ্ডনীয় ও জীবনের জন্য মারাত্মক ঝুঁকিপূর্ণ। অভ্যন্তরীণ যান্ত্রিক ত্রুটির ক্ষেত্রে সবসময় সরকারি হেল্পলাইনে ফোন করুন।
                </p>
              </div>
            </div>

            {/* Accordion Issues List */}
            <div className="space-y-3">
              {TROUBLESHOOTING_DATA.map((issue) => {
                const isOpen = expandedIssueId === issue.id;

                return (
                  <div
                    key={issue.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedIssueId(isOpen ? null : issue.id)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center text-sm font-bold shrink-0">
                          ❓
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {issue.titleBn}
                        </h4>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-4 sm:p-5 pt-0 space-y-3.5 text-xs text-slate-700 border-t border-slate-100 mt-1">
                        {/* Possible Causes */}
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-900 block">সম্ভাব্য কারণ:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 text-[11px]">
                            {issue.possibleCauses.map((c, cIdx) => (
                              <li key={cIdx}>{c}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Safe Steps */}
                        <div className="space-y-1 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                          <span className="font-extrabold text-emerald-900 block">নিরাপদ করণীয় ধাপসমূহ:</span>
                          <ol className="list-decimal list-inside space-y-1 text-emerald-950 text-[11px]">
                            {issue.safeActionSteps.map((step, sIdx) => (
                              <li key={sIdx}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        {/* When to call utility */}
                        <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600">
                          <strong className="text-slate-800">কখন বিদ্যুৎ অফিসে যোগাযোগ করবেন: </strong>
                          {issue.whenToCallUtility}
                        </div>

                        {issue.safetyWarning && (
                          <div className="p-2.5 rounded-xl bg-rose-50 text-[11px] text-rose-800 font-bold border border-rose-200">
                            ⚠️ {issue.safetyWarning}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 6: OFFICIAL MANUALS & HOTLINES DIRECTORY */}
        {activeTab === 'manuals' && (
          <section className="space-y-5">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs">
              <h3 className="text-lg font-black text-slate-900">
                অফিসিয়াল ম্যানুয়াল ও জরুরি গ্রাহক সেবা নির্দেশিকা
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                বিপিডিবি, ডেসকো, ডিপিডিসি ও অন্যান্য সংস্থার সরকার অনুমোদিত ডকুমেন্ট ও লিংক।
              </p>
            </div>

            {/* Emergency Hotline Quick Dial Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
              {UTILITIES_DATA.map((u) => (
                <a
                  key={u.id}
                  href={`tel:${u.helplineShort}`}
                  className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-400 hover:bg-emerald-50/50 transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-slate-800">{u.shortName}</span>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-md">
                    {u.helplineShort}
                  </span>
                </a>
              ))}
            </div>

            {/* Official Source Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OFFICIAL_SOURCES_DATA.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-extrabold uppercase">
                        {doc.utility}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        যাচাইকৃত সোর্স
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900">
                      {doc.sourceTitle}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {doc.descriptionBn}
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      প্রযোজ্য মডেল: {doc.applicableMeterModels}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">যাচাই: {doc.lastCheckedAt}</span>
                    <a
                      href={doc.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                    >
                      <span>ওয়েবসাইটে দেখুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* MODAL 1: METER IDENTIFICATION WIZARD */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    মিটার শনাক্তকরণ উইজার্ড
                  </h3>
                  <span className="text-xs text-slate-400">ধাপ {wizardStep} এর ৩</span>
                </div>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wizard Step 1: Utility Selection */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-slate-700 block">
                  ১. আপনার বাসার বিদ্যুৎ বিতরণ কোম্পানি কোনটি?
                </span>
                <div className="space-y-2 text-xs font-bold">
                  {UTILITIES_DATA.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setWizardUtility(u.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        wizardUtility === u.id
                          ? 'border-sky-600 bg-sky-50 text-sky-950 font-black'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <span>{u.shortName}</span>
                        <span className="text-[11px] text-slate-500 font-normal block">{u.coverageArea}</span>
                      </div>
                      {wizardUtility === u.id && <Check className="w-4 h-4 text-sky-600" />}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition mt-2 cursor-pointer"
                >
                  পরবর্তী ধাপ →
                </button>
              </div>
            )}

            {/* Wizard Step 2: Manufacturer Selection */}
            {wizardStep === 2 && (
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-slate-700 block">
                  ২. মিটারের ওপরের লোগো বা প্রস্তুতকারক নাম কী লেখা আছে?
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { id: 'hexing', name: 'হেক্সিং (Hexing)' },
                    { id: 'inhemeter', name: 'ইনহিমিটার (Inhemeter)' },
                    { id: 'wasion', name: 'ওয়াসিওন (Wasion)' },
                    { id: 'linyang', name: 'লিনইয়াং (Linyang)' },
                    { id: 'bseco', name: 'বিএসইসিও (BSECO)' },
                    { id: 'unknown', name: 'জানি না / অস্পষ্ট' },
                  ].map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => setWizardBrand(brand.id as any)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        wizardBrand === brand.id
                          ? 'border-sky-600 bg-sky-50 text-sky-950'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500">
                  💡 পরামর্শ: মিটারের এলসিডি স্ক্রিনের ঠিক ওপরে বা নিচে প্রস্তুতকারকের খোদাই করা নাম থাকে।
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                  >
                    ← পূর্ববর্তী
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="w-2/3 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs"
                  >
                    পরবর্তী ধাপ →
                  </button>
                </div>
              </div>
            )}

            {/* Wizard Step 3: Phase Selection & Finish */}
            {wizardStep === 3 && (
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-slate-700 block">
                  ৩. মিটারের ফেজ নির্বাচন করুন:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setWizardPhase('single')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      wizardPhase === 'single'
                        ? 'border-sky-600 bg-sky-50 text-sky-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    ১ ফেজ (Single Phase - সাধারণ বাসা)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardPhase('three')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      wizardPhase === 'three'
                        ? 'border-sky-600 bg-sky-50 text-sky-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    ৩ ফেজ (Three Phase - বড় ফ্ল্যাট / লিফট / মোটর)
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  ✅ প্রস্তুত! উইজার্ডটি সমাপ্ত করলে আপনার নির্বাচিত মিটারের কোডগুলো সরাসরি ফিল্টার হয়ে যাবে।
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
                  >
                    ← পূর্ববর্তী
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteWizard}
                    className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    সমাপ্ত করুন ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: MY METER PROFILE (LocalStorage) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                আমার মিটার প্রোফাইল সংরক্ষণ
              </h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <p className="text-slate-500 text-[11px] leading-relaxed">
                আপনার ব্রাউজারে মিটার প্রোফাইল সেভ রাখলে প্রতিবার সংস্থা বাছাই করতে হবে না। সমস্ত তথ্য সম্পূর্ণ গোপনীয়ভাবে আপনার মোবাইলেই সংরক্ষিত থাকে।
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">বিদ্যুৎ বিতরণ সংস্থা</label>
                <select
                  value={selectedUtility}
                  onChange={(e) => setSelectedUtility(e.target.value as UtilityId)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  {UTILITIES_DATA.map((u) => (
                    <option key={u.id} value={u.id}>{u.shortName} — {u.nameBn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মিটার ব্র্যান্ড</label>
                <select
                  value={selectedManufacturer}
                  onChange={(e) => setSelectedManufacturer(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  <option value="hexing">হেক্সিং (Hexing)</option>
                  <option value="inhemeter">ইনহিমিটার (Inhemeter)</option>
                  <option value="wasion">ওয়াসিওন (Wasion)</option>
                  <option value="linyang">লিনইয়াং (Linyang)</option>
                  <option value="all">অন্যান্য / সব</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মিটার নম্বর (ঐচ্ছিক)</label>
                <input
                  type="text"
                  maxLength={16}
                  value={profileMeterInput}
                  onChange={(e) => setProfileMeterInput(e.target.value)}
                  placeholder="যেমন: 04220012345"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                {savedUtility && (
                  <button
                    type="button"
                    onClick={handleClearProfile}
                    className="w-1/3 py-2.5 rounded-xl border border-rose-200 text-rose-700 font-bold hover:bg-rose-50"
                  >
                    মুছে ফেলুন
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  সংরক্ষণ করুন ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BACKUP & RESTORE JSON */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                ডাটা ব্যাকআপ ও রিস্টোর
              </h3>
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
                <span className="font-extrabold text-sky-950 block">১. ব্যাকআপ এক্সপোর্ট (JSON Download):</span>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  আপনার প্রিয় শর্ট কোড তালিকা ও মিটার সেটিংস ব্যাকআপ ফাইল হিসেবে ডাউনলোড করে রাখুন।
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ব্যাকআপ ফাইল ডাউনলোড</span>
                </button>
              </div>

              <div className="space-y-2">
                <span className="font-extrabold text-slate-800 block">২. ব্যাকআপ রিস্টোর (Import):</span>
                <textarea
                  rows={4}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="পূর্বে ডাউনলোডকৃত JSON কোড এখানে পেস্ট করুন..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-[11px]"
                />
                <button
                  type="button"
                  disabled={!importJsonText.trim()}
                  onClick={handleImportBackup}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs"
                >
                  পুনরুদ্ধার (Restore) করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-700">
            The MoSaFa Prepaid Meter Helper — বাংলাদেশের বিদ্যুৎ গ্রাহকদের ডিজিটাল সহকারী
          </p>
          <p className="text-[11px] text-slate-400">
            তথ্যসূত্র: বিপিডিবি, ডেসকো, ডিপিডিসি, ওজোপাডিকো, নেসকো ও বিইআরসি অফিশিয়াল ম্যানুয়াল। এটি একটি নিরপেক্ষ ও সহায়ক ইউটিলিটি।
          </p>
        </div>
      </footer>
    </div>
  );
};
