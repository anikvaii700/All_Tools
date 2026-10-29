import React, { useRef, useState, useEffect } from 'react';

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSignature?: string;
  onSaveSignature: (signatureDataUrl: string) => void;
  onClearSignature: () => void;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  isOpen,
  onClose,
  currentSignature,
  onSaveSignature,
  onClearSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a'); // Classic dark navy ink
  const [penWidth, setPenWidth] = useState(2.5);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Ensure proper canvas pixel resolution for crisp strokes
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Clear with transparency
      ctx.clearRect(0, 0, rect.width, rect.height);

      if (currentSignature) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
        };
        img.src = currentSignature;
      } else {
        setHasDrawn(false);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, currentSignature]);

  if (!isOpen) return null;

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
    setHasDrawn(true);
    canvas.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture already released
      }
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      onClose();
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSignature(dataUrl);
    onClose();
  };

  const handleDelete = () => {
    onClearSignature();
    handleClear();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-wide">
                ডিজিটাল স্বাক্ষর (বিক্রেতার দস্তখত)
              </h3>
              <p className="text-[11px] text-blue-100 font-medium">
                মোবাইলে আঙুল দিয়ে বা কম্পিউটারে মাউস দিয়ে স্বাক্ষর দিন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col items-center">
          {/* Controls Bar */}
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">কালি:</span>
              <button
                type="button"
                onClick={() => setPenColor('#1e3a8a')}
                className={`w-6 h-6 rounded-full bg-blue-900 border-2 transition ${
                  penColor === '#1e3a8a' ? 'scale-110 border-amber-400 ring-2 ring-blue-500' : 'border-transparent'
                }`}
                title="গাঢ় নীল কালি"
              />
              <button
                type="button"
                onClick={() => setPenColor('#09090b')}
                className={`w-6 h-6 rounded-full bg-black border-2 transition ${
                  penColor === '#09090b' ? 'scale-110 border-amber-400 ring-2 ring-slate-700' : 'border-transparent'
                }`}
                title="কালো কালি"
              />
              <button
                type="button"
                onClick={() => setPenColor('#b91c1c')}
                className={`w-6 h-6 rounded-full bg-red-700 border-2 transition ${
                  penColor === '#b91c1c' ? 'scale-110 border-amber-400 ring-2 ring-red-500' : 'border-transparent'
                }`}
                title="লাল কালি"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">পুরুত্ব:</span>
              <button
                type="button"
                onClick={() => setPenWidth(2)}
                className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                  penWidth === 2 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                }`}
              >
                চিকন
              </button>
              <button
                type="button"
                onClick={() => setPenWidth(3.5)}
                className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                  penWidth === 3.5 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                }`}
              >
                মাঝারি
              </button>
            </div>
          </div>

          {/* Interactive Pad */}
          <div className="w-full relative border-2 border-dashed border-indigo-300 rounded-xl overflow-hidden bg-slate-50/50 shadow-inner">
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              className="w-full h-44 sm:h-52 bg-white touch-none cursor-crosshair block"
              style={{ touchAction: 'none' }}
            />
            {/* Guide Baseline */}
            <div className="absolute bottom-8 left-6 right-6 border-b border-dashed border-slate-300 pointer-events-none flex items-center justify-between text-[10px] text-slate-400 select-none">
              <span>স্বাক্ষর রেখা (Sign here)</span>
              <span>✕</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 text-center">
            💡 স্বাক্ষর আঁকার পর 'সংরক্ষণ করুন' বাটনে চাপ দিন। এটি মেমো ও প্রিন্টে দেখা যাবে।
          </p>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition active:scale-95"
            >
              🔄 নতুন করে আঁকুন
            </button>
            {currentSignature && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-50 transition active:scale-95"
              >
                🗑️ স্বাক্ষর মুছুন
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md hover:from-blue-700 hover:to-indigo-700 transition active:scale-95"
            >
              ✓ স্বাক্ষর সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
