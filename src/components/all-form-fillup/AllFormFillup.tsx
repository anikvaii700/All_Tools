import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  Plus,
  Printer,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  FolderOpen,
  ArrowLeft,
  ChevronLeft,
  Check,
  Sparkles,
  Home,
  ShieldCheck,
  Sliders,
  Image as ImageIcon,
  Save,
  Eye,
  Edit3,
  Bookmark,
  Grid,
  Store,
  GraduationCap,
  Landmark,
  Briefcase,
  Car,
  Handshake,
  ArrowRight,
  ChevronRight,
  Layers,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { FormCategory, FormTemplate, SavedDraft } from './types';
import { INITIAL_TEMPLATES } from './templatesData';
import { toBanglaDigits } from './numberUtils';
import { DynamicFormEditor } from './DynamicFormEditor';
import { DocumentRenderer } from './renderers/DocumentRenderer';
import { CustomFormBuilderModal } from './CustomFormBuilderModal';
import { SavedDraftsModal } from './SavedDraftsModal';
import { VoterTransferForm } from '../VoterTransferForm';
import { NidCorrectionForm2 } from './NidCorrectionForm2';
import { NidBiometricForm1 } from './NidBiometricForm1';
import { LandlordVoterCertificate } from './LandlordVoterCertificate';
import { PhotoSignCertificate } from './PhotoSignCertificate';
import { NidServerCopyApplication } from './NidServerCopyApplication';
import { DownloadPaywallModal } from '../DownloadPaywallModal';

interface AllFormFillupProps {
  onBackToHub: () => void;
  onShowToast: (msg: string, icon?: string) => void;
  initialTemplateId?: string;
  onNavigateToTool?: (toolId: any) => void;
}

export interface HubCategoryDef {
  id: FormCategory | 'custom';
  name: string;
  english: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  badgeClass: string;
  description: string;
  features: string[];
}

