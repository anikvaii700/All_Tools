import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Home,
  Upload,
  Image as ImageIcon,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Download,
  Archive,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Trash2,
  ZoomIn,
  MoveVertical,
  HelpCircle,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import {
  loadImageFromFile,
  processApplicantPhoto,
  processApplicantSignature,
  ProcessedImageResult,
  PhotoCropSettings,
  triggerFileDownload,
  downloadBothAsZip,
} from './imageProcessor';

interface JobPhotoSignatureResizerProps {
  onBackToHub: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const JobPhotoSignatureResizer: React.FC<JobPhotoSignatureResizerProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  // Dimension & size limits configuration
  const [photoWidth, setPhotoWidth] = useState<number>(300);
  const [photoHeight, setPhotoHeight] = useState<number>(300);
  const [photoMaxKB, setPhotoMaxKB] = useState<number>(100);

  const [sigWidth, setSigWidth] = useState<number>(300);
  const [sigHeight, setSigHeight] = useState<number>(80);
  const [sigMaxKB, setSigMaxKB] = useState<number>(60);

  const [isCustomConfigOpen, setIsCustomConfigOpen] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<'teletalk' | 'custom'>('teletalk');

  // Photo state
  const [rawPhotoFile, setRawPhotoFile] = useState<File | null>(null);
  const [rawPhotoImg, setRawPhotoImg] = useState<HTMLImageElement | null>(null);
  const [photoCrop, setPhotoCrop] = useState<PhotoCropSettings>({ zoom: 1.0, offsetY: 0 });
  const [processedPhoto, setProcessedPhoto] = useState<ProcessedImageResult | null>(null);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isPhotoDragging, setIsPhotoDragging] = useState<boolean>(false);

  // Signature state
  const [rawSigFile, setRawSigFile] = useState<File | null>(null);
  const [rawSigImg, setRawSigImg] = useState<HTMLImageElement | null>(null);
  const [processedSig, setProcessedSig] = useState<ProcessedImageResult | null>(null);
  const [isSigProcessing, setIsSigProcessing] = useState<boolean>(false);
  const [sigError, setSigError] = useState<string | null>(null);
  const [isSigDragging, setIsSigDragging] = useState<boolean>(false);

  // ZIP packaging state
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  // Handle Preset changes
  const applyPreset = (preset: 'teletalk' | 'custom') => {
    setSelectedPreset(preset);
    if (preset === 'teletalk') {
      setPhotoWidth(300);
      setPhotoHeight(300);
      setPhotoMaxKB(100);
      setSigWidth(300);
      setSigHeight(80);
      setSigMaxKB(60);
      onShowToast('টেলিটক স্ট্যান্ডার্ড সেটিংস (৩০০x৩০০ এবং ৩০০x৮০) সেট করা হয়েছে', '⚙️');
    }
  };

  // Re-process photo whenever raw image or crop or dimensions change
  useEffect(() => {
    if (!rawPhotoImg) return;
    let isMounted = true;
    const runProcess = async () => {
      setIsPhotoProcessing(true);
      setPhotoError(null);
      try {
        const result = await processApplicantPhoto(
          rawPhotoImg,
          photoWidth,
          photoHeight,
          photoMaxKB,
          photoCrop
        );
        if (isMounted) {
          setProcessedPhoto(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setPhotoError(err.message || 'ছবি প্রসেস করতে ব্যর্থ হয়েছে।');
          setProcessedPhoto(null);
        }
      } finally {
        if (isMounted) {
          setIsPhotoProcessing(false);
        }
      }
    };
    runProcess();
    return () => {
      isMounted = false;
    };
  }, [rawPhotoImg, photoCrop, photoWidth, photoHeight, photoMaxKB]);

  // Re-process signature whenever raw image or dimensions change
  useEffect(() => {
    if (!rawSigImg) return;
    let isMounted = true;
    const runProcess = async () => {
      setIsSigProcessing(true);
      setSigError(null);
      try {
        const result = await processApplicantSignature(
          rawSigImg,
          sigWidth,
          sigHeight,
          sigMaxKB
        );
        if (isMounted) {
          setProcessedSig(result);
        }
      } catch (err: any) {
        if (isMounted) {
          setSigError(err.message || 'স্বাক্ষর প্রসেস করতে ব্যর্থ হয়েছে।');
          setProcessedSig(null);
        }
      } finally {
        if (isMounted) {
          setIsSigProcessing(false);
        }
      }
    };
    runProcess();
    return () => {
      isMounted = false;
    };
  }, [rawSigImg, sigWidth, sigHeight, sigMaxKB]);

  // Handle Photo selection
  const handlePhotoFile = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setPhotoError('শুধুমাত্র JPG, JPEG, PNG অথবা WEBP ফাইল আপলোড করুন।');
      return;
    }
    setPhotoError(null);
    setRawPhotoFile(file);
    try {
      const img = await loadImageFromFile(file);
      setRawPhotoImg(img);
      setPhotoCrop({ zoom: 1.0, offsetY: 0 });
      onShowToast('ছবি সফলভাবে লোড হয়েছে ও স্বয়ংক্রিয়ভাবে রিসাইজ করা হয়েছে!', '📸');
    } catch (err: any) {
      setPhotoError(err.message || 'ছবিটি পড়া সম্ভব হয়নি।');
    }
  };

  // Handle Signature selection
  const handleSigFile = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      setSigError('শুধুমাত্র JPG, JPEG, PNG অথবা WEBP ফাইল আপলোড করুন।');
      return;
    }
    setSigError(null);
    setRawSigFile(file);
    try {
      const img = await loadImageFromFile(file);
      setRawSigImg(img);
      onShowToast('স্বাক্ষর সফলভাবে লোড হয়েছে ও সঠিক মাপে প্রস্তুত করা হয়েছে!', '✍️');
    } catch (err: any) {
      setSigError(err.message || 'স্বাক্ষরটি পড়া সম্ভব হয়নি।');
    }
  };

  // Reset entire tool
  const handleResetAll = () => {
    setRawPhotoFile(null);
    setRawPhotoImg(null);
    setProcessedPhoto(null);
    setPhotoError(null);
    setPhotoCrop({ zoom: 1.0, offsetY: 0 });

    setRawSigFile(null);
    setRawSigImg(null);
    setProcessedSig(null);
    setSigError(null);

    if (photoInputRef.current) photoInputRef.current.value = '';
    if (sigInputRef.current) sigInputRef.current.value = '';

    onShowToast('সমস্ত আপলোড ও প্রসেসিং রিসেট করা হয়েছে।', '🔄');
  };

  // Download individual photo
  const handleDownloadPhoto = () => {
    if (!processedPhoto) return;
    triggerFileDownload(processedPhoto.blob, 'mosafa-job-photo.jpg');
    onShowToast('ছবি ডাউনলোড সম্পন্ন হয়েছে (mosafa-job-photo.jpg)!', '📥');
  };

  // Download individual signature
  const handleDownloadSig = () => {
    if (!processedSig) return;
    triggerFileDownload(processedSig.blob, 'mosafa-job-signature.jpg');
    onShowToast('স্বাক্ষর ডাউনলোড সম্পন্ন হয়েছে (mosafa-job-signature.jpg)!', '📥');
  };

  // Download both as ZIP
  const handleDownloadAllZip = async () => {
    if (!processedPhoto || !processedSig) return;
    setIsZipping(true);
    try {
      await downloadBothAsZip(
        processedPhoto.blob,
        processedSig.blob,
        'mosafa-job-application-files.zip'
      );
      onShowToast('ছবি ও স্বাক্ষর একসাথে ZIP ফাইলে ডাউনলোড হয়েছে!', '📦');
    } catch (err: any) {
      onShowToast('ZIP ফাইল তৈরিতে সমস্যা হয়েছে। আলাদাভাবে ডাউনলোড করুন।', '⚠️');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Universal Top Header with ONLY 2 Buttons: ১। "পিছনে যান" and ২। "হোম পেইজ" */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            {/* ১। পিছনে যান */}
            <button
              type="button"
              onClick={onBackToHub}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer border border-slate-200 shadow-2xs"
              title="পূর্ববর্তী পৃষ্ঠায় ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5] text-slate-700" />
              <span>পিছনে যান</span>
            </button>

            {/* ২। হোম পেইজ */}
            <button
              type="button"
              onClick={onBackToHub}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-xs"
              title="মূল হোম পেইজে ফিরে যান"
            >
              <Home className="w-4 h-4 stroke-[2.5] text-white" />
              <span>হোম পেইজ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>টেলিটক ও সকল সরকারি চাকরির নিয়োগ সহায়িকা</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            চাকরির আবেদন ছবি ও স্বাক্ষর রিসাইজার
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            এক ক্লিকেই সরকারি চাকরির আবেদনের ছবি ও স্বাক্ষর প্রস্তুত করুন। ছবি ও স্বাক্ষর আপলোড করুন, স্বয়ংক্রিয়ভাবে নির্ধারিত সাইজ ও কিলোবাইটে তৈরি হয়ে যাবে।
          </p>

          {/* Privacy Security Assurance Banner */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs mt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>আপনার ছবি ও স্বাক্ষর আপনার ডিভাইসের ব্রাউজারেই প্রসেস করা হয়। কোনো ছবি আমাদের সার্ভারে আপলোড করা হয় না।</span>
          </div>
        </div>

        {/* Configuration Bar (Custom Dimensions / Preset Selector) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">ডিফল্ট প্রিসেট:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset('teletalk')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedPreset === 'teletalk'
                      ? 'bg-white text-rose-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  টেলিটক স্ট্যান্ডার্ড (৩০০×৩০০ / ৩০০×৮০)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPreset('custom');
                    setIsCustomConfigOpen(true);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    selectedPreset === 'custom'
                      ? 'bg-white text-rose-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  কাস্টম সাইজ
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustomConfigOpen(!isCustomConfigOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-rose-500" />
                <span>অন্য সাইজ ব্যবহার করবেন?</span>
              </button>

              {(rawPhotoImg || rawSigImg) && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer border border-rose-200"
                  title="সব মুছে নতুন করে শুরু করুন"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>সব রিসেট</span>
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Custom Dimensions Form */}
          {isCustomConfigOpen && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in duration-200">
              {/* Photo Config */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                  <span>ছবির কাস্টম সাইজ</span>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">প্রস্থ (px)</label>
                    <input
                      type="number"
                      value={photoWidth}
                      onChange={(e) => {
                        setSelectedPreset('custom');
                        setPhotoWidth(Math.max(50, Number(e.target.value) || 300));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">উচ্চতা (px)</label>
                    <input
                      type="number"
                      value={photoHeight}
                      onChange={(e) => {
                        setSelectedPreset('custom');
                        setPhotoHeight(Math.max(50, Number(e.target.value) || 300));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">সর্বোচ্চ KB</label>
                    <input
                      type="number"
                      value={photoMaxKB}
                      onChange={(e) => {
                        setSelectedPreset('custom');
                        setPhotoMaxKB(Math.max(10, Number(e.target.value) || 100));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Signature Config */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                  <span>স্বাক্ষরের কাস্টম সাইজ</span>
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">প্রস্থ (px)</label>
                    <input
                      type="number"
                      value={sigWidth}
                      onChange={(e) => {
                        setSelectedPreset('custom');
                        setSigWidth(Math.max(50, Number(e.target.value) || 300));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">উচ্চতা (px)</label>
                    <input
                      type="number"
                      value={sigHeight}
                      onChange={(e) => {
                        setSelectedPreset('custom');
                        setSigHeight(Math.max(20, Number(e.target.value) || 80));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">সর্বোচ্চ KB</label>
                    <input
                      type="number"
                      value={sigMaxKB}
                      onChange={(e) => {
                        setSelectedPreset('custom');
                        setSigMaxKB(Math.max(5, Number(e.target.value) || 60));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TWO LARGE UPLOAD SECTIONS SIDE BY SIDE ON DESKTOP, VERTICAL ON MOBILE     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* ================= SECTION A: PHOTO UPLOAD ================= */}
          <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-rose-400 transition-colors">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      ১. আপনার ছবি আপলোড করুন
                    </h2>
                    <p className="text-xs text-slate-500">রঙিন ছবি (পাসপোর্ট সাইজ)</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-[11px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-lg">
                    {photoWidth} × {photoHeight} px
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">সর্বোচ্চ {photoMaxKB} KB (JPG)</div>
                </div>
              </div>

              {/* Upload Drop Zone / Preview */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoFile(file);
                }}
              />

              {!rawPhotoImg ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsPhotoDragging(true);
                  }}
                  onDragLeave={() => setIsPhotoDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsPhotoDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handlePhotoFile(file);
                  }}
                  onClick={() => photoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer min-h-[260px] ${
                    isPhotoDragging
                      ? 'border-rose-500 bg-rose-50/60 scale-[0.99]'
                      : 'border-slate-300 hover:border-rose-400 hover:bg-slate-50/80 bg-slate-50/40'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-slate-800">
                      ছবি এখানে টেনে আনুন বা ক্লিক করে আপলোড করুন
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      JPG, JPEG, PNG অথবা WEBP ফরম্যাট সমর্থিত
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs shadow-xs hover:from-rose-500">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ছবি নির্বাচন করুন</span>
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Photo Preview Box */}
                  <div className="relative rounded-2xl bg-slate-100 border border-slate-200 p-4 flex flex-col items-center justify-center min-h-[240px]">
                    {isPhotoProcessing ? (
                      <div className="flex flex-col items-center gap-2 text-rose-600">
                        <RefreshCw className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-bold">ছবি প্রসেস হচ্ছে...</span>
                      </div>
                    ) : processedPhoto ? (
                      <div className="flex flex-col items-center">
                        <div className="relative group">
                          <img
                            src={processedPhoto.dataUrl}
                            alt="Processed applicant"
                            className="w-48 h-48 object-cover rounded-xl border-2 border-slate-300 shadow-md bg-white"
                          />
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>প্রস্তুত</span>
                          </div>
                        </div>

                        {/* File stats info */}
                        <div className="mt-3 flex items-center gap-3 text-xs">
                          <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-bold">
                            {processedPhoto.width} × {processedPhoto.height} px
                          </span>
                          <span
                            className={`font-mono px-2.5 py-1 rounded-lg border font-bold ${
                              processedPhoto.sizeKB <= photoMaxKB
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            সাইজ: {processedPhoto.sizeKB} KB {processedPhoto.sizeKB <= photoMaxKB ? '✓' : '⚠️'}
                          </span>
                          <span className="font-bold text-slate-500 uppercase">
                            JPG
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Photo Crop Adjustment Slider (To adjust face height) */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <MoveVertical className="w-3.5 h-3.5 text-rose-500" />
                        <span>চেহারা উপরে/নিচে সামঞ্জস্য করুন:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setPhotoCrop({ zoom: 1.0, offsetY: 0 })}
                        className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                      >
                        রিসেট ক্রপ
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>পজিশন</span>
                          <span className="font-mono">{photoCrop.offsetY > 0 ? `+${photoCrop.offsetY}` : photoCrop.offsetY}</span>
                        </div>
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          value={photoCrop.offsetY}
                          onChange={(e) =>
                            setPhotoCrop((prev) => ({ ...prev, offsetY: Number(e.target.value) }))
                          }
                          className="w-full accent-rose-600 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>জুম</span>
                          <span className="font-mono">{photoCrop.zoom.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="1.8"
                          step="0.05"
                          value={photoCrop.zoom}
                          onChange={(e) =>
                            setPhotoCrop((prev) => ({ ...prev, zoom: Number(e.target.value) }))
                          }
                          className="w-full accent-rose-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Replace & Remove buttons */}
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ছবি পরিবর্তন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRawPhotoFile(null);
                        setRawPhotoImg(null);
                        setProcessedPhoto(null);
                        if (photoInputRef.current) photoInputRef.current.value = '';
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>মুছুন</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error message */}
              {photoError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{photoError}</span>
                </div>
              )}
            </div>

            {/* Bottom Target Specs Summary */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>লক্ষ্যমাত্রা: {photoWidth} × {photoHeight} Pixel</span>
              <span>সর্বোচ্চ: {photoMaxKB} KB (JPG)</span>
            </div>
          </div>

          {/* ================= SECTION B: SIGNATURE UPLOAD ================= */}
          <div className="bg-white rounded-3xl border-2 border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-colors">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      ২. আপনার স্বাক্ষর আপলোড করুন
                    </h2>
                    <p className="text-xs text-slate-500">সাদা কাগজে স্পষ্ট স্বাক্ষর</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-lg">
                    {sigWidth} × {sigHeight} px
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">সর্বোচ্চ {sigMaxKB} KB (JPG)</div>
                </div>
              </div>

              {/* Upload Drop Zone / Preview */}
              <input
                ref={sigInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleSigFile(file);
                }}
              />

              {!rawSigImg ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsSigDragging(true);
                  }}
                  onDragLeave={() => setIsSigDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsSigDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleSigFile(file);
                  }}
                  onClick={() => sigInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer min-h-[260px] ${
                    isSigDragging
                      ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
                      : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80 bg-slate-50/40'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-slate-800">
                      স্বাক্ষর এখানে টেনে আনুন বা ক্লিক করে আপলোড করুন
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      JPG, JPEG, PNG অথবা WEBP ফরম্যাট সমর্থিত
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xs hover:from-indigo-500">
                    <Upload className="w-3.5 h-3.5" />
                    <span>স্বাক্ষর নির্বাচন করুন</span>
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Signature Preview Box */}
                  <div className="relative rounded-2xl bg-slate-100 border border-slate-200 p-4 flex flex-col items-center justify-center min-h-[240px]">
                    {isSigProcessing ? (
                      <div className="flex flex-col items-center gap-2 text-indigo-600">
                        <RefreshCw className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-bold">স্বাক্ষর প্রসেস হচ্ছে...</span>
                      </div>
                    ) : processedSig ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="relative group w-full max-w-sm flex justify-center">
                          <img
                            src={processedSig.dataUrl}
                            alt="Processed applicant signature"
                            className="w-full max-w-[300px] h-20 object-contain rounded-xl border-2 border-slate-300 shadow-md bg-white p-1"
                          />
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>প্রস্তুত</span>
                          </div>
                        </div>

                        {/* File stats info */}
                        <div className="mt-3 flex items-center gap-3 text-xs">
                          <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-bold">
                            {processedSig.width} × {processedSig.height} px
                          </span>
                          <span
                            className={`font-mono px-2.5 py-1 rounded-lg border font-bold ${
                              processedSig.sizeKB <= sigMaxKB
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            সাইজ: {processedSig.sizeKB} KB {processedSig.sizeKB <= sigMaxKB ? '✓' : '⚠️'}
                          </span>
                          <span className="font-bold text-slate-500 uppercase">
                            JPG
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Signature Info note */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>স্বাক্ষরের কোনো অংশ ক্রপ করা হয়নি এবং পেছনের ব্যাকগ্রাউন্ড সম্পূর্ণ সাদা রাখা হয়েছে।</span>
                  </div>

                  {/* Replace & Remove buttons */}
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => sigInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>স্বাক্ষর পরিবর্তন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRawSigFile(null);
                        setRawSigImg(null);
                        setProcessedSig(null);
                        if (sigInputRef.current) sigInputRef.current.value = '';
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>মুছুন</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error message */}
              {sigError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{sigError}</span>
                </div>
              )}
            </div>

            {/* Bottom Target Specs Summary */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>লক্ষ্যমাত্রা: {sigWidth} × {sigHeight} Pixel</span>
              <span>সর্বোচ্চ: {sigMaxKB} KB (JPG)</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* READY OUTPUT & DOWNLOAD SECTION                                           */}
        {/* ========================================================================= */}
        {(processedPhoto || processedSig) && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span>ডাউনলোডের জন্য প্রস্তুত ফাইলসমূহ</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  নির্ধারিত পোর্টালে সরাসরি আপলোডের উপযোগী ফাইল
                </p>
              </div>

              {/* Both Ready: Download All (ZIP) Button */}
              {processedPhoto && processedSig && (
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  disabled={isZipping}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-md transition active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  <Archive className="w-4 h-4" />
                  <span>{isZipping ? 'ZIP তৈরি হচ্ছে...' : 'দুটি ফাইল একসাথে ডাউনলোড করুন (ZIP)'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ready Photo Card */}
              {processedPhoto && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={processedPhoto.dataUrl}
                    alt="Ready photo preview"
                    className="w-24 h-24 object-cover rounded-xl border border-slate-300 bg-white shrink-0 shadow-xs"
                  />
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">আবেদনকারীর ছবি</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      <span>{processedPhoto.width} × {processedPhoto.height} px</span> • <span>{processedPhoto.sizeKB} KB</span> • <span>JPG</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      mosafa-job-photo.jpg
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleDownloadPhoto}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ছবি ডাউনলোড করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Ready Signature Card */}
              {processedSig && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 flex items-center justify-center bg-white rounded-xl border border-slate-300 p-1 shrink-0 shadow-xs">
                    <img
                      src={processedSig.dataUrl}
                      alt="Ready signature preview"
                      className="w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">আবেদনকারীর স্বাক্ষর</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      <span>{processedSig.width} × {processedSig.height} px</span> • <span>{processedSig.sizeKB} KB</span> • <span>JPG</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      mosafa-job-signature.jpg
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleDownloadSig}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>স্বাক্ষর ডাউনলোড করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teletalk & Government Job Application Rules / Checklist */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-rose-500" />
            <span>টেলিটক ও সরকারি চাকরির আবেদন সংক্রান্ত গুরুত্বপূর্ণ তথ্য ও নিয়মাবলী</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm text-slate-600">
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>আবেদনকারীর ছবির ক্ষেত্রে:</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>ছবি অবশ্যই রঙিন ও স্পষ্ট হতে হবে (সাদা-কালো গ্রহণযোগ্য নয়)।</li>
                <li>কালো বা রঙ্গিন চশমা পরে ছবি তোলা থেকে বিরত থাকুন।</li>
                <li>মুখমণ্ডল ও উভয় কান স্পষ্ট দৃশ্যমান হতে হবে।</li>
                <li>পেছনের ব্যাকগ্রাউন্ড হালকা একরঙা (সাদা বা হালকা নীল) হওয়া বাঞ্ছনীয়।</li>
                <li>টেলিটকের সাধারণ মাপ: ৩০০ × ৩০০ পিক্সেল এবং সাইজ ১০০ KB এর কম।</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>আবেদনকারীর স্বাক্ষরের ক্ষেত্রে:</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                <li>সাদা কাগজের উপর কালো বা নীল কালির স্পষ্ট স্বাক্ষর হতে হবে।</li>
                <li>স্বাক্ষরের ছবি তোলার সময় ছায়া বা অন্ধকার এড়িয়ে চলুন।</li>
                <li>স্বাক্ষরের কোনো অংশ যাতে কেটে না যায় সেজন্য স্বয়ংক্রিয়ভাবে মার্জিন সহ সাইজ করা হয়।</li>
                <li>টেলিটকের সাধারণ মাপ: ৩০০ × ৮০ পিক্সেল এবং সাইজ ৬০ KB এর কম।</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
