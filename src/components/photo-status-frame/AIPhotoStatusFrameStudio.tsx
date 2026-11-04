import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Check,
  Copy,
  Share2,
  Download,
  RotateCw,
  ZoomIn,
  Move,
  Flame,
  Moon,
  Users,
  Heart,
  Home as HomeIcon,
  CloudRain,
  Crown,
  Compass,
  Trophy,
  Anchor,
  Smile,
  Cake,
  Globe,
  Briefcase,
  Edit3,
  RefreshCw,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  ChevronRight,
  Palette,
  Eye,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Search,
  Maximize2,
  Minimize2,
  Bot,
  ExternalLink,
} from 'lucide-react';
import {
  AspectRatio,
  FrameTemplate,
  PhotoTransform,
  PosterCustomization,
  StatusCategoryId,
  WritingTone,
  StatusLength,
} from './types';
import { STATUS_CATEGORIES, WRITING_TONES, FALLBACK_STATUS_BANK } from './statusCategoriesData';
import { FRAME_TEMPLATES } from './frameTemplatesData';
import { PosterCanvasRenderer, PosterRendererHandle } from './PosterCanvasRenderer';

interface AIPhotoStatusFrameStudioProps {
  onBackToClassic?: () => void;
  onBackToHub?: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const AIPhotoStatusFrameStudio: React.FC<AIPhotoStatusFrameStudioProps> = ({
  onBackToClassic,
  onBackToHub,
  onShowToast,
}) => {
  // Wizard active step (1 to 5)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  // Photo & Transformation
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [transform, setTransform] = useState<PhotoTransform>({
    zoom: 100,
    boxScale: 100,
    posX: 0,
    posY: 0,
    rotate: 0,
  });

  // Category & Status
  const [selectedCategory, setSelectedCategory] = useState<StatusCategoryId>('motivational');
  const [selectedTone, setSelectedTone] = useState<WritingTone>('motivational');
  const [statusLength, setStatusLength] = useState<StatusLength>('medium');
  const [generatedStatuses, setGeneratedStatuses] = useState<string[]>(
    FALLBACK_STATUS_BANK.motivational
  );
  const [selectedStatusIndex, setSelectedStatusIndex] = useState<number>(0);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  // Selected Frame Template & Search across all 100 frames
  const [frameSearchQuery, setFrameSearchQuery] = useState<string>('');
  const [selectedFrame, setSelectedFrame] = useState<FrameTemplate>(FRAME_TEMPLATES[0]);

  // ChatGPT prompt and import box state
  const [chatGptInputText, setChatGptInputText] = useState<string>('');
  const [showChatGptModal, setShowChatGptModal] = useState<boolean>(false);

  // Poster Customization (Initialized with Dr. Fakhruddin Ahmed style from Image 1)
  const [custom, setCustom] = useState<PosterCustomization>({
    statusText: 'দেশ ঠিক করতে এবং দেশে শান্তি ফিরিয়ে আনতে সময় লাগে মাত্র ৭দিন।',
    highlightText: 'মাত্র ৭দিন।',
    authorName: 'ফখরুদ্দীন আহমেদ',
    designation: 'তত্ত্বাবধায়ক সরকারের সাবেক প্রধান উপদেষ্টা',
    categoryBadge: '🇧🇩 জাতীয় নেতৃত্ব',
    watermark: 'MoSaFa Poster Studio',
    showAuthor: true,
    showDesignation: true,
    showCategoryBadge: true,
    showWatermark: true,
    showQuoteMarks: true,
    showBangladeshFlagBg: true,
    showDate: false,
    textOffsetX: 0,
    textOffsetY: 0,
    dateText: new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    fontSize: 34,
    textAlign: 'center',
    customFontFamily: "'Hind Siliguri', sans-serif",
  });

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const posterRef = useRef<PosterRendererHandle | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Category Icon resolver
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-4 h-4 text-amber-400" />;
      case 'Moon': return <Moon className="w-4 h-4 text-emerald-400" />;
      case 'Users': return <Users className="w-4 h-4 text-blue-400" />;
      case 'Heart': return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Home': return <HomeIcon className="w-4 h-4 text-indigo-400" />;
      case 'CloudRain': return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'Crown': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'Compass': return <Compass className="w-4 h-4 text-teal-400" />;
      case 'Trophy': return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'Anchor': return <Anchor className="w-4 h-4 text-blue-300" />;
      case 'Smile': return <Smile className="w-4 h-4 text-orange-400" />;
      case 'Cake': return <Cake className="w-4 h-4 text-pink-400" />;
      case 'Globe': return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4 text-sky-400" />;
      case 'Edit3': return <Edit3 className="w-4 h-4 text-purple-400" />;
      default: return <Sparkles className="w-4 h-4 text-rose-400" />;
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      onShowToast('অনুগ্রহ করে JPG, PNG বা WEBP ফরম্যাটের ছবি আপলোড করুন।', '⚠️');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUserPhoto(dataUrl);
      setTransform({ zoom: 100, posX: 0, posY: 0, rotate: 0 });
      onShowToast('ছবি সফলভাবে আপলোড হয়েছে! আপনার আসল ফেস অপরিবর্তিত থাকবে 📸✨', '✅');
      // Advance to step 2 automatically if user was on step 1
      if (activeStep === 1) {
        setActiveStep(2);
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Status Generator (Calls /api/photo-status/generate or smart fallback)
  const handleGenerateAIStatus = async (category: StatusCategoryId, tone: WritingTone) => {
    setIsGeneratingAI(true);
    onShowToast('AI আপনার ছবির মুড ও ক্যাটাগরি বিশ্লেষণ করে স্ট্যাটাস লিখছে... ✨', '🤖');

    try {
      const payload = {
        category,
        tone,
        length: statusLength,
        imageBase64: userPhoto || null,
        imageMimeType: 'image/jpeg',
      };

      const response = await fetch('/api/photo-status/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.statuses) && json.statuses.length > 0) {
          setGeneratedStatuses(json.statuses);
          setSelectedStatusIndex(0);
          setCustom((prev) => ({
            ...prev,
            statusText: json.statuses[0],
            categoryBadge: STATUS_CATEGORIES.find((c) => c.id === category)?.badge || prev.categoryBadge,
          }));
          onShowToast('৫টি নতুন চমৎকার বাংলা স্ট্যাটাস প্রস্তুত হয়েছে! 🎉', '✅');
          setIsGeneratingAI(false);
          return;
        }
      }
    } catch {
      // Offline fallback handling below
    }

    // High quality offline fallback
    const fallbackList = FALLBACK_STATUS_BANK[category] || FALLBACK_STATUS_BANK.motivational;
    setGeneratedStatuses(fallbackList);
    setSelectedStatusIndex(0);
    setCustom((prev) => ({
      ...prev,
      statusText: fallbackList[0],
      categoryBadge: STATUS_CATEGORIES.find((c) => c.id === category)?.badge || prev.categoryBadge,
    }));
    setIsGeneratingAI(false);
    onShowToast('নতুন স্ট্যাটাস লোড করা হয়েছে! ✨', '✅');
  };

  // Select a generated status
  const handleSelectStatus = (statusText: string, index: number) => {
    setSelectedStatusIndex(index);
    setCustom((prev) => ({ ...prev, statusText }));
    onShowToast('স্ট্যাটাস সিলেক্ট করা হয়েছে! ✍️', '✅');
  };

  // Switch Frame Template
  const handleSelectFrame = (frame: FrameTemplate) => {
    setSelectedFrame(frame);
    // Align customization defaults with frame recommendation
    setCustom((prev) => ({
      ...prev,
      textAlign: frame.defaultAlign || prev.textAlign,
      customFontFamily: frame.recommendedFont || prev.customFontFamily,
    }));
    onShowToast(`"${frame.nameBn}" ফ্রেমটি অ্যাপ্লাই করা হয়েছে! 🖼️✨`, '✨');
  };

  // Flagship Persona Presets (Direct 1-click styles matching user's reference images)
  const PERSONA_PRESETS = [
    {
      id: 'fakhruddin',
      nameBn: 'ড. ফখরুদ্দীন আহমেদ',
      titleBn: 'জাতীয় নেতৃত্ব ও সুশাসন (Image 1 স্টাইল)',
      tagline: 'বাংলাদেশের পতাকা ও বাঁকা কার্ভ ডিভাইডার, লাল কোটেশন ও গাঢ় নীল টেক্সট',
      category: 'motivational' as StatusCategoryId,
      tone: 'professional' as WritingTone,
      frameId: 'leader-curved-wave',
      statusText: 'দেশ ঠিক করতে এবং দেশে শান্তি ফিরিয়ে আনতে সময় লাগে মাত্র ৭দিন।',
      highlightText: 'মাত্র ৭দিন।',
      authorName: 'ফখরুদ্দীন আহমেদ',
      designation: 'তত্ত্বাবধায়ক সরকারের সাবেক প্রধান উপদেষ্টা',
      categoryBadge: '🇧🇩 জাতীয় নেতৃত্ব',
      showFlagBg: true,
      avatarIcon: '🇧🇩',
    },
    {
      id: 'ahmadullah',
      nameBn: 'শায়খ আহমাদুল্লাহ',
      titleBn: 'হোয়াইটবোর্ড মার্কার ও দাওয়া (Image 2 স্টাইল)',
      tagline: 'হোয়াইটবোর্ডে কালো মার্কার, লাল মার্কার পাঞ্চলাইন ও লাল আন্ডারলাইন',
      category: 'islamic' as StatusCategoryId,
      tone: 'islamic' as WritingTone,
      frameId: 'whiteboard-presenter',
      statusText: 'যে ব্যক্তি মানুষের কাছে বারবার হাত পাতে, আল্লাহ তা\'আলা তাকে অন্যের মুখাপেক্ষী করে দেন।',
      highlightText: 'আল্লাহ তা\'আলা তাকে অন্যের মুখাপেক্ষী করে দেন।',
      authorName: 'শায়খ আহমাদুল্লাহ হাফি.',
      designation: 'চেয়ারম্যান, আস-সুন্নাহ ফাউন্ডেশন',
      categoryBadge: '🕌 ইসলামিক জীবনদর্শন',
      showFlagBg: false,
      avatarIcon: '🕌',
    },
    {
      id: 'humayun',
      nameBn: 'হুমায়ূন আহমেদ',
      titleBn: 'অনুভূতি, স্মৃতি ও বৃষ্টি',
      tagline: 'বৃষ্টির ভেজা কাঁচের স্নিগ্ধ ব্যাকগ্রাউন্ডে গভীর অনুভূতির উক্তি',
      category: 'life' as StatusCategoryId,
      tone: 'emotional' as WritingTone,
      frameId: 'nature-rainy-window',
      statusText: 'কিছু কিছু মানুষ সত্যি খুব অদ্ভুত হয়। এরা দুঃখের দিনে হাসে, আর আনন্দের দিনে কাঁদে।',
      highlightText: 'দুঃখের দিনে হাসে',
      authorName: 'হুমায়ূন আহমেদ',
      designation: 'জনপ্রিয় কথাশিল্পী ও নির্মাতা',
      categoryBadge: '🌧️ বৃষ্টি ও অনুভূতি',
      showFlagBg: false,
      avatarIcon: '📚',
    },
    {
      id: 'kalam',
      nameBn: 'এপিজে আব্দুল কালাম',
      titleBn: 'স্বপ্ন, সংগ্রাম ও তারুণ্য',
      tagline: 'নাটকীয় চারকোল ও গোল্ডেন আলোয় অমর অনুপ্রেরণা',
      category: 'success' as StatusCategoryId,
      tone: 'motivational' as WritingTone,
      frameId: 'dramatic-black-gold',
      statusText: 'স্বপ্ন সেটা নয় যা তুমি ঘুমিয়ে দেখো, স্বপ্ন সেটাই যা তোমাকে ঘুমোতে দেয় না।',
      highlightText: 'ঘুমোতে দেয় না।',
      authorName: 'এ পি জে আব্দুল কালাম',
      designation: 'বিজ্ঞানী ও ভারতের সাবেক রাষ্ট্রপতি',
      categoryBadge: '🚀 স্বপ্ন ও সাধনা',
      showFlagBg: false,
      avatarIcon: '💡',
    },
    {
      id: 'yunus',
      nameBn: 'ড. মুহাম্মদ ইউনূস',
      titleBn: 'সামাজিক ব্যবসা ও বিশ্ব পরিবর্তন',
      tagline: 'কর্পোরেট ব্লু অ্যান্ড হোয়াইট মার্জিত ব্যাকড্রপ',
      category: 'professional' as StatusCategoryId,
      tone: 'professional' as WritingTone,
      frameId: 'corporate-blue-white',
      statusText: 'দারিদ্র্য মানুষের তৈরি, তাই মানুষই পারে একে চিরতরে দূর করে জাদুঘরে পাঠিয়ে দিতে।',
      highlightText: 'জাদুঘরে পাঠিয়ে দিতে।',
      authorName: 'ড. মুহাম্মদ ইউনূস',
      designation: 'নোবেল লরিয়েট ও প্রধান উপদেষ্টা',
      categoryBadge: '💼 বিশ্ব পরিবর্তন',
      showFlagBg: false,
      avatarIcon: '🌍',
    },
    {
      id: 'shakib',
      nameBn: 'সাকিব আল হাসান',
      titleBn: 'জেদ, আত্মবিশ্বাস ও বিজয়',
      tagline: 'লাল ও কালো বোল্ড আধুনিক স্পোর্টস টাইপোগ্রাফি',
      category: 'attitude' as StatusCategoryId,
      tone: 'stylish' as WritingTone,
      frameId: 'red-black-typography',
      statusText: 'কঠিন সময় চিরকাল থাকে না, কিন্তু যারা বুক চিতিয়ে লড়াই করে তারা সবসময় টিকে থাকে।',
      highlightText: 'লড়াই করে তারা সবসময় টিকে থাকে।',
      authorName: 'সাকিব আল হাসান',
      designation: 'বিশ্বসেরা অলরাউন্ডার ও অধিনায়ক',
      categoryBadge: '🏆 জেদ ও লড়াই',
      showFlagBg: false,
      avatarIcon: '⚡',
    },
  ];

  // Select Persona Preset
  const handleSelectPersona = (preset: typeof PERSONA_PRESETS[0]) => {
    setSelectedCategory(preset.category);
    setSelectedTone(preset.tone);

    const targetFrame = FRAME_TEMPLATES.find((f) => f.id === preset.frameId) || FRAME_TEMPLATES[0];
    setSelectedFrame(targetFrame);

    setCustom((prev) => ({
      ...prev,
      statusText: preset.statusText,
      highlightText: preset.highlightText,
      authorName: preset.authorName,
      designation: preset.designation,
      categoryBadge: preset.categoryBadge,
      showBangladeshFlagBg: preset.showFlagBg,
      showDesignation: Boolean(preset.designation),
      textAlign: targetFrame.defaultAlign || prev.textAlign,
      customFontFamily: targetFrame.recommendedFont || prev.customFontFamily,
    }));

    onShowToast(`"${preset.nameBn}" এর স্টাইল ও ফ্রেম সেট করা হয়েছে! 🌟`, '✨');
  };

  // Generate a ready-to-copy prompt for ChatGPT
  const generateChatGptPrompt = () => {
    return `তুমি একজন দক্ষ বাংলা লেখক ও সোশ্যাল মিডিয়া কনটেন্ট স্পেশালিস্ট।
বিষয় (Category): "${STATUS_CATEGORIES.find((c) => c.id === selectedCategory)?.nameBn || selectedCategory}"
লেখার ধরন (Tone): "${WRITING_TONES.find((t) => t.id === selectedTone)?.nameBn || selectedTone}"
দৈর্ঘ্য: "${statusLength === 'short' ? '১-২ লাইন (সংক্ষিপ্ত)' : statusLength === 'long' ? '৩-৪ লাইন (গভীর ও পূর্ণাঙ্গ)' : '২-৩ লাইন (মাঝারি)'}"
বক্তা/পরিচয়: "${custom.authorName || 'সাধারণ'}"

দয়া করে কোনো ভূমিকা বা অতিরিক্ত ভূমিকা না দিয়ে সরাসরি বাংলায় ৫টি আকর্ষণীয় ও হৃদয়স্পর্শী স্ট্যাটাস উক্তি লিখে দাও। প্রতিটি যেন ভিন্ন ভিন্ন আবেগ ও দৃষ্টি দিয়ে লেখা হয় এবং বানান শতভাগ নির্ভুল থাকে।`;
  };

  // 1-Click Copy Prompt for ChatGPT
  const handleCopyChatGptPrompt = async () => {
    const prompt = generateChatGptPrompt();
    try {
      await navigator.clipboard.writeText(prompt);
      onShowToast('ChatGPT-এর জন্য প্রম্পট কপি হয়েছে! আপনার ChatGPT অ্যাপ বা সাইটে পেস্ট করুন 🤖📋', '✅');
    } catch {
      onShowToast('প্রম্পট কপি করতে সমস্যা হয়েছে।', '⚠️');
    }
  };

  // Open ChatGPT web
  const handleOpenChatGpt = () => {
    const prompt = generateChatGptPrompt();
    const encoded = encodeURIComponent(prompt);
    window.open(`https://chatgpt.com/?q=${encoded}`, '_blank');
    onShowToast('ChatGPT নতুন ট্যাবে খোলা হচ্ছে... 🤖', '🚀');
  };

  // Import text pasted from ChatGPT
  const handleImportChatGptText = () => {
    if (!chatGptInputText.trim()) {
      onShowToast('অনুগ্রহ করে ChatGPT থেকে কপি করা লেখা পেস্ট করুন।', '⚠️');
      return;
    }
    const text = chatGptInputText.trim();
    setCustom((prev) => ({ ...prev, statusText: text }));

    if (text.includes('।')) {
      const sents = text.split('।').filter(Boolean);
      if (sents.length > 1) {
        setCustom((prev) => ({ ...prev, highlightText: sents[sents.length - 1].trim() + '।' }));
      }
    }
    onShowToast('ChatGPT থেকে স্ট্যাটাস সফলভাবে পোস্টারে যুক্ত হয়েছে! ✨', '✅');
    setChatGptInputText('');
    setShowChatGptModal(false);
  };

  // Export & Download
  const handleDownload = async (format: 'png' | 'jpeg') => {
    if (!posterRef.current) return;
    setIsExporting(true);
    onShowToast(`${format.toUpperCase()} প্রস্তুত হচ্ছে... 🎨`, '⏳');

    try {
      const dataUrl = await posterRef.current.exportImage(format, 0.98);
      if (!dataUrl) {
        throw new Error('Canvas render failed');
      }

      const link = document.createElement('a');
      link.download = `MoSaFa-Status-Poster-${selectedFrame.id}-${Date.now()}.${format === 'png' ? 'png' : 'jpg'}`;
      link.href = dataUrl;
      link.click();

      onShowToast(`পোস্টার সফলভাবে ডাউনলোড হয়েছে! 📥🎉`, '✅');
    } catch (err) {
      console.error('Download error:', err);
      onShowToast('পোস্টার ডাউনলোড করতে সমস্যা হয়েছে।', '⚠️');
    } finally {
      setIsExporting(false);
    }
  };

  // Native Web Share
  const handleShare = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await posterRef.current.exportImage('png', 0.95);
      if (!dataUrl) return;

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `mosafa-poster-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'MoSaFa AI Photo Status & Frame Studio',
          text: custom.statusText,
          files: [file],
        });
        onShowToast('সফলভাবে শেয়ার করা হয়েছে! 🚀', '✅');
      } else if (navigator.share) {
        await navigator.share({
          title: 'MoSaFa AI Photo Status & Frame Studio',
          text: `${custom.statusText}\n\n— তৈরি করুন: The MoSaFa Tools`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(custom.statusText);
        onShowToast('স্ট্যাটাস লেখা ক্লিপবোর্ডে কপি করা হয়েছে! 📋', '✅');
      }
    } catch {
      await navigator.clipboard.writeText(custom.statusText);
      onShowToast('স্ট্যাটাস লেখা ক্লিপবোর্ডে কপি করা হয়েছে! 📋', '✅');
    }
  };

  // Copy status text
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(custom.statusText);
      onShowToast('স্ট্যাটাস টেক্সট কপি করা হয়েছে! 📋', '✅');
    } catch {
      onShowToast('কপি করতে সমস্যা হয়েছে।', '⚠️');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Top Main Navigation Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400 border border-slate-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 shrink-0"
                title="সকল টুলসে ফিরে যান"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">পিছনে যান</span>
              </button>
            )}

            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                  MoSaFa AI Photo Status & Frame Studio
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                  AI স্টুডিও
                </span>
              </div>
              <p className="text-xs text-rose-300/80 font-medium truncate">
                আপনার ছবি, AI-এর লেখা, পছন্দের ফ্রেম—তৈরি করুন নিজের স্টাইলের পোস্টার।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBackToClassic && (
              <button
                type="button"
                onClick={onBackToClassic}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-700"
                title="ক্লাসিক পোস্টার মেকারে যান"
              >
                📰 ক্লাসিক মেকার
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700 active:scale-95"
              title="স্ট্যাটাস লেখা কপি করুন"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">লেখা কপি</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700 active:scale-95"
              title="পোস্টার শেয়ার করুন"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">শেয়ার</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleDownload('png')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/40 active:scale-95 disabled:opacity-50"
              title="হাই-রেজুলেশন PNG ডাউনলোড"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG ডাউনলোড</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Container: 2-Column Desktop, Stacked Mobile */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* ========================================================= */}
        {/* LEFT COLUMN: LARGE LIVE POSTER PREVIEW (7 Cols)          */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Live Preview Container */}
          <div className="w-full bg-slate-900/80 rounded-3xl p-3 sm:p-5 border border-slate-800/90 shadow-2xl flex flex-col items-center justify-between min-h-[500px]">
            {/* Top Toolbar in Preview Card */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  <span>লাইভ পোস্টার প্রিভিউ</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  {selectedFrame.nameBn}
                </span>
              </div>

              {/* Aspect Ratio Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['1:1', '4:5', '9:16'] as AspectRatio[]).map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => {
                      setAspectRatio(ar);
                      onShowToast(`সাইজ পরিবর্তন: ${ar} করা হয়েছে`, '📐');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                      aspectRatio === ar
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ar} {ar === '1:1' ? '(স্কয়ার)' : ar === '4:5' ? '(পোর্ট্রেট)' : '(স্টোরি)'}
                  </button>
                ))}
              </div>
            </div>

            {/* The Canvas Poster Renderer */}
            <div className="w-full flex-1 flex items-center justify-center my-2 overflow-hidden">
              <PosterCanvasRenderer
                ref={posterRef}
                aspectRatio={aspectRatio}
                frame={selectedFrame}
                userPhoto={userPhoto}
                transform={transform}
                custom={custom}
              />
            </div>

            {/* Bottom Quick Action Strip under Canvas */}
            <div className="w-full pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>১০৮০p ক্রিস্প হাই-রেজুলেশন এক্সপোর্ট</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload('jpeg')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer border border-slate-700 active:scale-95"
                >
                  JPG সেভ
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('png')}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/40 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG ডাউনলোড</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: 5-STEP EDITING & CONTROLS (5 Cols)          */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Step Navigation Pill Tabs */}
          <div className="bg-slate-900/90 p-2 rounded-2xl border border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
            {[
              { num: 1, label: 'ছবি', icon: <Upload className="w-3.5 h-3.5" /> },
              { num: 2, label: 'স্ট্যাটাস', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { num: 3, label: 'ফ্রেম', icon: <Palette className="w-3.5 h-3.5" /> },
              { num: 4, label: 'সাজানো', icon: <Sliders className="w-3.5 h-3.5" /> },
              { num: 5, label: 'ডাউনলোড', icon: <Download className="w-3.5 h-3.5" /> },
            ].map((step) => (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(step.num)}
                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0 ${
                  activeStep === step.num
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40 ring-1 ring-rose-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{step.icon}</span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>

          {/* ======================================================= */}
          {/* STEP 1: UPLOAD & POSITION PHOTO                         */}
          {/* ======================================================= */}
          {activeStep === 1 && (
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-extrabold">
                      ১
                    </span>
                    <span>নিজের ছবি আপলোড ও অ্যাডজাস্ট</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    আসল চেহারা ও ফেস অপরিবর্তিত থাকবে
                  </p>
                </div>

                {userPhoto && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
                  >
                    ছবি বদলান
                  </button>
                )}
              </div>

              {/* Upload Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-rose-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-950/60 hover:bg-slate-950 flex flex-col items-center justify-center gap-2.5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    {userPhoto ? 'অন্য ছবি আপলোড করতে এখানে ক্লিক করুন' : 'ছবি আপলোড করতে ক্লিক করুন বা ড্রপ করুন'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    JPG, PNG ও WEBP সমর্থিত • নো ক্রপ, নো ডিস্টরশন
                  </p>
                </div>
              </div>

              {/* Photo Position & Zoom Controls */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-rose-400" />
                    <span>ছবি ছোট/বড় ও পজিশন অ্যাডজাস্ট (Resize & Move)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTransform({ zoom: 100, boxScale: 100, posX: 0, posY: 0, rotate: 0 })}
                    className="text-[11px] text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>রিসেট</span>
                  </button>
                </div>

                {/* 1. Photo Container Scale (ছবির সাইজ ছোট / বড় করা) */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>ছবির ফ্রেম সাইজ (বক্স স্কেল):</span>
                    </span>
                    <span className="font-mono text-amber-300 font-bold">{transform.boxScale || 100}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTransform((prev) => ({ ...prev, boxScale: Math.max(50, (prev.boxScale || 100) - 10) }))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95"
                      title="ছবি ছোট করুন"
                    >
                      ➖ ছোট
                    </button>
                    <input
                      type="range"
                      min={50}
                      max={180}
                      value={transform.boxScale || 100}
                      onChange={(e) =>
                        setTransform((prev) => ({ ...prev, boxScale: Number(e.target.value) }))
                      }
                      className="flex-1 accent-amber-500 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setTransform((prev) => ({ ...prev, boxScale: Math.min(180, (prev.boxScale || 100) + 10) }))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95"
                      title="ছবি বড় করুন"
                    >
                      ➕ বড়
                    </button>
                  </div>
                </div>

                {/* 2. Photo Inner Zoom (ছবির ভেতরের জুম) */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5 text-rose-400" />
                      <span>ছবির ভেতরের জুম (Zoom):</span>
                    </span>
                    <span className="font-mono text-rose-300 font-bold">{transform.zoom}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTransform((prev) => ({ ...prev, zoom: Math.max(40, prev.zoom - 10) }))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95"
                    >
                      ➖
                    </button>
                    <input
                      type="range"
                      min={40}
                      max={240}
                      value={transform.zoom}
                      onChange={(e) =>
                        setTransform((prev) => ({ ...prev, zoom: Number(e.target.value) }))
                      }
                      className="flex-1 accent-rose-500 cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setTransform((prev) => ({ ...prev, zoom: Math.min(240, prev.zoom + 10) }))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95"
                    >
                      ➕
                    </button>
                  </div>
                </div>

                {/* 3. Photo Position Sliders & Quick Nudge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* Pan Y (Up / Down) */}
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>উপরে / নিচে (Pan Y):</span>
                      <span className="font-mono">{transform.posY}</span>
                    </div>
                    <input
                      type="range"
                      min={-150}
                      max={150}
                      value={transform.posY}
                      onChange={(e) =>
                        setTransform((prev) => ({ ...prev, posY: Number(e.target.value) }))
                      }
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Pan X (Left / Right) */}
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>বামে / ডানে (Pan X):</span>
                      <span className="font-mono">{transform.posX}</span>
                    </div>
                    <input
                      type="range"
                      min={-150}
                      max={150}
                      value={transform.posX}
                      onChange={(e) =>
                        setTransform((prev) => ({ ...prev, posX: Number(e.target.value) }))
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* 4. Quick Rotation */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                    <span>ছবি ঘোরানো: {transform.rotate}°</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTransform((prev) => ({ ...prev, rotate: (prev.rotate + 90) % 360 }))}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                  >
                    <span>⟳ ৯০° ঘোরান</span>
                  </button>
                </div>
              </div>

              {/* Next Step Button */}
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/40 active:scale-95"
              >
                <span>পরবর্তী ধাপ: স্ট্যাটাস নির্বাচন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ======================================================= */}
          {/* STEP 2: CHOOSE CATEGORY & AI STATUS GENERATOR           */}
          {/* ======================================================= */}
          {activeStep === 2 && (
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-extrabold">
                      ২
                    </span>
                    <span>স্ট্যাটাস ক্যাটাগরি ও AI লেখা</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    পছন্দের বিষয় বেছে নিন বা AI দিয়ে তৈরি করুন
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isGeneratingAI}
                  onClick={() => handleGenerateAIStatus(selectedCategory, selectedTone)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                  title="নতুন ৫টি স্ট্যাটাস তৈরি করুন"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                  <span>নতুন লেখা</span>
                </button>
              </div>

              {/* A. 1-Click Flagship Persona Presets (Directly matching User's Reference Images) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-indigo-950/40 to-slate-900 border border-rose-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>বিখ্যাত ব্যক্তিত্ব স্টাইল (১-ক্লিক রেফারেন্স টেমপ্লেট):</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                    Image 1 & 2 স্টাইল
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PERSONA_PRESETS.map((p) => {
                    const isSelected = custom.authorName === p.authorName;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPersona(p)}
                        className={`p-2.5 rounded-xl text-left transition flex flex-col justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-rose-900/60 border-rose-400 ring-2 ring-rose-400 text-white shadow-md'
                            : 'bg-slate-950/90 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-black mb-1">
                          <span className="flex items-center gap-1">
                            <span>{p.avatarIcon}</span>
                            <span className="truncate">{p.nameBn}</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-rose-300" />}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{p.titleBn}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* B. Online ChatGPT Integration & 1-Click Prompt Generator */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    <span>ChatGPT অনলাইন স্ট্যাটাস কানেক্টর</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                    ফোন বা পিসি থেকে
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  আপনার ফোনে বা কম্পিউটারে ChatGPT চালু থাকলে ১-ক্লিকে তৈরি প্রম্পট কপি করে নিন অথবা ChatGPT থেকে লেখা পেস্ট করুন:
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyChatGptPrompt}
                    className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>ChatGPT প্রম্পট কপি করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenChatGpt}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ChatGPT খুলুন</span>
                  </button>
                </div>

                {/* ChatGPT text importer */}
                <div className="pt-1 flex gap-2">
                  <input
                    type="text"
                    value={chatGptInputText}
                    onChange={(e) => setChatGptInputText(e.target.value)}
                    placeholder="ChatGPT থেকে পাওয়া উক্তি এখানে পেস্ট করুন..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleImportChatGptText}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer active:scale-95 shrink-0"
                  >
                    পোস্টারে যুক্ত করুন
                  </button>
                </div>
              </div>

              {/* 16 Category Cards Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  ১. ক্যাটাগরি নির্বাচন করুন (১৬টি ক্যাটাগরি):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {STATUS_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedTone(cat.defaultTone);
                        handleGenerateAIStatus(cat.id, cat.defaultTone);
                      }}
                      className={`p-2.5 rounded-xl text-left transition flex flex-col justify-between gap-1.5 cursor-pointer border ${
                        selectedCategory === cat.id
                          ? 'bg-rose-950/80 border-rose-500 ring-1 ring-rose-500 text-white'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {getCategoryIcon(cat.iconName)}
                        {selectedCategory === cat.id && (
                          <Check className="w-3.5 h-3.5 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold truncate leading-tight">{cat.nameBn}</p>
                        <p className="text-[10px] text-slate-500 truncate">{cat.nameEn}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone & Length Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Tone */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    লেখার ধরন (Tone):
                  </label>
                  <select
                    value={selectedTone}
                    onChange={(e) => {
                      const tone = e.target.value as WritingTone;
                      setSelectedTone(tone);
                      handleGenerateAIStatus(selectedCategory, tone);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                  >
                    {WRITING_TONES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.nameBn} ({t.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Length */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    লেখার দৈর্ঘ্য (Length):
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
                    {(['short', 'medium', 'long'] as StatusLength[]).map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => {
                          setStatusLength(len);
                          handleGenerateAIStatus(selectedCategory, selectedTone);
                        }}
                        className={`py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          statusLength === len
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {len === 'short' ? 'সংক্ষিপ্ত' : len === 'medium' ? 'মাঝারি' : 'বড়'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Generated Status List (5 suggestions) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI প্রস্তাবিত স্ট্যাটাস (ক্লিক করে বেছে নিন):</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {generatedStatuses.length}টি তৈরি
                  </span>
                </div>

                {isGeneratingAI ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <div className="w-8 h-8 mx-auto rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
                    <p className="text-xs font-bold text-slate-300">
                      AI গভীর ভাব ও প্রাঞ্জল ভাষায় স্ট্যাটাস তৈরি করছে...
                    </p>
                    <p className="text-[11px] text-slate-500">বানান ও ব্যাকরণ নির্ভুল রাখা হচ্ছে</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {generatedStatuses.map((text, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectStatus(text, idx)}
                        className={`p-3 rounded-2xl border transition cursor-pointer text-xs relative ${
                          selectedStatusIndex === idx && custom.statusText === text
                            ? 'bg-rose-950/60 border-rose-500 text-white shadow-xs'
                            : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="leading-relaxed flex-1">"{text}"</p>
                          {selectedStatusIndex === idx && custom.statusText === text && (
                            <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual Edit Status Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ✏️ প্রয়োজনে স্ট্যাটাস নিজের মতো এডিট করুন:
                </label>
                <textarea
                  rows={3}
                  value={custom.statusText}
                  onChange={(e) => setCustom((prev) => ({ ...prev, statusText: e.target.value }))}
                  placeholder="এখানে আপনার মনের মতো যেকোনো স্ট্যাটাস লিখুন..."
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Next Step Button */}
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/40 active:scale-95"
              >
                <span>পরবর্তী ধাপ: ফ্রেম পছন্দ করুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ======================================================= */}
          {/* STEP 3: 32+ PREMIUM FRAME GALLERY                       */}
          {/* ======================================================= */}
          {activeStep === 3 && (
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-extrabold">
                      ৩
                    </span>
                    <span>১০০টি এক্সক্লুসিভ ফ্রেম নির্বাচন ({FRAME_TEMPLATES.length}টি ফ্রেম)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    কোনো ক্যাটাগরি সীমাবদ্ধতা নেই — ১০০টি সম্পূর্ণ ভিন্ন ডিজাইনের ফ্রেম এক নজরে বেছে নিন
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold shrink-0">
                  ১০০টি ফ্রেম যুক্ত
                </span>
              </div>

              {/* Fast Frame Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={frameSearchQuery}
                  onChange={(e) => setFrameSearchQuery(e.target.value)}
                  placeholder="১০০টি ফ্রেমের মধ্যে খুঁজুন... (যেমন: জাতীয় নেতা, আহমাদুল্লাহ, মেহরাব, পার্চমেন্ট, বারোক, ইত্যাদি)"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Visual Frame Cards Grid - All 100 Frames Directly Accessible */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
                {FRAME_TEMPLATES.filter((frame) => {
                  if (!frameSearchQuery.trim()) return true;
                  const q = frameSearchQuery.toLowerCase();
                  return (
                    frame.nameBn.toLowerCase().includes(q) ||
                    frame.nameEn.toLowerCase().includes(q) ||
                    frame.tagline.toLowerCase().includes(q) ||
                    frame.badge.toLowerCase().includes(q)
                  );
                }).map((frame) => (
                  <div
                    key={frame.id}
                    onClick={() => handleSelectFrame(frame)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between relative group ${
                      selectedFrame.id === frame.id
                        ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500 text-white shadow-lg shadow-rose-950/50'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {frame.badge}
                      </span>
                      {selectedFrame.id === frame.id && (
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs">
                          ✓
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-black text-white group-hover:text-rose-300 transition-colors">
                      {frame.nameBn}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {frame.tagline}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{frame.layoutType.replace(/_/g, ' ')}</span>
                      <span className="text-rose-400 font-bold group-hover:underline">অ্যাপ্লাই করুন</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Step Button */}
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/40 active:scale-95"
              >
                <span>পরবর্তী ধাপ: ফন্ট, রং ও পজিশন সাজানো</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ======================================================= */}
          {/* STEP 4: FINE-TUNE & TYPOGRAPHY                          */}
          {/* ======================================================= */}
          {activeStep === 4 && (
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-extrabold">
                      ৪
                    </span>
                    <span>টাইপোগ্রাফি ও বিস্তারিত কাস্টমাইজ</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ফন্ট সাইজ, অ্যালাইনমেন্ট ও নাম নিয়ন্ত্রণ করুন
                  </p>
                </div>
              </div>

              {/* Author / Source Name and Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    বক্তা / আপনার নাম:
                  </label>
                  <input
                    type="text"
                    value={custom.authorName}
                    onChange={(e) => setCustom((prev) => ({ ...prev, authorName: e.target.value }))}
                    placeholder="যেমন: ফখরুদ্দীন আহমেদ বা শায়খ আহমাদুল্লাহ"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    পদবি / পরিচয় (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={custom.designation || ''}
                    onChange={(e) => setCustom((prev) => ({ ...prev, designation: e.target.value }))}
                    placeholder="যেমন: সাবেক প্রধান উপদেষ্টা / ইসলামিক স্কলার"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Red Highlight text & Category Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    🔴 লাল মার্কার / হাইলাইট অংশ:
                  </label>
                  <input
                    type="text"
                    value={custom.highlightText || ''}
                    onChange={(e) => setCustom((prev) => ({ ...prev, highlightText: e.target.value }))}
                    placeholder="যেমন: মাত্র ৭দিন। (যে অংশ লাল রঙে ভাসবে)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-500/50 text-xs text-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ক্যাটাগরি ব্যাজ টেক্সট:
                  </label>
                  <input
                    type="text"
                    value={custom.categoryBadge}
                    onChange={(e) => setCustom((prev) => ({ ...prev, categoryBadge: e.target.value }))}
                    placeholder="যেমন: জীবনবোধ / উক্তি"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* 1. Font Size (লেখা ছোট / বড় করা) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-rose-400" />
                    <span>লেখার সাইজ ছোট / বড় করুন:</span>
                  </span>
                  <span className="font-mono text-rose-300 font-bold">{custom.fontSize}px</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustom((prev) => ({ ...prev, fontSize: Math.max(18, prev.fontSize - 2) }))}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition active:scale-95"
                    title="লেখা ছোট করুন"
                  >
                    ➖ ছোট (A-)
                  </button>

                  <input
                    type="range"
                    min={18}
                    max={54}
                    value={custom.fontSize}
                    onChange={(e) =>
                      setCustom((prev) => ({ ...prev, fontSize: Number(e.target.value) }))
                    }
                    className="flex-1 accent-rose-500 cursor-pointer"
                  />

                  <button
                    type="button"
                    onClick={() => setCustom((prev) => ({ ...prev, fontSize: Math.min(54, prev.fontSize + 2) }))}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition active:scale-95"
                    title="লেখা বড় করুন"
                  >
                    ➕ বড় (A+)
                  </button>
                </div>
              </div>

              {/* 2. Text Color (লেখার রং পরিবর্তন) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>লেখার মূল রং পরিবর্তন করুন:</span>
                  </span>
                  {custom.customTextColor && (
                    <button
                      type="button"
                      onClick={() => setCustom((prev) => ({ ...prev, customTextColor: undefined }))}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      ডিফল্ট রং
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { color: '#ffffff', label: 'সাদা' },
                    { color: '#0f2942', label: 'গাঢ় নেভি' },
                    { color: '#09090b', label: 'কালো' },
                    { color: '#facc15', label: 'সোনালী' },
                    { color: '#ef4444', label: 'লাল' },
                    { color: '#10b981', label: 'সবুজ' },
                    { color: '#38bdf8', label: 'আকাশি' },
                    { color: '#c084fc', label: 'পার্পল' },
                    { color: '#fb923c', label: 'কমলা' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setCustom((prev) => ({ ...prev, customTextColor: c.color }))}
                      style={{ backgroundColor: c.color }}
                      className={`w-7 h-7 rounded-full border-2 transition transform active:scale-95 cursor-pointer shadow-xs ${
                        custom.customTextColor === c.color ? 'border-rose-500 scale-110 ring-2 ring-rose-400' : 'border-slate-700'
                      }`}
                      title={c.label}
                    />
                  ))}

                  {/* Custom color picker */}
                  <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 cursor-pointer text-xs text-slate-300">
                    <input
                      type="color"
                      value={custom.customTextColor || '#ffffff'}
                      onChange={(e) => setCustom((prev) => ({ ...prev, customTextColor: e.target.value }))}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-[11px] font-bold">কাস্টম</span>
                  </label>
                </div>
              </div>

              {/* 3. Manual Text Repositioning (লেখা ম্যানুয়ালি সরান - Up, Down, Left, Right) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-sky-400" />
                    <span>লেখা ম্যানুয়ালি সরান (Move Text Position):</span>
                  </span>
                  {(custom.textOffsetX !== 0 || custom.textOffsetY !== 0) && (
                    <button
                      type="button"
                      onClick={() => setCustom((prev) => ({ ...prev, textOffsetX: 0, textOffsetY: 0 }))}
                      className="text-[11px] text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>মাঝে রিসেট</span>
                    </button>
                  )}
                </div>

                {/* 4-Way D-Pad Nudge Buttons */}
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <button
                    type="button"
                    onClick={() => setCustom((prev) => ({ ...prev, textOffsetY: (prev.textOffsetY || 0) - 15 }))}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition active:scale-95 border border-slate-700 shadow-xs"
                    title="লেখা উপরে সরান"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-sky-400" />
                    <span>উপরে</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustom((prev) => ({ ...prev, textOffsetX: (prev.textOffsetX || 0) - 15 }))}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition active:scale-95 border border-slate-700 shadow-xs"
                      title="লেখা বামে সরান"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                      <span>বামে</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustom((prev) => ({ ...prev, textOffsetX: 0, textOffsetY: 0 }))}
                      className="px-3 py-1.5 rounded-xl bg-sky-950/80 text-sky-300 border border-sky-600/50 text-[11px] font-bold active:scale-95"
                      title="লেখা ডিফল্ট সেন্টারে রাখুন"
                    >
                      🎯 সেন্টারে
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustom((prev) => ({ ...prev, textOffsetX: (prev.textOffsetX || 0) + 15 }))}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition active:scale-95 border border-slate-700 shadow-xs"
                      title="লেখা ডানে সরান"
                    >
                      <span>ডানে</span>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCustom((prev) => ({ ...prev, textOffsetY: (prev.textOffsetY || 0) + 15 }))}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition active:scale-95 border border-slate-700 shadow-xs"
                    title="লেখা নিচে সরান"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                    <span>নিচে</span>
                  </button>
                </div>

                {/* Precision Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>উপরে / নিচে (Y):</span>
                      <span className="font-mono text-sky-300">{custom.textOffsetY || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min={-300}
                      max={300}
                      value={custom.textOffsetY || 0}
                      onChange={(e) =>
                        setCustom((prev) => ({ ...prev, textOffsetY: Number(e.target.value) }))
                      }
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>বামে / ডানে (X):</span>
                      <span className="font-mono text-sky-300">{custom.textOffsetX || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min={-250}
                      max={250}
                      value={custom.textOffsetX || 0}
                      onChange={(e) =>
                        setCustom((prev) => ({ ...prev, textOffsetX: Number(e.target.value) }))
                      }
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Background Color (ব্যাকগ্রাউন্ডের রং পরিবর্তন) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-emerald-400" />
                    <span>পোস্টার ব্যাকগ্রাউন্ডের রং পরিবর্তন:</span>
                  </span>
                  {custom.customBgColor && (
                    <button
                      type="button"
                      onClick={() => setCustom((prev) => ({ ...prev, customBgColor: undefined }))}
                      className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                    >
                      ফ্রেমের মূল ব্যাকগ্রাউন্ড
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustom((prev) => ({ ...prev, customBgColor: undefined }))}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      !custom.customBgColor
                        ? 'bg-rose-950 border-rose-500 text-rose-300 ring-1 ring-rose-400'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    ডিফল্ট ফ্রেম
                  </button>

                  {[
                    { color: '#09090b', label: 'গাঢ় কালো' },
                    { color: '#0f172a', label: 'মধ্যরাতের নেভি' },
                    { color: '#042f24', label: 'ডিপ পান্না' },
                    { color: '#450a0a', label: 'ডিপ মেরুন' },
                    { color: '#271a0c', label: 'গোল্ডেন সেপিয়া' },
                    { color: '#ffffff', label: 'শুভ্র সাদা' },
                    { color: '#f1f5f9', label: 'নরম স্লেট' },
                    { color: '#1e1b4b', label: 'রয়্যাল ইন্ডিগো' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setCustom((prev) => ({ ...prev, customBgColor: c.color }))}
                      style={{ backgroundColor: c.color }}
                      className={`w-7 h-7 rounded-full border-2 transition transform active:scale-95 cursor-pointer shadow-xs ${
                        custom.customBgColor === c.color ? 'border-emerald-500 scale-110 ring-2 ring-emerald-400' : 'border-slate-700'
                      }`}
                      title={c.label}
                    />
                  ))}

                  {/* Custom color picker */}
                  <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 cursor-pointer text-xs text-slate-300">
                    <input
                      type="color"
                      value={custom.customBgColor || '#09090b'}
                      onChange={(e) => setCustom((prev) => ({ ...prev, customBgColor: e.target.value }))}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-[11px] font-bold">কাস্টম</span>
                  </label>
                </div>
              </div>

              {/* 5. Text Alignment */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  টেক্সট অ্যালাইনমেন্ট:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'left', label: 'বামে (Left)', icon: <AlignLeft className="w-3.5 h-3.5" /> },
                    { id: 'center', label: 'মাঝে (Center)', icon: <AlignCenter className="w-3.5 h-3.5" /> },
                    { id: 'right', label: 'ডানে (Right)', icon: <AlignRight className="w-3.5 h-3.5" /> },
                  ].map((align) => (
                    <button
                      key={align.id}
                      type="button"
                      onClick={() =>
                        setCustom((prev) => ({ ...prev, textAlign: align.id as any }))
                      }
                      className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                        custom.textAlign === align.id
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {align.icon}
                      <span>{align.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Element Visibility Toggles */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-300">
                  উপাদানসমূহ প্রদর্শন / লুকান:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={custom.showAuthor}
                      onChange={(e) =>
                        setCustom((prev) => ({ ...prev, showAuthor: e.target.checked }))
                      }
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                    <span>বক্তার নাম</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={custom.showQuoteMarks}
                      onChange={(e) =>
                        setCustom((prev) => ({ ...prev, showQuoteMarks: e.target.checked }))
                      }
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                    <span>কোটেশন চিহ্ন (“)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={custom.showCategoryBadge}
                      onChange={(e) =>
                        setCustom((prev) => ({ ...prev, showCategoryBadge: e.target.checked }))
                      }
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                    <span>ক্যাটাগরি ব্যাজ</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={custom.showWatermark}
                      onChange={(e) =>
                        setCustom((prev) => ({ ...prev, showWatermark: e.target.checked }))
                      }
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                    <span>ওয়াটারমার্ক ব্র্যান্ড</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={custom.showDesignation}
                      onChange={(e) =>
                        setCustom((prev) => ({ ...prev, showDesignation: e.target.checked }))
                      }
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                    <span>পদবি / উপাধি প্রদর্শন</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={custom.showBangladeshFlagBg}
                      onChange={(e) =>
                        setCustom((prev) => ({ ...prev, showBangladeshFlagBg: e.target.checked }))
                      }
                      className="rounded text-rose-500 focus:ring-rose-500"
                    />
                    <span>🇧🇩 বাংলাদেশের পতাকা ব্যাকগ্রাউন্ড</span>
                  </label>
                </div>
              </div>

              {/* Next Step Button */}
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/40 active:scale-95"
              >
                <span>পরবর্তী ধাপ: ডাউনলোড ও শেয়ার</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ======================================================= */}
          {/* STEP 5: DOWNLOAD & SHARE                                */}
          {/* ======================================================= */}
          {activeStep === 5 && (
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-extrabold">
                    ৫
                  </span>
                  <span>পোস্টার ডাউনলোড ও সোশ্যাল শেয়ার</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  হাই-রেজুলেশন এইচডি ফরম্যাটে আপনার ডিভাইসে সেভ করুন
                </p>
              </div>

              {/* Download Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => handleDownload('png')}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-rose-900/50 active:scale-98 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>হাই-রেজুলেশন PNG ডাউনলোড করুন (HD)</span>
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => handleDownload('jpeg')}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-700 active:scale-98 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>স্ট্যান্ডার্ড JPG ডাউনলোড</span>
                </button>
              </div>

              {/* Share & Copy Strip */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-rose-400" />
                  <span>সোশ্যাল শেয়ার</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyText}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>লেখা কপি</span>
                </button>
              </div>

              {/* Specifications Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>অনুপাত:</span>
                  <span className="font-bold text-slate-200">{aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span>এক্সপোর্ট রেজুলেশন:</span>
                  <span className="font-bold text-emerald-400">
                    {aspectRatio === '1:1'
                      ? '১০৮০ × ১০৮০ px'
                      : aspectRatio === '4:5'
                      ? '১০৮০ × ১৩৫০ px'
                      : '১০৮০ × ১৯২০ px'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>নির্বাচিত ফ্রেম:</span>
                  <span className="font-bold text-rose-300">{selectedFrame.nameBn}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
