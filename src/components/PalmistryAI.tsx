import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  RotateCw,
  Sparkles,
  Heart,
  Brain,
  ShieldCheck,
  Share2,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Flame,
  Star,
  Compass,
  FileText,
  SwitchCamera,
  X,
  Maximize2,
} from 'lucide-react';
import html2canvas from 'html2canvas';

export interface PalmLineResult {
  name: string;
  englishName: string;
  visibility: 'স্পষ্ট' | 'আংশিক স্পষ্ট' | 'অস্পষ্ট';
  interpretation: string;
  details: string;
}

export interface PalmistryAnalysisResult {
  success: boolean;
  isAiAvailable?: boolean;
  overview: string;
  heartLine: PalmLineResult;
  headLine: PalmLineResult;
  lifeLine: PalmLineResult;
  fateLine: PalmLineResult;
  personalityReading: string;
  loveReading: string;
  careerReading: string;
  palmStorySummary: string;
  luckyNumber: number;
  luckyColor: string;
  vibeScore: number;
}

interface PalmistryAIProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const PalmistryAI: React.FC<PalmistryAIProps> = ({ onBackToHub, onShowToast }) => {
  // Input mode & User details
  const [userName, setUserName] = useState('');
  const [handSide, setHandSide] = useState<'right' | 'left'>('right');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageRotation, setImageRotation] = useState<number>(0);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Processing & Results
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzingStepIndex, setAnalyzingStepIndex] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<PalmistryAnalysisResult | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const resultCardRef = useRef<HTMLDivElement | null>(null);

  const analyzingSteps = [
    'হাতের তালুর প্রতিচ্ছবি প্রসেসিং হচ্ছে...',
    'হৃদয় রেখা (Heart Line) স্ক্যান করা হচ্ছে...',
    'মস্তিষ্ক রেখা (Head Line) বিশ্লেষণ চলছে...',
    'জীবন রেখা ও ভাগ্য রেখার গতিপথ পর্যবেক্ষণ...',
    'ব্যক্তিত্ব ও জীবনের অনুপ্রেরণামূলক গল্প তৈরি হচ্ছে...',
  ];

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start Camera
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('আপনার ব্রাউজারে লাইভ ক্যামেরা সাপোর্ট পাওয়া যায়নি। অনুগ্রহ করে ছবি আপলোড অপশন ব্যবহার করুন।');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera Access Error:', err);
      let errorMsg = 'ক্যামেরা চালু করা সম্ভব হয়নি। অনুগ্রহ করে ব্রাউজারে ক্যামেরার অনুমতি দিন অথবা সরাসরি ছবি আপলোড করুন।';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'ক্যামেরার অনুমতি প্রত্যাখ্যাত হয়েছে। ব্রাউজার সেটিংসে ক্যামেরার পারমিশন অন করুন অথবা ছবি আপলোড করুন।';
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
    }
  };

  // Switch between front & rear camera
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame from video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if using front/user camera for natural reflection
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelectedImage(dataUrl);
    setImageRotation(0);
    stopCamera();
    onShowToast('হাতের ছবি সফলভাবে তোলা হয়েছে! 📸', '✅');
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) আপলোড করুন।', '⚠️');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedImage(result);
        setImageRotation(0);
        onShowToast('ছবি আপলোড সম্পন্ন হয়েছে! 📁', '✅');
      }
    };
    reader.readAsDataURL(file);
  };

  // Rotate image by 90 degrees clockwise
  const handleRotate = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  // Reset/Clear image
  const handleResetImage = () => {
    setSelectedImage(null);
    setImageRotation(0);
    setAnalysisResult(null);
    stopCamera();
  };

  // Run AI Palm Analysis
  const handleAnalyzePalm = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalyzingStepIndex(0);

    // Rotate status messages every 1.5 seconds
    const interval = setInterval(() => {
      setAnalyzingStepIndex((prev) => (prev + 1) % analyzingSteps.length);
    }, 1400);

    try {
      // If rotated, bake rotation into image before sending
      let finalImageBase64 = selectedImage;
      if (imageRotation !== 0) {
        finalImageBase64 = await new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(selectedImage);

            if (imageRotation === 90 || imageRotation === 270) {
              canvas.width = img.height;
              canvas.height = img.width;
            } else {
              canvas.width = img.width;
              canvas.height = img.height;
            }

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((imageRotation * Math.PI) / 180);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          };
          img.src = selectedImage;
        });
      }

      const response = await fetch('/api/palmistry/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: finalImageBase64,
          imageMimeType: 'image/jpeg',
          handSide,
          userName: userName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('সার্ভার থেকে বিশ্লেষণ আনতে সমস্যা হয়েছে।');
      }

      const data: PalmistryAnalysisResult = await response.json();
      if (!data.success) {
        throw new Error((data as any).error || 'বিশ্লেষণ সম্পন্ন করা সম্ভব হয়নি।');
      }

      setAnalysisResult(data);
      onShowToast('হস্তরেখা বিশ্লেষণ সম্পন্ন হয়েছে! 🌟', '🖐️');
    } catch (err: any) {
      console.error('Palm Analysis Error:', err);
      onShowToast(err.message || 'বিশ্লেষণ প্রক্রিয়াকরণে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।', '⚠️');
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  // Share Result via Web Share API or Clipboard
  const handleShare = async () => {
    if (!analysisResult) return;

    const shareText =
      `🖐️ *MoSaFa Palmistry AI — হস্তরেখা বিশ্লেষণ*\n` +
      `👤 নাম: ${userName || 'সম্মানিত অতিথি'}\n` +
      `✋ হাত: ${handSide === 'right' ? 'ডান হাত' : 'বাম হাত'}\n` +
      `🌟 ভাইব স্কোর: ${analysisResult.vibeScore}%\n\n` +
      `❤️ *হৃদয় রেখা:* ${analysisResult.heartLine.interpretation}\n\n` +
      `🧠 *মস্তিষ্ক রেখা:* ${analysisResult.headLine.interpretation}\n\n` +
      `🌿 *জীবন রেখা:* ${analysisResult.lifeLine.interpretation}\n\n` +
      `⭐ *ভাগ্য রেখা:* ${analysisResult.fateLine.interpretation}\n\n` +
      `📜 *হাতের গল্প:* ${analysisResult.palmStorySummary}\n\n` +
      `লিংক: ${window.location.origin}/?tool=palmistry-ai`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MoSaFa Palmistry AI - হস্তরেখা বিশ্লেষণ',
          text: shareText,
          url: `${window.location.origin}/?tool=palmistry-ai`,
        });
        onShowToast('সফলভাবে শেয়ার করা হয়েছে! 🚀', '📤');
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      onShowToast('হস্তরেখার ফলাফল ক্লিপবোর্ডে কপি হয়েছে! 📋', '✅');
    } catch {
      onShowToast('কপি করতে সমস্যা হয়েছে।', '⚠️');
    }
  };

  // Download Card as PNG
  const handleDownloadCard = async () => {
    if (!resultCardRef.current) return;
    setIsDownloading(true);
    onShowToast('ফলাফল কার্ড ডাউনলোড প্রস্তুত হচ্ছে... ⏳', '📸');

    try {
      const card = resultCardRef.current;
      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `MoSaFa-Palmistry-${userName || 'Reading'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      onShowToast('কার্ড সফলভাবে ডাউনলোড হয়েছে! 📥', '🎉');
    } catch (err) {
      console.error('Download error:', err);
      onShowToast('ডাউনলোড করতে সমস্যা হয়েছে।', '⚠️');
    } finally {
      setIsDownloading(false);
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    if (visibility === 'স্পষ্ট') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>স্পষ্ট রেখা</span>
        </span>
      );
    }
    if (visibility === 'আংশিক স্পষ্ট') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>আংশিক দৃশ্যমান</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
        <HelpCircle className="w-3 h-3 text-slate-500" />
        <span>অস্পষ্ট / মৃদু রেখা</span>
      </span>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 py-5 sm:py-8 font-sans">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          type="button"
          onClick={onBackToHub}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল টুলস</span>
        </button>

        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          The MoSaFa Tools • AI হস্তরেখা
        </span>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold mb-3 shadow-2xs">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span>MoSaFa Palmistry AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>এআই হস্তরেখা রিডার</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          MoSaFa Palmistry AI
        </h1>
        <p className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 mt-1">
          “আপনার হাতের রেখায় লুকানো গল্প!”
        </p>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mt-2 max-w-xl mx-auto">
          ক্যামেরায় হাতের ছবি তুলুন বা গ্যালারি থেকে আপলোড করুন। কৃত্রিম বুদ্ধিমত্তা আপনার হৃদয় রেখা, মস্তিষ্ক রেখা, জীবন রেখা ও ভাগ্য রেখা বিশ্লেষণ করে ব্যক্তিত্বের চমকপ্রদ উপাখ্যান তুলে ধরবে।
        </p>

        {/* Mandatory Transparency Disclaimer Box */}
        <div className="mt-4 p-3 sm:p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 text-left text-[11px] sm:text-xs text-amber-900 leading-relaxed font-medium flex items-start gap-2.5 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-950 block mb-0.5">স্বচ্ছতা ও বিনোদন সতর্কতা:</strong>
            এই ফলাফল হস্তরেখাবিদ্যার প্রচলিত প্রতীকী ব্যাখ্যা ও অনুপ্রেরণামূলক বিনোদনের জন্য তৈরি। হাতের রেখা দেখে ভবিষ্যৎ, আয়ু, স্বাস্থ্য, অর্থ বা সম্পর্ক নির্ভরযোগ্য বা বৈজ্ঞানিকভাবে নির্ধারণ করা যায় না।
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      {!analysisResult ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-4 sm:p-7 md:p-8 space-y-6">
          {/* User Details Form: Optional Name & Hand Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                আপনার নাম (ঐচ্ছিক):
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="যেমন: অনিক আহমেদ / সুমাইয়া"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                কোন হাতের তালু স্ক্যান করবেন?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHandSide('right')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    handSide === 'right'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>ডান হাত ✋</span>
                  <span className="text-[10px] opacity-80">(বর্তমান ও কর্ম)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHandSide('left')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    handSide === 'left'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>বাম হাত 🤚</span>
                  <span className="text-[10px] opacity-80">(সহজাত মেধা)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Guideline Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
            <span className="text-lg">💡</span>
            <div>
              <strong className="text-slate-800 font-bold block mb-0.5">নির্ভুল স্ক্যানের টিপস:</strong>
              হাতের তালু পরিষ্কার আলোতে রাখুন। আঙুলগুলো স্বাভাবিকভাবে ছড়িয়ে রাখুন এবং পুরো তালু ছবিতে রাখুন।
            </div>
          </div>

          {/* Live Camera View */}
          {isCameraActive && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="relative w-full max-w-lg mx-auto aspect-[3/4] sm:aspect-square bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400/80 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover"
                />

                {/* Palm Silhouette Guideline Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-56 h-72 sm:w-64 sm:h-80 border-2 border-dashed border-amber-400/70 rounded-full flex items-center justify-center relative shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                    {/* Visual Hand Silhouette SVG Guide */}
                    <svg
                      viewBox="0 0 100 130"
                      className="w-44 h-56 text-amber-400/35 stroke-current fill-amber-400/10 stroke-[1.2]"
                    >
                      <path d="M50,120 C35,120 28,105 28,85 L28,50 C28,45 32,45 32,50 L32,70 C32,72 35,72 35,70 L35,32 C35,27 39,27 39,32 L39,65 C39,67 42,67 42,65 L42,20 C42,15 47,15 47,20 L47,65 C47,67 50,67 50,65 L50,26 C50,21 55,21 55,26 L55,68 C55,70 58,70 58,68 L58,38 C58,33 63,33 63,38 L63,75 C63,85 70,85 70,75 L70,55 C70,50 75,50 75,55 C75,90 70,120 50,120 Z" />
                    </svg>

                    <div className="absolute top-2 inset-x-0 text-center">
                      <span className="text-[10px] bg-black/60 text-amber-300 px-2 py-0.5 rounded-full backdrop-blur-xs font-bold border border-amber-400/30">
                        তালু ফ্রেমে রাখুন
                      </span>
                    </div>
                  </div>
                </div>

                {/* Camera Top Controls */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20">
                  <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    লাইভ ক্যামেরা
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
                      title="ক্যামেরা পরিবর্তন (Front / Back)"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="w-8 h-8 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
                      title="ক্যামেরা বন্ধ করুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Shutter Capture Button */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center z-20">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-16 h-16 rounded-full bg-white hover:bg-amber-100 p-1.5 shadow-2xl transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer border-4 border-amber-500"
                    title="ছবি তুলুন"
                  >
                    <div className="w-full h-full rounded-full bg-amber-500 flex items-center justify-center text-white">
                      <Camera className="w-6 h-6" />
                    </div>
                  </button>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="text-xs font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer"
                >
                  ক্যামেরা বন্ধ করে আপলোড অপশনে ফিরুন
                </button>
              </div>
            </div>
          )}

          {/* Camera Error Display */}
          {cameraError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">{cameraError}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
                  >
                    আবার চেষ্টা করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 rounded-lg bg-white border border-rose-300 text-rose-700 text-xs font-bold hover:bg-rose-50 transition"
                  >
                    সরাসরি ছবি আপলোড করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image Selection Buttons (If no image selected yet and camera inactive) */}
          {!selectedImage && !isCameraActive && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option 1: Live Camera */}
              <button
                type="button"
                onClick={() => startCamera()}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-amber-500/10 via-orange-500/10 to-amber-50 border-2 border-amber-300 hover:border-amber-500 hover:shadow-lg transition-all duration-200 text-left group cursor-pointer active:scale-98 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    ১. লাইভ ক্যামেরা দিয়ে তুলুন
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                    মোবাইল বা ওয়েবক্যাম ওপেন করে সরাসরি হাতের তালু ফ্রেমের মধ্যে রেখে এক ক্লিকে স্পষ্ট ছবি তুলুন।
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-amber-700 group-hover:translate-x-1 transition">
                  <span>ক্যামেরা ওপেন করুন</span>
                  <span>→</span>
                </div>
              </button>

              {/* Option 2: Upload File */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-purple-50/20 border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:shadow-lg transition-all duration-200 text-left group cursor-pointer active:scale-98 flex flex-col justify-between"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    ২. গ্যালারি থেকে ছবি আপলোড
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                    ফোনের গ্যালারি বা কম্পিউটার থেকে হাতের তালুর যেকোনো সেভ করা পরিষ্কার ছবি আপলোড করুন (JPG, PNG, WebP)।
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-indigo-700 group-hover:translate-x-1 transition">
                  <span>ছবি বেছে নিন 📁</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          )}

          {/* Selected Image Preview & Action Panel */}
          {selectedImage && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="max-w-md mx-auto bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-800 text-white relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>হাতের ছবি প্রস্তুত</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="ছবি ঘোরান (Rotate 90°)"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>ঘোরান ({imageRotation}°)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetImage}
                      className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 flex items-center justify-center transition cursor-pointer"
                      title="ছবি পরিবর্তন করুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Image Container with Dynamic Rotation */}
                <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden rounded-2xl bg-black mt-3 flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Captured Palm"
                    style={{ transform: `rotate(${imageRotation}deg)` }}
                    className="max-h-full max-w-full object-contain transition-transform duration-300"
                  />

                  {/* Scanning Animation Overlay when Analyzing */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-500/20 via-transparent to-amber-500/20 flex flex-col justify-between">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce" />
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent shadow-[0_0_15px_#f43f5e] animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="pt-3 text-center text-[11px] text-slate-400">
                  <span>হাত: {handSide === 'right' ? 'ডান হাত' : 'বাম হাত'}</span>
                  {userName && <span> • নাম: {userName}</span>}
                </div>
              </div>

              {/* Action Buttons: Retake vs Analyze */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleResetImage}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>অন্য ছবি তুলুন / পরিবর্তন</span>
                </button>

                <button
                  type="button"
                  onClick={handleAnalyzePalm}
                  disabled={isAnalyzing}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" />
                  <span>{isAnalyzing ? 'বিশ্লেষণ চলছে...' : 'হাতের রেখা বিশ্লেষণ করুন'}</span>
                </button>
              </div>

              {/* Analyzing Status Messages */}
              {isAnalyzing && (
                <div className="text-center p-4 max-w-md mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 animate-in fade-in">
                  <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold">{analyzingSteps[analyzingStepIndex]}</p>
                  <p className="text-[10px] text-amber-700 mt-1">
                    কৃত্রিম বুদ্ধিমত্তা আপনার হাতের রেখাসমূহ পুঙ্খানুপুঙ্খভাবে পর্যবেক্ষণ করছে...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ================= RESULTS VIEW ================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Action Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={handleResetImage}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>নতুন হাত স্ক্যান করুন</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 border border-indigo-200"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>রেজাল্ট শেয়ার</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={isDownloading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'ডাউনলোড হচ্ছে...' : 'কার্ড ডাউনলোড (PNG)'}</span>
              </button>
            </div>
          </div>

          {/* Printable & Shareable Result Card Container */}
          <div
            ref={resultCardRef}
            className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-[32px] p-5 sm:p-8 md:p-10 shadow-2xl border border-slate-800 space-y-7 relative overflow-hidden"
          >
            {/* Background Decorative Starfield & Aura */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

            {/* Header Badge & Brand Row */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/20">
                  🖐️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight text-white">
                    MoSaFa Palmistry AI
                  </h3>
                  <p className="text-[11px] text-amber-400 font-medium">
                    হস্তরেখা ও চারিত্রিক বিশ্লেষণ সনদ
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2.5 py-1 rounded-full border border-amber-500/30 font-bold block">
                  ভাইব ইনডেক্স: {analysisResult.vibeScore}%
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {handSide === 'right' ? 'ডান হাত' : 'বাম হাত'}
                </span>
              </div>
            </div>

            {/* Overview & Quick Meta Banner */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative z-10">
              {selectedImage && (
                <div className="md:col-span-3 flex justify-center">
                  <div className="w-28 h-36 rounded-xl overflow-hidden border border-amber-500/40 shadow-md bg-black">
                    <img
                      src={selectedImage}
                      alt="Palm Scan"
                      style={{ transform: `rotate(${imageRotation}deg)` }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className={`${selectedImage ? 'md:col-span-9' : 'md:col-span-12'} space-y-2.5`}>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-300">নাম:</span>
                  <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {userName || 'সম্মানিত অতিথি'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">শুভ সংখ্যা:</span>
                  <span className="font-bold text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {analysisResult.luckyNumber}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">শুভ রং:</span>
                  <span className="font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {analysisResult.luckyColor}
                  </span>
                </div>

                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-medium">
                  {analysisResult.overview}
                </p>
              </div>
            </div>

            {/* ================= 4 CORE PALM LINES CARDS ================= */}
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>৪টি প্রধান হস্তরেখা বিশ্লেষণ (Core Palm Lines)</span>
                </h4>
                <span className="text-[10px] text-slate-400">এআই অপটিক্যাল ডিটেকশন</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Heart Line */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <Heart className="w-4 h-4 fill-rose-500/30" />
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-white">
                        {analysisResult.heartLine.name}
                      </span>
                    </div>
                    {getVisibilityBadge(analysisResult.heartLine.visibility)}
                  </div>
                  <p className="text-xs text-rose-100/90 leading-relaxed font-medium">
                    {analysisResult.heartLine.interpretation}
                  </p>
                  <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5 font-normal">
                    {analysisResult.heartLine.details}
                  </p>
                </div>

                {/* 2. Head Line */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Brain className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-white">
                        {analysisResult.headLine.name}
                      </span>
                    </div>
                    {getVisibilityBadge(analysisResult.headLine.visibility)}
                  </div>
                  <p className="text-xs text-indigo-100/90 leading-relaxed font-medium">
                    {analysisResult.headLine.interpretation}
                  </p>
                  <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5 font-normal">
                    {analysisResult.headLine.details}
                  </p>
                </div>

                {/* 3. Life Line */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Compass className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-white">
                        {analysisResult.lifeLine.name}
                      </span>
                    </div>
                    {getVisibilityBadge(analysisResult.lifeLine.visibility)}
                  </div>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                    {analysisResult.lifeLine.interpretation}
                  </p>
                  <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5 font-normal">
                    {analysisResult.lifeLine.details}
                  </p>
                </div>

                {/* 4. Fate Line */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Star className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-white">
                        {analysisResult.fateLine.name}
                      </span>
                    </div>
                    {getVisibilityBadge(analysisResult.fateLine.visibility)}
                  </div>
                  <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                    {analysisResult.fateLine.interpretation}
                  </p>
                  <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5 font-normal">
                    {analysisResult.fateLine.details}
                  </p>
                </div>
              </div>
            </div>

            {/* ================= IN-DEPTH READINGS ================= */}
            <div className="space-y-4 pt-2 relative z-10">
              <h4 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>জীবন ও ব্যক্তিত্বের অন্তর্দর্শন (In-depth Readings)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Personality */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <span>🌟</span>
                    <span>ব্যক্তিত্বের উন্মোচন</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {analysisResult.personalityReading}
                  </p>
                </div>

                {/* Love & Relationship */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                    <span>💖</span>
                    <span>প্রেম ও সম্পর্ক ভাবনা</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {analysisResult.loveReading}
                  </p>
                </div>

                {/* Career & Opportunity */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <span>💼</span>
                    <span>কর্মজীবন ও ক্যারিয়ার</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {analysisResult.careerReading}
                  </p>
                </div>
              </div>

              {/* Your Palm's Story Summary */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📜</span>
                  <h5 className="text-xs sm:text-sm font-black text-amber-300">
                    আপনার হাতের বিশেষ গল্প (Your Palm’s Story)
                  </h5>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {analysisResult.palmStorySummary}
                </p>
              </div>
            </div>

            {/* Footer Disclaimer & Branding */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 relative z-10">
              <span>The MoSaFa Tools • https://themedosafe.blogspot.com/</span>
              <span>⚠️ ফলাফলটি কেবল অনুপ্রেরণামূলক ও বিনোদনের জন্য প্রস্তুতকৃত</span>
            </div>
          </div>

          {/* Bottom Floating Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetImage}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>পুনরায় স্ক্যান করুন</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>বন্ধুদের সাথে শেয়ার করুন</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'ডাউনলোড হচ্ছে...' : 'কার্ড সংরক্ষণ (Download PNG)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
