import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Download,
  Printer,
  Copy,
  Save,
  FolderArchive,
  Layout,
  Settings,
  Share2,
  Check,
  RefreshCw,
  Eye,
  Edit3,
  HelpCircle,
  PenTool,
  Lock,
} from 'lucide-react';
import {
  ApplicationFormData,
  DocumentStyle,
  DocumentTypeInfo,
  SavedDocument,
  TemplateId,
} from './types';
import { DOCUMENT_TYPES, CATEGORIES } from './categoriesData';
import { generateApplicationContent } from './documentGenerator';
import { exportToDocx } from './docxExporter';
import { exportToPdf } from './pdfExporter';
import { ApplicationDashboard } from './ApplicationDashboard';
import { DocumentTypeSelector } from './DocumentTypeSelector';
import { ApplicationForm } from './ApplicationForm';
import { DocumentEditor } from './DocumentEditor';
import { DocumentPreview } from './DocumentPreview';
import { TemplateSelector } from './TemplateSelector';
import { SavedDocumentsModal } from './SavedDocumentsModal';
import { AIAssistModal } from './AIAssistModal';

interface ApplicationWriterProps {
  onBackToHub: () => void;
  onShowToast?: (msg: string, icon?: string) => void;
}

const STORAGE_KEY = 'mosafa_application_writer_saved_docs_v1';

