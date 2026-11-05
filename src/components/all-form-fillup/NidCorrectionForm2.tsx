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
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { toBanglaDigits } from './numberUtils';
import { DownloadPaywallModal } from '../DownloadPaywallModal';

interface NidCorrectionForm2Props {
  onBackToHub?: () => void;
  onShowToast: (message: string, icon?: string) => void;
  initialData?: Partial<Form2Data>;
  backButtonLabel?: string;
}

export interface CorrectionRow {
  key: string;
  label: string;
  selected: boolean;
  currentValue: string;
  desiredValue: string;
  attachedDoc: string;
}

export interface Form2Data {
  // অফিস কর্তৃক পূরণীয়
  serialNo: string;

  // ১। জাতীয় পরিচয়পত্রধারীর
  applicantName: string;
  applicantNid: string;

  // ২। আঠারো বৎসরের কম বয়স্ক/আদালত কর্তৃক অপ্রকৃতিস্থ ঘোষিত ব্যক্তির আইনানুগ অভিভাবকের
  hasGuardian: boolean;
  guardianName: string;
  guardianNid: string;

  // ৩। ৪-কলাম সংশোধনী তালিকা
  corrections: CorrectionRow[];

  // ৪, ৫, ৬
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

  // অংশ - খ (রসিদ)
  receiptSerialNo: string;
  receiptApplicationDate: string;
  receiptNextContactDate: string;
}

const DEFAULT_ROWS: CorrectionRow[] = [
  { key: 'nameBn', label: '(ক) নাম (বাংলা)', selected: true, currentValue: '', desiredValue: '', attachedDoc: '' },
  { key: 'nameEn', label: '(খ) নাম (ইংরেজি)', selected: false, currentValue: '', desiredValue: '', attachedDoc: '' },
  { key: 'fatherName', label: '(গ) পিতার নাম', selected: false, currentValue: '', desiredValue: '', attachedDoc: '' },
  { key: 'motherName', label: '(ঘ) মাতার নাম', selected: false, currentValue: '', desiredValue: '', attachedDoc: '' },
  { key: 'spouseName', label: '(ঙ) স্বামীর নাম [বা স্ত্রীর নাম]', selected: false, currentValue: '', desiredValue: '', attachedDoc: '' },
  { key: 'dob', label: '(চ) জন্মতারিখ', selected: true, currentValue: '', desiredValue: '', attachedDoc: '' },
  { key: 'address', label: '(ছ) ঠিকানা', selected: false, currentValue: '', desiredValue: '', attachedDoc: '' },
  { key: 'bloodGroup', label: '(জ) রক্তের গ্রুপ', selected: false, currentValue: '', desiredValue: '', attachedDoc: '' },
  { key: 'others', label: '(ঝ) অন্যান্য', selected: false, currentValue: '', desiredValue: '', attachedDoc: '' },
];

