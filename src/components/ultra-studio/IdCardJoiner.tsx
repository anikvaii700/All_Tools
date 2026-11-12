import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  FileText,
  Printer,
  Download,
  RotateCw,
  Crop,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  Trash2,
  Info,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Layers,
  Scissors,
  Share2,
  ImageIcon,
} from 'lucide-react';
import {
  CardImageState,
  PageLayoutSettings,
  PaperSize,
  PageOrientation,
  CardLayout,
  PAPER_DIMENSIONS_MM,
  STANDARD_ID_CARD,
  CardCorners,
} from './types';
import {
  detectCardCorners,
  warpPerspective,
  applyImageAdjustments,
  createDemoIdCardFile,
  applyCamScannerSafeInset,
} from './cardDetector';
import {
  renderCombinedPageToCanvas,
  downloadCanvasAsJpg,
  exportToPdf,
  calculateCardPlacements,
  triggerDirectPrint,
} from './pageComposer';
import { ManualCropModal } from './ManualCropModal';
import { StudioPrintModal } from './StudioPrintModal';

interface IdCardJoinerProps {
  onBackToHub?: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const DEFAULT_SETTINGS: PageLayoutSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  layout: 'side-by-side',
  alignment: 'center',
  cardWidthMm: STANDARD_ID_CARD.widthMm, // 85.6 mm
  cardHeightMm: STANDARD_ID_CARD.heightMm, // 53.98 mm
  marginMm: 15,
  gapMm: 10,
  scalePercent: 100, // 100% = true-to-life physical ID size
  showCutBorder: false, // OFF by default: clean borderless cards
  showCropMarks: false, // OFF by default: removes all corner bracket marks!
  showFooterInfo: false, // OFF by default: clean white page
  swapSides: false,
  backgroundColor: '#ffffff',
};

