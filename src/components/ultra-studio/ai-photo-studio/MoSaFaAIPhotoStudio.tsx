import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Palette,
  SlidersHorizontal,
  IdCard,
  Printer,
  Undo2,
  Redo2,
  RotateCcw,
  Upload,
  Download,
  FileText,
  Search,
  Heart,
  Check,
  Scissors,
  Wand2,
  ScanFace,
  RotateCw,
  FlipHorizontal2,
  Plus,
  Trash2,
  Info,
  Shirt,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { StudioPrintModal } from '../StudioPrintModal';
import { createDemoStudioPhotoFile } from '../clientImageProcessor';
import { BeforeAfterCanvas } from './BeforeAfterCanvas';
import {
  BACKGROUND_CATEGORIES,
  STUDIO_BACKGROUNDS,
  getBackgroundById,
} from './backgroundLibrary';
import {
  STYLE_CATEGORIES,
  STUDIO_STYLE_CATALOG,
  getStyleById,
} from './styleCatalog';
import {
  calculateStudioPrintPages,
  exportStudioPrintPdf,
  getPhotoExportPixels,
  getPhotoTargetDimensionsMm,
  getPrintPaperDimensionsMm,
  renderStudioPhotoToCanvas,
  renderStudioPrintPageToCanvas,
} from './studioCanvasEngine';
import {
  computePassportAutoCrop,
  detectPrimaryFace,
  segmentPortraitMask,
} from './visionEngine';
import {
  AttireOverlayId,
  BackgroundCategoryId,
  DEFAULT_ATTIRE,
  DEFAULT_CROP,
  DEFAULT_CUTOUT,
  DEFAULT_MANUAL_ADJUSTMENTS,
  DEFAULT_PRINT_SHEET_CONFIG,
  PAPER_SIZE_SPECS,
  PASSPORT_PRESET_SPECS,
  PassportPresetId,
  PhotoEditSnapshot,
  PrintPaperSizeId,
  PrintSheetConfig,
  StudioPhotoEntry,
  StudioWorkspaceTab,
  StyleCategoryId,
} from './types';

const FAVORITE_STYLES_STORAGE_KEY = 'mosafa_ai_photo_studio_fav_styles_v1';

interface AttireOption {
  id: AttireOverlayId;
  nameBn: string;
  nameEn: string;
  swatch: string;
}

const ATTIRE_OPTIONS: AttireOption[] = [
  { id: 'none', nameBn: 'পোশাক ওভারলে ছাড়া', nameEn: 'Original Clothing', swatch: '#f1f5f9' },
  { id: 'black-business-suit', nameBn: 'কালো বিজনেস স্যুট', nameEn: 'Black Business Suit', swatch: '#0f172a' },
  { id: 'navy-blazer-red-tie', nameBn: 'নেভি ব্লেজার ও লাল টাই', nameEn: 'Navy Blazer & Red Tie', swatch: '#1e3a8a' },
  { id: 'charcoal-suit-blue-tie', nameBn: 'চারকোল স্যুট ও নীল টাই', nameEn: 'Charcoal Suit & Blue Tie', swatch: '#475569' },
  { id: 'crisp-shirt-tie', nameBn: 'সাদা শার্ট ও টাই', nameEn: 'White Shirt & Tie', swatch: '#e0f2fe' },
  { id: 'white-classic-panjabi', nameBn: 'ক্লাসিক সাদা পাঞ্জাবি', nameEn: 'Classic White Panjabi', swatch: '#ffffff' },
  { id: 'cream-embroidered-panjabi', nameBn: 'নকশী ক্রিম পাঞ্জাবি', nameEn: 'Embroidered Cream Panjabi', swatch: '#fef3c7' },
  { id: 'maroon-festive-panjabi', nameBn: 'রয়্যাল মেরুন পাঞ্জাবি', nameEn: 'Royal Maroon Panjabi', swatch: '#881337' },
  { id: 'graduation-gown', nameBn: 'গ্র্যাজুয়েশন গাউন', nameEn: 'Graduation Gown', swatch: '#1e40af' },
];