const SAMPLE_DATA: Form2Data = {
  serialNo: 'EC-DH-২০২৬/৮৮৪',
  applicantName: 'মো: তানভীর আহমেদ',
  applicantNid: '১৯৯০২৬১২৩৪৫৬৭৮৯০১',
  hasGuardian: false,
  guardianName: '',
  guardianNid: '',
  corrections: [
    {
      key: 'nameBn',
      label: '(ক) নাম (বাংলা)',
      selected: true,
      currentValue: 'তানভির আহামেদ',
      desiredValue: 'মো: তানভীর আহমেদ',
      attachedDoc: 'এসএসসি সনদপত্র ও জন্ম নিবন্ধন',
    },
    {
      key: 'nameEn',
      label: '(খ) নাম (ইংরেজি)',
      selected: true,
      currentValue: 'TANVIR AHMED',
      desiredValue: 'MD. TANVIR AHMED',
      attachedDoc: 'পাসপোর্ট ও এসএসসি সার্টিফিকেট',
    },
    {
      key: 'fatherName',
      label: '(গ) পিতার নাম',
      selected: false,
      currentValue: '',
      desiredValue: '',
      attachedDoc: '',
    },
    {
      key: 'motherName',
      label: '(ঘ) মাতার নাম',
      selected: false,
      currentValue: '',
      desiredValue: '',
      attachedDoc: '',
    },
    {
      key: 'spouseName',
      label: '(ঙ) স্বামীর নাম [বা স্ত্রীর নাম]',
      selected: false,
      currentValue: '',
      desiredValue: '',
      attachedDoc: '',
    },
    {
      key: 'dob',
      label: '(চ) জন্মতারিখ',
      selected: true,
      currentValue: '১৫/০৪/১৯৯২',
      desiredValue: '১০/০২/১৯৯০',
      attachedDoc: 'এসএসসি সনদপত্র ও অনলাইন জন্ম নিবন্ধন',
    },
    {
      key: 'address',
      label: '(ছ) ঠিকানা',
      selected: false,
      currentValue: '',
      desiredValue: '',
      attachedDoc: '',
    },
    {
      key: 'bloodGroup',
      label: '(জ) রক্তের গ্রুপ',
      selected: true,
      currentValue: 'অনির্ধারিত',
      desiredValue: 'B+ (বি পজিটিভ)',
      attachedDoc: 'অনুমোদিত ডায়াগনস্টিক সেন্টারের ব্লাড গ্রুপ রিপোর্ট',
    },
    {
      key: 'others',
      label: '(ঝ) অন্যান্য',
      selected: false,
      currentValue: '',
      desiredValue: '',
      attachedDoc: '',
    },
  ],
  feeAmount: '৩৪৫/- (তিনশত পঁয়তাল্লিশ টাকা)',
  feeReceiptNo: 'TR-BK-৯৮৭৬৩৪ তারিখ: ২৮/১০/২০২৬',
  attachedDocuments: '১. অনলাইন জন্ম নিবন্ধন সনদ, ২. এসএসসি সনদপত্র, ৩. পাসপোর্ট কপি ও ৪. ব্যাংক ফি জমার চালান।',
  guardianSignName: '',
  guardianAddress: '',
  guardianMobile: '',
  guardianEmail: '',
  applicantSignName: 'মো: তানভীর আহমেদ',
  applicantAddress: 'বাড়ি-১২, রোড-০৫, সেক্টর-০৭, উত্তরা, ঢাকা-১২৩০',
  applicantMobile: '০১৭১২-৩৪৫৬৭৮',
  applicantEmail: 'tanvir.ahmed@example.com',
  receiptSerialNo: 'EC-DH-২০২৬/৮৮৪',
  receiptApplicationDate: '২৮/১০/২০২৬',
  receiptNextContactDate: '১৫/১১/২০২৬',
};

const EMPTY_DATA: Form2Data = {
  serialNo: '',
  applicantName: '',
  applicantNid: '',
  hasGuardian: false,
  guardianName: '',
  guardianNid: '',
  corrections: DEFAULT_ROWS.map((r) => ({ ...r })),
  feeAmount: '৩৪৫/-',
  feeReceiptNo: '',
  attachedDocuments: '',
  guardianSignName: '',
  guardianAddress: '',
  guardianMobile: '',
  guardianEmail: '',
  applicantSignName: '',
  applicantAddress: '',
  applicantMobile: '',
  applicantEmail: '',
  receiptSerialNo: '',
  receiptApplicationDate: new Date().toLocaleDateString('bn-BD'),
  receiptNextContactDate: '',
};

