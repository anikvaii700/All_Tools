import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  RotateCw,
  Sparkles,
  Maximize2,
  RefreshCw,
  Crop,
  Lock,
  Unlock,
} from 'lucide-react';
import { Point, CardCorners } from './types';
import {
  detectDocumentCorners,
  getDefaultDocCorners,
  applyDocSafeInset,
} from './documentDetector';

interface DocManualCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (corners: CardCorners, rotatedImg?: HTMLImageElement) => void;
  title: string;
  imgElement: HTMLImageElement | null;
  initialCorners: CardCorners | null;
}

type CornerKey = 'tl' | 'tr' | 'br' | 'bl';

export const DocManualCropModal: React.FC<DocManualCropModalProps> = ({
  isOpen,
  onClose,
  onApply,
  title,
  imgElement,
  initialCorners,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [corners, setCorners] = useState<CardCorners | null>(null);
  const [activeCorner, setActiveCorner] = useState<CornerKey | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState<Point | null>(null); // For magnifier loupe

  // Initialize corners when modal opens or image changes
  useEffect(() => {
    if (!isOpen || !imgElement) return;

    if (initialCorners) {
      setCorners({ ...initialCorners });
    } else {
      const detected = detectDocumentCorners(imgElement);
      setCorners(detected.corners);
    }
  }, [isOpen, imgElement, initialCorners]);

  // Redraw canvas with image, quadrilateral polygon, handles and loupe
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imgElement || !corners) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport dimensions
    const cWidth = container.clientWidth || 640;
    const cHeight = Math.min(window.innerHeight * 0.65, 560);

    canvas.width = cWidth;
    canvas.height = cHeight;

    const imgW = imgElement.naturalWidth || imgElement.width;
    const imgH = imgElement.naturalHeight || imgElement.height;

    // Fit image to canvas maintaining aspect ratio
    const fitScale = Math.min((cWidth - 32) / imgW, (cHeight - 32) / imgH);
    const offsetX = (cWidth - imgW * fitScale) / 2;
    const offsetY = (cHeight - imgH * fitScale) / 2;

    setScale(fitScale);
    setOffset({ x: offsetX, y: offsetY });

    ctx.clearRect(0, 0, cWidth, cHeight);

    // Draw background grid
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, cWidth, cHeight);

    // Draw image
    ctx.drawImage(imgElement, offsetX, offsetY, imgW * fitScale, imgH * fitScale);

    // Transform corner points to canvas coordinate space
    const toCanvasX = (x: number) => offsetX + x * fitScale;
    const toCanvasY = (y: number) => offsetY + y * fitScale;

    const pTL = { x: toCanvasX(corners.tl.x), y: toCanvasY(corners.tl.y) };
    const pTR = { x: toCanvasX(corners.tr.x), y: toCanvasY(corners.tr.y) };
    const pBR = { x: toCanvasX(corners.br.x), y: toCanvasY(corners.br.y) };
    const pBL = { x: toCanvasX(corners.bl.x), y: toCanvasY(corners.bl.y) };

    // Draw dark vignette mask outside the quadrilateral
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.fillRect(0, 0, cWidth, cHeight);

    // Cut out document polygon from vignette mask
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(pTL.x, pTL.y);
    ctx.lineTo(pTR.x, pTR.y);
    ctx.lineTo(pBR.x, pBR.y);
    ctx.lineTo(pBL.x, pBL.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw quadrilateral boundary lines
    ctx.save();
    ctx.strokeStyle = '#06b6d4'; // Cyan 500
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pTL.x, pTL.y);
    ctx.lineTo(pTR.x, pTR.y);
    ctx.lineTo(pBR.x, pBR.y);
    ctx.lineTo(pBL.x, pBL.y);
    ctx.closePath();
    ctx.stroke();

    // Subtle cyan tint inside selected document area
    ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.fill();
    ctx.restore();

    // Helper to draw draggable corner pin
    const drawPin = (p: Point, key: CornerKey, label: string) => {
      const isSelected = activeCorner === key;
      const radius = isSelected ? 15 : 12;

      // Outer glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      // Main pin circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#06b6d4' : '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0284c7';
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#ffffff' : '#0369a1';
      ctx.fill();

      // Pin label tag
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, p.x + 14, p.y - 12);
      ctx.restore();
    };

    drawPin(pTL, 'tl', '১ (Top-L)');
    drawPin(pTR, 'tr', '২ (Top-R)');
    drawPin(pBR, 'br', '৩ (Bottom-R)');
    drawPin(pBL, 'bl', '৪ (Bottom-L)');

    // Magnifier Loupe when dragging a corner
    if (activeCorner && dragPos) {
      const activeCoord = corners[activeCorner];
      drawMagnifier(ctx, activeCoord, dragPos, imgElement);
    }
  }, [imgElement, corners, activeCorner, dragPos]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  // Draw 2.5x Zoom Magnifier Loupe above touch/mouse
  const drawMagnifier = (
    ctx: CanvasRenderingContext2D,
    coord: Point,
    screenPos: Point,
    img: HTMLImageElement
  ) => {
    const loupeRadius = 55;
    const zoom = 2.4;

    const loupeX = Math.min(Math.max(screenPos.x, loupeRadius + 10), ctx.canvas.width - loupeRadius - 10);
    const loupeY = Math.max(screenPos.y - loupeRadius - 35, loupeRadius + 10);

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#06b6d4';
    ctx.stroke();
    ctx.clip();

    const srcSize = (loupeRadius * 2) / zoom;
    const srcX = coord.x - srcSize / 2;
    const srcY = coord.y - srcSize / 2;

    ctx.drawImage(
      img,
      srcX,
      srcY,
      srcSize,
      srcSize,
      loupeX - loupeRadius,
      loupeY - loupeRadius,
      loupeRadius * 2,
      loupeRadius * 2
    );

    // Crosshair in center of loupe
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(loupeX - 10, loupeY);
    ctx.lineTo(loupeX + 10, loupeY);
    ctx.moveTo(loupeX, loupeY - 10);
    ctx.lineTo(loupeX, loupeY + 10);
    ctx.stroke();

    ctx.restore();
  };

  // Convert canvas mouse/touch coordinate to image natural space
  const getPointerCoord = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { canvasP: Point; imgP: Point } | null => {
    const canvas = canvasRef.current;
    if (!canvas || !imgElement) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    const naturalX = Math.round((canvasX - offset.x) / scale);
    const naturalY = Math.round((canvasY - offset.y) / scale);

    const imgW = imgElement.naturalWidth || imgElement.width;
    const imgH = imgElement.naturalHeight || imgElement.height;

    const clampedX = Math.max(0, Math.min(imgW, naturalX));
    const clampedY = Math.max(0, Math.min(imgH, naturalY));

    return {
      canvasP: { x: canvasX, y: canvasY },
      imgP: { x: clampedX, y: clampedY },
    };
  };

  // Handle pointer down: hit-test corners
  const handlePointerDown = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getPointerCoord(e);
    if (!coords || !corners) return;

    const hitRadius = 26; // generous touch hit-box in canvas px
    const keys: CornerKey[] = ['tl', 'tr', 'br', 'bl'];

    let closestKey: CornerKey | null = null;
    let minD = Infinity;

    for (const key of keys) {
      const p = corners[key];
      const cx = offset.x + p.x * scale;
      const cy = offset.y + p.y * scale;
      const d = Math.sqrt((cx - coords.canvasP.x) ** 2 + (cy - coords.canvasP.y) ** 2);
      if (d < hitRadius && d < minD) {
        minD = d;
        closestKey = key;
      }
    }

    if (closestKey) {
      setActiveCorner(closestKey);
      setDragPos(coords.canvasP);
    }
  };

  // Handle pointer move: update active corner position
  const handlePointerMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!activeCorner || !corners) return;
    const coords = getPointerCoord(e);
    if (!coords) return;

    setDragPos(coords.canvasP);
    setCorners((prev) => (prev ? { ...prev, [activeCorner]: coords.imgP } : null));
  };

  const handlePointerUp = () => {
    setActiveCorner(null);
    setDragPos(null);
  };

  // CamScanner Inset preset: pulls current corners 1.8% inward to shave off background/fingers
  const handleCamScannerInset = () => {
    if (!corners) return;
    setCorners((prev) => (prev ? applyDocSafeInset(prev, 0.018) : null));
  };

  // Preset: Auto Detect
  const handleAutoDetect = () => {
    if (!imgElement) return;
    const detected = detectDocumentCorners(imgElement);
    setCorners(detected.corners);
  };

  // Preset: Full Image
  const handleFullImage = () => {
    if (!imgElement) return;
    const w = imgElement.naturalWidth || imgElement.width;
    const h = imgElement.naturalHeight || imgElement.height;
    setCorners({
      tl: { x: 0, y: 0 },
      tr: { x: w, y: 0 },
      br: { x: w, y: h },
      bl: { x: 0, y: h },
    });
  };

  // Rotate image 90 degrees
  const handleRotate90 = () => {
    if (!imgElement) return;
    const cvs = document.createElement('canvas');
    cvs.width = imgElement.naturalHeight || imgElement.height;
    cvs.height = imgElement.naturalWidth || imgElement.width;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    ctx.translate(cvs.width / 2, cvs.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(imgElement, -imgElement.naturalWidth / 2, -imgElement.naturalHeight / 2);

    const rotatedImg = new Image();
    rotatedImg.onload = () => {
      const detected = detectDocumentCorners(rotatedImg);
      setCorners(detected.corners);
      onApply(detected.corners, rotatedImg);
    };
    rotatedImg.src = cvs.toDataURL();
  };

  const handleConfirm = () => {
    if (corners) {
      onApply(corners);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-teal-50/30 to-indigo-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-sm">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                {title} — ম্যানুয়াল কর্নার অ্যাডজাস্ট
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ডকুমেন্টের ৪টি কোণা টেনে নিখুঁত করুন (লাইভ জুম লেন্স সহ)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Workspace */}
        <div
          ref={containerRef}
          className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden touch-none select-none"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="cursor-crosshair max-w-full block"
          />

          {/* Floating Instruction Badge */}
          <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-full border border-slate-700/60 shadow-lg flex items-center gap-1.5 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>যেকোনো পিন ড্র্যাগ করে কাগজের কোণায় বসান</span>
          </div>
        </div>

        {/* Action Controls & Presets */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCamScannerInset}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 hover:border-emerald-500 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="টেবিল বা আঙুল বাদ দিতে ২% ভেতরে ইনসেট করুন"
            >
              <Crop className="w-3.5 h-3.5 text-emerald-600" />
              ইনসেট ক্রপ (-২%)
            </button>
            <button
              type="button"
              onClick={handleAutoDetect}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-cyan-500 text-slate-700 hover:text-cyan-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              অটো ডিটেক্ট
            </button>
            <button
              type="button"
              onClick={handleFullImage}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
              পুরো ছবি
            </button>
            <button
              type="button"
              onClick={handleRotate90}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
              ৯০° ঘোরান
            </button>
          </div>

          {/* Confirm & Cancel Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-gradient-to-r from-teal-600 via-cyan-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              নিশ্চিত করুন ও সোজা করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