export const HUB_CATEGORIES: HubCategoryDef[] = [
  {
    id: 'election',
    name: 'নির্বাচন কমিশন ও এনআইডি',
    english: 'Election Commission & NID',
    badge: '৬টি অফিশিয়াল ফরম',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    description: 'এনআইডি সংশোধন ফরম-২, ভোটার স্থানান্তর ফরম-১৩, বায়োমেট্রিক ফরম-১, প্রত্যয়ন ও সার্ভার কপি',
    features: ['ফরম-২ ও ১৩', 'বায়োমেট্রিক ফরম-১', 'বাড়িওয়ালা প্রত্যয়ন'],
  },
  {
    id: 'housing',
    name: 'বাসা ও ফ্ল্যাট সম্পত্তি',
    english: 'House & Property',
    badge: '৫টি প্রমিত ফরম',
    icon: Home,
    iconBg: 'bg-blue-600 text-white shadow-md shadow-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-300',
    description: 'বাসা ভাড়ার রসিদ, বাড়ি ভাড়ার স্ট্যাম্প চুক্তিপত্র, বাসা ছাড়ার নোটিশ, ভাড়াটিয়া তথ্য ও মেস রসিদ',
    features: ['ভাড়ার রসিদ', 'চুক্তিপত্র', 'ছাড়ার নোটিশ'],
  },
  {
    id: 'business',
    name: 'দোকান ও ব্যবসা-বাণিজ্য',
    english: 'Shop & Commercial',
    badge: '৪টি বাণিজ্যিক ফরম',
    icon: Store,
    iconBg: 'bg-amber-600 text-white shadow-md shadow-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300',
    description: 'দোকান ভাড়ার রসিদ, দোকান চুক্তিপত্র, ক্যাশ মেমো ও বিল ভাউচার, মানি রসিদ',
    features: ['দোকান চুক্তিপত্র', 'ক্যাশ মেমো', 'মানি রসিদ'],
  },
  {
    id: 'education',
    name: 'শিক্ষা, ভর্তি ও প্রত্যয়ন',
    english: 'Education & Admission',
    badge: '৩টি একাডেমিক ফরম',
    icon: GraduationCap,
    iconBg: 'bg-violet-600 text-white shadow-md shadow-violet-200',
    badgeClass: 'bg-violet-100 text-violet-800 border border-violet-300',
    description: 'স্কুল ও কলেজ ভর্তি ফরম, কোচিং সেন্টার ভর্তি ফরম, চারিত্রিক প্রত্যয়নপত্র',
    features: ['স্কুল ভর্তি', 'কোচিং ভর্তি', 'চারিত্রিক সনদ'],
  },
  {
    id: 'certificate',
    name: 'পৌরসভা ও ইউপি প্রত্যয়নপত্র',
    english: 'Municipality & Union Parishad',
    badge: '২টি সরকারি সনদ',
    icon: Landmark,
    iconBg: 'bg-teal-600 text-white shadow-md shadow-teal-200',
    badgeClass: 'bg-teal-100 text-teal-800 border border-teal-300',
    description: 'নাগরিকত্ব ও জাতীয়তা সনদপত্র, অবিবাহিত সনদপত্র, ইউপি / পৌরসভা প্রত্যয়ন',
    features: ['নাগরিকত্ব সনদ', 'অবিবাহিত সনদ', 'চেয়ারম্যান সিল'],
  },
  {
    id: 'job',
    name: 'চাকরি ও অঙ্গীকারনামা',
    english: 'Job & Undertaking',
    badge: '১টি আইনি অঙ্গীকার',
    icon: Briefcase,
    iconBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-200',
    badgeClass: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    description: 'চাকুরিতে যোগদানের অঙ্গীকারনামা ও সম্মতিপত্র, দায়দায়িত্ব ও গোপনীয়তা অঙ্গীকার',
    features: ['যোগদান অঙ্গীকার', 'আইনি বয়ান', 'স্বাক্ষর ও সিল'],
  },
  {
    id: 'vehicle',
    name: 'যানবাহন ও পরিবহন চুক্তি',
    english: 'Vehicle & Transport',
    badge: '১টি আইনি চুক্তি',
    icon: Car,
    iconBg: 'bg-rose-600 text-white shadow-md shadow-rose-200',
    badgeClass: 'bg-rose-100 text-rose-800 border border-rose-300',
    description: 'ব্যবহৃত মোটরসাইকেল ও গাড়ি বিক্রয় চুক্তিপত্র, গাড়ির মালিকানা ও দায় হস্তান্তর',
    features: ['মোটরসাইকেল বিক্রয়', 'গাড়ির চুক্তিপত্র', 'সাক্ষীদের ছক'],
  },
  {
    id: 'lending',
    name: 'টাকা লেনদেন ও ঋণ স্বীকার',
    english: 'Money Lending & Debt',
    badge: '১টি দ্বিপাক্ষিক চুক্তি',
    icon: Handshake,
    iconBg: 'bg-orange-600 text-white shadow-md shadow-orange-200',
    badgeClass: 'bg-orange-100 text-orange-800 border border-orange-300',
    description: 'টাকা ধার বা কর্জ গ্রহণ ও নির্দিষ্ট মেয়াদে ফেরত প্রদানের আইনি চুক্তিপত্র, ঋণ স্বীকার',
    features: ['টাকা ধার চুক্তি', 'চেক জামানত', 'পরিশোধের মেয়াদ'],
  },
  {
    id: 'custom',
    name: 'কাস্টম ফরম মেকার',
    english: 'Custom Form Creator',
    badge: 'নিজস্ব ফরম তৈরি',
    icon: Sparkles,
    iconBg: 'bg-slate-900 text-amber-300 shadow-md shadow-slate-300',
    badgeClass: 'bg-slate-200 text-slate-800 border border-slate-300',
    description: 'নিজের প্রয়োজন অনুযায়ী যেকোনো নতুন ফরম, রসিদ, আবেদনপত্র বা চুক্তিপত্র বানিয়ে নিন',
    features: ['নতুন ফিল্ড যোগ', 'কাস্টম ড্রাফট', 'তাৎক্ষণিক A4 প্রিন্ট'],
  },
];