export const NidCorrectionForm2: React.FC<NidCorrectionForm2Props> = ({
  onBackToHub,
  onShowToast,
  initialData,
  backButtonLabel,
}) => {
  const [formData, setFormData] = useState<Form2Data>(() => {
    if (initialData) {
      return {
        ...SAMPLE_DATA,
        ...initialData,
        corrections: initialData.corrections || SAMPLE_DATA.corrections,
      };
    }
    try {
      const saved = localStorage.getItem('mosafa_voter_form_2_draft');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SAMPLE_DATA;
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Field update helper
  const updateField = (field: keyof Form2Data, val: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: val };
      try {
        localStorage.setItem('mosafa_voter_form_2_draft', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Correction row update
  const updateCorrectionRow = (index: number, patch: Partial<CorrectionRow>) => {
    setFormData((prev) => {
      const nextRows = [...prev.corrections];
      nextRows[index] = { ...nextRows[index], ...patch };
      const next = { ...prev, corrections: nextRows };
      try {
        localStorage.setItem('mosafa_voter_form_2_draft', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Sample data filler
  const handleLoadSample = () => {
    setFormData(SAMPLE_DATA);
    try {
      localStorage.setItem('mosafa_voter_form_2_draft', JSON.stringify(SAMPLE_DATA));
    } catch {}
    onShowToast('নমুনা তথ্য লোড করা হয়েছে! 🇧🇩', '✅');
  };

  // Reset form
  const handleReset = () => {
    if (confirm('আপনি কি ফরমের সকল তথ্য মুছে ফেলতে চান?')) {
      setFormData(EMPTY_DATA);
      try {
        localStorage.removeItem('mosafa_voter_form_2_draft');
      } catch {}
      onShowToast('ফরম খালি করা হয়েছে।', '🔄');
    }
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

  // Native Print
  const performPrint = () => {
    window.print();
  };

  const handlePrint = () => {
    executeWithPaywall(performPrint);
  };

  // PDF Download
  const performDownloadPdf = async () => {
    if (!previewRef.current) return;
    try {
      setIsExportingPdf(true);
      onShowToast('অফিসিয়াল ফরম-২ PDF তৈরি হচ্ছে... 📄', '⚡');

      const element = previewRef.current;
      const originalTransform = element.style.transform;
      element.style.transform = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
      } else {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
      }

      pdf.save(`NID_Correction_Form_2_${Date.now()}.pdf`);
      onShowToast('ফরম-২ PDF সফলভাবে ডাউনলোড হয়েছে! 📄', '✅');
      element.style.transform = originalTransform;
    } catch (err) {
      console.error(err);
      onShowToast('PDF তৈরি করতে সমস্যা হয়েছে। প্রিন্ট অপশনটি ব্যবহার করুন।', '⚠️');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    executeWithPaywall(performDownloadPdf);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              type="button"
              onClick={onBackToHub}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              title="ফিরে যান"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{backButtonLabel || '← ফিরে যান'}</span>
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0">
            🇧🇩
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black">
                জাতীয় পরিচয়পত্র বা তথ্য-উপাত্ত সংশোধনের আবেদন (ফরম-২)
              </h3>
              <span className="text-[10px] bg-emerald-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                বাংলাদেশ নির্বাচন কমিশন
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              [প্রবিধান ৪ দ্রষ্টব্য] • ৪-কলাম সংশোধন ছক, ফি রসিদ ও অংশ-খ রসিদসহ অফিশিয়াল A4 লিগ্যাল প্রিন্ট
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
            title="নমুনা তথ্য দিয়ে ফরম পূরণ করুন"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>নমুনা তথ্য</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
            title="তথ্য রিসেট করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'PDF হচ্ছে...' : 'PDF ডাউনলোড'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Toggle */}
      <div className="flex sm:hidden p-1 bg-slate-200/80 rounded-2xl print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'edit'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>তথ্য পূরণ</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'preview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>অফিশিয়াল প্রিভিউ</span>
        </button>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Input Form */}
        <div
          className={`lg:col-span-5 space-y-4 print:hidden ${
            activeTab === 'preview' ? 'hidden sm:hidden lg:block' : 'block'
          }`}
        >
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>ফরম-২ পূরণ ফর্ম</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-semibold">
                নির্বাচন কমিশন বাংলাদেশ
              </span>
            </div>

            {/* ১। আবেদনকারীর তথ্য */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                ১। জাতীয় পরিচয়পত্রধারীর তথ্য
              </h5>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  (ক) আবেদনকারীর নাম *
                </label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('applicantName', val);
                    if (!formData.applicantSignName) updateField('applicantSignName', val);
                  }}
                  placeholder="যেমন: মো: তানভীর আহমেদ"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  (খ) জাতীয় পরিচিতি নম্বর (NID) *
                </label>
                <input
                  type="text"
                  value={formData.applicantNid}
                  onChange={(e) => updateField('applicantNid', e.target.value)}
                  placeholder="১০, ১৩ বা ১৭ ডিজিটের এনআইডি নম্বর"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ক্রমিক নম্বর (অফিস কর্তৃক পূরণীয় বা রেফারেন্স)
                </label>
                <input
                  type="text"
                  value={formData.serialNo}
                  onChange={(e) => {
                    updateField('serialNo', e.target.value);
                    updateField('receiptSerialNo', e.target.value);
                  }}
                  placeholder="যেমন: EC-DH-২০২৬/৮৮৪"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* ২। অভিভাবকের তথ্য (প্রযোজ্য ক্ষেত্রে) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-800">
                  ২। অভিভাবকের তথ্য (১৮ বছরের কম বা বিশেষ ক্ষেত্রে)
                </h5>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasGuardian}
                    onChange={(e) => updateField('hasGuardian', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>প্রযোজ্য</span>
                </label>
              </div>

              {formData.hasGuardian && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      (ক) আইনানুগ অভিভাবকের নাম
                    </label>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => updateField('guardianName', e.target.value)}
                      placeholder="অভিভাবকের পূর্ণ নাম"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      (খ) অভিভাবকের NID
                    </label>
                    <input
                      type="text"
                      value={formData.guardianNid}
                      onChange={(e) => updateField('guardianNid', e.target.value)}
                      placeholder="অভিভাবকের জাতীয় পরিচয়পত্র নম্বর"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ৩। সংশোধনের বিবরণী (৪-কলাম টেবিল) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                  ৩। যে যে তথ্য সংশোধন করিতে হইবে
                </h5>
                <span className="text-[10px] text-slate-500 font-bold">
                  যে বিষয়গুলো পরিবর্তন করবেন তাতে টিক দিন
                </span>
              </div>

              <div className="space-y-3">
                {formData.corrections.map((row, idx) => (
                  <div
                    key={row.key}
                    className={`p-3 rounded-2xl border transition ${
                      row.selected
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'border-slate-200 bg-slate-50/50 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={(e) => updateCorrectionRow(idx, { selected: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-bold text-slate-800">{row.label}</span>
                      </label>
                      {row.selected && (
                        <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full">
                          সংশোধন নির্বাচিত
                        </span>
                      )}
                    </div>

                    {row.selected && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/70 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            বর্তমানে বিদ্যমান ভুল তথ্য
                          </label>
                          <input
                            type="text"
                            value={row.currentValue}
                            onChange={(e) => updateCorrectionRow(idx, { currentValue: e.target.value })}
                            placeholder="যেমন বর্তমানে যা লেখা আছে"
                            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-emerald-700 mb-0.5">
                            চাহিত সঠিক / সংশোধিত তথ্য *
                          </label>
                          <input
                            type="text"
                            value={row.desiredValue}
                            onChange={(e) => updateCorrectionRow(idx, { desiredValue: e.target.value })}
                            placeholder="সংশোধনের পর যা হবে"
                            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            সংযুক্ত দলিলাদি বা প্রমাণের বিবরণ
                          </label>
                          <input
                            type="text"
                            value={row.attachedDoc}
                            onChange={(e) => updateCorrectionRow(idx, { attachedDoc: e.target.value })}
                            placeholder="যেমন: এসএসসি সনদ, জন্ম নিবন্ধন সনদ, পাসপোর্ট ইত্যাদি"
                            className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ৪, ৫, ৬। ফি ও সংযুক্ত দলিল */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-800">
                ৪, ৫ ও ৬। জমাকৃত ফি ও সংযুক্ত দলিলের বিবরণ
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ৪। জমাকৃত ফি এর পরিমাণ *
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
                    ৫। ফি জমা দানের রসিদ / ট্রানজেকশন *
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
                  ৬। আবেদনপত্রের সহিত সংযুক্ত দলিলাদির তালিকা *
                </label>
                <textarea
                  rows={2}
                  value={formData.attachedDocuments}
                  onChange={(e) => updateField('attachedDocuments', e.target.value)}
                  placeholder="যেমন: ১. এসএসসি সনদ, ২. অনলাইন জন্ম নিবন্ধন, ৩. চালান কপি"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* আবেদনকারীর স্বাক্ষর ও যোগাযোগের তথ্য */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-800">
                আবেদনকারীর স্বাক্ষর ও ঠিকানা
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    আবেদনকারীর নাম (স্বাক্ষরের স্থলে)
                  </label>
                  <input
                    type="text"
                    value={formData.applicantSignName}
                    onChange={(e) => updateField('applicantSignName', e.target.value)}
                    placeholder="পূর্ণ নাম"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    value={formData.applicantMobile}
                    onChange={(e) => updateField('applicantMobile', e.target.value)}
                    placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    যোগাযোগের পূর্ণ ঠিকানা
                  </label>
                  <input
                    type="text"
                    value={formData.applicantAddress}
                    onChange={(e) => updateField('applicantAddress', e.target.value)}
                    placeholder="বর্তমান বা স্থায়ী ঠিকানা"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ই-মেইল (যদি থাকে)
                  </label>
                  <input
                    type="email"
                    value={formData.applicantEmail}
                    onChange={(e) => updateField('applicantEmail', e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* অংশ - খ (রসিদ অংশ) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-800">
                অংশ - খ (জাতীয় পরিচয়পত্র প্রদানের রসিদ)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    আবেদনের তারিখ *
                  </label>
                  <input
                    type="text"
                    value={formData.receiptApplicationDate}
                    onChange={(e) => updateField('receiptApplicationDate', e.target.value)}
                    placeholder="যেমন: ২৮/১০/২০২৬"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    পরবর্তী যোগাযোগের তারিখ
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

        {/* RIGHT COLUMN: Official Authentic Document Preview */}
        <div
          className={`lg:col-span-7 space-y-3 ${
            activeTab === 'edit' ? 'hidden sm:hidden lg:block' : 'block'
          }`}
        >
          {/* Zoom & Quick Preview Toolbar */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">জুম স্কেল:</span>
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
                className="text-[11px] font-bold text-emerald-700 hover:underline ml-1"
              >
                রিসেট
              </button>
            </div>

            <div className="text-[11px] font-extrabold text-slate-500">
              A4 স্ট্যান্ডার্ড লিগ্যাল ফরম্যাট
            </div>
          </div>

          {/* DOCUMENT WRAPPER (Strict A4 Paper Replica) */}
          <div className="overflow-x-auto flex justify-center pb-6">
            <div
              ref={previewRef}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
              className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-xl border border-slate-300 p-[12mm] sm:p-[14mm] font-serif leading-relaxed text-[12.5px] print:m-0 print:p-[10mm] print:shadow-none print:border-none print:w-full print:scale-100"
            >
              {/* Top Header */}
              <div className="text-center space-y-0.5 mb-3">
                <h4 className="text-[14px] font-black tracking-wide">বাংলাদেশ নির্বাচন কমিশন</h4>
                <div className="text-[16px] font-black underline tracking-tight">ফরম-২</div>
                <div className="text-[12px] font-bold">[প্রবিধান ৪ দ্রষ্টব্য]</div>
                <h3 className="text-[15px] font-black tracking-tight pt-1">
                  জাতীয় পরিচয়পত্র বা তথ্য-উপাত্ত সংশোধনের আবেদন
                </h3>
              </div>

              {/* Serial No Right-Aligned */}
              <div className="flex justify-end text-[12px] mb-3">
                <div>
                  <span className="font-bold">ক্রমিক নম্বর : </span>
                  <span className="font-mono font-bold border-b border-dotted border-slate-900 px-2 min-w-[120px] inline-block text-center">
                    {formData.serialNo || '..............................'}
                  </span>
                  <span className="text-[11px] ml-1">(অফিস কর্তৃক পূরণীয়)</span>
                </div>
              </div>

              {/* ১। জাতীয় পরিচয়পত্রধারীর */}
              <div className="space-y-1.5 mb-2.5">
                <div className="font-bold">১। জাতীয় পরিচয়পত্রধারীর-</div>
                <div className="pl-5 flex items-baseline">
                  <span className="w-24 shrink-0 font-medium">(ক) নাম</span>
                  <span className="mr-1">:</span>
                  <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5 min-h-[18px]">
                    {formData.applicantName || '........................................................................................................'}
                  </span>
                </div>
                <div className="pl-5 flex items-baseline">
                  <span className="w-24 shrink-0 font-medium">(খ) জাতীয় পরিচিতি নম্বর (NID)</span>
                  <span className="mr-1">:</span>
                  <span className="flex-1 font-mono font-bold tracking-wider border-b border-dotted border-slate-900 pb-0.5 min-h-[18px]">
                    {formData.applicantNid || '...........................................................................'}
                  </span>
                </div>
              </div>

              {/* ২। অভিভাবকের তথ্য */}
              <div className="space-y-1.5 mb-3">
                <div className="text-justify leading-snug">
                  <span className="font-bold">২। আঠারো বৎসরের কম বয়স্ক/আদালত কর্তৃক অপ্রকৃতিস্থ ঘোষিত জাতীয় পরিচয়পত্রধারীর ক্ষেত্রে, আইনানুগ অভিভাবকের -</span>
                </div>
                <div className="pl-5 flex items-baseline">
                  <span className="w-24 shrink-0 font-medium">(ক) নাম</span>
                  <span className="mr-1">:</span>
                  <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5 min-h-[18px]">
                    {formData.hasGuardian && formData.guardianName ? formData.guardianName : '........................................................................................................'}
                  </span>
                </div>
                <div className="pl-5 flex items-baseline">
                  <span className="w-24 shrink-0 font-medium">(খ) জাতীয় পরিচিতি নম্বর (NID)</span>
                  <span className="mr-1">:</span>
                  <span className="flex-1 font-mono font-bold tracking-wider border-b border-dotted border-slate-900 pb-0.5 min-h-[18px]">
                    {formData.hasGuardian && formData.guardianNid ? formData.guardianNid : '...........................................................................'}
                  </span>
                </div>
              </div>

              {/* ৩। সংশোধন ছক (৪ কলাম) */}
              <div className="space-y-1 mb-3">
                <div className="font-bold">
                  ৩। জাতীয় পরিচয়পত্র বা সংরক্ষিত তথ্য-উপাত্তে যে তথ্য সংশোধন করিতে হইবে (অপ্রয়োজনীয় অংশ কাটিয়া দিন):
                </div>

                <table className="w-full border-collapse border border-slate-900 text-[11.5px] leading-tight">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-slate-900 p-1.5 w-[22%]">বিষয়</th>
                      <th className="border border-slate-900 p-1.5 w-[28%]">
                        বর্তমানে জাতীয় পরিচয়পত্রে বা সংরক্ষিত তথ্য উপাত্তে বিদ্যমান তথ্য
                      </th>
                      <th className="border border-slate-900 p-1.5 w-[28%]">
                        চাহিত সংশোধিত তথ্য
                      </th>
                      <th className="border border-slate-900 p-1.5 w-[22%]">
                        সংযুক্ত দলিলাদি/মন্তব্য
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.corrections.map((row) => (
                      <tr key={row.key} className="align-top">
                        <td className="border border-slate-900 p-1 font-bold">
                          {row.label}
                        </td>
                        <td className="border border-slate-900 p-1 text-center">
                          {row.selected && row.currentValue ? (
                            <span className="text-slate-800">{row.currentValue}</span>
                          ) : (
                            <span className="text-slate-300 select-none">-</span>
                          )}
                        </td>
                        <td className="border border-slate-900 p-1 text-center bg-emerald-50/20">
                          {row.selected && row.desiredValue ? (
                            <span className="font-bold text-slate-900">{row.desiredValue}</span>
                          ) : (
                            <span className="text-slate-300 select-none">-</span>
                          )}
                        </td>
                        <td className="border border-slate-900 p-1 text-[10.5px]">
                          {row.selected && row.attachedDoc ? (
                            <span>{row.attachedDoc}</span>
                          ) : (
                            <span className="text-slate-300 select-none">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ৪, ৫ ও ৬ */}
              <div className="space-y-1.5 mb-4 text-[12px]">
                <div className="flex items-baseline">
                  <span className="shrink-0 font-bold">
                    ৪। জমাকৃত ফি এর পরিমাণ (১১ এর উপ-প্রবিধান (১) এর ক্রমিক নং ১ বা, প্রযোজ্য ক্ষেত্রে, ২ এ উল্লিখিত ফি অনুসারে):
                  </span>
                  <span className="flex-1 font-bold border-b border-dotted border-slate-900 ml-1 pb-0.5">
                    {formData.feeAmount || '...................................................'}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="shrink-0 font-bold">৫। প্রযোজ্য ক্ষেত্রে ফি জমা দানের রশিদ :</span>
                  <span className="flex-1 font-medium border-b border-dotted border-slate-900 ml-1 pb-0.5">
                    {formData.feeReceiptNo || '................................................................................................'}
                  </span>
                </div>

                <div className="flex items-baseline">
                  <span className="shrink-0 font-bold">৬। আবেদনপত্রের সহিত সংযুক্ত দলিলাদির বিবরণ:</span>
                  <span className="flex-1 font-medium border-b border-dotted border-slate-900 ml-1 pb-0.5">
                    {formData.attachedDocuments || '...........................................................................................'}
                  </span>
                </div>
              </div>

              {/* Signatures Dual Columns */}
              <div className="grid grid-cols-2 gap-6 pt-3 mb-4 text-[11.5px] leading-snug">
                {/* Left: Guardian Signature */}
                <div className="space-y-1 border-t border-dashed border-slate-400 pt-1">
                  <div className="font-bold">আইনানুগ অভিভাবকের স্বাক্ষর/টিপসহি (প্রযোজ্য ক্ষেত্রে)</div>
                  <div>
                    <span className="font-medium">নামঃ </span>
                    <span className="font-bold border-b border-dotted border-slate-800 pb-0.5">
                      {formData.hasGuardian && formData.guardianSignName ? formData.guardianSignName : '.....................................................'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ঠিকানাঃ </span>
                    <span className="border-b border-dotted border-slate-800 pb-0.5">
                      {formData.hasGuardian && formData.guardianAddress ? formData.guardianAddress : '...................................................'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">মোবাইল নম্বরঃ </span>
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
                <div className="space-y-1 border-t border-dashed border-slate-400 pt-1">
                  <div className="font-bold">আবেদনকারীর স্বাক্ষর/টিপসহি</div>
                  <div>
                    <span className="font-medium">নামঃ </span>
                    <span className="font-bold border-b border-dotted border-slate-800 pb-0.5">
                      {formData.applicantSignName || formData.applicantName || '.....................................................'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ঠিকানাঃ </span>
                    <span className="border-b border-dotted border-slate-800 pb-0.5">
                      {formData.applicantAddress || '...................................................'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">মোবাইল নম্বরঃ </span>
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

              {/* Perforated Dotted Tear Line */}
              <div className="relative my-4 border-t-2 border-dashed border-slate-400 flex items-center justify-center">
                <span className="absolute bg-white px-3 text-[10px] text-slate-500 font-sans flex items-center gap-1">
                  ✂️ অংশ কাটার লাইন (রসিদ অংশ পৃথক করুন)
                </span>
              </div>

              {/* অংশ - খ (ফরম-২) জাতীয় পরিচয়পত্র প্রদানের রসিদ */}
              <div className="pt-2 text-[12px] leading-snug">
                <div className="text-center mb-2">
                  <div className="font-bold">অংশ - খ (ফরম-২)</div>
                  <div className="font-black text-[13px] underline">জাতীয় পরিচয়পত্র প্রদানের রসিদ</div>
                  <div className="text-[11px] font-bold">[প্রবিধান ৪ (৪) (খ) দ্রষ্টব্য]</div>
                </div>

                <div className="flex justify-end text-[11.5px] mb-2">
                  <div>
                    <span className="font-bold">ক্রমিক নম্বর : </span>
                    <span className="font-mono font-bold border-b border-dotted border-slate-900 px-2 min-w-[100px] inline-block text-center">
                      {formData.receiptSerialNo || formData.serialNo || '..............................'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pl-2">
                  <div className="flex items-baseline">
                    <span className="w-80 shrink-0 font-medium">
                      (১) আবেদনকারীর নাম এবং জাতীয় পরিচিতি নম্বর
                    </span>
                    <span className="mr-1">:</span>
                    <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5">
                      {formData.applicantName ? `${formData.applicantName} (${formData.applicantNid || ''})` : '.......................................................................'}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="w-80 shrink-0 font-medium">
                      (২) প্রযোজ্য ক্ষেত্রে, আইনানুগ অভিভাবকের নাম এবং জাতীয় পরিচিতি নম্বর
                    </span>
                    <span className="mr-1">:</span>
                    <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5">
                      {formData.hasGuardian && formData.guardianName ? `${formData.guardianName} (${formData.guardianNid || ''})` : '.......................................................................'}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="w-80 shrink-0 font-medium">(৩) আবেদনের তারিখ</span>
                    <span className="mr-1">:</span>
                    <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5">
                      {formData.receiptApplicationDate || '...............................................................................'}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="w-80 shrink-0 font-medium">
                      (৪) পরবর্তী যোগাযোগের তারিখ/জাতীয় পরিচয়পত্র প্রদানের তারিখ
                    </span>
                    <span className="mr-1">:</span>
                    <span className="flex-1 font-bold border-b border-dotted border-slate-900 pb-0.5">
                      {formData.receiptNextContactDate || '.......................................................................'}
                    </span>
                  </div>
                </div>

                {/* Bottom Signature & Seal */}
                <div className="flex justify-between items-end pt-8 px-6 text-[11.5px]">
                  <div className="text-center font-bold text-slate-500">
                    (সিলমোহর)
                  </div>
                  <div className="text-center border-t border-dashed border-slate-800 pt-1 font-bold">
                    দায়িত্বপ্রাপ্ত কর্মকর্তার স্বাক্ষর
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
        documentTitle="ফরম ২ সংশোধন এর ফরম ফিলাপ"
        documentTypeTag="জাতীয় পরিচয়পত্র সংশোধন আবেদন (A4 ফরম)"
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
