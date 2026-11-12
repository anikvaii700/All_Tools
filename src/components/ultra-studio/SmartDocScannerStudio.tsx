import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Camera,
  Layers,
  Sparkles,
  FileText,
  Printer,
  Download,
  RotateCw,
  RotateCcw,
  Crop,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Image as ImageIcon,
  Check,
  ArrowUp,
  ArrowDown,
  Archive,
  Palette,
  Sun,
  Contrast as ContrastIcon,
  Zap,
  HelpCircle,
  FileDown,
} from 'lucide-react';
import {
  ScannedDocPage,
  DocScannerGlobalSettings,
  DEFAULT_DOC_SCANNER_SETTINGS,
  DocColorMode,
  DocScalingMode,
  DocA4Orientation,
} from './docScannerTypes';
import {
  detectDocumentCorners,
  warpDocumentPerspective,
  enhanceDocumentImage,
  createDemoDocumentFile,
} from './documentDetector';
import {
  renderScannedDocToA4Canvas,
  resolveEffectiveOrientation,
  exportScannedDocsToPdf,
  downloadA4PageAsJpg,
  downloadAllPagesAsZip,
  triggerScannedDocsPrint,
} from './a4DocComposer';
import { DocManualCropModal } from './DocManualCropModal';
import { CardCorners } from './types';

interface SmartDocScannerStudioProps {
  onBackToDashboard: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const SmartDocScannerStudio: React.FC<SmartDocScannerStudioProps> = ({
  onBackToDashboard,
  onShowToast,
}) => {
  // Scanned pages state
  const [pages, setPages] = useState<ScannedDocPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Global settings
  const [settings, setSettings] = useState<DocScannerGlobalSettings>(
    DEFAULT_DOC_SCANNER_SETTINGS
  );

  // UI state
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [showOriginalComparison, setShowOriginalComparison] = useState<boolean>(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Manual Crop Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const activePage = pages[activePageIndex] || pages[0] || null;

  // Process a single page through perspective warp and enhancement pipeline
  const processPagePipeline = useCallback(
    async (
      page: ScannedDocPage,
      overrideCorners?: CardCorners
    ): Promise<ScannedDocPage> => {
      if (!page.imgElement) return page;

      const cornersToUse = overrideCorners || page.corners;

      // 1. Perspective Warp & Deskew
      const warpCanvas = warpDocumentPerspective(page.imgElement, cornersToUse);

      // 2. Cleaning & Enhancement
      const enhanceCanvas = enhanceDocumentImage(warpCanvas, {
        colorMode: page.colorMode,
        brightness: page.brightness,
        contrast: page.contrast,
        sharpness: page.sharpness,
        removeShadows: page.removeShadows,
        shadowRemovalStrength: page.shadowRemovalStrength,
      });

      // 3. Render A4 Preview Canvas
      const tempPage: ScannedDocPage = {
        ...page,
        corners: cornersToUse,
        processedWarpCanvas: warpCanvas,
        processedEnhanceCanvas: enhanceCanvas,
      };

      const a4Canvas = renderScannedDocToA4Canvas(tempPage, settings, false);
      const previewA4Url = a4Canvas.toDataURL('image/jpeg', 0.88);

      return {
        ...tempPage,
        finalA4Canvas: a4Canvas,
        previewA4Url,
        stage: 'completed',
        statusMessage: 'প্রস্তুত',
        progressPercent: 100,
      };
    },
    [settings]
  );

  // Handle uploading files and running the automatic pipeline sequentially
  const handleAddFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileList = Array.from(files).filter((f) =>
        f.type.match(/^image\/(jpeg|jpg|png|webp)$/i)
      );

      if (fileList.length === 0) {
        onShowToast('অনুগ্রহ করে JPG, PNG বা WebP ফরম্যাটের ছবি নির্বাচন করুন।', '⚠️');
        return;
      }

      setIsProcessingBatch(true);
      setBatchProgress(10);
      onShowToast(`${fileList.length}টি ডকুমেন্ট প্রসেসিং শুরু হয়েছে...`, '⏳');

      const newPages: ScannedDocPage[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const rawUrl = URL.createObjectURL(file);

        // Load HTMLImageElement
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = rawUrl;
        });

        // 1. Detect Document Boundaries
        const detection = detectDocumentCorners(img);

        const initialPage: ScannedDocPage = {
          id: 'doc_' + Math.random().toString(36).substr(2, 9),
          file,
          fileName: file.name,
          fileSize: file.size,
          rawUrl,
          imgElement: img,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          corners: detection.corners,
          autoDetectedCorners: detection.corners,
          confidence: detection.confidence,
          rotation: 0,
          stage: detection.isAutoDetected ? 'completed' : 'needs_adjustment',
          statusMessage: detection.isAutoDetected ? 'স্বয়ংক্রিয় ক্রপ সম্পন্ন' : 'ম্যানুয়াল চেক প্রয়োজন',
          progressPercent: 50,
          colorMode: settings.defaultColorMode,
          brightness: 0,
          contrast: 0,
          sharpness: 35,
          removeShadows: true,
          shadowRemovalStrength: 65,
          scalingMode: settings.globalScaling,
          a4Orientation: settings.globalOrientation,
          processedWarpCanvas: null,
          processedEnhanceCanvas: null,
          finalA4Canvas: null,
          previewA4Url: null,
          createdAt: Date.now() + i,
        };

        // 2. Warp & Enhance
        const fullyProcessed = await processPagePipeline(initialPage);
        newPages.push(fullyProcessed);

        const percent = Math.round(((i + 1) / fileList.length) * 100);
        setBatchProgress(percent);
      }

