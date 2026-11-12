import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Palette,
  Camera,
  Download,
  Printer,
  FileText,
  RotateCw,
  Plus,
  Minus,
  Sparkles,
  ChevronLeft,
  ArrowRight,
  Eye,
  Sliders,
  CheckCircle2,
  Trash2,
  Layers,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { StudioBgColor } from './photoStudioTypes';
import { createDemoStudioPhotoFile } from './clientImageProcessor';

interface StudioBackgroundEditorProps {
  onBackToDashboard: () => void;
  onSendToPrintSheet?: (file: File, bgColor: StudioBgColor) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

const BG_COLOR_OPTIONS: { id: StudioBgColor; name: string; hex: string; desc: string }[] = [
  { id: '#ffffff', name: 'স্টুডিও হোয়াইট', hex: '#ffffff', desc: 'অফিসিয়াল ও ভিসা আবেদনের জন্য প্রমিত সাদা' },
  { id: '#0284c7', name: 'পাসপোর্ট ব্লু', hex: '#0284c7', desc: 'বাংলাদেশ ও আন্তর্জাতিক চাকরির ছবির প্রমিত নীল' },
  { id: '#0369a1', name: 'রয়্যাল নেভি', hex: '#0369a1', desc: 'ডিপ ব্লু প্রফেশনাল করপোরেট ব্যাকগ্রাউন্ড' },
  { id: '#e0f2fe', name: 'সফট স্কাই', hex: '#e0f2fe', desc: 'হালকা আকাশী ব্যাকগ্রাউন্ড' },
  { id: '#f1f5f9', name: 'নিউট্রাল গ্রে', hex: '#f1f5f9', desc: 'সফট স্টুডিও গ্রে ব্যাকগ্রাউন্ড' },
  { id: 'transparent', name: 'স্বচ্ছ (PNG)', hex: 'transparent', desc: 'ট্রান্সপারেন্ট ব্যাকগ্রাউন্ড পিএনজি' },
];

export const StudioBackgroundEditor: React.FC<StudioBackgroundEditorProps> = ({
  onBackToDashboard,
  onSendToPrintSheet,
  onShowToast,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawUrl, setRawUrl] = useState<string | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [selectedColor, setSelectedColor] = useState<StudioBgColor>('#0284c7');
  const [tolerance, setTolerance] = useState<number>(36); // Color distance tolerance
  const [feather, setFeather] = useState<number>(14);
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      onShowToast('অনুগ্রহ করে একটি ছবি ফাইল আপলোড করুন (JPG, PNG, WEBP)', '⚠️');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setFile(selectedFile);
      setRawUrl(url);
      setImgElement(img);
      onShowToast(`"${selectedFile.name}" সফলভাবে লোড হয়েছে`, '✅');
    };
    img.src = url;
  };

  const handleLoadDemo = async () => {
    try {
      const demo = await createDemoStudioPhotoFile();
      handleFile(demo);
    } catch {
      onShowToast('ডেমো ছবি তৈরিতে সমস্যা হয়েছে।', '⚠️');
    }
  };

  // Re-process when parameters change
  useEffect(() => {
    if (!imgElement) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = imgElement.naturalWidth || imgElement.width;
      canvas.height = imgElement.naturalHeight || imgElement.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // Draw original image
      ctx.drawImage(imgElement, 0, 0);

      // Apply client-side color-separation if not transparent/original
      if (selectedColor !== 'original') {
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Sample background color from top-left, top-right, and top-center borders
          const samplePoints = [
            { x: 4, y: 4 },
            { x: Math.floor(canvas.width / 2), y: 4 },
            { x: canvas.width - 5, y: 4 },
            { x: 4, y: Math.floor(canvas.height * 0.15) },
            { x: canvas.width - 5, y: Math.floor(canvas.height * 0.15) },
          ];

          let avgR = 0, avgG = 0, avgB = 0;
          samplePoints.forEach(p => {
            const idx = (p.y * canvas.width + p.x) * 4;
            avgR += data[idx];
            avgG += data[idx + 1];
            avgB += data[idx + 2];
          });
          avgR /= samplePoints.length;
          avgG /= samplePoints.length;
          avgB /= samplePoints.length;

          // Parse target background color
          let targetR = 255, targetG = 255, targetB = 255;
          const isTransparent = selectedColor === 'transparent';
          if (!isTransparent && selectedColor.startsWith('#')) {
            targetR = parseInt(selectedColor.slice(1, 3), 16);
            targetG = parseInt(selectedColor.slice(3, 5), 16);
            targetB = parseInt(selectedColor.slice(5, 7), 16);
          }

          const tolSq = tolerance * tolerance * 3;
          const featherSq = (tolerance + feather) * (tolerance + feather) * 3;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const diffR = r - avgR;
            const diffG = g - avgG;
            const diffB = b - avgB;
            const distSq = diffR * diffR + diffG * diffG + diffB * diffB;

            if (distSq < tolSq) {
              if (isTransparent) {
                data[i + 3] = 0;
              } else {
                data[i] = targetR;
                data[i + 1] = targetG;
                data[i + 2] = targetB;
              }
            } else if (distSq < featherSq) {
              const blend = (Math.sqrt(distSq) - tolerance * 1.732) / (feather * 1.732);
              const clamped = Math.max(0, Math.min(1, blend));
              if (isTransparent) {
                data[i + 3] = Math.round(data[i + 3] * clamped);
              } else {
                data[i] = Math.round(targetR * (1 - clamped) + r * clamped);
                data[i + 1] = Math.round(targetG * (1 - clamped) + g * clamped);
                data[i + 2] = Math.round(targetB * (1 - clamped) + b * clamped);
              }
            }
          }

          // Apply brightness & contrast
          if (brightness !== 0 || contrast !== 0) {
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] > 0) {
                let r = factor * (data[i] - 128) + 128 + brightness;
                let g = factor * (data[i + 1] - 128) + 128 + brightness;
                let b = factor * (data[i + 2] - 128) + 128 + brightness;
                data[i] = Math.max(0, Math.min(255, r));
                data[i + 1] = Math.max(0, Math.min(255, g));
                data[i + 2] = Math.max(0, Math.min(255, b));
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
        } catch (err) {
          console.warn('Canvas pixel manipulation error:', err);
        }
      }

      if (isMounted) {
        const outUrl = canvas.toDataURL(selectedColor === 'transparent' ? 'image/png' : 'image/jpeg', 0.95);
        setProcessedUrl(outUrl);
        setIsProcessing(false);
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imgElement, selectedColor, tolerance, feather, brightness, contrast]);

  const handleDownload = () => {
    if (!processedUrl) return;
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `Studio_Photo_${selectedColor === 'transparent' ? 'png' : 'jpg'}_${Date.now()}.${selectedColor === 'transparent' ? 'png' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('ছবি ডাউনলোড সম্পন্ন হয়েছে!', '💾');
  };

  const handleSendToPrint = () => {
    if (!file) {
      onShowToast('প্রথমে একটি ছবি আপলোড করুন', '⚠️');
      return;
    }
    if (onSendToPrintSheet) {
      onSendToPrintSheet(file, selectedColor);
      onShowToast('ছবিটি মাল্টি-ফটো প্রিন্ট স্টুডিওতে পাঠানো হয়েছে!', '🚀');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="স্টুডিও ড্যাশবোর্ডে ফিরুন"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  ছবির ব্যাকগ্রাউন্ড পরিবর্তন (Studio Backdrop)
                </h1>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                  স্টুডিও কালার
                </span>
              </div>
              <p className="text-xs text-slate-500">
                পাসপোর্ট হোয়াইট, ক্লাসিক ব্লু বা যেকোনো স্টুডিও ব্যাকড্রপে ছবি রূপান্তর করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!file && (
              <button
                onClick={handleLoadDemo}
                className="px-3.5 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                নমুনা ছবি দিয়ে দেখুন
              </button>
            )}
            {processedUrl && (
              <>
                <button
                  onClick={handleSendToPrint}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  A4 শিটে প্রিন্ট করুন
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  ডাউনলোড
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {!file ? (
          /* Upload State */
          <div className="max-w-xl mx-auto mt-8">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFile(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/70 rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  যে ছবির ব্যাকগ্রাউন্ড পরিবর্তন করতে চান তা এখানে আপলোড করুন
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  JPG, JPEG, PNG বা WEBP ফাইল সাপোর্ট করে
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium shadow-xs">
                  ফাইল সিলেক্ট করুন
                </span>
                <span className="text-xs text-slate-400">বা সরাসরি টেনে আনুন</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadDemo}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                ফাইল নেই? ডেমো স্টুডিও ফটো দিয়ে পরীক্ষা করুন
              </button>
            </div>
          </div>
        ) : (
          /* Active Editor State */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Controls */}
            <div className="lg:col-span-5 space-y-5">
              {/* Photo Source Info */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                    <img src={rawUrl || ''} alt="Original" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
                      {file.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • {imgElement?.naturalWidth}×{imgElement?.naturalHeight} px
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                    title="ছবি পরিবর্তন"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFile(e.target.files[0]);
                      }}
                    />
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setFile(null);
                      setRawUrl(null);
                      setImgElement(null);
                      setProcessedUrl(null);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs transition-colors"
                    title="ছবি মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Studio Color Selection */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-600" />
                    স্টুডিও ব্যাকগ্রাউন্ড কালার নির্বাচন
                  </h3>
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                    অটো সেপারেশন
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {BG_COLOR_OPTIONS.map((opt) => {
                    const isSelected = selectedColor === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedColor(opt.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-500 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-md border border-slate-300 shrink-0 mt-0.5 shadow-inner"
                          style={{
                            backgroundColor: opt.hex === 'transparent' ? '#ffffff' : opt.hex,
                            backgroundImage:
                              opt.hex === 'transparent'
                                ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
                                : undefined,
                            backgroundSize: opt.hex === 'transparent' ? '8px 8px' : undefined,
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                            {opt.name}
                            {isSelected && <Check className="w-3 h-3 text-purple-600 inline" />}
                          </p>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Adjustment Sliders */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  কালার ডিটেকশন ও অ্যাডজাস্টমেন্ট
                </h3>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">কালার ডিটেকশন টলারেন্স:</span>
                    <span className="font-mono text-purple-700 font-bold">{tolerance}</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    value={tolerance}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    ব্যাকগ্রাউন্ড বেশি কেটে গেলে কমান, ব্যাকগ্রাউন্ড থেকে গেলে বাড়ান
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">ফেদার ও এজ স্মুথিং (Feathering):</span>
                    <span className="font-mono text-purple-700 font-bold">{feather}</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="30"
                    value={feather}
                    onChange={(e) => setFeather(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    শরীরের সীমানার সূক্ষ্ম প্রান্ত মসৃণ করার জন্য
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">উজ্জ্বলতা:</span>
                      <span className="font-mono text-slate-700">{brightness}</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">কনট্রাস্ট:</span>
                      <span className="font-mono text-slate-700">{contrast}</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleSendToPrint}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  এই ব্যাকগ্রাউন্ডের ছবি A4 পেজে সাজিয়ে প্রিন্ট করুন
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  একক ছবি হিসেবে ডাউনলোড করুন ({selectedColor === 'transparent' ? 'PNG' : 'JPG'})
                </button>
              </div>

              {/* Security and Privacy Notice */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3 text-xs text-purple-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">১০০% সুরক্ষিত ও প্রাইভেট:</p>
                  <p className="text-[11px] text-purple-800 leading-relaxed mt-0.5">
                    ছবি সম্পূর্ণভাবে আপনার নিজের ব্রাউজারে প্রসেস হয়। আপনার ছবি কোনো দূরবর্তী সার্ভারে পাঠানো হয় না।
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Side by Side Comparison Preview */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  লাইভ প্রিভিউ (মূল ছবি বনাম ব্যাকগ্রাউন্ড পরিবর্তন)
                </h3>
                {isProcessing && (
                  <span className="text-[10px] text-purple-700 animate-pulse font-medium">
                    প্রসেসিং হচ্ছে...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original View */}
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      মূল ছবি (Original)
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden aspect-3/4 flex items-center justify-center p-2">
                    <img
                      src={rawUrl || ''}
                      alt="Original"
                      className="max-h-full max-w-full object-contain rounded-md shadow-xs"
                    />
                  </div>
                </div>

                {/* Processed View */}
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                      স্টুডিও ব্যাকগ্রাউন্ড প্রিভিউ
                    </span>
                  </div>
                  <div
                    className="border border-purple-200 rounded-xl overflow-hidden aspect-3/4 flex items-center justify-center p-2 relative shadow-xs"
                    style={{
                      backgroundColor: selectedColor === 'transparent' ? '#f8fafc' : selectedColor,
                      backgroundImage:
                        selectedColor === 'transparent'
                          ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
                          : undefined,
                      backgroundSize: selectedColor === 'transparent' ? '12px 12px' : undefined,
                    }}
                  >
                    {processedUrl ? (
                      <img
                        src={processedUrl}
                        alt="Studio Backdrop Result"
                        className="max-h-full max-w-full object-contain rounded-md shadow-md"
                      />
                    ) : (
                      <div className="text-center text-slate-400 text-xs">
                        রেন্ডারিং হচ্ছে...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
