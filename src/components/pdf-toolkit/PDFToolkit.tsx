import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Files,
  Scissors,
  Minimize2,
  Image as ImageIcon,
  RotateCw,
  Trash2,
  Bookmark,
  ShieldCheck,
  Download,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MoveUp,
  MoveDown,
  Layers,
  FileCheck,
  Type,
  FileArchive,
  RefreshCw,
  Eraser,
  PenTool,
} from 'lucide-react';

import { PDFSubTool, PDFFileItem, ImageToPdfOptions, PageNumberOptions, WatermarkOptions, PdfMetadata, CompressionResult } from './types';
import {
  formatBytes,
  readFileAsArrayBuffer,
  readFileAsDataURL,
  downloadFile,
  getPdfPageCount,
  mergePDFs,
  splitPDF,
  compressPDF,
  rotatePDFPages,
  organizePDFPages,
  convertImagesToPDF,
  convertPdfToImages,
  createZipArchive,
  addPageNumbers,
  addWatermark,
  getPDFMetadata,
  editPDFMetadata,
} from './pdfServices';
import { jsPDF } from 'jspdf';
import { PDFVisualEditor } from './PDFVisualEditor';

interface PDFToolkitProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const PDFToolkit: React.FC<PDFToolkitProps> = ({ onBackToHub, onShowToast }) => {
  const [activeSubTool, setActiveSubTool] = useState<PDFSubTool>('dashboard');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<string>('');

  // Selected files state
  const [files, setFiles] = useState<PDFFileItem[]>([]);
  const [images, setImages] = useState<{ id: string; file: File; dataUrl: string; width: number; height: number }[]>([]);

  // SubTool Specific Settings
  // 1. Split settings
  const [splitMode, setSplitMode] = useState<'all' | 'range' | 'selected'>('all');
  const [splitRange, setSplitRange] = useState<string>('1-3, 5');

