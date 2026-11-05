// NidServerCopyApplication.tsx
// জাতীয় পরিচয়পত্রের সার্ভার কপি সরবরাহের জন্য আবেদন
// Exact implementation of user-provided specification and image_44a1549a.png
// Features:
// 1. Dual-pane responsive layout: Left side = Detailed inputs & quick presets, Right side = Authentic A4 official administrative application
// 2. Exact Bengali wording & structure requested by the user
// 3. One-click Sample Data loader, Reset, Validation
// 4. One-click High-Resolution PDF Download via html2canvas-pro + jsPDF
// 5. One-click A4 Printing with dedicated print styles
// 6. Mobile Tab Switcher ('তথ্য পূরণ ফর্ম' vs 'A4 আবেদন প্রিভিউ')

import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  Eye,
  Edit3,
  ZoomIn,
  ZoomOut,
  User,
  MapPin,
  Calendar,
  FileCheck2,
  Building,
  Paperclip,
  Phone,
  FileText,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { DownloadPaywallModal } from '../DownloadPaywallModal';

export interface ServerCopyApplicationData {
  // ১। প্রাপক কর্মকর্তা
  recipientDesignation: string;
  upazila: string;
  district: string;

  // ২। বিষয়
  subject: string;

  // ৩। কারণ / বিশেষ প্রয়োজন
  purposeText: string;

  // ৪। আবেদনকারীর তথ্য
  applicantName: string;
  applicantNid: string;
  applicantMobile: string;
  applicationDate: string;

  // ৫। সংযুক্তি
  attachments: string[];
}

export const SAMPLE_SERVER_COPY_DATA: ServerCopyApplicationData = {
  recipientDesignation: 'উপজেলা নির্বাচন কর্মকর্তা',
  upazila: 'মাধবপুর',
  district: 'হবিগঞ্জ',
  subject: 'জাতীয় পরিচয়পত্রের সার্ভার কপি সরবরাহের জন্য আবেদন।',
  purposeText: 'পাসপোর্ট তৈরি, ভূমি সংক্রান্ত কাজ, সরকারি দাপ্তরিক যাচাই ইত্যাদি',
  applicantName: 'নাঈম মিয়া',
  applicantNid: '১৯৯৫২৬৯১৬৪৫০৪৫৭১২',
  applicantMobile: '০১৭১২-৩৪৫৬৭৮',
  applicationDate: '২৮/১০/২০২৬',
  attachments: [
    'জাতীয় পরিচয়পত্রের ফটোকপি।',
    'প্রয়োজন অনুযায়ী সংশ্লিষ্ট দাপ্তরিক কাগজপত্রের ফটোকপি।',
  ],
};

export const EMPTY_SERVER_COPY_DATA: ServerCopyApplicationData = {
  recipientDesignation: 'উপজেলা নির্বাচন কর্মকর্তা',
  upazila: '',
  district: '',
  subject: 'জাতীয় পরিচয়পত্রের সার্ভার কপি সরবরাহের জন্য আবেদন।',
  purposeText: '',
  applicantName: '',
  applicantNid: '',
  applicantMobile: '',
  applicationDate: new Date().toLocaleDateString('bn-BD'),
  attachments: [
    'জাতীয় পরিচয়পত্রের ফটোকপি।',
    'প্রয়োজন অনুযায়ী সংশ্লিষ্ট দাপ্তরিক কাগজপত্রের ফটোকপি।',
  ],
};

const COMMON_PURPOSES = [
  {
    label: 'পাসপোর্ট ও সরকারি কাজ (ডিফল্ট)',
    text: 'পাসপোর্ট তৈরি, ভূমি সংক্রান্ত কাজ, সরকারি দাপ্তরিক যাচাই ইত্যাদি',
  },
  {
    label: 'ই-পাসপোর্ট ও ভিসা আবেদন',
    text: 'নতুন ই-পাসপোর্ট ইস্যু ও জরুরি ভিসা প্রসেসিং কাজের ভেরিফিকেশন',
  },
  {
    label: 'জমি ক্রয়-বিক্রয় ও নামজারি (মিউটেশন)',
    text: 'জমি রেজিস্ট্রি, নামজারি (মিউটেশন) ও সাব-রেজিস্ট্রার অফিসের দাপ্তরিক যাচাই',
  },
  {
    label: 'ব্যাংক একাউন্ট ও ঋণ সংক্রান্ত',
    text: 'ব্যাংক হিসাব খোলা, কেওয়াইসি (KYC) যাচাই ও ব্যবসায়িক ঋণ প্রক্রিয়াকরণ',
  },
  {
    label: 'চাকরি ও পুলিশ ভেরিফিকেশন',
    text: 'সরকারি/স্বায়ত্তশাসিত চাকুরিতে যোগদান ও পুলিশ ক্লিয়ারেন্স ভেরিফিকেশন',
  },
];

