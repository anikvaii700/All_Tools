import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Camera,
  Upload,
  User,
  Phone,
  Mail,
  CheckCircle,
  RefreshCw,
  Megaphone,
  Type,
  FileText,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Settings2,
  Sparkles,
  Palette,
  Check,
} from 'lucide-react';
import { useDeveloperContact } from '../hooks/useDeveloperContact';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { config, saveConfig, resetToDefault, isLoading } = useDeveloperContact();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notice'>('notice');
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Enforce password prompt on every single open and reset upon exit
  useEffect(() => {
    setIsUnlocked(false);
    setAdminPinInput('');
    setPinError('');
    setShowPassword(false);
    setSaveSuccess(false);
  }, [isOpen]);

  const handleClose = () => {
    setIsUnlocked(false);
    setAdminPinInput('');
    setPinError('');
    setShowPassword(false);
    onClose();
  };

  // Profile edit fields
  const [editPhotoUrl, setEditPhotoUrl] = useState(config.photoUrl);
  const [editName, setEditName] = useState(config.name);
  const [editDesignation, setEditDesignation] = useState(config.designation);
  const [editPhone, setEditPhone] = useState(config.phoneDisplay);
  const [editWhatsapp, setEditWhatsapp] = useState(config.whatsappNumber);
  const [editEmail, setEditEmail] = useState(config.email);
  const [uploadError, setUploadError] = useState('');

  // Notice Banner edit fields
  const [editNoticeEnabled, setEditNoticeEnabled] = useState(config.noticeEnabled ?? true);
  const [editNoticeTitle, setEditNoticeTitle] = useState(config.noticeTitle || '');
  const [editNoticeContent, setEditNoticeContent] = useState(config.noticeContent || '');
  const [editNoticeBadge, setEditNoticeBadge] = useState(config.noticeBadge || 'জরুরি নোটিশ');
  const [editNoticeVariant, setEditNoticeVariant] = useState<'gradient' | 'info' | 'highlight' | 'custom'>(
    config.noticeVariant || 'gradient'
  );
  const [editNoticeBgColor, setEditNoticeBgColor] = useState(config.noticeBgColor || '#fff1f2');
  const [editNoticeTextColor, setEditNoticeTextColor] = useState(config.noticeTextColor || '#334155');
  const [editNoticeTitleColor, setEditNoticeTitleColor] = useState(config.noticeTitleColor || '#e11d48');
  const [editNoticeBadgeBg, setEditNoticeBadgeBg] = useState(config.noticeBadgeBg || '#f43f5e');
  const [editNoticeBadgeTextColor, setEditNoticeBadgeTextColor] = useState(
    config.noticeBadgeTextColor || '#ffffff'
  );
  const [editNoticeBorderColor, setEditNoticeBorderColor] = useState(
    config.noticeBorderColor || '#fecdd3'
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever config changes
  useEffect(() => {
    setEditPhotoUrl(config.photoUrl);
    setEditName(config.name);
    setEditDesignation(config.designation);
    setEditPhone(config.phoneDisplay);
    setEditWhatsapp(config.whatsappNumber);
    setEditEmail(config.email);

    setEditNoticeEnabled(config.noticeEnabled ?? true);
    setEditNoticeTitle(config.noticeTitle || 'The MoSaFa Tools — গুরুত্বপূর্ণ নোটিশ ও তথ্যাবলি');
    setEditNoticeContent(
      config.noticeContent ||
        'আমাদের সকল ২৩টি অনলাইন ডিজিটাল টুলস সম্পূর্ণ ফ্রি ও মোবাইল ফ্রেন্ডলি।'
    );
    setEditNoticeBadge(config.noticeBadge || 'জরুরি নোটিশ');
    setEditNoticeVariant(config.noticeVariant || 'gradient');
    setEditNoticeBgColor(config.noticeBgColor || '#fff1f2');
    setEditNoticeTextColor(config.noticeTextColor || '#334155');
    setEditNoticeTitleColor(config.noticeTitleColor || '#e11d48');
    setEditNoticeBadgeBg(config.noticeBadgeBg || '#f43f5e');
    setEditNoticeBadgeTextColor(config.noticeBadgeTextColor || '#ffffff');
    setEditNoticeBorderColor(config.noticeBorderColor || '#fecdd3');
  }, [config]);

  if (!isOpen) return null;

  // Handle Photo File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    if (!file.type.startsWith('image/')) {
      setUploadError('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 600px dimension for fast loading and Firestore quota safety
        const maxDim = 600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setEditPhotoUrl(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save All Changes
  const handleSave = async () => {
    await saveConfig({
      photoUrl: editPhotoUrl,
      name: editName,
      designation: editDesignation,
      phoneDisplay: editPhone,
      whatsappNumber: editWhatsapp,
      email: editEmail,
      noticeEnabled: editNoticeEnabled,
      noticeTitle: editNoticeTitle,
      noticeContent: editNoticeContent,
      noticeBadge: editNoticeBadge,
      noticeVariant: editNoticeVariant,
      noticeBgColor: editNoticeBgColor,
      noticeTextColor: editNoticeTextColor,
      noticeTitleColor: editNoticeTitleColor,
      noticeBadgeBg: editNoticeBadgeBg,
      noticeBadgeTextColor: editNoticeBadgeTextColor,
      noticeBorderColor: editNoticeBorderColor,
    });
    setSaveSuccess(true);
    onShowToast?.('এডমিন সেটিংস সফলভাবে সংরক্ষিত হয়েছে! 🎉', '✅');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Password Unlock Verification (Supports 224700 and 22470, with Bengali numerals)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bnToEn: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    };
    const cleanPin = adminPinInput.trim().replace(/[০-৯]/g, (d) => bnToEn[d] || d);

    if (cleanPin === '224700' || cleanPin === '22470') {
      setIsUnlocked(true);
      setPinError('');
      onShowToast?.('এডমিন প্যানেল সফলভাবে আনলক হয়েছে 🔓', '🔑');
    } else {
      setPinError('ভুল পাসওয়ার্ড! সঠিক এডমিন পাসওয়ার্ড দিন (ইঙ্গিত: 2****0)।');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl bg-white rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl border border-slate-200 relative my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  The MoSaFa এডমিন কন্ট্রোল প্যানেল
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  গোপন এক্সেস 🔐
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                ছবি, নাম ও টুলসের উপরের নোটিশ/শিরোনাম সরাসরি পরিবর্তন করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                type="button"
                onClick={() => {
                  setIsUnlocked(false);
                  setAdminPinInput('');
                  setPinError('');
                  onShowToast?.('এডমিন প্যানেল পুনরায় লক করা হয়েছে 🔒', '🔐');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition cursor-pointer border border-slate-200"
                title="প্যানেল লক করুন"
              >
                <Lock className="w-3.5 h-3.5 text-rose-500" />
                <span>লক করুন</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
              aria-label="পপআপ বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8">
          {!isUnlocked ? (
            /* PIN Protection Form */
            <form
              onSubmit={handlePinSubmit}
              className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 text-center max-w-md mx-auto my-6 shadow-xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200">
                <KeyRound className="w-7 h-7" />
              </div>
              <h4 className="font-extrabold text-base text-slate-900 mb-1">
                এডমিন নিরাপত্তা যাচাই (পাসওয়ার্ড)
              </h4>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                অনাকাঙ্ক্ষিত পরিবর্তন এড়াতে যতবারই প্রবেশ করবেন ততবারই পাসওয়ার্ড দিতে হবে।
                <br />
                পাসওয়ার্ড ইঙ্গিত:{' '}
                <span className="font-mono font-extrabold text-indigo-600 bg-indigo-50 px-3 py-0.5 rounded-md border border-indigo-200 tracking-widest text-sm">
                  2****0
                </span>
              </p>
              <div className="flex gap-2 max-w-xs mx-auto">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="পাসওয়ার্ড লিখুন"
                    autoFocus
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPassword ? 'লুকান' : 'দেখুন'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md active:scale-95 transition shrink-0"
                >
                  আনলক করুন
                </button>
              </div>
              {pinError && <p className="text-xs text-rose-600 font-bold mt-3 animate-in fade-in">{pinError}</p>}
            </form>
          ) : (
            /* Full Admin Controls */
            <div className="space-y-6">
              {saveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>সকল তথ্য ও নোটিশ সফলভাবে সংরক্ষিত হয়েছে এবং লাইভ আপডেট হয়েছে! 🎉</span>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('notice')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'notice'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Megaphone className="w-4 h-4 text-rose-500" />
                  <span>১. টুলসের নোটিশ ও শিরোনাম</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>২. ডেভেলপার প্রোফাইল ও ছবি</span>
                </button>
              </div>

              {/* TAB 1: NOTICE & INFORMATION BANNER ABOVE TOOLS */}
              {activeTab === 'notice' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="p-4 rounded-3xl bg-indigo-50/60 border border-indigo-100">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <Megaphone className="w-4 h-4 text-indigo-600" />
                          <span>সার্চ ও টুলসের মাঝের নোটিশ ব্যানার</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          সার্চ বাটনের নিচে ও সকল অনলাইন টুলস ক্যাটাগরি বারের উপরে এই শিরোনাম ও তথ্যগুলো দৃশ্যমান হবে।
                        </p>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer shrink-0">
                        <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                          {editNoticeEnabled ? 'ব্যানার চালু ✅' : 'ব্যানার বন্ধ ❌'}
                        </span>
                        <input
                          type="checkbox"
                          checked={editNoticeEnabled}
                          onChange={(e) => setEditNoticeEnabled(e.target.checked)}
                          className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Banner Fields */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xs">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        নোটিশ ব্যাজ (Badge):
                      </label>
                      <input
                        type="text"
                        value={editNoticeBadge}
                        onChange={(e) => setEditNoticeBadge(e.target.value)}
                        placeholder="যেমন: জরুরি নোটিশ / নতুন আপডেট / বিশেষ ঘোষণা"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        প্রধান শিরোনাম (Title):
                      </label>
                      <input
                        type="text"
                        value={editNoticeTitle}
                        onChange={(e) => setEditNoticeTitle(e.target.value)}
                        placeholder="যেমন: The MoSaFa Tools — গুরুত্বপূর্ণ নোটিশ ও তথ্যাবলি"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        বিস্তারিত তথ্য ও বার্তা (Details / Information):
                      </label>
                      <textarea
                        rows={4}
                        value={editNoticeContent}
                        onChange={(e) => setEditNoticeContent(e.target.value)}
                        placeholder="এখানে ব্যবহারকারীদের জন্য প্রয়োজনীয় যেকোনো নোটিশ বা তথ্য শেয়ার করুন..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                      />
                    </div>

                    {/* Comprehensive Color Customization Section */}
                    <div className="bg-gradient-to-br from-slate-50 via-indigo-50/20 to-pink-50/20 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Palette className="w-4 h-4 text-indigo-600" />
                          <span>নোটিশের ব্যাকগ্রাউন্ড ও লেখার কালার কাস্টমাইজেশন</span>
                        </label>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                          লাইভ কালার পিকার 🎨
                        </span>
                      </div>

                      {/* 1. Quick 1-Click Complete Color Themes */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                          ✨ এক ক্লিকে আকর্ষণীয় রেডিমেড থিম সেট:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            {
                              name: 'সফট রোজ পিংক',
                              bg: '#fff1f2',
                              text: '#334155',
                              title: '#e11d48',
                              badge: '#f43f5e',
                              border: '#fecdd3',
                              badgeText: '#ffffff',
                            },
                            {
                              name: 'স্লিক ডার্ক মোড',
                              bg: '#0f172a',
                              text: '#f1f5f9',
                              title: '#38bdf8',
                              badge: '#e11d48',
                              border: '#334155',
                              badgeText: '#ffffff',
                            },
                            {
                              name: 'ওশান স্কাই ব্লু',
                              bg: '#f0f9ff',
                              text: '#0369a1',
                              title: '#0284c7',
                              badge: '#0284c7',
                              border: '#bae6fd',
                              badgeText: '#ffffff',
                            },
                            {
                              name: 'ফ্রেশ এমারেল্ড গ্রিন',
                              bg: '#f0fdf4',
                              text: '#166534',
                              title: '#15803d',
                              badge: '#16a34a',
                              border: '#bbf7d0',
                              badgeText: '#ffffff',
                            },
                            {
                              name: 'গোল্ডেন অ্যাম্বার',
                              bg: '#fffbeb',
                              text: '#92400e',
                              title: '#b45309',
                              badge: '#d97706',
                              border: '#fde68a',
                              badgeText: '#ffffff',
                            },
                            {
                              name: 'রয়্যাল পার্পল',
                              bg: '#faf5ff',
                              text: '#581c87',
                              title: '#7e22ce',
                              badge: '#9333ea',
                              border: '#e9d5ff',
                              badgeText: '#ffffff',
                            },
                            {
                              name: 'ক্রিমসন রেড',
                              bg: '#fef2f2',
                              text: '#7f1d1d',
                              title: '#b91c1c',
                              badge: '#dc2626',
                              border: '#fecaca',
                              badgeText: '#ffffff',
                            },
                            {
                              name: 'ডার্ক পার্পল নাইট',
                              bg: 'linear-gradient(to right, #0f172a, #2e1065, #0f172a)',
                              text: '#f8fafc',
                              title: '#f472b6',
                              badge: '#e11d48',
                              border: '#4c1d95',
                              badgeText: '#ffffff',
                            },
                          ].map((theme, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setEditNoticeBgColor(theme.bg);
                                setEditNoticeTextColor(theme.text);
                                setEditNoticeTitleColor(theme.title);
                                setEditNoticeBadgeBg(theme.badge);
                                setEditNoticeBadgeTextColor(theme.badgeText);
                                setEditNoticeBorderColor(theme.border);
                                setEditNoticeVariant('custom');
                              }}
                              className="p-2 rounded-xl border text-left transition hover:scale-[1.02] cursor-pointer shadow-2xs flex items-center gap-2"
                              style={{
                                background: theme.bg,
                                borderColor: theme.border,
                                color: theme.text,
                              }}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                                style={{ backgroundColor: theme.badge }}
                              />
                              <span className="text-[11px] font-bold truncate">
                                {theme.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Background Color Picker & Swatches */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                            <span>১. ব্যাকগ্রাউন্ড কালার (Background Color):</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {editNoticeBgColor.startsWith('linear') ? 'গ্রেডিয়েন্ট' : editNoticeBgColor}
                            </span>
                            <label className="relative cursor-pointer shrink-0" title="কাস্টম ব্যাকগ্রাউন্ড কালার নির্বাচন করুন">
                              <input
                                type="color"
                                value={editNoticeBgColor.startsWith('#') ? editNoticeBgColor : '#fff1f2'}
                                onChange={(e) => {
                                  setEditNoticeBgColor(e.target.value);
                                  setEditNoticeVariant('custom');
                                }}
                                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Swatches for Background */}
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: 'রোজ', bg: '#fff1f2', border: '#fecdd3' },
                            { name: 'ডার্ক স্লেট', bg: '#0f172a', border: '#334155' },
                            { name: 'স্কাই ব্লু', bg: '#f0f9ff', border: '#bae6fd' },
                            { name: 'মিন্ট গ্রিন', bg: '#f0fdf4', border: '#bbf7d0' },
                            { name: 'গোল্ডেন', bg: '#fffbeb', border: '#fde68a' },
                            { name: 'পার্পল', bg: '#faf5ff', border: '#e9d5ff' },
                            { name: 'ক্রিমসন', bg: '#fef2f2', border: '#fecaca' },
                            { name: 'সাদা', bg: '#ffffff', border: '#e2e8f0' },
                            { name: 'রোজ গ্রেডিয়েন্ট', bg: 'linear-gradient(to right, #fff1f2, #fdf2f8, #eef2ff)', border: '#fbcfe8' },
                            { name: 'ডার্ক ইন্ডিগো', bg: 'linear-gradient(to right, #0f172a, #1e1b4b, #0f172a)', border: '#4338ca' },
                          ].map((c, i) => {
                            const isSelected = editNoticeBgColor === c.bg;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setEditNoticeBgColor(c.bg);
                                  setEditNoticeBorderColor(c.border);
                                  setEditNoticeVariant('custom');
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                                  isSelected
                                    ? 'ring-2 ring-indigo-600 font-extrabold scale-105'
                                    : 'hover:scale-102'
                                }`}
                                style={{
                                  background: c.bg,
                                  borderColor: c.border,
                                  color: c.bg.includes('#0f172a') ? '#ffffff' : '#1e293b',
                                }}
                              >
                                {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                                <span>{c.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Text Color Picker & Swatches */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                            <span>২. লেখার কালার (Text / Message Color):</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {editNoticeTextColor}
                            </span>
                            <label className="relative cursor-pointer shrink-0" title="কাস্টম লেখার কালার নির্বাচন করুন">
                              <input
                                type="color"
                                value={editNoticeTextColor.startsWith('#') ? editNoticeTextColor : '#334155'}
                                onChange={(e) => {
                                  setEditNoticeTextColor(e.target.value);
                                  setEditNoticeVariant('custom');
                                }}
                                className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Swatches for Text Color */}
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: 'গাঢ় স্লেট / কালো', color: '#1e293b' },
                            { name: 'উজ্জ্বল সাদা', color: '#ffffff' },
                            { name: 'রোজ রেড', color: '#e11d48' },
                            { name: 'রয়্যাল ব্লু', color: '#1d4ed8' },
                            { name: 'এমারেল্ড গ্রিন', color: '#047857' },
                            { name: 'গোল্ডেন অ্যাম্বার', color: '#b45309' },
                            { name: 'পার্পল ভায়োলেট', color: '#7c3aed' },
                          ].map((t, i) => {
                            const isSelected = editNoticeTextColor === t.color;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setEditNoticeTextColor(t.color);
                                  setEditNoticeVariant('custom');
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 cursor-pointer bg-white ${
                                  isSelected
                                    ? 'ring-2 ring-indigo-600 border-indigo-400 font-extrabold scale-105'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <span
                                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300 shadow-2xs"
                                  style={{ backgroundColor: t.color }}
                                />
                                <span style={{ color: t.color === '#ffffff' ? '#64748b' : t.color }}>
                                  {t.name}
                                </span>
                                {isSelected && <Check className="w-3 h-3 text-indigo-600 ml-0.5" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 4. Title & Badge Color Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                        {/* Title Highlight Color */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800">
                              ৩. শিরোনামের কালার (Title Color):
                            </label>
                            <label className="relative cursor-pointer shrink-0">
                              <input
                                type="color"
                                value={editNoticeTitleColor.startsWith('#') ? editNoticeTitleColor : '#e11d48'}
                                onChange={(e) => {
                                  setEditNoticeTitleColor(e.target.value);
                                  setEditNoticeVariant('custom');
                                }}
                                className="w-6 h-6 rounded-md border border-slate-300 cursor-pointer p-0.5 bg-white"
                              />
                            </label>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {[
                              { name: 'রোজ', color: '#e11d48' },
                              { name: 'স্কাই ব্লু', color: '#0284c7' },
                              { name: 'গ্রিন', color: '#16a34a' },
                              { name: 'অ্যাম্বার', color: '#d97706' },
                              { name: 'পার্পল', color: '#9333ea' },
                              { name: 'সাদা', color: '#ffffff' },
                            ].map((c, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setEditNoticeTitleColor(c.color)}
                                className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                                  editNoticeTitleColor === c.color
                                    ? 'ring-1 ring-indigo-500 border-indigo-400 font-extrabold'
                                    : 'border-slate-200 bg-white'
                                }`}
                                style={{ color: c.color === '#ffffff' ? '#64748b' : c.color }}
                              >
                                {c.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Badge Background Color */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800">
                              ৪. ব্যাজ কালার (Badge Color):
                            </label>
                            <label className="relative cursor-pointer shrink-0">
                              <input
                                type="color"
                                value={editNoticeBadgeBg.startsWith('#') ? editNoticeBadgeBg : '#f43f5e'}
                                onChange={(e) => {
                                  setEditNoticeBadgeBg(e.target.value);
                                  setEditNoticeVariant('custom');
                                }}
                                className="w-6 h-6 rounded-md border border-slate-300 cursor-pointer p-0.5 bg-white"
                              />
                            </label>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {[
                              { name: 'রোজ', color: '#f43f5e' },
                              { name: 'ব্লু', color: '#2563eb' },
                              { name: 'গ্রিন', color: '#16a34a' },
                              { name: 'অরেঞ্জ', color: '#ea580c' },
                              { name: 'পার্পল', color: '#9333ea' },
                              { name: 'ডার্ক', color: '#0f172a' },
                            ].map((c, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setEditNoticeBadgeBg(c.color);
                                  setEditNoticeBadgeTextColor('#ffffff');
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-bold border transition text-white ${
                                  editNoticeBadgeBg === c.color
                                    ? 'ring-2 ring-slate-800 scale-105'
                                    : 'border-transparent'
                                }`}
                                style={{ backgroundColor: c.color }}
                              >
                                {c.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview of Notice Banner */}
                  <div className="border border-slate-200 rounded-3xl p-4 bg-slate-50">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                      লাইভ প্রিভিউ (ওয়েবসাইটে কেমন দেখাবে):
                    </span>
                    {editNoticeEnabled ? (
                      <div
                        style={{
                          background: editNoticeBgColor,
                          borderColor: editNoticeBorderColor,
                          color: editNoticeTextColor,
                        }}
                        className="p-2.5 sm:p-3 rounded-2xl border shadow-xs flex items-center gap-2 overflow-hidden transition"
                      >
                        <span
                          style={{
                            background: editNoticeBadgeBg,
                            color: editNoticeBadgeTextColor,
                          }}
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs shrink-0"
                        >
                          {editNoticeBadge || 'নোটিশ'}
                        </span>
                        <div className="flex-1 overflow-hidden relative py-0.5">
                          <div className="animate-notice-marquee flex items-center select-none">
                            <div
                              className="flex items-center gap-3 pr-8 text-xs font-bold"
                              style={{ color: editNoticeTextColor }}
                            >
                              <span
                                className="font-black tracking-tight"
                                style={{ color: editNoticeTitleColor }}
                              >
                                {editNoticeTitle || 'শিরোনাম'}
                              </span>
                              <span className="opacity-40 font-normal">|</span>
                              <span style={{ color: editNoticeTextColor }}>
                                {editNoticeContent || 'এখানে আপনার তথ্যাবলি...'}
                              </span>
                              <span
                                className="text-[10px] px-1.5 py-0.2 rounded font-bold border"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.25)',
                                  borderColor: 'rgba(255,255,255,0.4)',
                                  color: editNoticeTextColor,
                                }}
                              >
                                The MoSaFa
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-3 pr-8 text-xs font-bold"
                              style={{ color: editNoticeTextColor }}
                            >
                              <span
                                className="font-black tracking-tight"
                                style={{ color: editNoticeTitleColor }}
                              >
                                {editNoticeTitle || 'শিরোনাম'}
                              </span>
                              <span className="opacity-40 font-normal">|</span>
                              <span style={{ color: editNoticeTextColor }}>
                                {editNoticeContent || 'এখানে আপনার তথ্যাবলি...'}
                              </span>
                              <span
                                className="text-[10px] px-1.5 py-0.2 rounded font-bold border"
                                style={{
                                  backgroundColor: 'rgba(255,255,255,0.25)',
                                  borderColor: 'rgba(255,255,255,0.4)',
                                  color: editNoticeTextColor,
                                }}
                              >
                                The MoSaFa
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                        ব্যানার বর্তমানে বন্ধ রয়েছে (ওয়েবসাইটে দৃশ্যমান হবে না)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DEVELOPER PROFILE & PHOTO */}
              {activeTab === 'profile' && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Photo Section */}
                  <div className="bg-gradient-to-r from-indigo-50/70 to-pink-50/70 border border-indigo-100 rounded-3xl p-5">
                    <label className="text-xs font-black text-slate-800 block mb-3 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>ডেভেলপার ছবি পরিবর্তন (Photo Upload)</span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Photo Preview */}
                      <div className="relative w-32 h-44 rounded-2xl overflow-hidden border-2 border-indigo-300 shadow-md bg-slate-100 shrink-0">
                        <img
                          src={editPhotoUrl || '/developer_portrait.png'}
                          alt="Developer Preview"
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/developer_portrait.png';
                          }}
                        />
                        <span className="absolute bottom-1 inset-x-1 bg-black/60 backdrop-blur-xs text-[9px] text-white text-center py-0.5 rounded">
                          লাইভ প্রিভিউ
                        </span>
                      </div>

                      {/* Photo Actions */}
                      <div className="flex-1 space-y-3 w-full">
                        <div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                          >
                            <Upload className="w-4 h-4" />
                            <span>মোবাইল বা পিসি থেকে ছবি বেছে নিন 📁</span>
                          </button>
                          <p className="text-[11px] text-slate-500 mt-1.5">
                            মোবাইলের গ্যালারি বা কম্পিউটার থেকে যেকোনো ছবি নির্বাচন করুন।
                          </p>
                        </div>

                        {uploadError && (
                          <p className="text-xs text-rose-600 font-bold">{uploadError}</p>
                        )}

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            অথবা সরাসরি ছবির URL লিংক দিন (ঐচ্ছিক):
                          </label>
                          <input
                            type="text"
                            value={editPhotoUrl}
                            onChange={(e) => setEditPhotoUrl(e.target.value)}
                            placeholder="https://example.com/photo.jpg"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Fields */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                    <label className="text-xs font-black text-slate-800 block uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-700" />
                      <span>নাম ও যোগাযোগের তথ্য</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          ডেভেলপারের নাম:
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="মোঃ আনিসুল ইসলাম"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          পদবি / ক্যাপশন (ছবির নিচে প্রদর্শিত):
                        </label>
                        <input
                          type="text"
                          value={editDesignation}
                          onChange={(e) => setEditDesignation(e.target.value)}
                          placeholder="ডাটা এন্ট্রি অপারেটর"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          হোয়াটসঅ্যাপ নাম্বার (মেসেজ যাওয়ার জন্য):
                        </label>
                        <input
                          type="text"
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                          placeholder="8801868775577"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          স্ক্রিনে প্রদর্শিত ফোন নাম্বার:
                        </label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+8801868775577"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          ইমেইল এড্রেস:
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="anikvaii700@gmail.com"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ডিফল্ট তথ্য রিসেট</span>
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    বন্ধ করুন
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isLoading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন (Save)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
