import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  FileText,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  CreditCard,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  HelpCircle,
  Upload,
  Save,
  Palette,
  Check,
  Pencil,
  Edit3,
} from 'lucide-react';
import { CVData, CVTemplate, PaymentTransaction, CVQualityIssue } from '../types/cvMaker';
import { CV_CATEGORIES, CV_TEMPLATES } from '../data/cvTemplates';
import { SAMPLE_CV_DATA, INITIAL_EMPTY_CV_DATA } from '../data/sampleCVData';
import { CVRenderer } from './cv/CVRenderer';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface CVMakerProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const CVMaker: React.FC<CVMakerProps> = ({ onBackToHub, onShowToast }) => {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'preview' | 'quality' | 'payments'>('templates');

  // Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl-01');

  // CV Data
  const [cvData, setCvData] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem('mosafa_cv_draft_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If draft has old demo name, automatically migrate to new demo name
        if (parsed?.personal?.fullName?.includes('মোফাসসিরুল ইসলাম')) {
          return SAMPLE_CV_DATA;
        }
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    return SAMPLE_CV_DATA;
  });

  // Unlocked Premium Template IDs (All templates are 100% free now)
  const [unlockedTemplates, setUnlockedTemplates] = useState<string[]>(() => {
    return CV_TEMPLATES.map((t) => t.id);
  });

  // Transactions History
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  // Template Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'premium'>('all');

  // Preview Zoom & State
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'bkash' | 'nagad'>('bkash');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentTrxId, setPaymentTrxId] = useState('');
  const [paymentPending, setPaymentPending] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{ orderId: string; template: CVTemplate } | null>(null);

  // Autosave CV Data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_cv_draft_v1', JSON.stringify(cvData));
    } catch (e) {
      // ignore
    }
  }, [cvData]);

  // Current active template object
  const currentTemplate = CV_TEMPLATES.find((t) => t.id === selectedTemplateId) || CV_TEMPLATES[0];

  // All 100 templates are completely free: no watermark, full unlock
  const isUnlocked = true;
  const isWatermarked = false;

  // Filter templates list
  const filteredTemplates = CV_TEMPLATES.filter((tmpl) => {
    const matchesCat = categoryFilter === 'all' || tmpl.category === categoryFilter;
    const matchesTier =
      tierFilter === 'all' ||
      (tierFilter === 'free' && !tmpl.isPremium) ||
      (tierFilter === 'premium' && tmpl.isPremium);
    const matchesSearch =
      !searchQuery.trim() ||
      tmpl.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.nameBn.includes(searchQuery) ||
      tmpl.number.toString().includes(searchQuery) ||
      tmpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesTier && matchesSearch;
  });

  // Calculate CV Quality Score
  const computeQualityIssues = (): { score: number; issues: CVQualityIssue[] } => {
    const issues: CVQualityIssue[] = [];
    let score = 0;

    // Personal info (max 30 pts)
    if (cvData.personal.fullName.trim().length > 2) score += 10;
    else issues.push({ type: 'error', field: 'name', messageBn: 'আপনার পূর্ণ নাম প্রদান করুন।', messageEn: 'Add full name' });

    if (cvData.personal.email.includes('@')) score += 8;
    else issues.push({ type: 'error', field: 'email', messageBn: 'সঠিক ইমেইল এড্রেস লিখুন।', messageEn: 'Add valid email' });

    if (cvData.personal.phone.trim().length > 6) score += 7;
    else issues.push({ type: 'warning', field: 'phone', messageBn: 'যোগাযোগের ফোন নম্বর দিন।', messageEn: 'Add phone number' });

    if (cvData.personal.city || cvData.personal.country) score += 5;
    else issues.push({ type: 'warning', field: 'location', messageBn: 'বর্তমান শহর বা দেশের নাম লিখুন।', messageEn: 'Add location' });

    // Summary (max 15 pts)
    if (cvData.summary.trim().length > 50) score += 15;
    else if (cvData.summary.trim().length > 10) {
      score += 8;
      issues.push({ type: 'tip', field: 'summary', messageBn: 'পেশাদার সারাংশটি আরও তথ্যবহুল ও আকর্ষণীয় করুন।', messageEn: 'Expand summary' });
    } else {
      issues.push({ type: 'error', field: 'summary', messageBn: 'একটি পেশাদার সারাংশ (Summary) যুক্ত করুন।', messageEn: 'Add summary' });
    }

    // Experience (max 25 pts)
    if (cvData.experience.length >= 2) score += 25;
    else if (cvData.experience.length === 1) score += 18;
    else issues.push({ type: 'warning', field: 'exp', messageBn: 'অন্তত একটি কাজের অভিজ্ঞতা বা ইন্টার্নশিপ যুক্ত করুন।', messageEn: 'Add experience' });

    // Education (max 15 pts)
    if (cvData.education.length >= 1) score += 15;
    else issues.push({ type: 'error', field: 'edu', messageBn: 'শিক্ষাগত যোগ্যতার বিবরণ দিন।', messageEn: 'Add education' });

    // Skills (max 10 pts)
    if (cvData.skills.length >= 5) score += 10;
    else if (cvData.skills.length >= 2) score += 6;
    else issues.push({ type: 'warning', field: 'skills', messageBn: 'কমপক্ষে ৫টি প্রাসঙ্গিক স্কিল যুক্ত করুন।', messageEn: 'Add at least 5 skills' });

    // Languages (max 5 pts)
    if (cvData.languages.length >= 1) score += 5;
    else issues.push({ type: 'tip', field: 'lang', messageBn: 'ভাষাগত দক্ষতা (বাংলা, ইংরেজি) উল্লেখ করুন।', messageEn: 'Add languages' });

    return { score: Math.min(100, score), issues };
  };

  const qualityResult = computeQualityIssues();

  // Reset to Empty
  const handleReset = () => {
    if (window.confirm('আপনি কি সব তথ্য মুছে নতুন করে শুরু করতে চান?')) {
      setCvData(INITIAL_EMPTY_CV_DATA);
      onShowToast('সব তথ্য মুছে ফাঁকা ফরম তৈরি করা হয়েছে।', '🔄');
    }
  };

  // Load Sample Data
  const handleLoadSample = () => {
    setCvData(SAMPLE_CV_DATA);
    onShowToast('নমুনা তথ্য সফলভাবে লোড হয়েছে!', '✨');
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cvData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `MoSaFa-CV-${cvData.personal.fullName.replace(/\s+/g, '_') || 'Draft'}.json`);
    dl.click();
    dl.remove();
    onShowToast('CV ব্যাকআপ ফাইল ডাউনলোড হয়েছে!', '💾');
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.personal && Array.isArray(parsed.experience)) {
          setCvData(parsed);
          onShowToast('CV ফাইল সফলভাবে লোড হয়েছে!', '📂');
        } else {
          onShowToast('ফাইল ফরম্যাট সঠিক নয়।', '⚠️');
        }
      } catch (err) {
        onShowToast('ফাইল পড়তে ব্যর্থ হয়েছে।', '❌');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Initiate Payment Flow for Premium Template
  const handleInitiatePayment = (template: CVTemplate) => {
    const orderId = `MSF-${Date.now().toString().slice(-6)}`;
    setCurrentOrder({ orderId, template });
    setPaymentTrxId('');
    setPaymentPhone(cvData.personal.phone || '');
    setIsPaymentModalOpen(true);
  };

  // Complete Payment Verification (Sandbox / Real API verification flow)
  const handleVerifyPayment = () => {
    if (!currentOrder) return;
    if (paymentTrxId.trim().length < 6) {
      alert('সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন (যেমন: 9J87KLM45)');
      return;
    }
    setPaymentPending(true);

    // Secure verification simulation (ready to hit server `/api/payment/verify`)
    setTimeout(() => {
      const newTx: PaymentTransaction = {
        orderId: currentOrder.orderId,
        templateId: currentOrder.template.id,
        templateNumber: currentOrder.template.number,
        templateName: currentOrder.template.nameBn,
        amount: currentOrder.template.price,
        provider: paymentProvider,
        trxId: paymentTrxId.trim().toUpperCase(),
        customerPhone: paymentPhone.trim(),
        status: 'verified',
        timestamp: new Date().toLocaleString('bn-BD'),
      };

      setTransactions((prev) => [newTx, ...prev]);
      setUnlockedTemplates((prev) => (prev.includes(currentOrder.template.id) ? prev : [...prev, currentOrder.template.id]));
      setPaymentPending(false);
      setIsPaymentModalOpen(false);
      onShowToast(`🎉 সফল! "${currentOrder.template.nameBn}" ওয়াটারমার্ক ছাড়া আনলক হয়েছে!`, '✅');
    }, 1200);
  };

  // Print CV Cleanly & Reliably (Supports printing from any active tab & iframe environments)
  const handlePrintCV = () => {
    try {
      window.focus();
      onShowToast('প্রিন্ট প্রস্তুত হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...', '🖨️');

      const sourceEl =
        document.getElementById('cv-export-canvas-target') ||
        document.getElementById('cv-export-document') ||
        document.getElementById('cv-render-document');

      // Method 1: Use isolated hidden print iframe for bulletproof cross-browser printing
      let printIframe = document.getElementById('cv-hidden-print-frame') as HTMLIFrameElement | null;
      if (!printIframe) {
        printIframe = document.createElement('iframe');
        printIframe.id = 'cv-hidden-print-frame';
        printIframe.style.position = 'fixed';
        printIframe.style.right = '0';
        printIframe.style.bottom = '0';
        printIframe.style.width = '0px';
        printIframe.style.height = '0px';
        printIframe.style.border = 'none';
        printIframe.style.opacity = '0';
        printIframe.style.pointerEvents = 'none';
        document.body.appendChild(printIframe);
      }

      const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
      if (iframeDoc && sourceEl) {
        const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
          .map((s) => s.outerHTML)
          .join('\n');

        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html lang="bn">
            <head>
              <meta charset="utf-8" />
              <title>The MoSaFa CV - ${cvData.personal.fullName || 'CV'}</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
              ${styleTags}
              <style>
                @page {
                  size: A4 portrait;
                  margin: 0;
                }
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                  color: #000000 !important;
                  font-family: 'Hind Siliguri', system-ui, -apple-system, sans-serif !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .cv-print-isolated {
                  width: 100% !important;
                  max-width: 210mm !important;
                  margin: 0 auto !important;
                  background: #ffffff !important;
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  box-sizing: border-box;
                }
              </style>
            </head>
            <body>
              <div class="cv-print-isolated">
                ${sourceEl.innerHTML}
              </div>
            </body>
          </html>
        `);
        iframeDoc.close();

        setTimeout(() => {
          try {
            printIframe?.contentWindow?.focus();
            printIframe?.contentWindow?.print();
            onShowToast('প্রিন্ট ডায়ালগ ওপেন হয়েছে! সরাসরি প্রিন্ট বা "Save as PDF" করুন।', '🖨️');
          } catch (err) {
            console.warn('Iframe print failed, falling back to window.print():', err);
            document.body.classList.add('printing-cv');
            window.focus();
            window.print();
            setTimeout(() => {
              document.body.classList.remove('printing-cv');
            }, 1500);
          }
        }, 450);
        return;
      }

      // Fallback direct window print
      document.body.classList.add('printing-cv');
      window.focus();
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-cv');
      }, 1500);
    } catch (err) {
      console.error('Print failed:', err);
      document.body.classList.add('printing-cv');
      window.focus();
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-cv');
      }, 1500);
    }
  };

  // High-Quality Crisp Multi-Page & Single-Page PDF Download (Captures all sections including References)
  const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPdf(true);
      onShowToast('PDF ফাইল তৈরি হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন...', '⏳');

      // Brief tick to ensure DOM is settled
      await new Promise((r) => setTimeout(r, 150));

      const target =
        document.getElementById('cv-export-document') ||
        document.getElementById('cv-export-canvas-target') ||
        document.getElementById('cv-render-document');

      if (!target) {
        throw new Error('CV export DOM element not found');
      }

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: currentTemplate.bgColor || '#ffffff',
        windowWidth: 794,
        imageTimeout: 10000,
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // Exact A4 page height in pixels on this canvas width: (297 / 210) * canvas.width
      const pageCanvasHeight = Math.floor((canvas.width * 297) / 210);

      // If the content fits within 1 page (allow a 30px buffer)
      if (canvas.height <= pageCanvasHeight + 30) {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const actualImgHeightMm = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(actualImgHeightMm, pdfHeight), undefined, 'FAST');
      } else {
        // Multi-page export: slice canvas page-by-page so NO content or references get cut off!
        const totalPages = Math.ceil(canvas.height / pageCanvasHeight);

        for (let i = 0; i < totalPages; i++) {
          if (i > 0) {
            pdf.addPage();
          }

          const sourceY = i * pageCanvasHeight;
          const chunkHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

          // Render this page slice onto a dedicated canvas
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageCanvasHeight;
          const ctx = pageCanvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = currentTemplate.bgColor || '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight);
            ctx.drawImage(
              canvas,
              0, sourceY, canvas.width, chunkHeight,
              0, 0, canvas.width, chunkHeight
            );
          }

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        }
      }

      const safeName = (cvData.personal.fullName || 'Resume').replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_');
      pdf.save(`The_MoSaFa_CV_${safeName}.pdf`);

      onShowToast('সম্পূর্ণ তথ্য সহ PDF সফলভাবে ডাউনলোড হয়েছে! 🎉', '✅');
    } catch (err) {
      console.error('PDF export error:', err);
      onShowToast('PDF তৈরিতে সমস্যা হয়েছে। সরাসরি প্রিন্ট ডায়ালগ থেকে "Save as PDF" করুন।', '🖨️');
      handlePrintCV();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="relative">
      {/* Screen-only UI Container (Hidden completely when printing) */}
      <div className="cv-screen-only print:hidden min-h-screen bg-slate-100/90 text-slate-800 pb-20 font-sans">
      {/* ================= TOP APPLICATION HEADER ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHub}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="সকল টুলস তালিকায় ফিরুন"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">সকল টুলস</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    The MoSaFa CV Maker
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200">
                    ১০০% ফ্রি
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-bold">
                  (প্রফেশনাল CV ও রেজিউম বিল্ডার) • ১০০টি সম্পূর্ণ ফ্রি টেমপ্লেট
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>নমুনা ডাটা</span>
            </button>

            <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>ইম্পোর্ট</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="JSON ব্যাকআপ ফাইল সংরক্ষণ করুন"
            >
              <Save className="w-3.5 h-3.5" />
              <span>এক্সপোর্ট</span>
            </button>

            <button
              type="button"
              onClick={handlePrintCV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-200 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 border-t border-slate-100 overflow-x-auto text-xs font-bold py-1">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'templates'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>১০০টি টেমপ্লেট গ্যালারি</span>
            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">১০০টি ফ্রি</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'editor'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>CV তথ্য এডিটর (Wizard)</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'preview'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>লাইভ ফুল প্রিভিউ</span>
            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">ফ্রি</span>
          </button>

          <button
            onClick={() => setActiveTab('quality')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'quality'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>CV কোয়ালিটি স্কোর ({qualityResult.score}%)</span>
          </button>
        </div>
      </header>

      {/* ================= TAB 1: 100 TEMPLATES GALLERY ================= */}
      {activeTab === 'templates' && (
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Header & Stats Banner */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-200/50 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                দ্য মোফাচ্ছির সিভি বিল্ডার
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">১০০টি প্রফেশনাল CV ও রেজিউম টেমপ্লেট</h2>
              <p className="text-xs sm:text-sm text-rose-100 max-w-2xl leading-relaxed">
                পছন্দের যেকোনো টেমপ্লেট নির্বাচন করুন এবং সরাসরি লাইভ এডিট করুন। বর্তমানে সকল ১০০টি টেমপ্লেট সম্পূর্ণ ফ্রি—কোনো ওয়াটারমার্ক ছাড়াই প্রফেশনাল A4 ফরম্যাটে আনলিমিটেড প্রিভিউ, এডিট ও PDF ডাউনলোড করুন!
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 text-center min-w-[100px]">
                <div className="text-2xl font-black">১০০</div>
                <div className="text-[11px] text-rose-100">মোট টেমপ্লেট</div>
              </div>
              <div className="bg-emerald-500/30 backdrop-blur-md border border-emerald-300/40 rounded-2xl p-4 text-center min-w-[110px]">
                <div className="text-2xl font-black text-emerald-200">১০০% ফ্রি</div>
                <div className="text-[11px] text-emerald-100 font-bold">আজীবন ফ্রি</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-4 text-center min-w-[100px]">
                <div className="text-2xl font-black text-white">৳০</div>
                <div className="text-[11px] text-rose-100 font-bold">কোনো ফি নেই</div>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="টেমপ্লেট খুঁজুন... (নাম, ক্যাটাগরি, ট্যাগ বা নম্বর)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>সকল ১০০টি প্রিমিয়াম ও সাধারণ টেমপ্লেট সম্পূর্ণ ফ্রি</span>
              </div>
            </div>

            {/* 10 Categories Grid: Exactly 5 lines, 2 categories per line */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-700">
                  সিভি ক্যাটাগরি ফিল্টার (মোট ১০টি বিভাগ):
                </span>
                {categoryFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition"
                  >
                    <span>সকল ১০০টি টেমপ্লেট দেখুন</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {CV_CATEGORIES.map((cat) => {
                  const isActive = categoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryFilter(isActive ? 'all' : cat.id)}
                      className={`p-3 sm:p-3.5 rounded-2xl transition flex items-center justify-between border cursor-pointer text-left ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-rose-400'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="text-xl sm:text-2xl p-1.5 sm:p-2 rounded-xl bg-slate-100/90 shrink-0">
                          {cat.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold truncate">{cat.nameBn}</div>
                          <div className={`text-[10px] font-medium truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                            {cat.nameEn} (১০টি)
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200">
                        ফ্রি
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredTemplates.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              const isPaid = unlockedTemplates.includes(tmpl.id);

              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tmpl.id);
                    onShowToast(`"${tmpl.nameBn}" নির্বাচন করা হয়েছে!`, '🎨');
                  }}
                  className={`bg-white rounded-3xl p-4 border transition-all duration-200 flex flex-col justify-between group cursor-pointer relative ${
                    isSelected
                      ? 'border-rose-500 ring-2 ring-rose-300 shadow-xl'
                      : 'border-slate-200 hover:border-slate-400 hover:shadow-lg'
                  }`}
                >
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      #{tmpl.number.toString().padStart(2, '0')}
                    </span>

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>১০০% ফ্রি</span>
                    </span>
                  </div>

                  {/* Thumbnail / Layout Representation */}
                  <div
                    className="h-44 rounded-2xl p-2.5 border border-slate-100 flex flex-col justify-between mb-3 relative overflow-hidden transition-transform group-hover:scale-[1.02]"
                    style={{ backgroundColor: tmpl.bgColor }}
                  >
                    {/* Simulated Dynamic Mini Layouts */}
                    {tmpl.layoutStyle === 'sidebar-left' ? (
                      <div className="flex gap-1.5 h-full">
                        <div
                          className="w-1/3 rounded-lg p-1.5 flex flex-col gap-1 shrink-0"
                          style={{ backgroundColor: tmpl.sidebarBg || '#f1f5f9' }}
                        >
                          <div className="w-6 h-6 rounded-full mx-auto" style={{ backgroundColor: tmpl.primaryColor }}></div>
                          <div className="w-full h-1 bg-slate-300 rounded mt-1"></div>
                          <div className="w-4/5 h-1 bg-slate-300 rounded"></div>
                          <div className="w-2/3 h-1 bg-slate-300 rounded"></div>
                          <div className="mt-auto w-full h-2 rounded" style={{ backgroundColor: `${tmpl.primaryColor}30` }}></div>
                        </div>
                        <div className="flex-1 p-1.5 flex flex-col gap-1.5 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="w-3/4 h-2 rounded" style={{ backgroundColor: tmpl.primaryColor }}></div>
                          <div className="w-1/2 h-1 bg-slate-300 rounded"></div>
                          <div className="w-full h-1 bg-slate-200 rounded mt-1"></div>
                          <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
                          <div className="w-full h-1 bg-slate-200 rounded"></div>
                          <div className="w-2/3 h-1 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    ) : tmpl.layoutStyle === 'sidebar-right' ? (
                      <div className="flex gap-1.5 h-full">
                        <div className="flex-1 p-1.5 flex flex-col gap-1.5 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="w-3/4 h-2 rounded" style={{ backgroundColor: tmpl.primaryColor }}></div>
                          <div className="w-1/2 h-1 bg-slate-300 rounded"></div>
                          <div className="w-full h-1 bg-slate-200 rounded mt-1"></div>
                          <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
                          <div className="w-full h-1 bg-slate-200 rounded"></div>
                        </div>
                        <div
                          className="w-1/3 rounded-lg p-1.5 flex flex-col gap-1 shrink-0"
                          style={{ backgroundColor: tmpl.sidebarBg || '#f1f5f9' }}
                        >
                          <div className="w-6 h-6 rounded-full mx-auto" style={{ backgroundColor: tmpl.primaryColor }}></div>
                          <div className="w-full h-1 bg-slate-300 rounded mt-1"></div>
                          <div className="w-4/5 h-1 bg-slate-300 rounded"></div>
                          <div className="w-2/3 h-1 bg-slate-300 rounded"></div>
                        </div>
                      </div>
                    ) : tmpl.layoutStyle === 'header-accent' ? (
                      <div className="flex flex-col gap-1.5 h-full">
                        <div className="p-2 rounded-lg text-white flex items-center justify-between" style={{ backgroundColor: tmpl.primaryColor }}>
                          <div className="w-16 h-2 bg-white/80 rounded-full"></div>
                          <div className="w-5 h-5 rounded-lg bg-white/40"></div>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-1.5">
                          <div className="col-span-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1">
                            <div className="w-full h-1 bg-slate-300 rounded"></div>
                            <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
                            <div className="w-4/6 h-1 bg-slate-200 rounded"></div>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-100 flex flex-col gap-1">
                            <div className="w-full h-1 bg-slate-300 rounded"></div>
                            <div className="w-2/3 h-1 bg-slate-300 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ) : tmpl.layoutStyle === 'creative-banner' ? (
                      <div className="flex flex-col gap-1.5 h-full">
                        <div className="p-2.5 rounded-xl text-white relative overflow-hidden" style={{ backgroundColor: tmpl.primaryColor }}>
                          <div className="w-14 h-2 bg-white/90 rounded-full"></div>
                          <div className="w-6 h-6 rounded-full border-2 border-white absolute right-2 top-1.5" style={{ backgroundColor: tmpl.secondaryColor }}></div>
                        </div>
                        <div className="flex-1 p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5 relative pl-4">
                          <div className="absolute left-2 top-2 bottom-2 w-0.5 rounded" style={{ backgroundColor: tmpl.primaryColor }}></div>
                          <div className="w-3/4 h-1.5 bg-slate-400 rounded"></div>
                          <div className="w-full h-1 bg-slate-200 rounded"></div>
                          <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    ) : tmpl.layoutStyle === 'europass' ? (
                      <div className="flex flex-col gap-1 h-full border border-blue-200 rounded-lg p-1.5">
                        <div className="flex justify-between items-center pb-1 border-b border-blue-200">
                          <span className="text-[7px] font-black text-blue-800">🇪🇺 EUROPASS</span>
                          <div className="w-3 h-3 rounded bg-blue-800"></div>
                        </div>
                        <div className="flex-1 flex gap-1.5 pt-1">
                          <div className="w-1/4 flex flex-col gap-1">
                            <div className="w-full h-1 bg-blue-400 rounded"></div>
                            <div className="w-3/4 h-1 bg-slate-200 rounded"></div>
                          </div>
                          <div className="w-3/4 flex flex-col gap-1">
                            <div className="w-3/4 h-1 bg-slate-800 rounded"></div>
                            <div className="w-full h-1 bg-slate-200 rounded"></div>
                            <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ) : tmpl.layoutStyle === 'modern-grid' ? (
                      <div className="flex flex-col gap-1.5 h-full">
                        <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                          <div className="w-16 h-1.5 rounded" style={{ backgroundColor: tmpl.primaryColor }}></div>
                          <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-1.5">
                          <div className="p-1.5 rounded-lg border border-slate-100 bg-white flex flex-col gap-1">
                            <div className="w-full h-1 bg-slate-300 rounded"></div>
                            <div className="w-4/5 h-1 bg-slate-200 rounded"></div>
                          </div>
                          <div className="p-1.5 rounded-lg border border-slate-100 bg-slate-50 flex flex-col gap-1">
                            <div className="w-full h-1 bg-slate-300 rounded"></div>
                            <div className="w-3/5 h-1 bg-slate-200 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* One-column or compact ATS */
                      <div className="flex flex-col justify-between h-full p-2 bg-slate-50/60 rounded-lg border border-slate-200/80">
                        <div className="text-center space-y-1 pb-1.5 border-b" style={{ borderColor: tmpl.primaryColor }}>
                          <div className="w-20 h-1.5 mx-auto rounded" style={{ backgroundColor: tmpl.primaryColor }}></div>
                          <div className="w-12 h-1 bg-slate-300 mx-auto rounded"></div>
                        </div>
                        <div className="space-y-1.5 my-1">
                          <div className="w-full h-1 bg-slate-200 rounded"></div>
                          <div className="w-5/6 h-1 bg-slate-200 rounded"></div>
                          <div className="w-4/6 h-1 bg-slate-200 rounded"></div>
                        </div>
                        <div className="pt-1 border-t border-slate-200 flex justify-between">
                          <div className="w-1/3 h-1 bg-slate-300 rounded"></div>
                          <div className="w-1/3 h-1 bg-slate-300 rounded"></div>
                        </div>
                      </div>
                    )}

                    {/* Watermark badge indicator if unpaid premium (subtle & soft) */}
                    {tmpl.isPremium && !isPaid && (
                      <div className="absolute inset-0 bg-slate-900/[0.03] backdrop-blur-[0.2px] flex items-center justify-center pointer-events-none">
                        <span className="text-[9px] font-bold tracking-widest text-slate-400 bg-white/80 px-2 py-0.5 rounded shadow-2xs border border-slate-200/40">
                          THE MoSaFa
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition">
                      {tmpl.nameBn}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium flex justify-between">
                      <span>{tmpl.nameEn}</span>
                      <span className="text-emerald-700 font-bold">ATS: {tmpl.atsScore}%</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {tmpl.descriptionBn}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplateId(tmpl.id);
                        setActiveTab('preview');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>প্রিভিউ দেখুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplateId(tmpl.id);
                        setActiveTab('editor');
                      }}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs text-center transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="এই টেমপ্লেট নির্বাচন করে সরাসরি এডিট করুন"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                      <span>এডিট</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ================= TAB 2: CV DATA INPUT WIZARD ================= */}
      {activeTab === 'editor' && (
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b">
              <span>👤 ১. ব্যক্তিগত তথ্য (Personal Details)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  value={cvData.personal.fullName}
                  onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, fullName: e.target.value } })}
                  placeholder="যেমন: মোফাসসিরুল ইসলাম"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">পদবী / পেশা *</label>
                <input
                  type="text"
                  value={cvData.personal.jobTitle}
                  onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, jobTitle: e.target.value } })}
                  placeholder="যেমন: Senior Software Engineer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ইমেইল এড্রেস *</label>
                <input
                  type="email"
                  value={cvData.personal.email}
                  onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, email: e.target.value } })}
                  placeholder="example@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  value={cvData.personal.phone}
                  onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, phone: e.target.value } })}
                  placeholder="+880 1712-345678"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">শহর ও দেশ</label>
                <input
                  type="text"
                  value={cvData.personal.city}
                  onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, city: e.target.value } })}
                  placeholder="ঢাকা, বাংলাদেশ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">প্রোফাইল ছবি (URL অথবা ফাইল আপলোড)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cvData.personal.photoUrl}
                    onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, photoUrl: e.target.value } })}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 text-xs"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>ছবি দিন</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setCvData((prev) => ({
                            ...prev,
                            personal: {
                              ...prev.personal,
                              photoUrl: base64,
                            },
                          }));
                          onShowToast('ছবি সফলভাবে যুক্ত হয়েছে!', '🖼️');
                        };
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                  {cvData.personal.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setCvData((prev) => ({ ...prev, personal: { ...prev.personal, photoUrl: '' } }))}
                      className="px-2.5 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition cursor-pointer"
                      title="ছবি মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">LinkedIn লিংক</label>
                <input
                  type="text"
                  value={cvData.personal.linkedin}
                  onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, linkedin: e.target.value } })}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GitHub / পোর্টফোলিও লিংক</label>
                <input
                  type="text"
                  value={cvData.personal.github}
                  onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, github: e.target.value } })}
                  placeholder="github.com/username"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between pb-2 border-b">
              <span>📝 ২. প্রফেশনাল সারাংশ (Professional Summary)</span>
              <span className="text-xs text-slate-500 font-normal">{cvData.summary.length} অক্ষর</span>
            </h2>
            <textarea
              rows={4}
              value={cvData.summary}
              onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
              placeholder="আপনার অভিজ্ঞতা, মূল দক্ষতা এবং ক্যারিয়ারের লক্ষ্য ৩-৫ বাক্যে সংক্ষেপে লিখুন..."
              className="w-full p-3 rounded-2xl border border-slate-300 text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-base font-bold text-slate-900">💼 ৩. কাজের অভিজ্ঞতা (Work Experience)</h2>
              <button
                type="button"
                onClick={() => {
                  const newExp = {
                    id: `exp-${Date.now()}`,
                    jobTitle: '',
                    employer: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: '',
                  };
                  setCvData({ ...cvData, experience: [...cvData.experience, newExp] });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>অভিজ্ঞতা যোগ করুন</span>
              </button>
            </div>

            {cvData.experience.map((exp, index) => (
              <div key={exp.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-700">অভিজ্ঞতা #{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCvData({ ...cvData, experience: cvData.experience.filter((item) => item.id !== exp.id) });
                    }}
                    className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">পদের নাম / Job Title</label>
                    <input
                      type="text"
                      value={exp.jobTitle}
                      onChange={(e) => {
                        const updated = cvData.experience.map((item) =>
                          item.id === exp.id ? { ...item, jobTitle: e.target.value } : item
                        );
                        setCvData({ ...cvData, experience: updated });
                      }}
                      placeholder="যেমন: Software Developer"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">কোম্পানির নাম / Employer</label>
                    <input
                      type="text"
                      value={exp.employer}
                      onChange={(e) => {
                        const updated = cvData.experience.map((item) =>
                          item.id === exp.id ? { ...item, employer: e.target.value } : item
                        );
                        setCvData({ ...cvData, experience: updated });
                      }}
                      placeholder="যেমন: টেক ইনোভেট লিমিটেড"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">শুরুর তারিখ</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = cvData.experience.map((item) =>
                          item.id === exp.id ? { ...item, startDate: e.target.value } : item
                        );
                        setCvData({ ...cvData, experience: updated });
                      }}
                      placeholder="যেমন: জানুয়ারি ২০২১"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">শেষের তারিখ / বর্তমান</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        disabled={exp.current}
                        value={exp.current ? 'বর্তমান (Present)' : exp.endDate}
                        onChange={(e) => {
                          const updated = cvData.experience.map((item) =>
                            item.id === exp.id ? { ...item, endDate: e.target.value } : item
                          );
                          setCvData({ ...cvData, experience: updated });
                        }}
                        placeholder="যেমন: ডিসেম্বর ২০২৩"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 disabled:bg-slate-100"
                      />
                      <label className="flex items-center gap-1 font-bold text-slate-700 shrink-0 text-xs">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => {
                            const updated = cvData.experience.map((item) =>
                              item.id === exp.id ? { ...item, current: e.target.checked } : item
                            );
                            setCvData({ ...cvData, experience: updated });
                          }}
                          className="rounded text-rose-600"
                        />
                        <span>চলমান</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">দায়িত্ব ও অর্জনসমূহ (বুলেট আকারে)</label>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) => {
                      const updated = cvData.experience.map((item) =>
                        item.id === exp.id ? { ...item, description: e.target.value } : item
                      );
                      setCvData({ ...cvData, experience: updated });
                    }}
                    placeholder="• মূল দায়িত্ব এবং সাফল্য পয়েন্ট আকারে লিখুন..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-base font-bold text-slate-900">🎓 ৪. শিক্ষাগত যোগ্যতা (Education)</h2>
              <button
                type="button"
                onClick={() => {
                  const newEdu = {
                    id: `edu-${Date.now()}`,
                    degree: '',
                    institution: '',
                    fieldOfStudy: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    gpa: '',
                  };
                  setCvData({ ...cvData, education: [...cvData.education, newEdu] });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ডিগ্রি যোগ করুন</span>
              </button>
            </div>

            {cvData.education.map((edu) => (
              <div key={edu.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">ডিগ্রি বিবরণ</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCvData({ ...cvData, education: cvData.education.filter((item) => item.id !== edu.id) });
                    }}
                    className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ডিগ্রির নাম</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = cvData.education.map((item) =>
                          item.id === edu.id ? { ...item, degree: e.target.value } : item
                        );
                        setCvData({ ...cvData, education: updated });
                      }}
                      placeholder="যেমন: B.Sc. in CSE"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">শিক্ষা প্রতিষ্ঠানের নাম</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = cvData.education.map((item) =>
                          item.id === edu.id ? { ...item, institution: e.target.value } : item
                        );
                        setCvData({ ...cvData, education: updated });
                      }}
                      placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">পাসের বছর / সময়কাল</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => {
                        const updated = cvData.education.map((item) =>
                          item.id === edu.id ? { ...item, endDate: e.target.value } : item
                        );
                        setCvData({ ...cvData, education: updated });
                      }}
                      placeholder="যেমন: ২০১৬ - ২০২০"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">সিজিপিএ / গ্রেড (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => {
                        const updated = cvData.education.map((item) =>
                          item.id === edu.id ? { ...item, gpa: e.target.value } : item
                        );
                        setCvData({ ...cvData, education: updated });
                      }}
                      placeholder="যেমন: ৩.৮৫"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-slate-900 text-sm">💡 ৫. দক্ষতাসমূহ (Skills)</h3>
                <button
                  type="button"
                  onClick={() => {
                    const skName = prompt('নতুন স্কিল লিখুন:');
                    if (skName && skName.trim()) {
                      const newSk = { id: `sk-${Date.now()}`, name: skName.trim(), category: 'technical' as const };
                      setCvData({ ...cvData, skills: [...cvData.skills, newSk] });
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold cursor-pointer"
                >
                  + যোগ করুন
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {cvData.skills.map((sk) => (
                  <span
                    key={sk.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                  >
                    <span>{sk.name}</span>
                    <button
                      type="button"
                      onClick={() => setCvData({ ...cvData, skills: cvData.skills.filter((s) => s.id !== sk.id) })}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-slate-900 text-sm">🌐 ৬. ভাষা (Languages)</h3>
                <button
                  type="button"
                  onClick={() => {
                    const lName = prompt('ভাষার নাম ও দক্ষতা লিখুন (যেমন: English - Fluent):');
                    if (lName && lName.trim()) {
                      const newL = { id: `lang-${Date.now()}`, language: lName.trim(), proficiency: 'Fluent' };
                      setCvData({ ...cvData, languages: [...cvData.languages, newL] });
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold cursor-pointer"
                >
                  + যোগ করুন
                </button>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                {cvData.languages.map((lg) => (
                  <div key={lg.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">{lg.language}</span>
                    <button
                      type="button"
                      onClick={() => setCvData({ ...cvData, languages: cvData.languages.filter((l) => l.id !== lg.id) })}
                      className="text-rose-500 hover:text-rose-700 font-bold"
                    >
                      মুছুন
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ================= TAB 3: LIVE PREVIEW & CONTROLS ================= */}
      {activeTab === 'preview' && (
        <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          {/* Preview Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-bold print:hidden">
            <div className="flex items-center flex-wrap gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">বর্তমান টেমপ্লেট:</span>
                <span className="text-slate-900 font-black">
                  #{currentTemplate.number}. {currentTemplate.nameBn}
                </span>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                ১০০% ফ্রি
              </span>
            </div>

            {/* Direct Edit Button, Zoom & Actions */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Prominent Pencil Edit Button */}
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-200 active:scale-95"
                title="সিভির যেকোনো তথ্য বা সেকশন এডিট করতে এখানে ক্লিক করুন"
              >
                <Pencil className="w-4 h-4 text-white" />
                <span>✏️ এই সিভি এডিট করুন</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                  className="p-1 rounded-lg hover:bg-white text-slate-700 cursor-pointer"
                  title="জুম আউট"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-slate-600 font-mono text-[11px]">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                  className="p-1 rounded-lg hover:bg-white text-slate-700 cursor-pointer"
                  title="জুম ইন"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrintCV}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="A4 সাইজে প্রিন্ট করুন"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloadingPdf}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-200 disabled:opacity-50"
                title="হাই-কোয়ালিটি PDF ফাইল হিসেবে নামান"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloadingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
              </button>
            </div>
          </div>

          {/* CV Document Container with Floating Pencil Button */}
          <div className="relative overflow-auto py-8 bg-slate-200/80 rounded-3xl border border-slate-300 flex justify-center p-4">
            {/* Floating Quick Edit Pencil Button */}
            <div className="absolute top-4 right-6 z-20 print:hidden">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 cursor-pointer transition hover:scale-105 border border-white/20 active:scale-95"
                title="সিভির যেকোনো তথ্য বা সেকশন এডিট করতে এখানে ক্লিক করুন"
              >
                <Pencil className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>✏️ তথ্য এডিট করুন</span>
              </button>
            </div>

            <CVRenderer data={cvData} template={currentTemplate} isWatermarked={false} scale={zoomLevel} />
          </div>
        </main>
      )}

      {/* ================= TAB 4: QUALITY SCORE & ATS CHECKER ================= */}
      {activeTab === 'quality' && (
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-full border-8 border-rose-500 flex flex-col items-center justify-center shrink-0 shadow-inner">
              <span className="text-3xl font-black text-slate-900">{qualityResult.score}%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">সিভি স্কোর</span>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-900">
                {qualityResult.score >= 85
                  ? '🌟 চমৎকার! আপনার সিভি চাকরির আবেদনের জন্য প্রস্তুত।'
                  : qualityResult.score >= 60
                  ? '👍 মোটামুটি ভালো, তবে আরও কিছু তথ্য যোগ করলে ইন্টারভিউ কল পাওয়ার সম্ভাবনা বাড়বে।'
                  : '⚠️ সিভি এখনও অসম্পূর্ণ, অনুগ্রহ করে চিহ্নিত ক্ষেত্রগুলো পূরণ করুন।'}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                এই স্কোরটি একটি এডিটরিয়াল চেকলিস্ট এবং আন্তর্জাতিক রিক্রুটারদের সেরা প্র্যাকটিস অনুকরণে প্রস্তুত করা হয়েছে।
              </p>
            </div>
          </div>

          {/* Issues and Improvement Suggestions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b">
              উন্নতির জন্য চেকলিস্ট ({qualityResult.issues.length}টি পরামর্শ)
            </h3>

            {qualityResult.issues.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>সবগুলো গুরুত্বপূর্ণ তথ্য সঠিকভাবে পূরণ করা হয়েছে!</span>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {qualityResult.issues.map((iss, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center gap-3 ${
                      iss.type === 'error'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : iss.type === 'warning'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-sky-50/70 border-sky-200 text-sky-900'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{iss.messageBn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ================= TAB 5: PAYMENTS & UNLOCKED TEMPLATES ================= */}
      {activeTab === 'payments' && (
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>আপনার ক্রয়কৃত ও আনলকড প্রিমিয়াম টেমপ্লেটসমূহ ({unlockedTemplates.length}টি)</span>
            </h2>

            {unlockedTemplates.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                আপনি এখনও কোনো প্রিমিয়াম টেমপ্লেট আনলক করেননি। ৮০টি এক্সক্লুসিভ টেমপ্লেটের যেকোনোটি মাত্র ৳১০-এ আনলক করতে পারেন।
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {unlockedTemplates.map((tid) => {
                  const t = CV_TEMPLATES.find((x) => x.id === tid);
                  if (!t) return null;
                  return (
                    <div key={tid} className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">#{t.number}. {t.nameBn}</div>
                        <div className="text-[11px] text-slate-600">{t.nameEn} • ওয়াটারমার্ক মুক্ত</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(t.id);
                          setActiveTab('preview');
                        }}
                        className="px-3 py-1 rounded-xl bg-slate-900 text-white font-bold text-[11px] cursor-pointer"
                      >
                        ব্যবহার করুন
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transactions Record */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b">পেমেন্ট হিস্ট্রি ও রশিদ</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">কোনো পেমেন্ট রেকর্ড নেই।</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-slate-500 font-bold">
                      <th className="pb-2">অর্ডার আইডি</th>
                      <th className="pb-2">টেমপ্লেট</th>
                      <th className="pb-2">মাধ্যম</th>
                      <th className="pb-2">TrxID</th>
                      <th className="pb-2">টাকা</th>
                      <th className="pb-2">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx, idx) => (
                      <tr key={idx} className="text-slate-700">
                        <td className="py-2.5 font-mono font-bold text-slate-900">{tx.orderId}</td>
                        <td className="py-2.5">{tx.templateName}</td>
                        <td className="py-2.5 uppercase font-bold">{tx.provider}</td>
                        <td className="py-2.5 font-mono">{tx.trxId}</td>
                        <td className="py-2.5 font-bold text-emerald-700">৳{tx.amount}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            যাচাইকৃত
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ================= BKASH & NAGAD PAYMENT MODAL (৳10) ================= */}
      {isPaymentModalOpen && currentOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                  নিরাপদ পেমেন্ট গেটওয়ে
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {currentOrder.template.nameBn} আনলক করুন
                </h3>
                <p className="text-xs text-slate-500">মূল্য: মাত্র ৳১০ (দশ টাকা) • আজীবন ওয়াটারমার্ক ছাড়া</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Provider Tabs (bKash / Nagad) */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentProvider('bkash')}
                className={`py-2.5 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer ${
                  paymentProvider === 'bkash'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 ring-2 ring-pink-200'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <span>বিকাশ (bKash)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentProvider('nagad')}
                className={`py-2.5 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer ${
                  paymentProvider === 'nagad'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-200'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <span>নগদ (Nagad)</span>
              </button>
            </div>

            {/* Instructions Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800">পেমেন্ট করার নিয়ম:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed text-[11px]">
                <li>আপনার {paymentProvider === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাপে প্রবেশ করুন।</li>
                <li>
                  Send Money বা Payment অপশনে গিয়ে <strong>০১৭৯৮-০৭৫৭৪৪</strong> নম্বরে <strong>৳১০</strong> পাঠান।
                </li>
                <li>রেফারেন্সে আপনার নাম বা <strong>{currentOrder.orderId}</strong> লিখুন।</li>
                <li>পেমেন্ট শেষে পাওয়া <strong>TrxID</strong> নিচে দিয়ে যাচাই করুন।</li>
              </ol>
            </div>

            {/* TrxID Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">প্রেরকের মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ট্রানজেকশন আইডি (TrxID) *</label>
                <input
                  type="text"
                  value={paymentTrxId}
                  onChange={(e) => setPaymentTrxId(e.target.value)}
                  placeholder="যেমন: 9J87KLM45"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase font-bold"
                />
              </div>
            </div>

            {/* Confirm & Verify Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={paymentPending}
                onClick={handleVerifyPayment}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-200 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{paymentPending ? 'পেমেন্ট যাচাই করা হচ্ছে...' : 'পেমেন্ট সম্পন্ন করুন ও আনলক করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ================= DEDICATED PRINT CONTAINER (ALWAYS IN DOM, PRINT MEDIA ONLY) ================= */}
      <div id="cv-print-isolated-root" className="hidden print:block w-full">
        <CVRenderer
          data={cvData}
          template={currentTemplate}
          isWatermarked={false}
          scale={1}
          printMode={true}
          customId="cv-print-document"
        />
      </div>

      {/* ================= OFF-SCREEN PDF EXPORT TARGET (ALWAYS IN DOM, EXACT 794px A4) ================= */}
      <div
        id="cv-export-canvas-target"
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-100 z-[-100] print:hidden"
        style={{ width: '794px', minHeight: '1123px', backgroundColor: currentTemplate.bgColor || '#ffffff' }}
        aria-hidden="true"
      >
        <CVRenderer
          data={cvData}
          template={currentTemplate}
          isWatermarked={false}
          scale={1}
          printMode={false}
          customId="cv-export-document"
        />
      </div>
    </div>
  );
};