      setPages((prev) => {
        const updated = [...prev, ...newPages];
        return updated;
      });

      setIsProcessingBatch(false);
      setBatchProgress(100);
      onShowToast(
        `${fileList.length}টি ডকুমেন্ট সফলভাবে স্ক্যান ও A4 পেজে সাজানো হয়েছে!`,
        '✨'
      );
    },
    [onShowToast, processPagePipeline, settings]
  );

  // Load sample demo documents for instant testing
  const handleLoadDemo = async () => {
    try {
      onShowToast('নমুনা মোবাইল ফটো তৈরি হচ্ছে...', '⏳');
      const demo1 = await createDemoDocumentFile('official_application');
      const demo2 = await createDemoDocumentFile('nid_certificate');
      await handleAddFiles([demo1, demo2]);
    } catch (e) {
      onShowToast('নমুনা ডকুমেন্ট লোড করতে সমস্যা হয়েছে।', '⚠️');
    }
  };

  // Re-render preview canvas whenever active page or settings change
  useEffect(() => {
    if (!previewCanvasRef.current || !activePage) return;

    const canvas = previewCanvasRef.current;
    const a4 = renderScannedDocToA4Canvas(activePage, settings, false);

    canvas.width = a4.width;
    canvas.height = a4.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(a4, 0, 0);
    }
  }, [activePage, settings]);

  // Update specific page and re-run enhancement pipeline
  const updateActivePage = useCallback(
    async (updater: (p: ScannedDocPage) => Partial<ScannedDocPage>) => {
      if (!activePage) return;

      const changes = updater(activePage);
      const merged: ScannedDocPage = { ...activePage, ...changes };

      // Re-run pipeline
      const reprocessed = await processPagePipeline(merged);

      setPages((prev) =>
        prev.map((p) => (p.id === activePage.id ? reprocessed : p))
      );
    },
    [activePage, processPagePipeline]
  );

  // Apply current filter/color mode to all pages
  const handleApplyFilterToAllPages = () => {
    if (!activePage) return;
    const { colorMode, brightness, contrast, sharpness, removeShadows, shadowRemovalStrength } = activePage;

    setPages((prev) =>
      prev.map((p) => {
        const updated: ScannedDocPage = {
          ...p,
          colorMode,
          brightness,
          contrast,
          sharpness,
          removeShadows,
          shadowRemovalStrength,
        };
        // Re-enhance
        if (updated.processedWarpCanvas) {
          const enhanceCanvas = enhanceDocumentImage(updated.processedWarpCanvas, {
            colorMode,
            brightness,
            contrast,
            sharpness,
            removeShadows,
            shadowRemovalStrength,
          });
          const a4Canvas = renderScannedDocToA4Canvas(
            { ...updated, processedEnhanceCanvas: enhanceCanvas },
            settings,
            false
          );
          return {
            ...updated,
            processedEnhanceCanvas: enhanceCanvas,
            finalA4Canvas: a4Canvas,
            previewA4Url: a4Canvas.toDataURL('image/jpeg', 0.88),
          };
        }
        return updated;
      })
    );

    onShowToast('সকল পাতায় বর্তমান কালার ও সেটিংস প্রয়োগ করা হয়েছে!', '✨');
  };

  // Rotate active document 90 degrees clockwise
  const handleRotate90 = async (clockwise = true) => {
    if (!activePage || !activePage.imgElement) return;

    const img = activePage.imgElement;
    const cvs = document.createElement('canvas');
    cvs.width = img.naturalHeight;
    cvs.height = img.naturalWidth;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    ctx.translate(cvs.width / 2, cvs.height / 2);
    ctx.rotate(((clockwise ? 90 : -90) * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

    const rotatedImg = new Image();
    rotatedImg.onload = async () => {
      const detection = detectDocumentCorners(rotatedImg);
      const updated: ScannedDocPage = {
        ...activePage,
        imgElement: rotatedImg,
        naturalWidth: rotatedImg.naturalWidth,
        naturalHeight: rotatedImg.naturalHeight,
        corners: detection.corners,
        autoDetectedCorners: detection.corners,
      };
      const reprocessed = await processPagePipeline(updated);
      setPages((prev) =>
        prev.map((p) => (p.id === activePage.id ? reprocessed : p))
      );
      onShowToast('ডকুমেন্ট ৯০° ঘোরানো হয়েছে!', '🔄');
    };
    rotatedImg.src = cvs.toDataURL();
  };

  // Reorder page up or down
  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    setPages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
    setActivePageIndex(targetIndex);
  };

  // Delete page
  const handleDeletePage = (pageId: string) => {
    setPages((prev) => {
      const remaining = prev.filter((p) => p.id !== pageId);
      if (activePageIndex >= remaining.length) {
        setActivePageIndex(Math.max(0, remaining.length - 1));
      }
      return remaining;
    });
    onShowToast('পৃষ্ঠাটি মুছে ফেলা হয়েছে।', '🗑️');
  };

  // Reset active page to original crop and unedited state
  const handleResetToOriginal = async () => {
    if (!activePage) return;
    await updateActivePage(() => ({
      corners: activePage.autoDetectedCorners,
      colorMode: 'original',
      brightness: 0,
      contrast: 0,
      sharpness: 0,
      removeShadows: false,
    }));
    onShowToast('ডকুমেন্ট আগের অবস্থায় ফিরিয়ে আনা হয়েছে।', '↩️');
  };

  // Auto clean one-click
  const handleAutoClean = async () => {
    if (!activePage) return;
    await updateActivePage(() => ({
      colorMode: 'color',
      removeShadows: true,
      shadowRemovalStrength: 75,
      contrast: 15,
      brightness: 5,
      sharpness: 45,
    }));
    onShowToast('অটো ক্লিন ও ছায়া দূরীকরণ সম্পন্ন!', '✨');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={(e) => {
          if (e.target.files) handleAddFiles(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files) handleAddFiles(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={async (e) => {
          if (e.target.files?.[0] && replaceTargetId) {
            const file = e.target.files[0];
            const rawUrl = URL.createObjectURL(file);
            const img = new Image();
            img.onload = async () => {
              const detection = detectDocumentCorners(img);
              const target = pages.find((p) => p.id === replaceTargetId);
              if (target) {
                const updated: ScannedDocPage = {
                  ...target,
                  file,
                  fileName: file.name,
                  fileSize: file.size,
                  rawUrl,
                  imgElement: img,
                  naturalWidth: img.naturalWidth,
                  naturalHeight: img.naturalHeight,
                  corners: detection.corners,
                  autoDetectedCorners: detection.corners,
                };
                const reprocessed = await processPagePipeline(updated);
                setPages((prev) =>
                  prev.map((p) => (p.id === replaceTargetId ? reprocessed : p))
                );
                onShowToast('ডকুমেন্ট প্রতিস্থাপন করা হয়েছে!', '✅');
              }
            };
            img.src = rawUrl;
          }
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Manual 4-Corner Crop Modal */}
      {isCropModalOpen && activePage && activePage.imgElement && (
        <DocManualCropModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          onApply={async (newCorners, rotatedImg) => {
            await updateActivePage(() => ({
              corners: newCorners,
              ...(rotatedImg ? { imgElement: rotatedImg, naturalWidth: rotatedImg.naturalWidth, naturalHeight: rotatedImg.naturalHeight } : {}),
            }));
            onShowToast('নতুন কর্নার অনুযায়ী ক্রপ ও সোজা করা সম্পন্ন!', '✅');
          }}
          title={activePage.fileName}
          imgElement={activePage.imgElement}
          initialCorners={activePage.corners}
        />
      )}

      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="স্টুডিও ড্যাশবোর্ডে ফিরুন"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                  Ultra Digital Studio
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                  স্মার্ট ডকুমেন্ট স্ক্যানার ও অটো A4 মেকার
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                স্মার্ট ডকুমেন্ট স্ক্যানার ও অটো A4 মেকার (Smart Doc Scanner)
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              নমুনা ডকুমেন্ট
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer sm:hidden"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              ক্যামেরা
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              ডকুমেন্ট ফটো যোগ করুন
            </button>
          </div>
        </div>

        {/* Batch Processing Progress Bar */}
        {isProcessingBatch && (
          <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 h-full transition-all duration-300"
              style={{ width: `${batchProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Studio Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        {pages.length === 0 ? (
          /* Empty State / Upload Dropzone */
          <div className="max-w-3xl mx-auto mt-8 sm:mt-12">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleAddFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all bg-white ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/40 ring-4 ring-emerald-100'
                  : 'border-slate-300 hover:border-slate-400'
              } shadow-sm`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-emerald-100 via-teal-50 to-indigo-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                মোবাইল দিয়ে তোলা ডকুমেন্টের ছবি আপলোড করুন
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-6 leading-relaxed">
                আঁকাবাঁকা, তেরছা, টেবিলের ওপর রাখা বা ছায়াযুক্ত যেকোনো দরখাস্ত, সনদপত্র, রসিদ বা দলিলের ছবি আপলোড করলেই
                স্বয়ংক্রিয়ভাবে ৪টি কোণা শনাক্ত করে সোজা করবে, ছায়া দূর করবে এবং প্রিন্ট-রেডি নিখুঁত A4 পেজে তৈরি করবে।
              </p>

              {/* Upload buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  কম্পিউটার / গ্যালারি থেকে সিলেক্ট করুন
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-2xl font-bold text-sm shadow-2xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-indigo-600" />
                  ক্যামেরা দিয়ে ছবি তুলুন
                </button>
                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="px-5 py-3 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 rounded-2xl font-bold text-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  নমুনা দিয়ে টেস্ট করুন
                </button>
              </div>

              {/* Feature highlight bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto pt-6 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>অটো সোজা ও ক্রপ:</strong> মোবাইল ছবির ৪-পয়েন্ট পারস্পেক্টিভ কারেকশন
                  </span>
                </div>
                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>ছায়া দূরীকরণ:</strong> লেখার মূল কালি ও সিল অক্ষুণ্ণ রেখে ব্যাকগ্রাউন্ড পরিষ্কার
                  </span>
                </div>
                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-2xl">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>বহু-পৃষ্ঠা PDF ও A4:</strong> এক ক্লিকে সব পৃষ্ঠা একসাথে PDF বা সরাসরি প্রিন্ট
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Page Studio Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Multi-Page Thumbnails & Reordering Sidebar (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      ডকুমেন্ট পৃষ্ঠাসমূহ ({pages.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
                    title="আরও পৃষ্ঠা যুক্ত করুন"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    যোগ করুন
                  </button>
                </div>

                {/* Thumbnails List */}
                <div className="space-y-2.5 mt-3 max-h-[68vh] overflow-y-auto pr-1">
                  {pages.map((page, idx) => {
                    const isSelected = idx === activePageIndex;
                    return (
                      <div
                        key={page.id}
                        onClick={() => setActivePageIndex(idx)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {/* Page Preview Thumbnail */}
                        <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center relative">
                          {page.previewA4Url ? (
                            <img
                              src={page.previewA4Url}
                              alt={`Page ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-5 h-5 text-slate-400" />
                          )}
                          <span className="absolute bottom-0.5 right-0.5 bg-slate-900/80 text-white text-[9px] font-bold px-1 rounded">
                            {idx + 1}
                          </span>
                        </div>

                        {/* Page Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              পৃষ্ঠা {idx + 1}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                                page.stage === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {page.stage === 'completed' ? 'A4 রেডি' : 'অ্যাডজাস্ট'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {page.fileName}
                          </p>

                          {/* Reorder and Quick Action Buttons */}
                          <div className="flex items-center gap-1 mt-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMovePage(idx, 'up');
                              }}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-25 cursor-pointer"
                              title="উপরে নিন"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMovePage(idx, 'down');
                              }}
                              disabled={idx === pages.length - 1}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-25 cursor-pointer"
                              title="নিচে নিন"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReplaceTargetId(page.id);
                                replaceFileInputRef.current?.click();
                              }}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 cursor-pointer"
                              title="ছবি প্রতিস্থাপন করুন"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePage(page.id);
                              }}
                              className="p-1 rounded hover:bg-rose-100 text-rose-500 cursor-pointer ml-auto"
                              title="পৃষ্ঠা মুছুন"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Master Multi-Page PDF & Print Hub */}
              <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 rounded-3xl p-4 text-white shadow-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    ডাউনলোড ও প্রিন্ট
                  </span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {pages.length}টি পাতা
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => exportScannedDocsToPdf(pages, settings)}
                  className="w-full py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-emerald-600" />
                  সব পাতা ১টি PDF এ ডাউনলোড
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => triggerScannedDocsPrint(pages, settings)}
                    className="py-2 bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-400/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    A4 প্রিন্ট করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadAllPagesAsZip(pages, settings)}
                    className="py-2 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    সব পাতা ZIP
                  </button>
                </div>
              </div>
            </div>

            {/* Center Column: Live A4 Canvas Workspace (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
                {/* Preview Action Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      পৃষ্ঠা {activePageIndex + 1} / {pages.length}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      (A4 সাইজ — {resolveEffectiveOrientation(activePage, settings) === 'landscape' ? 'আড়াআড়ি' : 'খাড়া'})
                    </span>
                  </div>

                  {/* Zoom & Comparison Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowOriginalComparison((prev) => !prev)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition cursor-pointer ${
                        showOriginalComparison
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="আসল ক্যামেরা ছবির সাথে তুলনা দেখুন"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      {showOriginalComparison ? 'স্ক্যান করা A4 দেখুন' : 'আসল ছবি দেখুন'}
                    </button>

                    <div className="flex items-center bg-white border border-slate-200 rounded-lg px-1 text-slate-600">
                      <button
                        type="button"
                        onClick={() => setPreviewZoom((z) => Math.max(50, z - 15))}
                        className="p-1 hover:text-slate-900 cursor-pointer"
                        title="জুম আউট"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold px-1.5">{previewZoom}%</span>
                      <button
                        type="button"
                        onClick={() => setPreviewZoom((z) => Math.min(160, z + 15))}
                        className="p-1 hover:text-slate-900 cursor-pointer"
                        title="জুম ইন"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Canvas Render Stage */}
                <div className="bg-slate-900/95 min-h-[460px] sm:min-h-[560px] p-4 flex items-center justify-center overflow-auto relative">
                  {showOriginalComparison && activePage.rawUrl ? (
                    /* Original camera image comparison view */
                    <div className="relative max-w-full max-h-[540px] flex items-center justify-center">
                      <img
                        src={activePage.rawUrl}
                        alt="Original Upload"
                        className="max-h-[520px] max-w-full object-contain rounded-xl shadow-2xl border border-slate-700"
                      />
                      <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        📷 ক্যামেরা দিয়ে তোলা মূল ছবি (আন-এডিটেড)
                      </div>
                    </div>
                  ) : (
                    /* Scanned A4 Canvas with realistic shadow & printable margin preview */
                    <div
                      className="transition-transform duration-200 flex items-center justify-center shadow-2xl"
                      style={{ transform: `scale(${previewZoom / 100})` }}
                    >
                      <canvas
                        ref={previewCanvasRef}
                        className="max-w-full max-h-[540px] sm:max-h-[580px] w-auto h-auto rounded shadow-2xl border border-slate-700 block bg-white"
                      />
                    </div>
                  )}

                  {/* Quick corner indicator badge */}
                  {activePage.confidence && (
                    <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-slate-300 text-[10px] font-medium px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1.5 shadow">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>কর্নার নির্ভুলতা: {activePage.confidence}%</span>
                    </div>
                  )}
                </div>

                {/* Bottom Canvas Toolbar */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRotate90(false)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition cursor-pointer"
                      title="বামে ৯০° ঘোরান"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      ⟲ বামে
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRotate90(true)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition cursor-pointer"
                      title="ডানে ৯০° ঘোরান"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-slate-600" />
                      ⟳ ডানে
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCropModalOpen(true)}
                      className="px-3 py-1.5 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-300 hover:border-teal-400 text-teal-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      title="ডকুমেন্টের ৪টি কোণা ম্যানুয়ালি টেনে ঠিক করুন"
                    >
                      <Crop className="w-3.5 h-3.5 text-teal-600" />
                      ম্যানুয়াল ৪-কোণা ক্রপ
                    </button>
                  </div>

                  {/* Single page download */}
                  <button
                    type="button"
                    onClick={() => downloadA4PageAsJpg(activePage, activePageIndex, settings)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    এই পাতা JPG ডাউনলোড
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Editing & Filter Controls (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">ফিল্টার ও ডকুমেন্ট ক্লিনিং</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoClean}
                    className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    অটো ক্লিন
                  </button>
                </div>

                {/* Color Mode Tabs */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    কালার মোড নির্বাচন
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateActivePage(() => ({ colorMode: 'color' }))}
                      className={`p-2 rounded-xl text-xs font-bold border text-left transition flex items-center gap-2 cursor-pointer ${
                        activePage.colorMode === 'color'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-300'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Palette className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>কালার ডকুমেন্ট</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateActivePage(() => ({ colorMode: 'bw' }))}
                      className={`p-2 rounded-xl text-xs font-bold border text-left transition flex items-center gap-2 cursor-pointer ${
                        activePage.colorMode === 'bw'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-300'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>ফটোকপি (B&W)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateActivePage(() => ({ colorMode: 'grayscale' }))}
                      className={`p-2 rounded-xl text-xs font-bold border text-left transition flex items-center gap-2 cursor-pointer ${
                        activePage.colorMode === 'grayscale'
                          ? 'border-slate-500 bg-slate-100 text-slate-800 ring-1 ring-slate-300'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>গ্রেস্কেল</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateActivePage(() => ({ colorMode: 'original' }))}
                      className={`p-2 rounded-xl text-xs font-bold border text-left transition flex items-center gap-2 cursor-pointer ${
                        activePage.colorMode === 'original'
                          ? 'border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-300'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>আসল ছবি</span>
                    </button>
                  </div>
                </div>

                {/* Shadow Removal Toggle & Strength */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      ছায়া দূরীকরণ (Shadow Clean)
                    </label>
                    <input
                      type="checkbox"
                      checked={activePage.removeShadows}
                      onChange={(e) =>
                        updateActivePage(() => ({ removeShadows: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                    />
                  </div>

                  {activePage.removeShadows && (
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>ছায়া পরিষ্কারের মাত্রা</span>
                        <span className="font-bold">{activePage.shadowRemovalStrength}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={activePage.shadowRemovalStrength}
                        onChange={(e) =>
                          updateActivePage(() => ({
                            shadowRemovalStrength: Number(e.target.value),
                          }))
                        }
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>
                  )}
                </div>

                {/* Sliders: Brightness, Contrast, Sharpness */}
                <div className="space-y-3 pt-1">
                  {/* Brightness */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        উজ্জ্বলতা (Brightness)
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {activePage.brightness > 0 ? `+${activePage.brightness}` : activePage.brightness}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={activePage.brightness}
                      onChange={(e) =>
                        updateActivePage(() => ({ brightness: Number(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span className="flex items-center gap-1">
                        <ContrastIcon className="w-3.5 h-3.5 text-indigo-500" />
                        কনট্রাস্ট (Contrast)
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {activePage.contrast > 0 ? `+${activePage.contrast}` : activePage.contrast}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="50"
                      value={activePage.contrast}
                      onChange={(e) =>
                        updateActivePage(() => ({ contrast: Number(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Sharpness */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                        শার্পনেস (Sharpness)
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {activePage.sharpness}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activePage.sharpness}
                      onChange={(e) =>
                        updateActivePage(() => ({ sharpness: Number(e.target.value) }))
                      }
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* A4 Sheet Placement & Margin Controls */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    A4 লেআউট ও ওরিয়েন্টেশন
                  </span>

                  {/* Orientation selector */}
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, globalOrientation: 'auto' }))
                      }
                      className={`py-1.5 rounded-lg border font-bold transition cursor-pointer text-center ${
                        settings.globalOrientation === 'auto'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      স্বয়ংক্রিয়
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, globalOrientation: 'portrait' }))
                      }
                      className={`py-1.5 rounded-lg border font-bold transition cursor-pointer text-center ${
                        settings.globalOrientation === 'portrait'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      A4 খাড়া
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, globalOrientation: 'landscape' }))
                      }
                      className={`py-1.5 rounded-lg border font-bold transition cursor-pointer text-center ${
                        settings.globalOrientation === 'landscape'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      A4 আড়াআড়ি
                    </button>
                  </div>

                  {/* Scaling options */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, globalScaling: 'fit' }))
                      }
                      className={`py-1.5 px-2 rounded-lg border font-semibold transition cursor-pointer text-center ${
                        settings.globalScaling === 'fit'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Fit to Page (সুষম)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, globalScaling: 'fill' }))
                      }
                      className={`py-1.5 px-2 rounded-lg border font-semibold transition cursor-pointer text-center ${
                        settings.globalScaling === 'fill'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Fill Printable (পূর্ণ)
                    </button>
                  </div>
                </div>

                {/* Batch Actions & Reset */}
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleApplyFilterToAllPages}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                    সব পাতায় এই ফিল্টার দিন
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToOriginal}
                    className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-semibold text-center transition cursor-pointer"
                  >
                    আগের অবস্থায় রিসেট করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
