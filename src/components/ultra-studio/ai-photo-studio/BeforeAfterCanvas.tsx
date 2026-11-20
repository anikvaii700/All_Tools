import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ScanFace,
  Move,
  Columns2,
  Eye,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

export type PreviewCompareMode = 'split' | 'after' | 'before';

interface BeforeAfterCanvasProps {
  hasPhoto: boolean;
  beforeUrl: string | null;
  afterUrl: string | null;
  isProcessing: boolean;
  processingLabel: string;
  showFaceGuide: boolean;
  onToggleFaceGuide: () => void;
  isPassportMode: boolean;
  isTransparentBg: boolean;
  aspectRatio: number; // width / height
  outputDimensionLabel: string;
  onUploadFiles: (files: FileList | File[]) => void;
  onLoadDemo: () => void;
  onPanDelta?: (dxPercent: number, dyPercent: number) => void;
}

export const BeforeAfterCanvas: React.FC<BeforeAfterCanvasProps> = ({
  hasPhoto,
  beforeUrl,
  afterUrl,
  isProcessing,
  processingLabel,
  showFaceGuide,
  onToggleFaceGuide,
  isPassportMode,
  isTransparentBg,
  aspectRatio,
  outputDimensionLabel,
  onUploadFiles,
  onLoadDemo,
  onPanDelta,
}) => {
  const [compareMode, setCompareMode] = useState<PreviewCompareMode>('after');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const updateSliderFromClientX = (clientX: number, container: HTMLElement | null) => {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplitPos(Math.max(4, Math.min(96, pct)));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  // Empty state: Clean Luminous Upload Dropzone
  if (!hasPhoto) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 min-h-[460px] lg:min-h-[580px] bg-slate-50/70">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleFileDrop}
          className={`w-full max-w-xl rounded-3xl border-2 border-dashed p-8 sm:p-11 text-center transition-all bg-white shadow-sm ${
            isDraggingFile
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onUploadFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center mx-auto mb-5 text-indigo-600 shadow-2xs">
            <Upload className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            আপনার ছবি আপলোড করুন
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            যেকোনো পোর্ট্রেট, সেলফি বা স্টুডিও ছবি দিন — সম্পূর্ণ বিনামূল্যে আপনার ব্রাউজারেই
            ব্যাকগ্রাউন্ড পরিবর্তন, ২১৬+ স্টাইল, পাসপোর্ট মাপ ও প্রিন্ট শিট তৈরি হবে।
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>ছবি নির্বাচন করুন (JPG / PNG / WEBP)</span>
            </button>

            <button
              type="button"
              onClick={onLoadDemo}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>নমুনা ছবি দিয়ে দেখুন</span>
            </button>
          </div>

          <p className="mt-5 text-[11px] text-slate-500 font-medium">
            ১০০% প্রাইভেট ও জিরো-কস্ট · ছবি সার্ভারে আপলোড হয় না · একসাথে একাধিক ছবি যোগ করা যাবে
          </p>
        </div>
      </div>
    );
  }

  const clampedAspect = Math.max(0.45, Math.min(2.0, aspectRatio || 0.78));

  const renderPreviewFrame = (containerRef?: React.RefObject<HTMLDivElement | null>, isModal = false) => (
    <div
      ref={containerRef}
      style={{
        aspectRatio: `${clampedAspect}`,
        backgroundImage: isTransparentBg
          ? 'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)'
          : undefined,
        backgroundSize: isTransparentBg ? '16px 16px' : undefined,
      }}
      onPointerDown={(e) => {
        if (compareMode === 'split') {
          setIsDraggingSlider(true);
          updateSliderFromClientX(e.clientX, e.currentTarget);
          e.currentTarget.setPointerCapture(e.pointerId);
        } else if (compareMode === 'after' && onPanDelta && !isModal) {
          setIsPanning(true);
          panStartRef.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      }}
      onPointerMove={(e) => {
        if (isDraggingSlider && compareMode === 'split') {
          updateSliderFromClientX(e.clientX, e.currentTarget);
        } else if (isPanning && panStartRef.current && onPanDelta && !isModal) {
          const rect = e.currentTarget.getBoundingClientRect();
          const dx = e.clientX - panStartRef.current.x;
          const dy = e.clientY - panStartRef.current.y;
          panStartRef.current = { x: e.clientX, y: e.clientY };
          if (rect.width > 0 && rect.height > 0) {
            onPanDelta((dx / rect.width) * 160, (dy / rect.height) * 160);
          }
        }
      }}
      onPointerUp={(e) => {
        if (isDraggingSlider) setIsDraggingSlider(false);
        if (isPanning) {
          setIsPanning(false);
          panStartRef.current = null;
        }
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }}
      className={`relative select-none overflow-hidden rounded-2xl shadow-lg border border-slate-200/90 bg-white ${
        compareMode === 'split'
          ? 'cursor-ew-resize'
          : compareMode === 'after' && onPanDelta && !isModal
          ? isPanning
            ? 'cursor-grabbing'
            : 'cursor-grab'
          : 'cursor-default'
      } ${isModal ? 'max-h-[78vh] w-auto' : 'max-h-[500px] lg:max-h-[540px] w-auto'}`}
    >
      {/* Base Layer: After (or Before if mode==='before') */}
      {compareMode === 'before' ? (
        beforeUrl && (
          <img
            src={beforeUrl}
            alt="Original photo"
            draggable={false}
            className="w-full h-full object-contain block pointer-events-none"
          />
        )
      ) : (
        afterUrl && (
          <img
            src={afterUrl}
            alt="Edited studio photo"
            draggable={false}
            className="w-full h-full object-contain block pointer-events-none"
          />
        )
      )}

      {/* Split Comparison Overlay (Left = Before Original, Right = After Edited) */}
      {compareMode === 'split' && beforeUrl && (
        <>
          <img
            src={beforeUrl}
            alt="Original before comparison"
            draggable={false}
            style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
            className="absolute inset-0 w-full h-full object-contain block pointer-events-none"
          />

          {/* Vertical Divider Line & Handle */}
          <div
            style={{ left: `${splitPos}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(15,23,42,0.45)] pointer-events-none"
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-indigo-700 border-2 border-indigo-600 shadow-md flex items-center justify-center">
              <Columns2 className="w-4 h-4" />
            </div>
          </div>

          {/* Corner Before / After labels */}
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/75 text-white text-[10px] font-bold pointer-events-none">
            আগে (Before)
          </span>
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-indigo-600/90 text-white text-[10px] font-bold pointer-events-none">
            পরে (After)
          </span>
        </>
      )}

      {/* Passport / Biometric Face Alignment Guide Overlay */}
      {showFaceGuide && (
        <svg
          viewBox="0 0 100 122"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Crown clearance line */}
          <line x1="0" y1="12" x2="100" y2="12" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="2 2" />
          {/* Eye level line */}
          <line x1="0" y1="47" x2="100" y2="47" stroke="#059669" strokeWidth="0.6" strokeDasharray="3 2" />
          {/* Chin line */}
          <line x1="0" y1="84" x2="100" y2="84" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="2 2" />
          {/* Center vertical axis */}
          <line x1="50" y1="0" x2="50" y2="122" stroke="#6366f1" strokeWidth="0.4" strokeDasharray="2 2" />
          {/* Head oval */}
          <ellipse
            cx="50"
            cy="49"
            rx="27"
            ry="34"
            fill="none"
            stroke="#2563eb"
            strokeWidth="0.7"
            strokeDasharray="3 2"
          />
        </svg>
      )}

      {/* Processing Progress Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
          <p className="text-xs sm:text-sm font-bold text-slate-900">
            {processingLabel || 'ছবি প্রসেস হচ্ছে...'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            সম্পূর্ণ ব্রাউজারে প্রসেসিং চলছে — কোনো খরচ নেই
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-100/70 min-h-[480px] lg:min-h-[600px] relative">
      {/* Compact Top Stage Controls Bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
        {/* Before / Split / After Segmented Switch */}
        <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => setCompareMode('after')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              compareMode === 'after'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>এডিটেড</span>
          </button>
          <button
            type="button"
            onClick={() => setCompareMode('split')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              compareMode === 'split'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>আগে / পরে</span>
          </button>
          <button
            type="button"
            onClick={() => setCompareMode('before')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              compareMode === 'before'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>মূল ছবি</span>
          </button>
        </div>

        {/* Center Dimension Spec */}
        <span className="text-[11px] font-semibold text-slate-500 tabular-nums hidden xl:inline">
          {outputDimensionLabel}
        </span>

        {/* Right Zoom, Guide & Fullscreen Tools */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleFaceGuide}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 cursor-pointer ${
              showFaceGuide
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="পাসপোর্ট ফেস ও চোখ অ্যালাইনমেন্ট গাইড"
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPassportMode ? 'ফেস গাইড' : 'গাইড'}</span>
          </button>

          <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setZoomPercent((z) => Math.max(60, z - 15))}
              className="p-1.5 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="জুম আউট"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[11px] font-bold text-slate-700 tabular-nums min-w-[38px] text-center">
              {zoomPercent}%
            </span>
            <button
              type="button"
              onClick={() => setZoomPercent((z) => Math.min(180, z + 15))}
              className="p-1.5 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="জুম ইন"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition cursor-pointer"
            title="ফুলস্ক্রিন প্রিভিউ"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-auto">
        <div
          style={{
            transform: `scale(${zoomPercent / 100})`,
            transformOrigin: 'center center',
            transition: 'transform 120ms ease-out',
          }}
          className="flex items-center justify-center"
        >
          {renderPreviewFrame(stageRef, false)}
        </div>

        {/* Helpful Micro-Hint beneath stage */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 font-medium">
          {compareMode === 'split' ? (
            <span>স্লাইডার ডানে-বামে টেনে আগে ও পরের পার্থক্য দেখুন</span>
          ) : (
            <span className="flex items-center gap-1">
              <Move className="w-3 h-3 text-slate-400" />
              ছবি টেনে (Drag) ফ্রেমের ভেতর পজিশন ঠিক করতে পারবেন
            </span>
          )}
          <span className="text-slate-300">·</span>
          <span className="tabular-nums">{outputDimensionLabel}</span>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl flex items-center justify-between mb-3 text-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">ফুলস্ক্রিন প্রিভিউ</span>
              <span className="text-xs text-slate-300 tabular-nums">({outputDimensionLabel})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompareMode((m) => (m === 'split' ? 'after' : 'split'))}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
              >
                {compareMode === 'split' ? 'শুধু এডিটেড দেখুন' : 'আগে/পরে স্লাইডার'}
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center w-full max-w-4xl">
            {renderPreviewFrame(undefined, true)}
          </div>
        </div>
      )}
    </div>
  );
};
