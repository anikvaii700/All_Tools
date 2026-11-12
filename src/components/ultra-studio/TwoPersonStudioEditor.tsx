import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Users,
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
  Check,
  Maximize2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { DPI_300_PX_PER_MM, createDemoStudioPhotoFile } from './clientImageProcessor';
import { triggerUniversalPrint } from './photoArranger';
import { PAPER_DIMENSIONS_MM } from './types';
import { StudioPrintModal } from './StudioPrintModal';

interface TwoPersonStudioEditorProps {
  onBackToDashboard: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

interface PersonSlotState {
  file: File | null;
  rawUrl: string | null;
  imgElement: HTMLImageElement | null;
  name: string;
  zoom: number;
  panX: number; // percentage offset -50 to +50
  panY: number; // percentage offset -50 to +50
  rotation: number;
}

const DEFAULT_PERSON_STATE: PersonSlotState = {
  file: null,
  rawUrl: null,
  imgElement: null,
  name: '',
  zoom: 1.0,
  panX: 0,
  panY: 0,
  rotation: 0,
};

const JOINT_FRAME_PRESETS = [
  { id: 'standard-joint', name: '৭০ × ৪৫ মিমি (স্ট্যান্ডার্ড জয়েন্ট সাইজ)', w: 70, h: 45, tag: 'কাবিননামা ও সরকারি ফরম' },
  { id: 'small-joint', name: '৬০ × ৪০ মিমি (ছোট জয়েন্ট সাইজ)', w: 60, h: 40, tag: 'পাসপোর্ট স্টাইল' },
  { id: '3r-joint', name: '১০০ × ৭৫ মিমি (৩R সাইজ জয়েন্ট পোর্ট্রেট)', w: 100, h: 75, tag: 'অ্যালবাম প্রিন্ট' },
  { id: '4r-joint', name: '১২৭ × ৮৯ মিমি (৪R সাইজ জয়েন্ট পোর্ট্রেট)', w: 127, h: 89, tag: 'ফ্যামিলি ফ্রেম' },
  { id: 'custom-joint', name: 'কাস্টম মাপ (নিজের মতো দৈর্ঘ্য-প্রস্থ)', w: 70, h: 45, tag: 'কাস্টম' },
];

const BACKDROP_COLORS = [
  { id: '#0284c7', name: 'পাসপোর্ট ব্লু', hex: '#0284c7' },
  { id: '#ffffff', name: 'স্টুডিও হোয়াইট', hex: '#ffffff' },
  { id: '#0369a1', name: 'রয়্যাল নেভি', hex: '#0369a1' },
  { id: '#e0f2fe', name: 'সফট স্কাই', hex: '#e0f2fe' },
  { id: '#f1f5f9', name: 'লাইট গ্রে', hex: '#f1f5f9' },
];

export const TwoPersonStudioEditor: React.FC<TwoPersonStudioEditorProps> = ({
  onBackToDashboard,
  onShowToast,
}) => {
  const [person1, setPerson1] = useState<PersonSlotState>({
    ...DEFAULT_PERSON_STATE,
    name: 'ব্যক্তি ১',
    panX: 18, // Default slightly right to meet in center
  });
  const [person2, setPerson2] = useState<PersonSlotState>({
    ...DEFAULT_PERSON_STATE,
    name: 'ব্যক্তি ২',
    panX: -18, // Default slightly left to meet in center
  });

  const [framePreset, setFramePreset] = useState<string>('standard-joint');
  const [frameWidthMm, setFrameWidthMm] = useState<number>(70);
  const [frameHeightMm, setFrameHeightMm] = useState<number>(45);
  const [spacingMm, setSpacingMm] = useState<number>(0); // 0 mm seamless joint by default
  const [featherPx, setFeatherPx] = useState<number>(10); // Center soft feather
  const [showNames, setShowNames] = useState<boolean>(false);
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>('#0284c7');
  const [quantity, setQuantity] = useState<number>(4);

  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);
  const combinedCanvasRef = useRef<HTMLCanvasElement>(null);
  const a4CanvasRef = useRef<HTMLCanvasElement>(null);

