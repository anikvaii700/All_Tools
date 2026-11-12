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
  ArrowRight,
  Maximize2,
  RefreshCw,
  Image as ImageIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Copy,
  FolderOpen,
} from 'lucide-react';
import {
  StudioPhotoItem,
  SheetSettings,
  PhotoSizePreset,
  PHOTO_PRESETS,
  ArrangedPage,
  StudioBgColor,
} from './photoStudioTypes';
import {
  processPhotoItem,
  createDemoStudioPhotoFile,
  DPI_300_PX_PER_MM,
} from './clientImageProcessor';
import {
  calculatePhotoPages,
  renderArrangedPageToCanvas,
  exportStudioMultiPagePdf,
  triggerStudioMultiPagePrint,
} from './photoArranger';
import { StudioPrintModal } from './StudioPrintModal';
import { SmartDocScannerStudio } from './SmartDocScannerStudio';

interface MultiPhotoStudioEditorProps {
  initialPreset?: PhotoSizePreset;
  onBackToDashboard: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const DEFAULT_SHEET_SETTINGS: SheetSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  marginMm: 8,
  gapMm: 4,
  showCutBorder: true,
  showCropMarks: false,
  showFooterInfo: false,
  backgroundColor: '#ffffff',
};

export const MultiPhotoStudioEditor: React.FC<MultiPhotoStudioEditorProps> = ({
  initialPreset = 'passport-bd',
  onBackToDashboard,
  onShowToast,
}) => {
  // Studio Mode: Multi-Photo Sheet vs Smart Document Scanner
  const [activeStudioTab, setActiveStudioTab] = useState<'photo-sheet' | 'doc-scanner'>(
    initialPreset === 'a4-full' ? 'doc-scanner' : 'photo-sheet'
  );

  // Photos list
  const [photos, setPhotos] = useState<StudioPhotoItem[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Sheet layout settings
  const [sheetSettings, setSheetSettings] = useState<SheetSettings>(DEFAULT_SHEET_SETTINGS);

  // Active preview page index
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // Calculated pages
  const [arrangedPages, setArrangedPages] = useState<ArrangedPage[]>([]);

  // Canvas refs
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  // Drag state for dropzone
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Active selected photo item
  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId) || photos[0] || null;

  // Map of photos by ID for fast lookup during canvas rendering
  const photosMap = React.useMemo(() => {
    const map = new Map<string, StudioPhotoItem>();
    for (const p of photos) {
      map.set(p.id, p);
    }
    return map;
  }, [photos]);

  // Handle uploading multiple photo files
  const handleAddPhotoFiles = useCallback(
    (files: FileList | File[]) => {
      const fileList = Array.from(files);
      const validFiles = fileList.filter((f) =>
        f.type.match(/^image\/(jpeg|jpg|png|webp)$/i)
      );

      if (validFiles.length === 0) {
        onShowToast('অনুগ্রহ করে JPG, PNG বা WEBP ফরম্যাটের ছবি নির্বাচন করুন।', '⚠️');
        return;
      }

      onShowToast(`${validFiles.length}টি ছবি লোড হচ্ছে...`, '⏳');

      validFiles.forEach((file) => {
        const rawUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          const newPhoto: StudioPhotoItem = {
            id: 'photo_' + Math.random().toString(36).substr(2, 9),
            file,
            fileName: file.name,
            fileSize: file.size,
            rawUrl,
            imgElement: img,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            preset: initialPreset,
            customWidthMm: PHOTO_PRESETS[initialPreset].widthMm,
            customHeightMm: PHOTO_PRESETS[initialPreset].heightMm,
            quantity: 4, // Default 4 copies
            crop: {
              zoom: 1.0,
              panX: 0,
              panY: 0,
              rotation: 0,
            },
            brightness: 0,
            contrast: 0,
            bgColor: 'original',
            processedCanvas: null,
            processedUrl: null,
          };

          // Render initial processed canvas
          const res = processPhotoItem(newPhoto);
          newPhoto.processedCanvas = res.canvas;
          newPhoto.processedUrl = res.url;

          setPhotos((prev) => {
            const updated = [...prev, newPhoto];
            if (!selectedPhotoId) setSelectedPhotoId(newPhoto.id);
            return updated;
          });
        };
        img.src = rawUrl;
      });

      onShowToast(`${validFiles.length}টি ছবি সফলভাবে যুক্ত হয়েছে!`, '✅');
    },
    [initialPreset, onShowToast, selectedPhotoId]
  );

  // Load demo portrait photo for instant test
  const handleLoadDemo = async () => {
    try {
      onShowToast('নমুনা স্টুডিও পোর্ট্রেট তৈরি হচ্ছে...', '⏳');
      const demoFile1 = await createDemoStudioPhotoFile('Student A');
      const demoFile2 = await createDemoStudioPhotoFile('Officer B');
      handleAddPhotoFiles([demoFile1, demoFile2]);
    } catch (e) {
      onShowToast('নমুনা ছবি লোড করতে সমস্যা হয়েছে।', '⚠️');
    }
  };

  // Re-calculate page packing whenever photos or sheet settings change
  useEffect(() => {
    const pages = calculatePhotoPages(photos, sheetSettings);
    setArrangedPages(pages);
    if (activePageIndex >= pages.length) {
      setActivePageIndex(Math.max(0, pages.length - 1));
    }
  }, [photos, sheetSettings, activePageIndex]);

  // Render active sheet canvas
  const renderCurrentSheetCanvas = useCallback(() => {
    if (!sheetCanvasRef.current) return;
    const activePage = arrangedPages[activePageIndex];
    if (!activePage) return;

    const fullCanvas = renderArrangedPageToCanvas(
      activePage,
      photosMap,
      sheetSettings
    );

    const targetCanvas = sheetCanvasRef.current;
    targetCanvas.width = fullCanvas.width;
    targetCanvas.height = fullCanvas.height;
    const ctx = targetCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(fullCanvas, 0, 0);
    }
  }, [arrangedPages, activePageIndex, sheetSettings, photosMap]);

  useEffect(() => {
    renderCurrentSheetCanvas();
  }, [renderCurrentSheetCanvas]);

  // Update specific photo's settings and re-render its canvas
  const updatePhoto = useCallback(
    (photoId: string, updater: (p: StudioPhotoItem) => Partial<StudioPhotoItem>) => {
      setPhotos((prev) =>
        prev.map((photo) => {
          if (photo.id !== photoId) return photo;
          const changes = updater(photo);
          const updated: StudioPhotoItem = { ...photo, ...changes };
          const res = processPhotoItem(updated);
          updated.processedCanvas = res.canvas;
          updated.processedUrl = res.url;
          return updated;
        })
      );
    },
    []
  );

  // Apply chosen preset to all photos
  const handleApplyPresetToAll = (preset: PhotoSizePreset) => {
    const def = PHOTO_PRESETS[preset];
    setPhotos((prev) =>
      prev.map((photo) => {
        const updated: StudioPhotoItem = {
          ...photo,
          preset,
          customWidthMm: def.widthMm,
          customHeightMm: def.heightMm,
        };
        const res = processPhotoItem(updated);
        updated.processedCanvas = res.canvas;
        updated.processedUrl = res.url;
        return updated;
      })
    );
    onShowToast(`সকল ছবিতে "${def.banglaName}" মাপ প্রয়োগ করা হয়েছে!`, '✨');
  };

  // Remove photo
  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (selectedPhotoId === id) {
        setSelectedPhotoId(filtered[0]?.id || null);
      }
      return filtered;
    });
    onShowToast('ছবিটি মুছে ফেলা হয়েছে।', '🗑️');
  };

  // Clear all
  const handleClearAll = () => {
    if (photos.length === 0) return;
    if (window.confirm('আপনি কি নিশ্চিত যে সব ছবি মুছে ফেলতে চান?')) {
      photos.forEach((p) => URL.revokeObjectURL(p.rawUrl));
      setPhotos([]);
      setSelectedPhotoId(null);
      setActivePageIndex(0);
      onShowToast('সকল ছবি মুছে ফেলা হয়েছে।', '🗑️');
    }
  };

  // Total copies across all photos
  const totalCopies = photos.reduce((sum, p) => sum + p.quantity, 0);

  // Download PDF
  const handleDownloadPdf = () => {
    if (photos.length === 0) {
      onShowToast('অনুগ্রহ করে অন্তত একটি ছবি যুক্ত করুন।', '⚠️');
      return;
    }
    onShowToast('প্রিন্ট-রেডি ভেক্টর PDF তৈরি হচ্ছে...', '⏳');
    exportStudioMultiPagePdf(
      arrangedPages,
      photosMap,
      sheetSettings,
      `MoSaFa_Photo_Studio_${sheetSettings.paperSize}.pdf`
    );
    onShowToast('PDF সফলভাবে ডাউনলোড হয়েছে!', '📄');
  };

  // Download JPG of current page
  const handleDownloadPageJpg = () => {
    const activePage = arrangedPages[activePageIndex];
    if (!activePage || photos.length === 0) {
      onShowToast('ডাউনলোড করার মতো কোনো পেজ নেই।', '⚠️');
      return;
    }
    const canvas = renderArrangedPageToCanvas(
      activePage,
      photosMap,
      sheetSettings
    );
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `MoSaFa_Photo_Sheet_Page_${activePageIndex + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast(`পৃষ্ঠা ${activePageIndex + 1}-এর হাই-রেজুলেশন JPG ডাউনলোড সম্পন্ন!`, '📥');
  };

  // Download single cropped photo
  const handleDownloadSinglePhoto = () => {
    if (!selectedPhoto || !selectedPhoto.processedCanvas) return;
    const dataUrl = selectedPhoto.processedCanvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Cropped_${selectedPhoto.preset}_${selectedPhoto.fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('একক ক্রপড ছবি ডাউনলোড সম্পন্ন হয়েছে!', '📥');
  };

  // Precomputed page images for print modal & direct print
  const printPageImages = React.useMemo(() => {
    return arrangedPages.map((page) => {
      const canvas = renderArrangedPageToCanvas(page, photosMap, sheetSettings);
      return canvas.toDataURL('image/jpeg', 0.95);
    });
  }, [arrangedPages, photosMap, sheetSettings]);

  // Direct Print
  const handleDirectPrint = () => {
    if (photos.length === 0) {
      onShowToast('প্রিন্ট করার জন্য ছবি যুক্ত করুন।', '⚠️');
      return;
    }
    triggerStudioMultiPagePrint(
      arrangedPages,
      photosMap,
      sheetSettings,
      onShowToast
    );
    setIsPrintModalOpen(true);
  };

  // If user selected Smart Document Scanner & Auto A4 Maker mode
  if (activeStudioTab === 'doc-scanner') {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveStudioTab('photo-sheet')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              পাসপোর্ট, স্ট্যাম্প ও ফটো প্রিন্ট শিট
            </button>
            <button
              type="button"
              onClick={() => setActiveStudioTab('doc-scanner')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-800 shadow-xs border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              স্মার্ট ডকুমেন্ট স্ক্যানার ও অটো A4 মেকার
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                অ্যাক্টিভ
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            ← স্টুডিও ড্যাশবোর্ড
          </button>
        </div>
        <SmartDocScannerStudio
          onBackToDashboard={onBackToDashboard}
          onShowToast={onShowToast}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      {/* Studio Sub-Navigation Tabs */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveStudioTab('photo-sheet')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-indigo-700 shadow-xs border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
            পাসপোর্ট, স্ট্যাম্প ও ফটো প্রিন্ট শিট
            <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black px-1.5 py-0.5 rounded-full">
              অ্যাক্টিভ
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStudioTab('doc-scanner')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            স্মার্ট ডকুমেন্ট স্ক্যানার ও অটো A4 মেকার
            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-full">
              নতুন
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
        >
          ← স্টুডিও ড্যাশবোর্ড
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={(e) => {
          if (e.target.files) handleAddPhotoFiles(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={(e) => {
          if (e.target.files?.[0] && replaceTargetId) {
            const file = e.target.files[0];
            const rawUrl = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
              updatePhoto(replaceTargetId, () => ({
                file,
                fileName: file.name,
                fileSize: file.size,
                rawUrl,
                imgElement: img,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
              }));
              onShowToast('ছবি প্রতিস্থাপন করা হয়েছে!', '✅');
            };
            img.src = rawUrl;
          }
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Studio Header Bar */}
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/80 px-2 py-0.5 rounded-full">
                  Ultra Digital Studio
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                  ডিজিটাল ফটো স্টুডিও
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                ডিজিটাল ফটো ও প্রিন্ট স্টুডিও — এক পেজে পাসপোর্ট, স্ট্যাম্প ও কাস্টম ছবি
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              নমুনা ছবি দিয়ে দেখুন
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              আরও ছবি যোগ করুন
            </button>
            {photos.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                সব মুছুন
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* =========================================================================
              LEFT COLUMN: THUMBNAIL GALLERY & UPLOAD (4 COLS)
          ========================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            {/* Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleAddPhotoFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-50/70 scale-[0.99]'
                  : 'border-slate-300 hover:border-cyan-400 bg-white shadow-2xs'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200/80 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mb-0.5">
                একাধিক ছবি আপলোড করুন
              </p>
              <p className="text-[11px] text-slate-500 mb-3">
                একসাথে কয়েকটি ছবি সিলেক্ট বা ড্র্যাগ করে ছাড়ুন (JPG, PNG, WEBP)
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs">
                <FolderOpen className="w-3.5 h-3.5" />
                ফাইল নির্বাচন করুন
              </span>
            </div>

            {/* Photo List Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    আপলোড করা ছবি ({photos.length}টি)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    মোট কপি:{' '}
                    <strong className="text-slate-800">{totalCopies}টি</strong> |{' '}
                    পেজ: <strong className="text-cyan-700">{arrangedPages.length}টি</strong>
                  </p>
                </div>

                {photos.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetToAll('passport-bd')}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                      title="সবগুলো ছবি পাসপোর্ট সাইজ করুন"
                    >
                      সব পাসপোর্ট
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetToAll('stamp')}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                      title="সবগুলো ছবি স্ট্যাম্প সাইজ করুন"
                    >
                      সব স্ট্যাম্প
                    </button>
                  </div>
                )}
              </div>

              {photos.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>এখনো কোনো ছবি যুক্ত করা হয়নি।</p>
                  <p className="text-[11px] mt-1 text-slate-500">
                    উপরে ছবি আপলোড করুন অথবা "নমুনা ছবি" বাটনে চাপ দিন।
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {photos.map((photo, idx) => {
                    const isSelected = selectedPhoto?.id === photo.id;
                    const def = PHOTO_PRESETS[photo.preset];
                    return (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhotoId(photo.id)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-cyan-50/70 border-cyan-400 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70'
                        }`}
                      >
                        {/* Number Badge */}
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        {/* Thumbnail */}
                        <div className="w-11 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                          <img
                            src={photo.processedUrl || photo.rawUrl}
                            alt={photo.fileName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info & Quantity */}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {photo.fileName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            <span className="text-cyan-700 font-semibold">{def.name}</span>
                            <span aria-hidden="true">·</span>
                            <span>{photo.quantity} কপি</span>
                          </div>
                        </div>

                        {/* Quick Quantity Counter */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shrink-0"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updatePhoto(photo.id, (p) => ({
                                quantity: Math.max(1, p.quantity - 1),
                              }))
                            }
                            className="w-5 h-5 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 min-w-[16px] text-center">
                            {photo.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updatePhoto(photo.id, (p) => ({
                                quantity: p.quantity + 1,
                              }))
                            }
                            className="w-5 h-5 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(photo.id);
                          }}
                          className="w-7 h-7 rounded-xl hover:bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 cursor-pointer"
                          title="ছবিটি বাদ দিন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* =========================================================================
              CENTER COLUMN: INDIVIDUAL PHOTO CONFIGURATION (4 COLS)
          ========================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            {selectedPhoto ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      নির্বাচিত ছবির সেটিংস (Selected Photo)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReplaceTargetId(selectedPhoto.id);
                      replaceFileInputRef.current?.click();
                    }}
                    className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
                  >
                    ছবি পরিবর্তন
                  </button>
                </div>

                {/* Preset Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ছবির মাপ / সাইজ (Photo Preset):
                  </label>
                  <select
                    value={selectedPhoto.preset}
                    onChange={(e) => {
                      const newPreset = e.target.value as PhotoSizePreset;
                      const def = PHOTO_PRESETS[newPreset];
                      updatePhoto(selectedPhoto.id, () => ({
                        preset: newPreset,
                        customWidthMm: def.widthMm,
                        customHeightMm: def.heightMm,
                      }));
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="passport-bd">পাসপোর্ট সাইজ (বাংলাদেশ প্রমিত ৩৫×৪৫ মিমি)</option>
                    <option value="passport-intl">পাসপোর্ট সাইজ (আন্তর্জাতিক ৪০×৫০ মিমি)</option>
                    <option value="stamp">স্ট্যাম্প সাইজ (২০×২৫ মিমি)</option>
                    <option value="us-visa">আমেরিকান ভিসা (৫১×৫১ মিমি / ২×২ ইঞ্চি)</option>
                    <option value="schengen">শেনজেন / ইউকে ভিসা (৩৫×৪৫ মিমি)</option>
                    <option value="3r">৩R ছবি (৮৯×১২৭ মিমি / ৩.৫×৫ ইঞ্চি)</option>
                    <option value="4r">৪R পোস্টকার্ড সাইজ (১০২×১৫২ মিমি)</option>
                    <option value="a4-full">সম্পূর্ণ A4 পেজ প্রিন্ট</option>
                    <option value="custom">কাস্টম মিলিমিটার সাইজ</option>
                  </select>
                </div>

                {/* Custom Millimeter Dimensions if Custom Preset */}
                {selectedPhoto.preset === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        প্রস্থ (Width mm):
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="297"
                        value={selectedPhoto.customWidthMm}
                        onChange={(e) =>
                          updatePhoto(selectedPhoto.id, () => ({
                            customWidthMm: Math.max(5, Number(e.target.value)),
                          }))
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        উচ্চতা (Height mm):
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="420"
                        value={selectedPhoto.customHeightMm}
                        onChange={(e) =>
                          updatePhoto(selectedPhoto.id, () => ({
                            customHeightMm: Math.max(5, Number(e.target.value)),
                          }))
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* Quantity Stepper */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    প্রিন্ট কপি সংখ্যা (Quantity):
                  </label>
                  <div className="flex items-center gap-2">
                    {[2, 4, 6, 8, 12].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => updatePhoto(selectedPhoto.id, () => ({ quantity: num }))}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          selectedPhoto.quantity === num
                            ? 'bg-cyan-600 border-cyan-600 text-white shadow-2xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <div className="w-16">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={selectedPhoto.quantity}
                        onChange={(e) =>
                          updatePhoto(selectedPhoto.id, () => ({
                            quantity: Math.max(1, Number(e.target.value)),
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-1.5 text-center text-xs font-bold"
                        title="কাস্টম কপি সংখ্যা"
                      />
                    </div>
                  </div>
                </div>

                {/* Crop, Zoom, and Pan Controls */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>জুম ও ফ্রেম সাইজ (Zoom):</span>
                    <span className="text-cyan-700 font-mono">
                      {Math.round(selectedPhoto.crop.zoom * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.05"
                    value={selectedPhoto.crop.zoom}
                    onChange={(e) =>
                      updatePhoto(selectedPhoto.id, (p) => ({
                        crop: { ...p.crop, zoom: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-cyan-600 cursor-pointer"
                  />

                  {/* Horizontal and Vertical Position adjustment */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium">ডানে-বামে (Pan X):</span>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={selectedPhoto.crop.panX}
                        onChange={(e) =>
                          updatePhoto(selectedPhoto.id, (p) => ({
                            crop: { ...p.crop, panX: Number(e.target.value) },
                          }))
                        }
                        className="w-full accent-cyan-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium">উপরে-নিচে (Pan Y):</span>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={selectedPhoto.crop.panY}
                        onChange={(e) =>
                          updatePhoto(selectedPhoto.id, (p) => ({
                            crop: { ...p.crop, panY: Number(e.target.value) },
                          }))
                        }
                        className="w-full accent-cyan-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Rotate and Reset Position Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        updatePhoto(selectedPhoto.id, (p) => ({
                          crop: { ...p.crop, rotation: (p.crop.rotation + 90) % 360 },
                        }))
                      }
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      ৯০° ঘোরান ({selectedPhoto.crop.rotation}°)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updatePhoto(selectedPhoto.id, (p) => ({
                          crop: { zoom: 1.0, panX: 0, panY: 0, rotation: 0 },
                        }))
                      }
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition cursor-pointer"
                      title="পজিশন রিসেট"
                    >
                      রিসেট
                    </button>
                  </div>
                </div>

                {/* Studio Background Color Selection */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    স্টুডিও ব্যাকগ্রাউন্ড কালার (Studio Backdrop):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'original', name: 'মূল ব্যাকগ্রাউন্ড', colorClass: 'bg-slate-200' },
                      { id: '#ffffff', name: 'হোয়াইট (সাদা)', colorClass: 'bg-white border-2 border-slate-300' },
                      { id: '#0284c7', name: 'স্ট্যান্ডার্ড ব্লু', colorClass: 'bg-sky-600' },
                      { id: '#0369a1', name: 'রয়্যাল নেভি', colorClass: 'bg-sky-800' },
                      { id: '#e0f2fe', name: 'স্কাই ব্লু', colorClass: 'bg-sky-100' },
                      { id: '#f1f5f9', name: 'লাইট গ্রে', colorClass: 'bg-slate-100' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          updatePhoto(selectedPhoto.id, () => ({
                            bgColor: item.id as StudioBgColor,
                          }))
                        }
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          selectedPhoto.bgColor === item.id
                            ? 'border-cyan-600 bg-cyan-50/70 text-cyan-900 shadow-2xs ring-2 ring-cyan-500/20'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full ${item.colorClass} shadow-2xs`} />
                        <span className="truncate max-w-[80px]">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brightness & Contrast Controls */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">উজ্জ্বলতা (Brightness):</span>
                    <span className="text-slate-500 font-mono">{selectedPhoto.brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={selectedPhoto.brightness}
                    onChange={(e) =>
                      updatePhoto(selectedPhoto.id, () => ({
                        brightness: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-cyan-600 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-semibold text-slate-700">কনট্রাস্ট (Contrast):</span>
                    <span className="text-slate-500 font-mono">{selectedPhoto.contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={selectedPhoto.contrast}
                    onChange={(e) =>
                      updatePhoto(selectedPhoto.id, () => ({
                        contrast: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                {/* Single photo download */}
                <button
                  type="button"
                  onClick={handleDownloadSinglePhoto}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-600" />
                  শুধু এই একক ছবিটি ডাউনলোড করুন
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
                <Sliders className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">বাঁয়ের তালিকা থেকে যেকোনো ছবিতে ক্লিক করে সেটিংস পরিবর্তন করুন।</p>
              </div>
            )}
          </div>

          {/* =========================================================================
              RIGHT COLUMN: LIVE A4 PAGE PREVIEW & PRINT (4 COLS)
          ========================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            {/* Sheet Settings & Action Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-cyan-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    প্রিন্ট ও ডাউনলোড অপশন (A4 Sheet)
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {arrangedPages.length}টি পেজ রেডি
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>পিডিএফ ডাউনলোড (PDF - আসল স্কেল)</span>
                  </div>
                  <Download className="w-4 h-4 text-cyan-200 group-hover:translate-y-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPageJpg}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-2xs transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>জেপিজি ডাউনলোড (পৃষ্ঠা {activePageIndex + 1})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">৩০০ DPI</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectPrint}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-50 to-cyan-50 hover:from-indigo-100 hover:to-cyan-100 text-slate-800 border-2 border-indigo-200 rounded-2xl text-xs font-bold shadow-2xs transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <span>সরাসরি প্রিন্ট করুন (সব প্রিন্টার)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-500" />
                </button>
              </div>

              {/* Sheet Configuration Accordion */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                {/* Paper Size & Orientation */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      কাগজ (Paper):
                    </label>
                    <select
                      value={sheetSettings.paperSize}
                      onChange={(e) =>
                        setSheetSettings((s) => ({
                          ...s,
                          paperSize: e.target.value as any,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold"
                    >
                      <option value="A4">A4 (210×297 mm)</option>
                      <option value="A5">A5 (148×210 mm)</option>
                      <option value="Letter">Letter (8.5×11 in)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      বিন্যাস (Orientation):
                    </label>
                    <select
                      value={sheetSettings.orientation}
                      onChange={(e) =>
                        setSheetSettings((s) => ({
                          ...s,
                          orientation: e.target.value as any,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold"
                    >
                      <option value="portrait">লম্বালম্বি (Portrait)</option>
                      <option value="landscape">আড়াআড়ি (Landscape)</option>
                    </select>
                  </div>
                </div>

                {/* Margin and Gap Sliders */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-0.5">
                      <span>মার্জিন:</span>
                      <span>{sheetSettings.marginMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="20"
                      value={sheetSettings.marginMm}
                      onChange={(e) =>
                        setSheetSettings((s) => ({ ...s, marginMm: Number(e.target.value) }))
                      }
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-0.5">
                      <span>ছবি ব্যবধান:</span>
                      <span>{sheetSettings.gapMm} mm</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={sheetSettings.gapMm}
                      onChange={(e) =>
                        setSheetSettings((s) => ({ ...s, gapMm: Number(e.target.value) }))
                      }
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Toggles: Cut lines & Crop marks */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={sheetSettings.showCutBorder}
                      onChange={(e) =>
                        setSheetSettings((s) => ({ ...s, showCutBorder: e.target.checked }))
                      }
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>কাটার সুবিধার জন্য হালকা বর্ডার লাইন (Cut Border)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={sheetSettings.showCropMarks}
                      onChange={(e) =>
                        setSheetSettings((s) => ({ ...s, showCropMarks: e.target.checked }))
                      }
                      className="rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <span>প্রিন্ট কাটিং ক্রসহেয়ার মার্ক (Crop Marks)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Live Sheet Viewport */}
            <div className="bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-800 space-y-3">
              {/* Multi-Page Navigation Tabs */}
              <div className="flex items-center justify-between text-xs text-white">
                <span className="font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  লাইভ শিট প্রিভিউ
                </span>

                {arrangedPages.length > 1 && (
                  <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-0.5">
                    {arrangedPages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePageIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          activePageIndex === idx
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        পৃষ্ঠা {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Canvas viewport container */}
              <div className="bg-slate-950/70 rounded-2xl p-2 sm:p-4 flex items-center justify-center overflow-auto max-h-[500px]">
                <div
                  style={{
                    transform: `scale(${previewZoom / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="shadow-2xl bg-white inline-block border border-slate-300"
                >
                  <canvas
                    ref={sheetCanvasRef}
                    className="max-w-[280px] sm:max-w-[340px] h-auto block mx-auto bg-white"
                  />
                </div>
              </div>

              {/* Zoom & Page Summary */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  পৃষ্ঠা: {activePageIndex + 1} / {Math.max(1, arrangedPages.length)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.max(50, z - 15))}
                    className="p-1 hover:bg-slate-800 rounded-md text-slate-300"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono">{previewZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.min(150, z + 15))}
                    className="p-1 hover:bg-slate-800 rounded-md text-slate-300"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Printer Modal */}
      <StudioPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        pageImages={printPageImages}
        paperSize={sheetSettings.paperSize}
        orientation={sheetSettings.orientation}
        totalPhotos={photos.length}
        onDownloadPdf={handleDownloadPdf}
        onShowToast={onShowToast}
      />
    </div>
  );
};
