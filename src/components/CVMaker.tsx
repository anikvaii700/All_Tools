import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Printer,
  CheckCircle2,
  FileText,
  Trash2,
  Plus,
  Search,
  Eye,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Upload,
  Save,
  Palette,
  Check,
  Pencil,
  Edit3,
  UserCheck,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CVData, CVQualityIssue, SkillItem } from '../types/cvMaker';
import { CV_CATEGORIES, CV_TEMPLATES } from '../data/cvTemplates';
import { SAMPLE_CV_DATA, INITIAL_EMPTY_CV_DATA } from '../data/sampleCVData';
import { CVRenderer } from './cv/CVRenderer';
import { CVMasterProfileModal, MASTER_PROFILE_STORAGE_KEY } from './cv/CVMasterProfileModal';
import { JobCVHelperWorkspace } from './cv/JobCVHelperWorkspace';
import { exportCvToDocx } from '../utils/cvDocxExport';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { DownloadPaywallModal } from './DownloadPaywallModal';

interface CVMakerProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

const LEGACY_PLACEHOLDER_NAMES = ['মোফাসসিরুল ইসলাম', 'মোফাচ্ছির আহমেদ'];

function sanitizeLoadedCv(raw: any): CVData | null {
  if (!raw || typeof raw !== 'object' || !raw.personal) return null;
  const fullName = String(raw.personal.fullName || '').trim();
  if (LEGACY_PLACEHOLDER_NAMES.some((n) => fullName.includes(n))) {
    return null;
  }
  return {
    ...INITIAL_EMPTY_CV_DATA,
    ...raw,
    personal: {
      ...INITIAL_EMPTY_CV_DATA.personal,
      ...raw.personal,
    },
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    education: Array.isArray(raw.education) ? raw.education : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    references: Array.isArray(raw.references) ? raw.references : [],
  };
}

