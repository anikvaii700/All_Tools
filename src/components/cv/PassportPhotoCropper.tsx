import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RotateCw,
  ZoomIn,
  Trash2,
  Check,
  PenTool,
  Upload,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface PassportPhotoCropperProps {
  photoUrl: string;
  signatureUrl: string;
  onChangePhoto: (dataUrl: string) => void;
  onChangeSignature: (dataUrl: string) => void;
  requirePhotoHint?: boolean;
  requireSignatureHint?: boolean;
}

export const PassportPhotoCropper: React.FC<PassportPhotoCropperProps> = ({
  photoUrl,
  signatureUrl,
  onChangePhoto,
  onChangeSignature,
  requirePhotoHint = false,
  requireSignatureHint = false,
}) => {
  const [rawPhotoSrc, setRawPhotoSrc] = useState<string | null>(null);
  const [aspectMode, setAspectMode] = useState<'passport' | 'square'>('passport');
  const [zoom, setZoom] = useState<number>(1.1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [cleanSignatureBg, setCleanSignatureBg] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
      setErrorMsg('অনুগ্রহ করে JPG, JPEG, PNG অথবা WebP ফরম্যাটের ছবি দিন।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setRawPhotoSrc(String(reader.result || ''));
      setZoom(1.05);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (!rawPhotoSrc || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetW = aspectMode === 'passport' ? 300 : 320;
    const targetH = aspectMode === 'passport' ? 380 : 320;
    canvas.width = targetW;
    canvas.height = targetH;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetW, targetH);

      const isRotated90 = rotation % 180 !== 0;
      const srcW = isRotated90 ? img.height : img.width;
      const srcH = isRotated90 ? img.width : img.height;

      const baseScale = Math.max(targetW / srcW, targetH / srcH);
      const scale = baseScale * zoom;

      ctx.save();
      ctx.translate(targetW / 2 + offsetX, targetH / 2 + offsetY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    };
    img.src = rawPhotoSrc;
  }, [rawPhotoSrc, aspectMode, zoom, offsetX, offsetY, rotation]);

  const handleApplyCroppedPhoto = () => {
    if (!previewCanvasRef.current) return;
    const out = previewCanvasRef.current.toDataURL('image/jpeg', 0.92);
    onChangePhoto(out);
    setRawPhotoSrc(null);
  };

  const processSignatureImage = (src: string, cleanBg: boolean) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 460;
      const scale = Math.min(1, maxW / img.width);
      const w = Math.max(120, Math.round(img.width * scale));
      const h = Math.max(50, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);

      if (cleanBg) {
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          if (r > 205 && g > 205 && b > 205) {
            d[i + 3] = 0;
          } else {
            d[i] = Math.max(0, r - 35);
            d[i + 1] = Math.max(0, g - 35);
            d[i + 2] = Math.max(0, b - 45);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      onChangeSignature(canvas.toDataURL('image/png'));
    };
    img.src = src;
  };

  const handleSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
      setErrorMsg('স্বাক্ষরের জন্য JPG, JPEG, PNG অথবা WebP ছবি দিন।');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      processSignatureImage(String(reader.result || ''), cleanSignatureBg);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Passport Photo Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">পাসপোর্ট সাইজ ছবি (Photo)</h4>
                <p className="text-[11px] text-slate-500">
                  {requirePhotoHint ? 'সার্কুলারে ছবি চাওয়া হয়েছে' : 'ঐচ্ছিক — প্রয়োজন হলে যুক্ত করুন'}
                </p>
              </div>
            </div>
            {photoUrl && (
              <button
                type="button"
                onClick={() => onChangePhoto('')}
                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                title="ছবি মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {rawPhotoSrc ? (
            <div className="space-y-3 p-3 rounded-xl bg-white border border-indigo-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  ক্রপ ও অ্যাডজাস্ট করুন
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setAspectMode('passport')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${
                      aspectMode === 'passport' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    পাসপোর্ট (3:4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectMode('square')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${
                      aspectMode === 'square' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    স্কয়ার (1:1)
                  </button>
                </div>
              </div>

              <div className="flex justify-center bg-slate-100 rounded-xl p-2">
                <canvas
                  ref={previewCanvasRef}
                  className="max-h-44 rounded-lg shadow-md border-2 border-indigo-400 bg-white"
                />
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="w-12 text-slate-600 font-medium">জুম:</span>
                  <input
                    type="range"
                    min={1}
                    max={2.5}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-slate-600 font-medium pl-5">ডান/বাম:</span>
                  <input
                    type="range"
                    min={-140}
                    max={140}
                    step={2}
                    value={offsetX}
                    onChange={(e) => setOffsetX(Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 text-slate-600 font-medium pl-5">উপর/নিচ:</span>
                  <input
                    type="range"
                    min={-140}
                    max={140}
                    step={2}
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="flex-1 accent-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>ঘুরান</span>
                </button>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRawPhotoSrc(null)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCroppedPhoto}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>ছবি সেভ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Applicant Preview"
                  className="w-20 h-24 rounded-xl object-cover border-2 border-indigo-300 shadow-xs bg-white shrink-0"
                />
              ) : (
                <div className="w-20 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-[10px] shrink-0">
                  <Camera className="w-5 h-5 mb-1" />
                  <span>ছবি নেই</span>
                </div>
              )}
              <div className="space-y-2 flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{photoUrl ? 'ছবি পরিবর্তন ও ক্রপ করুন' : 'পাসপোর্ট ছবি আপলোড'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-500">JPG, JPEG, PNG বা WebP • ক্রপ ও রিসাইজ বিল্ট-ইন</p>
              </div>
            </div>
          )}
        </div>

        {/* Signature Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">ডিজিটাল স্বাক্ষর (Signature)</h4>
                <p className="text-[11px] text-slate-500">
                  {requireSignatureHint ? 'সার্কুলারে স্বাক্ষর চাওয়া হয়েছে' : 'ঐচ্ছিক — চাইলে কাগজে সই তুলে আপলোড করুন'}
                </p>
              </div>
            </div>
            {signatureUrl && (
              <button
                type="button"
                onClick={() => onChangeSignature('')}
                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                title="স্বাক্ষর মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center p-2 overflow-hidden">
            {signatureUrl ? (
              <img src={signatureUrl} alt="Signature Preview" className="max-h-16 max-w-full object-contain" />
            ) : (
              <div className="text-center text-slate-400 text-[11px]">
                <PenTool className="w-5 h-5 mx-auto mb-1" />
                <span>এখনও কোনো স্বাক্ষর আপলোড হয়নি</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{signatureUrl ? 'স্বাক্ষর পরিবর্তন' : 'স্বাক্ষর আপলোড'}</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleSignatureFileChange}
                className="hidden"
              />
            </label>

            <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={cleanSignatureBg}
                onChange={(e) => setCleanSignatureBg(e.target.checked)}
                className="rounded accent-emerald-600"
              />
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>সাদা ব্যাকগ্রাউন্ড পরিষ্কার করুন</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
