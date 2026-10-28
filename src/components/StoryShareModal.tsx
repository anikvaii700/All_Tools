import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Download,
  MessageCircle,
  Send,
  FileText,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { StoryMetadata } from '../data/golpoGhorData';
import { getPublicFullUrl } from '../utils/urlHelper';

interface StoryShareModalProps {
  story: StoryMetadata | null;
  onClose: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const StoryShareModal: React.FC<StoryShareModalProps> = ({
  story,
  onClose,
  onShowToast,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!story) return null;

  // Generate shareable URL (uses public ais-pre URL so no 403 error)
  let shareUrl = getPublicFullUrl(`tool=golpo-ghor&story=${story.slug}`);
  if (story.contentType === 'user-written') {
    try {
      const payload = JSON.stringify({
        id: story.id,
        slug: story.slug,
        title: story.title,
        author: story.author,
        category: story.category,
        categorySlug: story.categorySlug,
        shortDescription: story.shortDescription,
        coverGradient: story.coverGradient,
        coverIcon: story.coverIcon,
        contentType: 'user-written',
        publicationYear: story.publicationYear || new Date().getFullYear(),
        estimatedReadingMinutes: story.estimatedReadingMinutes || 15,
        chapters: story.chapters,
      });
      const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(payload))));
      if (encoded.length < 3800) {
        shareUrl = getPublicFullUrl(`tool=golpo-ghor&sharedStory=${encoded}`);
      }
    } catch {}
  }

  const shareTitle = `${story.title} — ${story.author} | The MoSaFa Golpo Ghor`;
  const shareText = `📚 "${story.title}"\n✍️ লেখক: ${story.author}\n✨ বিভাগ: ${story.category}\n\n📖 এই অসাধারণ গল্পটি পড়ুন MoSaFa Golpo Ghor-এ:\n${shareUrl}`;

  // Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      onShowToast('গল্পের লিংক ক্লিপবোর্ডে কপি করা হয়েছে! 📋', '🔗');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      onShowToast('লিংক কপি করতে ব্যর্থ হয়েছে।', '⚠️');
    }
  };

  // Copy Story Export Code (JSON)
  const handleCopyStoryCode = async () => {
    try {
      const code = JSON.stringify(story, null, 2);
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      onShowToast('গল্পের কোড কপি করা হয়েছে! বন্ধুরা এটি সরাসরি আমদানি করে পড়তে পারবে। 📋', '💾');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      onShowToast('কোড কপি করতে ব্যর্থ হয়েছে।', '⚠️');
    }
  };

  // Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: story.shortDescription,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  // Share to WhatsApp
  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Share to Telegram
  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
      `📚 "${story.title}" — ${story.author} (${story.category})`
    )}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  // Share to Facebook
  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  // Download Story as .txt
  const handleDownloadTxt = () => {
    const chaptersText = story.chapters
      .map(
        (ch) =>
          `==============================\n${ch.title}\n==============================\n\n${ch.content.join(
            '\n\n'
          )}`
      )
      .join('\n\n\n');

    const fullDoc = `গল্পের শিরোনাম: ${story.title}\nলেখক: ${story.author}\nবিভাগ: ${story.category}\nআনুমানিক পড়ার সময়: ${story.estimatedReadingMinutes} মিনিট\nকপিরাইট ও লাইসেন্স: ${story.licenseName}\nউৎস: The MoSaFa Golpo Ghor (${shareUrl})\n\n${story.shortDescription}\n\n\n${chaptersText}\n\n--- সমাপ্ত ---`;

    const blob = new Blob([fullDoc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.slug || 'story'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('গল্পটি টেক্সট ফাইল (.txt) হিসেবে ডাউনলোড হয়েছে! 📥', '📄');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                গল্প শেয়ার করুন
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                বন্ধুদের সাথে চমৎকার গল্পটি পড়ার আনন্দ ভাগাভাগি করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Mini Preview Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
          <div
            className={`w-14 h-16 rounded-xl bg-gradient-to-br ${
              story.coverGradient || 'from-rose-500 to-indigo-600'
            } text-white flex flex-col items-center justify-center shadow-xs shrink-0`}
          >
            <span className="text-xl">{story.coverIcon || '📖'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
              {story.category}
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {story.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">লেখক: {story.author}</p>
          </div>
        </div>

        {/* Direct Social Share Buttons */}
        <div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2.5">
            সরাসরি সোশ্যাল মিডিয়ায় শেয়ার করুন:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={handleTelegramShare}
              className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <Send className="w-5 h-5 text-sky-600" />
              <span>Telegram</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <Share2 className="w-5 h-5 text-indigo-600" />
              <span>Facebook</span>
            </button>

            {/* Native Mobile Share */}
            <button
              onClick={handleNativeShare}
              className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <ExternalLink className="w-5 h-5 text-rose-600" />
              <span>অন্যান্য অ্যাপ</span>
            </button>
          </div>
        </div>

        {/* Share Link Copy Field */}
        <div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            সরাসরি পড়ার ওয়েব লিংক:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-800 transition cursor-pointer shrink-0 shadow-sm"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
            </button>
          </div>
        </div>

        {/* Export & Offline Options */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleDownloadTxt}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-rose-500" />
            <span>টেক্সট ফাইল (.txt) ডাউনলোড</span>
          </button>

          <button
            onClick={handleCopyStoryCode}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <FileText className="w-4 h-4 text-indigo-500" />}
            <span>{copiedCode ? 'কোড কপি হয়েছে' : 'গল্পের কোড কপি করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