export const IdCardJoiner: React.FC<IdCardJoinerProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  // Stage state: 1 = Upload, 2 = Processing, 3 = Workspace & Export
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);

  // Front & Back Card Image States
  const [frontCard, setFrontCard] = useState<CardImageState>({
    file: null,
    rawUrl: null,
    imgElement: null,
    naturalWidth: 0,
    naturalHeight: 0,
    corners: null,
    processedUrl: null,
    processedCanvas: null,
    rotation: 0,
    flipH: false,
    flipV: false,
    brightness: 0,
    contrast: 0,
    sharpness: true,
    isProcessing: false,
    error: null,
  });

  const [backCard, setBackCard] = useState<CardImageState>({
    file: null,
    rawUrl: null,
    imgElement: null,
    naturalWidth: 0,
    naturalHeight: 0,
    corners: null,
    processedUrl: null,
    processedCanvas: null,
    rotation: 0,
    flipH: false,
    flipV: false,
    brightness: 0,
    contrast: 0,
    sharpness: true,
    isProcessing: false,
    error: null,
  });

  // Toggle view between Cropped Card vs Original Photo in upload preview boxes
  const [frontViewMode, setFrontViewMode] = useState<'cropped' | 'original'>('cropped');
  const [backViewMode, setBackViewMode] = useState<'cropped' | 'original'>('cropped');

  // Processing state
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [processingStatusText, setProcessingStatusText] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState<number>(0);

  // Layout settings
  const [settings, setSettings] = useState<PageLayoutSettings>(DEFAULT_SETTINGS);

  // Manual Crop Modal State
  const [cropModalSide, setCropModalSide] = useState<'front' | 'back' | null>(null);

  // Combined Canvas Preview
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // Hidden print container
  const printImgRef = useRef<HTMLImageElement>(null);

  // File Inputs
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const frontCameraInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);
  const backCameraInputRef = useRef<HTMLInputElement>(null);

  // Drag states
  const [isFrontDragging, setIsFrontDragging] = useState<boolean>(false);
  const [isBackDragging, setIsBackDragging] = useState<boolean>(false);

  // Process Card Perspective & Adjustments (Returns real canvas & data URL)
  const processCardSide = useCallback(
    (cardState: CardImageState): { canvas: HTMLCanvasElement; url: string } | null => {
      if (!cardState.imgElement) return null;

      const corners = cardState.corners || detectCardCorners(cardState.imgElement);

      // 1. Perspective warp to standard 1200x756 crisp canvas
      const warpedCanvas = warpPerspective(cardState.imgElement, corners, 1200, 756);

      // 2. Apply rotation, flip, contrast, and sharpening
      const adjustedCanvas = applyImageAdjustments(
        warpedCanvas,
        cardState.rotation,
        cardState.flipH,
        cardState.flipV,
        cardState.brightness,
        cardState.contrast,
        cardState.sharpness
      );

      const url = adjustedCanvas.toDataURL('image/jpeg', 0.95);
      return { canvas: adjustedCanvas, url };
    },
    []
  );

  // Helper to load image file into state & pre-process immediately
  const handleLoadImageFile = useCallback(
    (file: File, side: 'front' | 'back') => {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
        onShowToast('অনুগ্রহ করে JPG, PNG অথবা WEBP ফরম্যাটের ছবি আপলোড করুন।', '⚠️');
        return;
      }

      // Check max file size (25MB)
      if (file.size > 25 * 1024 * 1024) {
        onShowToast('ছবির সাইজ ২৫MB এর কম হওয়া প্রয়োজন।', '⚠️');
        return;
      }

      const rawUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const initialCorners = detectCardCorners(img);

        const cardState: CardImageState = {
          file,
          rawUrl,
          imgElement: img,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          corners: initialCorners,
          processedUrl: null,
          processedCanvas: null,
          rotation: 0,
          flipH: false,
          flipV: false,
          brightness: 0,
          contrast: 0,
          sharpness: true,
          isProcessing: false,
          error: null,
        };

        // Pre-process right away so preview canvas has real pixels immediately
        const res = processCardSide(cardState);
        cardState.processedCanvas = res?.canvas || null;
        cardState.processedUrl = res?.url || null;

        const updater = side === 'front' ? setFrontCard : setBackCard;
        updater((prev) => {
          if (prev.rawUrl) URL.revokeObjectURL(prev.rawUrl);
          return cardState;
        });

        // Default to showing the cropped card
        if (side === 'front') setFrontViewMode('cropped');
        else setBackViewMode('cropped');

        onShowToast(`${side === 'front' ? 'সামনের' : 'পেছনের'} ছবি সফলভাবে যোগ হয়েছে!`, '✅');
      };

      img.onerror = () => {
        onShowToast('ছবিটি লোড করা সম্ভব হয়নি। অনুগ্রহ করে পরিষ্কার ছবি নির্বাচন করুন।', '⚠️');
      };

      img.src = rawUrl;
    },
    [onShowToast, processCardSide]
  );

  // Load Demo ID Card for instant 1-click test
  const handleLoadDemoCards = async () => {
    try {
      onShowToast('নমুনা আইডি কার্ড তৈরি হচ্ছে...', '⏳');
      const frontFile = await createDemoIdCardFile('front');
      const backFile = await createDemoIdCardFile('back');

      handleLoadImageFile(frontFile, 'front');
      handleLoadImageFile(backFile, 'back');
      onShowToast('নমুনা কার্ড প্রস্তুত! "AI দিয়ে শনাক্ত ও সাজান" বাটনে ক্লিক করুন।', '✨');
    } catch (e) {
      onShowToast('নমুনা কার্ড তৈরিতে সমস্যা হয়েছে।', '⚠️');
    }
  };

  // Re-render Combined Page Preview whenever cards or settings change
  const renderLivePreview = useCallback(() => {
    if (!previewCanvasRef.current) return;

    // Use processedCanvas or compute fallback on the fly if imgElement is loaded
    const fCanvas =
      frontCard.processedCanvas || (frontCard.imgElement ? processCardSide(frontCard)?.canvas : null);
    const bCanvas =
      backCard.processedCanvas || (backCard.imgElement ? processCardSide(backCard)?.canvas : null);

    const fullCanvas = renderCombinedPageToCanvas(
      fCanvas || null,
      bCanvas || null,
      settings
    );

    const targetCanvas = previewCanvasRef.current;
    targetCanvas.width = fullCanvas.width;
    targetCanvas.height = fullCanvas.height;
    const ctx = targetCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(fullCanvas, 0, 0);
    }

    // Also update hidden printable image for clean window.print()
    if (printImgRef.current) {
      printImgRef.current.src = fullCanvas.toDataURL('image/jpeg', 0.95);
    }
  }, [frontCard, backCard, settings, processCardSide]);

  // Keep live preview synchronized
  useEffect(() => {
    if (currentStage === 3 || frontCard.imgElement || backCard.imgElement) {
      renderLivePreview();
    }
  }, [currentStage, frontCard, backCard, settings, renderLivePreview]);

  // Trigger Full AI Detection & Straightening
  const handleRunAiProcess = async () => {
    if (!frontCard.imgElement && !backCard.imgElement) {
      onShowToast('অনুগ্রহ করে অন্তত সামনের অথবা পেছনের ছবি আপলোড করুন।', '⚠️');
      return;
    }

    setIsAiProcessing(true);
    setCurrentStage(2);
    setProcessingProgress(20);
    setProcessingStatusText('১/৩: আইডি কার্ডের ৪টি কোণা ও বর্ডার স্বয়ংক্রিয়ভাবে শনাক্ত হচ্ছে...');

    setTimeout(() => {
      setProcessingProgress(55);
      setProcessingStatusText('২/৩: কোণ সোজা ও ক্যামেরা পারস্পেক্টিভ কারেকশন করা হচ্ছে...');

      setTimeout(() => {
        // Process Front Card
        if (frontCard.imgElement) {
          const corners = frontCard.corners || detectCardCorners(frontCard.imgElement);
          const res = processCardSide({ ...frontCard, corners });
          setFrontCard((prev) => ({
            ...prev,
            corners,
            processedCanvas: res?.canvas || null,
            processedUrl: res?.url || null,
          }));
          setFrontViewMode('cropped');
        }

        // Process Back Card
        if (backCard.imgElement) {
          const corners = backCard.corners || detectCardCorners(backCard.imgElement);
          const res = processCardSide({ ...backCard, corners });
          setBackCard((prev) => ({
            ...prev,
            corners,
            processedCanvas: res?.canvas || null,
            processedUrl: res?.url || null,
          }));
          setBackViewMode('cropped');
        }

        setProcessingProgress(90);
        setProcessingStatusText('৩/৩: প্রিন্টেবল পেজ লেআউটে কার্ড দুটি সুবিন্যস্ত করা হচ্ছে...');

        setTimeout(() => {
          setIsAiProcessing(false);
          setCurrentStage(3);
          onShowToast('সফলভাবে কার্ড প্রস্তুত হয়েছে! নিচে লাইভ প্রিভিউ দেখুন।', '🎉');

          // Smooth scroll to the live preview workspace
          setTimeout(() => {
            const previewEl = document.getElementById('id-card-preview-workspace');
            if (previewEl) {
              previewEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 150);
        }, 300);
      }, 350);
    }, 400);
  };

  // Card Controls: Rotate 90 degrees
  const handleRotateCard = (side: 'front' | 'back') => {
    const isFront = side === 'front';
    const card = isFront ? frontCard : backCard;
    const updater = isFront ? setFrontCard : setBackCard;

    const newRotation = (card.rotation + 90) % 360;
    const updatedCard = { ...card, rotation: newRotation };
    const res = processCardSide(updatedCard);

    updater((prev) => ({
      ...prev,
      rotation: newRotation,
      processedCanvas: res?.canvas || null,
      processedUrl: res?.url || null,
    }));
    onShowToast(`${isFront ? 'সামনের' : 'পেছনের'} কার্ড ৯০° ঘোরানো হয়েছে`, '🔄');
  };

  // Card Controls: Apply Manual Crop Result
  const handleApplyManualCrop = (corners: CardCorners) => {
    if (!cropModalSide) return;
    const isFront = cropModalSide === 'front';
    const card = isFront ? frontCard : backCard;
    const updater = isFront ? setFrontCard : setBackCard;

    const updatedCard = { ...card, corners };
    const res = processCardSide(updatedCard);

    updater((prev) => ({
      ...prev,
      corners,
      processedCanvas: res?.canvas || null,
      processedUrl: res?.url || null,
    }));

    if (isFront) setFrontViewMode('cropped');
    else setBackViewMode('cropped');

    onShowToast(`${isFront ? 'সামনের' : 'পেছনের'} কার্ডের ক্রপ আপডেট করা হয়েছে!`, '✨');
  };

  // Download High-Res JPG
  const handleDownloadJpg = () => {
    const fCanvas =
      frontCard.processedCanvas || (frontCard.imgElement ? processCardSide(frontCard)?.canvas : null);
    const bCanvas =
      backCard.processedCanvas || (backCard.imgElement ? processCardSide(backCard)?.canvas : null);

    const canvas = renderCombinedPageToCanvas(
      fCanvas || null,
      bCanvas || null,
      settings
    );
    downloadCanvasAsJpg(
      canvas,
      `MoSaFa_ID_Card_${settings.paperSize}_${settings.orientation}.jpg`
    );
    onShowToast('হাই-রেজুলেশন JPG ডাউনলোড সম্পন্ন হয়েছে!', '📥');
  };

  // Download Real Vector PDF
  const handleDownloadPdf = () => {
    const fCanvas =
      frontCard.processedCanvas || (frontCard.imgElement ? processCardSide(frontCard)?.canvas : null);
    const bCanvas =
      backCard.processedCanvas || (backCard.imgElement ? processCardSide(backCard)?.canvas : null);

    exportToPdf(
      fCanvas || null,
      bCanvas || null,
      settings,
      `MoSaFa_ID_Card_${settings.paperSize}_${settings.orientation}.pdf`
    );
    onShowToast('প্রিন্ট-রেডি ভেক্টর PDF ডাউনলোড সম্পন্ন হয়েছে!', '📄');
  };

  // 1-Click CamScanner / Doc Scanner Smart Inset: Shaves off 2.2% from borders to remove background & fingers
  const handleCamScannerInsetSide = (side: 'front' | 'back') => {
    const isFront = side === 'front';
    const card = isFront ? frontCard : backCard;
    const updater = isFront ? setFrontCard : setBackCard;

    if (!card.imgElement) return;

    const currentCorners = card.corners || detectCardCorners(card.imgElement);
    const insettCorners = applyCamScannerSafeInset(currentCorners, 0.025);
    const updatedCard = { ...card, corners: insettCorners };
    const res = processCardSide(updatedCard);

    updater((prev) => ({
      ...prev,
      corners: insettCorners,
      processedCanvas: res?.canvas || null,
      processedUrl: res?.url || null,
    }));

    if (isFront) setFrontViewMode('cropped');
    else setBackViewMode('cropped');

    onShowToast(`${isFront ? 'সামনের' : 'পেছনের'} কার্ড CamScanner স্টাইলে নিখুঁত ক্রপ করা হয়েছে!`, '✨');
  };

  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Clean Direct Print: Opens system printer dialog showing all installed printers
  const handleTriggerPrint = () => {
    const fCanvas =
      frontCard.processedCanvas || (frontCard.imgElement ? processCardSide(frontCard)?.canvas : null);
    const bCanvas =
      backCard.processedCanvas || (backCard.imgElement ? processCardSide(backCard)?.canvas : null);

    onShowToast('প্রিন্টার তালিকা ওপেন হচ্ছে... আপনার প্রিন্টারটি নির্বাচন করুন।', '🖨️');
    triggerDirectPrint(fCanvas || null, bCanvas || null, settings);
    setIsPrintModalOpen(true);
  };

  // Clear all images & reset
  const handleClearAll = () => {
    if (frontCard.rawUrl) URL.revokeObjectURL(frontCard.rawUrl);
    if (backCard.rawUrl) URL.revokeObjectURL(backCard.rawUrl);

    setFrontCard({
      file: null,
      rawUrl: null,
      imgElement: null,
      naturalWidth: 0,
      naturalHeight: 0,
      corners: null,
      processedUrl: null,
      processedCanvas: null,
      rotation: 0,
      flipH: false,
      flipV: false,
      brightness: 0,
      contrast: 0,
      sharpness: true,
      isProcessing: false,
      error: null,
    });

    setBackCard({
      file: null,
      rawUrl: null,
      imgElement: null,
      naturalWidth: 0,
      naturalHeight: 0,
      corners: null,
      processedUrl: null,
      processedCanvas: null,
      rotation: 0,
      flipH: false,
      flipV: false,
      brightness: 0,
      contrast: 0,
      sharpness: true,
      isProcessing: false,
      error: null,
    });

    setSettings(DEFAULT_SETTINGS);
    setCurrentStage(1);
    onShowToast('সকল কার্ড ও ক্যাশ মেমোরি মুছে ফেলা হয়েছে।', '🗑️');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      {/* Hidden Isolated Print Root for window.print() */}
      <div id="id-card-print-root" className="hidden">
        <img
          ref={printImgRef}
          alt="ID Card Printable Page"
          className="w-full h-auto block m-0 p-0"
        />
      </div>

      {/* Manual Corner Adjustment Modal */}
      {cropModalSide && (
        <ManualCropModal
          isOpen={Boolean(cropModalSide)}
          onClose={() => setCropModalSide(null)}
          onApply={handleApplyManualCrop}
          title={cropModalSide === 'front' ? 'সামনের অংশ (Front Side)' : 'পেছনের অংশ (Back Side)'}
          imgElement={cropModalSide === 'front' ? frontCard.imgElement : backCard.imgElement}
          initialCorners={cropModalSide === 'front' ? frontCard.corners : backCard.corners}
        />
      )}

      {/* Hidden Inputs for File Selection & Mobile Camera Capture */}
      <input
        ref={frontFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={(e) => {
          if (e.target.files?.[0]) handleLoadImageFile(e.target.files[0], 'front');
        }}
        className="hidden"
      />
      <input
        ref={frontCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files?.[0]) handleLoadImageFile(e.target.files[0], 'front');
        }}
        className="hidden"
      />
      <input
        ref={backFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={(e) => {
          if (e.target.files?.[0]) handleLoadImageFile(e.target.files[0], 'back');
        }}
        className="hidden"
      />
      <input
        ref={backCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files?.[0]) handleLoadImageFile(e.target.files[0], 'back');
        }}
        className="hidden"
      />

      {/* Hero Sub-Tool Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="হোম পেজে ফিরুন"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-wider bg-teal-50 text-teal-700 border border-teal-200/80 px-2.5 py-0.5 rounded-full">
                  Ultra Digital Studio (আল্ট্রা ডিজিটাল স্টুডিও)
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                  সাব-টুল: আইডি কার্ড জয়নার
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                AI ID Card Joiner — সামনে ও পেছনের ছবি এক পেইজে সাজান
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDemoCards}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              নমুনা কার্ড দিয়ে দেখুন
            </button>
            {(frontCard.rawUrl || backCard.rawUrl) && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                মুছে ফেলুন
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        {/* Step Indicator Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 mb-6 shadow-2xs">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {/* Step 1 */}
            <div
              onClick={() => setCurrentStage(1)}
              className={`flex items-center justify-center gap-2 p-2 rounded-xl transition cursor-pointer ${
                currentStage === 1
                  ? 'bg-cyan-50 border border-cyan-200 text-cyan-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 font-medium'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center ${
                  currentStage === 1 ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                ১
              </span>
              <span className="text-xs sm:text-sm">কার্ড আপলোড</span>
            </div>

            {/* Step 2 */}
            <div
              className={`flex items-center justify-center gap-2 p-2 rounded-xl transition ${
                currentStage === 2
                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold'
                  : 'text-slate-500 font-medium'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center ${
                  currentStage === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                ২
              </span>
              <span className="text-xs sm:text-sm">এআই ডিটেকশন</span>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => {
                if (frontCard.imgElement || backCard.imgElement) {
                  setCurrentStage(3);
                }
              }}
              className={`flex items-center justify-center gap-2 p-2 rounded-xl transition ${
                currentStage === 3
                  ? 'bg-teal-50 border border-teal-200 text-teal-900 font-bold cursor-pointer'
                  : frontCard.imgElement || backCard.imgElement
                  ? 'text-slate-600 hover:bg-slate-50 cursor-pointer'
                  : 'text-slate-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center ${
                  currentStage === 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                ৩
              </span>
              <span className="text-xs sm:text-sm">পেজ লেআউট ও ডাউনলোড</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STAGE 1 & 2: CARD UPLOAD & AI DETECTION TRIGGER
        ========================================================================= */}
        <div className="space-y-6">
          {/* Card Upload Row: Front & Back side upload cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* 1. FRONT SIDE UPLOAD CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition hover:border-cyan-300">
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-teal-50/20 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-800 font-bold text-xs flex items-center justify-center">
                    ১
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                      সামনের অংশ (Front Side)
                    </h3>
                    <p className="text-[11px] text-slate-500">আইডি কার্ডের সামনের পাতার ছবি</p>
                  </div>
                </div>

                {frontCard.rawUrl && (
                  <div className="flex items-center gap-1.5">
                    {/* View mode toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setFrontViewMode((m) => (m === 'cropped' ? 'original' : 'cropped'))
                      }
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3 h-3 text-cyan-600" />
                      <span>{frontViewMode === 'cropped' ? 'ক্রপড কার্ড' : 'মূল ছবি'}</span>
                    </button>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> রেডি
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                {frontCard.rawUrl ? (
                  // Front Card Uploaded Preview
                  <div className="flex-1 flex flex-col">
                    <div className="relative rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center group min-h-[220px]">
                      {/* Active preview image (Cropped card or Raw photo) */}
                      <img
                        src={
                          frontViewMode === 'cropped' && frontCard.processedUrl
                            ? frontCard.processedUrl
                            : frontCard.rawUrl
                        }
                        alt="Front Side Preview"
                        className="max-h-[220px] w-auto object-contain rounded-lg"
                      />

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCamScannerInsetSide('front')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
                          title="CamScanner স্টাইলে ব্যাকগ্রাউন্ড ও আঙুল বাদ দিয়ে নিখুঁত করুন"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          CamScanner ক্রপ
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropModalSide('front')}
                          className="px-3 py-1.5 bg-white/95 text-slate-800 rounded-xl text-xs font-bold hover:bg-white shadow-md flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Crop className="w-3.5 h-3.5 text-cyan-600" />
                          কোণা ঠিক করুন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRotateCard('front')}
                          className="px-3 py-1.5 bg-white/95 text-slate-800 rounded-xl text-xs font-bold hover:bg-white shadow-md flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                          ৯০° ঘোরান
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {frontCard.naturalWidth} × {frontCard.naturalHeight} px{' '}
                        {frontCard.rotation !== 0 && `(${frontCard.rotation}° ঘোরানো)`}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCamScannerInsetSide('front')}
                          className="text-emerald-700 font-bold hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition shadow-2xs"
                          title="CamScanner / Doc Scanner এর মত নিখুঁত ক্রপ"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" /> CamScanner ক্রপ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRotateCard('front')}
                          className="text-slate-700 font-bold hover:text-indigo-600 flex items-center gap-1 cursor-pointer bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          <RotateCw className="w-3 h-3" /> ৯০°
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropModalSide('front')}
                          className="text-cyan-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Crop className="w-3.5 h-3.5" /> ক্রপ
                        </button>
                        <button
                          type="button"
                          onClick={() => frontFileInputRef.current?.click()}
                          className="text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          পরিবর্তন
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Front Card Dropzone
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsFrontDragging(true);
                    }}
                    onDragLeave={() => setIsFrontDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsFrontDragging(false);
                      if (e.dataTransfer.files?.[0]) {
                        handleLoadImageFile(e.dataTransfer.files[0], 'front');
                      }
                    }}
                    className={`flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                      isFrontDragging
                        ? 'border-cyan-500 bg-cyan-50/60 scale-[0.99]'
                        : 'border-slate-300 hover:border-cyan-400 bg-slate-50/60'
                    }`}
                  >
                    <div className="w-13 h-13 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200/80 flex items-center justify-center mb-3 shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-1">
                      সামনের ছবি ড্র্যাগ করে ছাড়ুন বা আপলোড করুন
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      JPG, PNG, WEBP (মোবাইল বা স্ক্যানার)
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => frontFileInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        ফাইল বাছুন
                      </button>
                      <button
                        type="button"
                        onClick={() => frontCameraInputRef.current?.click()}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-cyan-600" />
                        ক্যামেরা তুলুন
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. BACK SIDE UPLOAD CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition hover:border-indigo-300">
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                    ২
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                      পেছনের অংশ (Back Side)
                    </h3>
                    <p className="text-[11px] text-slate-500">আইডি কার্ডের পেছনের পাতার ছবি</p>
                  </div>
                </div>

                {backCard.rawUrl && (
                  <div className="flex items-center gap-1.5">
                    {/* View mode toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setBackViewMode((m) => (m === 'cropped' ? 'original' : 'cropped'))
                      }
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3 h-3 text-indigo-600" />
                      <span>{backViewMode === 'cropped' ? 'ক্রপড কার্ড' : 'মূল ছবি'}</span>
                    </button>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> রেডি
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                {backCard.rawUrl ? (
                  // Back Card Uploaded Preview
                  <div className="flex-1 flex flex-col">
                    <div className="relative rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center group min-h-[220px]">
                      <img
                        src={
                          backViewMode === 'cropped' && backCard.processedUrl
                            ? backCard.processedUrl
                            : backCard.rawUrl
                        }
                        alt="Back Side Preview"
                        className="max-h-[220px] w-auto object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCamScannerInsetSide('back')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
                          title="CamScanner স্টাইলে ব্যাকগ্রাউন্ড ও আঙুল বাদ দিয়ে নিখুঁত করুন"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          CamScanner ক্রপ
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropModalSide('back')}
                          className="px-3 py-1.5 bg-white/95 text-slate-800 rounded-xl text-xs font-bold hover:bg-white shadow-md flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Crop className="w-3.5 h-3.5 text-indigo-600" />
                          কোণা ঠিক করুন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRotateCard('back')}
                          className="px-3 py-1.5 bg-white/95 text-slate-800 rounded-xl text-xs font-bold hover:bg-white shadow-md flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                          ৯০° ঘোরান
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {backCard.naturalWidth} × {backCard.naturalHeight} px{' '}
                        {backCard.rotation !== 0 && `(${backCard.rotation}° ঘোরানো)`}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCamScannerInsetSide('back')}
                          className="text-emerald-700 font-bold hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition shadow-2xs"
                          title="CamScanner / Doc Scanner এর মত নিখুঁত ক্রপ"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> CamScanner ক্রপ
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRotateCard('back')}
                          className="text-slate-700 font-bold hover:text-indigo-600 flex items-center gap-1 cursor-pointer bg-slate-100 px-2 py-0.5 rounded-md"
                        >
                          <RotateCw className="w-3 h-3" /> ৯০°
                        </button>
                        <button
                          type="button"
                          onClick={() => setCropModalSide('back')}
                          className="text-indigo-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Crop className="w-3.5 h-3.5" /> ক্রপ
                        </button>
                        <button
                          type="button"
                          onClick={() => backFileInputRef.current?.click()}
                          className="text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          পরিবর্তন
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Back Card Dropzone
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsBackDragging(true);
                    }}
                    onDragLeave={() => setIsBackDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsBackDragging(false);
                      if (e.dataTransfer.files?.[0]) {
                        handleLoadImageFile(e.dataTransfer.files[0], 'back');
                      }
                    }}
                    className={`flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                      isBackDragging
                        ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60'
                    }`}
                  >
                    <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center mb-3 shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-1">
                      পেছনের ছবি ড্র্যাগ করে ছাড়ুন বা আপলোড করুন
                    </p>
                    <p className="text-xs text-slate-500 mb-4">
                      JPG, PNG, WEBP (মোবাইল বা স্ক্যানার)
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => backFileInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        ফাইল বাছুন
                      </button>
                      <button
                        type="button"
                        onClick={() => backCameraInputRef.current?.click()}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-indigo-600" />
                        ক্যামেরা তুলুন
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Detection & Action Trigger Section */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left max-w-xl">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-cyan-300 border border-white/10 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>স্মার্ট কর্নার ডিটেকশন ও সোজা করার ইঞ্জিন</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                  আইডি কার্ড স্বয়ংক্রিয়ভাবে শনাক্ত ও এক পেইজে সাজান
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  ক্যামেরার বাঁকা কোণ সোজা করে, কার্ডের চারপাশ ক্রপ করে A4/A5 পেজে পাশাপাশি বা উপরে-নিচে
                  সাজিয়ে ডাউনলোড বা প্রিন্ট করুন।
                </p>
              </div>

              <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-2.5">
                <button
                  type="button"
                  disabled={isAiProcessing || (!frontCard.imgElement && !backCard.imgElement)}
                  onClick={handleRunAiProcess}
                  className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer ${
                    isAiProcessing
                      ? 'bg-slate-700 text-slate-300 cursor-wait'
                      : !frontCard.imgElement && !backCard.imgElement
                      ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-slate-600'
                      : 'bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 hover:shadow-cyan-500/30 hover:scale-[1.02]'
                  }`}
                >
                  {isAiProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>প্রসেসিং হচ্ছে ({processingProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>AI দিয়ে কার্ড শনাক্ত ও সাজান</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] text-slate-400 font-medium">
                  {frontCard.imgElement && backCard.imgElement
                    ? '✅ উভয় পাশ প্রস্তুত'
                    : frontCard.imgElement || backCard.imgElement
                    ? '⚠️ যেকোনো এক পাশ আপলোড করা হয়েছে'
                    : 'প্রথমে সামনে ও পেছনের ছবি আপলোড করুন'}
                </span>
              </div>
            </div>

            {/* Processing Progress Bar */}
            {isAiProcessing && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-cyan-300 mb-2 font-medium">
                  <span>{processingStatusText}</span>
                  <span>{processingProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            STAGE 3: PROFESSIONAL PREVIEW WORKSPACE & EXPORT
        ========================================================================= */}
        <div id="id-card-preview-workspace" className="mt-10 pt-8 border-t border-slate-200">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* LEFT COLUMN: LIVE PRINTABLE PAGE PREVIEW */}
            <div className="w-full lg:flex-1">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6">
                {/* Preview Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        লাইভ প্রিন্ট পেজ প্রিভিউ ({settings.paperSize} -{' '}
                        {settings.orientation === 'portrait' ? 'লম্বালম্বি' : 'আড়াআড়ি'})
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        প্রিন্ট ও ডাউনলোডের পর পেজটি ঠিক যেমন দেখাবে
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Zoom controls */}
                    <button
                      type="button"
                      onClick={() => setPreviewZoom((z) => Math.max(50, z - 15))}
                      className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                      title="জুম আউট"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-600 px-1 min-w-[42px] text-center">
                      {previewZoom}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom((z) => Math.min(150, z + 15))}
                      className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                      title="জুম ইন"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom(100)}
                      className="px-2 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 text-[11px] font-semibold text-slate-600 transition cursor-pointer"
                    >
                      ১০০%
                    </button>
                  </div>
                </div>

                {/* Canvas Viewport with Millimeter Ruler Frame */}
                <div className="bg-slate-800/95 rounded-2xl p-4 sm:p-8 flex items-center justify-center overflow-auto min-h-[460px] max-h-[700px] border border-slate-700">
                  <div
                    style={{
                      transform: `scale(${previewZoom / 100})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="shadow-2xl rounded-xs bg-white border border-slate-200 transition-all inline-block"
                  >
                    <canvas
                      ref={previewCanvasRef}
                      className="max-w-[85vw] max-h-[620px] object-contain block mx-auto bg-white"
                    />
                  </div>
                </div>

                {/* Physical Dimension Badge */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Scissors className="w-4 h-4 text-cyan-600" />
                    <span>
                      কার্ড সাইজ:{' '}
                      <strong className="text-slate-800">
                        {Math.round(settings.cardWidthMm * (settings.scalePercent / 100) * 10) / 10} ×{' '}
                        {Math.round(settings.cardHeightMm * (settings.scalePercent / 100) * 10) / 10} mm
                      </strong>{' '}
                      {settings.scalePercent === 100 && '(স্ট্যান্ডার্ড আইডি সাইজ)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, swapSides: !s.swapSides }))}
                      className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      সামনে ও পেছনের স্থান অদলবদল (Swap)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SETTINGS PANEL & EXPORT ACTIONS */}
            <div className="w-full lg:w-[380px] space-y-5">
              {/* 1. EXPORT DOWNLOAD & PRINT BOX */}
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl border-2 border-cyan-500/30 p-5 shadow-lg">
                <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-600" />
                  ডাউনলোড ও প্রিন্ট অপশন
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  সরাসরি দোকানে বা বাসায় প্রিন্ট করার জন্য উপযুক্ত ফাইল
                </p>

                <div className="space-y-2.5">
                  {/* Real Vector PDF */}
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-teal-200" />
                      <span className="text-left leading-tight">
                        পিডিএফ ডাউনলোড (PDF)
                        <span className="block text-[11px] font-normal text-teal-100">
                          আসল {settings.paperSize} স্কেলে ভেক্টর ফাইল
                        </span>
                      </span>
                    </div>
                    <Download className="w-4 h-4 text-teal-200 group-hover:translate-y-0.5 transition-transform" />
                  </button>

                  {/* High-Res JPG */}
                  <button
                    type="button"
                    onClick={handleDownloadJpg}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-5 h-5 text-cyan-400" />
                      <span className="text-left leading-tight">
                        জেপিজি ডাউনলোড (JPG)
                        <span className="block text-[11px] font-normal text-slate-300">
                          ৩০০ DPI হাই-রেজুলেশন ইমেজ
                        </span>
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Direct Clean Print */}
                  <button
                    type="button"
                    onClick={handleTriggerPrint}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-50 via-cyan-50 to-emerald-50 hover:from-indigo-100 hover:to-cyan-100 text-slate-800 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl font-bold text-sm shadow-xs transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Printer className="w-4 h-4" />
                      </div>
                      <span className="text-left leading-tight">
                        সরাসরি প্রিন্ট করুন (Print)
                        <span className="block text-[11px] font-normal text-slate-600">
                          কম্পিউটারের সব ইনস্টল প্রিন্টার থেকে বেছে প্রিন্ট করুন
                        </span>
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* 2. PAGE LAYOUT SETTINGS ACCORDION */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  পেজ ও লেআউট সেটিংস
                </h4>

                {/* Paper Size */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    কাগজের সাইজ (Paper Size):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['A4', 'A5', 'Letter', 'Legal'] as PaperSize[]).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, paperSize: size }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-left ${
                          settings.paperSize === size
                            ? 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {size}
                        <span className="block text-[10px] font-normal text-slate-500">
                          {PAPER_DIMENSIONS_MM[size].width} × {PAPER_DIMENSIONS_MM[size].height} mm
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    পেজ বিন্যাস (Orientation):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, orientation: 'portrait' }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        settings.orientation === 'portrait'
                          ? 'bg-cyan-50 border-cyan-400 text-cyan-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      লম্বালম্বি (Portrait)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, orientation: 'landscape' }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        settings.orientation === 'landscape'
                          ? 'bg-cyan-50 border-cyan-400 text-cyan-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      আড়াআড়ি (Landscape)
                    </button>
                  </div>
                </div>

                {/* Arrangement Layout */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    কার্ডের অবস্থান (Card Layout):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, layout: 'side-by-side' }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        settings.layout === 'side-by-side'
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      পাশাপাশি (Side-by-Side)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, layout: 'stacked' }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                        settings.layout === 'stacked'
                          ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      উপরে-নিচে (Stacked)
                    </button>
                  </div>
                </div>

                {/* Card Scale Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      কার্ড স্কেল / মাপ:
                    </label>
                    <span className="text-xs font-bold text-cyan-700">
                      {settings.scalePercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, scalePercent: 100 }))}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        settings.scalePercent === 100
                          ? 'bg-teal-50 border-teal-400 text-teal-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      ১০০% আসল NID সাইজ
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, scalePercent: 120 }))}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                        settings.scalePercent === 120
                          ? 'bg-teal-50 border-teal-400 text-teal-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      ১২০% বড় সাইজ
                    </button>
                  </div>
                  <input
                    type="range"
                    min="75"
                    max="150"
                    step="5"
                    value={settings.scalePercent}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, scalePercent: Number(e.target.value) }))
                    }
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                {/* Gap between cards */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      কার্ড দুটির মাঝের দূরত্ব (Gap):
                    </label>
                    <span className="text-xs font-bold text-indigo-700">{settings.gapMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="30"
                    step="2"
                    value={settings.gapMm}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, gapMm: Number(e.target.value) }))
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={settings.showCutBorder}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, showCutBorder: e.target.checked }))
                      }
                      className="rounded-md text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>কাটার জন্য হালকা বর্ডার লাইন (Cut Border)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={settings.showCropMarks}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, showCropMarks: e.target.checked }))
                      }
                      className="rounded-md text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>প্রিন্ট কাটিং মার্ক বা ক্রসহেয়ার (Crop Marks)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={settings.showFooterInfo}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, showFooterInfo: e.target.checked }))
                      }
                      className="rounded-md text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>পেজের নিচে স্কেল ও মাপের পরিচিতি নোট</span>
                  </label>
                </div>
              </div>

              {/* Reset to defaults */}
              <button
                type="button"
                onClick={() => setSettings(DEFAULT_SETTINGS)}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                ডিফল্ট সেটিংসে ফিরিয়ে নিন
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PRIVACY GUARANTEE & SECURITY BADGE
        ========================================================================= */}
        <div className="mt-12 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/90 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-2">
              ১০০% ব্যক্তিগত ও নিরাপদ প্রসেসিং গ্যারান্টি
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              আপনার আইডি কার্ডের ছবি সম্পূর্ণ ব্যক্তিগত। সব প্রসেসিং ও ইমেজ স্ট্রেইটেনিং আপনার
              ব্রাউজার ও ডিভাইসেই ক্লায়েন্ট-সাইডে সম্পন্ন হয়। কোনো ছবি বা ব্যক্তিগত তথ্য সার্ভারে
              সংরক্ষণ করা হয় না।
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs whitespace-nowrap"
          >
            সব ছবি মুছে ফেলুন 🗑️
          </button>
        </div>
      </div>

      {/* Direct Printer Modal */}
      <StudioPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        pageImages={previewCanvasRef.current ? [previewCanvasRef.current.toDataURL('image/jpeg', 0.98)] : []}
        paperSize={settings.paperSize}
        orientation={settings.orientation}
        totalPhotos={2}
        onDownloadPdf={handleDownloadPdf}
        onShowToast={onShowToast}
      />
    </div>
  );
};
