import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ArrowLeft,
  ExternalLink,
  Star,
  Clock,
  Building2,
  Briefcase,
  Share2,
  Check,
  ChevronRight,
  Filter,
  Globe,
  Sparkles,
  ShieldCheck,
  Car,
  FileSpreadsheet,
  BadgePercent,
  HeartPulse,
  Zap,
  Wallet,
  Landmark,
  IdCard,
  MapPin,
  GraduationCap,
  X,
  Info,
  Home,
  Phone,
  Camera,
} from 'lucide-react';
import {
  BD_SERVICE_CATEGORIES,
  BD_SERVICES_DATA,
  BdServiceCategory,
  BdServiceItem,
} from '../data/bdServicesData';
import { GovOfficeLogo } from './gov-offices/GovOfficeLogo';
import { NidSimpleFormat } from './gov-offices/nid-assistant/NidSimpleFormat';
import { JobPhotoSignatureResizer } from './job-resizer/JobPhotoSignatureResizer';

export type BdPortalSubView = 'portal' | 'election-commission' | 'job-photo-resizer';

export interface BdOnlinePortalProps {
  onBackToHub: () => void;
  onShowToast?: (msg: string, icon?: string) => void;
  initialSubView?: BdPortalSubView;
}

const FAVORITES_STORAGE_KEY = 'mosafa_bd_portal_favorites_v1';
const RECENTS_STORAGE_KEY = 'mosafa_bd_portal_recents_v1';

