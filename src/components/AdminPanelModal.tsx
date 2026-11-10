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
  MessageSquare,
  BookOpen,
  CheckCircle2,
  Trash2,
  XCircle,
  Users,
  UserX,
  Coins,
  Ban,
  RotateCcw,
  Search,
  Filter,
  ShieldAlert,
  Award,
  AlertTriangle,
  Clock,
  Plus,
  CreditCard,
  Copy,
} from 'lucide-react';
import { useDeveloperContact } from '../hooks/useDeveloperContact';
import { storySubmissionService, SubmittedStory } from '../services/storySubmissionService';
import { adminUserService, ManagedUser, DepositRequest } from '../services/adminUserService';
import { usePaymentMode } from '../hooks/usePaymentMode';
import { PaymentMode } from '../services/paymentModeService';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

export const AUTHORIZED_ADMIN_PHONE = '01743224700';
export const AUTHORIZED_ADMIN_SYNTHETIC_EMAIL = 'user_01743224700@phone.mosafabd.com';

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
  const { loginWithPhone } = useAuth();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [activeTab, setActiveTab] = useState<'support' | 'notice' | 'profile' | 'stories' | 'users'>('support');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Submitted stories management state
  const [submittedStories, setSubmittedStories] = useState<SubmittedStory[]>([]);
  const [storyFilter, setStoryFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [storyPreview, setStoryPreview] = useState<SubmittedStory | null>(null);

  // User Management state
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);

  // Add Money Sub-Modal State (Default to 'balance' / মূল ব্যালেন্স)
  const [selectedUserForMoney, setSelectedUserForMoney] = useState<ManagedUser | null>(null);
  const [addMoneyTarget, setAddMoneyTarget] = useState<'balance' | 'coins'>('balance'); // 'balance' (টাকা / BDT) vs 'coins'
  const [addMoneyBdt, setAddMoneyBdt] = useState<number>(50); // Minimum 50 BDT
  const [addMoneyCoins, setAddMoneyCoins] = useState<number>(500); // 500 coins = 5 BDT
  const [addMoneyNote, setAddMoneyNote] = useState('');

  // Status Modal State
  const [selectedUserForStatus, setSelectedUserForStatus] = useState<ManagedUser | null>(null);
  const [editStatusTarget, setEditStatusTarget] = useState<'active' | 'suspended' | 'banned'>('active');
  const [editBanReason, setEditBanReason] = useState('');
  const [editSuspensionDays, setEditSuspensionDays] = useState<number>(7);

  // Global Site Payment Mode: 'ON' vs 'OFF'
  const { mode: paymentMode, setPaymentMode } = usePaymentMode();

  const handleTogglePaymentMode = async (newMode: PaymentMode) => {
    try {
      await setPaymentMode(newMode);
      if (newMode === 'ON') {
        onShowToast?.('পেমেন্ট গেটওয়ে সফলভাবে চালু করা হয়েছে (Payment ON) 💳', '🟢');
      } else {
        onShowToast?.('পেমেন্ট গেটওয়ে বন্ধ করা হয়েছে (Payment OFF - সম্পূর্ণ ফ্রি সাইট) 🆓', '🟢');
      }
    } catch {
      onShowToast?.('মোড পরিবর্তন করতে সমস্যা হয়েছে', '⚠️');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const unsubStories = storySubmissionService.subscribe((list) => {
      setSubmittedStories(list);
    });
    const unsubUsers = adminUserService.subscribe((list) => {
      setManagedUsers(list);
    });
    const unsubDeposits = adminUserService.subscribeDeposits((reqs) => {
      setDepositRequests(reqs);
    });
    return () => {
      unsubStories();
      unsubUsers();
      unsubDeposits();
    };
  }, [isOpen]);

  // Verify administrator identity upon open or auth state change
  const currentEmail = auth.currentUser?.email?.toLowerCase() || '';
  const currentPhone = auth.currentUser?.phoneNumber || '';
  const isCurrentUserAdmin = Boolean(
    auth.currentUser &&
      (currentEmail === AUTHORIZED_ADMIN_SYNTHETIC_EMAIL ||
        currentPhone === '+8801743224700' ||
        currentPhone === '01743224700')
  );

  useEffect(() => {
    if (isOpen) {
      setAdminAuthError('');
      if (isCurrentUserAdmin) {
        (async () => {
          try {
            const token = await auth.currentUser?.getIdToken();
            if (token) {
              const res = await fetch('/api/admin/verify', {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                setIsUnlocked(true);
                adminUserService.syncFromFirestore(true);
              } else {
                const data = await res.json().catch(() => ({}));
                setIsUnlocked(false);
                setAdminAuthError(data.error || 'অ্যাক্সেস ডিনাইড (HTTP 403 Forbidden)');
              }
            } else {
              setIsUnlocked(false);
            }
          } catch {
            setIsUnlocked(true);
            adminUserService.syncFromFirestore(true);
          }
        })();
      } else {
        setIsUnlocked(false);
      }
    }
  }, [isOpen, isCurrentUserAdmin]);

  const handleAdminPhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin.trim()) {
      setAdminAuthError('পাসওয়ার্ড লিখুন');
      return;
    }
    try {
      setIsAuthenticating(true);
      setAdminAuthError('');
      await loginWithPhone(AUTHORIZED_ADMIN_PHONE, adminPin);
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const res = await fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setIsUnlocked(true);
          adminUserService.syncFromFirestore(true);
          onShowToast?.('প্রধান অ্যাডমিন (01743224700) একাউন্ট সফলভাবে যাচাইকৃত 🔓', '🔑');
        } else {
          const data = await res.json().catch(() => ({}));
          setAdminAuthError(data.error || 'অননুমোদিত অ্যাডমিন টোকেন (HTTP 403)');
        }
      }
    } catch (err: any) {
      setAdminAuthError(err?.message || 'লগইন করতে সমস্যা হয়েছে।');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAdminSwitchAccount = async () => {
    try {
      await signOut(auth);
      setIsUnlocked(false);
      setAdminPin('');
      setAdminAuthError('');
      onShowToast?.('লগআউট সম্পন্ন হয়েছে। 01743224700 দিয়ে লগইন করুন।', 'ℹ️');
    } catch (err: any) {
      setAdminAuthError('লগআউট ত্রুটি: ' + (err?.message || 'সমস্যা'));
    }
  };

  const handleClose = () => {
    setIsUnlocked(false);
    setAdminAuthError('');
    onClose();
  };

  // Support Popup Content edit fields (The exact text in user screenshot)
  const [editSupportSubtitle, setEditSupportSubtitle] = useState(
    config.supportSubtitle ||
      'আপনার যেকোনো তথ্য বিশদভাবে জানতে বা যেকোনো টেকনিক্যাল সহায়তার জন্য সরাসরি আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন। আমাদের টিম ২৪/৭ আপনাকে সাহায্য করতে প্রস্তুত।'
  );
  const [editSupportHeading, setEditSupportHeading] = useState(
    config.supportHeading || 'প্রফেশনাল সাপোর্ট নিন।'
  );
  const [editSupportBadge, setEditSupportBadge] = useState(
    config.supportBadge || 'সাপোর্ট ও ইনকোয়ারি'
  );

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
    setEditSupportSubtitle(
      config.supportSubtitle ||
        'আপনার যেকোনো তথ্য বিশদভাবে জানতে বা যেকোনো টেকনিক্যাল সহায়তার জন্য সরাসরি আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন। আমাদের টিম ২৪/৭ আপনাকে সাহায্য করতে প্রস্তুত।'
    );
    setEditSupportHeading(config.supportHeading || 'প্রফেশনাল সাপোর্ট নিন।');
    setEditSupportBadge(config.supportBadge || 'সাপোর্ট ও ইনকোয়ারি');

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
        'আমাদের সকল ২৩টি অনলাইন ডিজিটাল টুলস অত্যন্ত সুরক্ষিত, নির্ভরযোগ্য ও মোবাইল ফ্রেন্ডলি।'
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
      supportBadge: editSupportBadge,
      supportHeading: editSupportHeading,
      supportSubtitle: editSupportSubtitle,
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
                  সুরক্ষিত এক্সেস 🔐
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
            /* Secure Firebase Admin Authentication Screen */
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 text-center max-w-md mx-auto my-6 shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="font-black text-lg text-slate-900 mb-1">
                The MoSaFa এডমিন নিরাপত্তা যাচাই
              </h4>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                অননুমোদিত অ্যাক্সেস সম্পূর্ণ নিষিদ্ধ। শুধুমাত্র ভেরিফাইড অ্যাডমিনিস্ট্রেটর অ্যাকাউন্ট দিয়ে সাইন-ইন করে এই নিয়ন্ত্রণ প্যানেলে প্রবেশ করা যাবে।
              </p>

              {auth.currentUser ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">বর্তমান সাইন-ইন একাউন্ট</span>
                    <p className="text-xs font-extrabold text-slate-800 break-all">{auth.currentUser.phoneNumber || auth.currentUser.email || 'অজ্ঞাত ইউজার'}</p>
                    <span className="inline-block mt-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      ⚠️ অ্যাডমিন অনুমতি নেই (শুধুমাত্র 01743224700 অনুমোদিত)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdminSwitchAccount}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>লগআউট করে 01743224700 দিয়ে লগইন করুন</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAdminPhoneLogin} className="space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      অনুমোদিত অ্যাডমিন মোবাইল নম্বর
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={AUTHORIZED_ADMIN_PHONE}
                        readOnly
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-700 font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      পাসওয়ার্ড / পিন
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={adminPin}
                        onChange={(e) => setAdminPin(e.target.value)}
                        placeholder="পাসওয়ার্ড লিখুন"
                        required
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAuthenticating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>অ্যাডমিন হিসেবে সাইন-ইন করুন</span>
                  </button>
                </form>
              )}

              {adminAuthError && (
                <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
                  {adminAuthError}
                </div>
              )}
            </div>
          ) : (
            /* Full Admin Controls */
            <div className="space-y-6">
              {saveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>সকল তথ্য ও নোটিশ সফলভাবে সংরক্ষিত হয়েছে এবং লাইভ আপডেট হয়েছে! 🎉</span>
                </div>
              )}

              {/* Global System Payment Mode Controller: Payment ON vs Payment OFF */}
              <div
                className={`p-4 rounded-3xl border-2 transition-all shadow-sm ${
                  paymentMode === 'ON'
                    ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-400'
                    : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-amber-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          paymentMode === 'ON' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      />
                      <h4 className="text-sm font-black text-slate-900">
                        সিস্টেম পেমেন্ট মোড:{' '}
                        <span
                          className={
                            paymentMode === 'ON'
                              ? 'text-emerald-700 font-extrabold'
                              : 'text-amber-700 font-extrabold'
                          }
                        >
                          Payment {paymentMode}
                        </span>
                      </h4>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          paymentMode === 'ON'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {paymentMode === 'ON' ? 'পেমেন্ট সক্রিয় (৫ টাকা ফি)' : 'সম্পূর্ণ ফ্রি সাইট (কোনো ফি নেই)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {paymentMode === 'ON'
                        ? '🟢 বর্তমানে পেমেন্ট চালু আছে: প্রতিটি পিডিএফ ডাউনলোড করতে মূল ব্যালেন্স থেকে ৫ টাকা কর্তন করা হবে।'
                        : '🟡 বর্তমানে পেমেন্ট বন্ধ (ফ্রি মোড): কোনো ইউজার থেকে কোনো টাকা কাটা হবে না, ক্লিক করলেই সরাসরি ডাউনলোড হবে।'}
                    </p>
                  </div>

                  {/* Mode Toggle Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePaymentMode('ON')}
                      className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                        paymentMode === 'ON'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-500 ring-offset-1'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Payment ON</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePaymentMode('OFF')}
                      className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                        paymentMode === 'OFF'
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-200 ring-2 ring-amber-500 ring-offset-1'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Payment OFF (ফ্রি)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('support')}
                  className={`flex-1 min-w-[110px] py-2 px-2 sm:px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'support'
                      ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-emerald-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>১. সাপোর্ট টেক্সট</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notice')}
                  className={`flex-1 min-w-[110px] py-2 px-2 sm:px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'notice'
                      ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 text-rose-500" />
                  <span>২. নোটিশ ব্যানার</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 min-w-[90px] py-2 px-2 sm:px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-indigo-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>৩. প্রোফাইল</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('stories')}
                  className={`flex-1 min-w-[100px] py-2 px-2 sm:px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
                    activeTab === 'stories'
                      ? 'bg-white text-amber-700 shadow-xs ring-1 ring-amber-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>৪. জমা গল্প</span>
                  {submittedStories.filter((s) => s.status === 'pending').length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-black animate-pulse">
                      {submittedStories.filter((s) => s.status === 'pending').length}
                    </span>
                  )}
                </button>

                {/* TAB 5: USER CONTROL & ADD MONEY (NEW REQUIREMENT) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 min-w-[130px] py-2 px-2 sm:px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
                    activeTab === 'users'
                      ? 'bg-white text-rose-700 shadow-xs ring-1 ring-rose-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-rose-600" />
                  <span>৫. ইউজার ও এড মানি</span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-1.5 py-0.5 rounded-full">
                    {managedUsers.length}
                  </span>
                </button>
              </div>

              {/* TAB 1: SUPPORT POPUP CONTENT (THE EXACT USER REQUESTED TEXT) */}
              {activeTab === 'support' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="p-4 rounded-3xl bg-emerald-50/80 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>সাপোর্ট পপআপের মূল লেখা ও বিবরণী পরিবর্তন</span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                            লাইভ এডিটর
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          সরাসরি ডেভেলপারকে মেসেজ দিন পপআপের মূল বিবরণী টেক্সট, শিরোনাম ও ব্যাজ এখান থেকে নিজের ইচ্ছামতো পরিবর্তন করতে পারবেন।
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-2xs">
                    {/* The Exact Target Field Highlighted in the User's Screenshot */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-rose-50/40 border-2 border-amber-300 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                          <span>সাপোর্ট বিবরণী / বার্তা (স্ক্রিনশটের লাল বক্সে চিহ্নিত লেখাটি):</span>
                        </label>
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded-md border border-rose-200">
                          মূল টেক্সট ফিল্ড ✍️
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-2.5 leading-relaxed font-medium">
                        পপআপে সাপোর্ট নিন শিরোনামের নিচে যে লেখাটি দেখা যায়, তা নিচের বক্সে পরিবর্তন করে নিচে <strong>"সংরক্ষণ করুন (Save)"</strong> বাটনে ক্লিক করুন:
                      </p>
                      <textarea
                        rows={4}
                        value={editSupportSubtitle}
                        onChange={(e) => setEditSupportSubtitle(e.target.value)}
                        placeholder="আপনার যেকোনো তথ্য বিশদভাবে জানতে বা যেকোনো টেকনিক্যাল সহায়তার জন্য সরাসরি আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন..."
                        className="w-full px-3.5 py-3 rounded-xl border-2 border-slate-300 focus:border-emerald-500 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white resize-y shadow-inner leading-relaxed"
                      />
                      <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-500">
                        <span>মোট অক্ষর: <strong className="font-mono text-slate-700">{editSupportSubtitle.length}</strong>টি</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditSupportSubtitle(
                              'আপনার যেকোনো তথ্য বিশদভাবে জানতে বা যেকোনো টেকনিক্যাল সহায়তার জন্য সরাসরি আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন। আমাদের টিম ২৪/৭ আপনাকে সাহায্য করতে প্রস্তুত।'
                            )
                          }
                          className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                        >
                          ডিফল্ট টেক্সট ফেরত আনুন
                        </button>
                      </div>
                    </div>

                    {/* Support Heading & Badge Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-1">
                          সাপোর্ট প্রধান শিরোনাম (Heading):
                        </label>
                        <input
                          type="text"
                          value={editSupportHeading}
                          onChange={(e) => setEditSupportHeading(e.target.value)}
                          placeholder="যেমন: প্রফেশনাল সাপোর্ট নিন।"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-1">
                          সাপোর্ট টপ ব্যাজ (Badge):
                        </label>
                        <input
                          type="text"
                          value={editSupportBadge}
                          onChange={(e) => setEditSupportBadge(e.target.value)}
                          placeholder="যেমন: সাপোর্ট ও ইনকোয়ারি"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Preview Card */}
                  <div className="border border-slate-200 rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 shadow-xs">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-3">
                      লাইভ প্রিভিউ (পপআপে ঠিক যেমন দেখাবে):
                    </span>

                    <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-md max-w-xl mx-auto space-y-3">
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs font-bold">
                          {editSupportBadge || 'সাপোর্ট ও ইনকোয়ারি'}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        {editSupportHeading ? (
                          editSupportHeading.includes('সাপোর্ট') ? (
                            <>
                              {editSupportHeading.split('সাপোর্ট')[0]}
                              <span className="text-emerald-500">সাপোর্ট</span>
                              {editSupportHeading.split('সাপোর্ট')[1]}
                            </>
                          ) : (
                            editSupportHeading
                          )
                        ) : (
                          <>
                            প্রফেশনাল <span className="text-emerald-500">সাপোর্ট</span> নিন।
                          </>
                        )}
                      </h3>

                      <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/90">
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium">
                          {editSupportSubtitle ||
                            'আপনার যেকোনো তথ্য বিশদভাবে জানতে বা যেকোনো টেকনিক্যাল সহায়তার জন্য সরাসরি আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন। আমাদের টিম ২৪/৭ আপনাকে সাহায্য করতে প্রস্তুত।'}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 pt-2 border-t border-slate-100 text-xs text-slate-600 font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">ফোন নাম্বার:</span>
                          <span className="font-bold text-slate-800">{editPhone}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans">ইমেইল এড্রেস:</span>
                          <span className="font-bold text-slate-800">{editEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: NOTICE & INFORMATION BANNER ABOVE TOOLS */}
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

              {/* TAB 4: SUBMITTED STORIES REVIEW & APPROVAL */}
              {activeTab === 'stories' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="p-4 rounded-3xl bg-amber-50/80 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>ইউজারদের জমা দেওয়া গল্প ও আমল যাচাই-বাছাই</span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                            এডমিন অনুমোদন
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          ইউজাররা যেসকল গল্প বা ইস্তেগফার আমল লিখেছেন, তা এখান থেকে যাচাই করে "অনুমোদন দিন" বাটনে চাপলে স্বয়ংক্রিয়ভাবে সাইটে লাইভ হবে।
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
                    {[
                      { id: 'pending', label: `⏳ পেন্ডিং (${submittedStories.filter((s) => s.status === 'pending').length})` },
                      { id: 'approved', label: `✅ লাইভ (${submittedStories.filter((s) => s.status === 'approved').length})` },
                      { id: 'rejected', label: `❌ বাতিল (${submittedStories.filter((s) => s.status === 'rejected').length})` },
                      { id: 'all', label: `সব (${submittedStories.length})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStoryFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                          storyFilter === tab.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Stories list */}
                  <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                    {submittedStories
                      .filter((s) => storyFilter === 'all' || s.status === storyFilter)
                      .length === 0 ? (
                      <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                        কোনো গল্প পাওয়া যায়নি
                      </div>
                    ) : (
                      submittedStories
                        .filter((s) => storyFilter === 'all' || s.status === storyFilter)
                        .map((story) => (
                          <div
                            key={story.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              story.status === 'pending'
                                ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                                : story.status === 'approved'
                                ? 'bg-white border-emerald-200'
                                : 'bg-slate-50 border-slate-200 opacity-70'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="space-y-1 max-w-lg">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    story.storyType === 'islamic'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}>
                                    {story.storyType === 'islamic' ? '📿 ইসলামিক আমল' : '📖 স্বরচিত গল্প'}
                                  </span>
                                  <span className="text-xs text-slate-500 font-semibold">
                                    {story.categoryLabel}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    • {new Date(story.submittedAt).toLocaleDateString('bn-BD')}
                                  </span>
                                </div>
                                <h4 className="text-sm font-black text-slate-900">
                                  {story.title}
                                </h4>
                                <p className="text-xs text-slate-600">
                                  লেখক: <span className="font-bold">{story.author}</span> {story.authorContact && `(${story.authorContact})`}
                                </p>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                  {story.shortDescription}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0">
                                <button
                                  type="button"
                                  onClick={() => setStoryPreview(story)}
                                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>পড়ুন</span>
                                </button>

                                {story.status !== 'approved' && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await storySubmissionService.approveStory(story.id);
                                      onShowToast?.(`"${story.title}" গল্পটি লাইভ অনুমোদন করা হয়েছে! 🎉`, '✅');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer shadow-xs"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>অনুমোদন (Live)</span>
                                  </button>
                                )}

                                {story.status === 'pending' && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await storySubmissionService.rejectStory(story.id);
                                      onShowToast?.(`গল্পটি বাতিল করা হয়েছে`, '❌');
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold cursor-pointer"
                                  >
                                    বাতিল
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm('মুছে ফেলতে চান?')) {
                                      await storySubmissionService.deleteStory(story.id);
                                      onShowToast?.('গল্পটি মুছে ফেলা হয়েছে', '🗑️');
                                    }
                                  }}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title="মুছুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  {/* Story Preview Modal */}
                  {storyPreview && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 mt-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{storyPreview.title}</h4>
                        <button
                          type="button"
                          onClick={() => setStoryPreview(null)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2 text-xs text-slate-700 max-h-48 overflow-y-auto">
                        {storyPreview.content.map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: USER MANAGEMENT, ADD MONEY & BAN/SUSPENSION (NEW REQUIREMENT) */}
              {activeTab === 'users' && (
                <div className="space-y-5 animate-in fade-in">
                  {/* Top Intro Banner */}
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-50 via-pink-50 to-indigo-50 border border-rose-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                            <span>ইউজার কন্ট্রোল, ব্যালেন্স এড মানি ও ব্যান ব্যবস্থাপনা</span>
                            <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-full">
                              ফুল কন্ট্রোল
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            সকল নিবন্ধিত ব্যবহারকারীদের তথ্য দেখুন, কয়েন বা টাকা এড মানি করে দিন এবং প্রয়োজন অনুযায়ী সাময়িক বন্ধ বা ব্যান করুন।
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          adminUserService.syncFromFirestore();
                          onShowToast?.('ইউজার তালিকা রিফ্রেশ করা হয়েছে 🔄', '👥');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">রিফ্রেশ</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  {(() => {
                    const totalUsers = managedUsers.length;
                    const activeCount = managedUsers.filter((u) => u.status === 'active').length;
                    const suspendedCount = managedUsers.filter((u) => u.status === 'suspended').length;
                    const bannedCount = managedUsers.filter((u) => u.status === 'banned').length;
                    const totalCoinsPool = managedUsers.reduce((sum, u) => sum + (u.coins || 0), 0);
                    const totalBdtEquivalent = (totalCoinsPool / 100).toFixed(2);

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">
                            মোট ইউজার
                          </span>
                          <span className="text-xl font-black text-slate-900">
                            {totalUsers}
                          </span>
                          <span className="text-[10px] text-slate-400 block">নিবন্ধিত প্রোফাইল</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
                          <span className="text-[10px] text-emerald-700 font-bold block uppercase">
                            সক্রিয় একাউন্ট
                          </span>
                          <span className="text-xl font-black text-emerald-700">
                            {activeCount}
                          </span>
                          <span className="text-[10px] text-emerald-600 block">স্বাভাবিক ব্যবহারকারী</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
                          <span className="text-[10px] text-amber-800 font-bold block uppercase">
                            স্থগিত ও ব্যান
                          </span>
                          <span className="text-xl font-black text-amber-900">
                            {suspendedCount + bannedCount}
                          </span>
                          <span className="text-[10px] text-amber-700 block">
                            স্থগিত: {suspendedCount} • ব্যান: {bannedCount}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-2xs">
                          <span className="text-[10px] text-indigo-700 font-bold block uppercase">
                            মোট কয়েন পুল
                          </span>
                          <span className="text-xl font-black text-indigo-900 font-mono">
                            {totalCoinsPool}
                          </span>
                          <span className="text-[10px] text-indigo-600 block font-bold">
                            ৳ {totalBdtEquivalent} টাকা মান
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* PENDING DEPOSIT REQUESTS VERIFICATION QUEUE */}
                  {(() => {
                    const pendingList = depositRequests.filter((r) => r.status === 'pending');
                    if (pendingList.length === 0) return null;

                    return (
                      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-2 border-emerald-300 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                              ৳
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                                <span>বিকাশ এড মানি রিকোয়েস্ট যাচাই ও অনুমোদন</span>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black animate-pulse">
                                  {pendingList.length}টি পেন্ডিং
                                </span>
                              </h4>
                              <p className="text-[11px] text-slate-600">
                                ইউজারের পাঠানো TrxID বিকাশ স্টেটমেন্টের সাথে মিলিয়ে নিশ্চিত হয়ে মূল ব্যালেন্সে টাকা এড করুন।
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pendingList.map((req) => (
                            <div
                              key={req.id}
                              className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2.5 flex flex-col justify-between"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-xs text-slate-900">{req.userName}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">({req.userPhone})</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    {new Date(req.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })} • {new Date(req.createdAt).toLocaleDateString('bn-BD')}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm sm:text-base font-black text-emerald-700 font-mono block">
                                    ৳{req.amount}
                                  </span>
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                    মূল ব্যালেন্স
                                  </span>
                                </div>
                              </div>

                              {/* TrxID Box with Copy Button */}
                              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-500 font-bold block">বিকাশ TrxID:</span>
                                  <span className="font-mono font-black text-indigo-700 tracking-wider">
                                    {req.trxId}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(req.trxId);
                                    setCopiedTrxId(req.id);
                                    setTimeout(() => setCopiedTrxId(null), 2000);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{copiedTrxId === req.id ? 'কপি হয়েছে!' : 'কপি TrxID'}</span>
                                </button>
                              </div>

                              {/* Approve / Reject Actions */}
                              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (window.confirm(`${req.userName}-এর রিকোয়েস্টটি বাতিল করতে চান?`)) {
                                      await adminUserService.rejectDepositRequest(req.id, 'ভুল বা অকার্যকর TrxID');
                                      onShowToast?.('রিকোয়েস্ট বাতিল করা হয়েছে।', '⚠️');
                                    }
                                  }}
                                  className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition cursor-pointer"
                                >
                                  বাতিল
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await adminUserService.approveDepositRequest(req.id);
                                    onShowToast?.(
                                      `${req.userName}-এর মূল ব্যালেন্সে ৳${req.amount} টাকা সফলভাবে যোগ করা হয়েছে! 💰`,
                                      '✅'
                                    );
                                  }}
                                  className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>যাচাই ও মূল ব্যালেন্সে ৳{req.amount} দিন</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Search & Status Filters */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="নাম, মোবাইল বা ইমেইল দিয়ে খুঁজুন..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { key: 'all', label: 'সকল' },
                        { key: 'active', label: 'সক্রিয়' },
                        { key: 'suspended', label: 'স্থগিত' },
                        { key: 'banned', label: 'ব্যান' },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setUserStatusFilter(tab.key as any)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer whitespace-nowrap ${
                            userStatusFilter === tab.key
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered Users List */}
                  {(() => {
                    const cleanQuery = userSearchQuery.trim().toLowerCase();
                    const filteredUsers = managedUsers.filter((u) => {
                      if (userStatusFilter !== 'all' && u.status !== userStatusFilter) {
                        return false;
                      }
                      if (!cleanQuery) return true;
                      const matchName = u.displayName.toLowerCase().includes(cleanQuery);
                      const matchPhone = u.phoneNumber ? u.phoneNumber.includes(cleanQuery) : false;
                      const matchEmail = u.email ? u.email.toLowerCase().includes(cleanQuery) : false;
                      return matchName || matchPhone || matchEmail;
                    });

                    if (filteredUsers.length === 0) {
                      return (
                        <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-3xl text-slate-500 space-y-2">
                          <Users className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-sm font-bold">কোন ব্যবহারকারী পাওয়া যায়নি</p>
                          <p className="text-xs">অনুসন্ধান বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {filteredUsers.map((userItem) => {
                          const today = new Date().toISOString().split('T')[0];
                          const hasSpunToday = userItem.lastSpinDate === today;
                          const bdtVal = (userItem.coins / 100).toFixed(2);

                          return (
                            <div
                              key={userItem.uid}
                              className={`p-4 rounded-2xl border transition bg-white shadow-2xs space-y-3 ${
                                userItem.status === 'banned'
                                  ? 'border-rose-300 bg-rose-50/20'
                                  : userItem.status === 'suspended'
                                  ? 'border-amber-300 bg-amber-50/20'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {/* User Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ${
                                      userItem.status === 'banned'
                                        ? 'bg-rose-600'
                                        : userItem.status === 'suspended'
                                        ? 'bg-amber-600'
                                        : 'bg-gradient-to-tr from-pink-600 to-indigo-600'
                                    }`}
                                  >
                                    {userItem.displayName.charAt(0) || 'U'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-extrabold text-sm text-slate-900">
                                        {userItem.displayName}
                                      </h5>
                                      {userItem.phoneNumber === '01743224700' && (
                                        <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full">
                                          অ্যাডমিন 👑
                                        </span>
                                      )}
                                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded-md">
                                        {userItem.authProvider === 'google' ? 'Google' : 'মোবাইল'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono">
                                      {userItem.phoneNumber || userItem.email || 'তথ্য অপ্রাপ্য'}
                                    </p>
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center gap-2">
                                  {userItem.status === 'active' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>সক্রিয় (Active)</span>
                                    </span>
                                  )}
                                  {userItem.status === 'suspended' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>সাময়িক স্থগিত (Suspended)</span>
                                    </span>
                                  )}
                                  {userItem.status === 'banned' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 text-[11px] font-extrabold">
                                      <Ban className="w-3 h-3 text-rose-600" />
                                      <span>স্থায়ী ব্যান (Banned)</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Ban / Suspension Reason Box */}
                              {userItem.banReason && (
                                <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold">স্থগিত/ব্যানের কারণ: </span>
                                    <span>{userItem.banReason}</span>
                                    {userItem.suspendedUntil && (
                                      <span className="text-[10px] text-rose-700 block mt-0.5">
                                        মেয়াদকাল: {new Date(userItem.suspendedUntil).toLocaleDateString('bn-BD')} পর্যন্ত
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Balance & Spin details + Action Buttons */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                                    <span className="text-emerald-800 font-bold">মূল ব্যালেন্স:</span>
                                    <strong className="text-emerald-950 font-mono text-sm font-black">
                                      ৳{(userItem.balance || 0).toFixed(2)}
                                    </strong>
                                  </div>

                                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-1.5">
                                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="text-amber-800 font-bold">কয়েন:</span>
                                    <strong className="text-amber-950 font-mono text-sm font-black">
                                      {userItem.coins}
                                    </strong>
                                    <span className="text-[10px] text-amber-700">
                                      (৳{bdtVal})
                                    </span>
                                  </div>

                                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1 text-[11px]">
                                    <span className="text-slate-500">স্পিন:</span>
                                    <span className={hasSpunToday ? 'text-slate-500 font-medium' : 'text-emerald-700 font-bold'}>
                                      {hasSpunToday ? 'আজ সমাপ্ত' : 'আজ এখনও স্পিন করেনি'}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions Group */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {/* Add Money Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedUserForMoney(userItem);
                                      setAddMoneyTarget('balance'); // Default to main balance (টাকা / BDT)
                                      setAddMoneyBdt(50);
                                      setAddMoneyCoins(500);
                                      setAddMoneyNote('বিকাশ মার্চেন্ট TrxID ভেরিফাইড এড মানি');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-xs cursor-pointer transition active:scale-95"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>এড মানি (+/-)</span>
                                  </button>

                                  {/* Status / Ban / Suspend Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedUserForStatus(userItem);
                                      setEditStatusTarget(userItem.status);
                                      setEditBanReason(userItem.banReason || '');
                                      setEditSuspensionDays(7);
                                    }}
                                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                                    <span>স্ট্যাটাস পরিবর্তন</span>
                                  </button>

                                  {/* Reset Spin */}
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await adminUserService.resetDailySpin(userItem.uid);
                                      onShowToast?.(`${userItem.displayName}-এর আজকের স্পিন রিসেট করা হয়েছে 🎡`, '🔄');
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
                                    title="আজকের স্পিন রিসেট করুন যাতে ইউজার আবারও স্পিন করতে পারে"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>স্পিন রিসেট</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* SUB-MODAL 1: ADD MONEY POPUP */}
                  {selectedUserForMoney && (
                    <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
                      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                              ৳
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900">
                                ব্যালেন্স এড মানি / কয়েন সমন্বয়
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                ইউজার: {selectedUserForMoney.displayName}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedUserForMoney(null)}
                            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                          >
                            <X className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>

                        {/* Current User Balance Indicator */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-500 font-medium">মূল ব্যালেন্স: </span>
                            <span className="font-black text-emerald-700 font-mono text-sm">
                              ৳{(selectedUserForMoney.balance || 0).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">কয়েন: </span>
                            <span className="font-black text-amber-600 font-mono text-sm">
                              {selectedUserForMoney.coins}
                            </span>
                          </div>
                        </div>

                        {/* TARGET BALANCE TOGGLE: মূল ব্যালেন্স vs কয়েন ব্যালেন্স */}
                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setAddMoneyTarget('balance')}
                            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              addMoneyTarget === 'balance'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>মূল ব্যালেন্স (টাকা / BDT)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddMoneyTarget('coins')}
                            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              addMoneyTarget === 'coins'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>কয়েন ব্যালেন্স (Coins)</span>
                          </button>
                        </div>

                        {/* ================= OPTION A: মূল ব্যালেন্সে টাকা এড মানি ================= */}
                        {addMoneyTarget === 'balance' ? (
                          <>
                            {/* Notice Banner */}
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium leading-relaxed">
                              ✓ বিকাশ TrxID ও পেমেন্ট যাচাই করে ইউজারের <strong>মূল ব্যালেন্সে টাকা</strong> যোগ করুন। ইউজার এই ব্যালেন্স দিয়ে সরকারি ফরম ও সিভি ডাউনলোড করতে পারবে।
                            </div>

                            {/* BDT Quick Presets */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 block">
                                দ্রুত টাকার পরিমাণ নির্বাচন (টাকা / BDT):
                              </label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[
                                  { label: '+৳৫০', amount: 50 },
                                  { label: '+৳১০০', amount: 100 },
                                  { label: '+৳২০০', amount: 200 },
                                  { label: '+৳৫০০', amount: 500 },
                                  { label: '+৳১০০০', amount: 1000 },
                                  { label: '+৳২০০০', amount: 2000 },
                                  { label: '-৳৫০', amount: -50 },
                                ].map((preset, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setAddMoneyBdt(preset.amount)}
                                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                      addMoneyBdt === preset.amount
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Custom BDT Amount Input */}
                            <div>
                              <label className="text-xs font-bold text-slate-800 block mb-1">
                                মূল ব্যালেন্সে টাকার পরিমাণ (টাকা / ৳ BDT):
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-700 font-mono">
                                  ৳
                                </span>
                                <input
                                  type="number"
                                  value={addMoneyBdt}
                                  onChange={(e) => setAddMoneyBdt(Number(e.target.value))}
                                  placeholder="যেমন: 50 বা 100 বা 500"
                                  className="w-full pl-8 pr-24 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                                  টাকা (BDT)
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-medium">
                                <span>বর্তমান: ৳{(selectedUserForMoney.balance || 0).toFixed(2)}</span>
                                <span className="font-bold text-emerald-700">
                                  ➔ নতুন ব্যালেন্স হবে: ৳{Math.max(0, (selectedUserForMoney.balance || 0) + addMoneyBdt).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* TrxID / Verification Note */}
                            <div>
                              <label className="text-xs font-bold text-slate-800 block mb-1">
                                বিকাশ TrxID / ভেরিফিকেশন নোট:
                              </label>
                              <input
                                type="text"
                                value={addMoneyNote}
                                onChange={(e) => setAddMoneyNote(e.target.value)}
                                placeholder="যেমন: বিকাশ TrxID: BL6A8D2Q যাচাইকৃত ও অনুমোদিত"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>

                            {/* Submit Main Balance Action */}
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setSelectedUserForMoney(null)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
                              >
                                বাতিল
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await adminUserService.addMainBalance(
                                    selectedUserForMoney.uid,
                                    addMoneyBdt,
                                    addMoneyNote || `বিকাশ TrxID ভেরিফাইড এড মানি (+৳${addMoneyBdt})`
                                  );
                                  onShowToast?.(
                                    `${selectedUserForMoney.displayName}-এর মূল একাউন্টে ৳${addMoneyBdt} টাকা সফলভাবে যুক্ত হয়েছে! 💰`,
                                    '✅'
                                  );
                                  setSelectedUserForMoney(null);
                                }}
                                className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-95"
                              >
                                <Check className="w-4 h-4" />
                                <span>মূল ব্যালেন্সে ৳{addMoneyBdt} টাকা নিশ্চিত করুন</span>
                              </button>
                            </div>
                          </>
                        ) : (
                          /* ================= OPTION B: কয়েন ব্যালেন্স সমন্বয় ================= */
                          <>
                            {/* Coin Presets */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 block">
                                দ্রুত কয়েন নির্বাচন (১০০ কয়েন = ১ টাকা):
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: '+৫০ (৳০.৫০)', coins: 50 },
                                  { label: '+১০০ (৳১)', coins: 100 },
                                  { label: '+৫০০ (৳৫)', coins: 500 },
                                  { label: '+১০০০ (৳১০)', coins: 1000 },
                                  { label: '+২৫০০ (৳২৫)', coins: 2500 },
                                  { label: '-৫০০ (-৳৫)', coins: -500 },
                                ].map((preset, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setAddMoneyCoins(preset.coins)}
                                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                                      addMoneyCoins === preset.coins
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Custom Coin Input */}
                            <div>
                              <label className="text-xs font-bold text-slate-800 block mb-1">
                                কয়েনের পরিমাণ (Coins):
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={addMoneyCoins}
                                  onChange={(e) => setAddMoneyCoins(Number(e.target.value))}
                                  placeholder="যেমন: 500"
                                  className="w-full pl-3 pr-20 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700">
                                  = ৳{(addMoneyCoins / 100).toFixed(2)} টাকা
                                </div>
                              </div>
                            </div>

                            {/* Admin Note Input */}
                            <div>
                              <label className="text-xs font-bold text-slate-800 block mb-1">
                                কয়েন এড মানির কারণ / নোট:
                              </label>
                              <input
                                type="text"
                                value={addMoneyNote}
                                onChange={(e) => setAddMoneyNote(e.target.value)}
                                placeholder="যেমন: রেফারেল বা বোনাস কয়েন প্রদান"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                              />
                            </div>

                            {/* Submit Coin Action */}
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setSelectedUserForMoney(null)}
                                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
                              >
                                বাতিল
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await adminUserService.addMoney(
                                    selectedUserForMoney.uid,
                                    addMoneyCoins,
                                    addMoneyNote || 'অ্যাডমিন কর্তৃক কয়েন সমন্বয়'
                                  );
                                  onShowToast?.(
                                    `${selectedUserForMoney.displayName}-কে ${addMoneyCoins} কয়েন সফলভাবে যোগ করা হয়েছে! 🪙`,
                                    '✅'
                                  );
                                  setSelectedUserForMoney(null);
                                }}
                                className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-95"
                              >
                                <Check className="w-4 h-4" />
                                <span>কয়েন সমন্বয় নিশ্চিত করুন</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB-MODAL 2: STATUS UPDATE (ACTIVE / SUSPEND / BAN) */}
                  {selectedUserForStatus && (
                    <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
                      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-900">
                                অ্যাকাউন্ট স্ট্যাটাস ও এক্সেস কন্ট্রোল
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                ইউজার: {selectedUserForStatus.displayName}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedUserForStatus(null)}
                            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                          >
                            <X className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>

                        {/* Status Options */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-800 block">
                            স্ট্যাটাস নির্বাচন করুন:
                          </label>

                          <label
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                              editStatusTarget === 'active'
                                ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name="userStatusRadio"
                              checked={editStatusTarget === 'active'}
                              onChange={() => setEditStatusTarget('active')}
                              className="accent-emerald-600 w-4 h-4"
                            />
                            <div className="text-xs">
                              <p className="font-bold">সক্রিয় ও সচল (Active)</p>
                              <p className="text-[11px] text-slate-500 font-normal">
                                ইউজার স্বাভাবিকভাবে স্পিন, ডাউনলোড ও সকল টুলস ব্যবহার করতে পারবেন।
                              </p>
                            </div>
                          </label>

                          <label
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                              editStatusTarget === 'suspended'
                                ? 'bg-amber-50/80 border-amber-400 text-amber-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name="userStatusRadio"
                              checked={editStatusTarget === 'suspended'}
                              onChange={() => setEditStatusTarget('suspended')}
                              className="accent-amber-600 w-4 h-4"
                            />
                            <div className="text-xs">
                              <p className="font-bold">সাময়িক বন্ধ / স্থগিত (Suspended)</p>
                              <p className="text-[11px] text-slate-500 font-normal">
                                নির্দিষ্ট মেয়াদের জন্য স্পিন ও ডাউনলোড সুবিধা স্থগিত থাকবে।
                              </p>
                            </div>
                          </label>

                          <label
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                              editStatusTarget === 'banned'
                                ? 'bg-rose-50/80 border-rose-400 text-rose-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name="userStatusRadio"
                              checked={editStatusTarget === 'banned'}
                              onChange={() => setEditStatusTarget('banned')}
                              className="accent-rose-600 w-4 h-4"
                            />
                            <div className="text-xs">
                              <p className="font-bold">স্থায়ীভাবে নিষিদ্ধ (Banned)</p>
                              <p className="text-[11px] text-slate-500 font-normal">
                                একাউন্ট সম্পূর্ণ ব্লক থাকবে এবং কোনো সেবা গ্রহণ করতে পারবে না।
                              </p>
                            </div>
                          </label>
                        </div>

                        {/* If Suspended, duration selector */}
                        {editStatusTarget === 'suspended' && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                            <label className="text-xs font-bold text-amber-900 block">
                              স্থগিত রাখার মেয়াদকাল:
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              {[3, 7, 15, 30].map((days) => (
                                <button
                                  key={days}
                                  type="button"
                                  onClick={() => setEditSuspensionDays(days)}
                                  className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                                    editSuspensionDays === days
                                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                      : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-100'
                                  }`}
                                >
                                  {days} দিন
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reason Field */}
                        <div>
                          <label className="text-xs font-bold text-slate-800 block mb-1">
                            কারণ (ইউজারকে দেখানো হবে):
                          </label>
                          <textarea
                            rows={3}
                            value={editBanReason}
                            onChange={(e) => setEditBanReason(e.target.value)}
                            placeholder="যেমন: ভুল TrxID বারবার সাবমিট করায় একাউন্ট সাময়িক স্থগিত রাখা হয়েছে।"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>

                        {/* Submit Action */}
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedUserForStatus(null)}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
                          >
                            বাতিল
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              let suspendedUntilDate: string | null = null;
                              if (editStatusTarget === 'suspended') {
                                const d = new Date();
                                d.setDate(d.getDate() + editSuspensionDays);
                                suspendedUntilDate = d.toISOString();
                              }
                              await adminUserService.updateUserStatus(
                                selectedUserForStatus.uid,
                                editStatusTarget,
                                editBanReason.trim() || undefined,
                                suspendedUntilDate
                              );
                              onShowToast?.(
                                `${selectedUserForStatus.displayName}-এর স্ট্যাটাস "${editStatusTarget}" এ পরিবর্তন করা হয়েছে!`,
                                editStatusTarget === 'active' ? '✅' : '⚠️'
                              );
                              setSelectedUserForStatus(null);
                            }}
                            className="flex-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>স্ট্যাটাস আপডেট করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