export interface MoSaFaAIPhotoStudioProps {
  initialTab?: StudioWorkspaceTab;
  initialPassportPreset?: PassportPresetId;
  onBackToDashboard: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

function createInitialSnapshot(preset: PassportPresetId = 'original-free'): PhotoEditSnapshot {
  return {
    styleId: null,
    backgroundId: 'bg-original',
    customBgUrl: null,
    customBgColor: '#38bdf8',
    adjustments: { ...DEFAULT_MANUAL_ADJUSTMENTS },
    cutout: { ...DEFAULT_CUTOUT },
    attire: { ...DEFAULT_ATTIRE },
    crop: { ...DEFAULT_CROP },
    passportPreset: preset,
    customWidthMm: 45,
    customHeightMm: 55,
    customUnit: 'mm',
    customPxWidth: 600,
    customPxHeight: 600,
  };
}

function cloneSnapshot(snap: PhotoEditSnapshot): PhotoEditSnapshot {
  return {
    ...snap,
    adjustments: { ...snap.adjustments },
    cutout: { ...snap.cutout },
    attire: { ...snap.attire },
    crop: { ...snap.crop },
  };
}

export const MoSaFaAIPhotoStudio: React.FC<MoSaFaAIPhotoStudioProps> = ({
  initialTab = 'backgrounds',
  initialPassportPreset = 'original-free',
  onBackToDashboard,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<StudioWorkspaceTab>(initialTab);
  const [photos, setPhotos] = useState<StudioPhotoEntry[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

  // Preview URLs for active photo
  const [beforePreviewUrl, setBeforePreviewUrl] = useState<string | null>(null);
  const [afterPreviewUrl, setAfterPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingLabel, setProcessingLabel] = useState<string>('');
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(
    initialPassportPreset !== 'original-free'
  );

  // Style Catalog filters & favorites
  const [styleCategory, setStyleCategory] = useState<StyleCategoryId | 'all'>('all');
  const [styleSearch, setStyleSearch] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [applyRecommendedPairings, setApplyRecommendedPairings] = useState<boolean>(false);
  const [favoriteStyleIds, setFavoriteStyleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITE_STYLES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['pp-studio-clean', 'pv-bd-epassport', 'ch-linkedin-office'];
    } catch {
      return ['pp-studio-clean', 'pv-bd-epassport', 'ch-linkedin-office'];
    }
  });

  // Background Library filter (default 'all' with quick Color / Nature / Style groups)
  const [bgQuickGroup, setBgQuickGroup] = useState<'all' | 'colors' | 'nature' | 'studio'>('all');
  const [bgCategory, setBgCategory] = useState<BackgroundCategoryId | 'all'>('all');

  // Single photo export settings
  const [exportFormat, setExportFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [exportQuality, setExportQuality] = useState<number>(95);

  // Print Sheet settings & preview
  const [sheetConfig, setSheetConfig] = useState<PrintSheetConfig>({
    ...DEFAULT_PRINT_SHEET_CONFIG,
  });
  const [activePrintPageIndex, setActivePrintPageIndex] = useState<number>(0);
  const [printPreviewUrls, setPrintPreviewUrls] = useState<string[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printModalImages, setPrintModalImages] = useState<string[]>([]);
  const [isExportingSheet, setIsExportingSheet] = useState<boolean>(false);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);
  const renderJobIdRef = useRef<number>(0);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITE_STYLES_STORAGE_KEY, JSON.stringify(favoriteStyleIds));
    } catch {
      // ignore storage quota errors
    }
  }, [favoriteStyleIds]);

  const activePhoto = useMemo(
    () => photos.find((p) => p.id === activePhotoId) || photos[0] || null,
    [photos, activePhotoId]
  );

  // Keep activePhotoId consistent when photos change
  useEffect(() => {
    if (photos.length > 0 && !photos.some((p) => p.id === activePhotoId)) {
      setActivePhotoId(photos[0].id);
    } else if (photos.length === 0 && activePhotoId !== null) {
      setActivePhotoId(null);
    }
  }, [photos, activePhotoId]);

  // Update edit snapshot helper (supports pushing to undo/redo history or live silent update for drags/sliders)
  const updateActiveEdit = useCallback(
    (updater: (prev: PhotoEditSnapshot) => PhotoEditSnapshot, recordHistory = true) => {
      if (!activePhoto) return;
      const targetId = activePhoto.id;
      setPhotos((prevPhotos) =>
        prevPhotos.map((p) => {
          if (p.id !== targetId) return p;
          const nextEdit = updater(cloneSnapshot(p.edit));
          if (!recordHistory) {
            return { ...p, edit: nextEdit };
          }
          const trimmedHistory = p.history.slice(0, p.historyIndex + 1);
          const nextHistory = [...trimmedHistory, cloneSnapshot(nextEdit)].slice(-25);
          return {
            ...p,
            edit: nextEdit,
            history: nextHistory,
            historyIndex: nextHistory.length - 1,
          };
        })
      );
    },
    [activePhoto]
  );

  // Upload files handler (supports multiple files)
  const handleUploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
      if (files.length === 0) {
        onShowToast('অনুগ্রহ করে JPG, PNG বা WEBP ছবি নির্বাচন করুন।', '⚠️');
        return;
      }

      const loadedEntries: StudioPhotoEntry[] = [];
      for (const file of files) {
        try {
          const url = URL.createObjectURL(file);
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            el.crossOrigin = 'anonymous';
            el.onload = () => resolve(el);
            el.onerror = reject;
            el.src = url;
          });

          const initSnap = createInitialSnapshot(initialPassportPreset);
          loadedEntries.push({
            id: `studio_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            originalUrl: url,
            imgElement: img,
            naturalWidth: img.naturalWidth || img.width,
            naturalHeight: img.naturalHeight || img.height,
            copies: initialPassportPreset !== 'original-free' ? 4 : 1,
            maskData: null,
            edit: initSnap,
            history: [cloneSnapshot(initSnap)],
            historyIndex: 0,
          });
        } catch (err) {
          console.error('Failed to load uploaded image:', err);
        }
      }

      if (loadedEntries.length > 0) {
        setPhotos((prev) => [...prev, ...loadedEntries]);
        setActivePhotoId(loadedEntries[0].id);

        const initialSpec = PASSPORT_PRESET_SPECS.find((p) => p.id === initialPassportPreset);
        if (initialSpec?.isPassportStyle) {
          // Automatically detect face & auto-crop newly uploaded phone/WhatsApp photo to Passport size!
          const firstPhoto = loadedEntries[0];
          setIsProcessing(true);
          setProcessingLabel('মুখমণ্ডল শনাক্ত করে অটো পাসপোর্ট সাইজে ক্রপ করা হচ্ছে...');
          try {
            const mask = await segmentPortraitMask(firstPhoto.imgElement);
            const face = await detectPrimaryFace(firstPhoto.imgElement, mask);
            const autoCrop = computePassportAutoCrop(
              face,
              initialSpec,
              firstPhoto.naturalWidth,
              firstPhoto.naturalHeight
            );
            setPhotos((prev) =>
              prev.map((p) =>
                p.id === firstPhoto.id
                  ? {
                      ...p,
                      maskData: mask,
                      edit: {
                        ...p.edit,
                        crop: autoCrop,
                      },
                    }
                  : p
              )
            );
            setShowFaceGuide(true);
            onShowToast('ছবিটি স্বয়ংক্রিয়ভাবে পাসপোর্ট সাইজে ক্রপ করা হয়েছে!', '🎯');
          } catch {
            onShowToast('ছবিটি সফলভাবে স্টুডিওতে যুক্ত হয়েছে!', '✨');
          } finally {
            setIsProcessing(false);
            setProcessingLabel('');
          }
        } else {
          onShowToast(
            loadedEntries.length === 1
              ? 'ছবিটি সফলভাবে স্টুডিওতে যুক্ত হয়েছে! এখন ব্যাকগ্রাউন্ড, স্টাইল বা পাসপোর্ট সাইজ বেছে নিন।'
              : `${loadedEntries.length}টি ছবি স্টুডিওতে যুক্ত হয়েছে!`,
            '✨'
          );
        }
      }
    },
    [initialPassportPreset, onShowToast]
  );

  const handleLoadDemoPhoto = useCallback(async () => {
    try {
      const demoFile = await createDemoStudioPhotoFile('Studio Portrait');
      await handleUploadFiles([demoFile]);
    } catch {
      onShowToast('নমুনা ছবি তৈরি করতে সমস্যা হয়েছে।', '⚠️');
    }
  }, [handleUploadFiles, onShowToast]);

  // Run free browser-side neural background segmentation on active photo
  const ensureSegmentationForPhoto = useCallback(
    async (photo: StudioPhotoEntry, forceRecompute = false): Promise<StudioPhotoEntry['maskData']> => {
      if (photo.maskData && !forceRecompute) {
        return photo.maskData;
      }
      setIsProcessing(true);
      setProcessingLabel('ফ্রি নিউরাল মডেল দিয়ে সাবজেক্ট আলাদা করা হচ্ছে...');
      try {
        const mask = await segmentPortraitMask(photo.imgElement, (stage) => {
          setProcessingLabel(stage);
        });

        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? {
                  ...p,
                  maskData: mask,
                  edit: {
                    ...p.edit,
                    cutout: {
                      ...p.edit.cutout,
                      enabled: true,
                      method: mask.engine,
                    },
                  },
                }
              : p
          )
        );
        return mask;
      } catch (err) {
        console.error('Segmentation failed:', err);
        onShowToast('ব্যাকগ্রাউন্ড আলাদা করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।', '⚠️');
        return null;
      } finally {
        setIsProcessing(false);
        setProcessingLabel('');
      }
    },
    [onShowToast]
  );

  // Select background item (auto-triggers free neural segmentation if not yet segmented)
  const handleSelectBackground = useCallback(
    async (bgId: string) => {
      if (!activePhoto) return;
      const bg = getBackgroundById(bgId);

      if (bg.mode === 'original') {
        updateActiveEdit((prev) => ({
          ...prev,
          backgroundId: bgId,
          cutout: { ...prev.cutout, enabled: false },
        }));
        return;
      }

      if (bg.mode === 'transparent') {
        setExportFormat('png');
      }

      if (!activePhoto.maskData) {
        const mask = await ensureSegmentationForPhoto(activePhoto);
        if (!mask) return;
      }

      updateActiveEdit((prev) => ({
        ...prev,
        backgroundId: bgId,
        cutout: {
          ...prev.cutout,
          enabled: true,
          method: activePhoto.maskData?.engine || prev.cutout.method || 'mediapipe-wasm',
        },
      }));
    },
    [activePhoto, ensureSegmentationForPhoto, updateActiveEdit]
  );

  // Select custom solid color background
  const handleSelectCustomBgColor = useCallback(
    async (hexColor: string) => {
      if (!activePhoto) return;
      if (!activePhoto.maskData) {
        const mask = await ensureSegmentationForPhoto(activePhoto);
        if (!mask) return;
      }
      updateActiveEdit(
        (prev) => ({
          ...prev,
          backgroundId: 'bg-custom-color',
          customBgColor: hexColor,
          cutout: {
            ...prev.cutout,
            enabled: true,
            method: activePhoto.maskData?.engine || prev.cutout.method || 'mediapipe-wasm',
          },
        }),
        false
      );
    },
    [activePhoto, ensureSegmentationForPhoto, updateActiveEdit]
  );

  // Upload custom background image
  const handleCustomBgUpload = async (file: File) => {
    if (!activePhoto) return;
    const url = URL.createObjectURL(file);
    if (!activePhoto.maskData) {
      const mask = await ensureSegmentationForPhoto(activePhoto);
      if (!mask) return;
    }
    updateActiveEdit((prev) => ({
      ...prev,
      backgroundId: 'bg-custom',
      customBgUrl: url,
      cutout: { ...prev.cutout, enabled: true },
    }));
    onShowToast('কাস্টম ব্যাকগ্রাউন্ড যুক্ত হয়েছে!', '🖼️');
  };

  // Apply style preset (NEVER forces cartoon attire overlay; preserves user's chosen background by default)
  const handleSelectStyle = useCallback(
    async (styleId: string | null) => {
      if (!activePhoto) return;

      if (!styleId) {
        updateActiveEdit((prev) => ({ ...prev, styleId: null }));
        return;
      }

      const style = getStyleById(styleId);
      if (!style) return;

      let shouldEnableCutout = activePhoto.edit.cutout.enabled;
      let nextBgId = activePhoto.edit.backgroundId;

      if (applyRecommendedPairings && style.recommendedBgId) {
        nextBgId = style.recommendedBgId;
        if (!activePhoto.maskData) {
          const mask = await ensureSegmentationForPhoto(activePhoto);
          shouldEnableCutout = !!mask;
        } else {
          shouldEnableCutout = true;
        }
      }

      updateActiveEdit((prev) => ({
        ...prev,
        styleId: style.id,
        backgroundId: nextBgId,
        cutout: {
          ...prev.cutout,
          enabled: shouldEnableCutout,
        },
      }));
    },
    [activePhoto, applyRecommendedPairings, ensureSegmentationForPhoto, updateActiveEdit]
  );

  // Auto-center & auto-crop face for Passport/Visa using free MediaPipe FaceDetector + head-top mask
  const handleAutoCenterFace = useCallback(
    async (overridePresetId?: PassportPresetId) => {
      if (!activePhoto) return;
      const targetPresetId = overridePresetId || activePhoto.edit.passportPreset;
      const presetSpec =
        PASSPORT_PRESET_SPECS.find((p) => p.id === targetPresetId) ||
        PASSPORT_PRESET_SPECS[1];

      setIsProcessing(true);
      setProcessingLabel('মুখমণ্ডল শনাক্ত করে অটো পাসপোর্ট সাইজে ক্রপ করা হচ্ছে...');
      try {
        let mask = activePhoto.maskData;
        if (!mask) {
          try {
            mask = await segmentPortraitMask(activePhoto.imgElement);
            setPhotos((prev) =>
              prev.map((p) => (p.id === activePhoto.id ? { ...p, maskData: mask } : p))
            );
          } catch {
            mask = null;
          }
        }
        const face = await detectPrimaryFace(activePhoto.imgElement, mask);
        const crop = computePassportAutoCrop(
          face,
          presetSpec,
          activePhoto.naturalWidth,
          activePhoto.naturalHeight
        );
        updateActiveEdit((prev) => ({
          ...prev,
          passportPreset: targetPresetId,
          crop,
        }));
        setShowFaceGuide(!!presetSpec.isPassportStyle);
        onShowToast(
          face.engine === 'mediapipe-wasm' || face.engine === 'mask-silhouette'
            ? 'স্বয়ংক্রিয়ভাবে পাসপোর্ট সাইজে ক্রপ করা হয়েছে! এখন পছন্দমতো ব্যাকগ্রাউন্ড ও স্টাইল বদলাতে পারবেন।'
            : 'স্ট্যান্ডার্ড পোর্ট্রেট ফ্রেমিং প্রয়োগ করা হয়েছে।',
          '🎯'
        );
      } finally {
        setIsProcessing(false);
        setProcessingLabel('');
      }
    },
    [activePhoto, onShowToast, updateActiveEdit]
  );

  // Select Passport / ID size preset — AUTOMATICALLY crops any WhatsApp/phone photo to Passport size!
  const handleSelectPassportPreset = useCallback(
    async (presetId: PassportPresetId) => {
      if (!activePhoto) return;
      const spec = PASSPORT_PRESET_SPECS.find((p) => p.id === presetId);
      const isPassport = !!spec?.isPassportStyle;
      setShowFaceGuide(isPassport);

      // Update preset & helpful default copy count immediately
      if (isPassport && activePhoto.copies === 1) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === activePhoto.id ? { ...p, copies: 4 } : p))
        );
      }

      if (!isPassport || presetId === 'original-free') {
        updateActiveEdit((prev) => ({
          ...prev,
          passportPreset: presetId,
          crop: { ...DEFAULT_CROP },
        }));
        return;
      }

      // Immediately switch frame aspect, then run automatic face detection & passport crop
      updateActiveEdit(
        (prev) => ({
          ...prev,
          passportPreset: presetId,
        }),
        false
      );

      await handleAutoCenterFace(presetId);
    },
    [activePhoto, handleAutoCenterFace, updateActiveEdit]
  );

  // Undo / Redo / Reset
  const canUndo = !!activePhoto && activePhoto.historyIndex > 0;
  const canRedo = !!activePhoto && activePhoto.historyIndex < activePhoto.history.length - 1;

  const handleUndo = () => {
    if (!activePhoto || !canUndo) return;
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== activePhoto.id) return p;
        const nextIdx = p.historyIndex - 1;
        return {
          ...p,
          historyIndex: nextIdx,
          edit: cloneSnapshot(p.history[nextIdx]),
        };
      })
    );
  };

  const handleRedo = () => {
    if (!activePhoto || !canRedo) return;
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== activePhoto.id) return p;
        const nextIdx = p.historyIndex + 1;
        return {
          ...p,
          historyIndex: nextIdx,
          edit: cloneSnapshot(p.history[nextIdx]),
        };
      })
    );
  };

  const handleResetPhoto = () => {
    if (!activePhoto) return;
    updateActiveEdit(() => createInitialSnapshot('original-free'));
    setShowFaceGuide(false);
    onShowToast('সব এডিট রিসেট করে মূল ছবিতে ফিরিয়ে আনা হয়েছে।', '↺');
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleChangeCopies = (id: string, delta: number) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, copies: Math.max(1, Math.min(60, p.copies + delta)) } : p
      )
    );
  };

  // Live render of active photo (Before + After preview at 720px max for smooth 60fps interaction)
  useEffect(() => {
    if (!activePhoto) {
      setBeforePreviewUrl(null);
      setAfterPreviewUrl(null);
      return;
    }

    const currentJob = ++renderJobIdRef.current;
    const timer = window.setTimeout(async () => {
      try {
        const [beforeCanvas, afterCanvas] = await Promise.all([
          renderStudioPhotoToCanvas(activePhoto, { maxDimension: 720, showOriginalOnly: true }),
          renderStudioPhotoToCanvas(activePhoto, { maxDimension: 720 }),
        ]);

        if (currentJob !== renderJobIdRef.current) return;

        const bg = getBackgroundById(activePhoto.edit.backgroundId);
        const isTransparent = activePhoto.edit.cutout.enabled && bg.mode === 'transparent';

        setBeforePreviewUrl(beforeCanvas.toDataURL('image/jpeg', 0.9));
        setAfterPreviewUrl(
          afterCanvas.toDataURL(isTransparent ? 'image/png' : 'image/jpeg', 0.92)
        );
      } catch (err) {
        console.error('Preview render failed:', err);
      }
    }, 35);

    return () => window.clearTimeout(timer);
  }, [activePhoto]);

  // Multi-page print layout calculation
  const printPages = useMemo(
    () => calculateStudioPrintPages(photos, sheetConfig),
    [photos, sheetConfig]
  );

  const totalPrintCopies = useMemo(
    () => photos.reduce((acc, p) => acc + p.copies, 0),
    [photos]
  );

  const safePrintPageIndex = Math.min(activePrintPageIndex, Math.max(0, printPages.length - 1));
  const activePrintPage = printPages[safePrintPageIndex] || printPages[0];
  const activeSheetPhotoCount = activePrintPage?.slots.length ?? 0;

  // Live Print Sheet Preview (only rendered when user is on the Print Sheet tab)
  useEffect(() => {
    if (activeTab !== 'print' || photos.length === 0) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const renderedMap = new Map<string, HTMLCanvasElement>();
      for (const p of photos) {
        const c = await renderStudioPhotoToCanvas(p, { maxDimension: 520 });
        renderedMap.set(p.id, c);
      }
      if (cancelled) return;

      const urls = printPages.map((page) => {
        const pageCanvas = renderStudioPrintPageToCanvas(page, renderedMap, sheetConfig, 140);
        return pageCanvas.toDataURL('image/jpeg', 0.9);
      });
      setPrintPreviewUrls(urls);
      setActivePrintPageIndex((idx) => Math.min(idx, Math.max(0, urls.length - 1)));
    }, 25);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeTab, photos, printPages, sheetConfig]);

  // Export Single Photo (Full 300 DPI / Exact Pixel Size)
  const handleDownloadSinglePhoto = async () => {
    if (!activePhoto) return;
    setIsProcessing(true);
    setProcessingLabel('হাই-রেজ্যুলেশন ছবি প্রস্তুত হচ্ছে...');
    try {
      const fullCanvas = await renderStudioPhotoToCanvas(activePhoto);
      const bg = getBackgroundById(activePhoto.edit.backgroundId);
      const forcePng = activePhoto.edit.cutout.enabled && bg.mode === 'transparent';
      const fmt = forcePng ? 'png' : exportFormat;
      const mime = fmt === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = fullCanvas.toDataURL(mime, exportQuality / 100);

      const baseName = activePhoto.fileName.replace(/\.[^/.]+$/, '');
      const presetTag = activePhoto.edit.passportPreset;
      const link = document.createElement('a');
      link.download = `MoSaFa_Studio_${baseName}_${presetTag}.${fmt === 'png' ? 'png' : 'jpg'}`;
      link.href = dataUrl;
      link.click();
      onShowToast(`হাই-কোয়ালিটি ${fmt.toUpperCase()} ছবি ডাউনলোড হয়েছে!`, '⬇️');
    } catch (err) {
      console.error('Export failed:', err);
      onShowToast('ছবি ডাউনলোড করতে সমস্যা হয়েছে।', '⚠️');
    } finally {
      setIsProcessing(false);
      setProcessingLabel('');
    }
  };

  // Render all photos at full 300 DPI for print / PDF / JPG sheet export
  const buildFullResPhotoMap = async (): Promise<Map<string, HTMLCanvasElement>> => {
    const map = new Map<string, HTMLCanvasElement>();
    for (const p of photos) {
      const c = await renderStudioPhotoToCanvas(p);
      map.set(p.id, c);
    }
    return map;
  };

  const handleOpenPrintModal = async () => {
    if (photos.length === 0) return;
    setIsExportingSheet(true);
    try {
      const renderedMap = await buildFullResPhotoMap();
      const pageDataUrls = printPages.map((page) => {
        const c = renderStudioPrintPageToCanvas(page, renderedMap, sheetConfig, 300);
        return c.toDataURL('image/jpeg', 0.96);
      });
      setPrintModalImages(pageDataUrls);
      setIsPrintModalOpen(true);
    } catch {
      onShowToast('প্রিন্ট শিট তৈরি করতে সমস্যা হয়েছে।', '⚠️');
    } finally {
      setIsExportingSheet(false);
    }
  };

  const handleDownloadPrintPdf = async () => {
    if (photos.length === 0) return;
    setIsExportingSheet(true);
    try {
      const renderedMap = await buildFullResPhotoMap();
      exportStudioPrintPdf(
        printPages,
        renderedMap,
        sheetConfig,
        `MoSaFa_AI_Studio_${sheetConfig.paperSize}_${totalPrintCopies}copies.pdf`
      );
      onShowToast('১০০% আসল স্কেলের প্রিন্ট-রেডি PDF ডাউনলোড হয়েছে!', '📄');
    } catch {
      onShowToast('PDF তৈরি করতে সমস্যা হয়েছে।', '⚠️');
    } finally {
      setIsExportingSheet(false);
    }
  };

  const handleDownloadPrintJpg = async () => {
    if (photos.length === 0) return;
    setIsExportingSheet(true);
    try {
      const renderedMap = await buildFullResPhotoMap();
      printPages.forEach((page, i) => {
        const c = renderStudioPrintPageToCanvas(page, renderedMap, sheetConfig, 300);
        const link = document.createElement('a');
        link.download = `MoSaFa_PrintSheet_${sheetConfig.paperSize}_Page${i + 1}_300DPI.jpg`;
        link.href = c.toDataURL('image/jpeg', 0.96);
        link.click();
      });
      onShowToast('৩০০ DPI প্রিন্ট শিট JPG ডাউনলোড হয়েছে!', '🖼️');
    } catch {
      onShowToast('JPG শিট ডাউনলোড করতে সমস্যা হয়েছে।', '⚠️');
    } finally {
      setIsExportingSheet(false);
    }
  };

  // Filtered Styles List (216+ styles)
  const filteredStyles = useMemo(() => {
    const q = styleSearch.trim().toLowerCase();
    return STUDIO_STYLE_CATALOG.filter((style) => {
      if (showFavoritesOnly && !favoriteStyleIds.includes(style.id)) return false;
      if (styleCategory !== 'all' && style.categoryId !== styleCategory) return false;
      if (!q) return true;
      return (
        style.nameEn.toLowerCase().includes(q) ||
        style.nameBn.toLowerCase().includes(q) ||
        style.descriptionBn.toLowerCase().includes(q) ||
        style.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [styleCategory, styleSearch, showFavoritesOnly, favoriteStyleIds]);

  // Filtered Backgrounds List (Quick Groups: Colors, Nature, Studio/Styles + 15 Categories)
  const filteredBackgrounds = useMemo(() => {
    const colorCats: BackgroundCategoryId[] = ['pure-white', 'light-blue', 'sky-blue', 'red', 'gray'];
    const natureCats: BackgroundCategoryId[] = ['nature', 'outdoor'];
    const studioCats: BackgroundCategoryId[] = [
      'gradient',
      'office',
      'corporate-studio',
      'photography-studio',
      'wedding',
      'islamic-architecture',
      'indoor-studio',
    ];

    if (bgCategory !== 'all') {
      return STUDIO_BACKGROUNDS.filter(
        (b) => b.categoryId === bgCategory || b.mode === 'original' || b.mode === 'transparent'
      );
    }

    if (bgQuickGroup === 'colors') {
      return STUDIO_BACKGROUNDS.filter(
        (b) => b.mode === 'original' || b.mode === 'transparent' || b.mode === 'solid' || colorCats.includes(b.categoryId)
      );
    }
    if (bgQuickGroup === 'nature') {
      return STUDIO_BACKGROUNDS.filter(
        (b) => b.mode === 'original' || natureCats.includes(b.categoryId)
      );
    }
    if (bgQuickGroup === 'studio') {
      return STUDIO_BACKGROUNDS.filter(
        (b) => b.mode === 'original' || studioCats.includes(b.categoryId)
      );
    }
    return STUDIO_BACKGROUNDS;
  }, [bgCategory, bgQuickGroup]);

  const toggleFavoriteStyle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteStyleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Active photo metadata for stage & right inspector
  const activeDims = useMemo(() => {
    if (!activePhoto) {
      return { widthMm: 45, heightMm: 55, widthPx: 531, heightPx: 650, aspect: 45 / 55 };
    }
    const mm = getPhotoTargetDimensionsMm(
      activePhoto.edit,
      activePhoto.naturalWidth,
      activePhoto.naturalHeight
    );
    const px = getPhotoExportPixels(
      activePhoto.edit,
      activePhoto.naturalWidth,
      activePhoto.naturalHeight,
      300
    );
    return {
      widthMm: mm.widthMm,
      heightMm: mm.heightMm,
      widthPx: px.widthPx,
      heightPx: px.heightPx,
      aspect: px.widthPx / Math.max(1, px.heightPx),
    };
  }, [activePhoto]);

  const activeStyleMeta = activePhoto?.edit.styleId
    ? getStyleById(activePhoto.edit.styleId)
    : undefined;
  const activeBgMeta = activePhoto
    ? activePhoto.edit.backgroundId === 'bg-custom'
      ? { nameBn: 'কাস্টম ছবি ব্যাকগ্রাউন্ড', mode: 'image' as const }
      : activePhoto.edit.backgroundId === 'bg-custom-color'
      ? { nameBn: `কাস্টম কালার (${activePhoto.edit.customBgColor})`, mode: 'solid' as const }
      : getBackgroundById(activePhoto.edit.backgroundId)
    : null;
  const activePresetMeta = activePhoto
    ? PASSPORT_PRESET_SPECS.find((p) => p.id === activePhoto.edit.passportPreset)
    : null;
  const printPaperDims = getPrintPaperDimensionsMm(sheetConfig);

  // Ordered per workflow: 1. Background -> 2. Style -> 3. Passport & Size -> 4. Enhance -> 5. Print Sheet
  const tabs: Array<{ id: StudioWorkspaceTab; labelBn: string; count?: string; icon: React.ReactNode }> = [
    {
      id: 'backgrounds',
      labelBn: 'ব্যাকগ্রাউন্ড',
      count: '১৫ ক্যাটাগরি',
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: 'styles',
      labelBn: 'স্টাইল',
      count: `${STUDIO_STYLE_CATALOG.length}`,
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'passport',
      labelBn: 'পাসপোর্ট ও মাপ',
      icon: <IdCard className="w-4 h-4" />,
    },
    {
      id: 'enhance',
      labelBn: 'এনহ্যান্স',
      icon: <SlidersHorizontal className="w-4 h-4" />,
    },
    {
      id: 'print',
      labelBn: 'প্রিন্ট শিট',
      icon: <Printer className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Hidden file inputs */}
      <input
        ref={addFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUploadFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
      <input
        ref={customBgInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            handleCustomBgUpload(f);
            e.target.value = '';
          }
        }}
      />

      {/* Top Studio Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-[1680px] mx-auto px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">স্টুডিও ড্যাশবোর্ড</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  MoSaFa AI Photo Studio – All-in-One
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  ১০০% ফ্রি · ব্রাউজার ইঞ্জিন
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                {STUDIO_STYLE_CATALOG.length}+ স্টাইল · ১৫ ক্যাটাগরি ব্যাকগ্রাউন্ড · পাসপোর্ট ও 4R/5R/A4 প্রিন্ট শিট
              </p>
            </div>
          </div>

          {/* Right Global Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {activePhoto && (
              <>
                <div className="inline-flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/80">
                  <button
                    type="button"
                    disabled={!canUndo}
                    onClick={handleUndo}
                    title="আনডু (Undo)"
                    className="p-1.5 rounded-lg text-slate-700 hover:bg-white disabled:opacity-35 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!canRedo}
                    onClick={handleRedo}
                    title="রিডু (Redo)"
                    className="p-1.5 rounded-lg text-slate-700 hover:bg-white disabled:opacity-35 transition cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Redo2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    title="রিসেট (মূল ছবি)"
                    className="p-1.5 rounded-lg text-slate-700 hover:bg-white hover:text-rose-600 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => addFileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">ছবি যোগ</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSinglePhoto}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPrintModal}
                  disabled={isExportingSheet}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold hidden md:flex items-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  {isExportingSheet ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Printer className="w-3.5 h-3.5" />
                  )}
                  <span>প্রিন্ট ও PDF</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Multi-Photo Queue Strip (Visible whenever 1+ photos uploaded) */}
        {photos.length > 0 && (
          <div className="bg-slate-50/90 border-t border-slate-200/70 px-3 sm:px-5 py-2">
            <div className="max-w-[1680px] mx-auto flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">
                ছবির তালিকা ({photos.length}):
              </span>
              {photos.map((p, idx) => {
                const isSelected = p.id === activePhoto?.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setActivePhotoId(p.id)}
                    className={`flex items-center gap-2 px-2 py-1 rounded-xl border transition shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-indigo-500 shadow-2xs ring-1 ring-indigo-500/20'
                        : 'bg-white/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={p.originalUrl}
                      alt={p.fileName}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="text-[11px] leading-tight">
                      <p className="font-bold text-slate-800 max-w-[90px] truncate">
                        ছবি {idx + 1}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeCopies(p.id, -1);
                          }}
                          className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-bold text-indigo-700 tabular-nums px-0.5">
                          {p.copies} কপি
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChangeCopies(p.id, 1);
                          }}
                          className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(p.id);
                      }}
                      title="ছবি মুছুন"
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => addFileInputRef.current?.click()}
                className="px-2.5 py-2 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-white text-slate-600 hover:text-indigo-700 text-[11px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>আরও ছবি</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main 3-Pane Studio Workspace */}
      <div className="flex-1 max-w-[1680px] w-full mx-auto flex flex-col lg:flex-row">
        {/* LEFT PANE: Tool Navigation & Browsers */}
        <aside className="w-full lg:w-[370px] xl:w-[400px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200/90 flex flex-col shrink-0 lg:max-h-[calc(100vh-108px)] lg:sticky lg:top-[108px]">
          {/* 5 Workspace Tabs */}
          <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50/70 p-1 gap-1">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold transition cursor-pointer ${
                    active
                      ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {t.icon}
                  <span className="leading-tight text-center">{t.labelBn}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4">
            {/* ============================================================== */}
            {/* TAB 1: 216+ STYLE CATALOG                                      */}
            {/* ============================================================== */}
            {activeTab === 'styles' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">
                      ফটো স্টাইল লাইব্রেরি ({STUDIO_STYLE_CATALOG.length}+ প্রিসেট)
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      রঙ, আলো, স্কিন টোন ও ব্যাকড্রপ প্রিসেট — ১ ক্লিকে ব্রাউজারে রেন্ডার
                    </p>
                  </div>
                  {activePhoto?.edit.styleId && (
                    <button
                      type="button"
                      onClick={() => handleSelectStyle(null)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      মুছুন
                    </button>
                  )}
                </div>

                {/* Search + Favorites Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={styleSearch}
                      onChange={(e) => setStyleSearch(e.target.value)}
                      placeholder="স্টাইল খুঁজুন (যেমন: Passport, Suit, Eid, Wedding...)"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFavoritesOnly((v) => !v)}
                    className={`px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0 ${
                      showFavoritesOnly
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title="শুধু ফেভারিট স্টাইল দেখুন"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                    <span className="tabular-nums">{favoriteStyleIds.length}</span>
                  </button>
                </div>

                {/* Category Selector Dropdown + Quick Chips */}
                <div className="space-y-2">
                  <select
                    value={styleCategory}
                    onChange={(e) => setStyleCategory(e.target.value as StyleCategoryId | 'all')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="all">
                      সব ১৬টি ক্যাটাগরি ({STUDIO_STYLE_CATALOG.length}টি স্টাইল)
                    </option>
                    {STYLE_CATEGORIES.map((cat) => {
                      const count = STUDIO_STYLE_CATALOG.filter((s) => s.categoryId === cat.id).length;
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameBn} — {cat.nameEn} ({count})
                        </option>
                      );
                    })}
                  </select>

                  <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={applyRecommendedPairings}
                      onChange={(e) => setApplyRecommendedPairings(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>স্টাইলের সাথে প্রস্তাবিত ব্যাকগ্রাউন্ডও স্বয়ংক্রিয়ভাবে পরিবর্তন হোক</span>
                  </label>
                </div>

                {/* Styles Grid */}
                {filteredStyles.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    এই ফিল্টারে কোনো স্টাইল পাওয়া যায়নি। সার্চ বা ক্যাটাগরি পরিবর্তন করুন।
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredStyles.map((style) => {
                      const isSelected = activePhoto?.edit.styleId === style.id;
                      const isFav = favoriteStyleIds.includes(style.id);
                      return (
                        <div
                          key={style.id}
                          onClick={() => handleSelectStyle(style.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') handleSelectStyle(style.id);
                          }}
                          className={`group rounded-2xl border overflow-hidden transition text-left cursor-pointer bg-white ${
                            isSelected
                              ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
                              : 'border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {/* Visual Preview Swatch */}
                          <div
                            style={{ background: style.swatchGradient }}
                            className="h-16 relative p-2 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between">
                              {isSelected ? (
                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                                  <Check className="w-3 h-3" />
                                </span>
                              ) : (
                                <span />
                              )}
                              <button
                                type="button"
                                onClick={(e) => toggleFavoriteStyle(style.id, e)}
                                className="w-6 h-6 rounded-full bg-white/85 hover:bg-white flex items-center justify-center shadow-2xs cursor-pointer"
                                title="ফেভারিট"
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Style Name & Short Description */}
                          <div className="p-2">
                            <p className="text-[11px] font-extrabold text-slate-900 leading-snug line-clamp-1">
                              {style.nameBn}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 truncate">
                              {style.nameEn}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                              {style.descriptionBn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: FREE BACKGROUND REMOVAL & 15-CATEGORY LIBRARY           */}
            {/* ============================================================== */}
            {activeTab === 'backgrounds' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    ফ্রি ব্যাকগ্রাউন্ড রিমুভ ও ১৫ ক্যাটাগরি লাইব্রেরি
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    MediaPipe WASM নিউরাল সেগমেন্টেশন (সম্পূর্ণ ফ্রি) + অফলাইন ব্যাকআপ
                  </p>
                </div>

                {/* 1-Click Background Removal Button */}
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5">
                  <button
                    type="button"
                    disabled={!activePhoto || isProcessing}
                    onClick={async () => {
                      if (!activePhoto) return;
                      const mask = await ensureSegmentationForPhoto(activePhoto, true);
                      if (mask) {
                        if (activePhoto.edit.backgroundId === 'bg-original') {
                          updateActiveEdit((prev) => ({
                            ...prev,
                            backgroundId: 'bg-pure-white',
                            cutout: { ...prev.cutout, enabled: true, method: mask.engine },
                          }));
                        }
                        onShowToast(
                          mask.engine === 'mediapipe-wasm'
                            ? 'ফ্রি নিউরাল মডেলের মাধ্যমে ব্যাকগ্রাউন্ড আলাদা হয়েছে!'
                            : 'অফলাইন কাটআউট ইঞ্জিনে ব্যাকগ্রাউন্ড আলাদা হয়েছে!',
                          '✂️'
                        );
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>
                      {activePhoto?.maskData
                        ? 'পুনরায় ব্যাকগ্রাউন্ড আলাদা করুন'
                        : '১-ক্লিকে ব্যাকগ্রাউন্ড রিমুভ করুন (ফ্রি)'}
                    </span>
                  </button>

                  {/* Edge Refinement Sliders (when cutout active) */}
                  {activePhoto?.edit.cutout.enabled && (
                    <div className="space-y-2 pt-2 border-t border-indigo-200/60">
                      <SliderControl
                        label="এজ থ্রেশহোল্ড (Cutout Sensitivity)"
                        value={Math.round(activePhoto.edit.cutout.threshold * 100)}
                        min={20}
                        max={85}
                        unit="%"
                        onChange={(v) =>
                          updateActiveEdit(
                            (prev) => ({ ...prev, cutout: { ...prev.cutout, threshold: v / 100 } }),
                            false
                          )
                        }
                      />
                      <SliderControl
                        label="চুলের ধার স্মুথ (Edge Feather)"
                        value={activePhoto.edit.cutout.feather}
                        min={0}
                        max={10}
                        unit="px"
                        onChange={(v) =>
                          updateActiveEdit(
                            (prev) => ({ ...prev, cutout: { ...prev.cutout, feather: v } }),
                            false
                          )
                        }
                      />
                      <SliderControl
                        label="রঙের বর্ডার কমান (Defringe)"
                        value={activePhoto.edit.cutout.defringe}
                        min={0}
                        max={100}
                        unit="%"
                        onChange={(v) =>
                          updateActiveEdit(
                            (prev) => ({ ...prev, cutout: { ...prev.cutout, defringe: v } }),
                            false
                          )
                        }
                      />
                      <SliderControl
                        label="ব্যাকগ্রাউন্ড ব্লার (DSLR Bokeh)"
                        value={activePhoto.edit.cutout.bgBlur}
                        min={0}
                        max={14}
                        unit="px"
                        onChange={(v) =>
                          updateActiveEdit(
                            (prev) => ({ ...prev, cutout: { ...prev.cutout, bgBlur: v } }),
                            false
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Custom Color Picker + Custom Background Upload */}
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      activePhoto?.edit.backgroundId === 'bg-custom-color'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'
                    } ${!activePhoto ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <input
                      type="color"
                      disabled={!activePhoto}
                      value={activePhoto?.edit.customBgColor || '#38bdf8'}
                      onChange={(e) => handleSelectCustomBgColor(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                    />
                    <span className="truncate">কাস্টম কালার</span>
                  </label>

                  <button
                    type="button"
                    disabled={!activePhoto}
                    onClick={() => customBgInputRef.current?.click()}
                    className="py-2 px-2.5 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">নিজের ছবি</span>
                  </button>
                </div>

                {/* Quick Group Tabs: All / Colors / Nature / Studio Styles */}
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  {(
                    [
                      { id: 'all', label: 'সব' },
                      { id: 'colors', label: 'বিভিন্ন কালার' },
                      { id: 'nature', label: 'প্রকৃতি' },
                      { id: 'studio', label: 'স্টুডিও স্টাইল' },
                    ] as const
                  ).map((grp) => {
                    const active = bgCategory === 'all' && bgQuickGroup === grp.id;
                    return (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => {
                          setBgQuickGroup(grp.id);
                          setBgCategory('all');
                        }}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                          active
                            ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-200/70'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {grp.label}
                      </button>
                    );
                  })}
                </div>

                {/* 15 Category Filter Dropdown */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    নির্দিষ্ট ক্যাটাগরি বাছুন (১৫টি বিভাগ):
                  </label>
                  <select
                    value={bgCategory}
                    onChange={(e) => {
                      const val = e.target.value as BackgroundCategoryId | 'all';
                      setBgCategory(val);
                      if (val !== 'all') setBgQuickGroup('all');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="all">সব ব্যাকগ্রাউন্ড ({STUDIO_BACKGROUNDS.length}টি)</option>
                    {BACKGROUND_CATEGORIES.filter((c) => c.id !== 'custom').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameBn} — {cat.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Background Swatches Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredBackgrounds.map((bg) => {
                    const isSelected = activePhoto?.edit.backgroundId === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        disabled={!activePhoto}
                        onClick={() => handleSelectBackground(bg.id)}
                        className={`rounded-2xl border overflow-hidden text-left transition cursor-pointer bg-white disabled:opacity-50 ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div
                          style={{ background: bg.previewCss }}
                          className="h-16 w-full border-b border-slate-200/70 relative"
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-[11px] font-extrabold text-slate-900 truncate">
                            {bg.nameBn}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{bg.nameEn}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: LOCAL ENHANCEMENT, RESTORATION & FREE ATTIRE OVERLAYS   */}
            {/* ============================================================== */}
            {activeTab === 'enhance' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    পোর্ট্রেট এনহ্যান্স ও আলোর সমন্বয়
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    ১০০% লোকাল ব্রাউজার প্রসেসিং — তাৎক্ষণিক প্রিভিউ ও শূন্য API খরচ
                  </p>
                </div>

                {/* One-Click Auto Fixes */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!activePhoto}
                    onClick={() =>
                      updateActiveEdit((prev) => ({
                        ...prev,
                        adjustments: {
                          ...prev.adjustments,
                          autoLighting: !prev.adjustments.autoLighting,
                        },
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer disabled:opacity-50 ${
                      activePhoto?.edit.adjustments.autoLighting
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Wand2 className="w-4 h-4 text-indigo-600" />
                      {activePhoto?.edit.adjustments.autoLighting && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs font-extrabold mt-1.5">অটো লাইটিং ফিক্স</p>
                    <p className="text-[10px] text-slate-500">অন্ধকার ও ছায়া ব্যালেন্স</p>
                  </button>

                  <button
                    type="button"
                    disabled={!activePhoto}
                    onClick={() =>
                      updateActiveEdit((prev) => ({
                        ...prev,
                        adjustments: {
                          ...prev.adjustments,
                          autoRestore: !prev.adjustments.autoRestore,
                        },
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer disabled:opacity-50 ${
                      activePhoto?.edit.adjustments.autoRestore
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      {activePhoto?.edit.adjustments.autoRestore && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs font-extrabold mt-1.5">পুরোনো ছবি রিস্টোর</p>
                    <p className="text-[10px] text-slate-500">অটো লেভেল ও রঙ পুনরুদ্ধার</p>
                  </button>
                </div>

                {/* Fine-Tune Portrait Sliders */}
                {activePhoto && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">
                        রঙ, আলো ও ফেস ডিটেইল
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveEdit((prev) => ({
                            ...prev,
                            adjustments: { ...DEFAULT_MANUAL_ADJUSTMENTS },
                          }))
                        }
                        className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        রিসেট
                      </button>
                    </div>

                    <SliderControl
                      label="আলো / এক্সপোজার (Exposure)"
                      value={activePhoto.edit.adjustments.exposure}
                      min={-40}
                      max={40}
                      onChange={(v) =>
                        updateActiveEdit(
                          (prev) => ({ ...prev, adjustments: { ...prev.adjustments, exposure: v } }),
                          false
                        )
                      }
                    />
                    <SliderControl
                      label="কনট্রাস্ট (Contrast)"
                      value={activePhoto.edit.adjustments.contrast}
                      min={-40}
                      max={40}
                      onChange={(v) =>
                        updateActiveEdit(
                          (prev) => ({ ...prev, adjustments: { ...prev.adjustments, contrast: v } }),
                          false
                        )
                      }
                    />
                    <SliderControl
                      label="রঙের উজ্জ্বলতা (Saturation)"
                      value={activePhoto.edit.adjustments.saturation}
                      min={-60}
                      max={60}
                      onChange={(v) =>
                        updateActiveEdit(
                          (prev) => ({
                            ...prev,
                            adjustments: { ...prev.adjustments, saturation: v },
                          }),
                          false
                        )
                      }
                    />
                    <SliderControl
                      label="উষ্ণতা (Warm / Cool Tone)"
                      value={activePhoto.edit.adjustments.temperature}
                      min={-40}
                      max={40}
                      onChange={(v) =>
                        updateActiveEdit(
                          (prev) => ({
                            ...prev,
                            adjustments: { ...prev.adjustments, temperature: v },
                          }),
                          false
                        )
                      }
                    />
                    <SliderControl
                      label="ফেস ক্ল্যারিটি (Sharpen)"
                      value={activePhoto.edit.adjustments.clarity}
                      min={0}
                      max={80}
                      unit="%"
                      onChange={(v) =>
                        updateActiveEdit(
                          (prev) => ({ ...prev, adjustments: { ...prev.adjustments, clarity: v } }),
                          false
                        )
                      }
                    />
                    <SliderControl
                      label="স্কিন স্মুথিং (Soft Skin)"
                      value={activePhoto.edit.adjustments.skinSmooth}
                      min={0}
                      max={80}
                      unit="%"
                      onChange={(v) =>
                        updateActiveEdit(
                          (prev) => ({
                            ...prev,
                            adjustments: { ...prev.adjustments, skinSmooth: v },
                          }),
                          false
                        )
                      }
                    />
                    <SliderControl
                      label="স্টুডিও সফটবক্স লাইট"
                      value={activePhoto.edit.adjustments.studioLight}
                      min={0}
                      max={80}
                      unit="%"
                      onChange={(v) =>
                        updateActiveEdit(
                          (prev) => ({
                            ...prev,
                            adjustments: { ...prev.adjustments, studioLight: v },
                          }),
                          false
                        )
                      }
                    />
                  </div>
                )}

                {/* Optional Manual Formal Attire Overlay (Collapsed by default so it never surprises users) */}
                <details className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                  <summary className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition list-none">
                    <div className="flex items-center gap-1.5">
                      <Shirt className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-700">
                        ঐচ্ছিক: ম্যানুয়াল পোশাক ওভারলে (কোট/পাঞ্জাবি)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600">
                      {activePhoto?.edit.attire.id && activePhoto.edit.attire.id !== 'none'
                        ? 'চালু আছে'
                        : 'খুলুন'}
                    </span>
                  </summary>
                  <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-1.5">
                      {ATTIRE_OPTIONS.map((opt) => {
                        const active = activePhoto?.edit.attire.id === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={!activePhoto}
                            onClick={() =>
                              updateActiveEdit((prev) => ({
                                ...prev,
                                attire: { ...prev.attire, id: opt.id },
                              }))
                            }
                            className={`p-2 rounded-xl border text-center transition cursor-pointer disabled:opacity-50 ${
                              active
                                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900'
                                : 'border-slate-200 hover:border-indigo-300 text-slate-700'
                            }`}
                          >
                            <div
                              style={{ backgroundColor: opt.swatch }}
                              className="w-6 h-6 rounded-full mx-auto border border-slate-300 shadow-2xs mb-1"
                            />
                            <p className="text-[10px] font-bold leading-tight line-clamp-2">
                              {opt.nameBn}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {activePhoto && activePhoto.edit.attire.id !== 'none' && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <SliderControl
                          label="পোশাকের সাইজ (Scale)"
                          value={Math.round(activePhoto.edit.attire.scale * 100)}
                          min={65}
                          max={155}
                          unit="%"
                          onChange={(v) =>
                            updateActiveEdit(
                              (prev) => ({ ...prev, attire: { ...prev.attire, scale: v / 100 } }),
                              false
                            )
                          }
                        />
                        <SliderControl
                          label="ডানে / বামে সরান (Offset X)"
                          value={activePhoto.edit.attire.offsetX}
                          min={-30}
                          max={30}
                          unit="%"
                          onChange={(v) =>
                            updateActiveEdit(
                              (prev) => ({ ...prev, attire: { ...prev.attire, offsetX: v } }),
                              false
                            )
                          }
                        />
                        <SliderControl
                          label="উপরে / নিচে সরান (Offset Y)"
                          value={activePhoto.edit.attire.offsetY}
                          min={-30}
                          max={35}
                          unit="%"
                          onChange={(v) =>
                            updateActiveEdit(
                              (prev) => ({ ...prev, attire: { ...prev.attire, offsetY: v } }),
                              false
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </details>

                {/* Transparent Honesty Card for Expensive Cloud Generative AI */}
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>ক্লাউড জেনারেটিভ AI (জিরো-কস্ট মোডে নিষ্ক্রিয়)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900/90">
                    সম্পূর্ণ নতুন কাপড়ের ভাঁজ বা ৩ডি বডি জেনারেট করতে ব্যয়বহুল পেইড ক্লাউড GPU API
                    প্রয়োজন হয়। এই স্টুডিওটি <strong>০ টাকা খরচে</strong> পরিচালনার জন্য পেইড ক্লাউড
                    জেনারেশন বন্ধ রাখা হয়েছে এবং তার বদলে ফ্রি লোকাল ফরমাল পোশাক ওভারলে, ২১৬+ কালার
                    স্টাইল ও MediaPipe নিউরাল ব্যাকগ্রাউন্ড রিমুভ যুক্ত করা হয়েছে।
                  </p>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: PASSPORT, VISA, GOVT JOB & CUSTOM DIMENSIONS            */}
            {/* ============================================================== */}
            {activeTab === 'passport' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    পাসপোর্ট, ভিসা, সরকারি চাকরি ও কাস্টম মাপ
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    আসল মিলিমিটার ও ৩০০ DPI পিক্সেল মাপে ফ্রেম করুন
                  </p>
                </div>

                {/* Auto Face Centering Button */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!activePhoto || isProcessing}
                    onClick={() => handleAutoCenterFace()}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer disabled:opacity-50"
                  >
                    <ScanFace className="w-4 h-4" />
                    <span>অটো পাসপোর্ট ক্রপ</span>
                  </button>
                  <button
                    type="button"
                    disabled={!activePhoto}
                    onClick={() => setShowFaceGuide((v) => !v)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${
                      showFaceGuide
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ScanFace className="w-4 h-4" />
                    <span>{showFaceGuide ? 'গাইড লুকান' : 'বায়োমেট্রিক গাইড'}</span>
                  </button>
                </div>

                {/* Preset List */}
                <div className="space-y-1.5 max-h-[270px] overflow-y-auto pr-1">
                  {PASSPORT_PRESET_SPECS.map((preset) => {
                    const selected = activePhoto?.edit.passportPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        disabled={!activePhoto}
                        onClick={() => handleSelectPassportPreset(preset.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition cursor-pointer disabled:opacity-50 flex items-center justify-between gap-2 ${
                          selected
                            ? 'bg-indigo-50/80 border-indigo-500 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {preset.nameBn}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{preset.nameEn}</p>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md tabular-nums shrink-0">
                          {preset.fixedPxWidth
                            ? `${preset.fixedPxWidth}×${preset.fixedPxHeight}px`
                            : preset.id === 'original-free'
                            ? 'ফ্রি'
                            : `${preset.widthMm}×${preset.heightMm}mm`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Dimension Controls */}
                {activePhoto?.edit.passportPreset === 'custom' && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">কাস্টম মাপ</span>
                      <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveEdit((prev) => ({ ...prev, customUnit: 'mm' }))
                          }
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            activePhoto.edit.customUnit === 'mm'
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600'
                          }`}
                        >
                          মিলিমিটার (mm)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveEdit((prev) => ({ ...prev, customUnit: 'px' }))
                          }
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            activePhoto.edit.customUnit === 'px'
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600'
                          }`}
                        >
                          পিক্সেল (px)
                        </button>
                      </div>
                    </div>

                    {activePhoto.edit.customUnit === 'mm' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-[11px] font-bold text-slate-600">
                          প্রস্থ (mm)
                          <input
                            type="number"
                            min={10}
                            max={300}
                            value={activePhoto.edit.customWidthMm}
                            onChange={(e) =>
                              updateActiveEdit((prev) => ({
                                ...prev,
                                customWidthMm: Math.max(10, Number(e.target.value) || 45),
                              }))
                            }
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold tabular-nums"
                          />
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          উচ্চতা (mm)
                          <input
                            type="number"
                            min={10}
                            max={350}
                            value={activePhoto.edit.customHeightMm}
                            onChange={(e) =>
                              updateActiveEdit((prev) => ({
                                ...prev,
                                customHeightMm: Math.max(10, Number(e.target.value) || 55),
                              }))
                            }
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold tabular-nums"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-[11px] font-bold text-slate-600">
                          প্রস্থ (px)
                          <input
                            type="number"
                            min={64}
                            max={4000}
                            value={activePhoto.edit.customPxWidth}
                            onChange={(e) =>
                              updateActiveEdit((prev) => ({
                                ...prev,
                                customPxWidth: Math.max(64, Number(e.target.value) || 300),
                              }))
                            }
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold tabular-nums"
                          />
                        </label>
                        <label className="text-[11px] font-bold text-slate-600">
                          উচ্চতা (px)
                          <input
                            type="number"
                            min={64}
                            max={4000}
                            value={activePhoto.edit.customPxHeight}
                            onChange={(e) =>
                              updateActiveEdit((prev) => ({
                                ...prev,
                                customPxHeight: Math.max(64, Number(e.target.value) || 300),
                              }))
                            }
                            className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold tabular-nums"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Zoom, Pan, Rotate, Flip */}
                {activePhoto && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">
                        ক্রপ, জুম ও রোটেশন
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveEdit((prev) => ({
                              ...prev,
                              crop: { ...prev.crop, rotation: (prev.crop.rotation + 90) % 360 },
                            }))
                          }
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                          title="৯০° ঘোরান"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateActiveEdit((prev) => ({
                              ...prev,
                              crop: { ...prev.crop, flipH: !prev.crop.flipH },
                            }))
                          }
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                          title="উল্টান (Flip)"
                        >
                          <FlipHorizontal2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <SliderControl
                      label="জুম (Zoom)"
                      value={Math.round(activePhoto.edit.crop.zoom * 100)}
                      min={80}
                      max={450}
                      unit="%"
                      onChange={(v) =>
                        updateActiveEdit(
                          (prev) => ({ ...prev, crop: { ...prev.crop, zoom: v / 100 } }),
                          false
                        )
                      }
                    />
                    <SliderControl
                      label="ডানে / বামে (Pan X)"
                      value={activePhoto.edit.crop.panX}
                      min={-250}
                      max={250}
                      unit="%"
                      onChange={(v) =>
                        updateActiveEdit(
                          (prev) => ({ ...prev, crop: { ...prev.crop, panX: v } }),
                          false
                        )
                      }
                    />
                    <SliderControl
                      label="উপরে / নিচে (Pan Y)"
                      value={activePhoto.edit.crop.panY}
                      min={-250}
                      max={250}
                      unit="%"
                      onChange={(v) =>
                        updateActiveEdit(
                          (prev) => ({ ...prev, crop: { ...prev.crop, panY: v } }),
                          false
                        )
                      }
                    />
                  </div>
                )}

                {/* Authority Verification Advisory */}
                {activePresetMeta && (
                  <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[11px] text-blue-950 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>কর্তৃপক্ষের নির্দেশনা:</strong> {activePresetMeta.authorityNote}। যেকোনো
                      অফিসিয়াল ভিসা বা পাসপোর্ট আবেদনের আগে সংশ্লিষ্ট কর্তৃপক্ষের সর্বশেষ মাপ ও
                      ব্যাকগ্রাউন্ড নিয়ম যাচাই করে নিন।
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: MULTI-COPY PRINT LAYOUT (4R, 5R, A4, A5, LETTER, CUSTOM)*/}
            {/* ============================================================== */}
            {activeTab === 'print' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    মাল্টি-কপি প্রিন্ট শিট সেটিংস (4R / 5R / A4)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    আসল মিলিমিটার স্কেলে একাধিক কপি সাজিয়ে সরাসরি প্রিন্ট বা PDF নিন
                  </p>
                </div>

                {/* Paper Size Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">কাগজের সাইজ (Paper Size):</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(PAPER_SIZE_SPECS) as PrintPaperSizeId[]).map((key) => {
                      const active = sheetConfig.paperSize === key;
                      const spec = PAPER_SIZE_SPECS[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSheetConfig((s) => ({ ...s, paperSize: key }))}
                          className={`py-2 px-1.5 rounded-xl border text-center transition cursor-pointer ${
                            active
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="text-xs font-extrabold leading-tight">
                            {key === 'custom' ? 'কাস্টম' : key}
                          </div>
                          <div
                            className={`text-[9px] font-semibold mt-0.5 tabular-nums ${
                              active ? 'text-indigo-100' : 'text-slate-400'
                            }`}
                          >
                            {key === 'custom'
                              ? 'নিজের মাপ'
                              : `${Math.round(spec.widthMm)}×${Math.round(spec.heightMm)}mm`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Paper mm inputs */}
                {sheetConfig.paperSize === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="text-[11px] font-bold text-slate-600">
                      কাগজ প্রস্থ (mm)
                      <input
                        type="number"
                        min={50}
                        max={420}
                        value={sheetConfig.customWidthMm}
                        onChange={(e) =>
                          setSheetConfig((s) => ({
                            ...s,
                            customWidthMm: Math.max(50, Number(e.target.value) || 102),
                          }))
                        }
                        className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold tabular-nums"
                      />
                    </label>
                    <label className="text-[11px] font-bold text-slate-600">
                      কাগজ উচ্চতা (mm)
                      <input
                        type="number"
                        min={50}
                        max={594}
                        value={sheetConfig.customHeightMm}
                        onChange={(e) =>
                          setSheetConfig((s) => ({
                            ...s,
                            customHeightMm: Math.max(50, Number(e.target.value) || 152),
                          }))
                        }
                        className="mt-1 w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold tabular-nums"
                      />
                    </label>
                  </div>
                )}

                {/* Orientation */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSheetConfig((s) => ({ ...s, orientation: 'portrait' }))}
                    className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      sheetConfig.orientation === 'portrait'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    লম্বালম্বি (Portrait)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheetConfig((s) => ({ ...s, orientation: 'landscape' }))}
                    className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      sheetConfig.orientation === 'landscape'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    আড়াআড়ি (Landscape)
                  </button>
                </div>

                {/* Quick Photo Size Switcher right inside Print Sheet tab */}
                {activePhoto && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600">
                        শিটে প্রতি ছবির সাইজ:
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 tabular-nums">
                        {activeDims.widthMm}×{activeDims.heightMm} mm
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'bd-passport-45x55', label: 'পাসপোর্ট ৪৫×৫৫' },
                          { id: 'bd-standard-35x45', label: 'পাসপোর্ট ৩৫×৪৫' },
                          { id: 'bd-stamp-20x25', label: 'স্ট্যাম্প ২০×২৫' },
                          { id: 'us-visa-51x51', label: 'ভিসা ২×২' },
                        ] as Array<{ id: PassportPresetId; label: string }>
                      ).map((presetBtn) => {
                        const isSelected = activePhoto.edit.passportPreset === presetBtn.id;
                        return (
                          <button
                            key={presetBtn.id}
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleSelectPassportPreset(presetBtn.id)}
                            className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition cursor-pointer disabled:opacity-50 ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                            }`}
                          >
                            {presetBtn.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Active Photo Copy Count Quick Control */}
                {activePhoto && (
                  <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">কপি সংখ্যা (এই ছবি)</p>
                      <p className="text-[10px] text-slate-600 tabular-nums">
                        মোট শিট: {printPages.length} পেজ · {totalPrintCopies} কপি
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleChangeCopies(activePhoto.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-extrabold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-extrabold text-indigo-700 tabular-nums">
                        {activePhoto.copies}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleChangeCopies(activePhoto.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-extrabold text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Copy Presets */}
                {activePhoto && (
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 4, 6, 8, 12, 16, 24].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          setPhotos((prev) =>
                            prev.map((p) => (p.id === activePhoto.id ? { ...p, copies: n } : p))
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer tabular-nums ${
                          activePhoto.copies === n
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {n} কপি
                      </button>
                    ))}
                  </div>
                )}

                {/* Auto-Fit All Copies on 1 Sheet Toggle */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sheetConfig.fitAllOnOneSheet}
                      onChange={(e) =>
                        setSheetConfig((s) => ({ ...s, fitAllOnOneSheet: e.target.checked }))
                      }
                      className="mt-0.5 rounded border-emerald-400 text-emerald-600"
                    />
                    <span className="text-[11px] leading-snug">
                      <span className="block font-extrabold text-emerald-950">
                        সব কপি ১ শিটে অটো-ফিট করুন
                      </span>
                      <span className="text-emerald-800/80 font-medium">
                        চালু থাকলে যত কপি সিলেক্ট করবেন সবগুলো এই ১টি {sheetConfig.paperSize} শিটে সাজিয়ে দেখাবে
                      </span>
                    </span>
                  </label>

                  {!sheetConfig.fitAllOnOneSheet && printPages.length > 1 && (
                    <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between gap-2">
                      <p className="text-[10px] font-semibold text-amber-900 leading-snug">
                        আসল মিমি স্কেলে প্রতি {sheetConfig.paperSize} শিটে {printPages[0]?.slots.length || 0}টি ধরছে ({printPages.length} পেজ)
                      </p>
                      <button
                        type="button"
                        onClick={() => setSheetConfig((s) => ({ ...s, fitAllOnOneSheet: true }))}
                        className="shrink-0 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold cursor-pointer"
                      >
                        ১ শিটে আনুন
                      </button>
                    </div>
                  )}
                </div>

                {/* Margins & Spacing */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <SliderControl
                    label="পেজ মার্জিন (Margin)"
                    value={sheetConfig.marginMm}
                    min={0}
                    max={20}
                    unit="mm"
                    onChange={(v) => setSheetConfig((s) => ({ ...s, marginMm: v }))}
                  />
                  <SliderControl
                    label="ছবির মাঝের ফাঁকা (Gap)"
                    value={sheetConfig.gapMm}
                    min={0}
                    max={15}
                    unit="mm"
                    onChange={(v) => setSheetConfig((s) => ({ ...s, gapMm: v }))}
                  />

                  <div className="pt-1 space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sheetConfig.showCutBorder}
                        onChange={(e) =>
                          setSheetConfig((s) => ({ ...s, showCutBorder: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span>কাঁচি দিয়ে কাটার হালকা বর্ডার লাইন</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sheetConfig.showCropMarks}
                        onChange={(e) =>
                          setSheetConfig((s) => ({ ...s, showCropMarks: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span>কোণায় প্রিন্টার ক্রপ মার্কস (Crop Marks)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sheetConfig.showFooterInfo}
                        onChange={(e) =>
                          setSheetConfig((s) => ({ ...s, showFooterInfo: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span>নিচে পেজ ও স্কেল তথ্য দেখান</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER PANE: Interactive Before/After Stage OR Live Print Sheet Stage */}
        <main className="flex-1 flex flex-col min-w-0">
          {activeTab === 'print' && photos.length > 0 ? (
            <div className="flex-1 flex flex-col bg-slate-100/80 min-h-[480px] lg:min-h-[600px]">
              {/* Top Live Print Sheet Header Bar */}
              <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>
                      {sheetConfig.paperSize === 'custom' ? 'কাস্টম' : sheetConfig.paperSize} শিট প্রিভিউ
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[11px] font-extrabold text-indigo-700 tabular-nums">
                    {printPaperDims.pageWidthMm}×{printPaperDims.pageHeightMm} mm
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-extrabold text-emerald-700 tabular-nums">
                    এই শিটে {activeSheetPhotoCount}টি ছবি
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Quick Sheet Switcher synced with Left Panel */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {(['4R', '5R', 'A4'] as PrintPaperSizeId[]).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSheetConfig((s) => ({ ...s, paperSize: sz }))}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold transition cursor-pointer ${
                          sheetConfig.paperSize === sz
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  {printPages.length > 1 && (
                    <div className="flex items-center gap-1">
                      {printPages.map((pg, idx) => (
                        <button
                          key={pg.pageIndex}
                          type="button"
                          onClick={() => setActivePrintPageIndex(idx)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            safePrintPageIndex === idx
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          পেজ {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Center Paper Sheet Preview Stage */}
              <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-auto">
                {/* Paper Sheet Identifier Strip above the physical sheet */}
                <div className="mb-2.5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-600">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-slate-800">
                    কাগজ: {sheetConfig.paperSize === 'custom' ? 'কাস্টম' : sheetConfig.paperSize} (
                    {sheetConfig.orientation === 'portrait' ? 'লম্বালম্বি' : 'আড়াআড়ি'})
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs tabular-nums">
                    মোট {totalPrintCopies} কপি · {printPages.length} পেজ
                  </span>
                  {printPages.length > 1 && !sheetConfig.fitAllOnOneSheet && (
                    <button
                      type="button"
                      onClick={() => setSheetConfig((s) => ({ ...s, fitAllOnOneSheet: true }))}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs cursor-pointer transition"
                    >
                      সব {totalPrintCopies} কপি ১ শিটে দেখান
                    </button>
                  )}
                </div>

                {printPreviewUrls[safePrintPageIndex] ? (
                  <div className="p-2 bg-slate-200/70 rounded-2xl border border-slate-300/70 shadow-inner">
                    <img
                      src={printPreviewUrls[safePrintPageIndex]}
                      alt={`${sheetConfig.paperSize} Print Sheet Page ${safePrintPageIndex + 1}`}
                      className={`w-auto max-w-full bg-white rounded-md shadow-xl ring-1 ring-slate-300 object-contain transition-all duration-200 ${
                        sheetConfig.paperSize === '4R'
                          ? 'max-h-[380px]'
                          : sheetConfig.paperSize === '5R'
                          ? 'max-h-[430px]'
                          : sheetConfig.paperSize === 'A5'
                          ? 'max-h-[470px]'
                          : 'max-h-[540px]'
                      }`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>প্রিন্ট শিট তৈরি হচ্ছে...</span>
                  </div>
                )}

                <p className="mt-3 text-[11px] font-semibold text-slate-500 tabular-nums text-center">
                  {sheetConfig.paperSize} ({printPaperDims.pageWidthMm}×{printPaperDims.pageHeightMm} mm) ·
                  এই শিটে {activeSheetPhotoCount}টি ছবি ·{' '}
                  {sheetConfig.fitAllOnOneSheet
                    ? 'অটো-ফিট মোড (সব কপি ১ শিটে)'
                    : '১০০% আসল মিলিমিটার স্কেল'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Quick 1-Click Passport Auto-Crop Bar (works on any WhatsApp / phone photo) */}
              {activePhoto && (
                <div className="bg-white border-b border-slate-200/80 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-extrabold text-slate-600 mr-0.5">
                      দ্রুত সাইজ ও অটো-ক্রপ:
                    </span>
                    {(
                      [
                        { id: 'original-free', label: 'মূল ছবি' },
                        { id: 'bd-passport-45x55', label: 'পাসপোর্ট ৪৫×৫৫' },
                        { id: 'bd-standard-35x45', label: 'পাসপোর্ট ৩৫×৪৫' },
                        { id: 'us-visa-51x51', label: 'ভিসা ২×২' },
                        { id: 'bd-stamp-20x25', label: 'স্ট্যাম্প' },
                      ] as Array<{ id: PassportPresetId; label: string }>
                    ).map((q) => {
                      const active = activePhoto.edit.passportPreset === q.id;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleSelectPassportPreset(q.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer disabled:opacity-50 ${
                            active
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                          }`}
                        >
                          {q.label}
                        </button>
                      );
                    })}
                  </div>

                  {activePresetMeta?.isPassportStyle && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAutoCenterFace()}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                      title="মুখমণ্ডল পুনরায় অটো-ক্রপ করুন"
                    >
                      <ScanFace className="w-3.5 h-3.5" />
                      <span>অটো-ক্রপ</span>
                    </button>
                  )}
                </div>
              )}

              <BeforeAfterCanvas
                hasPhoto={!!activePhoto}
                beforeUrl={beforePreviewUrl}
                afterUrl={afterPreviewUrl}
                isProcessing={isProcessing}
                processingLabel={processingLabel}
                showFaceGuide={showFaceGuide}
                onToggleFaceGuide={() => setShowFaceGuide((v) => !v)}
                isPassportMode={!!activePresetMeta?.isPassportStyle}
                isTransparentBg={
                  !!activePhoto?.edit.cutout.enabled &&
                  activePhoto.edit.backgroundId !== 'bg-custom-color' &&
                  getBackgroundById(activePhoto.edit.backgroundId).mode === 'transparent'
                }
                aspectRatio={activeDims.aspect}
                outputDimensionLabel={`${activeDims.widthMm}×${activeDims.heightMm} mm · ${activeDims.widthPx}×${activeDims.heightPx} px (300 DPI)`}
                onUploadFiles={handleUploadFiles}
                onLoadDemo={handleLoadDemoPhoto}
                onPanDelta={(dx, dy) => {
                  updateActiveEdit(
                    (prev) => ({
                      ...prev,
                      crop: {
                        ...prev.crop,
                        panX: Math.max(-250, Math.min(250, Math.round(prev.crop.panX + dx))),
                        panY: Math.max(-250, Math.min(250, Math.round(prev.crop.panY + dy))),
                      },
                    }),
                    false
                  );
                }}
              />
            </div>
          )}
        </main>

        {/* RIGHT PANE: Summary, Single Download & Print Sheet Export */}
        <aside className="w-full lg:w-[295px] xl:w-[320px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200/90 p-4 space-y-4 shrink-0 lg:max-h-[calc(100vh-108px)] lg:overflow-y-auto lg:sticky lg:top-[108px]">
          {/* Active Photo Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>বর্তমান এডিট সারসংক্ষেপ</span>
            </h3>
            {activePhoto ? (
              <dl className="space-y-1.5 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">ব্যাকগ্রাউন্ড:</dt>
                  <dd className="font-bold text-slate-900 text-right truncate">
                    {activeBgMeta?.nameBn || 'মূল ব্যাকগ্রাউন্ড'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">স্টাইল:</dt>
                  <dd className="font-bold text-slate-900 text-right truncate">
                    {activeStyleMeta ? activeStyleMeta.nameBn : 'মূল রঙ (None)'}
                  </dd>
                </div>
                {activePhoto.edit.attire.id !== 'none' && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">পোশাক ওভারলে:</dt>
                    <dd className="font-bold text-slate-900 text-right truncate">
                      {ATTIRE_OPTIONS.find((a) => a.id === activePhoto.edit.attire.id)?.nameBn}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">ছবির মাপ:</dt>
                  <dd className="font-bold text-indigo-700 text-right tabular-nums">
                    {activeDims.widthMm}×{activeDims.heightMm} mm
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">আউটপুট রেজ্যুলেশন:</dt>
                  <dd className="font-bold text-slate-800 text-right tabular-nums">
                    {activeDims.widthPx}×{activeDims.heightPx} px
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-[11px] text-slate-500">
                শুরু করতে বাম বা মাঝখানের অপশন থেকে একটি ছবি আপলোড করুন।
              </p>
            )}
          </div>

          {/* Section 1: Single Photo Download */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>একক ছবি ডাউনলোড (Single Photo)</span>
            </h3>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setExportFormat('jpeg')}
                className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                  exportFormat === 'jpeg'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                JPG (স্টুডিও প্রিন্ট)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('png')}
                className={`py-1.5 rounded-xl border text-xs font-bold cursor-pointer ${
                  exportFormat === 'png'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                PNG (স্বচ্ছ/লসলেস)
              </button>
            </div>

            {exportFormat === 'jpeg' && (
              <SliderControl
                label="ছবির কোয়ালিটি"
                value={exportQuality}
                min={70}
                max={100}
                unit="%"
                onChange={setExportQuality}
              />
            )}

            <button
              type="button"
              disabled={!activePhoto || isProcessing}
              onClick={handleDownloadSinglePhoto}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-45"
            >
              <Download className="w-4 h-4" />
              <span>হাই-কোয়ালিটি ছবি ডাউনলোড</span>
            </button>
          </div>

          {/* Section 2: Multi-Copy Print & PDF Sheet Export */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
            <div>
              <h3 className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                <span>প্রিন্ট শিট ও PDF ({sheetConfig.paperSize})</span>
              </h3>
              <p className="text-[11px] text-emerald-900/80 mt-0.5 tabular-nums">
                {totalPrintCopies} কপি · {printPages.length} পেজ · {printPaperDims.pageWidthMm}×
                {printPaperDims.pageHeightMm} mm
              </p>
            </div>

            <button
              type="button"
              disabled={photos.length === 0 || isExportingSheet}
              onClick={handleOpenPrintModal}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-45"
            >
              {isExportingSheet ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>সরাসরি প্রিন্ট করুন (সব প্রিন্টার)</span>
            </button>

            <button
              type="button"
              disabled={photos.length === 0 || isExportingSheet}
              onClick={handleDownloadPrintPdf}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-45"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>প্রিন্ট-রেডি PDF ডাউনলোড</span>
            </button>

            <button
              type="button"
              disabled={photos.length === 0 || isExportingSheet}
              onClick={handleDownloadPrintJpg}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-45"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>৩০০ DPI JPG শিট ডাউনলোড</span>
            </button>
          </div>

          {/* Privacy & Zero-Cost Assurance */}
          <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-[10px] text-slate-500 leading-relaxed">
            আপনার ছবি কখনো কোনো সার্ভারে সংরক্ষণ হয় না। সব ব্যাকগ্রাউন্ড রিমুভ, স্টাইল ও প্রিন্ট
            শিট সরাসরি আপনার ডিভাইসে তৈরি হয়।
          </div>
        </aside>
      </div>

      {/* Reusable Universal Print Modal (Epson, Canon, HP, Brother, PDF) */}
      <StudioPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        pageImages={printModalImages}
        paperSize={
          sheetConfig.paperSize === 'custom'
            ? `${printPaperDims.pageWidthMm}mm ${printPaperDims.pageHeightMm}mm`
            : sheetConfig.paperSize
        }
        orientation={sheetConfig.orientation}
        totalPhotos={totalPrintCopies}
        onDownloadPdf={handleDownloadPrintPdf}
        onShowToast={onShowToast}
      />
    </div>
  );
};

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[11px]">
      <span className="font-semibold text-slate-700">{label}</span>
      <span className="font-bold text-indigo-700 tabular-nums">
        {value > 0 && min < 0 ? `+${value}` : value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
  </div>
);
