import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  RotateCcw,
  RotateCw,
  Type,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { DocumentStyle } from './types';

interface DocumentEditorProps {
  content: string;
  onChangeContent: (text: string) => void;
  style: DocumentStyle;
  onChangeStyle: (newStyle: Partial<DocumentStyle>) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenAiAssist?: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  content,
  onChangeContent,
  style,
  onChangeStyle,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenAiAssist,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Editor Toolbar */}
      <div className="p-2.5 sm:p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        {/* Style Controls Group 1: Undo/Redo & Font Size */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="পূর্বাবস্থায় ফিরুন (Undo)"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition text-xs flex items-center justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="পুনরায় করুন (Redo)"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition text-xs flex items-center justify-center"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          {/* Font Size Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-medium">আকার:</span>
            <select
              value={style.fontSize}
              onChange={(e) => onChangeStyle({ fontSize: Number(e.target.value) })}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-semibold cursor-pointer focus:outline-rose-500"
            >
              {[12, 13, 14, 15, 16, 17, 18, 20, 22].map((s) => (
                <option key={s} value={s}>
                  {s}px
                </option>
              ))}
            </select>
          </div>

          {/* Line Height Selector */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-medium">স্পেসিং:</span>
            <select
              value={style.lineSpacing}
              onChange={(e) => onChangeStyle({ lineSpacing: Number(e.target.value) })}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-semibold cursor-pointer focus:outline-rose-500"
            >
              <option value={1.3}>১.৩x (সংক্ষিপ্ত)</option>
              <option value={1.5}>১.৫x (স্ট্যান্ডার্ড)</option>
              <option value={1.7}>১.৭x (স্বাভাবিক)</option>
              <option value={2.0}>২.০x (প্রশস্ত)</option>
            </select>
          </div>
        </div>

        {/* Style Controls Group 2: Formatting & Alignment */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => onChangeStyle({ bold: !style.bold })}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
              style.bold
                ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="বোল্ড (Bold)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeStyle({ italic: !style.italic })}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
              style.italic
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="ইটালিক (Italic)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeStyle({ underline: !style.underline })}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
              style.underline
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="আন্ডারলাইন (Underline)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => onChangeStyle({ alignment: 'left' })}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
              style.alignment === 'left'
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="বাম প্রান্ত (Align Left)"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeStyle({ alignment: 'center' })}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
              style.alignment === 'center'
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="মাঝখানে (Align Center)"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeStyle({ alignment: 'justify' })}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
              style.alignment === 'justify'
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="জাস্টিফাই (Justify)"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          {/* AI Writing Assist Button */}
          {onOpenAiAssist && (
            <button
              type="button"
              onClick={onOpenAiAssist}
              className="ml-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs hover:opacity-95 transition cursor-pointer active:scale-95"
              title="AI রাইটিং অ্যাসিস্ট্যান্ট দিয়ে পরিমার্জন করুন"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI পরিমার্জন</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Textarea */}
      <div className="flex-1 p-3 sm:p-4 bg-white relative">
        <textarea
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          rows={24}
          placeholder="এখানে আপনার সম্পূর্ণ আবেদন বা চিঠি সরাসরি টাইপ বা এডিট করুন..."
          className="w-full h-full min-h-[460px] p-3 text-slate-800 leading-relaxed font-sans border border-slate-200 rounded-xl focus:outline-rose-500 resize-y bg-slate-50/50 focus:bg-white transition"
          style={{
            fontSize: `${style.fontSize}px`,
            lineHeight: style.lineSpacing,
          }}
        />
      </div>

      {/* Footer Word/Line Count Info */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          <span>মোট লাইন: {content.split('\n').filter((l) => l.trim()).length}</span>
          <span className="mx-2">•</span>
          <span>শব্দ সংখ্যা: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
          <span className="mx-2">•</span>
          <span>অক্ষর: {content.length}</span>
        </div>
        <span className="text-emerald-600 font-semibold">✓ রিয়েলটাইম প্রিভিউ সিঙ্ক হচ্ছে</span>
      </div>
    </div>
  );
};
