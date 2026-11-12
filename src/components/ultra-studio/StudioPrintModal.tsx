import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileText,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { triggerUniversalPrint, createPrintableHtmlBlobUrl } from './photoArranger';

interface StudioPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageImages: string[];
  paperSize: string;
  orientation: string;
  totalPhotos?: number;
  onDownloadPdf: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const StudioPrintModal: React.FC<StudioPrintModalProps> = ({
  isOpen,
  onClose,
  pageImages,
  paperSize,
  orientation,
  totalPhotos,
  onDownloadPdf,
  onShowToast,
}) => {
  const [activePage, setActivePage] = useState<number>(0);

  // Pre-generate a standalone printable HTML blob URL
  const printableBlobUrl = useMemo(() => {
    if (!pageImages || pageImages.length === 0) return '';
    try {
      return createPrintableHtmlBlobUrl(pageImages, { paperSize, orientation });
    } catch (e) {
      console.warn('Failed to generate printable blob URL:', e);
      return '';
    }
  }, [pageImages, paperSize, orientation]);

  if (!isOpen || pageImages.length === 0) return null;

  // Direct Browser & System Printer trigger
  const handleTriggerBrowserPrint = () => {
    onShowToast('প্রিন্টার উইন্ডো ওপেন হচ্ছে... প্রিন্টার সিলেক্ট করুন।', '🖨️');

    try {
      // 1. Mount universal print root with exact paper size & orientation
      triggerUniversalPrint(
        pageImages,
        { paperSize, orientation },
        onShowToast
      );

      // 2. Synchronous window.print() call in the active user event frame
      window.focus();
      window.print();
    } catch (err) {
      console.warn('Direct print error:', err);
      // Fallback: if browser iframe blocks modal print, offer new tab
      if (printableBlobUrl) {
        onShowToast('ব্রাউজারের সুরক্ষার কারণে নতুন ট্যাবে প্রিন্টার ওপেন হচ্ছে...', '🖨️');
        const link = document.createElement('a');
        link.href = printableBlobUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 border border-indigo-400/40 flex items-center justify-center text-white shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                সরাসরি প্রিন্ট ও প্রিন্টার অপশন
              </h3>
              <p className="text-xs text-indigo-200">
                কাগজ: {paperSize} ({orientation === 'portrait' ? 'লম্বালম্বি' : 'আড়াআড়ি'}) • মোট {pageImages.length}টি পেজ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Main Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Direct Print Button */}
            <button
              type="button"
              onClick={handleTriggerBrowserPrint}
              className="p-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition flex items-start gap-3 cursor-pointer text-left group border border-emerald-500/40"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/80 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                <Printer className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-sm">১। প্রিন্টার ডায়ালগ খুলুন</p>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-medium">ইনস্ট্যান্ট</span>
                </div>
                <p className="text-[11px] text-emerald-100 mt-1 leading-snug">
                  Epson, Canon, HP বা যেকোনো প্রিন্টার সিলেক্ট করে সরাসরি প্রিন্ট করুন
                </p>
              </div>
            </button>

            {/* 2. Print-Ready PDF Button */}
            <button
              type="button"
              onClick={() => {
                onDownloadPdf();
                onShowToast('১০০% আসল স্কেলের প্রিন্ট-রেডি PDF ডাউনলোড হচ্ছে!', '📄');
              }}
              className="p-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition flex items-start gap-3 cursor-pointer text-left group border border-indigo-500/40"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/80 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-sm">২। প্রিন্ট-রেডি PDF ফাইল</p>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-medium">ভেক্টর কোয়ালিটি</span>
                </div>
                <p className="text-[11px] text-indigo-100 mt-1 leading-snug">
                  ১০০% আসল স্কেলের মিলিমিটার নির্ভুল প্রিন্ট ফাইল
                </p>
              </div>
            </button>
          </div>

          {/* Fallback / Direct Browser Tab Print Anchor */}
          {printableBlobUrl && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs text-slate-700 font-medium">
                  ব্রাউজারে সরাসরি প্রিন্ট প্রিভিউ উইন্ডো খুলতে চান?
                </span>
              </div>
              <a
                href={printableBlobUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onShowToast('নতুন ট্যাবে প্রিন্ট পেজ ওপেন হয়েছে!', '🖨️')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
              >
                <span>ব্রাউজার ট্যাবে প্রিন্ট করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Printer Settings Guidance */}
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs space-y-1.5 text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>নিখুঁত প্রিন্ট নিশ্চিত করার সহজ নিয়ম:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900/90 pl-1 leading-relaxed">
              <li>
                <strong>কাগজের সাইজ (Paper Size):</strong> {paperSize} সিলেক্ট করুন।
              </li>
              <li>
                <strong>স্কেল (Scale):</strong> অবশ্যই <strong>100% (Actual Size)</strong> রাখবেন। "Fit to printable area" বা পেজ সংক্ষেপণ করবেন না।
              </li>
              <li>
                <strong>প্রিন্ট কোয়ালিটি:</strong> ফটো পেপারের জন্য "High Quality" বা "Photo Paper Glossy" দিলে স্পষ্ট ছবি আসবে।
              </li>
            </ul>
          </div>

          {/* Printable Sheet Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">প্রিন্ট প্রিভিউ:</span>
              {pageImages.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {pageImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePage(idx)}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activePage === idx
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      পেজ {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 flex items-center justify-center max-h-[250px] overflow-hidden">
              <img
                src={pageImages[activePage]}
                alt={`Page ${activePage + 1}`}
                className="max-h-[230px] w-auto shadow-md rounded bg-white object-contain border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            The MoSaFa Tools • Ultra Digital Studio
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
