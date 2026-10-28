import React, { useState, useEffect } from 'react';
import {
  Heart,
  Keyboard,
  Calendar,
  FileText,
  Coins,
  Sparkles,
  MessageSquareHeart,
  Search,
  CheckCircle,
  Zap,
  Lock,
  Smartphone,
  Palette,
  Compass,
  Users,
  RotateCw,
  Brain,
  Wallet,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BloggerGuideModal } from './components/BloggerGuideModal';
import { FloatingParticles } from './components/FloatingParticles';

// Existing 7 Tools
import { LoveTest } from './components/LoveTest';
import { TypingTest } from './components/TypingTest';
import { AgeCalculator } from './components/AgeCalculator';
import { CoinToss } from './components/CoinToss';
import { QuickLove } from './components/QuickLove';
import { BanglaStatusHub } from './components/BanglaStatusHub';

// 8 New Tools
import { PosterStudio } from './components/PosterStudio';
import { LifeJourney } from './components/LifeJourney';
import { FamilyTree } from './components/FamilyTree';
import { RandomPickerWheel } from './components/RandomPickerWheel';
import { BanglaQuiz } from './components/BanglaQuiz';
import { DailyHishab } from './components/DailyHishab';
import { LifeReceipt } from './components/LifeReceipt';
import { PersonalityReveal } from './components/PersonalityReveal';
import { NameReveal } from './components/NameReveal';

export type ToolId =
  | 'love-test'
  | 'typing-test'
  | 'age-calc'
  | 'decision-maker'
  | 'love-calc'
  | 'bangla-status'
  | 'poster-studio'
  | 'life-journey'
  | 'family-tree'
  | 'random-picker'
  | 'bangla-quiz'
  | 'daily-hishab'
  | 'life-receipt'
  | 'personality-reveal'
  | 'name-reveal'
  | null;

