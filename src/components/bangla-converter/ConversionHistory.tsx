import React from 'react';
import { Trash2, Copy, ArrowUpRight, Clock, ShieldCheck, History } from 'lucide-react';
import { ConversionHistoryItem } from './types';

interface ConversionHistoryProps {
  history: ConversionHistoryItem[];
  onSelect: (item: ConversionHistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ConversionHistory: React.FC<ConversionHistoryProps> = ({
  history,
  onSelect,
  onDelete,
  onClearAll,
  onShowToast,
}) => {
  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => onShowToast('টেক্সট সফলভাবে কপি হয়েছে! 📋', '✅'))
      .catch(() => onShowToast('কপি করতে সমস্যা হয়েছে', '⚠️'));
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-4">
      {/* Privacy Guarantee Note */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <p className="font-bold text-emerald-950">১০০% নিরাপদ ও গোপনীয়তা বান্ধব</p>
          <p className="mt-0.5 text-emerald-800">
            আপনার লেখা এই ডিভাইসের ব্রাউজারেই প্রক্রিয়া করা হয়। কোনো বাহ্যিক সার্ভারে পাঠানো হয় না। সকল হিস্ট্রি কেবল আপনার ডিভাইসের লোকাল স্টোরেজে সংরক্ষিত থাকে।
          </p>
        </div>
      </div>

      {/* History Header & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold text-sm text-slate-800">
            সাম্প্রতিক রূপান্তর হিস্ট্রি ({history.length})
          </h3>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>সব হিস্ট্রি মুছুন</span>
          </button>
        )}
      </div>

      {/* History Item List */}
      {history.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">এখনো কোনো হিস্ট্রি রেকর্ড নেই</p>
          <p className="text-[11px] text-slate-400 mt-1">
            টেক্সট কনভার্ট, পরিষ্কার বা রূপান্তর করলে এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-3.5 shadow-xs transition group text-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {item.directionLabel}
                </span>
                <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                  <span>{formatDate(item.timestamp)}</span>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="hover:text-rose-600 transition p-1 cursor-pointer"
                    title="এই আইটেমটি মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Source vs Converted Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">মূল টেক্সট:</span>
                  <p className="font-mono text-slate-700 line-clamp-2 break-all text-[11px]">
                    {item.sourceText}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-emerald-600 block mb-0.5">রূপান্তরিত টেক্সট:</span>
                  <p className="font-mono text-emerald-950 font-bold line-clamp-2 break-all text-[11px]">
                    {item.convertedText}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCopy(item.convertedText)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>কপি</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs transition cursor-pointer"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>পুনরায় ব্যবহার করুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
