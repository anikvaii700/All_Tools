import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  MessageCircle,
  Globe,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getPublicBaseUrl, getPublicFullUrl } from '../utils/urlHelper';

interface SharePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeToolId?: string | null;
  activeToolTitle?: string;
  totalToolsCount?: number;
  onShowToast: (message: string, icon?: string) => void;
}

const toBanglaNum = (n: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bnDigits[Number(d)]);
};

export const SharePortalModal: React.FC<SharePortalModalProps> = ({
  isOpen,
  onClose,
  activeToolId,
  activeToolTitle,
  totalToolsCount = 25,
  onShowToast,
}) => {
  const [copiedType, setCopiedType] = useState<'all' | 'single' | null>(null);

  if (!isOpen) return null;

  const publicPortalUrl = getPublicBaseUrl();
  const publicSingleToolUrl = activeToolId
    ? getPublicFullUrl(`tool=${activeToolId}`)
    : publicPortalUrl;

  const handleCopy = async (type: 'all' | 'single', url: string, message: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedType(type);
      onShowToast(message, '📋');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedType(type);
      onShowToast(message, '📋');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleNativeShare = async (title: string, text: string, url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        onShowToast('সফলভাবে শেয়ার সম্পন্ন হয়েছে! 🚀', '✅');
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }
    // Fallback to copy
    handleCopy('all', url, 'লিংক কপি করা হয়েছে! 📋');
  };

  const handleWhatsAppShare = (text: string, url: string) => {
    const encoded = encodeURIComponent(`${text}\n\n👉 লিংক: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-white p-0.5 border border-slate-200 shadow-md shadow-rose-200/50 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo.png" alt="The MoSaFa Tools" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              The MoSaFa Tools শেয়ার করুন
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              সকল {toBanglaNum(totalToolsCount)}টি ফ্রি অনলাইন টুলস এক ক্লিকে বন্ধুদের পাঠান
            </p>
          </div>
        </div>

        {/* Important Notice Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 mb-5 text-xs text-slate-700 leading-relaxed">
          <div className="flex items-start gap-2">
            <span className="text-base leading-none">💡</span>
            <div>
              <strong className="text-slate-900 font-bold block mb-0.5">
                কেন লিংক শেয়ার করলে সব টুলস দেখতে পায় না?
              </strong>
              <span>
                আপনি যদি কোনো নির্দিষ্ট টুলে (যেমন: CV Maker, পোস্টার বা স্টাডিমেট) থাকাকালীন ব্রাউজারের লিংক কপি করেন, তবে প্রাপক শুধুমাত্র সেই একটা টুলে প্রবেশ করবে।{' '}
                <strong className="text-rose-700">সকল {toBanglaNum(totalToolsCount)}টি টুলস</strong> একসাথে দেখতে নিচের <strong>"সকল {toBanglaNum(totalToolsCount)}টি টুলসের মূল লিংক"</strong> শেয়ার করুন।
              </span>
            </div>
          </div>
        </div>

        {/* Option 1: Share All Tools (Primary) */}
        <div className="p-4 rounded-2xl bg-slate-50 border-2 border-indigo-200/80 mb-4 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="font-extrabold text-sm text-slate-900">
                ১। সকল {toBanglaNum(totalToolsCount)}টি টুলসের মূল পোর্টাল লিংক
              </span>
            </div>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase">
              সর্বোত্তম শেয়ার
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-3 leading-relaxed">
            এই লিংক ওপেন করলে প্রাপক সরাসরি প্রবেশ করে <strong>সকল {toBanglaNum(totalToolsCount)}টি টুলসের পূর্ণাঙ্গ তালিকা</strong> পাবে এবং কোনো লগইন ছাড়াই যেকোনো টুল চালু করতে পারবে।
          </p>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 mb-3">
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              readOnly
              value={publicPortalUrl}
              className="w-full text-xs font-mono text-slate-700 bg-transparent outline-none truncate"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'all',
                  publicPortalUrl,
                  `সকল ${toBanglaNum(totalToolsCount)}টি টুলসের পাবলিক লিংক কপি হয়েছে! 📋`
                )
              }
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                copiedType === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
              }`}
            >
              {copiedType === 'all' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>সব টুলসের লিংক কপি</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                handleWhatsAppShare(
                  `The MoSaFa Tools - সকল ফ্রি বাংলা অনলাইন টুলস এক ক্লিকে (StudyMate BD, CV Maker, ভোটার স্থানান্তর, পোস্টার স্টুডিও সহ ${toBanglaNum(totalToolsCount)}টি কার্যকরী টুলস)`,
                  publicPortalUrl
                )
              }
              className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোয়াটসঅ্যাপে শেয়ার</span>
            </button>
          </div>
        </div>

        {/* Option 2: Share Specific Tool Only (if active) */}
        {activeToolId && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-500" />
                <span>২। শুধুমাত্র এই টুলের ডিরেক্ট লিংক ({activeToolTitle || activeToolId}):</span>
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                নির্দিষ্ট টুল
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-2.5">
              প্রাপক লিংকে ক্লিক করলে সরাসরি শুধুমাত্র <strong>{activeToolTitle || activeToolId}</strong> ওপেন হবে।
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicSingleToolUrl}
                className="w-full text-xs font-mono text-slate-600 bg-white border border-slate-200 p-2 rounded-xl outline-none truncate"
              />
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    'single',
                    publicSingleToolUrl,
                    `${activeToolTitle || 'টুল'}-এর ডিরেক্ট লিংক কপি হয়েছে! 📋`
                  )
                }
                className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer ${
                  copiedType === 'single'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'
                }`}
              >
                {copiedType === 'single' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'single' ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Native Web Share Button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={() =>
              handleNativeShare(
                'The MoSaFa Tools - সকল অনলাইন টুলস পোর্টাল',
                'সকল ফ্রি বাংলা অনলাইন টুলস এক জায়গায় - The MoSaFa StudyMate BD, CV Maker, ভোটার স্থানান্তর ফরম সহ ২২টি কার্যকরী টুলস।',
                publicPortalUrl
              )
            }
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>ডিভাইসের যেকোনো অ্যাপে সরাসরি শেয়ার করুন 📲</span>
          </button>
        )}
      </div>
    </div>
  );
};