export interface ToolCardInfo {
  id: ToolId;
  title: string;
  badge: string;
  badgeColor: string;
  category: 'entertainment' | 'typing' | 'calculator' | 'status';
  iconBg: string;
  icon: React.ReactNode;
  description: string;
  deviceTag?: string;
  keywords: string[];
}

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIcon, setToastIcon] = useState<string>('📋');

  // Read URL query parameters on mount and handle history popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get('tool') as ToolId;
      setActiveTool(toolParam);
      window.scrollTo(0, 0);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateToTool = (tool: ToolId) => {
    const newUrl = tool ? `?tool=${tool}` : window.location.pathname;
    window.history.pushState({ tool }, '', newUrl);
    setActiveTool(tool);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message: string, icon = '📋') => {
    setToastMessage(message);
    setToastIcon(icon);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 15 Complete Tools Registry
  const tools: ToolCardInfo[] = [
    // 1. প্রেম টেস্ট
    {
      id: 'love-test',
      title: 'প্রেম টেস্ট (Love Test)',
      badge: '🔥 ভাইরাল টেস্ট',
      badgeColor: 'bg-rose-50 text-rose-600 border-rose-200',
      category: 'entertainment',
      iconBg: 'from-rose-500 to-pink-600',
      icon: <Heart className="w-6 h-6 fill-white text-white" />,
      description:
        'দুজনের বয়স, গায়ের রং, পারিবারিক সম্মতি, বাস্তব প্রশ্ন ও স্বভাব যাচাই করে সম্পর্কের গভীরতা ও ভবিষ্যৎ উদ্দেশ্য নির্ণয় করুন। সনদপত্র ডাউনলোড সুবিধা সহ!',
      deviceTag: '📱💻 কম্পিউটার + মোবাইল ভার্সন',
      keywords: ['প্রেম টেস্ট', 'love test', 'সম্পর্ক', 'ভালোবাসা', 'বিবাহ', 'বিচ্ছেদ', 'পরীক্ষা'],
    },
    // 2. লিপি টাইপিং টেস্ট
    {
      id: 'typing-test',
      title: 'লিপি টাইপিং টেস্ট (Typing Speed)',
      badge: '⚡ স্পিড টেস্ট',
      badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      category: 'typing',
      iconBg: 'from-indigo-600 to-blue-600',
      icon: <Keyboard className="w-6 h-6 text-white" />,
      description:
        '১ মিনিটে বাংলা টাইপিংয়ের গতি ও নির্ভুলতা পরীক্ষা করুন। লাইভ WPM, CPM ও সঠিকতার হিসাবসহ তাৎক্ষণিক ফলাফল ও অ্যানালিটিক্স।',
      deviceTag: '💻 শুধু কম্পিউটার / ল্যাপটপ',
      keywords: ['টাইপিং টেস্ট', 'typing speed test', 'বাংলা টাইপিং', 'wpm', 'cpm', 'লিপি টাইপিং'],
    },
    // 3. বয়স ক্যালকুলেটর
    {
      id: 'age-calc',
      title: 'বয়স ক্যালকুলেটর (Age Calculator)',
      badge: '📅 নিখুঁত হিসাব',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      category: 'calculator',
      iconBg: 'from-emerald-500 to-teal-600',
      icon: <Calendar className="w-6 h-6 text-white" />,
      description:
        'জন্মতারিখ নির্বাচন করে এক ক্লিকে বের করুন আপনার বর্তমান বয়স — বছর, মাস, দিন, মোট সপ্তাহ, এবং আগামী জন্মদিনের কাউন্টডাউন।',
      keywords: ['বয়স ক্যালকুলেটর', 'age calculator', 'জন্ম তারিখ', 'হিসাব', 'দিন', 'মাস', 'বছর'],
    },
    // 4. কয়েন টস ও সিদ্ধান্ত
    {
      id: 'decision-maker',
      title: 'কয়েন টস ও সিদ্ধান্ত (Coin Toss)',
      badge: '🪙 ৩ডি টস',
      badgeColor: 'bg-purple-50 text-purple-600 border-purple-200',
      category: 'calculator',
      iconBg: 'from-purple-600 to-violet-600',
      icon: <Coins className="w-6 h-6 text-white" />,
      description:
        'যেকোনো দ্বিধাদ্বন্দ্বে হেড বা টেল টস করুন। আসল মুদ্রার মতো বাস্তবসম্মত ৩D ঘূর্ণন ও রুদ্ধশ্বাস স্পিন অ্যানিমেশন সহ!',
      keywords: ['কয়েন টস', 'coin toss', 'decision maker', 'র‍্যান্ডম সিদ্ধান্ত', 'হেড টেল'],
    },
    // 6. কুইক লাভ পারসেন্টেজ
    {
      id: 'love-calc',
      title: 'কুইক লাভ পারসেন্টেজ (Love %)',
      badge: '💖 ইনস্ট্যান্ট স্কোর',
      badgeColor: 'bg-pink-50 text-pink-600 border-pink-200',
      category: 'entertainment',
      iconBg: 'from-pink-500 to-rose-600',
      icon: <Sparkles className="w-6 h-6 text-white" />,
      description:
        'দুজনের নাম লিখে এক ক্লিকে ভালোবাসার শতকরা হার বের করুন। বন্ধুদের সাথে শেয়ার করার জন্য মজার লাভ মিটার স্কোর ও অ্যানিমেশন।',
      keywords: ['লাভ পারসেন্টেজ', 'love percentage calculator', 'ভালোবাসার হার', 'শতাংশ'],
    },
    // 7. বাংলা স্ট্যাটাস ও ক্যাপশন হাব
    {
      id: 'bangla-status',
      title: 'বাংলা স্ট্যাটাস ও ক্যাপশন হাব',
      badge: '💬 ১০০০+ স্ট্যাটাস',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
      category: 'status',
      iconBg: 'from-violet-600 to-purple-600',
      icon: <MessageSquareHeart className="w-6 h-6 text-white" />,
      description:
        'ভালোবাসা, কষ্ট, ইসলামিক, বন্ধুত্ব, এটিটিউড, মোটিভেশন ও ফানি সহ ১০টি ক্যাটাগরির ১০০০+ সেরা বাংলা ক্যাপশন কালেকশন ও ফটো কার্ড মেকার।',
      keywords: ['বাংলা স্ট্যাটাস', 'ক্যাপশন', 'bangla status', 'quotes', 'caption', 'ভালোবাসা', 'কষ্ট'],
    },
    // 8. MoSaFa Poster Studio (NEW)
    {
      id: 'poster-studio',
      title: 'MoSaFa Poster Studio (পোস্টার স্টুডিও)',
      badge: '🎨 পোস্টার ও মিম',
      badgeColor: 'bg-rose-50 text-rose-600 border-rose-200',
      category: 'status',
      iconBg: 'from-rose-500 to-pink-600',
      icon: <Palette className="w-6 h-6 text-white" />,
      description:
        'নিউজ স্টাইল পোস্টার, কোটেশন, ব্যানার, স্লোগান ও ফ্রেন্ড মিম তৈরির ব্রাউজার-বেসড ক্রিয়েটিভ স্টুডিও ও PNG এক্সপোর্ট।',
      keywords: ['পোস্টার', 'poster studio', 'মিম', 'meme', 'ব্যানার', 'নিউজ পোস্টার', 'ছবি'],
    },
    // 9. MoSaFa Life Journey (NEW)
    {
      id: 'life-journey',
      title: 'MoSaFa Life Journey (জীবন ও ফোন জার্নি)',
      badge: '⏳ টাইমলাইন',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      category: 'calculator',
      iconBg: 'from-cyan-500 to-blue-600',
      icon: <Compass className="w-6 h-6 text-white" />,
      description:
        'ব্যক্তিগত জীবনের সকল স্মরণীয় মাইলফলক ও আজ পর্যন্ত ব্যবহৃত মোবাইল ফোনের ক্রমবিকাশের ভিজ্যুয়াল টাইমলাইন ও কার্ড।',
      keywords: ['life journey', 'ফোন জার্নি', 'টাইমলাইন', 'স্মৃতি', 'মোবাইল ইতিহাস', 'মাইলফলক'],
    },
    // 10. Family Tree Builder (NEW)
    {
      id: 'family-tree',
      title: 'Family Tree Builder (পারিবারিক বংশলতিকা)',
      badge: '🌳 বংশবৃক্ষ',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      category: 'entertainment',
      iconBg: 'from-emerald-500 to-teal-600',
      icon: <Users className="w-6 h-6 text-white" />,
      description:
        'দাদা-দাদী থেকে শুরু করে পরবর্তী প্রজন্মের সকল সদস্যের সম্পর্ক যুক্ত করে সুন্দর পারিবারিক বংশবৃক্ষ তৈরি ও প্রিন্ট করুন।',
      keywords: ['family tree', 'বংশলতিকা', 'বংশবৃক্ষ', 'পরিবার', 'আত্মীয়স্বজন', 'দাদা', 'বাবা'],
    },
    // 11. Random Picker Wheel (NEW)
    {
      id: 'random-picker',
      title: 'Random Picker Wheel (সিদ্ধান্ত চাকা)',
      badge: '🎡 লাকি হুইল',
      badgeColor: 'bg-purple-50 text-purple-600 border-purple-200',
      category: 'calculator',
      iconBg: 'from-purple-600 to-pink-600',
      icon: <RotateCw className="w-6 h-6 text-white" />,
      description:
        'খাবার পছন্দ, ভ্রমণ বা যেকোনো দ্বিধাদ্বন্দ্বে কাস্টমাইজড চাকা ঘুরিয়ে শতভাগ নিরপেক্ষ ও র‍্যান্ডম সিদ্ধান্ত নিন।',
      keywords: ['random picker', 'wheel', 'চাকা', 'র‍্যান্ডম', 'সিদ্ধান্ত', 'হুইল', 'স্পিন'],
    },
    // 12. Bangla Riddles & Quiz Challenge (NEW)
    {
      id: 'bangla-quiz',
      title: 'Bangla Riddles & Quiz (ধাঁধা ও কুইজ)',
      badge: '🧩 বুদ্ধিদীপ্ত কুইজ',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      category: 'entertainment',
      iconBg: 'from-amber-500 to-orange-600',
      icon: <Brain className="w-6 h-6 text-white" />,
      description:
        'মজার বাংলা ধাঁধা, সাধারণ জ্ঞান, সাহিত্য ও বিজ্ঞানের কুইজ চ্যালেঞ্জ। তাৎক্ষণিক ব্যাখ্যা ও স্কোর শেয়ার সুবিধা।',
      keywords: ['ধাঁধা', 'quiz', 'কুইজ', 'সাধারণ জ্ঞান', 'আইকিউ', 'বাংলা কুইজ', 'সাহিত্য'],
    },
    // 13. Daily Hishab (NEW)
    {
      id: 'daily-hishab',
      title: 'Daily Hishab (ডেইলি হিসাব ট্র্যাকার)',
      badge: '৳ বাজেট ও আয়-ব্যয়',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      category: 'calculator',
      iconBg: 'from-emerald-600 to-green-700',
      icon: <Wallet className="w-6 h-6 text-white" />,
      description:
        'প্রতিদিনের আয়-ব্যয় হিসাব রাখুন বাংলাদেশী টাকায় (৳)। ব্যালেন্স সামারি, ক্যাটাগরি ফিল্টার ও CSV এক্সপোর্ট।',
      keywords: ['daily hishab', 'হিসাব', 'আয় ব্যয়', 'টাকা', 'বাজেট', 'ব্যালেন্স', 'খরচ'],
    },
    // 14. MoSaFa Life Receipt (NEW)
    {
      id: 'life-receipt',
      title: 'MoSaFa Life Receipt (জীবন হিসাব রশিদ)',
      badge: '🧾 সময় রিসিট',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      category: 'calculator',
      iconBg: 'from-slate-700 to-indigo-800',
      icon: <Receipt className="w-6 h-6 text-white" />,
      description:
        'ঘুম, মোবাইল ব্যবহার, কাজ ও অবসরে জীবনের কত বছর পার করেছেন? তৈরি করুন ডিজিটাল মেমো ও রিসিট কার্ড।',
      keywords: ['life receipt', 'রশিদ', 'জীবন হিসাব', 'মেমো', 'সময় ব্যয়', 'বয়স হিসাব'],
    },
    // 15. MoSaFa Personality Reveal (NEW)
    {
      id: 'personality-reveal',
      title: 'MoSaFa Personality Reveal (ব্যক্তিত্ব উন্মোচন)',
      badge: '🌟 ব্যক্তিত্ব টেস্ট',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      category: 'entertainment',
      iconBg: 'from-indigo-600 to-violet-700',
      icon: <UserCheck className="w-6 h-6 text-white" />,
      description:
        '১০টি মনস্তাত্ত্বিক প্রশ্নে জেনে নিন আপনার আসল ব্যক্তিত্ব, শক্তি ও সম্ভাবনা। গোপনীয়তা সহ রেজাল্ট কার্ড ডাউনলোড।',
      keywords: ['personality', 'ব্যক্তিত্ব', 'টেস্ট', 'মনস্তত্ত্ব', 'চরিত্র', 'স্বভাব'],
    },
    // 16. MoSaFa Name Reveal (NEW)
    {
      id: 'name-reveal',
      title: 'MoSaFa Name Reveal (নামের গোপন গল্প)',
      badge: '🔮 নাম ও ব্যক্তিত্ব',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      category: 'entertainment',
      iconBg: 'from-blue-600 via-indigo-600 to-purple-600',
      icon: <Sparkles className="w-6 h-6 text-white" />,
      description:
        'নিজের নামের অর্থ, উৎস, রাশি, ব্যক্তিত্ব ও ভবিষ্যৎ সম্ভাবনা জানুন ৪টি সহজ অধ্যায়ে। আকর্ষণীয় ফলাফল কার্ড তৈরি ও শেয়ার করুন।',
      keywords: ['name reveal', 'নামের গোপন গল্প', 'নামের অর্থ', 'রাশি', 'নাম', 'ব্যক্তিত্ব', 'ভবিষ্যৎ'],
    },
  ];

  // Filter tools by category and search query
  const filteredTools = tools.filter((tool) => {
    const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  // Render standalone view if tool is selected
  // Original 7 tools:
  if (activeTool === 'love-test') {
    return <LoveTest onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'typing-test') {
    return <TypingTest onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'age-calc') {
    return <AgeCalculator onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'decision-maker') {
    return <CoinToss onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'love-calc') {
    return <QuickLove onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'bangla-status') {
    return <BanglaStatusHub onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }

  // 8 New tools:
  if (activeTool === 'poster-studio') {
    return <PosterStudio onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'life-journey') {
    return <LifeJourney onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'family-tree') {
    return <FamilyTree onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'random-picker') {
    return <RandomPickerWheel onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'bangla-quiz') {
    return <BanglaQuiz onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'daily-hishab') {
    return <DailyHishab onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'life-receipt') {
    return <LifeReceipt onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'personality-reveal') {
    return <PersonalityReveal onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }
  if (activeTool === 'name-reveal') {
    return <NameReveal onBackToHub={() => navigateToTool(null)} onShowToast={showToast} />;
  }

  // Render Main Tools Hub View
  return (
    <div className="flex flex-col min-h-screen relative text-slate-800">
      <FloatingParticles />

      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onShowToast={showToast}
        onNavigateHome={() => navigateToTool(null)}
      />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-6 sm:pt-12 sm:pb-8 text-center w-full relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold mb-4">
          <span>✨ ১০০% ফ্রি ও বিজ্ঞাপনমুক্ত ইউটিলিটি</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>মোট ১৫টি দারুণ অনলাইন টুলস</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
          আপনার প্রয়োজনীয় সকল{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600">
            অনলাইন টুলস
          </span>{' '}
          এক জায়গায়
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl mx-auto">
          পোস্টার স্টুডিও, নামের গোপন গল্প, লাইফ জার্নি, ফ্যামিলি ট্রি, কুইজ, ডেইলি হিসাব ও প্রেম টেস্ট সহ ১৫টি প্রয়োজনীয় ডিজিটাল টুলস।
          যেকোনো টুলে ক্লিক করলেই তা সরাসরি চালু হবে এবং নির্বিঘ্নে কাজ করবে।
        </p>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto mt-6 relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim().toUpperCase() === 'ALL_OK_15') {
                  showToast('🔐 সিক্রেট কোড অ্যাক্টিভেটেড (ALL_OK_15): এই সংস্করণটি সম্পূর্ণ সুরক্ষিত ও সংরক্ষিত আছে!', '🛡️');
                }
              }}
              placeholder="টুল খুঁজুন... যেমন: নাম, পোস্টার, কুইজ, হিসাব, জার্নি, প্রেম, বয়স"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 shadow-md shadow-slate-100 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mt-5 text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            সকল টুলস (১৫টি)
          </button>
          <button
            onClick={() => setActiveCategory('entertainment')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeCategory === 'entertainment'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            ❤️ সম্পর্ক, পরিবার ও বিনোদন
          </button>
          <button
            onClick={() => setActiveCategory('status')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeCategory === 'status'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            💬 স্ট্যাটাস, পোস্টার ও ক্যাপশন
          </button>
          <button
            onClick={() => setActiveCategory('typing')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeCategory === 'typing'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            ⌨️ টাইপিং ও কন্টেন্ট
          </button>
          <button
            onClick={() => setActiveCategory('calculator')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeCategory === 'calculator'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            🔢 হিসাব, জার্নি ও ক্যালকুলেটর
          </button>
        </div>
      </section>

      {/* Tools Grid Section */}
      <main className="max-w-6xl mx-auto px-4 pb-16 w-full flex-1 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => navigateToTool(tool.id)}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md hover:shadow-xl hover:border-rose-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-tr ${tool.iconBg} group-hover:scale-110 transition shrink-0`}
                  >
                    {tool.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition">
                  {tool.title}
                </h3>
                {tool.deviceTag && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold">
                    <span>{tool.deviceTag}</span>
                  </div>
                )}
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{tool.description}</p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToTool(tool.id);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 text-center flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>টুল শুরু করুন 🚀</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Search Result State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <span className="text-4xl block mb-2">🔍</span>
            <h4 className="text-base font-bold text-slate-800">কোনো টুল পাওয়া যায়নি!</h4>
            <p className="text-xs text-slate-500 mt-1">
              অন্য কোনো নাম দিয়ে সার্চ করুন (যেমন: পোস্টার, কুইজ, হিসাব, জার্নি, প্রেম, বয়স)
            </p>
          </div>
        )}

        {/* Feature Highlights Bar */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-500 mb-1 flex items-center justify-center gap-1">
              <CheckCircle className="w-6 h-6 text-rose-500" />
              <span>১০০%</span>
            </div>
            <div className="text-xs font-bold text-slate-800">সম্পূর্ণ ফ্রি</div>
            <p className="text-[11px] text-slate-500 mt-0.5">কোনো সাবস্ক্রিপশন নেই</p>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-500 mb-1 flex items-center justify-center gap-1">
              <Zap className="w-6 h-6 text-indigo-500" />
              <span>দ্রুত</span>
            </div>
            <div className="text-xs font-bold text-slate-800">ইনস্ট্যান্ট লোডিং</div>
            <p className="text-[11px] text-slate-500 mt-0.5">হালকা ও অপটিমাইজড</p>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500 mb-1 flex items-center justify-center gap-1">
              <Lock className="w-6 h-6 text-emerald-500" />
              <span>নিরাপদ</span>
            </div>
            <div className="text-xs font-bold text-slate-800">ডাটা সেভ হয় না</div>
            <p className="text-[11px] text-slate-500 mt-0.5">সম্পূর্ণ ক্লায়েন্ট সাইড</p>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 mb-1 flex items-center justify-center gap-1">
              <Smartphone className="w-6 h-6 text-amber-500" />
              <span>রেসপনসিভ</span>
            </div>
            <div className="text-xs font-bold text-slate-800">মোবাইল ও পিসি</div>
            <p className="text-[11px] text-slate-500 mt-0.5">সব ডিভাইসে কাজ করে</p>
          </div>
        </div>
      </main>

      <Footer onOpenGuide={() => setIsGuideOpen(true)} onShowToast={showToast} />

      {/* Blogger Setup Guide Modal */}
      <BloggerGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300 pointer-events-none">
          <span>{toastIcon}</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
