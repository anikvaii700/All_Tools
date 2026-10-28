import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Share2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
  Type,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  Info,
  Clock,
  ExternalLink,
  ShieldCheck,
  Filter,
  Check,
  X,
  FileText,
  Copy,
  Plus,
  Trash2,
  Edit3,
  Volume2,
  VolumeX,
  Layers,
  MessageCircle,
} from 'lucide-react';
import {
  STORIES_DATA,
  STORY_CATEGORIES,
  StoryMetadata,
  StoryCategory,
  ContentType,
} from '../data/golpoGhorData';
import { StoryShareModal } from './StoryShareModal';
import { CustomStoryModal } from './CustomStoryModal';
import { PdfBookshelf } from './PdfBookshelf';

interface GolpoGhorProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

// User reading preferences stored locally
interface ReaderPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  theme: 'light' | 'sepia' | 'dark';
}

interface ReadingProgressRecord {
  storyId: string;
  chapterNumber: number;
  progressPercent: number;
  lastReadTimestamp: number;
}

export const GolpoGhor: React.FC<GolpoGhorProps> = ({ onBackToHub, onShowToast }) => {
  // Main Tab Navigation: library (গল্পের ঘর) | pdf-shelf (পিডিএফ বইঘর) | custom-stories (স্বরচিত গল্প)
  const [currentTab, setCurrentTab] = useState<'library' | 'pdf-shelf' | 'custom-stories'>('library');

  // Navigation & Active Story State
  const [activeStory, setActiveStory] = useState<StoryMetadata | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [isFullStoryMode, setIsFullStoryMode] = useState<boolean>(false);

  // Audio Reader (TTS) State
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);

  // Custom User-Written Stories (Stored in localStorage)
  const [customStories, setCustomStories] = useState<StoryMetadata[]>(() => {
    try {
      const saved = localStorage.getItem('mosafa_custom_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom Story & Share Modals
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
  const [editingStory, setEditingStory] = useState<StoryMetadata | null>(null);
  const [sharingStory, setSharingStory] = useState<StoryMetadata | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importCode, setImportCode] = useState<string>('');

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [readingTimeFilter, setReadingTimeFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // Sync customStories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_custom_stories', JSON.stringify(customStories));
    } catch {}
  }, [customStories]);

  // Combined Stories list (Custom Stories + Pre-loaded Stories)
  const allCombinedStories = useMemo(() => {
    return [...customStories, ...STORIES_DATA];
  }, [customStories]);

  // Reset pagination when category, search, or filters change
  useEffect(() => {
    setVisibleCount(selectedCategory !== 'all' ? 20 : 24);
  }, [selectedCategory, searchQuery, contentTypeFilter, readingTimeFilter]);

  // Personal Reading Storage (localStorage)
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mosafa_golpo_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [readingHistory, setReadingHistory] = useState<Record<string, ReadingProgressRecord>>(() => {
    try {
      const saved = localStorage.getItem('mosafa_golpo_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Reader Customization Preferences
  const [readerPrefs, setReaderPrefs] = useState<ReaderPreferences>(() => {
    try {
      const saved = localStorage.getItem('mosafa_golpo_reader_prefs');
      return saved
        ? JSON.parse(saved)
        : { fontSize: 'medium', lineHeight: 'relaxed', theme: 'light' };
    } catch {
      return { fontSize: 'medium', lineHeight: 'relaxed', theme: 'light' };
    }
  });

  // UI Modals & Menus
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isTypographyMenuOpen, setIsTypographyMenuOpen] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const readerContentRef = useRef<HTMLDivElement | null>(null);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_golpo_bookmarks', JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_golpo_history', JSON.stringify(readingHistory));
    } catch {}
  }, [readingHistory]);

  // Sync reader preferences
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_golpo_reader_prefs', JSON.stringify(readerPrefs));
    } catch {}
  }, [readerPrefs]);

  // Stop Speech Synthesis when story/chapter changes or unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeStory, activeChapterIndex, isFullStoryMode]);

  // Handle URL query parameters for direct story linking (?tool=golpo-ghor&story=slug)
  useEffect(() => {
    const handleUrlRoute = () => {
      const params = new URLSearchParams(window.location.search);

      // Support direct shared custom story via URL parameter
      const sharedStoryParam = params.get('sharedStory');
      if (sharedStoryParam) {
        try {
          const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(sharedStoryParam))));
          const parsed = JSON.parse(jsonStr) as StoryMetadata;
          if (parsed && parsed.title && parsed.chapters && Array.isArray(parsed.chapters)) {
            setCustomStories((prev) => {
              if (!prev.some((s) => s.id === parsed.id || s.slug === parsed.slug)) {
                return [parsed, ...prev];
              }
              return prev;
            });
            setActiveStory(parsed);
            setActiveChapterIndex(0);
            onShowToast(`🎉 শেয়ারকৃত গল্প "${parsed.title}" সফলভাবে লোড হয়েছে!`, '📖');
            return;
          }
        } catch (e) {
          console.error('Failed to parse sharedStory URL param', e);
        }
      }

      const storySlug = params.get('story');
      if (storySlug) {
        const found = allCombinedStories.find((s) => s.slug === storySlug);
        if (found) {
          setActiveStory(found);
          const savedProgress = readingHistory[found.id];
          if (savedProgress && savedProgress.chapterNumber <= found.chapters.length) {
            setActiveChapterIndex(Math.max(0, savedProgress.chapterNumber - 1));
          } else {
            setActiveChapterIndex(0);
          }
        } else {
          onShowToast('গল্পটি খুঁজে পাওয়া যায়নি! লাইব্রেরি তালিকায় ফিরে আসা হয়েছে।', '⚠️');
          setActiveStory(null);
        }
      } else {
        setActiveStory(null);
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [allCombinedStories]);

  // Track Reader Scroll Progress
  useEffect(() => {
    if (!activeStory) return;

    const handleScroll = () => {
      const el = document.documentElement;
      const totalHeight = el.scrollHeight - el.clientHeight;
      if (totalHeight > 0) {
        const currentProgress = Math.min(100, Math.round((el.scrollTop / totalHeight) * 100));
        setScrollProgress(currentProgress);

        // Auto update progress in history
        setReadingHistory((prev) => ({
          ...prev,
          [activeStory.id]: {
            storyId: activeStory.id,
            chapterNumber: activeChapterIndex + 1,
            progressPercent: currentProgress,
            lastReadTimestamp: Date.now(),
          },
        }));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeStory, activeChapterIndex]);

  // Open a story and update URL pushState
  const handleOpenStory = (story: StoryMetadata, chapterNum = 1) => {
    setActiveStory(story);
    setActiveChapterIndex(Math.max(0, chapterNum - 1));
    const newUrl = `?tool=golpo-ghor&story=${story.slug}`;
    window.history.pushState({ tool: 'golpo-ghor', story: story.slug }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Mark as started in history
    setReadingHistory((prev) => ({
      ...prev,
      [story.id]: {
        storyId: story.id,
        chapterNumber: chapterNum,
        progressPercent: prev[story.id]?.progressPercent || 5,
        lastReadTimestamp: Date.now(),
      },
    }));
  };

  // Close reader and return to library
  const handleCloseReader = () => {
    setActiveStory(null);
    window.history.pushState({ tool: 'golpo-ghor' }, '', '?tool=golpo-ghor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Bookmark
  const toggleBookmark = (storyId: string) => {
    if (bookmarks.includes(storyId)) {
      setBookmarks((prev) => prev.filter((id) => id !== storyId));
      onShowToast('বুকমার্ক তালিকা থেকে সরানো হয়েছে', '🔖');
    } else {
      setBookmarks((prev) => [...prev, storyId]);
      onShowToast('গল্পটি সফলভাবে বুকমার্ক করা হয়েছে! 🌟', '🔖');
    }
  };

  // Share Story (Opens rich sharing modal)
  const handleShareStory = () => {
    if (!activeStory) return;
    setSharingStory(activeStory);
  };

  // Save or Update Custom Story
  const handleSaveCustomStory = (story: StoryMetadata) => {
    setCustomStories((prev) => {
      const idx = prev.findIndex((s) => s.id === story.id);
      if (idx >= 0) {
        onShowToast('গল্পটি সফলভাবে আপডেট করা হয়েছে! ✨', '✅');
        const updated = [...prev];
        updated[idx] = story;
        return updated;
      } else {
        onShowToast('আপনার নতুন গল্পটি সফলভাবে প্রকাশিত হয়েছে! 🎉', '✍️');
        return [story, ...prev];
      }
    });
    setEditingStory(null);
  };

  // Delete Custom Story
  const handleDeleteCustomStory = (storyId: string, title: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${title}" গল্পটি মুছে ফেলতে চান?`)) {
      setCustomStories((prev) => prev.filter((s) => s.id !== storyId));
      onShowToast('গল্পটি মুছে ফেলা হয়েছে।', '🗑️');
    }
  };

  // Import story from JSON code
  const handleImportStory = () => {
    try {
      const parsed = JSON.parse(importCode.trim());
      if (parsed && parsed.title && parsed.chapters && Array.isArray(parsed.chapters)) {
        const newStory: StoryMetadata = {
          ...parsed,
          id: `custom-imported-${Date.now()}`,
          slug: `custom-imported-${Date.now()}-${(parsed.slug || 'story').slice(0, 30)}`,
        };
        setCustomStories((prev) => [newStory, ...prev]);
        onShowToast(`"${newStory.title}" গল্পটি সফলভাবে আমদানি করা হয়েছে! 📥`, '🎉');
        setIsImportModalOpen(false);
        setImportCode('');
      } else {
        onShowToast('অকার্যকর গল্প কোড! সঠিক ফরম্যাট দিন।', '⚠️');
      }
    } catch {
      onShowToast('গল্প কোড পার্স করতে ব্যর্থ হয়েছে।', '⚠️');
    }
  };

  // Toggle Text-to-Speech audio reader (Web Speech API)
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      onShowToast('আপনার ব্রাউজারে টেক্সট-টু-স্পিচ সমর্থিত নয়।', '⚠️');
      return;
    }
    if (isAudioPlaying) {
      window.speechSynthesis.cancel();
      setIsAudioPlaying(false);
      onShowToast('অডিও পাঠ বন্ধ করা হয়েছে।', '🔇');
      return;
    }

    if (!activeStory) return;
    const currentChapter = activeStory.chapters[activeChapterIndex];
    const textToRead = isFullStoryMode
      ? activeStory.chapters.map((c) => `${c.title}. ${c.content.join('. ')}`).join('. ')
      : currentChapter
      ? `${currentChapter.title}. ${currentChapter.content.join('. ')}`
      : '';

    if (!textToRead) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'bn-BD';
    utterance.rate = audioSpeed;

    utterance.onend = () => setIsAudioPlaying(false);
    utterance.onerror = () => setIsAudioPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsAudioPlaying(true);
    onShowToast('গল্পের অডিও পাঠ শুরু হয়েছে 🎧', '🔊');
  };

  // Print Story
  const handlePrintStory = () => {
    window.print();
  };

  // Copy Content Text (only for allowed stories)
  const handleCopyStoryText = () => {
    if (!activeStory) return;
    const currentChapter = activeStory.chapters[activeChapterIndex];
    if (!currentChapter) return;
    const textToCopy = `${activeStory.title}\nলেখক: ${activeStory.author}\n${currentChapter.title}\n\n${currentChapter.content.join('\n\n')}\n\nউৎস: The MoSaFa Golpo Ghor (${activeStory.licenseName})`;
    navigator.clipboard.writeText(textToCopy);
    onShowToast('গল্পের অধ্যায় টেক্সট কপি করা হয়েছে! 📄', '✅');
  };

  // Export Reading Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      app: 'MoSaFa Golpo Ghor',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      bookmarks,
      readingHistory,
      readerPrefs,
      customStories,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mosafa-golpo-ghor-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('পড়ার ডাটা ও স্বরচিত গল্প ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে! 📥', '💾');
  };

  // Import Reading Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onShowToast('ফাইল সাইজ অতিরিক্ত বড় (সর্বোচ্চ ২ মেগাবাইট অনুমোদিত)!', '⚠️');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.bookmarks)) {
            setBookmarks(parsed.bookmarks);
          }
          if (parsed.readingHistory && typeof parsed.readingHistory === 'object') {
            setReadingHistory(parsed.readingHistory);
          }
          if (parsed.readerPrefs && typeof parsed.readerPrefs === 'object') {
            setReaderPrefs((prev) => ({ ...prev, ...parsed.readerPrefs }));
          }
          if (Array.isArray(parsed.customStories)) {
            setCustomStories(parsed.customStories);
          }
          onShowToast('ব্যাকআপ ডাটা সফলভাবে পুনরুদ্ধার করা হয়েছে! 🎉', '✅');
          setIsBackupModalOpen(false);
        } else {
          onShowToast('অকার্যকর ব্যাকআপ ফাইল ফরম্যাট!', '⚠️');
        }
      } catch {
        onShowToast('ফাইলটি পড়তে সমস্যা হয়েছে। সঠিক JSON ফাইল নির্বাচন করুন।', '⚠️');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered stories calculation
  const filteredStories = useMemo(() => {
    return allCombinedStories.filter((story) => {
      // Category filter
      if (selectedCategory !== 'all' && story.categorySlug !== selectedCategory) {
        return false;
      }
      // Content type filter
      if (contentTypeFilter !== 'all' && story.contentType !== contentTypeFilter) {
        return false;
      }
      // Reading time filter
      if (readingTimeFilter === 'short' && story.estimatedReadingMinutes > 6) return false;
      if (
        readingTimeFilter === 'medium' &&
        (story.estimatedReadingMinutes <= 6 || story.estimatedReadingMinutes > 12)
      )
        return false;
      if (readingTimeFilter === 'long' && story.estimatedReadingMinutes <= 12) return false;

      // Query filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        story.title.toLowerCase().includes(query) ||
        story.author.toLowerCase().includes(query) ||
        story.category.toLowerCase().includes(query) ||
        story.shortDescription.toLowerCase().includes(query) ||
        story.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [allCombinedStories, searchQuery, selectedCategory, contentTypeFilter, readingTimeFilter]);

  // Featured Story (Story of the day)
  const featuredStory = useMemo(() => {
    return allCombinedStories.find((s) => s.featured) || allCombinedStories[0];
  }, [allCombinedStories]);

  // Bookmarked stories list
  const bookmarkedStories = useMemo(() => {
    return allCombinedStories.filter((s) => bookmarks.includes(s.id));
  }, [allCombinedStories, bookmarks]);

  // Recently read stories list
  const recentlyReadStories = useMemo(() => {
    return Object.values(readingHistory)
      .sort((a, b) => b.lastReadTimestamp - a.lastReadTimestamp)
      .map((record) => {
        const story = allCombinedStories.find((s) => s.id === record.storyId);
        return story ? { ...story, progressRecord: record } : null;
      })
      .filter(Boolean) as (StoryMetadata & { progressRecord: ReadingProgressRecord })[];
  }, [allCombinedStories, readingHistory]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setContentTypeFilter('all');
    setReadingTimeFilter('all');
    onShowToast('সকল ফিল্টার রিসেট করা হয়েছে', '🔄');
  };

  // Reader typography classes
  const fontSizes = {
    small: 'text-base sm:text-lg leading-relaxed',
    medium: 'text-lg sm:text-xl leading-loose',
    large: 'text-xl sm:text-2xl leading-loose',
    xlarge: 'text-2xl sm:text-3xl leading-loose',
  };

  const lineHeights = {
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  };

  const themes = {
    light: 'bg-white text-slate-900 border-slate-200',
    sepia: 'bg-[#fcf8ed] text-[#433422] border-[#e8dfc8]',
    dark: 'bg-[#181a1b] text-[#e8e6e3] border-[#2c3032]',
  };

  // ==========================================
  // RENDER: READER VIEW (যখন কোনো গল্প খোলা থাকে)
  // ==========================================
  if (activeStory) {
    const currentChapter = activeStory.chapters[activeChapterIndex] || activeStory.chapters[0];
    const totalChapters = activeStory.chapters.length;
    const isBookmarked = bookmarks.includes(activeStory.id);

    return (
      <div
        className={`min-h-screen transition-colors duration-200 font-sans print:bg-white print:text-black ${
          readerPrefs.theme === 'sepia'
            ? 'bg-[#fbf7ee] text-[#3d2f1f]'
            : readerPrefs.theme === 'dark'
            ? 'bg-[#121416] text-[#e2e0dc]'
            : 'bg-slate-50 text-slate-900'
        }`}
      >
        {/* Top Reading Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/50 z-50 print:hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-indigo-600 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Reader Floating Header Bar */}
        <header
          className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 transition-colors print:hidden ${
            readerPrefs.theme === 'sepia'
              ? 'bg-[#fbf7ee]/90 border-[#e8dfc8]'
              : readerPrefs.theme === 'dark'
              ? 'bg-[#121416]/90 border-slate-800'
              : 'bg-white/90 border-slate-200'
          }`}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            <button
              onClick={handleCloseReader}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition hover:scale-102 cursor-pointer bg-white/60 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              title="লাইব্রেরিতে ফিরে যান"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>লাইব্রেরি</span>
            </button>

            {/* Middle Title */}
            <div className="hidden sm:block text-center truncate max-w-xs md:max-w-md">
              <h2 className="text-sm font-bold truncate">{activeStory.title}</h2>
              <span className="text-[11px] opacity-70">
                {activeStory.author} • অধ্যায় {currentChapter.chapterNumber}/{totalChapters}
              </span>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Typography & Theme Settings Button */}
              <button
                onClick={() => setIsTypographyMenuOpen(!isTypographyMenuOpen)}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer relative ${
                  isTypographyMenuOpen ? 'bg-indigo-600 text-white' : 'bg-white/70 dark:bg-slate-800'
                }`}
                title="পড়ার ফন্ট ও থিম কাস্টমাইজ করুন"
              >
                <Type className="w-4 h-4" />
              </button>

              {/* Bookmark Toggle */}
              <button
                onClick={() => toggleBookmark(activeStory.id)}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white/70 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
                title={isBookmarked ? 'বুকমার্ক সরানো' : 'বুকমার্ক করুন'}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 fill-white" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              {/* Audio TTS Reader Button */}
              <button
                onClick={handleToggleAudio}
                className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isAudioPlaying
                    ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                    : 'bg-white/70 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={isAudioPlaying ? 'অডিও পাঠ বন্ধ করুন' : '🔊 গল্পটি উচ্চস্বরে শুনুন'}
              >
                {isAudioPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-500" />}
                <span className="hidden md:inline text-[11px]">{isAudioPlaying ? 'থামান' : 'শুনুন'}</span>
              </button>

              {/* Full Continuous Story Mode Toggle */}
              {totalChapters > 1 && (
                <button
                  onClick={() => {
                    setIsFullStoryMode(!isFullStoryMode);
                    onShowToast(
                      !isFullStoryMode
                        ? 'সম্পূর্ণ বই মোড চালু হয়েছে (একসাথে সমস্ত অধ্যায়)'
                        : 'অধ্যায়ভিত্তিক পাঠ মোড চালু হয়েছে',
                      '📖'
                    );
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    isFullStoryMode
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white/70 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                  title={isFullStoryMode ? 'অধ্যায়ভিত্তিক পাঠে ফিরুন' : 'সম্পূর্ণ গল্প একসাথে পড়ুন'}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isFullStoryMode ? 'অধ্যায় মোড' : 'একসাথে সম্পূর্ণ'}</span>
                </button>
              )}

              {/* Share Story */}
              <button
                onClick={handleShareStory}
                className="p-2 rounded-xl border bg-white/70 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                title="শেয়ার করুন"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Print Story */}
              <button
                onClick={handlePrintStory}
                className="hidden sm:flex p-2 rounded-xl border bg-white/70 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                title="প্রিন্ট করুন"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Typography Customizer Drawer */}
          {isTypographyMenuOpen && (
            <div
              className={`max-w-4xl mx-auto mt-3 p-4 rounded-2xl border shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
                readerPrefs.theme === 'sepia'
                  ? 'bg-[#f4ebd6] border-[#dac9a4]'
                  : readerPrefs.theme === 'dark'
                  ? 'bg-[#1c2024] border-slate-700'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                {/* 1. Theme Selection */}
                <div>
                  <span className="block mb-2 opacity-80">পড়ার থিম:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setReaderPrefs((prev) => ({ ...prev, theme: 'light' }))}
                      className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                        readerPrefs.theme === 'light'
                          ? 'border-indigo-600 bg-white text-slate-900 ring-2 ring-indigo-400'
                          : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>সাদা</span>
                    </button>
                    <button
                      onClick={() => setReaderPrefs((prev) => ({ ...prev, theme: 'sepia' }))}
                      className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                        readerPrefs.theme === 'sepia'
                          ? 'border-amber-700 bg-[#f9f2e0] text-[#3d2f1f] ring-2 ring-amber-500'
                          : 'bg-[#f4ebd6] border-[#dfd0af] text-[#554228]'
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5 text-amber-700" />
                      <span>সেপিয়া</span>
                    </button>
                    <button
                      onClick={() => setReaderPrefs((prev) => ({ ...prev, theme: 'dark' }))}
                      className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                        readerPrefs.theme === 'dark'
                          ? 'border-indigo-400 bg-slate-900 text-white ring-2 ring-indigo-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>ডার্ক</span>
                    </button>
                  </div>
                </div>

                {/* 2. Font Size */}
                <div>
                  <span className="block mb-2 opacity-80">ফন্ট সাইজ:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['small', 'medium', 'large', 'xlarge'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setReaderPrefs((prev) => ({ ...prev, fontSize: sz }))}
                        className={`py-2 rounded-xl border font-bold cursor-pointer ${
                          readerPrefs.fontSize === sz
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white/50 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {sz === 'small' && 'ছোট'}
                        {sz === 'medium' && 'মাঝারি'}
                        {sz === 'large' && 'বড়'}
                        {sz === 'xlarge' && 'অতিবড়'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Line Spacing */}
                <div>
                  <span className="block mb-2 opacity-80">লাইনের ব্যবধান:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(['normal', 'relaxed', 'loose'] as const).map((lh) => (
                      <button
                        key={lh}
                        onClick={() => setReaderPrefs((prev) => ({ ...prev, lineHeight: lh }))}
                        className={`py-2 rounded-xl border cursor-pointer ${
                          readerPrefs.lineHeight === lh
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-white/50 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {lh === 'normal' && 'স্বাভাবিক'}
                        {lh === 'relaxed' && 'আরামদায়ক'}
                        {lh === 'loose' && 'ফাঁকা'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Story Reading Content Container */}
        <main
          ref={readerContentRef}
          className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-12 transition-all"
        >
          {/* Story Meta Header */}
          <div className="mb-8 pb-6 border-b border-current/15">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20">
                {activeStory.category}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-500/20 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>আনুমানিক {activeStory.estimatedReadingMinutes} মিনিট পাঠ</span>
              </span>
              {activeStory.id.startsWith('custom-') && (
                <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-500/30">
                  ✍️ স্বরচিত গল্প
                </span>
              )}
              {activeStory.contentType === 'classic' && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs border border-amber-500/20">
                  📜 ধ্রুপদী বাংলা ক্লাসিক
                </span>
              )}
              {activeStory.contentType === 'original' && !activeStory.id.startsWith('custom-') && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                  ✨ MoSaFa মৌলিক গল্প
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {activeStory.title}
            </h1>
            <p className="text-base sm:text-lg font-bold opacity-80 mb-3">
              লেখক: {activeStory.author}
            </p>

            {/* Copyright & Source Attribution Disclosure */}
            <div className="p-3.5 rounded-2xl bg-current/5 border border-current/10 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>কপিরাইট ও লাইসেন্স তথ্য: {activeStory.licenseName}</span>
              </div>
              <p className="opacity-75 leading-relaxed">{activeStory.permissionNote}</p>
              {activeStory.sourceName && (
                <p className="opacity-60 text-[11px]">মূল উৎস: {activeStory.sourceName}</p>
              )}
            </div>

            {/* Chapter Selection Dropdown if multi-chapter and not in full continuous mode */}
            {!isFullStoryMode && totalChapters > 1 && (
              <div className="mt-5 flex items-center justify-between gap-3 p-3 rounded-2xl bg-current/5 border border-current/10 print:hidden">
                <span className="text-xs font-bold">অধ্যায় নির্বাচন:</span>
                <select
                  value={activeChapterIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setActiveChapterIndex(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-800 text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {activeStory.chapters.map((ch, idx) => (
                    <option key={ch.id} value={idx}>
                      অধ্যায় {ch.chapterNumber}: {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Reading Mode Body */}
          {isFullStoryMode ? (
            /* Continuous Full Story Mode: All chapters in a single seamless flow */
            <div className="space-y-14">
              {activeStory.chapters.map((ch, chIdx) => (
                <div key={ch.id} className="space-y-6">
                  <div className="text-center py-4 border-b border-current/15">
                    <span className="text-xs uppercase tracking-widest font-extrabold opacity-60">
                      অধ্যায় {ch.chapterNumber}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold mt-1">{ch.title}</h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-rose-500 to-indigo-600 rounded-full mx-auto mt-2.5" />
                  </div>

                  <article
                    className={`space-y-5 select-text ${fontSizes[readerPrefs.fontSize]} ${
                      lineHeights[readerPrefs.lineHeight]
                    }`}
                  >
                    {ch.content.map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className="leading-relaxed text-justify first-letter:text-2xl first-letter:font-bold first-letter:mr-0.5"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </article>
                </div>
              ))}
            </div>
          ) : (
            /* Chapter-by-Chapter Mode */
            <div>
              {/* Chapter Title */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-1">{currentChapter.title}</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-rose-500 to-indigo-600 rounded-full mt-2" />
              </div>

              {/* Chapter Body Paragraphs */}
              <article
                className={`space-y-5 select-text ${fontSizes[readerPrefs.fontSize]} ${
                  lineHeights[readerPrefs.lineHeight]
                }`}
              >
                {currentChapter.content.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className="leading-relaxed text-justify first-letter:text-2xl first-letter:font-bold first-letter:mr-0.5"
                  >
                    {paragraph}
                  </p>
                ))}
              </article>
            </div>
          )}

          {/* Chapter Bottom Navigation & Actions */}
          <div className="mt-12 pt-6 border-t border-current/15 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeChapterIndex > 0 && (
                <button
                  onClick={() => {
                    setActiveChapterIndex((prev) => Math.max(0, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border bg-white/70 dark:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:scale-102 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী অধ্যায়</span>
                </button>
              )}

              {activeChapterIndex < totalChapters - 1 ? (
                <button
                  onClick={() => {
                    setActiveChapterIndex((prev) => Math.min(totalChapters - 1, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-102 transition cursor-pointer"
                >
                  <span>পরবর্তী অধ্যায়</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>গল্পটি সম্পূর্ণ পড়া হয়েছে! 🎉</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyStoryText}
                className="px-3 py-2 rounded-xl border bg-white/70 dark:bg-slate-800 text-xs font-bold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                title="অধ্যায়ের লেখা কপি করুন"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>টেক্সট কপি</span>
              </button>
              <button
                onClick={handleCloseReader}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold hover:scale-102 transition cursor-pointer"
              >
                লাইব্রেরিতে ফিরুন
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // RENDER: HOMEPAGE LIBRARY VIEW (গল্পের ঘর মূল পাঠাগার)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToHub}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="সকল টুলস পোর্টালে ফিরে যান"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  MoSaFa Golpo Ghor
                </h1>
                <p className="text-[11px] font-semibold text-rose-600">গল্পের ঘর • ডিজিটাল লাইব্রেরি</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="ব্যক্তিগত বুকমার্ক ও রিডিং হিস্ট্রি ব্যাকআপ"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">পড়ার কর্নার</span>
              {bookmarks.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {bookmarks.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-amber-50/70 via-rose-50/30 to-slate-50 border-b border-slate-200/80 px-4 pt-8 pb-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-rose-800 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>বিনামূল্যে উন্মুক্ত বাংলা সাহিত্য ও গল্প পাঠাগার</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            আপনার পছন্দের গল্প,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600">
              আপনার নিজের পড়ার জগৎ
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2.5 max-w-xl mx-auto leading-relaxed">
            রবীন্দ্রনাথ ও শরৎচন্দ্রের অমর ক্লাসিক সাহিত্য থেকে শুরু করে আধুনিক রহস্য, রোমাঞ্চ, ভৌতিক ও পারিবারিক গল্পের এক সমৃদ্ধ ডিজিটাল সংগ্রহশালা।
          </p>

          {/* Prominent Search Bar */}
          <div className="mt-6 max-w-xl mx-auto relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim().toUpperCase() === 'ALL_OK_15') {
                    onShowToast('🔐 সিক্রেট কোড অ্যাক্টিভেটেড (ALL_OK_15): গল্পের ঘরের এই সংস্করণটি সম্পূর্ণ সুরক্ষিত ও সংরক্ষিত আছে!', '🛡️');
                  }
                }}
                placeholder="গল্পের নাম, লেখক বা বিষয় দিয়ে খুঁজুন... যেমন: কঙ্কাল, রবীন্দ্রনাথ, রহস্য, প্রেম"
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-300 shadow-lg shadow-slate-200/50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Main Top Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 flex-wrap">
            <button
              onClick={() => setCurrentTab('library')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition cursor-pointer shadow-xs ${
                currentTab === 'library'
                  ? 'bg-slate-900 text-white ring-2 ring-slate-900/20 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>📚 গল্পের ভাণ্ডার ({allCombinedStories.length})</span>
            </button>

            <button
              onClick={() => setCurrentTab('pdf-shelf')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition cursor-pointer shadow-xs ${
                currentTab === 'pdf-shelf'
                  ? 'bg-slate-900 text-white ring-2 ring-slate-900/20 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-rose-500" />
              <span>📑 পিডিএফ বইঘর ও ই-বুক</span>
            </button>

            <button
              onClick={() => setCurrentTab('custom-stories')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition cursor-pointer shadow-xs ${
                currentTab === 'custom-stories'
                  ? 'bg-slate-900 text-white ring-2 ring-slate-900/20 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>✍️ স্বরচিত গল্প ({customStories.length})</span>
            </button>

            <button
              onClick={() => {
                setEditingStory(null);
                setIsWriteModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 bg-gradient-to-r from-rose-500 to-indigo-600 text-white hover:from-rose-600 hover:to-indigo-700 transition cursor-pointer shadow-md shadow-rose-200 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>গল্প লিখুন ✍️</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-10">
        {/* VIEW 1: PDF Bookshelf & In-App Reader */}
        {currentTab === 'pdf-shelf' && (
          <PdfBookshelf onShowToast={onShowToast} />
        )}

        {/* VIEW 2: Community Custom Stories */}
        {currentTab === 'custom-stories' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Custom Story Banner */}
            <section className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-300 text-xs font-bold backdrop-blur-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>কমিউনিটি লেখক ও স্বরচিত গল্পের উন্মুক্ত মঞ্চ</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    আপনার নিজের লেখা গল্প ও উপন্যাস
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    নিজের গল্প ডিজিটাল বই আকারে তৈরি করুন, ব্রাউজারে পড়ুন এবং যেকোনো মুহূর্তে বন্ধুদের সাথে হোয়াটসঅ্যাপ, টেলিগ্রাম বা ফেসবুকে সরাসরি শেয়ার করুন।
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      setEditingStory(null);
                      setIsWriteModalOpen(true);
                    }}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-900/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন গল্প লিখুন</span>
                  </button>

                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>গল্প কোড আমদানি</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Custom Stories Grid */}
            <section>
              {customStories.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  <span className="text-5xl block">✍️</span>
                  <h4 className="text-base font-extrabold text-slate-800">
                    এখনো কোনো স্বরচিত গল্প প্রকাশ করেননি!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    আপনার মনের কল্পনার গল্প, বাস্তব জীবনের কোনো অনুভূতির কথা অথবা একটি বড় রোমাঞ্চকর কাহিনি লিখে আজই আপনার ব্যক্তিগত সাহিত্য লাইব্রেরি সমৃদ্ধ করুন।
                  </p>
                  <button
                    onClick={() => {
                      setEditingStory(null);
                      setIsWriteModalOpen(true);
                    }}
                    className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md shadow-purple-200 transition"
                  >
                    প্রথম গল্পটি লিখুন ✍️
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {customStories.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => handleOpenStory(story)}
                      className="bg-white rounded-3xl border border-purple-200 shadow-md hover:shadow-xl hover:border-purple-400 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
                    >
                      <div>
                        {/* Cover */}
                        <div
                          className={`h-36 bg-gradient-to-br ${story.coverGradient} p-4 flex flex-col justify-between text-white relative`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider">
                              {story.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/80 backdrop-blur-xs text-[10px] font-bold">
                              ✍️ স্বরচিত
                            </span>
                          </div>

                          <div className="flex items-end justify-between">
                            <span className="text-3xl filter drop-shadow-md">{story.coverIcon}</span>
                            <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{story.estimatedReadingMinutes} মি.</span>
                            </span>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-4 sm:p-5">
                          <h4 className="text-base font-extrabold text-slate-900 group-hover:text-purple-600 transition line-clamp-1">
                            {story.title}
                          </h4>
                          <p className="text-xs font-semibold text-slate-600 mt-0.5">
                            লেখক: {story.author}
                          </p>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {story.shortDescription}
                          </p>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 pt-2 border-t border-slate-100 mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSharingStory(story);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                            title="শেয়ার করুন"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStory(story);
                              setIsWriteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomStory(story.id, story.title);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-purple-600 group-hover:translate-x-1 transition flex items-center gap-1">
                          <span>পড়ুন</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 3: Standard Story Library (২৪০টি বড় গল্প) */}
        {currentTab === 'library' && (
          <div className="space-y-10">
            {/* Category Navigation - 3 Lines, None Hidden (১২টি ক্যাটাগরি ৩টি লাইনে ছড়িয়ে ছিটিয়ে প্রদর্শিত) */}
            <section className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-xl">📚</span>
                <span>গল্পের বিভাগসমূহ (১২টি ক্যাটাগরি • ৩টি লাইনে বিস্তৃত)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                প্রতিটি ক্যাটাগরিতে ২০টি করে গল্প সাজানো রয়েছে • পছন্দমতো বিভাগে ক্লিক করুন
              </p>
            </div>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>🌟 সকল গল্প ({STORIES_DATA.length})</span>
            </button>
          </div>

          {/* 3 Explicit Distributed Lines (4 categories per line, fully visible without horizontal scroll) */}
          <div className="space-y-2 sm:space-y-2.5">
            {[
              { rowNum: 1, cats: STORY_CATEGORIES.slice(0, 4) },
              { rowNum: 2, cats: STORY_CATEGORIES.slice(4, 8) },
              { rowNum: 3, cats: STORY_CATEGORIES.slice(8, 12) },
            ].map(({ rowNum, cats }) => (
              <div key={rowNum} className="grid grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3">
                {cats.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = STORIES_DATA.filter((s) => s.categorySlug === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                      className={`group relative p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white border-transparent shadow-rose-200 ring-2 ring-rose-500/40'
                          : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-rose-200 text-slate-800'
                      }`}
                      title={`${cat.name} (${count}টি গল্প)`}
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5 min-w-0 w-full sm:w-auto">
                        <span className="text-base sm:text-xl shrink-0 p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-xs flex items-center justify-center">
                          {cat.icon}
                        </span>
                        <div className="min-w-0 text-center sm:text-left w-full sm:w-auto">
                          <h4
                            className={`text-[10px] sm:text-xs md:text-sm font-extrabold leading-tight truncate ${
                              isSelected ? 'text-white' : 'text-slate-900 group-hover:text-rose-600'
                            }`}
                          >
                            {cat.name}
                          </h4>
                          <p
                            className={`text-[10px] hidden md:block truncate mt-0.5 ${
                              isSelected ? 'text-white/80' : 'text-slate-500'
                            }`}
                          >
                            {cat.englishName}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}
                      >
                        {count}টি
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* Filters & Content Type Tabs Bar */}
        <section className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>ফিল্টার:</span>
            </span>

            {/* Content Type Filter */}
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 font-bold focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="all">সব কনটেন্ট টাইপ</option>
              <option value="classic">📜 ক্লাসিক সাহিত্য</option>
              <option value="original">✨ মৌলিক গল্প</option>
            </select>

            {/* Reading Duration Filter */}
            <select
              value={readingTimeFilter}
              onChange={(e) => setReadingTimeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 font-bold focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="all">পড়ার সময় (সকল)</option>
              <option value="short">⚡ স্বল্প পাঠ (১-৬ মিনিট)</option>
              <option value="medium">⏱️ মাঝারি (৭-১২ মিনিট)</option>
              <option value="long">📖 দীর্ঘ (১২+ মিনিট)</option>
            </select>
          </div>

          <div className="text-slate-500 font-semibold text-xs flex items-center gap-2">
            <span>ফলাফল: {filteredStories.length}টি গল্প</span>
            {(selectedCategory !== 'all' ||
              contentTypeFilter !== 'all' ||
              readingTimeFilter !== 'all' ||
              searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="text-rose-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>রিসেট</span>
              </button>
            )}
          </div>
        </section>

        {/* Featured Story Banner (Shown when no search/filters are active) */}
        {!searchQuery && selectedCategory === 'all' && contentTypeFilter === 'all' && featuredStory && (
          <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-rose-500/20 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>আজকের বিশেষ গল্প • সম্পাদকীয় পছন্দ</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-2">{featuredStory.title}</h3>
              <p className="text-sm font-bold text-slate-300 mb-3">লেখক: {featuredStory.author}</p>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed mb-6">
                {featuredStory.shortDescription}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleOpenStory(featuredStory)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition hover:scale-102 cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>এখনই পড়ুন 📖</span>
                </button>
                <button
                  onClick={() => toggleBookmark(featuredStory.id)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{bookmarks.includes(featuredStory.id) ? 'বুকমার্কড' : 'বুকমার্ক করুন'}</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Recently Read Stories Section (If any) */}
        {!searchQuery && recentlyReadStories.length > 0 && (
          <section className="bg-amber-50/50 p-5 rounded-3xl border border-amber-200/80">
            <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>আবার পড়ুন (যেখান থেকে পড়া বন্ধ করেছেন)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentlyReadStories.slice(0, 3).map((story) => (
                <div
                  key={story.id}
                  onClick={() => handleOpenStory(story, story.progressRecord.chapterNumber)}
                  className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span>{story.category}</span>
                      <span className="text-amber-700">
                        {story.progressRecord.progressPercent}% পড়া সম্পন্ন
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{story.title}</h4>
                    <p className="text-xs text-slate-500">{story.author}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                    <span>অধ্যায় {story.progressRecord.chapterNumber} থেকে পড়ুন ➡️</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Stories Grid */}
        <section>
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-600" />
              <span>
                {selectedCategory === 'all'
                  ? 'সকল গল্পের তালিকা'
                  : STORY_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'গল্পের তালিকা'}
              </span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {filteredStories.length}টি গল্প উপলব্ধ
            </span>
          </div>

          {filteredStories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredStories
                  .slice(0, selectedCategory === 'all' ? visibleCount : filteredStories.length)
                  .map((story) => {
                    const isBookmarked = bookmarks.includes(story.id);
                    const historyRecord = readingHistory[story.id];

                    return (
                      <div
                        key={story.id}
                        onClick={() => handleOpenStory(story, historyRecord?.chapterNumber || 1)}
                        className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl hover:border-rose-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
                      >
                        <div>
                          {/* Artistic Book Cover Header */}
                          <div
                            className={`h-36 bg-gradient-to-br ${story.coverGradient} p-4 flex flex-col justify-between text-white relative`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider">
                                {story.category}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(story.id);
                                }}
                                className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition cursor-pointer text-white"
                                title="বুকমার্ক করুন"
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck className="w-4 h-4 fill-amber-400 text-amber-400" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            <div className="flex items-end justify-between">
                              <span className="text-3xl filter drop-shadow-md">{story.coverIcon}</span>
                              <span className="text-[11px] font-semibold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{story.estimatedReadingMinutes} মি.</span>
                              </span>
                            </div>
                          </div>

                          {/* Story Card Body */}
                          <div className="p-4 sm:p-5">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              {story.contentType === 'classic' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  ক্লাসিক সাহিত্য
                                </span>
                              )}
                              {story.contentType === 'original' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  মৌলিক গল্প
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-slate-400">
                                {story.chapters.length} অধ্যায়
                              </span>
                            </div>

                            <h4 className="text-base font-extrabold text-slate-900 group-hover:text-rose-600 transition line-clamp-1">
                              {story.title}
                            </h4>
                            <p className="text-xs font-semibold text-slate-600 mt-0.5">
                              লেখক: {story.author}
                            </p>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                              {story.shortDescription}
                            </p>
                          </div>
                        </div>

                        {/* Footer Status & Read Button */}
                        <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                          {historyRecord ? (
                            <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" />
                              <span>{historyRecord.progressPercent}% পড়া হয়েছে</span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">নতুন পাঠ</span>
                          )}

                          <span className="text-xs font-bold text-rose-600 group-hover:translate-x-1 transition flex items-center gap-1">
                            <span>পড়ুন</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Load More Button for All Stories */}
              {selectedCategory === 'all' && visibleCount < filteredStories.length && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition hover:scale-102 cursor-pointer flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>আরও ২৪টি গল্প দেখুন (বাকি {filteredStories.length - visibleCount}টি)</span>
                  </button>
                  <button
                    onClick={() => setVisibleCount(filteredStories.length)}
                    className="px-4 py-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                  >
                    সকল গল্প একসাথে লোড করুন ({filteredStories.length}টি)
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-2xs">
              <span className="text-4xl block mb-2">🔍</span>
              <h4 className="text-base font-bold text-slate-800">কোনো গল্প পাওয়া যায়নি!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                আপনার অনুসন্ধানের সাথে কোনো গল্প মেলেনি। ভিন্ন কোনো শব্দ বা ক্যাটাগরি বেছে নিন।
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer"
              >
                ফিল্টার রিসেট করুন
              </button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>

      {/* Personal Reading Corner / Backup Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">ব্যক্তিগত পড়ার কর্নার ও ব্যাকআপ</h3>
              </div>
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Privacy Disclosure Notice */}
              <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl text-indigo-950 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>১০০% ক্লায়েন্ট-সাইড গোপনীয়তা:</strong> কোনো লগইন বা পাসওয়ার্ডের প্রয়োজন নেই। আপনার সমস্ত বুকমার্ক ও পড়ার অগ্রগতি কেবল এই ব্রাউজারেই সংরক্ষিত থাকে। ব্রাউজার ক্যাশ মুছলে তা হারাতে পারে, তাই ব্যাকআপ ফাইল সংরক্ষণ করুন।
                </p>
              </div>

              {/* Bookmarked stories mini list */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span>আপনার বুকমার্কসমূহ:</span>
                  <span className="text-rose-600">{bookmarkedStories.length}টি গল্প</span>
                </h4>
                {bookmarkedStories.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {bookmarkedStories.map((story) => (
                      <div
                        key={story.id}
                        onClick={() => {
                          setIsBackupModalOpen(false);
                          handleOpenStory(story);
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between cursor-pointer border border-slate-200"
                      >
                        <span className="font-bold text-slate-800 truncate mr-2">{story.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{story.author}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">এখনো কোনো গল্প বুকমার্ক করেননি।</p>
                )}
              </div>

              {/* Export / Import Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>বুকমার্ক ও পড়ার ডাটা ডাউনলোড (JSON Export)</span>
                </button>

                <label className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-300">
                  <Upload className="w-4 h-4" />
                  <span>সংরক্ষিত ব্যাকআপ ফাইল রিস্টোর (JSON Import)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Story Writer Modal */}
      <CustomStoryModal
        isOpen={isWriteModalOpen}
        editingStory={editingStory}
        onClose={() => {
          setIsWriteModalOpen(false);
          setEditingStory(null);
        }}
        onSave={handleSaveCustomStory}
        onShowToast={onShowToast}
      />

      {/* Story Share Modal */}
      <StoryShareModal
        story={sharingStory}
        onClose={() => setSharingStory(null)}
        onShowToast={onShowToast}
      />

      {/* Import Story Code Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
                <span>গল্পের কোড আমদানি করুন</span>
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              আপনার বন্ধুর শেয়ার করা গল্পের JSON কোডটি নিচের বক্সে পেস্ট করুন:
            </p>
            <textarea
              rows={6}
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="গল্পের কোড (JSON) এখানে পেস্ট করুন..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleImportStory}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                আমদানি করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