  // 2. Compress settings
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);

  // 3. Images to PDF options
  const [imgOptions, setImgOptions] = useState<ImageToPdfOptions>({
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 'none',
    fit: 'fit',
  });

  // 4. PDF to Images options
  const [pdfToImgFormat, setPdfToImgFormat] = useState<'png' | 'jpg'>('png');
  const [pdfToImgScale, setPdfToImgScale] = useState<number>(1.5);
  const [generatedImages, setGeneratedImages] = useState<{ pageNumber: number; dataUrl: string }[]>([]);

  // 5. Rotate options
  const [rotateAngle, setRotateAngle] = useState<number>(90);

  // 6. Page Numbers
  const [pageNumberOptions, setPageNumberOptions] = useState<PageNumberOptions>({
    position: 'bottom-center',
    format: 'page-n-of-total',
    startFrom: 1,
    fontSize: 11,
    color: '#000000',
    allPages: true,
  });

  // 7. Watermark
  const [watermarkOptions, setWatermarkOptions] = useState<WatermarkOptions>({
    type: 'text',
    text: 'CONFIDENTIAL',
    fontSize: 48,
    fontColor: '#94a3b8',
    opacity: 0.3,
    rotation: 45,
    imageScale: 0.4,
    allPages: true,
  });

  // 8. Metadata
  const [metadata, setMetadata] = useState<PdfMetadata>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
  });

  // Output filename
  const [outputFilename, setOutputFilename] = useState<string>('mosafa-document.pdf');
  const [processedPdfData, setProcessedPdfData] = useState<Uint8Array | null>(null);

  // Dedicated In-Place PDF Direct Edit Upload
  const handleDirectEditUpload = async (uploadedFile: File) => {
    setIsProcessing(true);
    setProcessProgress('ডকুমেন্ট প্রসেস হচ্ছে...');
    try {
      const buffer = await readFileAsArrayBuffer(uploadedFile);
      const pageCount = await getPdfPageCount(buffer).catch(() => 1);
      const item: PDFFileItem = {
        id: `file_direct_${Date.now()}`,
        file: uploadedFile,
        name: uploadedFile.name,
        size: uploadedFile.size,
        pageCount,
        dataBuffer: buffer,
      };
      setFiles([item]);
      setActiveSubTool('edit-text');
      onShowToast(`"${uploadedFile.name}" সফলভাবে লোড হয়েছে! যেকোনো লেখার উপর ক্লিক করে সরাসরি সম্পাদন করুন ✍️`, '✨');
    } catch (err) {
      console.error(err);
      onShowToast('ফাইল লোড করতে সমস্যা হয়েছে', '⚠️');
    } finally {
      setIsProcessing(false);
      setProcessProgress('');
    }
  };

  // Pre-loaded Demo PDF for instant in-place testing
  const handleOpenDemoInEditor = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("MoSaFa PDF Toolkit - Demo Document", 20, 30);
      doc.setFontSize(13);
      doc.text("1. Click directly on this sentence to edit and replace the text in-place.", 20, 48);
      doc.text("2. Auto-whiteout covers up the original text underneath seamlessly.", 20, 60);
      doc.text("3. You can change font size, text color, bold, or add new text anywhere.", 20, 72);
      doc.text("4. Use the Whiteout tool to erase unwanted stamps or signatures.", 20, 84);
      doc.setFontSize(14);
      doc.text("User Name: Mofassir Ahmed", 20, 110);
      doc.text("Designation: Senior Software Engineer", 20, 125);
      doc.text("Location: Dhaka, Bangladesh", 20, 140);
      doc.text("Date: 24 May, 2026", 20, 155);
      const pdfBlob = doc.output('blob');
      const demoFile = new File([pdfBlob], 'demo-sample-document.pdf', { type: 'application/pdf' });
      handleDirectEditUpload(demoFile);
    } catch (e) {
      console.error(e);
      setActiveSubTool('edit-text');
    }
  };

  // File Upload Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    setIsProcessing(true);
    setProcessProgress('ফাইল যাচাই ও পেজ কাউন্ট করা হচ্ছে...');

    try {
      const newItems: PDFFileItem[] = [];

      for (let i = 0; i < uploaded.length; i++) {
        const file = uploaded[i];
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          onShowToast(`"${file.name}" একটি বৈধ PDF ফাইল নয়`, '⚠️');
          continue;
        }

        const buffer = await readFileAsArrayBuffer(file);
        const pageCount = await getPdfPageCount(buffer);

        newItems.push({
          id: `file_${Date.now()}_${i}`,
          file,
          name: file.name,
          size: file.size,
          pageCount,
          dataBuffer: buffer,
        });

        // If metadata tool, auto-populate with first file metadata
        if (activeSubTool === 'metadata' && i === 0) {
          const meta = await getPDFMetadata(buffer);
          setMetadata(meta);
        }
      }

      setFiles((prev) => (activeSubTool === 'merge' ? [...prev, ...newItems] : newItems));
      setOutputFilename(newItems[0]?.name ? `mosafa-${newItems[0].name}` : 'mosafa-document.pdf');
      setProcessedPdfData(null);
      setCompressionResult(null);
      setGeneratedImages([]);
      onShowToast(`${newItems.length}টি PDF ফাইল যুক্ত হয়েছে!`, '📄');
    } catch (err) {
      console.error(err);
      onShowToast('ফাইল লোড করতে ব্যর্থ হয়েছে', '⚠️');
    } finally {
      setIsProcessing(false);
      setProcessProgress('');
    }
  };

  // Image Upload Handlers for ImagesToPDF
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files;
    if (!uploaded || uploaded.length === 0) return;

    const newImgs: { id: string; file: File; dataUrl: string; width: number; height: number }[] = [];

    for (let i = 0; i < uploaded.length; i++) {
      const file = uploaded[i];
      if (!file.type.startsWith('image/')) {
        onShowToast(`"${file.name}" ছবি ফরম্যাট নয়`, '⚠️');
        continue;
      }
      const dataUrl = await readFileAsDataURL(file);
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          newImgs.push({
            id: `img_${Date.now()}_${i}`,
            file,
            dataUrl,
            width: img.width,
            height: img.height,
          });
          resolve();
        };
        img.src = dataUrl;
      });
    }

    setImages((prev) => [...prev, ...newImgs]);
    setOutputFilename('mosafa-images.pdf');
    onShowToast(`${newImgs.length}টি ছবি যুক্ত হয়েছে!`, '🖼️');
  };

  // Remove File
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setProcessedPdfData(null);
  };

  // Move File in Merge list
  const handleMoveFile = (idx: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === files.length - 1)) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...files];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFiles(updated);
  };

  // Process Actions
  const handleProcessAction = async () => {
    if (activeSubTool === 'images-to-pdf') {
      if (images.length === 0) {
        onShowToast('দয়া করে অন্তত একটি ছবি নির্বাচন করুন', '⚠️');
        return;
      }
    } else {
      if (files.length === 0 || !files[0].dataBuffer) {
        onShowToast('দয়া করে অন্তত একটি PDF ফাইল আপলোড করুন', '⚠️');
        return;
      }
    }

    setIsProcessing(true);
    setProcessProgress('PDF প্রসেসিং চলছে... ব্রাউজারে সুরক্ষিতভাবে কাজ সম্পন্ন হচ্ছে');

    try {
      if (activeSubTool === 'merge') {
        const buffers = files.map((f) => f.dataBuffer!).filter(Boolean);
        const merged = await mergePDFs(buffers);
        setProcessedPdfData(merged);
        setOutputFilename('mosafa-merged.pdf');
        onShowToast('সবগুলো PDF সফলভাবে মার্জ হয়েছে! 📄✨', '✅');
      } else if (activeSubTool === 'split') {
        const results = await splitPDF(files[0].dataBuffer!, splitMode, splitRange);
        if (results.length === 1) {
          setProcessedPdfData(results[0].data);
          setOutputFilename(results[0].name);
        } else {
          // Multiple files -> create ZIP
          const zipBlob = await createZipArchive(results.map((r) => ({ filename: r.name, data: r.data })));
          downloadFile(zipBlob, 'mosafa-split-pages.zip', 'application/zip');
          onShowToast(`${results.length}টি বিভক্ত পৃষ্ঠা ZIP আকারে তৈরি হয়েছে!`, '📦');
        }
      } else if (activeSubTool === 'compress') {
        const result = await compressPDF(files[0].dataBuffer!, compressLevel);
        setCompressionResult(result);
        setProcessedPdfData(result.pdfData);
        setOutputFilename(`compressed-${files[0].name}`);
        onShowToast(`কম্প্রেশন সম্পন্ন! ${result.savedPercent}% সাইজ হ্রাস পেয়েছে`, '📉');
      } else if (activeSubTool === 'images-to-pdf') {
        const pdfBytes = await convertImagesToPDF(images, imgOptions);
        setProcessedPdfData(pdfBytes);
        setOutputFilename('mosafa-images.pdf');
        onShowToast('ছবিগুলো সফলভাবে PDF এ রূপান্তর হয়েছে! 📄', '✅');
      } else if (activeSubTool === 'pdf-to-images') {
        const imgs = await convertPdfToImages(files[0].dataBuffer!, pdfToImgFormat, pdfToImgScale);
        setGeneratedImages(imgs);
        onShowToast(`${imgs.length}টি পৃষ্ঠা সফলভাবে ছবিতে রূপান্তর হয়েছে! 🖼️`, '✅');
      } else if (activeSubTool === 'rotate') {
        const rotated = await rotatePDFPages(files[0].dataBuffer!, rotateAngle);
        setProcessedPdfData(rotated);
        setOutputFilename(`rotated-${files[0].name}`);
        onShowToast(`PDF ${rotateAngle}° কোণে ঘোরানো হয়েছে! 🔄`, '✅');
      } else if (activeSubTool === 'page-numbers') {
        const numbered = await addPageNumbers(files[0].dataBuffer!, pageNumberOptions);
        setProcessedPdfData(numbered);
        setOutputFilename(`numbered-${files[0].name}`);
        onShowToast('পৃষ্ঠা নম্বর সফলভাবে যুক্ত হয়েছে! 🔢', '✅');
      } else if (activeSubTool === 'watermark') {
        const watermarked = await addWatermark(files[0].dataBuffer!, watermarkOptions);
        setProcessedPdfData(watermarked);
        setOutputFilename(`watermarked-${files[0].name}`);
        onShowToast('ওয়াটারমার্ক যুক্ত হয়েছে! 🛡️', '✅');
      } else if (activeSubTool === 'metadata') {
        const edited = await editPDFMetadata(files[0].dataBuffer!, metadata);
        setProcessedPdfData(edited);
        setOutputFilename(`updated-${files[0].name}`);
        onShowToast('ডকুমেন্ট মেটাডাটা আপডেট হয়েছে! 💾', '✅');
      }
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'PDF প্রক্রিয়াকরণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', '⚠️');
    } finally {
      setIsProcessing(false);
      setProcessProgress('');
    }
  };

  // If user selected the visual editor
  if (activeSubTool === 'edit-text') {
    return (
      <PDFVisualEditor
        initialFile={files[0]?.file || null}
        onShowToast={onShowToast}
        onBackToDashboard={() => setActiveSubTool('dashboard')}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* Top Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={activeSubTool === 'dashboard' ? onBackToHub : () => setActiveSubTool('dashboard')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{activeSubTool === 'dashboard' ? 'সকল টুলস' : 'PDF টুলবক্স ড্যাশবোর্ড'}</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900">MoSaFa PDF Toolkit</h1>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                  PDF টুলবক্স ⚡
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                PDF Merge, Split, Compress, Rotate, Image to PDF, টেক্সট এডিটর ও সার্বিক সমাধান
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>১০০% ক্লায়েন্ট-সাইড ব্রাউজার প্রসেসিং</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col">
        {/* Privacy Advisory Banner */}
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 flex items-center justify-between gap-3 shadow-xs flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                আপনার তথ্যের গোপনীয়তা শতভাগ সুরক্ষিত
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                আপনার PDF ফাইল এই ডিভাইসের ব্রাউজারেই প্রক্রিয়া করা হয়। কোনো বাহ্যিক সার্ভারে আপলোড করা হয় না।
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-full border border-emerald-300">
            🔒 নো সার্ভার আপলোড
          </span>
        </div>

        {/* 1. DASHBOARD VIEW (When no sub-tool is selected) */}
        {activeSubTool === 'dashboard' ? (
          <div>
            {/* PROMINENT DEDICATED IN-PLACE PDF LIVE EDITOR SECTION */}
            <div className="mb-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              {/* Background Glows */}
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Left Information */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold text-[11px] mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>সরাসরি লাইভ এডিটর (Direct In-Place Edit)</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mb-2">
                    PDF ডকুমেন্টের উপরেই সরাসরি ধরে ধরে এডিট করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed mb-4">
                    যেকোনো PDF ফাইল আপলোড করুন — ডকুমেন্টের প্রতিটি লাইন বা শব্দ সরাসরি ক্লিক করে ধরুন এবং ঠিক সেখানেই নিজের পছন্দের ফন্ট ও সাইজে টাইপ করে এডিট ও সংশোধন করুন!
                  </p>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl text-[11px] font-bold text-slate-200 mb-4">
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-emerald-400">👆</span>
                      <span>ক্লিক করে সরাসরি এডিট</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-yellow-400">🩹</span>
                      <span>অটো হোয়াইটআউট কভার</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-sky-400">🔤</span>
                      <span>বাংলা ও ইংরেজি ফন্ট</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-purple-400">✍️</span>
                      <span>নতুন লেখা ও সিগনেচার</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-pink-400">📏</span>
                      <span>ফন্ট সাইজ ও কালার</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-teal-400">📥</span>
                      <span>এক ক্লিকে PDF ডাউনলোড</span>
                    </div>
                  </div>
                </div>

                {/* Right Upload Drag & Drop Area */}
                <div className="w-full lg:w-96 shrink-0">
                  <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-dashed border-indigo-400/50 hover:border-emerald-400 hover:bg-white/15 transition-all text-center relative group shadow-lg cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,application/pdf,image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleDirectEditUpload(f);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-yellow-300" />
                    </div>
                    <h4 className="text-sm font-extrabold text-white mb-1">
                      PDF ফাইল নির্বাচন করুন বা এখানে ছাড়ুন
                    </h4>
                    <p className="text-[11px] text-slate-300 mb-3">
                      ব্রাউজারে নিরাপদ ও অফলাইনে সরাসরি ডকুমেন্টে এডিট হবে
                    </p>
                    <div className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:from-emerald-400 group-hover:to-teal-400 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>PDF আপলোড করে এডিট শুরু করুন</span>
                    </div>
                  </div>

                  {/* Demo test button */}
                  <div className="mt-2.5 text-center">
                    <button
                      type="button"
                      onClick={handleOpenDemoInEditor}
                      className="text-[11px] font-bold text-indigo-300 hover:text-white underline underline-offset-4 cursor-pointer transition"
                    >
                      ⚡ কোনো ফাইল ছাড়া ডেমো ফাইলে এখনই পরীক্ষা করুন
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">জনপ্রিয় PDF টুলসমূহ</h2>
                <p className="text-xs text-slate-500">আপনার প্রয়োজনীয় কাজটি বেছে নিন:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* SPECIAL TOOL: DIRECT TEXT & LINE EDITOR */}
              <div
                onClick={() => setActiveSubTool('edit-text')}
                className="p-5 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition duration-200 cursor-pointer group flex flex-col justify-between border border-rose-400 relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-yellow-400 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-wider">
                  স্পেশাল ফিচার 🔥
                </div>
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3">
                    <Eraser className="w-6 h-6 text-yellow-300" />
                  </div>
                  <h3 className="text-base font-bold mb-1">সরাসরি টেক্সট ও শব্দ সংশোধন</h3>
                  <p className="text-xs text-rose-100 leading-relaxed mb-4">
                    PDF বা ছবিতে যেকোনো লাইন বা শব্দ হোয়াইটআউট করে মুছে ঠিক সেই জায়গায় একই ফন্টে নতুন লেখা বসান।
                  </p>
                </div>
                <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-yellow-200">
                  <span>এডিটর চালু করুন</span>
                  <span>➔</span>
                </div>
              </div>

              {/* Merge PDF */}
              <ToolCard
                icon={<Files className="w-6 h-6 text-rose-600" />}
                iconBg="bg-rose-50"
                title="PDF মার্জ (Merge PDF)"
                badge="সবচেয়ে জনপ্রিয়"
                badgeColor="bg-rose-50 text-rose-700"
                description="একাধিক PDF ফাইলকে নিজের পছন্দের ধারাবাহিকতায় একত্রিত করে একটি ফাইলে রূপান্তর করুন।"
                onClick={() => setActiveSubTool('merge')}
              />

              {/* Split PDF */}
              <ToolCard
                icon={<Scissors className="w-6 h-6 text-indigo-600" />}
                iconBg="bg-indigo-50"
                title="PDF স্প্লিট (Split PDF)"
                badge="পেজ ভাগ"
                badgeColor="bg-indigo-50 text-indigo-700"
                description="বড় PDF থেকে প্রতিটি পৃষ্ঠা আলাদা করুন অথবা নির্দিষ্ট রেঞ্জ (১-৩, ৫) অনুযায়ী কেটে বের করুন।"
                onClick={() => setActiveSubTool('split')}
              />

              {/* Compress PDF */}
              <ToolCard
                icon={<Minimize2 className="w-6 h-6 text-emerald-600" />}
                iconBg="bg-emerald-50"
                title="PDF কম্প্রেস (Compress Size)"
                badge="সাইজ কমান"
                badgeColor="bg-emerald-50 text-emerald-700"
                description="গুণগত মান অক্ষুণ্ণ রেখে PDF ফাইলের আকার (MB থেকে KB) কমিয়ে দ্রুত আপলোড উপযোগী করুন।"
                onClick={() => setActiveSubTool('compress')}
              />

              {/* Images to PDF */}
              <ToolCard
                icon={<ImageIcon className="w-6 h-6 text-amber-600" />}
                iconBg="bg-amber-50"
                title="ছবি থেকে PDF (Images to PDF)"
                badge="JPG/PNG to PDF"
                badgeColor="bg-amber-50 text-amber-800"
                description="JPG, PNG বা WebP ছবিগুলো যুক্ত করে এক ক্লিকে প্রফেশনাল A4 সাইজ PDF ডকুমেন্টে পরিণত করুন।"
                onClick={() => setActiveSubTool('images-to-pdf')}
              />

              {/* PDF to Images */}
              <ToolCard
                icon={<ImageIcon className="w-6 h-6 text-purple-600" />}
                iconBg="bg-purple-50"
                title="PDF থেকে ছবি (PDF to Images)"
                badge="PDF to JPG/PNG"
                badgeColor="bg-purple-50 text-purple-700"
                description="PDF ফাইলের পৃষ্ঠাগুলোকে পরিষ্কার ও ঝকঝকে ছবিতে কনভার্ট করে এক ক্লিকে বা ZIP হিসেবে নামান।"
                onClick={() => setActiveSubTool('pdf-to-images')}
              />

              {/* Rotate PDF */}
              <ToolCard
                icon={<RotateCw className="w-6 h-6 text-sky-600" />}
                iconBg="bg-sky-50"
                title="পৃষ্ঠা ঘোরানো (Rotate PDF)"
                badge="৯০°/১৮০°"
                badgeColor="bg-sky-50 text-sky-700"
                description="উল্টো বা বাঁকা পৃষ্ঠাগুলোকে সঠিক অভিমুখে ঘুরিয়ে সোজা ও পড়ার উপযোগী করুন।"
                onClick={() => setActiveSubTool('rotate')}
              />

              {/* Add Page Numbers */}
              <ToolCard
                icon={<Bookmark className="w-6 h-6 text-teal-600" />}
                iconBg="bg-teal-50"
                title="পৃষ্ঠা নম্বর যোগ (Page Numbers)"
                badge="নম্বর বসান"
                badgeColor="bg-teal-50 text-teal-700"
                description="ডকুমেন্টের উপরে বা নিচে সুন্দর ও সুশৃঙ্খলভাবে পেজ নম্বর ও 'Page X of Y' ফরম্যাট যোগ করুন।"
                onClick={() => setActiveSubTool('page-numbers')}
              />

              {/* Add Watermark */}
              <ToolCard
                icon={<ShieldCheck className="w-6 h-6 text-blue-600" />}
                iconBg="bg-blue-50"
                title="ওয়াটারমার্ক যোগ (Add Watermark)"
                badge="কপিরাইট রক্ষা"
                badgeColor="bg-blue-50 text-blue-700"
                description="অননুমোদিত কপি ঠেকাতে ডকুমেন্টে আড়াআড়ি নিজস্ব নাম, সিল বা লোগোর জলছাপ বসান।"
                onClick={() => setActiveSubTool('watermark')}
              />

              {/* Edit Metadata */}
              <ToolCard
                icon={<FileText className="w-6 h-6 text-slate-700" />}
                iconBg="bg-slate-100"
                title="মেটাডাটা এডিটর (Edit Metadata)"
                badge="ডকুমেন্ট তথ্য"
                badgeColor="bg-slate-100 text-slate-800"
                description="ফাইলের টাইটেল, লেখক, বিষয় ও কীওয়ার্ড পরিবর্তন করে অফিশিয়াল লুক দিন।"
                onClick={() => setActiveSubTool('metadata')}
              />
            </div>
          </div>
        ) : (
          /* 2. SUBTOOL PROCESSING WORKSPACE */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
            {/* Tool Banner Header */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100 flex-wrap gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{getSubToolTitle(activeSubTool)}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{getSubToolDesc(activeSubTool)}</p>
              </div>
              <button
                onClick={() => {
                  setFiles([]);
                  setImages([]);
                  setProcessedPdfData(null);
                  setActiveSubTool('dashboard');
                }}
                className="text-xs text-slate-500 hover:text-rose-600 font-bold cursor-pointer"
              >
                টুল পরিবর্তন করুন
              </button>
            </div>

            {/* A. FILE UPLOAD BOX */}
            {activeSubTool === 'images-to-pdf' ? (
              /* Image Upload Area */
              <div className="mb-6">
                <label className="block font-bold text-slate-700 text-xs mb-2">ছবি আপলোড করুন (JPG, PNG, WebP):</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 text-center bg-slate-50/70 hover:bg-emerald-50/30 transition cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <ImageIcon className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-800 block">
                    ছবি সিলেক্ট করুন অথবা ড্র্যাগ করে ছেড়ে দিন
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">একাধিক ছবি একসাথে যুক্ত করা যাবে</span>
                </div>

                {/* Uploaded Images List */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {images.map((img, idx) => (
                      <div key={img.id} className="relative group rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                        <img src={img.dataUrl} alt="Thumbnail" className="w-full h-24 object-cover" />
                        <div className="p-1.5 text-center bg-slate-900/80 text-white text-[10px] truncate">
                          পৃষ্ঠা {idx + 1}
                        </div>
                        <button
                          onClick={() => setImages((prev) => prev.filter((item) => item.id !== img.id))}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-sm opacity-90 hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* PDF Upload Area */
              <div className="mb-6">
                <label className="block font-bold text-slate-700 text-xs mb-2">
                  {activeSubTool === 'merge' ? 'PDF ফাইলসমূহ নির্বাচন করুন (একাধিক ফাইল যোগ করতে পারেন):' : 'PDF ফাইল নির্বাচন করুন:'}
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-8 text-center bg-slate-50/70 hover:bg-emerald-50/30 transition cursor-pointer relative">
                  <input
                    type="file"
                    multiple={activeSubTool === 'merge'}
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileText className="w-10 h-10 text-rose-600 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-800 block">
                    PDF ফাইল ক্লিক করে বাছুন অথবা ড্র্যাগ করে ছাড়ুন
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {activeSubTool === 'merge' ? 'একাধিক PDF ফাইল যোগ করা যাবে' : 'ব্রাউজারে দ্রুত প্রসেসিং হবে'}
                  </span>
                </div>

                {/* Uploaded Files Table */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-slate-100/80 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-5 h-5 text-rose-600 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-slate-900 truncate block">{item.name}</span>
                            <span className="text-[10px] text-slate-500">
                              সাইজ: {formatBytes(item.size)} {item.pageCount ? `• মোট পৃষ্ঠা: ${item.pageCount}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {activeSubTool === 'merge' && (
                            <>
                              <button
                                onClick={() => handleMoveFile(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 hover:bg-white rounded disabled:opacity-30 cursor-pointer"
                                title="উপরে তুলুন"
                              >
                                <MoveUp className="w-3.5 h-3.5 text-slate-700" />
                              </button>
                              <button
                                onClick={() => handleMoveFile(idx, 'down')}
                                disabled={idx === files.length - 1}
                                className="p-1 hover:bg-white rounded disabled:opacity-30 cursor-pointer"
                                title="নিচে নামান"
                              >
                                <MoveDown className="w-3.5 h-3.5 text-slate-700" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleRemoveFile(item.id)}
                            className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* B. TOOL SPECIFIC CONTROLS & SETTINGS */}
            {/* 1. Split Controls */}
            {activeSubTool === 'split' && (
              <div className="mb-6 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-3">
                <span className="font-bold text-indigo-950 block">পৃষ্ঠা বিভাজনের ধরণ নির্বাচন করুন:</span>
                <div className="flex gap-4 flex-wrap">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'all'}
                      onChange={() => setSplitMode('all')}
                    />
                    <span>প্রতিটি পৃষ্ঠা আলাদা PDF করুন</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="splitMode"
                      checked={splitMode === 'range'}
                      onChange={() => setSplitMode('range')}
                    />
                    <span>পৃষ্ঠা রেঞ্জ অনুযায়ী (যেমন: 1-3, 5)</span>
                  </label>
                </div>
                {splitMode === 'range' && (
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                      রেঞ্জ লিখুন (কমা দিয়ে একাধিক অংশ দিন):
                    </label>
                    <input
                      type="text"
                      value={splitRange}
                      onChange={(e) => setSplitRange(e.target.value)}
                      placeholder="যেমন: 1-3, 5, 8-10"
                      className="w-full sm:w-64 p-2 rounded-xl border border-indigo-300 bg-white font-bold"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 2. Compress Controls */}
            {activeSubTool === 'compress' && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-3">
                <span className="font-bold text-emerald-950 block">কম্প্রেশন লেভেল নির্বাচন করুন:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCompressLevel('low')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      compressLevel === 'low'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-emerald-200 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">Low Compression</div>
                    <div className="text-[10px] opacity-80 mt-0.5">সর্বোত্তম কোয়ালিটি, সাধারণ হ্রাস</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompressLevel('medium')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      compressLevel === 'medium'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-emerald-200 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">Medium (প্রস্তাবিত)</div>
                    <div className="text-[10px] opacity-80 mt-0.5">ভারসাম্যপূর্ণ কোয়ালিটি ও চমৎকার সাইজ হ্রাস</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompressLevel('high')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      compressLevel === 'high'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-emerald-200 text-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">High Compression</div>
                    <div className="text-[10px] opacity-80 mt-0.5">সবচেয়ে ছোট সাইজ, ইমেইল বা আপলোডের জন্য</div>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Images to PDF Controls */}
            {activeSubTool === 'images-to-pdf' && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-amber-950 mb-1">পৃষ্ঠা সাইজ:</label>
                  <select
                    value={imgOptions.pageSize}
                    onChange={(e) => setImgOptions({ ...imgOptions, pageSize: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-white border border-amber-300 font-bold"
                  >
                    <option value="a4">A4 (Standard)</option>
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                    <option value="original">মূল ছবির সাইজ অনুযায়ী</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-amber-950 mb-1">অরিয়েন্টেশন:</label>
                  <select
                    value={imgOptions.orientation}
                    onChange={(e) => setImgOptions({ ...imgOptions, orientation: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-white border border-amber-300 font-bold"
                  >
                    <option value="portrait">পোর্ট্রেট (খাড়া)</option>
                    <option value="landscape">ল্যান্ডস্কেপ (শোয়ানো)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-amber-950 mb-1">মার্জিন:</label>
                  <select
                    value={imgOptions.margin}
                    onChange={(e) => setImgOptions({ ...imgOptions, margin: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-white border border-amber-300 font-bold"
                  >
                    <option value="none">কোনো মার্জিন নেই (Full Page)</option>
                    <option value="small">ছোট মার্জিন (Small)</option>
                    <option value="normal">সাধারণ মার্জিন (Normal)</option>
                  </select>
                </div>
              </div>
            )}

            {/* 4. Rotate Controls */}
            {activeSubTool === 'rotate' && (
              <div className="mb-6 p-4 rounded-2xl bg-sky-50/60 border border-sky-200 text-xs flex items-center gap-3 flex-wrap">
                <span className="font-bold text-sky-950">ঘোরানোর কোণ নির্বাচন করুন:</span>
                <button
                  type="button"
                  onClick={() => setRotateAngle(90)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                    rotateAngle === 90 ? 'bg-sky-600 text-white' : 'bg-white border text-slate-800'
                  }`}
                >
                  ডানে ৯০° ঘোরান
                </button>
                <button
                  type="button"
                  onClick={() => setRotateAngle(180)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                    rotateAngle === 180 ? 'bg-sky-600 text-white' : 'bg-white border text-slate-800'
                  }`}
                >
                  ১৮০° সম্পূর্ণ উল্টান
                </button>
                <button
                  type="button"
                  onClick={() => setRotateAngle(270)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
                    rotateAngle === 270 ? 'bg-sky-600 text-white' : 'bg-white border text-slate-800'
                  }`}
                >
                  বামে ৯০° ঘোরান
                </button>
              </div>
            )}

            {/* 5. Page Numbers Controls */}
            {activeSubTool === 'page-numbers' && (
              <div className="mb-6 p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-teal-950 mb-1">অবস্থান (Position):</label>
                  <select
                    value={pageNumberOptions.position}
                    onChange={(e) => setPageNumberOptions({ ...pageNumberOptions, position: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-white border border-teal-300 font-bold"
                  >
                    <option value="bottom-center">নিচে মাঝে (Bottom Center)</option>
                    <option value="bottom-right">নিচে ডানে (Bottom Right)</option>
                    <option value="bottom-left">নিচে বামে (Bottom Left)</option>
                    <option value="top-right">উপরে ডানে (Top Right)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-teal-950 mb-1">ফরম্যাট:</label>
                  <select
                    value={pageNumberOptions.format}
                    onChange={(e) => setPageNumberOptions({ ...pageNumberOptions, format: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-white border border-teal-300 font-bold"
                  >
                    <option value="page-n-of-total">Page 1 of 10</option>
                    <option value="page-n">Page 1</option>
                    <option value="number">1, 2, 3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-teal-950 mb-1">ফন্ট সাইজ:</label>
                  <input
                    type="number"
                    min={8}
                    max={24}
                    value={pageNumberOptions.fontSize}
                    onChange={(e) => setPageNumberOptions({ ...pageNumberOptions, fontSize: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-white border border-teal-300 font-bold"
                  />
                </div>
              </div>
            )}

            {/* 6. Watermark Controls */}
            {activeSubTool === 'watermark' && (
              <div className="mb-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-blue-950 mb-1">ওয়াটারমার্ক লেখা:</label>
                    <input
                      type="text"
                      value={watermarkOptions.text}
                      onChange={(e) => setWatermarkOptions({ ...watermarkOptions, text: e.target.value })}
                      placeholder="যেমন: CONFIDENTIAL / গোপনীয়"
                      className="w-full p-2 rounded-xl bg-white border border-blue-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-blue-950 mb-1">স্বচ্ছতা (Opacity):</label>
                    <input
                      type="range"
                      min={0.1}
                      max={0.9}
                      step={0.1}
                      value={watermarkOptions.opacity}
                      onChange={(e) => setWatermarkOptions({ ...watermarkOptions, opacity: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-[10px] text-right text-blue-700">{Math.round(watermarkOptions.opacity * 100)}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Metadata Controls */}
            {activeSubTool === 'metadata' && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-100/70 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">ডকুমেন্ট টাইটেল:</label>
                  <input
                    type="text"
                    value={metadata.title || ''}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">লেখক (Author):</label>
                  <input
                    type="text"
                    value={metadata.author || ''}
                    onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">বিষয়বস্তু (Subject):</label>
                  <input
                    type="text"
                    value={metadata.subject || ''}
                    onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">কীওয়ার্ড (Keywords):</label>
                  <input
                    type="text"
                    value={metadata.keywords || ''}
                    onChange={(e) => setMetadata({ ...metadata, keywords: e.target.value })}
                    className="w-full p-2 rounded-xl bg-white border border-slate-300 font-bold"
                  />
                </div>
              </div>
            )}

            {/* C. ACTION BUTTON */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleProcessAction}
                disabled={isProcessing || (activeSubTool === 'images-to-pdf' ? images.length === 0 : files.length === 0)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>প্রক্রিয়াকরণ চলছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>প্রক্রিয়া শুরু করুন (Start Process)</span>
                  </>
                )}
              </button>

              {processProgress && (
                <span className="text-xs font-bold text-indigo-700 animate-pulse">{processProgress}</span>
              )}
            </div>

            {/* D. DOWNLOAD & RESULTS SECTION */}
            {/* 1. PDF Download Box */}
            {processedPdfData && (
              <div className="mt-8 p-5 rounded-3xl bg-emerald-50 border border-emerald-300 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-extrabold text-emerald-950">
                        আপনার ফাইল সফলভাবে প্রস্তুত হয়েছে! 🎉
                      </h4>
                      <p className="text-xs text-emerald-800">
                        ফাইলের আকার: {formatBytes(processedPdfData.length)}
                        {compressionResult && (
                          <span className="ml-2 font-black text-rose-700">
                            (আগে: {formatBytes(compressionResult.originalSize)} ➔ {compressionResult.savedPercent}% সাশ্রয়)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => downloadFile(processedPdfData, outputFilename)}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>ডাউনলোড করুন ({outputFilename})</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. PDF to Images Results Gallery */}
            {generatedImages.length > 0 && (
              <div className="mt-8 p-5 rounded-3xl bg-purple-50 border border-purple-200">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h4 className="text-sm font-extrabold text-purple-950">
                    তৈরি হওয়া ছবিসমূহ ({generatedImages.length}টি পৃষ্ঠা)
                  </h4>
                  <button
                    onClick={async () => {
                      const filesToZip = generatedImages.map((img) => ({
                        filename: `page-${img.pageNumber}.${pdfToImgFormat}`,
                        data: fetch(img.dataUrl).then((r) => r.blob()) as any,
                      }));
                      // Convert to blobs
                      const resolvedFiles = await Promise.all(
                        generatedImages.map(async (img) => ({
                          filename: `page-${img.pageNumber}.${pdfToImgFormat}`,
                          data: await (await fetch(img.dataUrl)).blob(),
                        }))
                      );
                      const zip = await createZipArchive(resolvedFiles);
                      downloadFile(zip, 'mosafa-pdf-images.zip', 'application/zip');
                      onShowToast('সবগুলো ছবি ZIP আকারে ডাউনলোড হয়েছে! 📦', '🎉');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FileArchive className="w-3.5 h-3.5" />
                    <span>সবগুলো ছবি জিপ (ZIP) ডাউনলোড</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {generatedImages.map((img) => (
                    <div key={img.pageNumber} className="rounded-2xl border border-purple-200 overflow-hidden bg-white shadow-xs">
                      <img src={img.dataUrl} alt={`Page ${img.pageNumber}`} className="w-full h-32 object-contain bg-slate-100" />
                      <div className="p-2 text-center bg-white border-t border-purple-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800">পৃষ্ঠা {img.pageNumber}</span>
                        <a
                          href={img.dataUrl}
                          download={`page-${img.pageNumber}.${pdfToImgFormat}`}
                          className="p-1 rounded-lg hover:bg-purple-100 text-purple-700"
                          title="ডাউনলোড"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Tool Card Component for the Dashboard
const ToolCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  onClick: () => void;
}> = ({ icon, iconBg, title, badge, badgeColor, description, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-200 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <h3 className="text-sm font-extrabold text-slate-900 mb-1 group-hover:text-rose-600 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-rose-600">
        <span>টুল শুরু করুন</span>
        <span>➔</span>
      </div>
    </div>
  );
};

// Helper titles
const getSubToolTitle = (tool: PDFSubTool): string => {
  switch (tool) {
    case 'merge':
      return 'PDF মার্জ (Merge PDF) — একাধিক ফাইল একত্রীকরণ';
    case 'split':
      return 'PDF স্প্লিট (Split PDF) — পৃষ্ঠা বিভাজন';
    case 'compress':
      return 'PDF কম্প্রেস (Compress PDF) — ফাইলের সাইজ কমান';
    case 'images-to-pdf':
      return 'ছবি থেকে PDF (Images to PDF)';
    case 'pdf-to-images':
      return 'PDF থেকে ছবি (PDF to Images)';
    case 'rotate':
      return 'পৃষ্ঠা ঘোরানো (Rotate PDF Pages)';
    case 'page-numbers':
      return 'পৃষ্ঠা নম্বর যোগ (Add Page Numbers)';
    case 'watermark':
      return 'ওয়াটারমার্ক যোগ (Add Watermark)';
    case 'metadata':
      return 'মেটাডাটা এডিটর (Edit Metadata)';
    default:
      return 'PDF টুলবক্স';
  }
};

const getSubToolDesc = (tool: PDFSubTool): string => {
  switch (tool) {
    case 'merge':
      return 'একাধিক ফাইল আপলোড করে প্রয়োজনমতো ক্রম ঠিক করে এক ক্লিকে একটি ফাইলে রূপান্তর করুন।';
    case 'split':
      return 'প্রতিটি পৃষ্ঠা আলাদা করুন অথবা পৃষ্ঠা রেঞ্জ (যেমন: ১-৩, ৫) অনুযায়ী কেটে বের করুন।';
    case 'compress':
      return 'ফাইলের কোয়ালিটি রক্ষা করে ব্রাউজারে স্বয়ংক্রিয়ভাবে সাইজ হ্রাস করুন।';
    case 'images-to-pdf':
      return 'JPG, PNG বা WebP ছবিগুলোকে A4 বা কাস্টম সাইজের মানসম্পন্ন PDF এ পরিণত করুন।';
    case 'pdf-to-images':
      return 'PDF পৃষ্ঠাসমূহকে পরিষ্কার ছবি হিসেবে এক্সপোর্ট করুন এবং প্রয়োজনে ZIP আকারে নামান।';
    case 'rotate':
      return 'উল্টো বা শোয়ানো পৃষ্ঠাগুলোকে সঠিক কোণে ঘুরিয়ে সোজা করুন।';
    case 'page-numbers':
      return 'ডকুমেন্টে স্বয়ংক্রিয়ভাবে পৃষ্ঠা নম্বর ও ফরম্যাট যুক্ত করুন।';
    case 'watermark':
      return 'ডকুমেন্টের সুরক্ষায় নিজস্ব টেক্সট বা লোগো ওয়াটারমার্ক হিসেবে বসান।';
    case 'metadata':
      return 'PDF ফাইলের টাইটেল, লেখক ও কীওয়ার্ড মেটাডাটা সম্পাদনা করুন।';
    default:
      return '';
  }
};