  // Load single person file
  const handleLoadPersonFile = (file: File, personNum: 1 | 2) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      onShowToast('অনুগ্রহ করে JPG, PNG বা WEBP ছবি নির্বাচন করুন।', '⚠️');
      return;
    }
    const rawUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const updater = personNum === 1 ? setPerson1 : setPerson2;
      updater((prev) => {
        if (prev.rawUrl) URL.revokeObjectURL(prev.rawUrl);
        return {
          ...prev,
          file,
          rawUrl,
          imgElement: img,
        };
      });
      onShowToast(`ব্যক্তি ${personNum}-এর ছবি সফলভাবে লোড হয়েছে!`, '✅');
    };
    img.src = rawUrl;
  };

  // 1-Click shoulder alignment preset
  const handleAutoAlignShoulders = () => {
    setPerson1((p) => ({ ...p, panX: 22, panY: 0, zoom: 1.15 }));
    setPerson2((p) => ({ ...p, panX: -22, panY: 0, zoom: 1.15 }));
    setSpacingMm(0);
    setFeatherPx(12);
    onShowToast('কাঁধে কাঁধ মিলিয়ে জয়েন্ট পজিশন সেট করা হয়েছে!', '✨');
  };

  // Load Demo joint portraits
  const handleLoadDemo = async () => {
    try {
      onShowToast('নমুনা যৌথ ছবি তৈরি হচ্ছে...', '⏳');
      const f1 = await createDemoStudioPhotoFile('Groom / Person 1');
      const f2 = await createDemoStudioPhotoFile('Bride / Person 2');
      handleLoadPersonFile(f1, 1);
      handleLoadPersonFile(f2, 2);
    } catch {
      onShowToast('নমুনা ছবি লোডে সমস্যা হয়েছে।', '⚠️');
    }
  };

  // Handle Preset change
  const handlePresetSelect = (id: string) => {
    setFramePreset(id);
    const p = JOINT_FRAME_PRESETS.find((x) => x.id === id);
    if (p) {
      setFrameWidthMm(p.w);
      setFrameHeightMm(p.h);
    }
  };

  // Render the combined two-person single joint photo canvas
  const renderCombinedFrameCanvas = useCallback((): HTMLCanvasElement | null => {
    const wPx = Math.round(frameWidthMm * DPI_300_PX_PER_MM);
    const hPx = Math.round(frameHeightMm * DPI_300_PX_PER_MM);

    const canvas = document.createElement('canvas');
    canvas.width = wPx;
    canvas.height = hPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Fill unified studio backdrop
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, wPx, hPx);

    const captionHeightPx = showNames ? Math.round(5.0 * DPI_300_PX_PER_MM) : 0;
    const innerHPx = hPx - captionHeightPx;
    const spacingPx = Math.round(spacingMm * DPI_300_PX_PER_MM);

    // Compute halves
    // Person 1 takes left half + overlap; Person 2 takes right half + overlap
    const midX = wPx / 2;
    const halfW = (wPx - spacingPx) / 2;

    const r1 = { x: 0, y: 0, w: midX - spacingPx / 2, h: innerHPx };
    const r2 = { x: midX + spacingPx / 2, y: 0, w: wPx - (midX + spacingPx / 2), h: innerHPx };

    const drawPerson = (
      slot: PersonSlotState,
      rect: { x: number; y: number; w: number; h: number },
      isPerson1: boolean
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.w, rect.h);
      ctx.clip();

      if (slot.imgElement) {
        const img = slot.imgElement;
        const imgW = img.naturalWidth || img.width;
        const imgH = img.naturalHeight || img.height;
        const targetAspect = rect.w / rect.h;
        const imgAspect = imgW / imgH;

        let baseW = rect.w;
        let baseH = rect.h;
        if (imgAspect > targetAspect) {
          baseH = rect.h;
          baseW = rect.h * imgAspect;
        } else {
          baseW = rect.w;
          baseH = rect.w / imgAspect;
        }

        const drawW = baseW * slot.zoom;
        const drawH = baseH * slot.zoom;
        const panX = (slot.panX / 100) * (rect.w * 0.7);
        const panY = (slot.panY / 100) * (rect.h * 0.7);

        ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
        if (slot.rotation !== 0) {
          ctx.rotate((slot.rotation * Math.PI) / 180);
        }
        ctx.drawImage(img, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);
      } else {
        ctx.fillStyle = isPerson1 ? '#f8fafc' : '#f1f5f9';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.fillStyle = '#94a3b8';
        ctx.font = `bold ${Math.round(3.5 * DPI_300_PX_PER_MM)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(
          `${isPerson1 ? '১ম' : '২য়'} ব্যক্তির ছবি দিন`,
          rect.x + rect.w / 2,
          rect.y + rect.h / 2
        );
      }
      ctx.restore();
    };

    drawPerson(person1, r1, true);
    drawPerson(person2, r2, false);

    // Center seam soft feather/blend
    if (featherPx > 0 && person1.imgElement && person2.imgElement && spacingPx <= 0) {
      const seamX = midX;
      const featherW = featherPx * 2;
      const grad = ctx.createLinearGradient(seamX - featherW / 2, 0, seamX + featherW / 2, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.06)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(seamX - featherW / 2, 0, featherW, innerHPx);
    }

    // Optional Captions / Names bar
    if (showNames && (person1.name || person2.name)) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, innerHPx, wPx, captionHeightPx);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, innerHPx);
      ctx.lineTo(wPx, innerHPx);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${Math.round(2.6 * DPI_300_PX_PER_MM)}px 'Hind Siliguri', sans-serif`;
      ctx.textAlign = 'center';

      ctx.fillText(person1.name || 'ব্যক্তি ১', r1.w / 2, hPx - Math.round(1.5 * DPI_300_PX_PER_MM));
      ctx.fillText(person2.name || 'ব্যক্তি ২', r2.x + r2.w / 2, hPx - Math.round(1.5 * DPI_300_PX_PER_MM));
    }

    // Outer subtle photo border
    if (showBorder) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(0, 0, wPx, hPx);
    }

    return canvas;
  }, [frameWidthMm, frameHeightMm, spacingMm, featherPx, showNames, showBorder, bgColor, person1, person2]);

  // Render A4 Sheet Preview containing multiple copies of the joint photo
  const renderA4SheetCanvas = useCallback(() => {
    const singleCanvas = renderCombinedFrameCanvas();
    if (!singleCanvas || !a4CanvasRef.current) return;

    const paper = PAPER_DIMENSIONS_MM.A4;
    const a4W = Math.round(paper.width * DPI_300_PX_PER_MM);
    const a4H = Math.round(paper.height * DPI_300_PX_PER_MM);

    const canvas = a4CanvasRef.current;
    canvas.width = a4W;
    canvas.height = a4H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill clean white A4
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, a4W, a4H);

    const marginMm = 8;
    const gapMm = 4;
    const marginPx = Math.round(marginMm * DPI_300_PX_PER_MM);
    const gapPx = Math.round(gapMm * DPI_300_PX_PER_MM);
    const singleW = singleCanvas.width;
    const singleH = singleCanvas.height;

    let curX = marginPx;
    let curY = marginPx;
    let rowMaxH = 0;

    for (let c = 0; c < quantity; c++) {
      if (curX + singleW > a4W - marginPx + 1) {
        curX = marginPx;
        curY += rowMaxH + gapPx;
        rowMaxH = 0;
      }

      if (curY + singleH > a4H - marginPx + 1) {
        break; // Reached bottom of sheet
      }

      ctx.drawImage(singleCanvas, curX, curY);

      // Subtle scissor cutting line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(curX, curY, singleW, singleH);

      curX += singleW + gapPx;
      if (singleH > rowMaxH) rowMaxH = singleH;
    }
  }, [renderCombinedFrameCanvas, quantity]);

  useEffect(() => {
    renderA4SheetCanvas();
  }, [renderA4SheetCanvas]);

  // Single Joint Photo Download (JPG)
  const handleDownloadSingleJpg = () => {
    const canvas = renderCombinedFrameCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `MoSaFa_Joint_Photo_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('একক যৌথ ছবি ডাউনলোড সম্পন্ন হয়েছে!', '💾');
  };

  // PDF Export
  const handleDownloadPdf = () => {
    const singleCanvas = renderCombinedFrameCanvas();
    if (!singleCanvas) return;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = singleCanvas.toDataURL('image/jpeg', 0.95);
    const marginMm = 8;
    const gapMm = 4;
    const a4W = 210;
    const a4H = 297;

    let curX = marginMm;
    let curY = marginMm;
    let rowH = 0;

    for (let c = 0; c < quantity; c++) {
      if (curX + frameWidthMm > a4W - marginMm + 0.1) {
        curX = marginMm;
        curY += rowH + gapMm;
        rowH = 0;
      }
      if (curY + frameHeightMm > a4H - marginMm + 0.1) {
        break;
      }

      pdf.addImage(imgData, 'JPEG', curX, curY, frameWidthMm, frameHeightMm);
      pdf.setDrawColor(210, 220, 230);
      pdf.setLineWidth(0.15);
      pdf.rect(curX, curY, frameWidthMm, frameHeightMm, 'S');

      curX += frameWidthMm + gapMm;
      if (frameHeightMm > rowH) rowH = frameHeightMm;
    }

    pdf.save(`MoSaFa_Joint_Photos_A4_${Date.now()}.pdf`);
    onShowToast('আসল ১০০% স্কেলে PDF ডাউনলোড সম্পন্ন হয়েছে!', '📄');
  };

  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Universal Native Direct Print (Opens all installed printers)
  const handleDirectPrint = () => {
    if (!a4CanvasRef.current) return;
    const dataUrl = a4CanvasRef.current.toDataURL('image/jpeg', 0.98);
    triggerUniversalPrint([dataUrl], { paperSize: 'A4', orientation: 'portrait' }, onShowToast);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      <input
        ref={fileInput1Ref}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleLoadPersonFile(e.target.files[0], 1)}
        className="hidden"
      />
      <input
        ref={fileInput2Ref}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleLoadPersonFile(e.target.files[0], 2)}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/80 px-2 py-0.5 rounded-full">
                  Ultra Digital Studio
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                  যৌথ ফটো ফ্রেম
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                দুইজনের জয়েন্ট ছবি (Two-Person Joint Photo Studio)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAutoAlignShoulders}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              কাঁধে কাঁধ মিলিয়ে জয়েন্ট করুন
            </button>
            <button
              type="button"
              onClick={handleLoadDemo}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              নমুনা ছবি
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* =========================================================================
              LEFT COLUMN: PERSON 1 & PERSON 2 CONTROLS (6 COLS)
          ========================================================================= */}
          <div className="lg:col-span-6 space-y-5">
            {/* Person 1 Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[11px] font-black">১</span>
                  ১ম ব্যক্তির ছবি (বাম পাশ)
                </span>
                {person1.file && (
                  <button
                    type="button"
                    onClick={() => fileInput1Ref.current?.click()}
                    className="text-xs text-cyan-700 font-bold hover:underline cursor-pointer"
                  >
                    ছবি পরিবর্তন
                  </button>
                )}
              </div>

              {person1.rawUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                      <img src={person1.rawUrl} alt="Person 1" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="১ম ব্যক্তির নাম (ঐচ্ছিক)"
                        value={person1.name}
                        onChange={(e) => setPerson1((p) => ({ ...p, name: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">জুম: {person1.zoom.toFixed(2)}x</span>
                        <button
                          type="button"
                          onClick={() => setPerson1((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" /> ৯০° ঘোরান
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="2.5"
                        step="0.05"
                        value={person1.zoom}
                        onChange={(e) => setPerson1((p) => ({ ...p, zoom: Number(e.target.value) }))}
                        className="w-full accent-cyan-600"
                      />
                    </div>
                  </div>

                  {/* Positioning: Pan X and Pan Y */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                        <span>ডানে-বামে (Pan X):</span>
                        <span className="font-mono text-cyan-700 font-bold">{person1.panX > 0 ? `+${person1.panX}` : person1.panX}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={person1.panX}
                        onChange={(e) => setPerson1((p) => ({ ...p, panX: Number(e.target.value) }))}
                        className="w-full accent-cyan-600"
                      />
                      <span className="text-[10px] text-slate-400">ডানে নিয়ে কাঁধ মেলান</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                        <span>উপরে-নিচে (Pan Y):</span>
                        <span className="font-mono text-cyan-700 font-bold">{person1.panY > 0 ? `+${person1.panY}` : person1.panY}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={person1.panY}
                        onChange={(e) => setPerson1((p) => ({ ...p, panY: Number(e.target.value) }))}
                        className="w-full accent-cyan-600"
                      />
                      <span className="text-[10px] text-slate-400">উচ্চতা মেলান</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInput1Ref.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/60 hover:bg-cyan-50/40 transition-colors"
                >
                  <Upload className="w-6 h-6 text-cyan-600 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-800">১ম ব্যক্তির ছবি আপলোড করুন</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG বা WEBP ছবি</p>
                </div>
              )}
            </div>

            {/* Person 2 Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[11px] font-black">২</span>
                  ২য় ব্যক্তির ছবি (ডান পাশ)
                </span>
                {person2.file && (
                  <button
                    type="button"
                    onClick={() => fileInput2Ref.current?.click()}
                    className="text-xs text-indigo-700 font-bold hover:underline cursor-pointer"
                  >
                    ছবি পরিবর্তন
                  </button>
                )}
              </div>

              {person2.rawUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                      <img src={person2.rawUrl} alt="Person 2" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="২য় ব্যক্তির নাম (ঐচ্ছিক)"
                        value={person2.name}
                        onChange={(e) => setPerson2((p) => ({ ...p, name: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium">জুম: {person2.zoom.toFixed(2)}x</span>
                        <button
                          type="button"
                          onClick={() => setPerson2((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" /> ৯০° ঘোরান
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="2.5"
                        step="0.05"
                        value={person2.zoom}
                        onChange={(e) => setPerson2((p) => ({ ...p, zoom: Number(e.target.value) }))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Positioning: Pan X and Pan Y */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                        <span>ডানে-বামে (Pan X):</span>
                        <span className="font-mono text-indigo-700 font-bold">{person2.panX > 0 ? `+${person2.panX}` : person2.panX}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={person2.panX}
                        onChange={(e) => setPerson2((p) => ({ ...p, panX: Number(e.target.value) }))}
                        className="w-full accent-indigo-600"
                      />
                      <span className="text-[10px] text-slate-400">বামে নিয়ে কাঁধ মেলান</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                        <span>উপরে-নিচে (Pan Y):</span>
                        <span className="font-mono text-indigo-700 font-bold">{person2.panY > 0 ? `+${person2.panY}` : person2.panY}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={person2.panY}
                        onChange={(e) => setPerson2((p) => ({ ...p, panY: Number(e.target.value) }))}
                        className="w-full accent-indigo-600"
                      />
                      <span className="text-[10px] text-slate-400">উচ্চতা মেলান</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInput2Ref.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/60 hover:bg-indigo-50/40 transition-colors"
                >
                  <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-slate-800">২য় ব্যক্তির ছবি আপলোড করুন</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG বা WEBP ছবি</p>
                </div>
              )}
            </div>

            {/* Joint Frame Settings */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                যৌথ ফ্রেম ও জয়েন্ট সেটিংস (Joint Frame Controls)
              </h3>

              {/* Frame Size Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ফ্রেমের সাইজ (Joint Frame Size):
                </label>
                <select
                  value={framePreset}
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                >
                  {JOINT_FRAME_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Joint Distance & Center Blend */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>জয়েন্ট ব্যবধান / দূরত্ব:</span>
                    <span className="font-mono font-bold text-indigo-600">{spacingMm} মিমি</span>
                  </div>
                  <input
                    type="range"
                    min="-8"
                    max="10"
                    step="1"
                    value={spacingMm}
                    onChange={(e) => setSpacingMm(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400">০ মিমি = কাঁধে কাঁধ মিলিয়ে জয়েন্ট</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>সীমানা ব্লেন্ডিং (Soft Seam):</span>
                    <span className="font-mono font-bold text-indigo-600">{featherPx} px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={featherPx}
                    onChange={(e) => setFeatherPx(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400">মাঝের দাগ মসৃণ করতে</p>
                </div>
              </div>

              {/* Backdrop Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ইউনিফায়েড ব্যাকগ্রাউন্ড কালার (Studio Backdrop):
                </label>
                <div className="flex flex-wrap gap-2">
                  {BACKDROP_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setBgColor(c.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                        bgColor === c.id
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes & Copies */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showNames}
                      onChange={(e) => setShowNames(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    নিচে নাম প্রদর্শন
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={showBorder}
                      onChange={(e) => setShowBorder(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    ফ্রেমের চারপাশে বর্ডার
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-bold">A4 পেজে কপি:</span>
                  {[2, 4, 6, 8].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold ${
                        quantity === q
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: LIVE PREVIEWS & DOWNLOAD/PRINT (6 COLS)
          ========================================================================= */}
          <div className="lg:col-span-6 space-y-5">
            {/* Download & Print Bar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800">প্রিন্ট ও ডাউনলোড অপশন</h3>
                <p className="text-[11px] text-slate-500">আসল স্কেলের PDF অথবা সরাসরি প্রিন্টারে পাঠান</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  পিডিএফ (A4)
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSingleJpg}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  একক ছবি (JPG)
                </button>
                <button
                  type="button"
                  onClick={handleDirectPrint}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="কম্পিউটারে ইনস্টল করা সব প্রিন্টার আসবে"
                >
                  <Printer className="w-3.5 h-3.5" />
                  সরাসরি প্রিন্ট
                </button>
              </div>
            </div>

            {/* Live A4 Sheet Preview */}
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-white shadow-xl">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold flex items-center gap-1.5 text-slate-300">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  A4 শিট লাইভ প্রিভিউ ({quantity} কপি সাজানো)
                </span>
                <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                  আসল স্কেল (১০০%)
                </span>
              </div>

              {/* Responsive White A4 Sheet */}
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden aspect-[210/297] w-full max-w-[420px] mx-auto flex items-center justify-center p-2">
                <canvas
                  ref={a4CanvasRef}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>কাগজ: A4 (২১০ × ২৯৭ মিমি)</span>
                <span>ফ্রেম: {frameWidthMm} × {frameHeightMm} মিমি</span>
                <span>মার্জিন: ৮ মিমি</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Printer Modal */}
      <StudioPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        pageImages={a4CanvasRef.current ? [a4CanvasRef.current.toDataURL('image/jpeg', 0.98)] : []}
        paperSize="A4"
        orientation="portrait"
        totalPhotos={2}
        onDownloadPdf={handleDownloadPdf}
        onShowToast={onShowToast}
      />
    </div>
  );
};