export const AllFormFillup: React.FC<AllFormFillupProps> = ({
  onBackToHub,
  onShowToast,
  initialTemplateId,
  onNavigateToTool,
}) => {
  // State: Templates list (Initial + User Custom)
  const [templates, setTemplates] = useState<FormTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('mosafa_custom_form_templates');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return [...INITIAL_TEMPLATES, ...parsed];
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_TEMPLATES;
  });

  // State: Active Template & Form Data
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState<FormCategory>('election');
  const [searchQuery, setSearchQuery] = useState('');

  // Hub Mode: 'grid' (3x3 category grid) | 'category_list' (large cards of forms for category) | 'editor' (form editor workspace)
  const [hubMode, setHubMode] = useState<'grid' | 'category_list' | 'editor'>('grid');

  // Mobile View Toggle: 'edit' | 'preview'
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  // Preview Zoom level
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

  // 2 BDT & Mandatory Auth Download Paywall
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isFormUnlockedInSession, setIsFormUnlockedInSession] = useState(false);

  const executeWithPaywall = (action: () => void) => {
    if (isFormUnlockedInSession) {
      action();
      return;
    }
    setPendingAction(() => action);
    setIsPaywallOpen(true);
  };

  // Saved Drafts
  const [drafts, setDrafts] = useState<SavedDraft[]>(() => {
    try {
      const saved = localStorage.getItem('mosafa_saved_form_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Export Loading States
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const previewDocRef = useRef<HTMLDivElement>(null);

  // On mount: check if URL or props specified a template, e.g. voter-form-13 or house-rent-receipt
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tmplId = initialTemplateId || params.get('template');
    if (tmplId) {
      const found = templates.find((t) => t.id === tmplId);
      if (found) {
        handleSelectTemplate(found, true);
        if (found.category) {
          setActiveCategory(found.category);
        }
        return;
      }
    }
    // Default to house-rent-receipt in background, but show 3x3 category grid initially
    const defaultTmpl = templates.find((t) => t.id === 'house-rent-receipt') || templates[0];
    if (defaultTmpl) {
      handleSelectTemplate(defaultTmpl, false);
    }
    setHubMode('grid');
  }, [initialTemplateId, templates]);

  // Save drafts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_saved_form_drafts', JSON.stringify(drafts));
    } catch {}
  }, [drafts]);

  // Select a template & carry over shared profile fields
  const handleSelectTemplate = (template: FormTemplate, openEditor: boolean = true) => {
    setSelectedTemplate(template);
    if (template.category) {
      setActiveCategory(template.category);
    }
    if (openEditor) {
      setHubMode('editor');
    }

    // Retrieve shared memory profile
    let sharedProfile: Record<string, any> = {};
    try {
      const mem = localStorage.getItem('mosafa_form_shared_profile');
      if (mem) sharedProfile = JSON.parse(mem);
    } catch {}

    // Initialize form data with sampleData + shared memory
    const initialData: Record<string, any> = {
      ...template.sampleData,
      ...sharedProfile,
    };

    setFormData(initialData);
    setMobileTab('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Field change handler & auto sync to shared profile
  const handleChangeField = (name: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Update shared profile for reusable keys (Name, Mobile, Address, NID)
      const commonKeys = ['ownerName', 'ownerMobile', 'tenantName', 'tenantMobile', 'applicantName', 'applicantContact', 'customerName', 'customerMobile', 'nidNumber', 'flatNumber'];
      if (commonKeys.includes(name) && value) {
        try {
          const mem = localStorage.getItem('mosafa_form_shared_profile');
          const profile = mem ? JSON.parse(mem) : {};
          profile[name] = value;
          localStorage.setItem('mosafa_form_shared_profile', JSON.stringify(profile));
        } catch {}
      }

      return next;
    });
  };

  // Reset current form to defaults
  const handleResetForm = () => {
    if (!selectedTemplate) return;
    if (window.confirm('আপনি কি বর্তমান ফরমের সকল তথ্য রিসেট করতে চান?')) {
      const emptyData: Record<string, any> = {};
      selectedTemplate.fields.forEach((f) => {
        emptyData[f.name] = f.type === 'date' ? new Date().toISOString().split('T')[0] : '';
      });
      setFormData(emptyData);
      onShowToast('ফরমটি রিসেট করা হয়েছে 🔄', '✨');
    }
  };

  // Fill sample data
  const handleLoadSample = () => {
    if (!selectedTemplate) return;
    setFormData({ ...selectedTemplate.sampleData });
    onShowToast('নমুনা তথ্য লোড করা হয়েছে! 🧪', '✨');
  };

  // Save current form as draft
  const handleSaveDraft = () => {
    if (!selectedTemplate) return;

    const draftTitle =
      formData.receiptNumber ||
      formData.tenantName ||
      formData.applicantName ||
      formData.customerName ||
      formData.studentNameBn ||
      'অসমাপ্ত ড্রাফট';

    const newDraft: SavedDraft = {
      id: `draft-${Date.now()}`,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      category: selectedTemplate.category,
      categoryName: selectedTemplate.categoryName,
      data: formData,
      title: `${selectedTemplate.name} - ${draftTitle}`,
      updatedAt: new Date().toISOString(),
    };

    setDrafts((prev) => [newDraft, ...prev.filter((d) => d.id !== newDraft.id)]);
    onShowToast(`"${newDraft.title}" ড্রাফট হিসেবে সংরক্ষিত হয়েছে! 💾`, '✅');
  };

  // Load a saved draft
  const handleLoadDraft = (draft: SavedDraft) => {
    const tmpl = templates.find((t) => t.id === draft.templateId);
    if (tmpl) {
      setSelectedTemplate(tmpl);
      setFormData(draft.data);
      setMobileTab('edit');
      onShowToast(`"${draft.title}" ড্রাফট লোড করা হয়েছে! 📂`, '✅');
    }
  };

  // Delete draft
  const handleDeleteDraft = (draftId: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    onShowToast('ড্রাফটটি মুছে ফেলা হয়েছে। 🗑️', '✅');
  };

  // Clear all drafts
  const handleClearAllData = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনার ডিভাইসে সংরক্ষিত সকল ড্রাফট মুছে ফেলতে চান?')) {
      setDrafts([]);
      localStorage.removeItem('mosafa_saved_form_drafts');
      localStorage.removeItem('mosafa_form_shared_profile');
      onShowToast('সকল লোকাল ড্রাফট ডাটা মুছে ফেলা হয়েছে। 🧹', '✅');
      setIsDraftsModalOpen(false);
    }
  };

  // Save new custom template from builder
  const handleSaveCustomTemplate = (newTemplate: FormTemplate) => {
    const updated = [...templates, newTemplate];
    setTemplates(updated);

    try {
      const customOnly = updated.filter((t) => t.isCustom);
      localStorage.setItem('mosafa_custom_form_templates', JSON.stringify(customOnly));
    } catch {}

    handleSelectTemplate(newTemplate, true);
    setHubMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Native Browser Print
  const performPrint = () => {
    window.print();
  };
  const handlePrint = () => {
    executeWithPaywall(performPrint);
  };

  // High-Quality PDF Download
  const performDownloadPdf = async () => {
    if (!previewDocRef.current || !selectedTemplate) return;

    const element = previewDocRef.current;
    const originalTransform = element.style.transform;

    try {
      setIsExportingPdf(true);
      onShowToast('PDF তৈরি হচ্ছে... 📄', '⚡');

      // Reset transform so html2canvas captures full-resolution natural dimensions
      element.style.transform = 'none';

      const canvas = await html2canvas(element, {
        scale: 2, // 2x high resolution for sharp crisp Bengali typography
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: selectedTemplate.orientation === 'landscape' ? 'l' : 'p',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm for A4
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm for A4
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeightMm <= pdfHeight) {
        // Fit centered vertically if smaller than A4
        const yOffset = Math.max(0, (pdfHeight - imgHeightMm) / 4);
        pdf.addImage(imgData, 'JPEG', 0, yOffset, pdfWidth, imgHeightMm, undefined, 'FAST');
      } else {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeightMm, undefined, 'FAST');
      }

      const fileName = `${selectedTemplate.id}_${Date.now()}.pdf`;
      pdf.save(fileName);
      onShowToast(`সফলভাবে ${selectedTemplate.name} PDF সেভ হয়েছে! 📄`, '✅');
    } catch (err) {
      console.error('PDF export error:', err);
      onShowToast('PDF ডাউনলোড করতে সমস্যা হয়েছে। প্রিন্ট অপশনটি ব্যবহার করুন।', '⚠️');
    } finally {
      element.style.transform = originalTransform;
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    executeWithPaywall(performDownloadPdf);
  };

  // High-Quality PNG Image Download
  const performDownloadPng = async () => {
    if (!previewDocRef.current || !selectedTemplate) return;

    const element = previewDocRef.current;
    const originalTransform = element.style.transform;

    try {
      setIsExportingPng(true);
      onShowToast('ছবি তৈরি হচ্ছে... 🖼️', '⚡');

      element.style.transform = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${selectedTemplate.id}_${Date.now()}.png`;
      link.href = imgData;
      link.click();

      onShowToast(`সফলভাবে PNG ছবি ডাউনলোড হয়েছে! 🖼️`, '✅');
    } catch (err) {
      console.error('PNG export error:', err);
      onShowToast('ছবি তৈরিতে সমস্যা হয়েছে।', '⚠️');
    } finally {
      element.style.transform = originalTransform;
      setIsExportingPng(false);
    }
  };

  const handleDownloadPng = () => {
    executeWithPaywall(performDownloadPng);
  };

  // Filtered Templates
  const filteredTemplates = templates.filter((t) => {
    const matchesCat = activeCategory === 'all' || t.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.categoryName.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. TOP HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
        <div className="max-w-7xl 2xl:max-w-[1560px] mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onBackToHub}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="সকল টুলস পোর্টালে ফিরে যান"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-rose-200/60 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    MoSaFa All Form Fillup
                  </h1>
                  <span className="hidden sm:inline-block bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    অল ফরম মেকার
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-rose-600 font-semibold truncate">
                  তথ্য দিন, ফরম তৈরি করুন—সহজে, দ্রুত, নির্ভুলভাবে।
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setHubMode('grid');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                hubMode === 'grid'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title="হোম পেইজে যান"
            >
              <Home className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">হোম পেইজ</span>
            </button>

            {selectedTemplate && (
              <button
                type="button"
                onClick={() => {
                  setHubMode('editor');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                  hubMode === 'editor'
                    ? 'bg-rose-600 text-white shadow-rose-200'
                    : 'bg-white hover:bg-slate-100 text-rose-700 border border-rose-200'
                }`}
                title="বর্তমান ফরমের এডিটর ও প্রিভিউ দেখুন"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">বর্তমান ফরম</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsBuilderOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="নিজের মতো নতুন ফরম তৈরি করুন"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">নিজের ফরম তৈরি</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDraftsModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="সংরক্ষিত ড্রাফট দেখুন"
            >
              <FolderOpen className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">ড্রাফট</span>
              {drafts.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {drafts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="max-w-7xl 2xl:max-w-[1560px] mx-auto px-4 py-5 sm:py-7 flex-1 w-full space-y-6">
        {/* ========================================================= */}
        {/* VIEW 1: 3x3 CATEGORIES GRID HUB                          */}
        {/* ========================================================= */}
        {hubMode === 'grid' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Hero Hub Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      ৩×৩ ক্যাটাগরি গ্রিড পোর্টাল
                    </span>
                    <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      মোট {toBanglaDigits(templates.length)}টি ফরম
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                    সকল ফরমের ৩×৩ ক্যাটাগরি হাব
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    নিচের ৯টি ক্যাটাগরির যেকোনোটিতে ক্লিক করুন—সেই বাটনের ভিতরে থাকা সকল ফরম বড় বড় কার্ডে দেখতে পাবেন এবং যার যেটা প্রয়োজন সেটাতে ক্লিক করে সরাসরি ফরম ওপেন করতে পারবেন।
                  </p>
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-80 shrink-0">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="যেকোনো ফরম খুঁজুন (যেমন: এনআইডি, বাসা ভাড়া)..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white text-xs sm:text-sm text-white focus:text-slate-900 placeholder-slate-400 border border-white/15 focus:border-white focus:outline-none transition shadow-inner"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-[10px] text-slate-300 hover:text-white absolute right-3 top-3 font-bold bg-white/10 px-1.5 py-0.5 rounded"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Resume Current Form Banner */}
              {selectedTemplate && (
                <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <span className="text-emerald-400 font-bold">📄 ওপেন থাকা ফরম:</span>
                    <span className="font-extrabold text-white">{selectedTemplate.name}</span>
                    <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full text-slate-300">
                      {selectedTemplate.categoryName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHubMode('editor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                  >
                    <span>সরাসরি ফরম এডিটে যান</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Instant Search Results If Searching */}
            {searchQuery.trim() ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-600" />
                    <span>"{searchQuery}" এর ফলাফল ({toBanglaDigits(filteredTemplates.length)}টি ফরম)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    সকল ক্যাটাগরি দেখুন
                  </button>
                </div>

                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                    <p className="text-sm text-slate-500 font-medium">কোনো ফরম পাওয়া যায়নি।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {filteredTemplates.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          handleSelectTemplate(t, true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-5 sm:p-6 bg-white rounded-3xl border-2 border-slate-200/90 hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                              {t.categoryName}
                            </span>
                            {t.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {t.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {t.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-1 mb-2 line-clamp-2">
                            {t.tagline || t.shortDescription}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400 font-semibold">
                            A4 প্রিন্ট ও অফিশিয়াল PDF
                          </span>
                          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold group-hover:bg-indigo-600 transition flex items-center gap-1">
                            <span>ওপেন করুন</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* THE 3x3 CATEGORIES GRID (9 BUTTONS) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {HUB_CATEGORIES.map((cat, index) => {
                  const IconComp = cat.icon;
                  const count =
                    cat.id === 'custom'
                      ? templates.filter((t) => t.isCustom).length || 'নতুন'
                      : templates.filter((t) => t.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (cat.id === 'custom') {
                          setIsBuilderOpen(true);
                          return;
                        }
                        setActiveCategory(cat.id as FormCategory);
                        setHubMode('category_list');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-5 sm:p-6 bg-white hover:bg-slate-50/80 rounded-3xl border-2 border-slate-200/90 hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group text-left flex flex-col justify-between relative overflow-hidden active:scale-98"
                    >
                      {/* Top Header in Card */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.iconBg} group-hover:scale-105 transition-transform`}>
                            <IconComp className="w-6 h-6" />
                          </div>
                          <span className={`text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full ${cat.badgeClass}`}>
                            {cat.id === 'custom' ? '✨ নিজস্ব তৈরি' : `${toBanglaDigits(count)}টি ফরম`}
                          </span>
                        </div>

                        {/* Title & English */}
                        <div className="mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              #{toBanglaDigits(index + 1)}
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {cat.name}
                            </h3>
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold block">
                            {cat.english}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">
                          {cat.description}
                        </p>

                        {/* Features chips */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {cat.features.map((feat, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700"
                            >
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Call-to-action Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                        <span>
                          {cat.id === 'custom' ? 'নতুন ফরম তৈরি করুন' : 'ফরম তালিকা দেখুন'}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CATEGORY FORMS LIST (LARGE CARDS)                */}
        {/* ========================================================= */}
        {hubMode === 'category_list' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Category Banner with Back to 3x3 Grid */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setHubMode('grid');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition flex items-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200 shadow-2xs"
                  title="পিছনে যান"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-600" />
                  <span>← পিছনে যান</span>
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      {HUB_CATEGORIES.find((c) => c.id === activeCategory)?.name || 'ক্যাটাগরি ফরম তালিকা'}
                    </h2>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {toBanglaDigits(templates.filter((t) => activeCategory === 'all' || t.category === activeCategory).length)}টি ফরম প্রস্তুত
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {HUB_CATEGORIES.find((c) => c.id === activeCategory)?.description}
                  </p>
                </div>
              </div>

              {/* Filter / Search within category */}
              <div className="w-full md:w-72">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="এই ক্যাটাগরিতে খুঁজুন..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* List of Forms in LARGE CARDS (বড় বড় করে লিস্ট) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {templates
                .filter((t) => {
                  const matchCat = activeCategory === 'all' || t.category === activeCategory;
                  const q = searchQuery.toLowerCase().trim();
                  const matchQ =
                    !q ||
                    t.name.toLowerCase().includes(q) ||
                    t.shortDescription.toLowerCase().includes(q) ||
                    (t.tagline && t.tagline.toLowerCase().includes(q));
                  return matchCat && matchQ;
                })
                .map((tmpl) => {
                  const isCurrent = selectedTemplate?.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        handleSelectTemplate(tmpl, true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`p-6 sm:p-7 rounded-3xl border-2 transition-all cursor-pointer group flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-gradient-to-br from-indigo-50/60 to-white border-indigo-500 shadow-lg ring-2 ring-indigo-500/20'
                          : 'bg-white hover:bg-slate-50/60 border-slate-200/90 hover:border-indigo-400 hover:shadow-xl'
                      }`}
                    >
                      <div>
                        {/* Badges row */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {tmpl.categoryName}
                            </span>
                            {tmpl.badge && (
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                tmpl.badgeColor || 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}>
                                {tmpl.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                            A4 পোর্ট্রেট
                          </span>
                        </div>

                        {/* Big Form Name */}
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-2">
                          {tmpl.name}
                        </h3>

                        {/* Tagline */}
                        {tmpl.tagline && (
                          <p className="text-xs sm:text-sm font-bold text-indigo-700 mb-2 leading-snug">
                            {tmpl.tagline}
                          </p>
                        )}

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                          {tmpl.shortDescription}
                        </p>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ শতভাগ এডিটেবল
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            ✓ তাৎক্ষণিক লাইভ প্রিভিউ
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            ✓ প্রমিত A4 প্রিন্ট ও PDF
                          </span>
                        </div>
                      </div>

                      {/* Large Button to Open */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-500">
                          {isCurrent ? '✓ বর্তমানে সক্রিয় আছে' : 'ক্লিক করে ওপেন করুন'}
                        </span>
                        <button
                          type="button"
                          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 group-hover:from-rose-600 group-hover:to-indigo-600 shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          <span>এই ফরমটি ওপেন ও ফিলাপ করুন</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: FORM EDITOR & LIVE PREVIEW WORKSPACE              */}
        {/* ========================================================= */}
        {hubMode === 'editor' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Top Workspace Navigation Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                  title="পিছনে যান"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-400" />
                  <span>← পিছনে যান</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200"
                  title="এই ক্যাটাগরির সকল ফরম দেখুন"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{selectedTemplate?.categoryName || 'ক্যাটাগরি'}-এর তালিকা</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold hidden md:inline">
                  সক্রিয় ফরম:
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                  {selectedTemplate?.name}
                </span>
                {selectedTemplate?.badge && (
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    selectedTemplate.badgeColor || 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {selectedTemplate.badge}
                  </span>
                )}
              </div>
            </div>

            {selectedTemplate?.id === 'voter-form-2' ? (
          <div className="space-y-4">
            {/* Top Return Banner for Form-2 */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                  🇧🇩
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black">
                      জাতীয় পরিচয়পত্র বা তথ্য-উপাত্ত সংশোধনের আবেদন (ফরম-২)
                    </h3>
                    <span className="text-[10px] bg-emerald-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                      সরকারি অফিশিয়াল ফরম
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 font-medium">
                    MoSaFa All Form Fillup-এর অন্তর্ভুক্ত নির্বাচন কমিশন নির্ধারিত সম্পূর্ণ লিগ্যাল ফরম-২
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/25 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-300" />
                  <span>← পিছনে যান</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('election');
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>এনআইডি ফরম তালিকা</span>
                </button>
              </div>
            </div>

            {/* Dedicated Official Form-2 Component */}
            <NidCorrectionForm2
              onBackToHub={() => {
                setHubMode('category_list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={onShowToast}
            />
          </div>
        ) : selectedTemplate?.id === 'voter-form-13' ? (
          <div className="space-y-4">
            {/* Top Return Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                  🇧🇩
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black">
                      ভোটার এলাকা স্থানান্তর আবেদন (ফরম-১৩)
                    </h3>
                    <span className="text-[10px] bg-emerald-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                      সরকারি অফিশিয়াল ফরম
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 font-medium">
                    MoSaFa All Form Fillup-এর অন্তর্ভুক্ত নির্বাচন কমিশন নির্ধারিত সম্পূর্ণ ২-পৃষ্ঠার লিগ্যাল ফরম
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/25 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-300" />
                  <span>← পিছনে যান</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('election');
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>এনআইডি ফরম তালিকা</span>
                </button>
              </div>
            </div>

            {/* Embedded Full Voter Transfer Form */}
            <VoterTransferForm
              onBackToHub={() => {
                setHubMode('grid');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={onShowToast}
            />
          </div>
        ) : selectedTemplate?.id === 'voter-form-1' ? (
          <div className="space-y-4">
            {/* Top Return Banner */}
            <div className="bg-gradient-to-r from-amber-700 via-yellow-700 to-amber-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                  🇧🇩
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black">
                      বায়োমেট্রিক আপডেট আবেদন (ফরম-১)
                    </h3>
                    <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                      সরকারি অফিশিয়াল ফরম
                    </span>
                  </div>
                  <p className="text-xs text-amber-100 font-medium">
                    MoSaFa All Form Fillup-এর অন্তর্ভুক্ত নির্বাচন কমিশন নির্ধারিত সম্পূর্ণ লিগ্যাল ফরম-১ (আঙ্গুলের ছাপ ও আইরিশ আপডেট)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/25 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-amber-300" />
                  <span>← পিছনে যান</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('election');
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>এনআইডি ফরম তালিকা</span>
                </button>
              </div>
            </div>

            {/* Dedicated Official Form-1 Biometric Component */}
            <NidBiometricForm1
              onBackToHub={() => {
                setHubMode('category_list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={onShowToast}
            />
          </div>
        ) : selectedTemplate?.id === 'landlord-voter-certificate' ? (
          <div className="space-y-4">
            {/* Top Return Banner */}
            <div className="bg-gradient-to-r from-cyan-800 via-teal-800 to-slate-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                  🏠
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black">
                      বাড়ির মালিকের প্রত্যয়নপত্র (নতুন ভোটার নিবন্ধনের বর্তমান ঠিকানা)
                    </h3>
                    <span className="text-[10px] bg-cyan-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                      সম্পূর্ণ এডিটেবল
                    </span>
                  </div>
                  <p className="text-xs text-teal-100 font-medium">
                    MoSaFa All Form Fillup-এর অন্তর্ভুক্ত নতুন ভোটার নিবন্ধনে বাড়িওয়ালার প্রমিত প্রত্যয়নপত্র
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/25 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-300" />
                  <span>← পিছনে যান</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('election');
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>এনআইডি ফরম তালিকা</span>
                </button>
              </div>
            </div>

            {/* Dedicated Landlord Voter Certificate Component */}
            <LandlordVoterCertificate
              onBackToHub={() => {
                setHubMode('category_list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={onShowToast}
            />
          </div>
        ) : selectedTemplate?.id === 'photo-sign-certificate' ? (
          <div className="space-y-4">
            {/* Top Return Banner */}
            <div className="bg-gradient-to-r from-rose-800 via-pink-800 to-indigo-950 text-white p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                  ✍️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black">
                      ছবি ও স্বাক্ষর পরিবর্তনের প্রত্যয়নপত্র (ইউপি / পৌরসভা)
                    </h3>
                    <span className="text-[10px] bg-rose-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                      সম্পূর্ণ এডিটেবল
                    </span>
                  </div>
                  <p className="text-xs text-rose-100 font-medium">
                    ০৫ নং আন্দিউড়া ইউনিয়ন পরিষদ সহ সকল তথ্য এডিটেবল, গণপ্রজাতন্ত্রী লোগো, নমুনা ছক, লাইভ A4 প্রিভিউ ও PDF ডাউনলোড
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/25 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-300" />
                  <span>← পিছনে যান</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('election');
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>এনআইডি ফরম তালিকা</span>
                </button>
              </div>
            </div>

            {/* Dedicated Photo & Signature Certificate Component */}
            <PhotoSignCertificate
              onBackToHub={() => {
                setHubMode('category_list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={onShowToast}
            />
          </div>
        ) : selectedTemplate?.id === 'nid-server-copy-application' ? (
          <div className="space-y-4">
            {/* Top Return Banner */}
            <div className="bg-gradient-to-r from-purple-800 via-indigo-850 to-slate-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                  💻
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black">
                      জাতীয় পরিচয়পত্রের সার্ভার কপি সরবরাহের জন্য আবেদন
                    </h3>
                    <span className="text-[10px] bg-purple-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                      সম্পূর্ণ এডিটেবল
                    </span>
                  </div>
                  <p className="text-xs text-purple-100 font-medium">
                    উপজেলা নির্বাচন অফিসারের নিকট দরখাস্ত • লাইভ A4 প্রিভিউ • তাৎক্ষণিক প্রিন্ট ও PDF ডাউনলোড
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/25 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-purple-300" />
                  <span>← পিছনে যান</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('election');
                    setHubMode('category_list');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>এনআইডি ফরম তালিকা</span>
                </button>
              </div>
            </div>

            {/* Dedicated Server Copy Application Component */}
            <NidServerCopyApplication
              onBackToHub={() => {
                setHubMode('category_list');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={onShowToast}
            />
          </div>
        ) : selectedTemplate ? (
          <div>
            {/* Mobile Tab Toggle */}
            <div className="flex sm:hidden mb-4 p-1 bg-slate-200/80 rounded-2xl print:hidden">
              <button
                type="button"
                onClick={() => setMobileTab('edit')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  mobileTab === 'edit'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>তথ্য পূরণ ✍️</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  mobileTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>প্রিভিউ দেখুন 👁️</span>
              </button>
            </div>

            {/* Split View Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ================= LEFT COLUMN: FORM INPUTS ================= */}
              <div
                className={`lg:col-span-5 space-y-4 print:hidden ${
                  mobileTab === 'preview' ? 'hidden lg:block' : 'block'
                }`}
              >
                <DynamicFormEditor
                  template={selectedTemplate}
                  formData={formData}
                  onChangeField={handleChangeField}
                  onReset={handleResetForm}
                  onLoadSample={handleLoadSample}
                  onNavigateToTool={onNavigateToTool}
                />

                {/* Bottom Disclaimer Box */}
                <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {selectedTemplate.disclaimer ||
                      'এই খসড়াটি আপনার দেওয়া তথ্যের ভিত্তিতে স্বয়ংক্রিয়ভাবে সাজানো হয়েছে। প্রয়োজনে প্রিন্ট করে প্রয়োজনীয় সিল ও দস্তখত সম্পাদন করুন।'}
                  </p>
                </div>
              </div>

              {/* ================= RIGHT COLUMN: LIVE A4 PREVIEW & CONTROLS ================= */}
              <div
                className={`lg:col-span-7 space-y-4 ${
                  mobileTab === 'edit' ? 'hidden lg:block' : 'block'
                }`}
              >
                {/* Preview Toolbar */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5 print:hidden">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
                      className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
                      title="জুম আউট (-)"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="px-2 text-slate-700 min-w-[42px] text-center font-mono">
                      {zoomLevel}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
                      className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
                      title="জুম ইন (+)"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(100)}
                      className="px-2 py-0.5 hover:bg-white rounded text-[10px] text-slate-500 cursor-pointer"
                    >
                      রিসেট
                    </button>
                  </div>

                  {/* Actions: Save Draft, Print, PDF, PNG */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="ড্রাফট হিসেবে সংরক্ষণ করুন"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">ড্রাফট সেভ</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                      title="সরাসরি প্রিন্ট করুন (A4)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>প্রিন্ট</span>
                    </button>

                    <button
                      type="button"
                      disabled={isExportingPdf}
                      onClick={handleDownloadPdf}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-rose-200 disabled:opacity-50"
                      title="উচ্চ মানের A4 PDF ডাউনলোড করুন"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isExportingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isExportingPng}
                      onClick={handleDownloadPng}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                      title="PNG ছবি হিসেবে ডাউনলোড করুন"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                </div>

                {/* Printable Document Frame (Isolated Container) */}
                <div
                  id="all-form-fillup-printable"
                  className="bg-slate-200/70 p-3 sm:p-6 rounded-3xl border border-slate-300/80 overflow-x-auto flex justify-center shadow-inner"
                >
                  <div
                    ref={previewDocRef}
                    style={{
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="w-full max-w-[760px] form-fillup-printable-doc bg-white"
                  >
                    <DocumentRenderer
                      template={selectedTemplate}
                      data={formData}
                      showBorder={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
            <span className="text-5xl block">📑</span>
            <h3 className="text-lg font-bold text-slate-800">কোনো ফরম নির্বাচন করা হয়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              ৩×৩ গ্রিড হাব থেকে যেকোনো ফরম সিলেক্ট করুন অথবা আপনার নিজস্ব ফরম তৈরি করুন।
            </p>
            <button
              type="button"
              onClick={() => {
                setHubMode('grid');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              ৩×৩ গ্রিড হাবে যান
            </button>
          </div>
        )}
          </div>
        )}
      </main>

      {/* 4. MODALS */}
      {/* Custom Form Builder Modal */}
      <CustomFormBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSaveCustomTemplate={handleSaveCustomTemplate}
        onShowToast={onShowToast}
      />

      {/* Saved Drafts Modal */}
      <SavedDraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        drafts={drafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onClearAllData={handleClearAllData}
      />

      {/* 5 BDT & Mandatory Auth Download Paywall */}
      <DownloadPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        documentTitle={selectedTemplate ? selectedTemplate.name : 'অফিসিয়াল ফরম'}
        documentTypeTag={selectedTemplate ? `ক্যাটাগরি: ${selectedTemplate.category}` : 'MoSaFa অল ফরম ফিলআপ'}
        priceBDT={5}
        onConfirmDownload={() => {
          setIsFormUnlockedInSession(true);
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
      />
    </div>
  );
};
