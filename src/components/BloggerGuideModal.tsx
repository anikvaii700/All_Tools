import React, { useState } from 'react';
import { Copy, Download, X, Check, HelpCircle, Sparkles } from 'lucide-react';

interface BloggerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const BloggerGuideModal: React.FC<BloggerGuideModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      const res = await fetch('/blogger-theme.xml');
      if (res.ok) {
        const text = await res.text();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onShowToast('ব্লগার থিম কোড সফলভাবে কপি হয়েছে! 📋', '🎉');
        setTimeout(() => setCopied(false), 3000);
        return;
      }
    } catch {
      // fallback
    }
    onShowToast('কোড কপি করতে সমস্যা হয়েছে। অনুগ্রহ করে .xml ফাইল ডাউনলোড করুন।', '⚠️');
  };

  const handleDownloadXml = () => {
    const link = document.createElement('a');
    link.href = '/blogger-theme.xml';
    link.download = 'the-mosafa-tools-blogger-theme.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('blogger-theme.xml ডাউনলোড শুরু হয়েছে! 📥', '🎉');
  };

  const handleDownloadBusFareModule = () => {
    const link = document.createElement('a');
    link.href = '/bus-fare-blogger-module.html';
    link.download = 'mosafa-bus-fare-blogger-module.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('বাস ভাড়া মডিউল HTML ডাউনলোড শুরু হয়েছে! 📥', '🚌');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">ব্লগারে কীভাবে সেটআপ করবেন?</h3>
              <p className="text-xs text-slate-500">আপনার নিজস্ব ব্লগে সম্পূর্ণ টুলস পোর্টাল যুক্ত করার নিয়ম</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
            <h4 className="font-bold text-rose-900 text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>১০০% রেসপনসিভ ও স্বয়ংক্রিয় টুলস সিস্টেম</span>
            </h4>
            <p>
              আপনার মূল সাইটের হোমপেজে সব ১৮টি টুল থাকবে এবং যেকোনো টুলে ক্লিক করলে তা স্বয়ংক্রিয়ভাবে হুবহু ওপেন হবে!
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">১. থিম সেটআপ করার নিয়ম:</h4>
            <p className="flex items-start gap-1.5">
              <span className="font-bold text-rose-600">ক.</span>
              <span>নিচের <strong>"ব্লগার থিম কোড কপি করুন"</strong> বাটনে ক্লিক করে কোড কপি করুন অথবা <strong>".xml ফাইল ডাউনলোড"</strong> করুন।</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="font-bold text-rose-600">খ.</span>
              <span>Blogger ড্যাশবোর্ডে গিয়ে বাঁদিকের মেনু থেকে <strong>Theme</strong>-এ ক্লিক করুন।</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="font-bold text-rose-600">গ.</span>
              <span>কমলা রঙের \'CUSTOMIZE\' বাটনের পাশে থাকা <strong>▼</strong> তীর চিহ্নে ক্লিক করে <strong>Edit HTML</strong> অপশন বেছে নিন।</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="font-bold text-rose-600">ঘ.</span>
              <span>আগের সব কোড সিলেক্ট করে মুছে দিন এবং কপি করা নতুন কোডটি পেস্ট করে ওপরের ডানপাশের <strong>Save (💾)</strong> বাটনে চাপ দিন।</span>
            </p>
            <p className="text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              ✅ ব্যস! এবার আপনার ব্লগের মূল ঠিকানায় গেলে The MoSaFa Tools-এর সমস্ত ফিচার লাইভ দেখতে পাবেন।
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <span>⚠️</span>
              <span>অতি গুরুত্বপূর্ণ (যাতে ব্লগারে কোনো কিছু পরিবর্তন না হয়):</span>
            </h4>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <p>
                <strong>মোবাইল সেটিংস পরিবর্তন করুন:</strong> Blogger ড্যাশবোর্ডে <strong>Theme</strong>-এ যান &gt; কমলা রঙের <strong>\'CUSTOMIZE\'</strong>-এর পাশের <strong>▼</strong> তীর চিহ্নে ক্লিক করুন &gt; <strong>Mobile settings</strong> নির্বাচন করুন &gt; <strong>Desktop</strong> অপশনটি সিলেক্ট করে <strong>Save</strong> করুন।
              </p>
              <p className="text-[11px] text-amber-800">
                (এটি না করলে মোবাইল থেকে ভিজিট করলে ব্লগার তার নিজস্ব পুরোনো টেমপ্লেট লোড করে, যার ফলে লেআউট ও ডিজাইন নষ্ট হয়ে যায়।)
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCopyCode}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'কপি সম্পন্ন হয়েছে! ✅' : 'ব্লগার থিম কোড কপি করুন (Edit HTML)'}</span>
            </button>
            <button
              onClick={handleDownloadXml}
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>.xml থিম</span>
            </button>
            <button
              onClick={handleDownloadBusFareModule}
              className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>বাস ভাড়া মডিউল HTML</span>
            </button>
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
