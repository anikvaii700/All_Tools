import React, { useState, useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  Sparkles,
  Shield,
  Eye,
  Check,
  Fingerprint,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { toBanglaDigits } from './numberUtils';

interface NidBiometricForm1Props {
  onBackToHub?: () => void;
  onShowToast: (message: string, icon?: string) => void;
  initialData?: Partial<Form1Data>;
  backButtonLabel?: string;
}

export interface Form1Data {
  // অফিস কর্তৃক পূরণীয়
  serialNo: string;
  applicationDate: string; // 'YYYY-MM-DD' or 'DD/MM/YYYY'
  applicationType: 'emergency' | 'general'; // জরুরী | সাধারণ

  // ১। জাতীয় পরিচয়পত্রধারীর
  applicantName: string;
  applicantNid: string;

  // ২। অভিভাবকের তথ্য (যদি প্রযোজ্য)
  hasGuardian: boolean;
  guardianName: string;
  guardianNid: string;

  // ৩। ছক (ঝ) অন্যান্য ঘর
  // (ক) থেকে (জ) ফিক্সড কাটা থাকবে
  // (ঝ) এর বিদ্যমান ও চাহিত তথ্য ফিক্সড:
  // বিদ্যমান: "আঙ্গুলের ছাপ ও আইরিশ"
  // চাহিত: "আপডেট করণ"
  otherAttachedDoc: string;

  // ৪, ৫ ও ৬
  feeAmount: string;
  feeReceiptNo: string;
  attachedDocuments: string;

  // স্বাক্ষর ও যোগাযোগ
  guardianSignName: string;
  guardianAddress: string;
  guardianMobile: string;
  guardianEmail: string;

  applicantSignName: string;
  applicantAddress: string;
  applicantMobile: string;
  applicantEmail: string;

  // অংশ-ক (রশিদ)
  receiptSerialNo: string;
  receiptApplicationType: 'emergency' | 'general';
  receiptApplicationDate: string;
  receiptNextContactDate: string;
}

const SAMPLE_DATA: Form1Data = {
  serialNo: 'EC-BIO-২০২৬/১০৪',
  applicationDate: '২৮/১০/২০২৬',
  applicationType: 'general',
  applicantName: 'মো: মোফাসসিরুল ইসলাম',
  applicantNid: '১৯৯৪২৬১২২৩০০০০৫৬৭',
  hasGuardian: false,
  guardianName: '',
  guardianNid: '',
  otherAttachedDoc: 'মূল জাতীয় পরিচয়পত্রের ফটোকপি ও বায়োমেট্রিক ফি রশিদ',
  feeAmount: '৩৪৫/- (তিনশত পঁয়তাল্লিশ টাকা)',
  feeReceiptNo: 'TR-BIO-৯৮৪৫১২ তারিখ: ২৮/১০/২০২৬',
  attachedDocuments: '১. মূল জাতীয় পরিচয়পত্র, ২. অনলাইন জন্ম নিবন্ধন কপি, ৩. চালানের কপি।',
  guardianSignName: '',
  guardianAddress: '',
  guardianMobile: '',
  guardianEmail: '',
  applicantSignName: 'মোফাসসিরুল ইসলাম',
  applicantAddress: 'বাড়ি-১২, লেন-৪, পাইকপাড়া, মিরপুর, ঢাকা-১২১৬',
  applicantMobile: '০১৭১২-৩৪৫৬৭৮',
  applicantEmail: 'mofassir@example.com',
  receiptSerialNo: 'EC-BIO-২০২৬/১০৪',
  receiptApplicationType: 'general',
  receiptApplicationDate: '২৮/১০/২০২৬',
  receiptNextContactDate: '১৫/১১/২০২৬',
};

const EMPTY_DATA: Form1Data = {
  serialNo: '',
  applicationDate: new Date().toLocaleDateString('bn-BD'),
  applicationType: 'general',
  applicantName: '',
  applicantNid: '',
  hasGuardian: false,
  guardianName: '',
  guardianNid: '',
  otherAttachedDoc: 'মূল জাতীয় পরিচয়পত্রের ফটোকপি',
  feeAmount: '',
  feeReceiptNo: '',
  attachedDocuments: '১. মূল জাতীয় পরিচয়পত্র',
  guardianSignName: '',
  guardianAddress: '',
  guardianMobile: '',
  guardianEmail: '',
  applicantSignName: '',
  applicantAddress: '',
  applicantMobile: '',
  applicantEmail: '',
  receiptSerialNo: '',
  receiptApplicationType: 'general',
  receiptApplicationDate: new Date().toLocaleDateString('bn-BD'),
  receiptNextContactDate: '',
};

// Fixed Rows for Section 3
const FIXED_ROWS = [
  { key: 'nameBn', label: '(ক) নাম (বাংলা)' },
  { key: 'nameEn', label: '(খ) নাম (ইংরেজি)' },
  { key: 'fatherName', label: '(গ) পিতার নাম' },
  { key: 'motherName', label: '(ঘ) মাতার নাম' },
  { key: 'spouseName', label: '(ঙ) স্বামী/স্ত্রীর নাম' },
  { key: 'dob', label: '(চ) জন্ম তারিখ' },
  { key: 'address', label: '(ছ) ঠিকানা' },
  { key: 'bloodGroup', label: '(জ) রক্তের গ্রুপ' },
];

export const NidBiometricForm1: React.FC<NidBiometricForm1Props> = ({
  onBackToHub,
  onShowToast,
  initialData,
  backButtonLabel,
}) => {
  const [formData, setFormData] = useState<Form1Data>(() => {
    if (initialData) {
      return {
        ...SAMPLE_DATA,
        ...initialData,
      };
    }
    try {
      const saved = localStorage.getItem('mosafa_voter_form_1_draft');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SAMPLE_DATA;
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Field update helper
  const updateField = (field: keyof Form1Data, val: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: val };
      // auto sync receipt values
      if (field === 'serialNo' && !prev.receiptSerialNo) {
        next.receiptSerialNo = val;
      }
      if (field === 'applicationType') {
        next.receiptApplicationType = val;
      }
      if (field === 'applicationDate' && !prev.receiptApplicationDate) {
        next.receiptApplicationDate = val;
      }
      try {
        localStorage.setItem('mosafa_voter_form_1_draft', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Convert NID into an array of 17 single-digit characters for digit boxes
  const renderNidBoxes = (nid: string, count: number = 17) => {
    const cleanDigits = nid.replace(/[^০-৯0-9]/g, '');
    const boxes = [];
    for (let i = 0; i < count; i++) {
      const char = cleanDigits[i] ? toBanglaDigits(cleanDigits[i]) : '';
      boxes.push(
        <span
          key={i}
          className="inline-flex items-center justify-center w-[12px] h-[16px] sm:w-[13px] sm:h-[18px] border border-slate-900 text-center font-bold font-mono text-[11px] bg-white leading-none"
        >
          {char}
        </span>
      );
    }
    return <div className="inline-flex gap-[1px]">{boxes}</div>;
  };

  // Parse application date into 8 boxes: [দি][ন] [মা][স] [ব][ৎ][স][র]
  const renderDateBoxes = (dateStr: string) => {
    const raw = (dateStr || '').replace(/[^০-৯0-9]/g, '');
    const d1 = raw[0] ? toBanglaDigits(raw[0]) : '';
    const d2 = raw[1] ? toBanglaDigits(raw[1]) : '';
    const m1 = raw[2] ? toBanglaDigits(raw[2]) : '';
    const m2 = raw[3] ? toBanglaDigits(raw[3]) : '';
    const y1 = raw[4] ? toBanglaDigits(raw[4]) : '';
    const y2 = raw[5] ? toBanglaDigits(raw[5]) : '';
    const y3 = raw[6] ? toBanglaDigits(raw[6]) : '';
    const y4 = raw[7] ? toBanglaDigits(raw[7]) : '';

    return (
      <div className="inline-flex items-center gap-1 text-[10.5px]">
        <div className="inline-flex border border-slate-900 bg-white">
          <span className="w-4 h-5 inline-flex items-center justify-center border-r border-slate-900 font-bold">{d1}</span>
          <span className="w-4 h-5 inline-flex items-center justify-center font-bold">{d2}</span>
        </div>
        <div className="inline-flex border border-slate-900 bg-white">
          <span className="w-4 h-5 inline-flex items-center justify-center border-r border-slate-900 font-bold">{m1}</span>
          <span className="w-4 h-5 inline-flex items-center justify-center font-bold">{m2}</span>
        </div>
        <div className="inline-flex border border-slate-900 bg-white">
          <span className="w-4 h-5 inline-flex items-center justify-center border-r border-slate-900 font-bold">{y1}</span>
          <span className="w-4 h-5 inline-flex items-center justify-center border-r border-slate-900 font-bold">{y2}</span>
          <span className="w-4 h-5 inline-flex items-center justify-center border-r border-slate-900 font-bold">{y3}</span>
          <span className="w-4 h-5 inline-flex items-center justify-center font-bold">{y4}</span>
        </div>
      </div>
    );
  };

  // Validation
  const handleValidate = () => {
    const errors: string[] = [];
    if (!formData.applicantName.trim()) errors.push('জাতীয় পরিচয়পত্রধারীর নাম লিখুন');
    if (!formData.applicantNid.trim()) errors.push('জাতীয় পরিচয়পত্র (NID) নম্বর লিখুন');

    if (errors.length === 0) {
      onShowToast('✅ ফরম-১ এর সকল আবশ্যকীয় তথ্য সঠিকভাবে পূরণ করা হয়েছে!', '🎉');
    } else {
      onShowToast(`⚠️ ${errors.join(', ')}।`, '🔔');
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Export
  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    try {
      setIsExportingPdf(true);
      onShowToast('ফরম-১ এর A4 অফিসিয়াল PDF তৈরি হচ্ছে... ⏳', '⚡');

      const originalTransform = previewRef.current.style.transform;
      previewRef.current.style.transform = 'none';

      const canvas = await html2canvas(previewRef.current, {
        scale: 2.2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      previewRef.current.style.transform = originalTransform;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`EC_Form_1_Biometric_Update_${Date.now()}.pdf`);
      onShowToast('✅ ফরম-১ PDF সফলভাবে ডাউনলোড হয়েছে!', '📄');
    } catch (err) {
      console.error(err);
      onShowToast('PDF তৈরিতে সমস্যা হয়েছে। প্রিন্ট অপশনটি ব্যবহার করুন।', '⚠️');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি ফরমের সকল তথ্য মুছে ফেলতে চান?')) {
      setFormData(EMPTY_DATA);
      localStorage.removeItem('mosafa_voter_form_1_draft');
      onShowToast('ফরমের তথ্য মুছে ফেলা হয়েছে', '🧹');
    }
  };

  const handleLoadSample = () => {
    setFormData(SAMPLE_DATA);
    onShowToast('নমুনা তথ্য লোড করা হয়েছে', '✨');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 pb-16 font-sans">
      {/* 1. TOP HEADER & ACTION TOOLBAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title={backButtonLabel || 'ফিরে যান'}
              >
                <ChevronLeft className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">{backButtonLabel || 'ফিরে যান'}</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-xs">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    ফরম-১ (বায়োমেট্রিক আপডেট ফরম ফিলাপ)
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                    আঙ্গুলের ছাপ ও আইরিশ আপডেট
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  [প্রবিধান ৩ দ্রষ্টব্য] জাতীয় পরিচয়পত্র বা সংরক্ষিত তথ্য-উপাত্তে মুদ্রণজনিত ভুল/বায়োমেট্রিক সংশোধনের আবেদন
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>নমুনা তথ্য</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="রিসেট করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleValidate}
              className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">তথ্য যাচাই</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-200 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Switcher (Edit vs Preview) */}
      <div className="lg:hidden max-w-md mx-auto px-4 mt-3 print:hidden">
        <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>তথ্য পূরণ ফর্ম</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>A4 অফিসিয়াল প্রিভিউ</span>
          </button>
        </div>
      </div>

      {/* Official Guidelines Alert Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-4 print:hidden">
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 sm:p-4 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
          <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block text-sm">
              নির্বাচন কমিশন ফরম-১ (বায়োমেট্রিক আপডেট ও আঙুলের ছাপ/আইরিশ সংশোধন গাইডলাইন):
            </span>
            <p className="text-amber-900 leading-relaxed">
              আঙুলের ছাপ ও আইরিশ আপডেটের ক্ষেত্রে নির্বাচন কমিশনের নিয়ম অনুযায়ী ৩ নম্বর টেবিলের <b>(ক) থেকে (জ) পর্যন্ত ঘরগুলোতে লাল দাগ দিয়ে কাটা থাকবে (অপ্রয়োজনীয়)</b>। শুধুমাত্র <b>(ঝ) অন্যান্য</b> ঘরে স্থায়ীভাবে <b>"আঙ্গুলের ছাপ ও আইরিশ"</b> এবং চাহিত তথ্যের ঘরে <b>"আপডেট করণ"</b> ফিক্সড থাকবে। বাকি সকল তথ্যাদি (নাম, জাতীয় পরিচয়পত্র নম্বর, অভিভাবকের তথ্য, স্বাক্ষর ও রসিদ) নিচে পূরণযোগ্য।
            </p>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN LAYOUT: LEFT INPUTS + RIGHT A4 PREVIEW */}
      <div className="max-w-7xl mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================== */}
        {/* LEFT COLUMN: EDIT CONTROLS (COL-SPAN-5)                    */}
        {/* ========================================================== */}
        <div
          className={`lg:col-span-5 space-y-4 print:hidden ${
            activeTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-5">
            {/* ১। ক্রমিক নম্বর ও আবেদনের ধরন */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100 flex items-center justify-between">
                <span>অফিসিয়াল তথ্য ও আবেদনের ধরন</span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  নির্বাচন কমিশন
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ক্রমিক নম্বর (অফিস কর্তৃক পূরণীয়)
                  </label>
                  <input
                    type="text"
                    value={formData.serialNo}
                    onChange={(e) => updateField('serialNo', e.target.value)}
                    placeholder="যেমন: EC-BIO-২০২৬/১০৪"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    আবেদনের তারিখ (DD/MM/YYYY)
                  </label>
                  <input
                    type="text"
                    value={formData.applicationDate}
                    onChange={(e) => updateField('applicationDate', e.target.value)}
                    placeholder="২৮/১০/২০২৬"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* আবেদনের ধরন: জরুরী বনাম সাধারণ */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  আবেদনের ধরন নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField('applicationType', 'general')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      formData.applicationType === 'general'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {formData.applicationType === 'general' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    <span>সাধারণ আবেদন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField('applicationType', 'emergency')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      formData.applicationType === 'emergency'
                        ? 'border-rose-600 bg-rose-50 text-rose-950 ring-2 ring-rose-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {formData.applicationType === 'emergency' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    <span>জরুরী আবেদন</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ২। জাতীয় পরিচয়পত্রধারীর তথ্য */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                ১। জাতীয় পরিচয়পত্রধারীর তথ্য
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  (ক) আবেদনকারীর নাম *
                </label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => updateField('applicantName', e.target.value)}
                  placeholder="এনআইডি অনুযায়ী পূর্ণ নাম লিখুন"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  (খ) জাতীয় পরিচিতি নম্বর (NID) *
                </label>
                <input
                  type="text"
                  value={formData.applicantNid}
                  onChange={(e) => updateField('applicantNid', e.target.value)}
                  placeholder="১০ অথবা ১৭ ডিজিটের এনআইডি নম্বর"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono font-bold tracking-wider"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  ডান পাশের অফিশিয়াল ফর্মে এটি পৃথক পৃথক ১৭টি ডিজিট বক্সে প্রদর্শিত হবে।
                </span>
              </div>
            </div>

            {/* ৩। আইনানুগ অভিভাবকের তথ্য (যদি থাকে) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasGuardian}
                    onChange={(e) => updateField('hasGuardian', e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    ২। আইনানুগ অভিভাবকের তথ্য (১৮ বছরের কম বা বিশেষ ক্ষেত্রে)
                  </span>
                </label>
              </div>

              {formData.hasGuardian && (
                <div className="space-y-2 p-3 bg-amber-50/40 rounded-2xl border border-amber-200 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      অভিভাবকের নাম
                    </label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => updateField('guardianName', e.target.value)}
                      placeholder="অভিভাবকের পূর্ণ নাম"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      অভিভাবকের জাতীয় পরিচিতি নম্বর (NID)
                    </label>
                    <input
                      type="text"
                      value={formData.guardianNid}
                      onChange={(e) => updateField('guardianNid', e.target.value)}
                      placeholder="অভিভাবকের এনআইডি নম্বর"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ৪। ৩ নম্বর টেবিল (বায়োমেট্রিক আপডেট ফিক্সড নিয়ম) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  ৩। সংশোধন ছক (বায়োমেট্রিক আপডেট)
                </h4>
                <span className="text-[10px] text-rose-700 font-extrabold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  (ক) হতে (জ) ঘর কাটা ফিক্সড
                </span>
              </div>

              {/* Informative Visual Card for user instructions */}
              <div className="bg-slate-50 border-2 border-dashed border-rose-300 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>(ক) হতে (জ) ঘরগুলোর অবস্থা:</span>
                  <span className="text-rose-600 font-black">❌ কাটা দাগ (অসম্পাদ্য)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  নাম (বাংলা/ইংরেজি), পিতা, মাতা, স্বামী/স্ত্রী, জন্ম তারিখ, ঠিকানা ও রক্তের গ্রুপ এই বায়োমেট্রিক ফরমটিতে লাল দাগ দিয়ে কাটা থাকবে এবং কোনো এডিট হবে না।
                </p>

                <div className="bg-white p-3 rounded-xl border border-rose-200 space-y-1.5">
                  <span className="text-[11px] font-black text-rose-700 block">
                    (ঝ) অন্যান্য (স্থায়ী ফিক্সড লেখা):
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                      <span className="text-[10px] text-slate-500 block">বিদ্যমান তথ্য:</span>
                      <b className="text-rose-700">আঙ্গুলের ছাপ ও আইরিশ</b>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                      <span className="text-[10px] text-slate-500 block">চাহিত সংশোধিত তথ্য:</span>
                      <b className="text-rose-700">আপডেট করণ</b>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 mt-2">
                    সংযুক্ত দলিলাদি / মন্তব্য (ঝ নম্বর ঘরের জন্য):
                  </label>
                  <input
                    type="text"
                    value={formData.otherAttachedDoc}
                    onChange={(e) => updateField('otherAttachedDoc', e.target.value)}
                    placeholder="যেমন: মূল জাতীয় পরিচয়পত্রের ফটোকপি ও বায়োমেট্রিক ফি চালান"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            </div>

            {/* ৫। জমাকৃত ফি ও অন্যান্য */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                ৪, ৫ ও ৬। ফি ও সংযুক্ত দলিলের বিবরণ
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ৪। জমাকৃত ফি এর পরিমাণ
                  </label>
                  <input
                    type="text"
                    value={formData.feeAmount}
                    onChange={(e) => updateField('feeAmount', e.target.value)}
                    placeholder="যেমন: ৩৪৫/- টাকা"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ৫। ফি জমা দানের রসিদ নম্বর
                  </label>
                  <input
                    type="text"
                    value={formData.feeReceiptNo}
                    onChange={(e) => updateField('feeReceiptNo', e.target.value)}
                    placeholder="রসিদ নম্বর ও তারিখ"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ৬। আবেদনপত্রের সহিত সংযুক্ত দলিলাদির তালিকা
                </label>
                <textarea
                  rows={2}
                  value={formData.attachedDocuments}
                  onChange={(e) => updateField('attachedDocuments', e.target.value)}
                  placeholder="যেমন: ১. মূল জাতীয় পরিচয়পত্র, ২. চালান কপি"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* ৬। স্বাক্ষর ও ঠিকানা */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                আবেদনকারীর স্বাক্ষর ও যোগাযোগের তথ্য
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    স্বাক্ষরকারীর নাম
                  </label>
                  <input
                    type="text"
                    value={formData.applicantSignName}
                    onChange={(e) => updateField('applicantSignName', e.target.value)}
                    placeholder="আবেদনকারীর নাম"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={formData.applicantMobile}
                    onChange={(e) => updateField('applicantMobile', e.target.value)}
                    placeholder="০১৭১২-৩৪৫৬৭৮"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ঠিকানা
                </label>
                <input
                  type="text"
                  value={formData.applicantAddress}
                  onChange={(e) => updateField('applicantAddress', e.target.value)}
                  placeholder="বর্তমান যোগাযোগের ঠিকানা"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ই-মেইল (যদি থাকে)
                  </label>
                  <input
                    type="text"
                    value={formData.applicantEmail}
                    onChange={(e) => updateField('applicantEmail', e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    রসিদ: পরবর্তী যোগাযোগের তারিখ
                  </label>
                  <input
                    type="text"
                    value={formData.receiptNextContactDate}
                    onChange={(e) => updateField('receiptNextContactDate', e.target.value)}
                    placeholder="যেমন: ১৫/১১/২০২৬"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: OFFICIAL A4 FORM-1 PREVIEW (COL-SPAN-7)     */}
        {/* ========================================================== */}
        <div
          className={`lg:col-span-7 space-y-3 ${
            activeTab === 'edit' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Zoom & Viewport Bar */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">জুম:</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                title="ছোট করুন"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-slate-800 w-12 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                title="বড় করুন"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="text-[11px] font-bold text-amber-700 hover:underline ml-1"
              >
                রিসেট
              </button>
            </div>

            <div className="text-[11px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              হুবহু নির্বাচন কমিশন Form-1 A4
            </div>
          </div>

          {/* DOCUMENT WRAPPER (Strict A4 Paper Replica matching image_551c9cea.png) */}
          <div className="overflow-x-auto flex justify-center pb-6">
            <div
              ref={previewRef}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
              className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-xl border border-slate-300 p-[10mm] sm:p-[12mm] font-serif leading-tight text-[12px] print:m-0 print:p-[8mm] print:shadow-none print:border-none print:w-full print:scale-100"
            >
              {/* TOP HEADER SECTION WITH STAPLE BOX */}
              <div className="relative mb-3 pt-1">
                {/* Top-Right Staple Box matching image_551c9cea.png */}
                <div className="absolute top-0 right-0 w-[110px] h-[80px] border-2 border-slate-900 p-1 flex flex-col items-center justify-center text-center text-[10px] leading-tight font-sans font-bold bg-white">
                  <span>মূল জাতীয় পরিচয়পত্র</span>
                  <span>এখানে সংযুক্ত করুন</span>
                  <span className="text-[9px] text-slate-700 font-normal mt-0.5">(স্ট্যাপল)</span>
                </div>

                {/* Center Title */}
                <div className="text-center space-y-0.5 pr-28 pl-4">
                  <div className="text-[16px] font-black underline tracking-tight">ফরম-১</div>
                  <div className="text-[11px] font-bold">[প্রবিধান ৩ দ্রষ্টব্য]</div>
                  <h3 className="text-[14px] font-black tracking-tight pt-1 leading-snug">
                    জাতীয় পরিচয়পত্র বা সংরক্ষিত তথ্য-উপাত্তে মুদ্রণজনিত ভুল সংশোধনের আবেদন
                  </h3>
                </div>
              </div>

              {/* SERIAL NO, DATE & APPLICATION TYPE ROW */}
              <div className="grid grid-cols-12 gap-1 items-center text-[11px] mb-2.5 pt-1">
                {/* Left: ক্রমিক নম্বর */}
                <div className="col-span-5 flex items-center">
                  <span className="font-bold shrink-0">ক্রমিক নম্বর : </span>
                  <div className="inline-block border border-slate-900 min-w-[100px] h-[22px] px-2 py-0.5 ml-1 text-center font-mono font-bold text-xs bg-white">
                    {formData.serialNo}
                  </div>
                  <span className="text-[9.5px] ml-1 text-slate-600 shrink-0 font-sans">(অফিস কর্তৃক পূরণীয়)</span>
                </div>

                {/* Center: আবেদনের তারিখ */}
                <div className="col-span-4 flex items-center justify-center">
                  <span className="font-bold mr-1 shrink-0 text-[10.5px]">আবেদনের তারিখ :</span>
                  {renderDateBoxes(formData.applicationDate)}
                </div>

                {/* Right: আবেদনের ধরন টেবিল */}
                <div className="col-span-3 flex justify-end">
                  <div className="text-center font-sans">
                    <span className="block text-[9.5px] font-bold pb-0.5">আবেদনের ধরন</span>
                    <table className="border-collapse border border-slate-900 text-[10px]">
                      <tbody>
                        <tr>
                          <td
                            className={`border border-slate-900 px-2 py-0.5 font-bold ${
                              formData.applicationType === 'emergency' ? 'bg-slate-200' : ''
                            }`}
                          >
                            {formData.applicationType === 'emergency' ? '✓ জরুরী' : 'জরুরী'}
                          </td>
                          <td
                            className={`border border-slate-900 px-2 py-0.5 font-bold ${
                              formData.applicationType === 'general' ? 'bg-slate-200' : ''
                            }`}
                          >
                            {formData.applicationType === 'general' ? '✓ সাধারণ' : 'সাধারণ'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ১। জাতীয় পরিচয়পত্রধারীর তথ্য */}
              <div className="space-y-1.5 mb-2 text-[11.5px]">
                <div className="font-bold">১। জাতীয় পরিচয়পত্রধারীর-</div>
                <div className="pl-4 flex items-baseline">
                  <span className="w-20 shrink-0 font-medium">(ক) নাম</span>
                  <span className="mr-1">:</span>
                  <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5 min-h-[17px]">
                    {formData.applicantName || '........................................................................................................'}
                  </span>
                </div>
                <div className="pl-4 flex items-center">
                  <span className="w-48 shrink-0 font-medium">(খ) জাতীয় পরিচিতি নম্বর (NID)</span>
                  <span className="mr-1">:</span>
                  <div className="flex-1">
                    {renderNidBoxes(formData.applicantNid, 17)}
                  </div>
                </div>
              </div>

              {/* ২। অভিভাবকের তথ্য */}
              <div className="space-y-1.5 mb-2.5 text-[11.5px]">
                <div className="text-justify leading-snug">
                  <span className="font-bold">
                    ২। আঠারো বৎসরের কম বয়স্ক/আদালত কর্তৃক অপ্রকৃতিস্থ ঘোষিত জাতীয় পরিচয়পত্রধারীর ক্ষেত্রে, আইনানুগ অভিভাবকের-
                  </span>
                </div>
                <div className="pl-4 flex items-baseline">
                  <span className="w-20 shrink-0 font-medium">(ক) নাম</span>
                  <span className="mr-1">:</span>
                  <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5 min-h-[17px]">
                    {formData.hasGuardian && formData.guardianName ? formData.guardianName : '........................................................................................................'}
                  </span>
                </div>
                <div className="pl-4 flex items-center">
                  <span className="w-48 shrink-0 font-medium">(খ) জাতীয় পরিচিতি নম্বর (NID)</span>
                  <span className="mr-1">:</span>
                  <div className="flex-1">
                    {renderNidBoxes(formData.hasGuardian ? formData.guardianNid : '', 17)}
                  </div>
                </div>
              </div>

              {/* ৩। সংশোধন ছক (৪ কলাম) - EXACT AS PER USER DRAWING image_551c9cea.png */}
              <div className="space-y-1 mb-2.5">
                <div className="font-bold text-[11px]">
                  ৩। জাতীয় পরিচয়পত্র বা সংরক্ষিত তথ্য-উপাত্তে যে তথ্য সংশোধন করিতে হইবে (অপ্রয়োজনীয় অংশ কাটিয়া দিন)-
                </div>

                <div className="relative">
                  <table className="w-full border-collapse border border-slate-900 text-[11px] leading-tight text-center">
                    <thead>
                      <tr className="bg-slate-100 font-bold">
                        <th className="border border-slate-900 p-1 w-[20%] text-center">বিষয়</th>
                        <th className="border border-slate-900 p-1 w-[32%] text-center">
                          বর্তমানে জাতীয় পরিচয়পত্রের তথ্য বা<br />সংরক্ষিত তথ্য-উপাত্তে বিদ্যমান তথ্য
                        </th>
                        <th className="border border-slate-900 p-1 w-[30%] text-center">
                          চাহিত সংশোধিত তথ্য
                        </th>
                        <th className="border border-slate-900 p-1 w-[18%] text-center">
                          সংযুক্ত দলিলাদি/<br />মন্তব্য
                        </th>
                      </tr>
                    </thead>
                    <tbody className="relative">
                      {/* Rows (ক) to (জ) - All disabled and crossed out with user's red strike-through */}
                      {FIXED_ROWS.map((row, idx) => (
                        <tr key={row.key} className="h-[21px] relative">
                          <td className="border border-slate-900 px-1 py-0.5 font-bold text-left pl-2">
                            {row.label}
                          </td>
                          {/* Col 2 & 3: Diagonal strike through area */}
                          <td className="border border-slate-900 p-0 text-slate-300 select-none relative bg-slate-50/20">
                            {/* Visual strike line */}
                            <span className="text-slate-200">-</span>
                          </td>
                          <td className="border border-slate-900 p-0 text-slate-300 select-none relative bg-slate-50/20">
                            <span className="text-slate-200">-</span>
                          </td>
                          <td className="border border-slate-900 px-1 py-0.5 text-[9.5px] text-slate-300 select-none">
                            -
                          </td>
                        </tr>
                      ))}

                      {/* Row (ঝ) অন্যান্য - FIXED IN RED TEXT AS REQUESTED */}
                      <tr className="h-[26px] bg-amber-50/30">
                        <td className="border border-slate-900 px-1 py-1 font-bold text-left pl-2 text-slate-900">
                          (ঝ) অন্যান্য
                        </td>
                        <td className="border border-slate-900 px-2 py-1 font-black text-rose-600 text-xs sm:text-[13px] tracking-wide">
                          আঙ্গুলের ছাপ ও আইরিশ
                        </td>
                        <td className="border border-slate-900 px-2 py-1 font-black text-rose-600 text-xs sm:text-[13px] tracking-wide">
                          আপডেট করণ
                        </td>
                        <td className="border border-slate-900 px-1 py-1 text-[10px] text-slate-800 leading-tight">
                          {formData.otherAttachedDoc || 'বায়োমেট্রিক তথ্য'}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* OVERLAY: EXACT RED DIAGONAL SLASH LINE AS DRAWN BY USER (image_551c9cea.png) */}
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {/* Diagonal Slash across Column 2 (বর্তমানে...) for rows ক through জ (approx top 12% to 78%) */}
                    <line
                      x1="46"
                      y1="16"
                      x2="24"
                      y2="78"
                      stroke="#dc2626"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    {/* Diagonal Slash across Column 3 (চাহিত...) for rows ক through জ (approx top 12% to 78%) */}
                    <line
                      x1="77"
                      y1="16"
                      x2="55"
                      y2="78"
                      stroke="#dc2626"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* SIGNATURES DUAL COLUMNS */}
              <div className="grid grid-cols-2 gap-4 pt-1 mb-2 text-[11px] leading-snug">
                {/* Left: Guardian Signature */}
                <div className="space-y-0.5 border-t border-dashed border-slate-400 pt-1">
                  <div className="font-bold">আইনানুগ অভিভাবকের স্বাক্ষর/টিপসহি (প্রযোজ্য ক্ষেত্রে)</div>
                  <div>
                    <span className="font-medium">নাম ঃ </span>
                    <span className="font-bold border-b border-dotted border-slate-800 pb-0.5">
                      {formData.hasGuardian && formData.guardianSignName ? formData.guardianSignName : '.....................................................'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ঠিকানা ঃ </span>
                    <span className="border-b border-dotted border-slate-800 pb-0.5">
                      {formData.hasGuardian && formData.guardianAddress ? formData.guardianAddress : '...................................................'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">মোবাইল নম্বর ঃ </span>
                    <span className="border-b border-dotted border-slate-800 pb-0.5">
                      {formData.hasGuardian && formData.guardianMobile ? formData.guardianMobile : '................................................'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ই-মেইল (যদি থাকে) ঃ </span>
                    <span className="border-b border-dotted border-slate-800 pb-0.5">
                      {formData.hasGuardian && formData.guardianEmail ? formData.guardianEmail : '.............................................'}
                    </span>
                  </div>
                </div>

                {/* Right: Applicant Signature */}
                <div className="space-y-0.5 border-t border-dashed border-slate-400 pt-1">
                  <div className="font-bold">আবেদনকারীর স্বাক্ষর/টিপসহি</div>
                  <div>
                    <span className="font-medium">নাম ঃ </span>
                    <span className="font-bold border-b border-dotted border-slate-800 pb-0.5">
                      {formData.applicantSignName || formData.applicantName || '.....................................................'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ঠিকানা ঃ </span>
                    <span className="border-b border-dotted border-slate-800 pb-0.5">
                      {formData.applicantAddress || '...................................................'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">মোবাইল নম্বর ঃ </span>
                    <span className="font-bold border-b border-dotted border-slate-800 pb-0.5">
                      {formData.applicantMobile || '................................................'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ই-মেইল (যদি থাকে) ঃ </span>
                    <span className="border-b border-dotted border-slate-800 pb-0.5">
                      {formData.applicantEmail || '.............................................'}
                    </span>
                  </div>
                </div>
              </div>

              {/* PERFORATED DOTTED TEAR LINE */}
              <div className="relative my-2 border-t-2 border-dashed border-slate-400 flex items-center justify-center">
                <span className="absolute bg-white px-2 text-[9.5px] text-slate-500 font-sans flex items-center gap-1">
                  ✂️ অংশ কাটার লাইন (রসিদ অংশ পৃথক করুন)
                </span>
              </div>

              {/* অংশ - ক (ফরম-১) প্রাপ্তিস্বীকার এবং জাতীয় পরিচয়পত্র প্রদানের রশিদ */}
              <div className="pt-1 text-[11px] leading-snug">
                <div className="text-center mb-1.5 space-y-0.5">
                  <div className="font-bold text-[12px]">অংশ-ক (ফরম-১)</div>
                  <div className="text-[10px] font-bold">[প্রবিধান ৩ (২) ও ৩ (৩)]</div>
                  <div className="font-black text-[12.5px] underline">
                    (প্রাপ্তিস্বীকার এবং জাতীয় পরিচয়পত্র প্রদানের রশিদ)
                  </div>
                </div>

                {/* Receipt Header Table with Serial Box & Type */}
                <div className="flex justify-between items-center text-[10.5px] mb-2">
                  <div className="flex items-center">
                    <table className="border-collapse border border-slate-900 bg-white">
                      <tbody>
                        <tr>
                          <td className="border border-slate-900 px-2 py-0.5 font-bold text-center">
                            ক্রমিক নম্বরঃ
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-slate-900 px-2 py-1 font-mono font-bold text-center min-w-[110px]">
                            {formData.receiptSerialNo || formData.serialNo}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-center font-sans">
                    <span className="block text-[9.5px] font-bold pb-0.5">আবেদনের ধরন</span>
                    <table className="border-collapse border border-slate-900 text-[10px]">
                      <tbody>
                        <tr>
                          <td
                            className={`border border-slate-900 px-2 py-0.5 font-bold ${
                              formData.receiptApplicationType === 'emergency' ? 'bg-slate-200' : ''
                            }`}
                          >
                            {formData.receiptApplicationType === 'emergency' ? '✓ জরুরী' : 'জরুরী'}
                          </td>
                          <td
                            className={`border border-slate-900 px-2 py-0.5 font-bold ${
                              formData.receiptApplicationType === 'general' ? 'bg-slate-200' : ''
                            }`}
                          >
                            {formData.receiptApplicationType === 'general' ? '✓ সাধারণ' : 'সাধারণ'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Receipt Details */}
                <div className="space-y-1 pl-1">
                  <div className="flex items-baseline">
                    <span className="w-48 shrink-0 font-medium">১। আবেদনকারীর নাম-</span>
                    <span className="mr-1">:</span>
                    <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5">
                      {formData.applicantName || '.......................................................................'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-48 shrink-0 font-medium pl-4">জাতীয় পরিচিতি নম্বর (NID)</span>
                    <span className="mr-1">:</span>
                    <div className="flex-1">
                      {renderNidBoxes(formData.applicantNid, 17)}
                    </div>
                  </div>

                  <div className="flex items-baseline">
                    <span className="w-48 shrink-0 font-medium">
                      ২। প্রযোজ্য ক্ষেত্রে, আইনানুগ অভিভাবকের নাম
                    </span>
                    <span className="mr-1">:</span>
                    <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5">
                      {formData.hasGuardian && formData.guardianName ? formData.guardianName : '.......................................................................'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="w-48 shrink-0 font-medium pl-4">জাতীয় পরিচিতি নম্বর (NID)</span>
                    <span className="mr-1">:</span>
                    <div className="flex-1">
                      {renderNidBoxes(formData.hasGuardian ? formData.guardianNid : '', 17)}
                    </div>
                  </div>

                  <div className="flex items-baseline">
                    <span className="w-48 shrink-0 font-medium">৩। আবেদনের তারিখ-</span>
                    <span className="mr-1">:</span>
                    <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5">
                      {formData.receiptApplicationDate || formData.applicationDate || '...............................................................................'}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="w-72 shrink-0 font-medium">
                      ৪। পরবর্তী যোগাযোগের তারিখ/জাতীয় পরিচয়পত্র প্রদানের তারিখ-
                    </span>
                    <span className="mr-1">:</span>
                    <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5">
                      {formData.receiptNextContactDate || '.......................................................................'}
                    </span>
                  </div>
                </div>

                {/* Bottom Signature & Seal */}
                <div className="flex justify-end pt-5 px-4 text-[11px]">
                  <div className="text-center border-t border-dashed border-slate-800 pt-1 font-bold min-w-[200px]">
                    দায়িত্বপ্রাপ্ত কর্মকর্তার স্বাক্ষর ও সিলমোহর
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
