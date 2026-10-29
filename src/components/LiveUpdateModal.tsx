import React, { useState } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Sparkles,
  X,
  Radio,
  ExternalLink,
  Laptop,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { APP_VERSION_CONFIG } from '../versionConfig';
import { UseAppUpdateSyncReturn } from '../hooks/useAppUpdateSync';

interface LiveUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateSync: UseAppUpdateSyncReturn;
}

export const LiveUpdateModal: React.FC<LiveUpdateModalProps> = ({
  isOpen,
  onClose,
  updateSync,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualCheck = async () => {
    setFeedback(null);
    const result = await updateSync.checkForUpdate(true);
    setFeedback(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  লাইভ সিস্টেম ও অটো-আপডেট
                </h3>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  v{APP_VERSION_CONFIG.version}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                The MoSaFa Tools অনলাইন ও অফলাইন সিঙ্ক ইঞ্জিন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 text-sm">
          {/* Status Badges */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Update Mode Status */}
            <div
              className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                updateSync.isUpdateOn
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  updateSync.isUpdateOn
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-amber-500 text-white shadow-xs'
                }`}
              >
                <Radio className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                  আপডেট কমান্ড মোড
                </span>
                <span className="text-xs font-bold truncate block">
                  {updateSync.isUpdateOn ? '🟢 Update ON (সক্রিয়)' : '🟡 Update OFF (ড্রাফট)'}
                </span>
              </div>
            </div>

            {/* Network / Offline Status */}
            <div
              className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                updateSync.isOnline
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                  : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  updateSync.isOnline ? 'bg-indigo-600 text-white' : 'bg-slate-500 text-white'
                }`}
              >
                {updateSync.isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                  নেটওয়ার্ক অবস্থা
                </span>
                <span className="text-xs font-bold truncate block">
                  {updateSync.isOnline ? 'অনলাইনে যুক্ত' : 'অফলাইন মোড'}
                </span>
              </div>
            </div>
          </div>

          {/* Update Available Alert */}
          {updateSync.updateAvailable && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-rose-900">
                  নতুন আপডেট প্রস্তুত রয়েছে! (v{updateSync.latestVersion})
                </h4>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  সার্ভার থেকে সর্বশেষ ফিচার ও পরিবর্তনসমূহ পাওয়া গেছে। এখনই নতুন সংস্করণ লোড করতে
                  নিচের বাটনে ক্লিক করুন।
                </p>
                <button
                  type="button"
                  onClick={updateSync.applyUpdateNow}
                  className="mt-2.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>এখনই নতুন সংস্করণ রিলোড করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* Version Details */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">রিলিজ ভার্সন:</span>
              <span className="font-bold text-slate-800 font-mono">
                v{APP_VERSION_CONFIG.version} (Build #{APP_VERSION_CONFIG.buildNumber})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">সর্বশেষ আপডেটের তারিখ:</span>
              <span className="font-bold text-slate-800">
                {APP_VERSION_CONFIG.releaseDateBangla}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">ডোমেইন ও প্ল্যাটফর্ম:</span>
              <span className="font-bold text-indigo-600 flex items-center gap-1">
                <span>themedosafe.blogspot.com</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Features in this version */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>এই সংস্করণের প্রধান ফিচারসমূহ:</span>
            </h4>
            <div className="space-y-1.5">
              {APP_VERSION_CONFIG.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-100"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Policy Guide */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-950 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>অটো-আপডেট ও অফলাইন কার্যপ্রণালী:</span>
            </div>
            <p>
              • যখন শর্ট কমান্ড <strong>&quot;Update ON&quot;</strong> দেয়া হয়, তখন অনলাইন ওয়েবসাইট ও মোবাইল
              অ্যাপের সকল ইউজারের কাছে স্বয়ংক্রিয়ভাবে নতুন আপডেট চলে যায়।
            </p>
            <p>
              • অফলাইন ইউজাররা ফোন অন বা ইন্টারনেট সংযোগ পাওয়ার সাথে সাথেই স্বয়ংক্রিয়ভাবে সর্বশেষ সংস্করণ
              পেয়ে যান।
            </p>
            <p>
              • যতক্ষণ পর্যন্ত &quot;Update ON&quot; না দেয়া হয় (বা &quot;Update OFF&quot; থাকে), ততক্ষণ ইউজারদের বর্তমান
              সেশন কোনো রকম বিঘ্ন ছাড়া সম্পূর্ণ সুরক্ষিত থাকে।
            </p>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 text-center animate-in fade-in">
              {feedback}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            {updateSync.lastCheckedAt
              ? `পরীক্ষা: ${updateSync.lastCheckedAt.toLocaleTimeString('bn-BD')}`
              : 'অটো-সিঙ্ক সক্রিয়'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={updateSync.isChecking}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-indigo-600 ${
                  updateSync.isChecking ? 'animate-spin' : ''
                }`}
              />
              <span>{updateSync.isChecking ? 'যাচাই হচ্ছে...' : 'আপডেট চেক করুন'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer active:scale-95"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