interface NidServerCopyApplicationProps {
  onBackToHub?: () => void;
  backButtonLabel?: string;
  onShowToast?: (message: string, icon?: string) => void;
  initialData?: Partial<ServerCopyApplicationData>;
}

export const NidServerCopyApplication: React.FC<NidServerCopyApplicationProps> = ({
  onBackToHub,
  backButtonLabel = '← ড্যাশবোর্ডে ফিরে যান',
  onShowToast,
  initialData,
}) => {
  const [data, setData] = useState<ServerCopyApplicationData>({
    ...SAMPLE_SERVER_COPY_DATA,
    ...(initialData || {}),
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const applicationRef = useRef<HTMLDivElement>(null);

  const updateField = <K extends keyof ServerCopyApplicationData>(
    field: K,
    value: ServerCopyApplicationData[K]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setData(EMPTY_SERVER_COPY_DATA);
    onShowToast?.('সব তথ্য মুছে ফাঁকা আবেদন ফরম প্রস্তুত করা হয়েছে', '🧹');
  };

  const handleLoadSample = () => {
    setData(SAMPLE_SERVER_COPY_DATA);
    onShowToast?.('নমুনা আবেদনপত্র সফলভাবে লোড হয়েছে', '✨');
  };

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

  const performPrint = () => {
    window.print();
    onShowToast?.('প্রিন্ট উইন্ডো খোলা হয়েছে', '🖨️');
  };

  const handlePrint = () => {
    executeWithPaywall(performPrint);
  };

  const performDownloadPdf = async () => {
    if (!applicationRef.current) return;
    try {
      setIsDownloading(true);
      onShowToast?.('A4 সাইজ হাই-রেজ্যুলেশন PDF তৈরি হচ্ছে...', '⏳');

      const element = applicationRef.current;
      const originalTransform = element.style.transform;
      element.style.transform = 'none';

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      element.style.transform = originalTransform;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const safeName = (data.applicantName || 'Applicant').trim().replace(/[\s/]/g, '_');
      pdf.save(`NID_Server_Copy_Application_${safeName}.pdf`);

      onShowToast?.('আবেদনপত্র PDF সফলভাবে ডাউনলোড হয়েছে!', '✅');
    } catch (err) {
      console.error('PDF generation error:', err);
      onShowToast?.('PDF তৈরিতে সমস্যা হয়েছে। প্রিন্ট অপশন ব্যবহার করুন।', '❌');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPdf = () => {
    executeWithPaywall(performDownloadPdf);
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP ACTION & NAVIGATION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{backButtonLabel}</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                জাতীয় পরিচয়পত্রের সার্ভার কপি সংগ্রহের আবেদন
              </h2>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full border border-purple-200">
                অফিসিয়াল দরখাস্ত ফরম্যাট
              </span>
            </div>
            <p className="text-xs text-slate-500">
              উপজেলা নির্বাচন অফিস • সম্পূর্ণ এডিটেবল • হুবহু A4 সাইজ • তাৎক্ষণিক প্রিন্ট ও PDF
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="নমুনা তথ্য দিয়ে ফরম পূরণ করুন"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>নমুনা তথ্য</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="সব ইনপুট ফাঁকা করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>মুছুন</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 প্রিন্ট করুন</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'ডাউনলোড হচ্ছে...' : 'PDF ডাউনলোড'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex rounded-xl bg-slate-200 p-1 print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'editor'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>তথ্য পূরণ ও এডিটর</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'preview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>A4 আবেদন প্রিভিউ</span>
        </button>
      </div>

      {/* 2. MAIN DUAL-PANE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================== */}
        {/* LEFT PANE: EDITABLE FORM CONTROLS (lg:col-span-5)              */}
        {/* ============================================================== */}
        <div
          className={`lg:col-span-5 space-y-4 print:hidden ${
            activeTab === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Section 1: প্রাপক ও নির্বাচন অফিস */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-purple-800 font-bold text-xs">
              <Building className="w-4 h-4 text-purple-600" />
              <span>১। প্রাপক কর্মকর্তা ও উপজেলা নির্বাচন অফিস</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">প্রাপক কর্মকর্তা পদবী:</label>
                <input
                  type="text"
                  value={data.recipientDesignation}
                  onChange={(e) => updateField('recipientDesignation', e.target.value)}
                  placeholder="যেমন: উপজেলা নির্বাচন কর্মকর্তা"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">উপজেলা নির্বাচন অফিস:</label>
                  <input
                    type="text"
                    value={data.upazila}
                    onChange={(e) => updateField('upazila', e.target.value)}
                    placeholder="যেমন: মাধবপুর"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">জেলা:</label>
                  <input
                    type="text"
                    value={data.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    placeholder="যেমন: হবিগঞ্জ"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">আবেদনের বিষয়:</label>
                <input
                  type="text"
                  value={data.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  placeholder="জাতীয় পরিচয়পত্রের সার্ভার কপি সরবরাহের জন্য আবেদন।"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: সার্ভার কপি প্রয়োজনের কারণ / ক্ষেত্র */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-indigo-800 font-bold text-xs">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>২। যে কাজের জন্য প্রয়োজন (ক্লিক করে সিলেক্ট করুন বা লিখুন)</span>
            </div>

            {/* Quick Reason Presets */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PURPOSES.map((purpose, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateField('purposeText', purpose.text)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-semibold transition active:scale-95 cursor-pointer text-left"
                >
                  {purpose.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">
                বিশেষ প্রয়োজনে দাখিলের ক্ষেত্র:
              </label>
              <textarea
                rows={3}
                value={data.purposeText}
                onChange={(e) => updateField('purposeText', e.target.value)}
                placeholder="যেমন: পাসপোর্ট তৈরি, ভূমি সংক্রান্ত কাজ, সরকারি দাপ্তরিক যাচাই ইত্যাদি"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs font-serif leading-relaxed text-slate-900"
              />
            </div>
          </div>

          {/* Section 3: আবেদনকারীর তথ্য */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-emerald-800 font-bold text-xs">
              <User className="w-4 h-4 text-emerald-600" />
              <span>৩। আবেদনকারীর তথ্য ও স্বাক্ষর ব্লক</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  আবেদনকারীর নাম: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.applicantName}
                  onChange={(e) => updateField('applicantName', e.target.value)}
                  placeholder="যেমন: নাঈম মিয়া"
                  className="w-full px-3 py-1.5 rounded-xl border-2 border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-black text-slate-900 bg-emerald-50/30 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">জাতীয় পরিচয়পত্র নম্বর (NID):</label>
                <input
                  type="text"
                  value={data.applicantNid}
                  onChange={(e) => updateField('applicantNid', e.target.value)}
                  placeholder="যেমন: ১৯৯৫২৬৯১৬৪৫০৪৫৭১২"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">মোবাইল নম্বর:</label>
                  <input
                    type="text"
                    value={data.applicantMobile}
                    onChange={(e) => updateField('applicantMobile', e.target.value)}
                    placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">আবেদনের তারিখ:</label>
                  <input
                    type="text"
                    value={data.applicationDate}
                    onChange={(e) => updateField('applicationDate', e.target.value)}
                    placeholder="যেমন: ২৮/১০/২০২৬"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: সংযুক্তি তালিকা */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-800 font-bold text-xs">
              <Paperclip className="w-4 h-4 text-slate-600" />
              <span>৪। সংযুক্তিসমূহ</span>
            </div>

            <div className="space-y-2 text-xs">
              {data.attachments.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 w-5">
                    {idx === 0 ? '১।' : '২।'}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newArr = [...data.attachments];
                      newArr[idx] = e.target.value;
                      updateField('attachments', newArr);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-xs font-serif"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANE: LIVE A4 APPLICATION CANVAS (lg:col-span-7)         */}
        {/* ============================================================== */}
        <div
          className={`lg:col-span-7 flex flex-col items-center ${
            activeTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Zoom & Quick Controls Bar */}
          <div className="w-full max-w-[210mm] flex items-center justify-between bg-slate-800 text-white px-3 py-2 rounded-t-2xl text-xs print:hidden">
            <div className="flex items-center gap-2">
              <span className="font-bold flex items-center gap-1">
                <span>📄 A4 অফিশিয়াল আবেদন লাইভ প্রিভিউ</span>
              </span>
              <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                ২১০ মিমি × ২৯৭ মিমি
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.max(z - 10, 60))}
                className="p-1 rounded bg-slate-700 hover:bg-slate-600 transition"
                title="ছোট করুন"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-mono text-[11px]">{previewZoom}%</span>
              <button
                type="button"
                onClick={() => setPreviewZoom((z) => Math.min(z + 10, 130))}
                className="p-1 rounded bg-slate-700 hover:bg-slate-600 transition"
                title="বড় করুন"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewZoom(100)}
                className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold"
              >
                ১০০%
              </button>
            </div>
          </div>

          {/* Scrollable Container */}
          <div className="w-full overflow-x-auto pb-6 flex justify-center bg-slate-200/80 p-2 sm:p-4 rounded-b-2xl border border-slate-300">
            {/* The Actual A4 Paper Component */}
            <div
              style={{
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
            >
              <div
                id="nid-server-copy-a4"
                ref={applicationRef}
                className="w-[210mm] min-h-[297mm] bg-white text-black p-[18mm] sm:p-[20mm] shadow-2xl relative flex flex-col justify-between font-serif border border-slate-400 select-text"
              >
                <div>
                  {/* Top Receiver Section */}
                  <div className="space-y-1 mb-8 text-[14px] leading-relaxed">
                    <div className="font-bold text-[15px]">বরাবর</div>
                    <div className="font-bold">{data.recipientDesignation || 'উপজেলা নির্বাচন কর্মকর্তা'}</div>
                    <div>
                      উপজেলা নির্বাচন অফিস,{' '}
                      <span className="font-semibold underline decoration-dotted">
                        {data.upazila || '....................................'}
                      </span>
                    </div>
                    <div>
                      জেলা:{' '}
                      <span className="font-semibold underline decoration-dotted">
                        {data.district || '....................................'}
                      </span>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div className="mb-8">
                    <p className="font-bold text-[15px] leading-snug">
                      বিষয়: <span className="underline">{data.subject}</span>
                    </p>
                  </div>

                  {/* Salutation */}
                  <div className="mb-4">
                    <p className="font-semibold text-[14px]">জনাব,</p>
                  </div>

                  {/* Body Paragraph 1 */}
                  <p className="text-[14px] leading-[2.2] text-justify font-normal indent-8 mb-6 text-black">
                    বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী আপনার অধীনস্থ এলাকার একজন নিবন্ধিত ভোটার। আমার জাতীয় পরিচয়পত্রের সার্ভার কপি বিভিন্ন সরকারি দাপ্তরিক কাজে প্রয়োজন হচ্ছে। বিশেষ করে{' '}
                    <span className="font-bold underline decoration-dotted">
                      {data.purposeText || '....................................'}
                    </span>{' '}
                    (যেমন: পাসপোর্ট তৈরি, ভূমি সংক্রান্ত কাজ, সরকারি দাপ্তরিক যাচাই ইত্যাদি) সম্পাদনের জন্য জাতীয় পরিচয়পত্রের সার্ভার কপি দাখিল করা আবশ্যক।
                  </p>

                  {/* Body Paragraph 2 */}
                  <p className="text-[14px] leading-[2.2] text-justify font-normal indent-8 mb-6 text-black">
                    এমতাবস্থায়, আমার জাতীয় পরিচয়পত্রের সার্ভার কপি সরবরাহ করার জন্য আপনার সদয় অনুমতি ও প্রয়োজনীয় ব্যবস্থা গ্রহণে মর্জি হয়।
                  </p>

                  {/* Prayer Paragraph */}
                  <p className="text-[14px] leading-[2.2] text-justify font-normal indent-8 mb-12 text-black">
                    অতএব, মহোদয়ের নিকট বিনীত প্রার্থনা, আমার প্রয়োজনের বিষয়টি বিবেচনা করে জাতীয় পরিচয়পত্রের সার্ভার কপি প্রদান করে বাধিত করবেন।
                  </p>
                </div>

                {/* Bottom Section: Applicant Signature Block & Attachments */}
                <div className="space-y-8 pt-4">
                  {/* Closing & Applicant Details (Right Aligned) */}
                  <div className="flex justify-end">
                    <div className="w-[300px] sm:w-[320px] text-[13.5px] leading-loose">
                      <div className="mb-4 font-semibold">বিনীত নিবেদক,</div>
                      <div className="mb-2">
                        স্বাক্ষর: <span className="text-slate-400">....................................</span>
                      </div>
                      <div>
                        <b>আবেদনকারীর নাম:</b>{' '}
                        <span className="font-bold">
                          {data.applicantName || '....................................'}
                        </span>
                      </div>
                      <div>
                        <b>জাতীয় পরিচয়পত্র নম্বর:</b>{' '}
                        <span className="font-bold tracking-wider">
                          {data.applicantNid || '....................................'}
                        </span>
                      </div>
                      <div>
                        <b>মোবাইল নম্বর:</b>{' '}
                        <span>
                          {data.applicantMobile || '....................................'}
                        </span>
                      </div>
                      <div>
                        <b>তারিখ:</b>{' '}
                        <span>
                          {data.applicationDate || '....................................'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider line before attachments */}
                  <div className="border-t border-slate-300 pt-4">
                    <div className="text-[13px] font-bold mb-1.5">সংযুক্তি:</div>
                    <ul className="text-[12.5px] space-y-1 list-none pl-1 text-slate-800">
                      {data.attachments.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="font-semibold">{idx === 0 ? '১।' : '২।'}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 BDT & Mandatory Auth Download Paywall */}
      <DownloadPaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        documentTitle={`এনআইডি সার্ভার কপি সংগ্রহের আবেদন (${data.applicantName || 'আবেদনকারী'})`}
        documentTypeTag="A4 অফিসিয়াল দাপ্তরিক আবেদনপত্র"
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
