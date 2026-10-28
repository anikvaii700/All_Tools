import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Play,
  Sparkles,
  Info,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getPublicBaseUrl } from '../utils/urlHelper';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'apk' | 'qr' | 'studio'>('direct');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // 100% Public URL - ensures phones scanning QR code or opening link never encounter Google 403 error!
  const appUrl = getPublicBaseUrl();

  // Generate real QR code for the current app URL
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code error', err));
    }
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      onShowToast('অ্যাপের লিংক সফলভাবে কপি হয়েছে! 📋', '🎉');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('লিংক কপি করতে সমস্যা হয়েছে।', '⚠️');
    }
  };

  const handleTriggerInstall = async () => {
    if (isInstalled) {
      onShowToast('The MoSaFa অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে! 🎉', '✅');
      return;
    }
    if (isIOS) {
      onShowToast('iPhone-এ Safari-র Share (শেয়ার) বাটন চেপে "Add to Home Screen" চাপুন।', '📲');
      return;
    }
    if (isInstallable) {
      const success = await install();
      if (success) {
        onShowToast('The MoSaFa অ্যাপ সফলভাবে ইনস্টল হয়েছে! 📲', '✅');
      }
    } else {
      onShowToast('ফোনের Chrome ব্রাউজারের ৩-ডট (⋮) চেপে "Install app" চাপুন।', '📱');
    }
  };

  const handleDownloadStudioZip = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`${filename} ডাউনলোড শুরু হয়েছে! 📥`, '🚀');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  মোবাইল অ্যাপ (APK) ও ইনস্টল গাইড
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  ৪টি সহজ উপায়
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                The MoSaFa StudyMate BD সরাসরি আপনার ফোনে ইনস্টল ও APK ব্যবহারের পদ্ধতি
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 bg-slate-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'direct'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-rose-500" />
            <span>১. ফোনে ইনস্টল</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>২. APK প্রস্তুত</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-indigo-500" />
            <span>৩. QR স্ক্যান</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('studio')}
            className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span>৪. সোর্স কোড</span>
          </button>
        </div>

        {/* TAB 1: QR CODE SCAN */}
        {activeTab === 'qr' && (
          <div className="space-y-5 text-center animate-in fade-in duration-200">
            <div className="bg-gradient-to-b from-rose-50/60 to-indigo-50/40 p-6 rounded-3xl border border-rose-100/80">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-rose-600 text-xs font-bold shadow-2xs mb-3">
                <QrCode className="w-3.5 h-3.5" />
                <span>ফোনের ক্যামেরা দিয়ে স্ক্যান করুন</span>
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                স্ক্রিন থেকে QR কোড স্ক্যান করে সরাসরি ফোনে খুলুন
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-5 leading-relaxed">
                আপনার ফোনের সাধারণ ক্যামেরা অথবা যেকোনো QR Scanner দিয়ে নিচের কোডটি স্ক্যান করলেই টাইপ করা ছাড়াই সরাসরি আপনার ফোনে সমস্ত টুলসহ সাইটটি চালু হবে।
              </p>

              {/* Big QR Code Card */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl inline-block shadow-lg border border-slate-200">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="The MoSaFa Tools Mobile QR Code"
                    className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl mx-auto"
                  />
                ) : (
                  <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    QR কোড তৈরি হচ্ছে...
                  </div>
                )}
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>লাইভ অ্যাক্টিভ QR কোড</span>
                </div>
              </div>
            </div>

            {/* Direct Link Copier */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="overflow-hidden w-full">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  সরাসরি মোবাইল ওয়েব লিংক:
                </span>
                <p className="text-xs font-mono font-bold text-slate-800 truncate">
                  {appUrl}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'কপি হয়েছে!' : 'লিংক কপি'}</span>
                </button>
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: DIRECT PHONE INSTALL (CHROME PWA) */}
        {activeTab === 'direct' && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            {/* AI Studio Share Tip Banner */}
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-start gap-3">
              <span className="text-xl shrink-0">💡</span>
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>"Page not found" আসলে কী করবেন?</strong>
                <p className="mt-1 text-amber-800">
                  Google AI Studio স্ক্রিনের একেবারে ওপরে ডানপাশে থাকা <strong>"Share"</strong> (বা Publish/Share) বাটনে একবার ক্লিক করুন। এতে গুগল ক্লাউড স্বয়ংক্রিয়ভাবে পাবলিক লিংকটি চালু করে দেবে।
                </p>
              </div>
            </div>

            <div className="bg-rose-50/70 p-5 rounded-3xl border border-rose-200/80">
              <h4 className="text-sm sm:text-base font-bold text-rose-950 flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>সরাসরি ফোনে ইনস্টল করার নিয়ম (কোনো প্লেস্টোর ছাড়া)</span>
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                Google Chrome-এর প্রগ্রেসিভ ওয়েব অ্যাপ (PWA) প্রযুক্তির মাধ্যমে এই পোর্টালটি সরাসরি মোবাইল অ্যাপের মতো ইনস্টল হয়ে যায় এবং হোম স্ক্রিনে আইকন বসে যায়।
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-black text-sm flex items-center justify-center shrink-0">
                  ১
                </div>
                <div className="w-full">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                    ফোনের Google Chrome ব্রাউজারে লিংকটি ওপেন করুন:
                  </h5>
                  <div className="mt-1 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-rose-600 font-bold break-all">
                    👉 {appUrl}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'কপি হয়েছে!' : 'লিংকটি কপি করুন'}</span>
                    </button>
                    <a
                      href={appUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                    >
                      <span>ব্রাউজারে খুলুন</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center shrink-0">
                  ২
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                    ব্রাউজারের ওপরের ডানদিকের ৩-ডট (⋮) মেনু চাপুন
                  </h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Google Chrome-এর ডানপাশের ওপরের কোণায় থাকা ৩টি ফোঁটা (তিন দাগ বা তিনটি ডট) বাটনে ক্লিক করুন।
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center shrink-0">
                  ৩
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                    "Install app" বা "Add to Home screen" চাপুন
                  </h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    অপশনটিতে চাপার পর <strong>"Install"</strong> নিশ্চিত করলেই সাথে সাথে আপনার ফোনের হোম স্ক্রিনে দ্য মোসাফা টুলস অ্যাপ বসে যাবে।
                  </p>
                </div>
              </div>

              {/* iOS Safari Guidance Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                  <Share2 className="w-4 h-4 text-amber-700" />
                  <span>iPhone বা iPad (iOS Safari) ব্যবহারকারীদের জন্য:</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Safari ব্রাউজারে লিংকটি খুলে নিচে থাকা <strong>Share (শেয়ার ↗)</strong> চাপুন, এরপর তালিকা থেকে <strong>"Add to Home Screen" (+)</strong> চাপলেই সরাসরি হোম স্ক্রিনে ইনস্টল হয়ে যাবে।
                </p>
              </div>
            </div>

            {/* In-app 1-click trigger button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerInstall}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-rose-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Smartphone className="w-4 h-4" />
                <span>সরাসরি ফোনে ইনস্টল করুন 📲</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: APK GENERATOR & DOWNLOAD */}
        {activeTab === 'apk' && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            <div className="bg-purple-50/80 p-5 rounded-3xl border border-purple-200/80">
              <h4 className="text-sm sm:text-base font-bold text-purple-950 flex items-center gap-2 mb-1">
                <Download className="w-4 h-4 text-purple-600" />
                <span>অ্যান্ড্রয়েড APK প্রস্তুত ও ডাউনলোডের উপায়</span>
              </h4>
              <p className="text-xs text-purple-800 leading-relaxed">
                আপনার সুবিধার জন্য সম্পূর্ণ সাইটের সোর্স কোডসহ অ্যান্ড্রয়েড প্রজেক্ট <strong>কোড সেকশনের <code>/android-apk/</code></strong> ফোল্ডারে রাখা হয়েছে। এছাড়া আপনি সরাসরি নিচে থেকে APK তৈরি বা ডাউনলোড করতে পারেন:
              </p>
            </div>

            {/* Quick Option 1: 1-Click APK Builder */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">
                  ১
                </span>
                <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                  PWABuilder দিয়ে সরাসরি Signed APK তৈরি (১-ক্লিক)
                </h5>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                গুগল ও মাইক্রোসফটের অফিশিয়াল ক্লাউড বিল্ডার দিয়ে কোনো কোডিং ছাড়াই মাত্র ১০ সেকেন্ডে সাইটের রেডি <strong>.apk</strong> ফাইল ডাউনলোড করুন:
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`https://www.pwabuilder.com/?url=${encodeURIComponent(appUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-purple-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>PWABuilder-এ APK জেনারেট করুন 🚀</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'লিংক কপি হয়েছে!' : 'লিংক কপি'}</span>
                </button>
              </div>
            </div>

            {/* Quick Option 2: Pre-packaged ZIP Download */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                  ২
                </span>
                <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                  কোড সেকশন থেকে সরাসরি অ্যান্ড্রয়েড প্রজেক্ট জিপ (.ZIP) নামান
                </h5>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                কোড সেকশনের সম্পূর্ণ <code>android-apk/</code> প্রজেক্টটি জিপ আকারে প্যাকেজ করা আছে। এটি নামিয়ে সরাসরি Android Studio বা যেকোনো ডিভাইসে রান করতে পারবেন:
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleDownloadStudioZip('The-MoSaFa-StudyMate-Android-Project.zip')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>The-MoSaFa-StudyMate-Android-Project.zip (ডাউনলোড)</span>
                </button>
              </div>
            </div>

            {/* Quick Option 3: Instant Phone WebAPK */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
              <span className="text-base">💡</span>
              <div>
                <strong className="text-slate-800">ফোনে কোনো ফাইল ডাউনলোড ছাড়া সরাসরি চালাতে চান?</strong>
                <p className="mt-0.5">
                  প্রথম ট্যাব (<strong>১. ফোনে ইনস্টল</strong>)-এ গিয়ে আপনার অ্যান্ড্রয়েড ফোনের Google Chrome দিয়ে সাইটটি ওপেন করুন এবং <strong>"Install app"</strong> চাপুন। গুগল ক্রোম স্বয়ংক্রিয়ভাবে সরাসরি আপনার ফোনের অ্যাপ ড্রয়ারে মূল আইকনসহ অ্যান্ড্রয়েড অ্যাপ ইনস্টল করে দেবে!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ANDROID STUDIO & CABLE */}
        {activeTab === 'studio' && (
          <div className="space-y-4 text-left animate-in fade-in duration-200">
            <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200/80">
              <h4 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2 mb-1">
                <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <span>অ্যান্ড্রয়েড স্টুডিও ও ক্যাবল দিয়ে রান করার জন্য</span>
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                প্রাক-কনফিগার করা সম্পূর্ণ সোর্স কোডসহ Android Studio প্রজেক্ট জিপ ফাইল প্রস্তুত করা হয়েছে। অ্যান্ড্রয়েড স্টুডিওতে ওপেন করলেই স্বয়ংক্রিয়ভাবে ফোনের নাম ও সবুজ Run ▶️ বাটন পাবেন।
              </p>
            </div>

            {/* Download Buttons for both filenames mentioned by user */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadStudioZip('Aviator-Android-Studio-Project.zip')}
                className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 text-white shadow-md shadow-emerald-200 transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Download className="w-5 h-5" />
                <span className="font-extrabold text-xs sm:text-sm">Aviator-Android-Studio-Project.zip</span>
                <span className="text-[10px] text-emerald-100 bg-white/20 px-2 py-0.5 rounded-full">৮.২ MB • প্যাকেজড প্রোজেক্ট</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadStudioZip('The-MoSaFa-Tools-Android-Studio-Project.zip')}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 hover:from-indigo-700 text-white shadow-md shadow-indigo-200 transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Download className="w-5 h-5" />
                <span className="font-extrabold text-xs sm:text-sm">The-MoSaFa-Tools-Android-Studio.zip</span>
                <span className="text-[10px] text-indigo-100 bg-white/20 px-2 py-0.5 rounded-full">সম্পূর্ণ রেডি Kotlin WebView প্রজেক্ট</span>
              </button>
            </div>

            {/* Step-by-step Studio Guide */}
            <div className="space-y-2.5 pt-2">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                রান করার সহজ ধাপসমূহ:
              </h5>

              <div className="text-xs text-slate-700 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ধাপ ১:</strong> ওপরের বাটনে চাপ দিয়ে জিপ ফাইলটি ডাউনলোড করে আপনার কম্পিউটারে আনজিপ (Extract) করুন।</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ধাপ ২:</strong> Android Studio ওপেন করুন এবং <strong>File ➔ Open</strong> চাপ দিয়ে আনজিপ করা ফোল্ডারটি বেছে নিন।</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ধাপ ৩:</strong> USB ক্যাবল দিয়ে আপনার অ্যান্ড্রয়েড ফোন কম্পিউটারে সংযুক্ত করুন (ফোনের Developer Options থেকে USB Debugging সক্রিয় রাখুন)।</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ধাপ ৪:</strong> Android Studio-র ওপরের বারে স্বয়ংক্রিয়ভাবে আপনার ফোনের মডেল ও নাম ভেসে উঠবে।</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ধাপ ৫:</strong> ওপরের সবুজ <strong>Run ▶️</strong> বাটনে এক চাপ দিন! কয়েক সেকেন্ডে সরাসরি আপনার ফোনে ইনস্টল হয়ে পূর্ণাঙ্গ অ্যাপ চালু হয়ে যাবে।</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info note */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>কোনো বিজ্ঞাপন বা সাবস্ক্রিপশন নেই • ১০০% ফ্রি</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