export const BdOnlinePortal: React.FC<BdOnlinePortalProps> = ({
  onBackToHub,
  onShowToast,
  initialSubView = 'portal',
}) => {
  const [activeSubView, setActiveSubView] = useState<BdPortalSubView>(initialSubView);

  useEffect(() => {
    if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [initialSubView]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'favorites' | 'recents' | 'govt' | 'jobs'>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['mygov-bd', 'nid-services', 'epassport-gov', 'brta-bsp', 'bdjobs'];
    } catch {
      return ['mygov-bd', 'nid-services', 'epassport-gov', 'brta-bsp', 'bdjobs'];
    }
  });

  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore
    }
  }, [favorites]);

  // Sync recents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(recents));
    } catch {
      // Ignore
    }
  }, [recents]);

  const toggleFavorite = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      if (onShowToast) {
        if (!exists) {
          onShowToast(`"${name}" ফেভারিটে যুক্ত করা হয়েছে ⭐`, '⭐');
        } else {
          onShowToast(`"${name}" ফেভারিট থেকে সরানো হয়েছে`, '🗑️');
        }
      }
      return next;
    });
  };

  const handleVisitService = (service: BdServiceItem) => {
    // Add to recents
    setRecents((prev) => {
      const filtered = prev.filter((item) => item !== service.id);
      return [service.id, ...filtered].slice(0, 15);
    });

    window.open(service.url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = (service: BdServiceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(service.url);
    setCopiedId(service.id);
    if (onShowToast) {
      onShowToast(`লিংক কপি হয়েছে: ${service.url}`, '📋');
    }
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Resolve Category Icon
  const renderCategoryIcon = (iconName: string, className = 'w-6 h-6 text-white') => {
    switch (iconName) {
      case 'Landmark':
        return <Landmark className={className} />;
      case 'IdCard':
        return <IdCard className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'MapPin':
        return <MapPin className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'FileSpreadsheet':
        return <FileSpreadsheet className={className} />;
      case 'BadgePercent':
        return <BadgePercent className={className} />;
      case 'Car':
        return <Car className={className} />;
      case 'HeartPulse':
        return <HeartPulse className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Wallet':
        return <Wallet className={className} />;
      case 'Globe':
        return <Globe className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      default:
        return <Building2 className={className} />;
    }
  };

  // Convert numbers to Bengali
  const toBanglaNum = (n: number | string): string => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
  };

  // Active Category details
  const activeCategory = useMemo(() => {
    return BD_SERVICE_CATEGORIES.find((cat) => cat.id === selectedCategoryId) || null;
  }, [selectedCategoryId]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    let list = BD_SERVICES_DATA;

    // Filter by category if selected
    if (selectedCategoryId) {
      list = list.filter((item) => item.categoryId === selectedCategoryId);
    }

    // Filter tab
    if (activeFilterTab === 'favorites') {
      list = list.filter((item) => favorites.includes(item.id));
    } else if (activeFilterTab === 'recents') {
      const recentsMap = new Map(recents.map((id, index) => [id, index]));
      list = list
        .filter((item) => recentsMap.has(item.id))
        .sort((a, b) => (recentsMap.get(a.id) ?? 999) - (recentsMap.get(b.id) ?? 999));
    } else if (activeFilterTab === 'govt') {
      list = list.filter((item) => item.isGov);
    } else if (activeFilterTab === 'jobs') {
      list = list.filter((item) => item.categoryId === 'online-jobs');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        return (
          item.name.toLowerCase().includes(q) ||
          item.englishName.toLowerCase().includes(q) ||
          item.institution.toLowerCase().includes(q) ||
          (item.englishInstitution && item.englishInstitution.toLowerCase().includes(q)) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [selectedCategoryId, activeFilterTab, searchQuery, favorites, recents]);

  // Count services per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of BD_SERVICES_DATA) {
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    }
    return counts;
  }, []);

  const totalServicesCount = BD_SERVICES_DATA.length;
  const isSearchOrFilterActive = Boolean(searchQuery.trim() || activeFilterTab !== 'all');

  // Check if search query matches election commission services
  const isElectionSearchMatch = useMemo(() => {
    if (!searchQuery.trim()) return activeFilterTab === 'govt';
    const q = searchQuery.toLowerCase();
    return (
      'নির্বাচন অফিস'.includes(q) ||
      'বাংলাদেশ নির্বাচন কমিশন'.includes(q) ||
      'নির্বাচন'.includes(q) ||
      'এনআইডি'.includes(q) ||
      'nid'.includes(q) ||
      'ভোটার'.includes(q) ||
      'কমিশন'.includes(q) ||
      'voter'.includes(q) ||
      'election'.includes(q)
    );
  }, [searchQuery, activeFilterTab]);

  // Check if search query matches job photo / signature resizer
  const isJobPhotoSearchMatch = useMemo(() => {
    if (!searchQuery.trim()) return activeFilterTab === 'jobs';
    const q = searchQuery.toLowerCase();
    return (
      'ছবি'.includes(q) ||
      'স্বাক্ষর'.includes(q) ||
      'টেলিটক'.includes(q) ||
      'চাকরির ছবি'.includes(q) ||
      '৩০০'.includes(q) ||
      '৩০০*৩০০'.includes(q) ||
      '৩০০x৩০০'.includes(q) ||
      'resizer'.includes(q) ||
      'photo'.includes(q) ||
      'signature'.includes(q) ||
      'teletalk'.includes(q)
    );
  }, [searchQuery, activeFilterTab]);

  // If election commission workspace subview is active, render the full NID assistant
  if (activeSubView === 'election-commission') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        {/* Universal Top Bar: শুধুমাত্র ২টি বাটন: ১। "পিছনে যান" এবং ২। "হোমে ফিরে যান" */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
            <div className="flex items-center justify-between gap-3">
              {/* ১। পিছনে যান */}
              <button
                type="button"
                onClick={() => setActiveSubView('portal')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer border border-slate-200 shadow-2xs"
                title="বিডি অনলাইন পোর্টালে ফিরে যান"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5] text-slate-700" />
                <span>পিছনে যান</span>
              </button>

              {/* ২। হোমে ফিরে যান */}
              <button
                type="button"
                onClick={onBackToHub}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-xs"
                title="হোম পেইজে ফিরে যান"
              >
                <Home className="w-4 h-4 stroke-[2.5] text-white" />
                <span>হোমে ফিরে যান</span>
              </button>
            </div>
          </div>
        </header>

        {/* Election Commission Workspace Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">
          {/* Active Office Status Indicator */}
          <div className="flex items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>MoSaFa BD Online Portal • সরকারি সেবা ডেস্ক</span>
            </div>

            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>সক্রিয় দপ্তর: বাংলাদেশ নির্বাচন কমিশন</span>
            </span>
          </div>

          {/* Selected Office Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-md">
                  <GovOfficeLogo officeId="election-commission" size="md" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      বাংলাদেশ নির্বাচন কমিশন
                    </h2>
                    <span className="text-xs text-slate-500">(Bangladesh Election Commission)</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded">
                      ১২টি সংশোধন সেবা প্রস্তুত
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                    জাতীয় পরিচয়পত্র (NID) সংশোধন, ভোটার এলাকার স্থানান্তর, নতুন ভোটার নিবন্ধন, হারানো কার্ড রিশ্যিউ এবং নির্বাচন কমিশনের সকল বিধিমালা ও ফি সহায়িকা।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <a
                  href="https://services.nidw.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <span>services.nidw.gov.bd</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Complete Election Commission NID Assistant & Forms Tool (All preserved 100%) */}
          <NidSimpleFormat onShowToast={onShowToast || ((m) => {})} />
        </main>
      </div>
    );
  }

  // If job photo signature resizer subview is active, render JobPhotoSignatureResizer
  if (activeSubView === 'job-photo-resizer') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <JobPhotoSignatureResizer
          onBackToHub={() => setActiveSubView('portal')}
          onShowToast={onShowToast || ((m) => {})}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Banner / Portal Header */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  বাংলাদেশ সার্ভিস ডিরেক্টরি
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                  {toBanglaNum(totalServicesCount)}+ অনলাইন সেবা ও জব পোর্টাল
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 shrink-0" />
                <span>MoSaFa BD Online Portal</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                বাংলাদেশ সরকার ও শীর্ষস্থানীয় বেসরকারি প্রতিষ্ঠানের সকল গুরুত্বপূর্ণ অনলাইন সেবা ও জনপ্রিয় চাকরির পোর্টালসমূহ এক ক্লিকে!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBackToHub}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-rose-400" />
                <span>টুলস হোম</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="mt-6 relative max-w-3xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সেবার নাম, NID, পাসপোর্ট, ড্রাইভিং লাইসেন্স, খতিয়ান, বিসিএস বা জব পোর্টাল সার্চ করুন..."
                className="w-full pl-12 pr-10 py-3 sm:py-3.5 rounded-2xl bg-white/95 text-slate-900 placeholder:text-slate-500 font-medium text-sm sm:text-base shadow-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-xs text-slate-300">
              <span className="text-slate-400 font-medium">দ্রুত খুঁজুন:</span>
              {[
                { label: 'চাকরির ছবি ও স্বাক্ষর (৩০০x৩০০)', q: 'ছবি' },
                { label: 'BSP ড্রাইভিং লাইসেন্স', q: 'BSP' },
                { label: 'ই-পাসপোর্ট', q: 'পাসপোর্ট' },
                { label: 'NID সংশোধন', q: 'NID' },
                { label: 'ট্রেন টিকিট', q: 'রেলওয়ে' },
                { label: 'Bdjobs', q: 'Bdjobs' },
                { label: 'ই-নামজারি', q: 'নামজারি' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item.q);
                    setSelectedCategoryId(null);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer text-[11px]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 space-y-6">
        {/* Navigation & Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveFilterTab('all');
                setSelectedCategoryId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeFilterTab === 'all' && !selectedCategoryId
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>সকল ক্যাটাগরি ({toBanglaNum(BD_SERVICE_CATEGORIES.length)})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilterTab('jobs');
                setSelectedCategoryId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeFilterTab === 'jobs'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span>💼 চাকরি পোর্টাল</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilterTab('govt');
                setSelectedCategoryId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeFilterTab === 'govt'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>🏛️ সরকারি সেবা</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilterTab('favorites');
                setSelectedCategoryId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeFilterTab === 'favorites'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>প্রিয় সেবা ({toBanglaNum(favorites.length)})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilterTab('recents');
                setSelectedCategoryId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeFilterTab === 'recents'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-violet-600" />
              <span>সম্প্রতি দেখা ({toBanglaNum(recents.length)})</span>
            </button>
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-slate-500 font-medium hidden md:block">
            মোট সেবার সংখ্যা: <span className="font-bold text-slate-800">{toBanglaNum(totalServicesCount)}টি</span>
          </div>
        </div>

        {/* View Branch 1: Search Active OR Tab Filter Active */}
        {isSearchOrFilterActive ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">
                  {searchQuery ? `অনুসন্ধানের ফলাফল: "${searchQuery}"` : activeFilterTab === 'favorites' ? 'আমার প্রিয় সেবাসমূহ' : activeFilterTab === 'recents' ? 'সম্প্রতি ভিজিট করা সেবা' : activeFilterTab === 'jobs' ? 'অনলাইন চাকরির পোর্টালসমূহ' : 'সরকারি ডিজিটাল সেবা'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                  {toBanglaNum(filteredServices.length)}টি সেবা
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilterTab('all');
                  setSelectedCategoryId(null);
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer flex items-center gap-1"
              >
                <span>রিসেট করুন</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* If query matches election/NID/Govt, show Election Office Card */}
            {isElectionSearchMatch && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl border-2 border-emerald-300 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>বাংলাদেশ নির্বাচন কমিশন — এনআইডি ও ভোটার সহকারী ডেস্ক</span>
                  </span>
                  <span className="text-[11px] font-bold bg-white text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                    সক্রিয় অনলাইন টুল
                  </span>
                </div>
                <div className="max-w-sm sm:max-w-md">
                  <ElectionOfficeCard
                    onStart={() => {
                      setActiveSubView('election-commission');
                      onShowToast?.('বাংলাদেশ নির্বাচন কমিশন সেবায় আপনাকে স্বাগতম!', '🗳️');
                    }}
                  />
                </div>
              </div>
            )}

            {/* If query matches Job Photo / Signature Resizer, show Job Photo Resizer Card */}
            {isJobPhotoSearchMatch && (
              <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 via-pink-50 to-white rounded-3xl border-2 border-rose-300 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-rose-950 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                    <span>টেলিটক সরকারি চাকরির আবেদন ছবি ও স্বাক্ষর প্রস্তুতকারী</span>
                  </span>
                  <span className="text-[11px] font-bold bg-white text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs">
                    সক্রিয় অনলাইন টুল
                  </span>
                </div>
                <div className="max-w-sm sm:max-w-md">
                  <JobPhotoResizerCard
                    onStart={() => {
                      setActiveSubView('job-photo-resizer');
                      onShowToast?.('টেলিটক চাকরির ছবি ও স্বাক্ষর সাইজারে স্বাগতম!', '📸');
                    }}
                  />
                </div>
              </div>
            )}

            {filteredServices.length === 0 && !isElectionSearchMatch && !isJobPhotoSearchMatch ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">কোনো ফলাফল পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500">
                  অন্য কোনো শব্দ বা ইংরেজি/বাংলা নাম দিয়ে চেষ্টা করুন। যেমন: NID, পাসপোর্ট, BRTA বা Bdjobs।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilterTab('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition hover:bg-slate-800 cursor-pointer"
                >
                  সকল সেবা দেখুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isFavorite={favorites.includes(service.id)}
                    copiedId={copiedId}
                    onToggleFavorite={(e) => toggleFavorite(service.id, service.name, e)}
                    onCopyLink={(e) => handleCopyLink(service, e)}
                    onVisit={() => handleVisitService(service)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : selectedCategoryId && activeCategory ? (
          /* View Branch 2: Single Category Directory View */
          <div className="space-y-6">
            {/* Category Breadcrumb & Banner */}
            <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-lg bg-gradient-to-r ${activeCategory.gradient} relative overflow-hidden`}>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-bold transition cursor-pointer mb-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>সকল ক্যাটাগরিতে ফিরে যান</span>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                      {renderCategoryIcon(activeCategory.icon, 'w-7 h-7 text-white')}
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                        {activeCategory.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 font-medium">
                        {activeCategory.englishName}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed pt-1">
                    {activeCategory.description}
                  </p>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 border-white/20 pt-3 md:pt-0">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
                    মোট {toBanglaNum(filteredServices.length)}টি সেবা
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-md transition cursor-pointer"
                  >
                    অন্যান্য ক্যাটাগরি
                  </button>
                </div>
              </div>
            </div>

            {/* If Category is NID / Birth, feature the Election Commission Office Card */}
            {activeCategory.id === 'nid-birth' && (
              <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl border-2 border-emerald-300 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <h3 className="text-sm sm:text-base font-extrabold text-emerald-950">
                      বাংলাদেশ নির্বাচন কমিশন — এনআইডি ও ভোটার সহকারী ডেস্ক
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto shadow-2xs">
                    ১২টি অনলাইন সেবা সক্রিয়
                  </span>
                </div>
                <div className="max-w-sm sm:max-w-md">
                  <ElectionOfficeCard
                    onStart={() => {
                      setActiveSubView('election-commission');
                      onShowToast?.('বাংলাদেশ নির্বাচন কমিশন সেবায় আপনাকে স্বাগতম!', '🗳️');
                    }}
                  />
                </div>
              </div>
            )}

            {/* If Category is Online Jobs, feature the Teletalk Photo & Signature Resizer Card */}
            {activeCategory.id === 'online-jobs' && (
              <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-50 via-pink-50 to-white rounded-3xl border-2 border-rose-300 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                    <h3 className="text-sm sm:text-base font-extrabold text-rose-950">
                      টেলিটক সরকারি চাকরির আবেদন ছবি ও স্বাক্ষর প্রস্তুতকারী
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-white px-3 py-1 rounded-full border border-rose-200 self-start sm:self-auto shadow-2xs">
                    ৩০০×৩০০ ও ৩০০×৮০ সাইজার
                  </span>
                </div>
                <div className="max-w-sm sm:max-w-md">
                  <JobPhotoResizerCard
                    onStart={() => {
                      setActiveSubView('job-photo-resizer');
                      onShowToast?.('টেলিটক চাকরির ছবি ও স্বাক্ষর সাইজারে স্বাগতম!', '📸');
                    }}
                  />
                </div>
              </div>
            )}

            {/* Service Cards Grid for Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isFavorite={favorites.includes(service.id)}
                  copiedId={copiedId}
                  onToggleFavorite={(e) => toggleFavorite(service.id, service.name, e)}
                  onCopyLink={(e) => handleCopyLink(service, e)}
                  onVisit={() => handleVisitService(service)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* View Branch 3: All 13 Categories Overview Grid */
          <div className="space-y-8">
            {/* Dedicated Government Office & Career Tools Feature Section */}
            <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 rounded-3xl p-5 sm:p-6 border-2 border-emerald-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      সরকারি অফিস ও ক্যারিয়ার সেবা হাব • নির্বাচন অফিস, টেলিটক ও জবস পোর্টাল
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    বাংলাদেশ নির্বাচন কমিশনের এনআইডি সহকারী, টেলিটক চাকরির ছবি-স্বাক্ষর সাইজার এবং শীর্ষ চাকরির পোর্টালসমূহ
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto shadow-2xs">
                  সরাসরি ইন্টিগ্রেটেড সেবা
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. Exact Election Commission Office Card from Screenshot 2 */}
                <ElectionOfficeCard
                  onStart={() => {
                    setActiveSubView('election-commission');
                    onShowToast?.('বাংলাদেশ নির্বাচন কমিশন সেবায় আপনাকে স্বাগতম!', '🗳️');
                  }}
                />

                {/* 2. Exact Teletalk Job Photo & Signature Resizer Card */}
                <JobPhotoResizerCard
                  onStart={() => {
                    setActiveSubView('job-photo-resizer');
                    onShowToast?.('টেলিটক চাকরির ছবি ও স্বাক্ষর সাইজারে স্বাগতম!', '📸');
                  }}
                />

                {/* 3. Online Jobs Portal Card (Exact user request) */}
                <OnlineJobsPortalCard
                  onStart={() => {
                    setSelectedCategoryId('online-jobs');
                    onShowToast?.('অনলাইন জবস পোর্টালে আপনাকে স্বাগতম!', '💼');
                  }}
                />
              </div>
            </div>

            {/* Categories Title */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <span>সেবা ক্যাটাগরি ব্রাউজ করুন</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    নির্দিষ্ট বিষয়ের ওপর ক্লিক করে সংশ্লিষ্ট সকল ওয়েবসাইট ও অনলাইন সেবা দেখুন
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {toBanglaNum(BD_SERVICE_CATEGORIES.length)}টি মূল বিভাগ
                </span>
              </div>

              {/* Categories Grid (Fullscreen Responsive) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-5">
                {BD_SERVICE_CATEGORIES.map((cat, index) => {
                  const count = categoryCounts[cat.id] || 0;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`group cursor-pointer bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-xl hover:border-indigo-300 transition duration-200 flex flex-col justify-between active:scale-[0.98] relative overflow-hidden ${
                        cat.isJobPortal ? 'ring-2 ring-indigo-500/30' : ''
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition`}
                          >
                            {renderCategoryIcon(cat.icon, 'w-6 h-6 text-white')}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              cat.isJobPortal
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {cat.badge}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-400">
                              {toBanglaNum(index + 1)}.
                            </span>
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                              {cat.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {cat.englishName}
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-indigo-600">
                        <span className="bg-slate-50 group-hover:bg-indigo-50 px-2 py-0.5 rounded-lg text-[11px]">
                          {toBanglaNum(count)}টি সেবা তালিকাভুক্ত
                        </span>
                        <span className="flex items-center gap-0.5">
                          <span>প্রবেশ করুন</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Favorites Section (if user has any bookmarked) */}
            {favorites.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>আপনার প্রিয় সেবাগুলো (Quick Access)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveFilterTab('favorites')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    সকল প্রিয় সেবা ({toBanglaNum(favorites.length)}) →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BD_SERVICES_DATA.filter((s) => favorites.includes(s.id))
                    .slice(0, 3)
                    .map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        isFavorite={true}
                        copiedId={copiedId}
                        onToggleFavorite={(e) => toggleFavorite(service.id, service.name, e)}
                        onCopyLink={(e) => handleCopyLink(service, e)}
                        onVisit={() => handleVisitService(service)}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Info Notice */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">
            The MoSaFa BD Online Portal • সর্বজনীন নাগরিক ও ডিজিটাল সেবা সহায়িকা
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            এই পোর্টালটি শুধুমাত্র ব্যবহারকারীদের সুবিধার্থে অফিসিয়াল সরকারি ও শীর্ষস্থানীয় বেসরকারি সাইটসমূহের সমন্বিত লিংক ও তথ্য প্রদান করে। সকল বাহ্যিক সেবা সংশ্লিষ্ট প্রতিষ্ঠানের নিজস্ব স্বত্ত্বাধিকার ও নীতিমালা অনুযায়ী পরিচালিত হয়।
          </p>
        </div>
      </footer>
    </div>
  );
};

// Reusable Clean Service Card Component
interface ServiceCardProps {
  service: BdServiceItem;
  isFavorite: boolean;
  copiedId: string | null;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onCopyLink: (e: React.MouseEvent) => void;
  onVisit: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isFavorite,
  copiedId,
  onToggleFavorite,
  onCopyLink,
  onVisit,
}) => {
  const [imgError, setImgError] = useState(false);

  // Derive initial monogram
  const monogram = service.englishName ? service.englishName.slice(0, 2).toUpperCase() : 'BD';

  return (
    <div
      onClick={onVisit}
      className="group cursor-pointer bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-300 transition duration-200 flex flex-col justify-between active:scale-[0.99] relative"
    >
      <div className="space-y-3">
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {service.isGov ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                <span>🏛️</span>
                <span>সরকারি পোর্টাল</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold flex items-center gap-1">
                <span>🏢</span>
                <span>বেসরকারি সেবা</span>
              </span>
            )}
            {service.badge && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold">
                {service.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Copy Link */}
            <button
              type="button"
              onClick={onCopyLink}
              title="ওয়েবসাইট লিংক কপি করুন"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {copiedId === service.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Favorite Bookmark */}
            <button
              type="button"
              onClick={onToggleFavorite}
              title={isFavorite ? 'ফেভারিট থেকে সরান' : 'ফেভারিটে যোগ করুন'}
              className="p-1.5 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition cursor-pointer"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Logo / Monogram & Institution */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs group-hover:scale-105 transition">
            {service.logoUrl && !imgError ? (
              <img
                src={service.logoUrl}
                alt={service.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            ) : (
              <span className="text-xs font-black text-slate-700 tracking-wider">
                {monogram}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              {service.institution}
            </span>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition leading-snug line-clamp-1">
              {service.name}
            </h4>
            <span className="text-[10px] text-slate-400 block truncate font-mono">
              {service.englishName}
            </span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {service.description}
        </p>
      </div>

      {/* Bottom Button / External Link */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[170px] sm:max-w-[200px]">
          {service.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
        </span>
        <button
          type="button"
          onClick={onVisit}
          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white group-hover:bg-emerald-600 transition font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
        >
          <span>ভিজিট করুন</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

interface ElectionOfficeCardProps {
  onStart: () => void;
  className?: string;
}

const ElectionOfficeCard: React.FC<ElectionOfficeCardProps> = ({ onStart, className = '' }) => {
  return (
    <div
      onClick={onStart}
      className={`group relative bg-white rounded-3xl border-2 border-emerald-500/80 ring-2 ring-emerald-100 hover:border-emerald-600 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      {/* Active Status Badge in Top-Right */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>সক্রিয় সেবা</span>
        </span>
      </div>

      {/* Top Office Number / Line Indicator */}
      <div className="absolute top-3.5 left-4 z-10">
        <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
          #১
        </span>
      </div>

      {/* 1. TOP PORTION: BIG LOGO (EXACT USER DRAWING & SCREENSHOT 2) */}
      <div className="h-44 sm:h-48 w-full bg-gradient-to-b from-slate-50/90 to-slate-100/60 flex flex-col items-center justify-center p-6 relative group-hover:from-white group-hover:to-slate-50 transition-colors">
        <div className="transform transition-transform duration-300 group-hover:scale-110">
          <GovOfficeLogo officeId="election-commission" size="lg" />
        </div>
      </div>

      {/* HORIZONTAL DIVIDING BORDER (AS DRAWN IN USER SKETCH) */}
      <div className="w-full border-t-2 border-slate-200 group-hover:border-slate-300 transition-colors" />

      {/* 2. BOTTOM PORTION: OFFICE NAME (EXACT MATCH TO SCREENSHOT 2) */}
      <div className="p-4 sm:p-5 bg-white flex flex-col justify-between flex-1 text-center">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">
            নির্বাচন অফিস
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            বাংলাদেশ নির্বাচন কমিশন
          </p>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            জাতীয় পরিচয়পত্র (NID) সংশোধন, ভোটার এলাকার স্থানান্তর, নতুন ভোটার নিবন্ধন, হারানো কার্ড রিশ্যিউ এবং নির্বাচন কমিশনের সকল বিধিমালা ও তথ্য সহকারী।
          </p>
        </div>

        {/* Action button bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Phone className="w-3 h-3 text-rose-500" />
            <span>১০৫ (টোল ফ্রি)</span>
          </span>

          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
            <span>সেবা শুরু করুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

interface JobPhotoResizerCardProps {
  onStart: () => void;
  className?: string;
}

const JobPhotoResizerCard: React.FC<JobPhotoResizerCardProps> = ({ onStart, className = '' }) => {
  return (
    <div
      onClick={onStart}
      className={`group relative bg-white rounded-3xl border-2 border-rose-500/80 ring-2 ring-rose-100 hover:border-rose-600 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      {/* Active Status Badge in Top-Right */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-rose-600 text-white px-2.5 py-1 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>সক্রিয় টুল</span>
        </span>
      </div>

      {/* Top Number / Indicator */}
      <div className="absolute top-3.5 left-4 z-10">
        <span className="text-[11px] font-mono font-bold text-rose-800 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
          #২
        </span>
      </div>

      {/* 1. TOP PORTION: PROMINENT CAMERA & DIMENSIONS BADGE */}
      <div className="h-44 sm:h-48 w-full bg-gradient-to-b from-rose-50/90 to-rose-100/60 flex flex-col items-center justify-center p-6 relative group-hover:from-white group-hover:to-rose-50 transition-colors">
        <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-indigo-600 text-white flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
          <Camera className="w-9 h-9" />
        </div>
        <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-[10px] font-mono font-black bg-white text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs">
            ৩০০×৩০০ px (১০০ KB)
          </span>
          <span className="text-[10px] font-mono font-black bg-white text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
            ৩০০×৮০ px (৬০ KB)
          </span>
        </div>
      </div>

      {/* HORIZONTAL DIVIDING BORDER */}
      <div className="w-full border-t-2 border-slate-200 group-hover:border-slate-300 transition-colors" />

      {/* 2. BOTTOM PORTION: TITLE & DETAILS */}
      <div className="p-4 sm:p-5 bg-white flex flex-col justify-between flex-1 text-center">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors tracking-tight">
            টেলিটক চাকরির ছবি ও স্বাক্ষর
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            সরকারি চাকরির আবেদন ফটো ও সিগনেচার সাইজার
          </p>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            টেলিটক ও সরকারি চাকরির আবেদনের ছবি (৩০০×৩০০ px) ও স্বাক্ষর (৩০০×৮০ px) ১-ক্লিকে সঠিক সাইজ ও কেবিতে প্রস্তুত ও সরাসরি ডাউনলোড।
          </p>
        </div>

        {/* Action button bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>টেলিটক ভেরিফাইড</span>
          </span>

          <span className="inline-flex items-center gap-1 font-bold text-rose-700 group-hover:translate-x-0.5 transition-transform">
            <span>সাইজ শুরু করুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

interface OnlineJobsPortalCardProps {
  onStart: () => void;
  className?: string;
}

const OnlineJobsPortalCard: React.FC<OnlineJobsPortalCardProps> = ({ onStart, className = '' }) => {
  return (
    <div
      onClick={onStart}
      className={`group relative bg-white rounded-3xl border-2 border-indigo-500/80 ring-2 ring-indigo-100 hover:border-indigo-600 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${className}`}
    >
      {/* Active Status Badge in Top-Right */}
      <div className="absolute top-3.5 right-3.5 z-10">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-1 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
          <span>১৫টি জব পোর্টাল</span>
        </span>
      </div>

      {/* Top Number / Indicator */}
      <div className="absolute top-3.5 left-4 z-10">
        <span className="text-[11px] font-mono font-bold text-indigo-800 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
          #৩
        </span>
      </div>

      {/* 1. TOP PORTION: PROMINENT BRIEFCASE & JOBS BADGES */}
      <div className="h-44 sm:h-48 w-full bg-gradient-to-b from-blue-50/90 to-indigo-100/60 flex flex-col items-center justify-center p-6 relative group-hover:from-white group-hover:to-blue-50 transition-colors">
        <div className="w-18 h-18 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
          <Briefcase className="w-9 h-9 text-yellow-300" />
        </div>
        <div className="mt-3 flex items-center gap-1.5 flex-wrap justify-center">
          <span className="text-[10px] font-mono font-black bg-white text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
            বিসিএস ও সরকারি চাকরি
          </span>
          <span className="text-[10px] font-mono font-black bg-white text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
            ব্যাংক ও নিয়োগ পোর্টাল
          </span>
        </div>
      </div>

      {/* HORIZONTAL DIVIDING BORDER */}
      <div className="w-full border-t-2 border-slate-200 group-hover:border-slate-300 transition-colors" />

      {/* 2. BOTTOM PORTION: TITLE & DETAILS */}
      <div className="p-4 sm:p-5 bg-white flex flex-col justify-between flex-1 text-center">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
            অনলাইন জবস পোর্টাল
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Online Jobs Portal • চাকরির সকল ওয়েবসাইট
          </p>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            Bdjobs, Chakri.com, বিপিএসসি (BPSC), AllJobs Teletalk, বাংলাদেশ ব্যাংক ও সকল নির্ভরযোগ্য নিয়োগ পোর্টাল এক ক্লিকে।
          </p>
        </div>

        {/* Action button bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>১৫টি চাকরি ওয়েবসাইট</span>
          </span>

          <span className="inline-flex items-center gap-1 font-bold text-indigo-700 group-hover:translate-x-0.5 transition-transform">
            <span>জব পোর্টাল খুলুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};

