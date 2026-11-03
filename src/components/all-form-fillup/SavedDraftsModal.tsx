import React from 'react';
import { SavedDraft } from './types';
import { toBanglaDigits } from './numberUtils';
import { X, Trash2, Edit3, ShieldAlert, FolderOpen, AlertTriangle } from 'lucide-react';

interface SavedDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: SavedDraft[];
  onLoadDraft: (draft: SavedDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  onClearAllData: () => void;
}

export const SavedDraftsModal: React.FC<SavedDraftsModalProps> = ({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
  onDeleteDraft,
  onClearAllData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                সংরক্ষিত ড্রাফট ও ডাটা ({toBanglaDigits(drafts.length)}টি)
              </h2>
              <p className="text-[11px] text-slate-500">আপনার ব্রাউজারে সেভ করা অসমাপ্ত ফরমসমূহ</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Privacy Advisory Banner */}
        <div className="p-3.5 bg-amber-50 border-b border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>গোপনীয়তা সতর্কতা:</strong> আপনার ফরমের তথ্য এই ডিভাইসের ব্রাউজারে সংরক্ষিত থাকে। সাইবার ক্যাফে বা শেয়ার্ড ডিভাইসে সংবেদনশীল তথ্য ব্যবহারের পর সংরক্ষিত ড্রাফট মুছে ফেলুন।
          </span>
        </div>

        {/* Drafts List */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-3 flex-1">
          {drafts.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <span className="text-4xl block">📂</span>
              <p className="text-sm font-bold text-slate-700">কোনো ড্রাফট পাওয়া যায়নি</p>
              <p className="text-xs text-slate-500">
                যেকোনো ফরম পূরণকালে "ড্রাফট সংরক্ষণ" বাটনে ক্লিক করলে তা এখানে তালিকাভুক্ত হবে।
              </p>
            </div>
          ) : (
            drafts.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                      {d.categoryName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(d.updatedAt).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {d.title || d.templateName}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    টেমপ্লেট: {d.templateName}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadDraft(d);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                    title="ড্রাফটটি এডিটরে খুলুন"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>সম্পাদনা</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteDraft(d.id)}
                    className="p-1.5 rounded-xl hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                    title="ড্রাফটটি মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {drafts.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <button
              type="button"
              onClick={onClearAllData}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>সকল লোকাল ড্রাফট মুছে ফেলুন</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