export const CVMaker: React.FC<CVMakerProps> = ({ onShowToast }) => {
  // Guided 3-step workflow + optional AI Job Helper workspace
  const [activeTab, setActiveTab] = useState<'templates' | 'editor' | 'preview' | 'job-helper'>('templates');
  const [helperInitialView, setHelperInitialView] = useState<'hub' | 'interview' | 'result' | 'saved' | 'profile'>('hub');
  const [isCvCompleted, setIsCvCompleted] = useState<boolean>(false);

  // Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl-01');

  // Master Profile Modal State
  const [isMasterProfileModalOpen, setIsMasterProfileModalOpen] = useState(false);
  const [hasMasterProfile, setHasMasterProfile] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(MASTER_PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = sanitizeLoadedCv(JSON.parse(stored));
        return Boolean(parsed?.personal?.fullName);
      }
    } catch {
      // ignore
    }
    return false;
  });

  // CV Data: loads user's saved master profile or user draft; starts clean otherwise
  const [cvData, setCvData] = useState<CVData>(() => {
    try {
      const storedMaster = localStorage.getItem(MASTER_PROFILE_STORAGE_KEY);
      if (storedMaster) {
        const parsedMaster = sanitizeLoadedCv(JSON.parse(storedMaster));
        if (parsedMaster?.personal?.fullName) {
          return parsedMaster;
        }
      }
      const saved = localStorage.getItem('mosafa_cv_draft_v1');
      if (saved) {
        const parsedDraft = sanitizeLoadedCv(JSON.parse(saved));
        if (parsedDraft) {
          return parsedDraft;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_EMPTY_CV_DATA;
  });

  // Template Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Preview Zoom & Export State
  const [zoomLevel, setZoomLevel] = useState<number>(0.88);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Editor Inline UI States (no browser dialogs)
  const [validationError, setValidationError] = useState<string>('');
  const [confirmingReset, setConfirmingReset] = useState<boolean>(false);
  const [showQualityPanel, setShowQualityPanel] = useState<boolean>(false);
  const [showOptionalBio, setShowOptionalBio] = useState<boolean>(false);
  const [showAdditionalSections, setShowAdditionalSections] = useState<boolean>(false);
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillLevel, setNewSkillLevel] = useState<string>('Intermediate');
  const [newLangName, setNewLangName] = useState<string>('');
  const [newLangProficiency, setNewLangProficiency] = useState<string>('Fluent');

  // Autosave CV Data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_cv_draft_v1', JSON.stringify(cvData));
    } catch {
      // ignore
    }
  }, [cvData]);

  // Current active template object
  const currentTemplate = CV_TEMPLATES.find((t) => t.id === selectedTemplateId) || CV_TEMPLATES[0];

  // Refs so async print/PDF/DOCX actions (including Job Helper callbacks) always see latest state
  const cvDataRef = useRef(cvData);
  const currentTemplateRef = useRef(currentTemplate);
  cvDataRef.current = cvData;
  currentTemplateRef.current = currentTemplate;

  // Download Paywall Integration (Preserved)
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isCvUnlockedInSession, setIsCvUnlockedInSession] = useState(false);

  const executeWithPaywall = (action: () => void) => {
    if (isCvUnlockedInSession) {
      action();
      return;
    }
    setPendingAction(() => action);
    setIsPaywallOpen(true);
  };

  // Step 1 -> Step 2: Select a template and move to editor
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = CV_TEMPLATES.find((t) => t.id === templateId);

    // Auto-fill from saved master profile only when form has no name yet
    if (!cvData.personal.fullName.trim()) {
      try {
        const stored = localStorage.getItem(MASTER_PROFILE_STORAGE_KEY);
        if (stored) {
          const master = sanitizeLoadedCv(JSON.parse(stored));
          if (master?.personal?.fullName) {
            setCvData(master);
          }
        }
      } catch {
        // ignore
      }
    }

    setActiveTab('editor');
    if (tmpl) {
      onShowToast(`"${tmpl.nameBn}" নির্বাচন করা হয়েছে। এখন আপনার তথ্য লিখুন।`, '📝');
    }
  };

  // Re-apply master profile on demand
  const handleAutoFillFromProfile = () => {
    try {
      const stored = localStorage.getItem(MASTER_PROFILE_STORAGE_KEY);
      if (stored) {
        const master = sanitizeLoadedCv(JSON.parse(stored));
        if (master?.personal?.fullName) {
          setCvData(master);
          setHasMasterProfile(true);
          setValidationError('');
          onShowToast('প্রোফাইল থেকে তথ্য অটো-ফিল হয়েছে!', '✅');
          return;
        }
      }
    } catch {
      // ignore
    }
    setIsMasterProfileModalOpen(true);
  };

  // Filtered templates list
  const filteredTemplates = CV_TEMPLATES.filter((tmpl) => {
    const matchesCat = categoryFilter === 'all' || tmpl.category === categoryFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      tmpl.nameEn.toLowerCase().includes(q) ||
      tmpl.nameBn.includes(searchQuery.trim()) ||
      tmpl.number.toString().includes(q) ||
      tmpl.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Calculate CV Completeness Score
  const computeQualityIssues = (): { score: number; issues: CVQualityIssue[] } => {
    const issues: CVQualityIssue[] = [];
    let score = 0;

    if (cvData.personal.fullName.trim().length > 2) score += 10;
    else issues.push({ type: 'error', field: 'name', messageBn: 'আপনার পূর্ণ নাম প্রদান করুন।', messageEn: 'Add full name' });

    if (cvData.personal.email.includes('@')) score += 8;
    else issues.push({ type: 'error', field: 'email', messageBn: 'সঠিক ইমেইল এড্রেস লিখুন।', messageEn: 'Add valid email' });

    if (cvData.personal.phone.trim().length > 6) score += 7;
    else issues.push({ type: 'warning', field: 'phone', messageBn: 'যোগাযোগের ফোন নম্বর দিন।', messageEn: 'Add phone number' });

    if (cvData.personal.city || cvData.personal.country) score += 5;
    else issues.push({ type: 'warning', field: 'location', messageBn: 'বর্তমান শহর বা দেশের নাম লিখুন।', messageEn: 'Add location' });

    if (cvData.summary.trim().length > 50) score += 15;
    else if (cvData.summary.trim().length > 10) {
      score += 8;
      issues.push({ type: 'tip', field: 'summary', messageBn: 'পেশাদার সারাংশটি আরও তথ্যবহুল করুন।', messageEn: 'Expand summary' });
    } else {
      issues.push({ type: 'warning', field: 'summary', messageBn: 'একটি পেশাদার সারাংশ (Summary) যুক্ত করুন।', messageEn: 'Add summary' });
    }

    if (cvData.experience.length >= 2) score += 25;
    else if (cvData.experience.length === 1) score += 18;
    else issues.push({ type: 'warning', field: 'exp', messageBn: 'কাজের অভিজ্ঞতা বা ইন্টার্নশিপ যুক্ত করুন (প্রযোজ্য হলে)।', messageEn: 'Add experience' });

    if (cvData.education.length >= 1) score += 15;
    else issues.push({ type: 'error', field: 'edu', messageBn: 'শিক্ষাগত যোগ্যতার বিবরণ দিন।', messageEn: 'Add education' });

    if (cvData.skills.length >= 5) score += 10;
    else if (cvData.skills.length >= 2) score += 6;
    else issues.push({ type: 'warning', field: 'skills', messageBn: 'কমপক্ষে ৫টি প্রাসঙ্গিক স্কিল যুক্ত করুন।', messageEn: 'Add at least 5 skills' });

    if (cvData.languages.length >= 1) score += 5;
    else issues.push({ type: 'tip', field: 'lang', messageBn: 'ভাষাগত দক্ষতা উল্লেখ করুন।', messageEn: 'Add languages' });

    return { score: Math.min(100, score), issues };
  };

  const qualityResult = computeQualityIssues();

  const handleReset = () => {
    setCvData(INITIAL_EMPTY_CV_DATA);
    setIsCvCompleted(false);
    setConfirmingReset(false);
    setValidationError('');
    onShowToast('সব তথ্য মুছে ফাঁকা ফরম তৈরি করা হয়েছে।', '🔄');
  };

  const handleLoadSample = () => {
    setCvData(SAMPLE_CV_DATA);
    setValidationError('');
    onShowToast('নমুনা তথ্য লোড হয়েছে। প্রয়োজনে পরিবর্তন করে "CV তৈরি করুন" চাপুন।', '📝');
  };

  const handleExportJSON = () => {
    const safeName = cvData.personal.fullName.trim().replace(/[^a-zA-Z0-9_\u0980-\u09FF]+/g, '_') || 'Draft';
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cvData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `${safeName}_CV_Backup.json`);
    dl.click();
    dl.remove();
    onShowToast('CV ব্যাকআপ ফাইল ডাউনলোড হয়েছে!', '💾');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = sanitizeLoadedCv(JSON.parse(event.target?.result as string));
        if (parsed) {
          setCvData(parsed);
          setValidationError('');
          onShowToast('CV ফাইল সফলভাবে লোড হয়েছে!', '📂');
        } else {
          onShowToast('ফাইল ফরম্যাট সঠিক নয়।', '⚠️');
        }
      } catch {
        onShowToast('ফাইল পড়তে ব্যর্থ হয়েছে।', '❌');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    const newSk: SkillItem = {
      id: `sk-${Date.now()}`,
      name: trimmed,
      category: 'technical',
      level: newSkillLevel,
    };
    setCvData((prev) => ({ ...prev, skills: [...prev.skills, newSk] }));
    setNewSkillName('');
  };

  const handleAddLanguage = () => {
    const trimmed = newLangName.trim();
    if (!trimmed) return;
    const newLang = {
      id: `lang-${Date.now()}`,
      language: trimmed,
      proficiency: newLangProficiency,
    };
    setCvData((prev) => ({ ...prev, languages: [...prev.languages, newLang] }));
    setNewLangName('');
  };

  // Step 2 -> Step 3: Validate and generate final CV preview
  const handleCompleteCV = () => {
    if (!cvData.personal.fullName.trim()) {
      setValidationError('অনুগ্রহ করে অন্তত আপনার পূর্ণ নাম (Full Name) লিখুন।');
      onShowToast('CV তৈরি করতে আপনার পূর্ণ নাম লিখুন।', '⚠️');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setValidationError('');
    setIsCvCompleted(true);
    setActiveTab('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onShowToast('আপনার CV প্রস্তুত! এখন প্রিভিউ, প্রিন্ট বা ডাউনলোড করতে পারেন।', '✅');
  };

  // Clean, reliable A4 print matching preview exactly with zero branding
  const performPrintCV = () => {
    try {
      window.focus();
      onShowToast('প্রিন্ট প্রস্তুত হচ্ছে...', '🖨️');

      const sourceEl =
        document.getElementById('cv-export-document') ||
        document.getElementById('cv-render-document');

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

      const activeCv = cvDataRef.current;
      const activeTemplate = currentTemplateRef.current;

      const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
      if (iframeDoc && sourceEl) {
        const cloned = sourceEl.cloneNode(true) as HTMLElement;
        cloned.style.transform = 'none';
        cloned.style.width = '210mm';
        cloned.style.minHeight = 'auto';
        cloned.style.boxShadow = 'none';
        cloned.style.margin = '0 auto';

        const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
          .map((s) => s.outerHTML)
          .join('\n');

        const docTitle = activeCv.personal.fullName.trim()
          ? `${activeCv.personal.fullName.trim()} - CV`
          : 'Curriculum Vitae';

        iframeDoc.open();
        iframeDoc.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${docTitle.replace(/[<>]/g, '')}</title>
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
        background: ${activeTemplate.bgColor || '#ffffff'} !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .cv-print-isolated {
        width: 210mm !important;
        margin: 0 auto !important;
        background: ${activeTemplate.bgColor || '#ffffff'} !important;
      }
      .cv-avoid-break {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
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
      ${cloned.outerHTML}
    </div>
  </body>
</html>`);
        iframeDoc.close();

        const triggerIframePrint = () => {
          try {
            printIframe?.contentWindow?.focus();
            printIframe?.contentWindow?.print();
          } catch {
            document.body.classList.add('printing-cv');
            window.focus();
            window.print();
            setTimeout(() => document.body.classList.remove('printing-cv'), 1500);
          }
        };

        if (iframeDoc.fonts?.ready) {
          iframeDoc.fonts.ready.then(() => setTimeout(triggerIframePrint, 250));
        } else {
          setTimeout(triggerIframePrint, 450);
        }
        return;
      }

      document.body.classList.add('printing-cv');
      window.focus();
      window.print();
      setTimeout(() => document.body.classList.remove('printing-cv'), 1500);
    } catch {
      document.body.classList.add('printing-cv');
      window.focus();
      window.print();
      setTimeout(() => document.body.classList.remove('printing-cv'), 1500);
    }
  };

  const handlePrintCV = () => {
    executeWithPaywall(performPrintCV);
  };

  // High-Quality Multi-Page & Single-Page A4 PDF Download with smart break snapping
  const performDownloadPDF = async () => {
    try {
      setIsDownloadingPdf(true);
      onShowToast('PDF ফাইল তৈরি হচ্ছে...', '⏳');

      await new Promise((r) => setTimeout(r, 150));

      const target =
        document.getElementById('cv-export-document') ||
        document.getElementById('cv-render-document');

      if (!target) {
        throw new Error('CV export element not found');
      }

      // Measure unbreakable entry blocks relative to target before rendering
      const targetRect = target.getBoundingClientRect();
      const domTotalHeight = Math.max(1, target.scrollHeight);
      const breakBlocks = Array.from(target.querySelectorAll('.cv-avoid-break')).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: Math.max(0, r.top - targetRect.top),
          bottom: Math.max(0, r.bottom - targetRect.top),
        };
      });

      const activeCv = cvDataRef.current;
      const activeTemplate = currentTemplateRef.current;

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: activeTemplate.bgColor || '#ffffff',
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
      const canvasScale = canvas.height / domTotalHeight;
      const pageCanvasHeight = Math.floor((canvas.width * 297) / 210);

      // Single page if within tolerance (avoids unwanted blank 2nd page)
      if (canvas.height <= pageCanvasHeight + 28) {
        const imgData = canvas.toDataURL('image/jpeg', 0.96);
        const actualImgHeightMm = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(actualImgHeightMm, pdfHeight), undefined, 'FAST');
      } else {
        const scaledBlocks = breakBlocks.map((b) => ({
          top: Math.floor(b.top * canvasScale),
          bottom: Math.ceil(b.bottom * canvasScale),
        }));

        let cursorY = 0;
        let pageIndex = 0;

        while (cursorY < canvas.height - 24 && pageIndex < 10) {
          let nextCut = Math.min(canvas.height, cursorY + pageCanvasHeight);

          if (nextCut < canvas.height - 24) {
            // Find any unbreakable entry straddling the raw page cut
            const straddling = scaledBlocks.find(
              (b) =>
                b.top < nextCut &&
                b.bottom > nextCut &&
                b.bottom - b.top <= pageCanvasHeight * 0.85 &&
                b.top > cursorY + 80
            );
            if (straddling) {
              nextCut = straddling.top - 10;
            }
          }

          const sliceHeight = Math.max(1, nextCut - cursorY);
          if (sliceHeight <= 24 && pageIndex > 0) {
            break;
          }

          if (pageIndex > 0) {
            pdf.addPage();
          }

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageCanvasHeight;
          const ctx = pageCanvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = activeTemplate.bgColor || '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight);
            ctx.drawImage(canvas, 0, cursorY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          }

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.96);
          pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

          cursorY = nextCut;
          pageIndex++;
        }
      }

      const safeName = (activeCv.personal.fullName || 'Resume')
        .trim()
        .replace(/[^a-zA-Z0-9_\u0980-\u09FF]+/g, '_');
      pdf.save(`${safeName}_CV.pdf`);
      onShowToast('PDF সফলভাবে ডাউনলোড হয়েছে!', '✅');
    } catch {
      onShowToast('PDF তৈরিতে সমস্যা হয়েছে। প্রিন্ট ডায়ালগ থেকে "Save as PDF" চেষ্টা করুন।', '🖨️');
      performPrintCV();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadPDF = () => {
    executeWithPaywall(performDownloadPDF);
  };

  const performDownloadDOCX = async () => {
    try {
      await exportCvToDocx(cvDataRef.current, 'en', currentTemplateRef.current.primaryColor);
      onShowToast('Word (.docx) ফাইল ডাউনলোড হয়েছে!', '📄');
    } catch {
      onShowToast('DOCX তৈরি করতে সমস্যা হয়েছে।', '⚠️');
    }
  };

  const handleDownloadDOCX = () => {
    executeWithPaywall(() => {
      void performDownloadDOCX();
    });
  };

  const canShowPreviewExports = isCvCompleted && Boolean(cvData.personal.fullName.trim());

  return (
    <div className="relative">
      {/* Screen UI Container */}
      <div className="cv-screen-only print:hidden min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
        {/* ================= CLEAN WORKSPACE HEADER (NO EXPORT CLUTTER) ================= */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                  CV বিল্ডার
                </h1>
                <p className="text-[11px] text-slate-500 truncate">
                  নির্বাচিত: #{currentTemplate.number.toString().padStart(2, '0')} · {currentTemplate.nameBn}
                </p>
              </div>
            </div>

            {/* Linear 3-Step Workflow + Secondary Helper */}
            <nav className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'templates'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>১. টেমপ্লেট</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'editor'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>২. তথ্য লিখুন</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'preview'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>৩. চূড়ান্ত প্রিভিউ</span>
              </button>

              <span className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

              <button
                type="button"
                onClick={() => {
                  setHelperInitialView('hub');
                  setActiveTab('job-helper');
                }}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 border ${
                  activeTab === 'job-helper'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI CV সহায়তা</span>
              </button>
            </nav>
          </div>
        </header>

        {/* ================= STEP 1: CLEAN TEMPLATE GALLERY ================= */}
        {activeTab === 'templates' && (
          <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            {/* Simple, clean gallery header & search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  টেমপ্লেট নির্বাচন করুন
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  আপনার পছন্দের প্রফেশনাল ফরম্যাট বেছে নিন, তারপর আপনার তথ্য পূরণ করে CV তৈরি করুন।
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="টেমপ্লেট খুঁজুন (নাম বা নম্বর)..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsMasterProfileModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{hasMasterProfile ? 'সংরক্ষিত প্রোফাইল' : 'প্রোফাইল সেটআপ'}</span>
                </button>
              </div>
            </div>

            {/* Clean Category Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 border ${
                  categoryFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                সবগুলো ({CV_TEMPLATES.length})
              </button>
              {CV_CATEGORIES.map((cat) => {
                const isActive = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(isActive ? 'all' : cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 border ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.nameBn}
                  </button>
                );
              })}
            </div>

            {/* Clean Template Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700">কোনো টেমপ্লেট পাওয়া যায়নি।</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  সব টেমপ্লেট দেখুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredTemplates.map((tmpl) => {
                  const isSelected = tmpl.id === selectedTemplateId;

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`bg-white rounded-2xl p-4 border transition-all duration-150 flex flex-col justify-between group cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 ring-1 ring-slate-900 shadow-md'
                          : 'border-slate-200 hover:border-slate-400 hover:shadow-sm'
                      }`}
                    >
                      {/* Unboxed Metadata Row */}
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2.5">
                        <span>
                          #{tmpl.number.toString().padStart(2, '0')} · ATS {tmpl.atsScore}%
                        </span>
                        {isSelected && (
                          <span className="text-slate-900 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            নির্বাচিত
                          </span>
                        )}
                      </div>

                      {/* Clean Mini Layout Preview */}
                      <div
                        className="h-44 rounded-xl p-2.5 border border-slate-200/80 flex flex-col justify-between mb-3 overflow-hidden"
                        style={{ backgroundColor: tmpl.bgColor }}
                      >
                        {tmpl.layoutStyle === 'sidebar-left' ? (
                          <div className="flex gap-1.5 h-full">
                            <div
                              className="w-1/3 rounded p-1.5 flex flex-col gap-1 shrink-0"
                              style={{ backgroundColor: tmpl.sidebarBg || '#f1f5f9' }}
                            >
                              <div className="w-5 h-5 rounded-full mx-auto" style={{ backgroundColor: tmpl.primaryColor }} />
                              <div className="w-full h-1 bg-slate-300 rounded mt-1" />
                              <div className="w-4/5 h-1 bg-slate-300 rounded" />
                              <div className="w-2/3 h-1 bg-slate-300 rounded" />
                            </div>
                            <div className="flex-1 p-1.5 flex flex-col gap-1.5 bg-slate-50 rounded border border-slate-100">
                              <div className="w-3/4 h-2 rounded" style={{ backgroundColor: tmpl.primaryColor }} />
                              <div className="w-1/2 h-1 bg-slate-300 rounded" />
                              <div className="w-full h-1 bg-slate-200 rounded mt-1" />
                              <div className="w-5/6 h-1 bg-slate-200 rounded" />
                              <div className="w-full h-1 bg-slate-200 rounded" />
                            </div>
                          </div>
                        ) : tmpl.layoutStyle === 'sidebar-right' ? (
                          <div className="flex gap-1.5 h-full">
                            <div className="flex-1 p-1.5 flex flex-col gap-1.5 bg-slate-50 rounded border border-slate-100">
                              <div className="w-3/4 h-2 rounded" style={{ backgroundColor: tmpl.primaryColor }} />
                              <div className="w-1/2 h-1 bg-slate-300 rounded" />
                              <div className="w-full h-1 bg-slate-200 rounded mt-1" />
                              <div className="w-5/6 h-1 bg-slate-200 rounded" />
                            </div>
                            <div
                              className="w-1/3 rounded p-1.5 flex flex-col gap-1 shrink-0"
                              style={{ backgroundColor: tmpl.sidebarBg || '#f1f5f9' }}
                            >
                              <div className="w-5 h-5 rounded-full mx-auto" style={{ backgroundColor: tmpl.primaryColor }} />
                              <div className="w-full h-1 bg-slate-300 rounded mt-1" />
                              <div className="w-4/5 h-1 bg-slate-300 rounded" />
                            </div>
                          </div>
                        ) : tmpl.layoutStyle === 'header-accent' ? (
                          <div className="flex flex-col gap-1.5 h-full">
                            <div className="p-2 rounded flex items-center justify-between" style={{ backgroundColor: tmpl.primaryColor }}>
                              <div className="w-16 h-2 bg-white/85 rounded-sm" />
                              <div className="w-4 h-4 rounded-sm bg-white/40" />
                            </div>
                            <div className="flex-1 grid grid-cols-3 gap-1.5">
                              <div className="col-span-2 p-1.5 rounded bg-slate-50 border border-slate-100 flex flex-col gap-1">
                                <div className="w-full h-1 bg-slate-300 rounded" />
                                <div className="w-5/6 h-1 bg-slate-200 rounded" />
                                <div className="w-4/6 h-1 bg-slate-200 rounded" />
                              </div>
                              <div className="p-1.5 rounded bg-slate-100 flex flex-col gap-1">
                                <div className="w-full h-1 bg-slate-300 rounded" />
                                <div className="w-2/3 h-1 bg-slate-300 rounded" />
                              </div>
                            </div>
                          </div>
                        ) : tmpl.layoutStyle === 'creative-banner' ? (
                          <div className="flex flex-col gap-1.5 h-full">
                            <div className="p-2 rounded flex items-center justify-between" style={{ backgroundColor: tmpl.primaryColor }}>
                              <div className="w-14 h-2 bg-white/90 rounded-sm" />
                              <div className="w-5 h-5 rounded-full border border-white/80" style={{ backgroundColor: tmpl.secondaryColor }} />
                            </div>
                            <div className="flex-1 p-2 rounded bg-slate-50 border border-slate-100 flex flex-col gap-1.5 relative pl-3.5">
                              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 rounded" style={{ backgroundColor: tmpl.primaryColor }} />
                              <div className="w-3/4 h-1.5 bg-slate-400 rounded" />
                              <div className="w-full h-1 bg-slate-200 rounded" />
                              <div className="w-5/6 h-1 bg-slate-200 rounded" />
                            </div>
                          </div>
                        ) : tmpl.layoutStyle === 'europass' ? (
                          <div className="flex flex-col gap-1 h-full border border-blue-200 rounded p-1.5">
                            <div className="flex justify-between items-center pb-1 border-b border-blue-200">
                              <span className="text-[8px] font-bold tracking-wider text-blue-800">EUROPASS</span>
                              <div className="w-3 h-3 rounded-sm bg-blue-800" />
                            </div>
                            <div className="flex-1 flex gap-1.5 pt-1">
                              <div className="w-1/4 flex flex-col gap-1">
                                <div className="w-full h-1 bg-blue-400 rounded" />
                                <div className="w-3/4 h-1 bg-slate-200 rounded" />
                              </div>
                              <div className="w-3/4 flex flex-col gap-1">
                                <div className="w-3/4 h-1 bg-slate-800 rounded" />
                                <div className="w-full h-1 bg-slate-200 rounded" />
                                <div className="w-5/6 h-1 bg-slate-200 rounded" />
                              </div>
                            </div>
                          </div>
                        ) : tmpl.layoutStyle === 'modern-grid' ? (
                          <div className="flex flex-col gap-1.5 h-full">
                            <div className="p-1.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                              <div className="w-16 h-1.5 rounded" style={{ backgroundColor: tmpl.primaryColor }} />
                              <div className="w-4 h-4 rounded-full bg-slate-300" />
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-1.5">
                              <div className="p-1.5 rounded border border-slate-100 bg-white flex flex-col gap-1">
                                <div className="w-full h-1 bg-slate-300 rounded" />
                                <div className="w-4/5 h-1 bg-slate-200 rounded" />
                              </div>
                              <div className="p-1.5 rounded border border-slate-100 bg-slate-50 flex flex-col gap-1">
                                <div className="w-full h-1 bg-slate-300 rounded" />
                                <div className="w-3/5 h-1 bg-slate-200 rounded" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col justify-between h-full p-2 bg-slate-50/70 rounded border border-slate-200/80">
                            <div className="text-center space-y-1 pb-1.5 border-b" style={{ borderColor: tmpl.primaryColor }}>
                              <div className="w-20 h-1.5 mx-auto rounded" style={{ backgroundColor: tmpl.primaryColor }} />
                              <div className="w-12 h-1 bg-slate-300 mx-auto rounded" />
                            </div>
                            <div className="space-y-1.5 my-1">
                              <div className="w-full h-1 bg-slate-200 rounded" />
                              <div className="w-5/6 h-1 bg-slate-200 rounded" />
                              <div className="w-4/6 h-1 bg-slate-200 rounded" />
                            </div>
                            <div className="pt-1 border-t border-slate-200 flex justify-between">
                              <div className="w-1/3 h-1 bg-slate-300 rounded" />
                              <div className="w-1/3 h-1 bg-slate-300 rounded" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Title & Info */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">
                          {tmpl.nameBn}
                        </h3>
                        <div className="text-[11px] text-slate-500 font-medium truncate">
                          {tmpl.nameEn}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {tmpl.descriptionBn}
                        </p>
                      </div>

                      {/* Single Clean Select Action (Advances to Step 2) */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTemplate(tmpl.id);
                          }}
                          className={`w-full py-2 px-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <span>{isSelected ? 'তথ্য লিখুন' : 'নির্বাচন করুন'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        )}

        {/* ================= STEP 2: FOCUSED CV EDITOR ================= */}
        {activeTab === 'editor' && (
          <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
            {/* Compact Editor Utility Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: currentTemplate.primaryColor }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    #{currentTemplate.number.toString().padStart(2, '0')} · {currentTemplate.nameBn}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('templates')}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    টেমপ্লেট পরিবর্তন করুন
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleAutoFillFromProfile}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{hasMasterProfile ? 'প্রোফাইল অটো-ফিল' : 'প্রোফাইল সেটআপ'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
                >
                  নমুনা তথ্য
                </button>

                <label className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>ইম্পোর্ট</span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ব্যাকআপ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQualityPanel((v) => !v)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>পূর্ণতা: {qualityResult.score}%</span>
                </button>

                {confirmingReset ? (
                  <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                    <span className="text-[11px] font-semibold text-rose-800">মুছবেন?</span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                    >
                      হ্যাঁ
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingReset(false)}
                      className="px-2 py-0.5 rounded bg-white text-slate-700 text-[11px] font-semibold border border-slate-200 cursor-pointer"
                    >
                      না
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingReset(true)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="সব তথ্য মুছুন"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Optional Expandable Quality Checklist */}
            {showQualityPanel && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>সিভি সম্পূর্ণতা নির্দেশিকা ({qualityResult.score}%)</span>
                  <button
                    type="button"
                    onClick={() => setShowQualityPanel(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                {qualityResult.issues.length === 0 ? (
                  <p className="text-emerald-700 font-semibold">সকল গুরুত্বপূর্ণ তথ্য সঠিকভাবে যুক্ত আছে।</p>
                ) : (
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {qualityResult.issues.map((iss, idx) => (
                      <li key={idx}>{iss.messageBn}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Inline Validation Message */}
            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* 1. Personal Information */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                ১. ব্যক্তিগত তথ্য (Personal Details)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পূর্ণ নাম *</label>
                  <input
                    type="text"
                    value={cvData.personal.fullName}
                    onChange={(e) => {
                      setValidationError('');
                      setCvData({ ...cvData, personal: { ...cvData.personal, fullName: e.target.value } });
                    }}
                    placeholder="যেমন: রহিম আহমেদ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পদবী / পেশা *</label>
                  <input
                    type="text"
                    value={cvData.personal.jobTitle}
                    onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, jobTitle: e.target.value } })}
                    placeholder="যেমন: Senior Software Engineer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ইমেইল এড্রেস *</label>
                  <input
                    type="email"
                    value={cvData.personal.email}
                    onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, email: e.target.value } })}
                    placeholder="example@email.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    value={cvData.personal.phone}
                    onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, phone: e.target.value } })}
                    placeholder="+880 1712-345678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">শহর</label>
                  <input
                    type="text"
                    value={cvData.personal.city}
                    onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, city: e.target.value } })}
                    placeholder="ঢাকা"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">দেশ</label>
                  <input
                    type="text"
                    value={cvData.personal.country}
                    onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, country: e.target.value } })}
                    placeholder="বাংলাদেশ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">ঠিকানা (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={cvData.personal.address}
                    onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, address: e.target.value } })}
                    placeholder="বাড়ি নং, রোড, এলাকা"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">LinkedIn লিংক</label>
                  <input
                    type="text"
                    value={cvData.personal.linkedin}
                    onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, linkedin: e.target.value } })}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">GitHub / পোর্টফোলিও লিংক</label>
                  <input
                    type="text"
                    value={cvData.personal.github}
                    onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, github: e.target.value } })}
                    placeholder="github.com/username"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">প্রোফাইল ছবি (ঐচ্ছিক)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cvData.personal.photoUrl}
                      onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, photoUrl: e.target.value } })}
                      placeholder="ছবির URL দিন অথবা ডানদিকের বাটন থেকে আপলোড করুন"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>আপলোড</span>
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
                              personal: { ...prev.personal, photoUrl: base64 },
                            }));
                            onShowToast('ছবি যুক্ত হয়েছে!', '🖼️');
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
                        className="px-2.5 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                        title="ছবি মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Personal Bio & Signature Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOptionalBio((v) => !v)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOptionalBio ? 'rotate-180' : ''}`} />
                  <span>অতিরিক্ত ব্যক্তিগত তথ্য ও স্বাক্ষর (জাতীয়তা, জন্ম তারিখ, পিতা/মাতা — ঐচ্ছিক)</span>
                </button>

                {showOptionalBio && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-xs">
                    <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(cvData.personal.includePersonalDetailsBlock)}
                        onChange={(e) =>
                          setCvData({
                            ...cvData,
                            personal: { ...cvData.personal, includePersonalDetailsBlock: e.target.checked },
                          })
                        }
                        className="rounded"
                      />
                      <span>CV-তে ব্যক্তিগত তথ্য (Personal Information) সেকশন দেখান</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">পিতার নাম</label>
                        <input
                          type="text"
                          value={cvData.personal.fatherName || ''}
                          onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, fatherName: e.target.value } })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">মাতার নাম</label>
                        <input
                          type="text"
                          value={cvData.personal.motherName || ''}
                          onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, motherName: e.target.value } })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">জন্ম তারিখ</label>
                        <input
                          type="text"
                          value={cvData.personal.dateOfBirth || ''}
                          onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, dateOfBirth: e.target.value } })}
                          placeholder="যেমন: 15 Jan 1998"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">জাতীয়তা</label>
                        <input
                          type="text"
                          value={cvData.personal.nationality || ''}
                          onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, nationality: e.target.value } })}
                          placeholder="Bangladeshi"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-700 block mb-1">স্থায়ী ঠিকানা</label>
                        <input
                          type="text"
                          value={cvData.personal.permanentAddress || ''}
                          onChange={(e) => setCvData({ ...cvData, personal: { ...cvData.personal, permanentAddress: e.target.value } })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-semibold text-slate-700 block mb-1">স্বাক্ষর (Signature Image — ঐচ্ছিক)</label>
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>স্বাক্ষর আপলোড</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setCvData((prev) => ({
                                    ...prev,
                                    personal: { ...prev.personal, signatureUrl: String(event.target?.result || '') },
                                  }));
                                };
                                reader.readAsDataURL(file);
                                e.target.value = '';
                              }}
                              className="hidden"
                            />
                          </label>
                          {cvData.personal.signatureUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setCvData((prev) => ({
                                  ...prev,
                                  personal: { ...prev.personal, signatureUrl: '' },
                                }))
                              }
                              className="text-rose-600 font-semibold hover:underline cursor-pointer"
                            >
                              স্বাক্ষর মুছুন
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 2. Professional Summary */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  ২. পেশাদার সারাংশ (Professional Summary)
                </h2>
                <span className="text-xs text-slate-500">{cvData.summary.length} অক্ষর</span>
              </div>
              <textarea
                rows={4}
                value={cvData.summary}
                onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                placeholder="আপনার অভিজ্ঞতা, মূল দক্ষতা এবং ক্যারিয়ারের লক্ষ্য ৩-৪ বাক্যে লিখুন..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </section>

            {/* 3. Work Experience */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  ৩. কাজের অভিজ্ঞতা (Work Experience)
                </h2>
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
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>অভিজ্ঞতা যোগ করুন</span>
                </button>
              </div>

              {cvData.experience.length === 0 && (
                <p className="text-xs text-slate-500 py-2">
                  কোনো অভিজ্ঞতা যুক্ত করা হয়নি। ফ্রেশার হলে এটি খালি রাখতে পারেন অথবা ইন্টার্নশিপ/প্রজেক্ট যুক্ত করতে পারেন।
                </p>
              )}

              {cvData.experience.map((exp, index) => (
                <div key={exp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
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
                      <label className="font-semibold text-slate-700 block mb-1">পদের নাম / Job Title</label>
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
                      <label className="font-semibold text-slate-700 block mb-1">কোম্পানির নাম / Employer</label>
                      <input
                        type="text"
                        value={exp.employer}
                        onChange={(e) => {
                          const updated = cvData.experience.map((item) =>
                            item.id === exp.id ? { ...item, employer: e.target.value } : item
                          );
                          setCvData({ ...cvData, experience: updated });
                        }}
                        placeholder="যেমন: Tech Solutions Ltd."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">শুরুর তারিখ</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => {
                          const updated = cvData.experience.map((item) =>
                            item.id === exp.id ? { ...item, startDate: e.target.value } : item
                          );
                          setCvData({ ...cvData, experience: updated });
                        }}
                        placeholder="যেমন: Jan 2022"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">শেষের তারিখ / বর্তমান</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          disabled={exp.current}
                          value={exp.current ? 'Present' : exp.endDate}
                          onChange={(e) => {
                            const updated = cvData.experience.map((item) =>
                              item.id === exp.id ? { ...item, endDate: e.target.value } : item
                            );
                            setCvData({ ...cvData, experience: updated });
                          }}
                          placeholder="যেমন: Dec 2024"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 disabled:bg-slate-100"
                        />
                        <label className="flex items-center gap-1 font-semibold text-slate-700 shrink-0 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => {
                              const updated = cvData.experience.map((item) =>
                                item.id === exp.id ? { ...item, current: e.target.checked } : item
                              );
                              setCvData({ ...cvData, experience: updated });
                            }}
                            className="rounded"
                          />
                          <span>চলমান</span>
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">অবস্থান (Location — ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => {
                          const updated = cvData.experience.map((item) =>
                            item.id === exp.id ? { ...item, location: e.target.value } : item
                          );
                          setCvData({ ...cvData, experience: updated });
                        }}
                        placeholder="যেমন: Dhaka, Bangladesh"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-xs">দায়িত্ব ও অর্জনসমূহ (প্রতি লাইনে একটি পয়েন্ট)</label>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => {
                        const updated = cvData.experience.map((item) =>
                          item.id === exp.id ? { ...item, description: e.target.value } : item
                        );
                        setCvData({ ...cvData, experience: updated });
                      }}
                      placeholder="• মূল দায়িত্ব এবং অর্জিত ফলাফল লিখুন..."
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* 4. Education */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  ৪. শিক্ষাগত যোগ্যতা (Education)
                </h2>
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
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ডিগ্রি যোগ করুন</span>
                </button>
              </div>

              {cvData.education.length === 0 && (
                <p className="text-xs text-slate-500 py-2">
                  আপনার সাম্প্রতিক ডিগ্রি বা শিক্ষাগত যোগ্যতা যোগ করুন।
                </p>
              )}

              {cvData.education.map((edu, index) => (
                <div key={edu.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">শিক্ষাগত যোগ্যতা #{index + 1}</span>
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
                      <label className="font-semibold text-slate-700 block mb-1">ডিগ্রির নাম</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = cvData.education.map((item) =>
                            item.id === edu.id ? { ...item, degree: e.target.value } : item
                          );
                          setCvData({ ...cvData, education: updated });
                        }}
                        placeholder="যেমন: B.Sc. in Computer Science"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">বিভাগ / বিষয় (Field of Study)</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => {
                          const updated = cvData.education.map((item) =>
                            item.id === edu.id ? { ...item, fieldOfStudy: e.target.value } : item
                          );
                          setCvData({ ...cvData, education: updated });
                        }}
                        placeholder="যেমন: Computer Science & Engineering"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">শিক্ষা প্রতিষ্ঠানের নাম</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = cvData.education.map((item) =>
                            item.id === edu.id ? { ...item, institution: e.target.value } : item
                          );
                          setCvData({ ...cvData, education: updated });
                        }}
                        placeholder="যেমন: University of Dhaka"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">শুরুর বছর</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => {
                            const updated = cvData.education.map((item) =>
                              item.id === edu.id ? { ...item, startDate: e.target.value } : item
                            );
                            setCvData({ ...cvData, education: updated });
                          }}
                          placeholder="2018"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">পাসের বছর</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => {
                            const updated = cvData.education.map((item) =>
                              item.id === edu.id ? { ...item, endDate: e.target.value } : item
                            );
                            setCvData({ ...cvData, education: updated });
                          }}
                          placeholder="2022"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">GPA / CGPA (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => {
                          const updated = cvData.education.map((item) =>
                            item.id === edu.id ? { ...item, gpa: e.target.value } : item
                          );
                          setCvData({ ...cvData, education: updated });
                        }}
                        placeholder="যেমন: 3.85 / 4.00"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">অবস্থান (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={edu.location}
                        onChange={(e) => {
                          const updated = cvData.education.map((item) =>
                            item.id === edu.id ? { ...item, location: e.target.value } : item
                          );
                          setCvData({ ...cvData, education: updated });
                        }}
                        placeholder="যেমন: Dhaka"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* 5. Skills & Languages (Inline inputs, zero prompt()) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Skills */}
              <section className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                  ৫. দক্ষতাসমূহ (Skills)
                </h3>

                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="যেমন: React, Excel, Project Management"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    className="px-2 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="Expert">Expert</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Beginner">Beginner</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shrink-0"
                  >
                    যোগ
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cvData.skills.map((sk) => (
                    <span
                      key={sk.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                    >
                      <span>{sk.name}</span>
                      <button
                        type="button"
                        onClick={() => setCvData({ ...cvData, skills: cvData.skills.filter((s) => s.id !== sk.id) })}
                        className="text-slate-400 hover:text-rose-600 font-bold cursor-pointer"
                        aria-label={`Remove ${sk.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </section>

              {/* Languages */}
              <section className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
                  ৬. ভাষা (Languages)
                </h3>

                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    value={newLangName}
                    onChange={(e) => setNewLangName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLanguage();
                      }
                    }}
                    placeholder="যেমন: Bangla, English"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <select
                    value={newLangProficiency}
                    onChange={(e) => setNewLangProficiency(e.target.value)}
                    className="px-2 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="Native">Native</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Professional">Professional</option>
                    <option value="Intermediate">Intermediate</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer shrink-0"
                  >
                    যোগ
                  </button>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  {cvData.languages.map((lg) => (
                    <div key={lg.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-800">
                        {lg.language} {lg.proficiency ? `(${lg.proficiency})` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCvData({ ...cvData, languages: cvData.languages.filter((l) => l.id !== lg.id) })}
                        className="text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        মুছুন
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* 7. Optional Additional Sections: Projects, Certifications, References */}
            <section className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
              <button
                type="button"
                onClick={() => setShowAdditionalSections((v) => !v)}
                className="w-full flex items-center justify-between text-sm font-bold text-slate-900 cursor-pointer"
              >
                <span>৭. প্রজেক্ট, সার্টিফিকেশন ও রেফারেন্স (ঐচ্ছিক)</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showAdditionalSections ? 'rotate-180' : ''}`} />
              </button>

              {showAdditionalSections && (
                <div className="pt-3 border-t border-slate-100 space-y-6 text-xs">
                  {/* Projects */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800">প্রজেক্টসমূহ (Projects)</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setCvData({
                            ...cvData,
                            projects: [
                              ...cvData.projects,
                              { id: `prj-${Date.now()}`, name: '', role: '', link: '', description: '' },
                            ],
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                      >
                        + প্রজেক্ট যোগ করুন
                      </button>
                    </div>
                    {cvData.projects.map((prj) => (
                      <div key={prj.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">প্রজেক্ট বিবরণ</span>
                          <button
                            type="button"
                            onClick={() => setCvData({ ...cvData, projects: cvData.projects.filter((p) => p.id !== prj.id) })}
                            className="text-rose-600 font-semibold cursor-pointer"
                          >
                            মুছুন
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={prj.name}
                            onChange={(e) =>
                              setCvData({
                                ...cvData,
                                projects: cvData.projects.map((p) => (p.id === prj.id ? { ...p, name: e.target.value } : p)),
                              })
                            }
                            placeholder="প্রজেক্টের নাম"
                            className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                          />
                          <input
                            type="text"
                            value={prj.role}
                            onChange={(e) =>
                              setCvData({
                                ...cvData,
                                projects: cvData.projects.map((p) => (p.id === prj.id ? { ...p, role: e.target.value } : p)),
                              })
                            }
                            placeholder="আপনার ভূমিকা (Role)"
                            className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={prj.description}
                          onChange={(e) =>
                            setCvData({
                              ...cvData,
                              projects: cvData.projects.map((p) => (p.id === prj.id ? { ...p, description: e.target.value } : p)),
                            })
                          }
                          placeholder="সংক্ষিপ্ত বিবরণ..."
                          className="w-full p-2 rounded-lg bg-white border border-slate-300"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800">সার্টিফিকেশন ও প্রশিক্ষণ (Certifications)</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setCvData({
                            ...cvData,
                            certifications: [
                              ...cvData.certifications,
                              { id: `cert-${Date.now()}`, name: '', issuer: '', date: '' },
                            ],
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                      >
                        + সার্টিফিকেট যোগ করুন
                      </button>
                    </div>
                    {cvData.certifications.map((cert) => (
                      <div key={cert.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) =>
                            setCvData({
                              ...cvData,
                              certifications: cvData.certifications.map((c) => (c.id === cert.id ? { ...c, name: e.target.value } : c)),
                            })
                          }
                          placeholder="কোর্স বা সার্টিফিকেটের নাম"
                          className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-slate-300"
                        />
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) =>
                            setCvData({
                              ...cvData,
                              certifications: cvData.certifications.map((c) => (c.id === cert.id ? { ...c, issuer: e.target.value } : c)),
                            })
                          }
                          placeholder="প্রতিষ্ঠান"
                          className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={cert.date}
                            onChange={(e) =>
                              setCvData({
                                ...cvData,
                                certifications: cvData.certifications.map((c) => (c.id === cert.id ? { ...c, date: e.target.value } : c)),
                              })
                            }
                            placeholder="সাল"
                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setCvData({
                                ...cvData,
                                certifications: cvData.certifications.filter((c) => c.id !== cert.id),
                              })
                            }
                            className="text-rose-600 font-semibold cursor-pointer shrink-0"
                          >
                            মুছুন
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* References */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800">রেফারেন্স (References)</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setCvData({
                            ...cvData,
                            references: [
                              ...cvData.references,
                              { id: `ref-${Date.now()}`, name: '', jobTitle: '', company: '', email: '', phone: '' },
                            ],
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                      >
                        + রেফারেন্স যোগ করুন
                      </button>
                    </div>
                    {cvData.references.map((ref) => (
                      <div key={ref.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700">রেফারেন্স বিবরণ</span>
                          <button
                            type="button"
                            onClick={() =>
                              setCvData({ ...cvData, references: cvData.references.filter((r) => r.id !== ref.id) })
                            }
                            className="text-rose-600 font-semibold cursor-pointer"
                          >
                            মুছুন
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={ref.name}
                            onChange={(e) =>
                              setCvData({
                                ...cvData,
                                references: cvData.references.map((r) => (r.id === ref.id ? { ...r, name: e.target.value } : r)),
                              })
                            }
                            placeholder="নাম"
                            className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                          />
                          <input
                            type="text"
                            value={ref.jobTitle}
                            onChange={(e) =>
                              setCvData({
                                ...cvData,
                                references: cvData.references.map((r) => (r.id === ref.id ? { ...r, jobTitle: e.target.value } : r)),
                              })
                            }
                            placeholder="পদবী"
                            className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                          />
                          <input
                            type="text"
                            value={ref.company}
                            onChange={(e) =>
                              setCvData({
                                ...cvData,
                                references: cvData.references.map((r) => (r.id === ref.id ? { ...r, company: e.target.value } : r)),
                              })
                            }
                            placeholder="প্রতিষ্ঠান"
                            className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                          />
                          <input
                            type="email"
                            value={ref.email}
                            onChange={(e) =>
                              setCvData({
                                ...cvData,
                                references: cvData.references.map((r) => (r.id === ref.id ? { ...r, email: e.target.value } : r)),
                              })
                            }
                            placeholder="ইমেইল"
                            className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                          />
                          <input
                            type="text"
                            value={ref.phone}
                            onChange={(e) =>
                              setCvData({
                                ...cvData,
                                references: cvData.references.map((r) => (r.id === ref.id ? { ...r, phone: e.target.value } : r)),
                              })
                            }
                            placeholder="ফোন"
                            className="px-3 py-2 rounded-lg bg-white border border-slate-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Primary Generate & Preview CTA */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                <div className="font-bold text-slate-900">সব তথ্য পূরণ হলে চূড়ান্ত প্রিভিউ দেখুন</div>
                <div>প্রিভিউ পেজ থেকেই PDF, প্রিন্ট ও DOCX ডাউনলোড করতে পারবেন।</div>
              </div>

              <button
                type="button"
                onClick={handleCompleteCV}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>CV তৈরি করুন ও প্রিভিউ দেখুন</span>
              </button>
            </div>
          </main>
        )}

        {/* ================= STEP 3: FINAL CV PREVIEW & EXPORTS (ONLY AFTER CREATION) ================= */}
        {activeTab === 'preview' && (
          <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
            {!canShowPreviewExports ? (
              <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-slate-900">এখনও কোনো CV সম্পন্ন হয়নি</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    PDF ডাউনলোড ও প্রিন্ট করতে প্রথমে একটি টেমপ্লেট বেছে নিয়ে আপনার ব্যক্তিগত, শিক্ষাগত ও পেশাদার তথ্য পূরণ করুন।
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('templates')}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                  >
                    ১. টেমপ্লেট দেখুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    ২. তথ্য লিখুন
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Final Action Toolbar — Visible ONLY after CV is created */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold print:hidden">
                  <div className="flex items-center flex-wrap gap-2.5">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 max-w-[230px]"
                      aria-label="টেমপ্লেট পরিবর্তন"
                    >
                      {CV_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>
                          #{t.number.toString().padStart(2, '0')} · {t.nameBn}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
                        className="p-1 rounded-lg hover:bg-white text-slate-700 cursor-pointer"
                        title="জুম আউট"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-slate-600 font-mono text-[11px]">{Math.round(zoomLevel * 100)}%</span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(1.3, Number((z + 0.1).toFixed(2))))}
                        className="p-1 rounded-lg hover:bg-white text-slate-700 cursor-pointer"
                        title="জুম ইন"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Relevant Post-Creation Actions Only: Edit CV, DOCX, Print, PDF Download */}
                  <div className="flex items-center flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('editor')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>এডিট করুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadDOCX}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>DOCX ডাউনলোড</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintCV}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>প্রিন্ট</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      disabled={isDownloadingPdf}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                    </button>
                  </div>
                </div>

                {/* Clean Final A4 Document Preview */}
                <div className="overflow-auto py-8 bg-slate-200/80 rounded-2xl border border-slate-300 flex justify-center p-4">
                  <CVRenderer data={cvData} template={currentTemplate} isWatermarked={false} scale={zoomLevel} />
                </div>
              </>
            )}
          </main>
        )}

        {/* ================= AI JOB CV HELPER WORKSPACE ================= */}
        {activeTab === 'job-helper' && (
          <main className="max-w-7xl mx-auto px-4 py-6">
            <JobCVHelperWorkspace
              initialView={helperInitialView}
              onApplyToMainEditor={(nextData, tmplId, targetTab) => {
                setCvData(nextData);
                setSelectedTemplateId(tmplId);
                if (targetTab === 'preview' && nextData.personal.fullName.trim()) {
                  setIsCvCompleted(true);
                  setActiveTab('preview');
                } else {
                  setActiveTab('editor');
                }
                onShowToast('CV তথ্য মূল এডিটরে লোড হয়েছে!', '✏️');
              }}
              onTriggerPdfDownload={(nextData, tmplId) => {
                const matchedTmpl = CV_TEMPLATES.find((t) => t.id === tmplId) || CV_TEMPLATES[0];
                cvDataRef.current = nextData;
                currentTemplateRef.current = matchedTmpl;
                setCvData(nextData);
                setSelectedTemplateId(tmplId);
                setIsCvCompleted(true);
                setTimeout(() => {
                  handleDownloadPDF();
                }, 180);
              }}
              onTriggerPrint={(nextData, tmplId) => {
                const matchedTmpl = CV_TEMPLATES.find((t) => t.id === tmplId) || CV_TEMPLATES[0];
                cvDataRef.current = nextData;
                currentTemplateRef.current = matchedTmpl;
                setCvData(nextData);
                setSelectedTemplateId(tmplId);
                setIsCvCompleted(true);
                setTimeout(() => {
                  handlePrintCV();
                }, 180);
              }}
              onShowToast={onShowToast}
            />
          </main>
        )}
      </div>

      {/* ================= DEDICATED PRINT CONTAINER (PRINT MEDIA ONLY) ================= */}
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

      {/* ================= OFF-SCREEN PDF EXPORT TARGET (EXACT 794px A4) ================= */}
      <div
        id="cv-export-canvas-target"
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-100 z-[-100] print:hidden"
        style={{ width: '794px', backgroundColor: currentTemplate.bgColor || '#ffffff' }}
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

      {/* Download Paywall (Preserved) */}
      <DownloadPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        documentTitle={`CV - ${cvData.personal.fullName || 'Resume'}`}
        documentTypeTag={`টেমপ্লেট: ${currentTemplate.nameBn}`}
        priceBDT={5}
        onConfirmDownload={() => {
          setIsCvUnlockedInSession(true);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
      />

      {/* Master CV Profile Modal (Preserved) */}
      <CVMasterProfileModal
        isOpen={isMasterProfileModalOpen}
        onClose={() => setIsMasterProfileModalOpen(false)}
        onSaveAndApply={(profileData) => {
          setCvData(profileData);
          setHasMasterProfile(true);
          setValidationError('');
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
