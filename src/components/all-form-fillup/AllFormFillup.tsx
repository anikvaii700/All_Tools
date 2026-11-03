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
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { FormCategory, FormTemplate, SavedDraft } from './types';
import { INITIAL_TEMPLATES } from './templatesData';
import { DynamicFormEditor } from './DynamicFormEditor';
import { DocumentRenderer } from './renderers/DocumentRenderer';
import { CustomFormBuilderModal } from './CustomFormBuilderModal';
import { SavedDraftsModal } from './SavedDraftsModal';
import { VoterTransferForm } from '../VoterTransferForm';
import { NidCorrectionForm2 } from './NidCorrectionForm2';
import { NidBiometricForm1 } from './NidBiometricForm1';

interface AllFormFillupProps {
  onBackToHub: () => void;
  onShowToast: (msg: string, icon?: string) => void;
  initialTemplateId?: string;
  onNavigateToTool?: (toolId: any) => void;
}

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
  const [activeCategory, setActiveCategory] = useState<FormCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile View Toggle: 'edit' | 'preview'
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  // Preview Zoom level
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);

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
        handleSelectTemplate(found);
        if (found.category) {
          setActiveCategory(found.category);
        }
        return;
      }
    }
    // Default to house-rent-receipt as showcase template
    const defaultTmpl = templates.find((t) => t.id === 'house-rent-receipt') || templates[0];
    if (defaultTmpl) {
      handleSelectTemplate(defaultTmpl);
    }
  }, [initialTemplateId, templates]);

  // Save drafts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mosafa_saved_form_drafts', JSON.stringify(drafts));
    } catch {}
  }, [drafts]);

  // Select a template & carry over shared profile fields
  const handleSelectTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);

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

    handleSelectTemplate(newTemplate);
  };

  // Native Browser Print
  const handlePrint = () => {
    window.print();
  };

  // High-Quality PDF Download
  const handleDownloadPdf = async () => {
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

  // High-Quality PNG Image Download
  const handleDownloadPng = async () => {
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

      {/* 2. TEMPLATE SELECTOR CAROUSEL & CATEGORY BAR */}
      <section className="bg-white border-b border-slate-200/90 px-4 py-3 print:hidden">
        <div className="max-w-7xl 2xl:max-w-[1560px] mx-auto space-y-3">
          {/* Categories Pill Navigation */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: `সকল ফরম (${templates.length})` },
                { id: 'election', label: '🇧🇩 নির্বাচন কমিশন ও এনআইডি' },
                { id: 'housing', label: '🏠 বাসা ও সম্পত্তি' },
                { id: 'business', label: '🏪 দোকান ও ব্যবসা' },
                { id: 'education', label: '🎓 শিক্ষা ও ভর্তি' },
                { id: 'custom', label: '✨ কাস্টম ফরম' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as FormCategory)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap active:scale-95 ${
                    activeCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ফরম খুঁজুন..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Quick Horizontal Cards Selector */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {filteredTemplates.map((t) => {
              const isSelected = selectedTemplate?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTemplate(t)}
                  className={`px-3 py-2 rounded-2xl border text-left transition cursor-pointer shrink-0 min-w-[190px] max-w-[220px] active:scale-98 ${
                    isSelected
                      ? t.category === 'election'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-slate-500 truncate">
                      {t.categoryName}
                    </span>
                    {t.badge && (
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                        t.category === 'election'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {t.badge.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  <h4 className={`text-xs font-bold truncate ${
                    isSelected 
                      ? t.category === 'election' ? 'text-emerald-800' : 'text-rose-700'
                      : 'text-slate-800'
                  }`}>
                    {t.name}
                  </h4>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. MAIN WORKSPACE (TWO-PANEL DESKTOP / TABBED MOBILE) */}
      <main className="max-w-7xl 2xl:max-w-[1560px] mx-auto px-4 py-5 sm:py-7 flex-1 w-full space-y-4">
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
              <button
                type="button"
                onClick={() => {
                  const defaultTmpl = templates.find((t) => t.id === 'house-rent-receipt') || templates[0];
                  handleSelectTemplate(defaultTmpl);
                }}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>অন্যান্য ফরম দেখুন (বাসা ভাড়ার রসিদ, চুক্তিপত্র ইত্যাদি)</span>
              </button>
            </div>

            {/* Dedicated Official Form-2 Component */}
            <NidCorrectionForm2
              onBackToHub={() => {
                const defaultTmpl = templates.find((t) => t.id === 'house-rent-receipt') || templates[0];
                handleSelectTemplate(defaultTmpl);
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
              <button
                type="button"
                onClick={() => {
                  const defaultTmpl = templates.find((t) => t.id === 'house-rent-receipt') || templates[0];
                  handleSelectTemplate(defaultTmpl);
                }}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>অন্যান্য ফরম দেখুন (বাসা ভাড়ার রসিদ, চুক্তিপত্র ইত্যাদি)</span>
              </button>
            </div>

            {/* Embedded Full Voter Transfer Form */}
            <VoterTransferForm
              onBackToHub={() => {
                const defaultTmpl = templates.find((t) => t.id === 'house-rent-receipt') || templates[0];
                handleSelectTemplate(defaultTmpl);
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
              <button
                type="button"
                onClick={() => {
                  const defaultTmpl = templates.find((t) => t.id === 'house-rent-receipt') || templates[0];
                  handleSelectTemplate(defaultTmpl);
                }}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>অন্যান্য ফরম দেখুন (বাসা ভাড়ার রসিদ, চুক্তিপত্র ইত্যাদি)</span>
              </button>
            </div>

            {/* Dedicated Official Form-1 Biometric Component */}
            <NidBiometricForm1
              onBackToHub={() => {
                const defaultTmpl = templates.find((t) => t.id === 'house-rent-receipt') || templates[0];
                handleSelectTemplate(defaultTmpl);
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
              উপরের তালিকা থেকে যেকোনো ফরম সিলেক্ট করুন অথবা আপনার নিজস্ব ফরম তৈরি করুন।
            </p>
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
    </div>
  );
};