export const ApplicationWriter: React.FC<ApplicationWriterProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  // Navigation active view: 'dashboard' | 'types' | 'form' | 'editor' | 'templates'
  const [activeView, setActiveView] = useState<'dashboard' | 'types' | 'form' | 'editor' | 'templates'>('dashboard');

  // Selected Type
  const [selectedType, setSelectedType] = useState<DocumentTypeInfo>(DOCUMENT_TYPES[0]);

  // Form Data
  const [formData, setFormData] = useState<ApplicationFormData>({
    applicantName: '',
    applicantDesignation: '',
    applicantAddress: '',
    applicantPhone: '',
    applicantEmail: '',
    date: new Date().toISOString().split('T')[0],
    recipientDesignation: '',
    recipientName: '',
    organizationName: '',
    organizationAddress: '',
    subject: '',
    startDate: '',
    endDate: '',
    reason: '',
    education: '',
    experience: '',
    skills: '',
    referenceNo: '',
    specificDetails: '',
    language: 'bn',
    tone: 'Formal',
  });

  // Current Working Document Content
  const [content, setContent] = useState<string>('');
  const [isAiEnhanced, setIsAiEnhanced] = useState<boolean>(false);

  // Undo / Redo history stack
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Template ID
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('traditional-bn');

  // Document Layout & Typography Style
  const [style, setStyle] = useState<DocumentStyle>({
    fontFamily: 'noto',
    fontSize: 15,
    lineSpacing: 1.5,
    alignment: 'left',
    margin: 'normal',
    bold: false,
    italic: false,
    underline: false,
    showPageNumber: true,
    showApplicantSign: true,
    showDeptHeadSign: false,
    showApprovalSign: false,
    showGuardianSign: false,
    showTeacherSign: false,
  });

  // Saved Documents
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Mobile View Toggle: 'editor' vs 'preview'
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Load Saved Documents on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedDocuments(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved applications from localStorage', e);
    }
  }, []);

  // Save to localStorage whenever savedDocuments updates
  const persistSavedDocuments = (docs: SavedDocument[]) => {
    setSavedDocuments(docs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  // Push new state into history stack for undo/redo
  const updateContentWithHistory = (newContent: string) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newContent);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setContent(newContent);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setContent(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setContent(next);
    }
  };

  // Form Field Updater
  const handleFieldChange = (key: keyof ApplicationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Generate Document
  const handleGenerateDocument = () => {
    const generated = generateApplicationContent(selectedType, formData, selectedTemplateId);
    updateContentWithHistory(generated);
    setIsAiEnhanced(false);
    setActiveView('editor');
    onShowToast?.('দরখাস্ত সফলভাবে প্রস্তুত হয়েছে!', '📄');
  };

  // Reset Form
  const handleResetForm = () => {
    setFormData({
      applicantName: '',
      applicantDesignation: '',
      applicantAddress: '',
      applicantPhone: '',
      applicantEmail: '',
      date: new Date().toISOString().split('T')[0],
      recipientDesignation: '',
      recipientName: '',
      organizationName: '',
      organizationAddress: '',
      subject: '',
      startDate: '',
      endDate: '',
      reason: '',
      education: '',
      experience: '',
      skills: '',
      referenceNo: '',
      specificDetails: '',
      language: formData.language,
      tone: 'Formal',
    });
    onShowToast?.('ফরম রিসেট করা হয়েছে', '🔄');
  };

  // Select Type handler
  const handleSelectType = (type: DocumentTypeInfo) => {
    setSelectedType(type);
    setFormData((prev) => ({
      ...prev,
      recipientDesignation:
        prev.language === 'bn'
          ? type.defaultRecipientDesignationBn
          : type.defaultRecipientDesignationEn,
      subject:
        prev.language === 'bn' ? type.defaultSubjectBn : type.defaultSubjectEn,
      reason:
        prev.language === 'bn'
          ? (type.defaultReasonBn || '')
          : (type.defaultReasonEn || ''),
      lostOrItemDetails:
        type.documentFormat === 'gd' && !prev.lostOrItemDetails
          ? (type.defaultReasonBn || '')
          : prev.lostOrItemDetails,
    }));

    // Auto set best matching template
    if (type.categoryId === 'education') {
      setSelectedTemplateId('school-college');
    } else if (type.categoryId === 'police' || type.documentFormat === 'police_complaint') {
      setSelectedTemplateId('complaint-letter');
    } else if (type.id === 'job-application-cover') {
      setSelectedTemplateId('job-application');
    } else if (type.categoryId === 'office') {
      setSelectedTemplateId('office-leave');
    } else {
      setSelectedTemplateId(formData.language === 'en' ? 'english-official' : 'traditional-bn');
    }

    setActiveView('form');
  };

  // Save Document
  const handleSaveCurrentDocument = () => {
    if (!content.trim()) {
      onShowToast?.('সংরক্ষণ করার মতো কোনো লেখা নেই', '⚠️');
      return;
    }

    const title =
      formData.subject.trim() ||
      selectedType.name ||
      `দরখাস্ত - ${new Date().toLocaleDateString('bn-BD')}`;

    const newDoc: SavedDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      typeId: selectedType.id,
      categoryId: selectedType.categoryId,
      language: formData.language,
      templateId: selectedTemplateId,
      formData,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAiEnhanced,
    };

    const updated = [newDoc, ...savedDocuments.filter((d) => d.title !== title)];
    persistSavedDocuments(updated);
    onShowToast?.('ডকুমেন্ট সফলভাবে সংরক্ষণ করা হয়েছে!', '💾');
  };

  // Open Document from Saved
  const handleOpenSavedDocument = (doc: SavedDocument) => {
    const foundType = DOCUMENT_TYPES.find((t) => t.id === doc.typeId) || DOCUMENT_TYPES[0];
    setSelectedType(foundType);
    setFormData(doc.formData || formData);
    setSelectedTemplateId(doc.templateId || 'traditional-bn');
    setContent(doc.content);
    setIsAiEnhanced(Boolean(doc.isAiEnhanced));
    updateContentWithHistory(doc.content);
    setActiveView('editor');
    onShowToast?.(`‘${doc.title}’ খোলা হয়েছে`, '📂');
  };

  // Duplicate Document
  const handleDuplicateDocument = (doc: SavedDocument) => {
    const duplicated: SavedDocument = {
      ...doc,
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${doc.title} (কপি)`,
      updatedAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...savedDocuments];
    persistSavedDocuments(updated);
    onShowToast?.('ডুপ্লিকেট কপি তৈরি করা হয়েছে', '📋');
  };

  // Rename Document
  const handleRenameDocument = (id: string, newTitle: string) => {
    const updated = savedDocuments.map((d) =>
      d.id === id ? { ...d, title: newTitle, updatedAt: new Date().toISOString() } : d
    );
    persistSavedDocuments(updated);
    onShowToast?.('নাম পরিবর্তন সম্পন্ন হয়েছে', '✏️');
  };

  // Delete Document
  const handleDeleteDocument = (id: string) => {
    const updated = savedDocuments.filter((d) => d.id !== id);
    persistSavedDocuments(updated);
    onShowToast?.('ডকুমেন্ট মুছে ফেলা হয়েছে', '🗑️');
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = JSON.stringify(savedDocuments, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoSaFa_Applications_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast?.('ব্যাকআপ ফাইল ডাউনলোড হয়েছে', '📥');
  };

  // Import JSON Backup with validation
  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.every((item) => item.id && item.content)) {
          persistSavedDocuments([...parsed, ...savedDocuments]);
          onShowToast?.(`${parsed.length}টি ডকুমেন্ট রিস্টোর করা হয়েছে!`, '✅');
        } else {
          onShowToast?.('ভুল বা অকার্যকর ব্যাকআপ ফাইল!', '❌');
        }
      } catch (err) {
        onShowToast?.('ফাইল পড়তে ত্রুটি হয়েছে', '❌');
      }
    };
    reader.readAsText(file);
  };

  // Clear All
  const handleClearAllSaved = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সকল সংরক্ষিত ডকুমেন্ট মুছে ফেলতে চান?')) {
      persistSavedDocuments([]);
      onShowToast?.('সকল সংরক্ষিত ডকুমেন্ট মুছে ফেলা হয়েছে', '🗑️');
    }
  };

  // Export Word (.docx)
  const handleExportDocx = async () => {
    if (!content.trim()) {
      onShowToast?.('ডাউনলোড করার মতো কোনো লেখা নেই', '⚠️');
      return;
    }
    const filename = `${formData.subject || selectedType.name || 'Application'}.docx`;
    try {
      await exportToDocx(formData.subject || selectedType.name, content, filename);
      onShowToast?.('Word (.docx) ডাউনলোড সম্পন্ন!', '📘');
    } catch (err) {
      onShowToast?.('Word তৈরিতে সমস্যা হয়েছে', '❌');
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    if (!content.trim()) {
      onShowToast?.('ডাউনলোড করার মতো কোনো লেখা নেই', '⚠️');
      return;
    }
    setIsExportingPdf(true);
    const safeTitle = (formData.subject || selectedType.name || 'Application')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .trim();
    const filename = `${safeTitle || 'Application'}.pdf`;

    try {
      await exportToPdf('a4-application-document-sheet', filename, (msg) => {
        onShowToast?.(msg, '⏳');
      });
      onShowToast?.('PDF সফলভাবে ডাউনলোড হয়েছে!', '📄');
    } catch (err: any) {
      console.error('PDF export error:', err);
      onShowToast?.('PDF তৈরিতে সমস্যা হয়েছে। সরাসরি প্রিন্ট উইন্ডো চেষ্টা করুন।', '⚠️');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Print Document
  const handlePrint = () => {
    window.print();
  };

  // Copy Content to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    onShowToast?.('সম্পূর্ণ লেখা ক্লিপবোর্ডে কপি হয়েছে!', '📋');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Print media stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #a4-application-document-sheet, #a4-application-document-sheet * {
            visibility: visible !important;
          }
          #a4-application-document-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Back and Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={activeView === 'dashboard' ? onBackToHub : () => setActiveView('dashboard')}
            className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition cursor-pointer"
            title="পূর্ববর্তী পৃষ্ঠায় ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                MoSaFa Application Writer
              </h1>
              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                দরখাস্ত ও অফিসিয়াল চিঠি
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              প্রফেশনাল বাংলা ও ইংরেজি দরখাস্ত, অফিসিয়াল চিঠি ও রিকোয়েস্ট লেটার জেনারেটর
            </p>
          </div>
        </div>

        {/* View Switchers & Saved Docs button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            হোম
          </button>

          <button
            type="button"
            onClick={() => setActiveView('types')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'types'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            দরখাস্ত নির্বাচন
          </button>

          <button
            type="button"
            onClick={() => setActiveView('form')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'form'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            তথ্য ফরম
          </button>

          <button
            type="button"
            onClick={() => {
              if (!content) {
                handleGenerateDocument();
              } else {
                setActiveView('editor');
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'editor'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            এডিটর ও প্রিভিউ
          </button>

          <button
            type="button"
            onClick={() => setActiveView('templates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'templates'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            টেমপ্লেট (৮টি)
          </button>

          <button
            type="button"
            onClick={() => setIsSavedModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <FolderArchive className="w-3.5 h-3.5 text-cyan-600" />
            <span>সংরক্ষিত ({savedDocuments.length})</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeView === 'dashboard' && (
        <ApplicationDashboard
          onStartNewApplication={() => setActiveView('types')}
          onStartOfficialLetter={() => {
            const officeType = DOCUMENT_TYPES.find((t) => t.id === 'general-official-letter') || DOCUMENT_TYPES[0];
            handleSelectType(officeType);
          }}
          onViewTemplates={() => setActiveView('templates')}
          onOpenSavedDocs={() => setIsSavedModalOpen(true)}
          onSelectCategory={(catId) => {
            setActiveView('types');
          }}
          onSelectSpecificType={(type) => {
            handleSelectType(type);
          }}
          savedCount={savedDocuments.length}
        />
      )}

      {activeView === 'types' && (
        <DocumentTypeSelector
          selectedTypeId={selectedType.id}
          onSelectType={(type) => {
            handleSelectType(type);
          }}
        />
      )}

      {activeView === 'form' && (
        <ApplicationForm
          typeInfo={selectedType}
          formData={formData}
          onChangeField={handleFieldChange}
          onGenerate={handleGenerateDocument}
          onReset={handleResetForm}
        />
      )}

      {activeView === 'templates' && (
        <div className="space-y-6">
          <TemplateSelector
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={(tmplId) => {
              setSelectedTemplateId(tmplId);
              onShowToast?.('টেমপ্লেট লেআউট নির্বাচন করা হয়েছে!', '🎨');
              if (content) {
                setActiveView('editor');
              }
            }}
          />
          {content && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setActiveView('editor')}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-rose-600 transition"
              >
                <span>এডিটরে ফিরে যান</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}

      {activeView === 'editor' && (
        <div className="space-y-4">
          {/* Editor Action Buttons Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-600" />
                <span>{selectedType.name}</span>
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                {formData.language === 'bn' ? 'বাংলা' : 'English'}
              </span>
              {isAiEnhanced && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                  ✨ AI-উন্নত
                </span>
              )}
            </div>

            {/* Mobile Tab Switcher (Visible on mobile screens) */}
            <div className="flex sm:hidden items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMobileTab('editor')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  mobileTab === 'editor' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                সম্পাদনা
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  mobileTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                A4 প্রিভিউ
              </button>
            </div>

            {/* Action Buttons: Save, Word, PDF, Print, Copy */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleSaveCurrentDocument}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="ব্রাউজারে সংরক্ষণ করুন"
              >
                <Save className="w-3.5 h-3.5 text-emerald-600" />
                <span>সংরক্ষণ</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="লেখা কপি করুন"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>কপি</span>
              </button>

              <button
                type="button"
                onClick={handleExportDocx}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="Word (.docx) ফাইল ডাউনলোড করুন"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Word (.docx)</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-50"
                title="প্রিন্ট-রেডি PDF ডাউনলোড করুন"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? 'রেন্ডারিং...' : 'PDF ডাউনলোড'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                title="সরাসরি প্রিন্ট করুন"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট</span>
              </button>
            </div>
          </div>

          {/* Desktop Two-Column Layout / Mobile Single-Column Toggle */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Document Editor */}
            <div
              className={`lg:col-span-5 ${
                mobileTab === 'editor' ? 'block' : 'hidden lg:block'
              }`}
            >
              <DocumentEditor
                content={content}
                onChangeContent={updateContentWithHistory}
                style={style}
                onChangeStyle={(newStyle) => setStyle((prev) => ({ ...prev, ...newStyle }))}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onOpenAiAssist={() => setIsAiModalOpen(true)}
              />
            </div>

            {/* Right Column: Live Real A4 Document Preview */}
            <div
              className={`lg:col-span-7 overflow-x-auto ${
                mobileTab === 'preview' ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="bg-slate-100/70 p-3 sm:p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-700">লাইভ A4 পেজ প্রিভিউ</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('templates')}
                    className="text-rose-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Layout className="w-3.5 h-3.5" />
                    <span>টেমপ্লেট বদলান ({selectedTemplateId})</span>
                  </button>
                </div>

                <DocumentPreview
                  content={content}
                  templateId={selectedTemplateId}
                  style={style}
                  language={formData.language}
                  isAiEnhanced={isAiEnhanced}
                  onChangeStyle={(newStyle) => setStyle((prev) => ({ ...prev, ...newStyle }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Documents Modal */}
      <SavedDocumentsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedDocuments={savedDocuments}
        onOpenDocument={handleOpenSavedDocument}
        onDuplicateDocument={handleDuplicateDocument}
        onRenameDocument={handleRenameDocument}
        onDeleteDocument={handleDeleteDocument}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onClearAll={handleClearAllSaved}
      />

      {/* AI Writing Assist Modal */}
      <AIAssistModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentContent={content}
        onApplyEnhancedText={(newText) => {
          updateContentWithHistory(newText);
          setIsAiEnhanced(true);
          onShowToast?.('AI পরিমার্জিত লেখা সফলভাবে যুক্ত হয়েছে!', '✨');
        }}
        language={formData.language}
        documentTypeName={selectedType.name}
      />
    </div>
  );
};
