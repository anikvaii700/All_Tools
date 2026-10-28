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
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface VoterTransferFormProps {
  onBackToHub: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export interface Form13Data {
  // প্রাপক
  officeUpazila: string;
  officeDistrict: string;

  // ১, ২, ৩
  applicantName: string;
  nidNumber: string;
  dob: string;

  // ৪। বর্তমান তালিকাভুক্তি সংক্রান্ত তথ্যাদি
  currentVoterNo: string;
  currentAreaName: string;
  currentAreaNo: string;
  currentUpazila: string;
  currentDistrict: string;
  currentVillageRoad: string;
  currentHoldingNo: string;

  // ৫। যে এলাকায় স্থানান্তর হইতে ইচ্ছুক
  destDistrict: string;
  destUpazila: string;
  destLocalBody: string;
  destWardNo: string;
  destAreaName: string;
  destAreaNo: string;
  destVillageRoad: string;
  destHoldingNo: string;
  destPhone: string;
  destPostOffice: string;
  destPostCode: string;

  // ৬ ও ৭
  residenceDuration: string;
  transferReason: string;

  // পৃষ্ঠা ২: আবেদনকারীর স্বাক্ষর
  applicantSignatureText: string;

  // আবেদনকারীকে সনাক্তকারীর
  identifierSignatureText: string;
  identifierName: string;
  identifierNid: string;
  identifierAddress: string;

  // কেবলমাত্র অফিসে ব্যবহারের জন্য
  officialCutArea: string;
  officialIncludeArea: string;

  // প্রাপ্তিস্বীকার পত্র
  receiptApplicantName: string;
  receiptFormNo: string;
}

const INITIAL_EMPTY_DATA: Form13Data = {
  officeUpazila: '',
  officeDistrict: '',

  applicantName: '',
  nidNumber: '',
  dob: '',

  currentVoterNo: '',
  currentAreaName: '',
  currentAreaNo: '',
  currentUpazila: '',
  currentDistrict: '',
  currentVillageRoad: '',
  currentHoldingNo: '',

  destDistrict: '',
  destUpazila: '',
  destLocalBody: '',
  destWardNo: '',
  destAreaName: '',
  destAreaNo: '',
  destVillageRoad: '',
  destHoldingNo: '',
  destPhone: '',
  destPostOffice: '',
  destPostCode: '',

  residenceDuration: '',
  transferReason: '',

  applicantSignatureText: '',
  identifierSignatureText: '',
  identifierName: '',
  identifierNid: '',
  identifierAddress: '',

  officialCutArea: '',
  officialIncludeArea: '',

  receiptApplicantName: '',
  receiptFormNo: '',
};

const SAMPLE_DATA: Form13Data = {
  officeUpazila: 'মিরপুর',
  officeDistrict: 'ঢাকা',

  applicantName: 'মোঃ মোফাসসিরুল ইসলাম',
  nidNumber: '১৯৯৪২৬১২২৩০০০০৫৬৭',
  dob: '১২/০৪/১৯৯৪',

  currentVoterNo: '২৬১২১২০০৪৫',
  currentAreaName: 'সৈয়দপুর পৌরসভা ০১ নং ওয়ার্ড',
  currentAreaNo: '০১০২',
  currentUpazila: 'সৈয়দপুর',
  currentDistrict: 'নীলফামারী',
  currentVillageRoad: 'রেলওয়ে কলোনি রোড',
  currentHoldingNo: '১২/বি',

  destDistrict: 'ঢাকা',
  destUpazila: 'মিরপুর',
  destLocalBody: 'ঢাকা উত্তর সিটি কর্পোরেশন',
  destWardNo: '১২',
  destAreaName: 'দক্ষিণ পাইকপাড়া ও মধ্য পাইকপাড়া',
  destAreaNo: '১২০৫',
  destVillageRoad: 'পাইকপাড়া প্রধান সড়ক, লেন-৪',
  destHoldingNo: '১৪৫/২-এ',
  destPhone: '০১৭xxxxxxxx',
  destPostOffice: 'মিরপুর',
  destPostCode: '১২১৬',

  residenceDuration: '২ বছর ৬ মাস',
  transferReason: 'স্থায়ীভাবে পরিবারসহ বাসা পরিবর্তন ও বসবাস',

  applicantSignatureText: 'মোফাসসিরুল ইসলাম',
  identifierSignatureText: '',
  identifierName: 'আলহাজ্ব মোঃ রফিকুল হাসান',
  identifierNid: '১৯৭৫২৬১২২৮০০০০৭৮৯',
  identifierAddress: '১২ নং ওয়ার্ড কার্যালয়, পাইকপাড়া, মিরপুর, ঢাকা',

  officialCutArea: '',
  officialIncludeArea: '',

  receiptApplicantName: 'মোঃ মোফাসসিরুল ইসলাম',
  receiptFormNo: '',
};

export const VoterTransferForm: React.FC<VoterTransferFormProps> = ({
  onBackToHub,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<Form13Data>(SAMPLE_DATA);
  const [activePage, setActivePage] = useState<'both' | 'page1' | 'page2'>('both');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  // Field change handler
  const handleInputChange = (field: keyof Form13Data, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-sync receipt applicant name if not manually decoupled
      if (field === 'applicantName' && (!prev.receiptApplicantName || prev.receiptApplicantName === prev.applicantName)) {
        updated.receiptApplicantName = value;
      }
      return updated;
    });
  };

  // Validation function
  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.applicantName.trim()) errors.push('১। আবেদনকারীর নাম লিখুন।');
    if (!formData.nidNumber.trim()) errors.push('২। জাতীয় পরিচয়পত্র নম্বর (NID) লিখুন।');
    if (!formData.dob.trim()) errors.push('৩। জন্ম তারিখ লিখুন।');
    if (!formData.officeUpazila.trim()) errors.push('প্রাপক উপজেলা/থানার নাম লিখুন।');
    if (!formData.officeDistrict.trim()) errors.push('প্রাপক জেলার নাম লিখুন।');
    if (!formData.destDistrict.trim()) errors.push('৫। গন্তব্য জেলা লিখুন।');
    if (!formData.destUpazila.trim()) errors.push('৫। গন্তব্য উপজেলা/থানা লিখুন।');
    if (!formData.destAreaName.trim()) errors.push('৫। যে এলাকায় স্থানান্তর হতে ইচ্ছুক তার ভোটার এলাকার নাম লিখুন।');
    if (!formData.destPhone.trim()) errors.push('৫। টেলিফোন/মোবাইল ফোন নম্বর লিখুন।');

    return errors;
  };

  const handleValidateClick = () => {
    const errors = validateForm();
    setShowValidationModal(true);
    if (errors.length === 0) {
      onShowToast('✅ ফরম-১৩ এর সকল আবশ্যকীয় তথ্য সঠিকভাবে পূরণ করা হয়েছে!', '🎉');
    } else {
      onShowToast(`⚠️ ${errors.length}টি আবশ্যক তথ্য এখনও খালি রয়েছে।`, '🔔');
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Export Handler using html2canvas and jsPDF
  const handleDownloadPdf = async () => {
    if (!page1Ref.current || !page2Ref.current) {
      onShowToast('ফরম লোড হওয়া পর্যন্ত অপেক্ষা করুন', '⚠️');
      return;
    }

    setIsGeneratingPdf(true);
    onShowToast('হুবহু ফরম-১৩ অনুযায়ী ২ পৃষ্ঠার A4 PDF প্রস্তুত হচ্ছে... ⏳', '📄');

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Render Page 1
      const canvas1 = await html2canvas(page1Ref.current, {
        scale: 2.2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (_clonedDoc, clonedEl) => {
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.border = 'none';
        },
      });
      const imgData1 = canvas1.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData1, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      // Add Page 2
      pdf.addPage();
      const canvas2 = await html2canvas(page2Ref.current, {
        scale: 2.2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (_clonedDoc, clonedEl) => {
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.border = 'none';
        },
      });
      const imgData2 = canvas2.toDataURL('image/jpeg', 0.98);
      pdf.addImage(imgData2, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      const fileName = `Form-13-${formData.applicantName ? formData.applicantName.replace(/\s+/g, '_') : 'Voter-Transfer'}.pdf`;
      pdf.save(fileName);

      onShowToast('সফলভাবে Form-13.pdf ডাউনলোড হয়েছে! 🎉', '✅');
    } catch (err) {
      console.error('PDF generation error', err);
      onShowToast('PDF তৈরিতে সমস্যা হয়েছে। প্রিন্ট বাটন ব্যবহার করুন।', '❌');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleResetForm = () => {
    setFormData(INITIAL_EMPTY_DATA);
    setShowResetConfirm(false);
    onShowToast('সকল তথ্য মুছে নতুন ফরম প্রস্তুত করা হয়েছে।', '🔄');
  };

  const handleLoadSample = () => {
    setFormData(SAMPLE_DATA);
    onShowToast('নমুনা তথ্য সফলভাবে লোড করা হয়েছে!', '📝');
  };

  // Helper for 4-digit post code display boxes
  const postCodeDigits = (formData.destPostCode || '').slice(0, 4).padEnd(4, ' ').split('');

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 pb-16 font-sans">
      {/* Top Banner & Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
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
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    ফরম-১৩ (ভোটার স্থানান্তর ফরম ফিলাপ)
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                    হুবহু Form-13.pdf
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  [বিধি ২৬(৭) দ্রষ্টব্য] এক ভোটার এলাকা হইতে অন্য ভোটার এলাকায় ভোটার স্থানান্তরের আবেদন
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleValidateClick}
              className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>তথ্য যাচাই করুন</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট করুন</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-200 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
              title="সব তথ্য মুছুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="md:hidden flex border-t border-slate-200">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
              mobileTab === 'form'
                ? 'border-slate-900 text-slate-900 bg-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            ✏️ তথ্য পূরণ করুন
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition ${
              mobileTab === 'preview'
                ? 'border-slate-900 text-slate-900 bg-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            📄 হুবহু ২-পৃষ্ঠা প্রিভিউ
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="max-w-7xl mx-auto px-4 pt-4 print:hidden">
        <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-3 shadow-2xs">
          <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>অফিসিয়াল টেমপ্লেট গাইড:</strong> এই ফরমটি হুবহু নির্বাচন কমিশনের <strong>Form-13.pdf</strong> অনুযায়ী তৈরি। আপনার দেওয়া তথ্য সরাসরি মূল ফরমের ডটেড লাইনের ওপর বসে যায়। ১০০% ব্রাউজার প্রসেসিং — কোনো তথ্য সার্ভারে পাঠানো হয় না।
          </div>
        </div>
      </div>

      {/* Main Workspace: Split Screen on Desktop */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Form Controls */}
        <div
          className={`md:col-span-5 lg:col-span-5 space-y-4 print:hidden ${
            mobileTab === 'preview' ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Quick Helper card */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-black text-slate-900">নমুনা তথ্য দিয়ে দেখা</h3>
              <p className="text-[11px] text-slate-500">এক ক্লিকে ডেমো তথ্য বসিয়ে ফরমটি পরখ করুন</p>
            </div>
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>নমুনা তথ্য লোড</span>
            </button>
          </div>

          {/* Section: প্রাপক */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-100">
              প্রাপক : উপজেলা/থানা নির্বাচন অফিসার
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">উপজেলা/থানা *</label>
                <input
                  type="text"
                  value={formData.officeUpazila}
                  onChange={(e) => handleInputChange('officeUpazila', e.target.value)}
                  placeholder="যেমন: মিরপুর / সদর"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">জেলা *</label>
                <input
                  type="text"
                  value={formData.officeDistrict}
                  onChange={(e) => handleInputChange('officeDistrict', e.target.value)}
                  placeholder="যেমন: ঢাকা / নীলফামারী"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section: ১, ২, ৩ */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-100">
              ১, ২ ও ৩ নম্বর ক্রমিক
            </h2>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ১। আবেদনকারীর নাম : *
                </label>
                <input
                  type="text"
                  value={formData.applicantName}
                  onChange={(e) => handleInputChange('applicantName', e.target.value)}
                  placeholder="পূর্ণ নাম লিখুন"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ২। জাতীয় পরিচয়পত্র নম্বর (NID) : *
                </label>
                <input
                  type="text"
                  value={formData.nidNumber}
                  onChange={(e) => handleInputChange('nidNumber', e.target.value)}
                  placeholder="১০, ১৩ বা ১৭ সংখ্যার NID"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block italic">
                  (জাতীয় পরিচয়পত্রের ছায়ালিপি সংযুক্ত করিতে হইবে)
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ৩। জন্ম তারিখ : *
                </label>
                <input
                  type="text"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  placeholder="যেমন: ১২/০৪/১৯৯৪"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section: ৪। বর্তমান তালিকাভুক্তি সংক্রান্ত তথ্যাদি */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-100">
              ৪। বর্তমান তালিকাভুক্তি সংক্রান্ত তথ্যাদি
            </h2>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ভোটার নম্বর :</label>
                <input
                  type="text"
                  value={formData.currentVoterNo}
                  onChange={(e) => handleInputChange('currentVoterNo', e.target.value)}
                  placeholder="ভোটার নম্বর"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ভোটার এলাকার নাম:</label>
                  <input
                    type="text"
                    value={formData.currentAreaName}
                    onChange={(e) => handleInputChange('currentAreaName', e.target.value)}
                    placeholder="বর্তমান এলাকার নাম"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ভোটার এলাকার নম্বর :</label>
                  <input
                    type="text"
                    value={formData.currentAreaNo}
                    onChange={(e) => handleInputChange('currentAreaNo', e.target.value)}
                    placeholder="এলাকা নং"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">উপজেলা/থানা :</label>
                  <input
                    type="text"
                    value={formData.currentUpazila}
                    onChange={(e) => handleInputChange('currentUpazila', e.target.value)}
                    placeholder="উপজেলা/থানা"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">জেলা :</label>
                  <input
                    type="text"
                    value={formData.currentDistrict}
                    onChange={(e) => handleInputChange('currentDistrict', e.target.value)}
                    placeholder="জেলা"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">গ্রাম/রাস্তার নাম ও নম্বর :</label>
                  <input
                    type="text"
                    value={formData.currentVillageRoad}
                    onChange={(e) => handleInputChange('currentVillageRoad', e.target.value)}
                    placeholder="গ্রাম বা রাস্তা"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">বাসা/হোল্ডিং নম্বর :</label>
                  <input
                    type="text"
                    value={formData.currentHoldingNo}
                    onChange={(e) => handleInputChange('currentHoldingNo', e.target.value)}
                    placeholder="বাসা নং"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: ৫। যে এলাকায় স্থানান্তর হইতে ইচ্ছুক */}
          <div className="bg-white p-4 rounded-3xl border border-slate-300 shadow-xs space-y-3">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-100">
              ৫। যে এলাকায় স্থানান্তর হইতে ইচ্ছুক-
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">জেলা : *</label>
                  <input
                    type="text"
                    value={formData.destDistrict}
                    onChange={(e) => handleInputChange('destDistrict', e.target.value)}
                    placeholder="গন্তব্য জেলা"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">উপজেলা/থানা : *</label>
                  <input
                    type="text"
                    value={formData.destUpazila}
                    onChange={(e) => handleInputChange('destUpazila', e.target.value)}
                    placeholder="গন্তব্য উপজেলা/থানা"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">সিটি কর্পোরেশন/পৌরসভা/ইউনিয়ন/ক্যান্ট: বোর্ড :</label>
                  <input
                    type="text"
                    value={formData.destLocalBody}
                    onChange={(e) => handleInputChange('destLocalBody', e.target.value)}
                    placeholder="যেমন: ডিএনসিসি / পৌরসভা / ইউনিয়ন"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ওয়ার্ড নম্বর :</label>
                  <input
                    type="text"
                    value={formData.destWardNo}
                    onChange={(e) => handleInputChange('destWardNo', e.target.value)}
                    placeholder="যেমন: ১২"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ভোটার এলাকার নাম : *</label>
                  <input
                    type="text"
                    value={formData.destAreaName}
                    onChange={(e) => handleInputChange('destAreaName', e.target.value)}
                    placeholder="ভোটার এলাকার নাম"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ভোটার এলাকার নম্বর :</label>
                  <input
                    type="text"
                    value={formData.destAreaNo}
                    onChange={(e) => handleInputChange('destAreaNo', e.target.value)}
                    placeholder="এলাকা নং"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">গ্রাম/রাস্তার নাম ও নম্বর :</label>
                  <input
                    type="text"
                    value={formData.destVillageRoad}
                    onChange={(e) => handleInputChange('destVillageRoad', e.target.value)}
                    placeholder="গ্রাম বা রাস্তা"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">বাসা/হোল্ডিং নম্বর :</label>
                  <input
                    type="text"
                    value={formData.destHoldingNo}
                    onChange={(e) => handleInputChange('destHoldingNo', e.target.value)}
                    placeholder="বাসা নং"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">টেলিফোন/মোবাইল ফোন নম্বর : *</label>
                <input
                  type="text"
                  value={formData.destPhone}
                  onChange={(e) => handleInputChange('destPhone', e.target.value)}
                  placeholder="০১xxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">ডাকঘর :</label>
                  <input
                    type="text"
                    value={formData.destPostOffice}
                    onChange={(e) => handleInputChange('destPostOffice', e.target.value)}
                    placeholder="ডাকঘর"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">পোস্ট কোড : (৪ ডিজিট)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.destPostCode}
                    onChange={(e) => handleInputChange('destPostCode', e.target.value)}
                    placeholder="যেমন: ১২১৬"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono tracking-widest text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: ৬ ও ৭ */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-100">
              ৬ ও ৭ নম্বর ক্রমিক
            </h2>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ৬। ৫ নম্বর ক্রমিকে বর্ণিত ঠিকানায় যে সময় হইতে অবস্থান করিতেছেন :
                </label>
                <input
                  type="text"
                  value={formData.residenceDuration}
                  onChange={(e) => handleInputChange('residenceDuration', e.target.value)}
                  placeholder="যেমন: ২ বছর ৬ মাস"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ৭। স্থানান্তরের কারণ :
                </label>
                <input
                  type="text"
                  value={formData.transferReason}
                  onChange={(e) => handleInputChange('transferReason', e.target.value)}
                  placeholder="যেমন: বিবাহ / স্থায়ীভাবে বসবাস ও বাসা পরিবর্তন / চাকরি"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section: পৃষ্ঠা ২ এর স্বাক্ষর ও সনাক্তকারী */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-100">
              পৃষ্ঠা ২: আবেদনকারী ও সনাক্তকারীর তথ্য
            </h2>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  আবেদনকারীর স্বাক্ষর টেক্সট (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  value={formData.applicantSignatureText}
                  onChange={(e) => handleInputChange('applicantSignatureText', e.target.value)}
                  placeholder="হাতে স্বাক্ষরের জন্য খালি রাখতে পারেন"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-800 block">
                  আবেদনকারীকে সনাক্তকারীর তথ্য:
                </span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">নাম :</label>
                  <input
                    type="text"
                    value={formData.identifierName}
                    onChange={(e) => handleInputChange('identifierName', e.target.value)}
                    placeholder="সনাক্তকারীর নাম"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">জাতীয় পরিচয়পত্র নম্বর :</label>
                  <input
                    type="text"
                    value={formData.identifierNid}
                    onChange={(e) => handleInputChange('identifierNid', e.target.value)}
                    placeholder="সনাক্তকারীর NID"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">ঠিকানা :</label>
                  <input
                    type="text"
                    value={formData.identifierAddress}
                    onChange={(e) => handleInputChange('identifierAddress', e.target.value)}
                    placeholder="সনাক্তকারীর কার্যালয় / ঠিকানা"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Form Preview (A4 Dimensions) */}
        <div
          className={`md:col-span-7 lg:col-span-7 space-y-4 ${
            mobileTab === 'form' ? 'hidden md:block' : 'block'
          }`}
        >
          {/* Preview Controls Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1">পৃষ্ঠা:</span>
              <button
                type="button"
                onClick={() => setActivePage('both')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activePage === 'both'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                উভয় পৃষ্ঠা
              </button>
              <button
                type="button"
                onClick={() => setActivePage('page1')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activePage === 'page1'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ১ম পৃষ্ঠা
              </button>
              <button
                type="button"
                onClick={() => setActivePage('page2')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activePage === 'page2'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ২য় পৃষ্ঠা
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                title="জুম কমান"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-600 w-10 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                title="জুম বাড়ান"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition ml-1"
                title="রিসেট জুম"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Form Pages Container */}
          <div
            className="overflow-x-auto flex flex-col items-center gap-8 py-2"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {/* ======================================================== */}
            {/* PAGE 1: হুবহু Form-13.pdf এর ১ম পৃষ্ঠা */}
            {/* ======================================================== */}
            {(activePage === 'both' || activePage === 'page1') && (
              <div
                ref={page1Ref}
                id="form-page-1"
                className="w-[210mm] min-h-[297mm] px-[20mm] py-[18mm] relative box-border font-serif print:shadow-none print:border-none print:m-0 print:p-[12mm] print:w-full print:min-h-0 page-break-after"
                style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Header (হুবহু Form-13) */}
                <div className="text-center mb-6">
                  <div className="text-[14px] font-bold">ফরম-১৩</div>
                  <div className="text-[12.5px] font-bold">[বিধি ২৬(৭) দ্রষ্টব্য]</div>
                  <div className="text-[13px] font-bold mt-3">
                    এক ভোটার এলাকা হইতে অন্য ভোটার এলাকায় ভোটার স্থানান্তরের আবেদন
                  </div>
                </div>

                {/* প্রাপক (হুবহু Form-13) */}
                <div className="mb-5 text-[12.5px] leading-relaxed">
                  <div className="font-bold">প্রাপক :</div>
                  <div className="pl-6">
                    <div>উপজেলা/থানা নির্বাচন অফিসার</div>
                    <div>
                      উপজেলা/থানা
                      <span className="inline-block border-b border-dotted border-black px-2 min-w-[200px] text-black font-semibold">
                        {formData.officeUpazila || '...................................................'}
                      </span>
                    </div>
                    <div>
                      জেলা
                      <span className="inline-block border-b border-dotted border-black px-2 min-w-[240px] text-black font-semibold">
                        {formData.officeDistrict || '...........................................................'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ক্রমিক ১, ২, ৩ (হুবহু Form-13) */}
                <div className="space-y-2 text-[12.5px] mb-3">
                  <div className="flex items-baseline">
                    <span className="font-bold w-44 shrink-0">১। আবেদনকারীর নাম :</span>
                    <span className="flex-1 border-b border-dotted border-black px-1 text-black font-semibold break-words">
                      {formData.applicantName || '................................................................................................................................'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline">
                      <span className="font-bold w-64 shrink-0">২। জাতীয় পরিচয়পত্র নম্বর (NID) :</span>
                      <span className="flex-1 border-b border-dotted border-black px-1 font-mono font-bold tracking-wider text-black">
                        {formData.nidNumber || '............................................................................................................'}
                      </span>
                    </div>
                    <div className="text-right text-[11px] italic mt-0.5 pr-2">
                      (জাতীয় পরিচয়পত্রের ছায়ালিপি সংযুক্ত করিতে হইবে)
                    </div>
                  </div>

                  <div className="flex items-baseline">
                    <span className="font-bold w-36 shrink-0">৩। জন্ম তারিখ :</span>
                    <span className="flex-1 border-b border-dotted border-black px-1 text-black font-semibold">
                      {formData.dob || '......................................................................................................................................'}
                    </span>
                  </div>
                </div>

                {/* ৪। বর্তমান তালিকাভুক্তি সংক্রান্ত তথ্যাদি (হুবহু Form-13) */}
                <div className="mt-3 text-[12.5px]">
                  <div className="font-bold mb-1">৪। বর্তমান তালিকাভুক্তি সংক্রান্ত তথ্যাদি-</div>
                  <div className="pl-6 space-y-1.5">
                    <div className="flex items-baseline">
                      <span className="font-bold w-32 shrink-0">ভোটার নম্বর :</span>
                      <span className="flex-1 border-b border-dotted border-black px-1 font-mono font-bold">
                        {formData.currentVoterNo || '..........................................................................................................................'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex-1 flex items-baseline">
                        <span className="font-bold shrink-0">ভোটার এলাকার নাম:</span>
                        <span className="flex-1 border-b border-dotted border-black px-1 font-semibold truncate ml-1">
                          {formData.currentAreaName || '............................................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline shrink-0">
                        <span className="font-bold ml-2">ভোটার এলাকার নম্বর :</span>
                        <span className="border-b border-dotted border-black px-1 font-mono font-bold min-w-[100px] text-center ml-1">
                          {formData.currentAreaNo || '........................'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex-1 flex items-baseline">
                        <span className="font-bold shrink-0">উপজেলা/থানা :</span>
                        <span className="flex-1 border-b border-dotted border-black px-1 font-semibold truncate ml-1">
                          {formData.currentUpazila || '............................................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline shrink-0">
                        <span className="font-bold ml-2">জেলা :</span>
                        <span className="border-b border-dotted border-black px-1 font-semibold min-w-[120px] text-center ml-1">
                          {formData.currentDistrict || '................................'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex-1 flex items-baseline">
                        <span className="font-bold shrink-0">গ্রাম/রাস্তার নাম ও নম্বর :</span>
                        <span className="flex-1 border-b border-dotted border-black px-1 font-semibold truncate ml-1">
                          {formData.currentVillageRoad || '................................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline shrink-0">
                        <span className="font-bold ml-2">বাসা/হোল্ডিং নম্বর :</span>
                        <span className="border-b border-dotted border-black px-1 font-semibold min-w-[100px] text-center ml-1">
                          {formData.currentHoldingNo || '........................'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ৫। যে এলাকায় স্থানান্তর হইতে ইচ্ছুক (হুবহু Form-13) */}
                <div className="mt-3 text-[12.5px]">
                  <div className="font-bold mb-1">৫। যে এলাকায় স্থানান্তর হইতে ইচ্ছুক-</div>
                  <div className="pl-6 space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex-1 flex items-baseline">
                        <span className="font-bold shrink-0">জেলা :</span>
                        <span className="flex-1 border-b border-dotted border-black px-1 font-semibold truncate ml-1">
                          {formData.destDistrict || '............................................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline shrink-0">
                        <span className="font-bold ml-2">উপজেলা/থানা :</span>
                        <span className="border-b border-dotted border-black px-1 font-semibold min-w-[140px] text-center ml-1">
                          {formData.destUpazila || '....................................'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex-1 flex items-baseline">
                        <span className="font-bold shrink-0">সিটি কর্পোরেশন/পৌরসভা/ইউনিয়ন/ক্যান্ট: বোর্ড :</span>
                        <span className="flex-1 border-b border-dotted border-black px-1 font-semibold truncate ml-1">
                          {formData.destLocalBody || '....................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline shrink-0">
                        <span className="font-bold ml-2">ওয়ার্ড নম্বর :</span>
                        <span className="border-b border-dotted border-black px-1 font-semibold min-w-[70px] text-center ml-1">
                          {formData.destWardNo || '..........'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex-1 flex items-baseline">
                        <span className="font-bold shrink-0">ভোটার এলাকার নাম :</span>
                        <span className="flex-1 border-b border-dotted border-black px-1 font-semibold truncate ml-1">
                          {formData.destAreaName || '............................................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline shrink-0">
                        <span className="font-bold ml-2">ভোটার এলাকার নম্বর :</span>
                        <span className="border-b border-dotted border-black px-1 font-mono font-bold min-w-[100px] text-center ml-1">
                          {formData.destAreaNo || '........................'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex-1 flex items-baseline">
                        <span className="font-bold shrink-0">গ্রাম/রাস্তার নাম ও নম্বর :</span>
                        <span className="flex-1 border-b border-dotted border-black px-1 font-semibold truncate ml-1">
                          {formData.destVillageRoad || '................................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline shrink-0">
                        <span className="font-bold ml-2">বাসা/হোল্ডিং নম্বর :</span>
                        <span className="border-b border-dotted border-black px-1 font-semibold min-w-[100px] text-center ml-1">
                          {formData.destHoldingNo || '........................'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline">
                      <span className="font-bold w-52 shrink-0">টেলিফোন/মোবাইল ফোন নম্বর :</span>
                      <span className="flex-1 border-b border-dotted border-black px-1 font-mono font-bold text-black">
                        {formData.destPhone || '............................................................................................................'}
                      </span>
                    </div>

                    {/* ডাকঘর ও পোস্ট কোড বক্স [ ][ ][ ][ ] */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex-1 flex items-baseline">
                        <span className="font-bold shrink-0">ডাকঘর :</span>
                        <span className="flex-1 border-b border-dotted border-black px-1 font-semibold truncate ml-1">
                          {formData.destPostOffice || '........................................................................'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-4">
                        <span className="font-bold">পোস্ট কোড :</span>
                        <div className="flex border border-black">
                          {postCodeDigits.map((digit, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 border-r border-black last:border-r-0 flex items-center justify-center font-mono font-bold text-xs"
                            >
                              {digit !== ' ' ? digit : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ৬ ও ৭ নম্বর ক্রমিক (হুবহু Form-13) */}
                <div className="mt-4 space-y-2 text-[12.5px]">
                  <div className="flex items-baseline">
                    <span className="font-bold shrink-0">
                      ৬। ৫ নম্বর ক্রমিকে বর্ণিত ঠিকানায় যে সময় হইতে অবস্থান করিতেছেন :
                    </span>
                    <span className="flex-1 border-b border-dotted border-black px-1 font-semibold ml-1">
                      {formData.residenceDuration || '....................................................................................'}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="font-bold shrink-0">৭। স্থানান্তরের কারণ:</span>
                    <span className="flex-1 border-b border-dotted border-black px-1 font-semibold ml-1">
                      {formData.transferReason || '..................................................................................................................................'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* PAGE 2: হুবহু Form-13.pdf এর ২য় পৃষ্ঠা */}
            {/* ======================================================== */}
            {(activePage === 'both' || activePage === 'page2') && (
              <div
                ref={page2Ref}
                id="form-page-2"
                className="w-[210mm] min-h-[297mm] px-[20mm] py-[18mm] relative box-border font-serif print:shadow-none print:border-none print:m-0 print:p-[12mm] print:w-full print:min-h-0 page-break-before"
                style={{
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* ৮। ৫ নম্বর ক্রমিকে বর্ণিত ঠিকানায় অবস্থানের সমর্থনে নিম্নের দলিলাদি সংযুক্ত করিতে হইবে : */}
                <div className="text-[12.5px] mb-6">
                  <div className="font-bold mb-1">
                    ৮। ৫ নম্বর ক্রমিকে বর্ণিত ঠিকানায় অবস্থানের সমর্থনে নিম্নের দলিলাদি সংযুক্ত করিতে হইবে :
                  </div>
                  <div className="pl-6 space-y-1.5 leading-relaxed">
                    <div>
                      (ক) প্রথম শ্রেণীর কর্মকর্তা/ ক্যান্টনমেন্ট বোর্ডের এক্সিকিউটিভ অফিসার/ সিটি কর্পোরেশন/পৌরসভার মেয়র /ওয়ার্ড
                      কাউন্সিলর/ইউনিয়ন পরিষদ চেয়ারম্যান কর্তৃক প্রদত্ত প্রত্যয়ন পত্র।
                    </div>
                    <div>(খ) ইউটিলিটি বিলের অনুলিপি (যদি থাকে)</div>
                    <div>(গ) বাড়ী ভাড়া রশিদ/চৌকিদারী কর রশিদ/পৌরকর রশিদ/অন্যান্য</div>
                  </div>
                </div>

                {/* আবেদনকারীর স্বাক্ষর বা টিপসহি (ডানপাশে) */}
                <div className="flex justify-end mt-12 mb-10 pr-2">
                  <div className="text-center w-64">
                    <div className="h-6 border-b border-dotted border-black flex items-center justify-center font-bold text-xs">
                      {formData.applicantSignatureText || ''}
                    </div>
                    <div className="text-[12px] font-bold mt-1">
                      আবেদনকারীর স্বাক্ষর বা টিপসহি
                    </div>
                  </div>
                </div>

                {/* আবেদনকারীকে সনাক্তকারীর স্বাক্ষর : ... (মাঝখানে বিন্যস্ত) */}
                <div className="my-10 text-[12.5px] max-w-lg mx-auto space-y-1.5">
                  <div className="flex items-baseline">
                    <span className="font-bold w-64 text-right pr-2 shrink-0">
                      আবেদনকারীকে সনাক্তকারীর স্বাক্ষর :
                    </span>
                    <span className="flex-1 border-b border-dotted border-black px-1 font-bold">
                      {formData.identifierSignatureText || '.....................................................'}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="font-bold w-64 text-right pr-2 shrink-0">নাম :</span>
                    <span className="flex-1 border-b border-dotted border-black px-1 font-bold">
                      {formData.identifierName || '.....................................................'}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="font-bold w-64 text-right pr-2 shrink-0">জাতীয় পরিচয়পত্র নম্বর :</span>
                    <span className="flex-1 border-b border-dotted border-black px-1 font-mono font-bold">
                      {formData.identifierNid || '.....................................................'}
                    </span>
                  </div>

                  <div className="flex items-baseline">
                    <span className="font-bold w-64 text-right pr-2 shrink-0">ঠিকানা :</span>
                    <span className="flex-1 border-b border-dotted border-black px-1 font-semibold">
                      {formData.identifierAddress || '.....................................................'}
                    </span>
                  </div>
                </div>

                {/* [কেবলমাত্র অফিসে ব্যবহারের জন্য] */}
                <div className="mt-12 text-[12.5px]">
                  <div className="text-center font-bold mb-3">[কেবলমাত্র অফিসে ব্যবহারের জন্য]</div>

                  <div className="leading-relaxed">
                    দাখিলকৃত দলিলাদি পরীক্ষান্তে{' '}
                    <span className="border-b border-dotted border-black px-2 min-w-[200px] inline-block font-semibold">
                      {formData.officialCutArea || '........................................'}
                    </span>
                    ভোটার এলাকার জন্য প্রণীত ভোটার তালিকা হইতে নাম কর্তন এবং{' '}
                    <span className="border-b border-dotted border-black px-2 min-w-[200px] inline-block font-semibold">
                      {formData.officialIncludeArea || '........................................'}
                    </span>
                    ভোটার এলাকায় নাম অন্তর্ভুক্ত করা হইল।
                  </div>

                  {/* উপজেলা/থানা নির্বাচন কর্মকর্তা (ডানপাশে) */}
                  <div className="flex justify-end mt-8 mb-6 pr-2">
                    <div className="text-center w-64">
                      <div className="h-6 border-b border-dotted border-black"></div>
                      <div className="text-[12px] font-bold mt-1">
                        উপজেলা/থানা নির্বাচন কর্মকর্তা
                      </div>
                      <div className="mt-2 h-4 border-b border-dotted border-black w-40 mx-auto"></div>
                    </div>
                  </div>
                </div>

                {/* ডটেড বিভাজন লাইন */}
                <div className="border-b border-dotted border-black my-6 w-full"></div>

                {/* প্রাপ্তিস্বীকার পত্র */}
                <div className="text-[12.5px]">
                  <div className="text-center font-bold mb-3">প্রাপ্তিস্বীকার পত্র</div>

                  <div className="space-y-2">
                    <div className="flex items-baseline">
                      <span className="font-bold shrink-0">জনাব/বেগম</span>
                      <span className="flex-1 border-b border-dotted border-black px-2 font-bold truncate">
                        {formData.receiptApplicantName || formData.applicantName || '...................................................................................'}
                      </span>
                      <span className="font-bold shrink-0 ml-1">এর আবেদন ফরম গৃহীত হইল।</span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="font-bold shrink-0">আবেদন ফরম নম্বর</span>
                      <span className="flex-1 border-b border-dotted border-black px-2 font-mono font-bold">
                        {formData.receiptFormNo || '...........................................................................'}
                      </span>
                    </div>
                  </div>

                  {/* গ্রহণকারীর স্বাক্ষর (ডানপাশে) */}
                  <div className="flex justify-end mt-8 pr-2">
                    <div className="text-center w-64">
                      <div className="h-6 border-b border-dotted border-black"></div>
                      <div className="text-[12px] font-bold mt-1">
                        গ্রহণকারীর স্বাক্ষর
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">সব তথ্য মুছে ফেলতে চান?</h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              আপনি কি নিশ্চিত যে ফরমের সকল এন্ট্রি মুছে সম্পূর্ণ খালি ফরম প্রস্তুত করতে চান? মুছে ফেলার পর আর পূর্বাবস্থায় ফেরানো যাবে না।
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-md shadow-rose-200"
              >
                হ্যাঁ, সব মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Result Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            {validateForm().length === 0 ? (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">সকল তথ্য নির্ভুল রয়েছে!</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    আপনার ফরম-১৩ এর সকল আবশ্যকীয় তথ্য পূরণ করা হয়েছে। এখন আপনি সরাসরি <strong>"PDF ডাউনলোড"</strong> অথবা <strong>"প্রিন্ট করুন"</strong> বাটন দিয়ে অফিসিয়াল কপি সংগ্রহ করতে পারেন।
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold">✓ আবেদনকারীর নাম: {formData.applicantName}</div>
                  <div className="font-bold">✓ জাতীয় পরিচয়পত্র: {formData.nidNumber}</div>
                  <div className="font-bold">✓ স্থানান্তরিতব্য এলাকা: {formData.destAreaName}, {formData.destUpazila}</div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowValidationModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                  >
                    বুঝেছি, বন্ধ করুন
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">কিছু আবশ্যকীয় তথ্য এখনও বাকি আছে</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    অফিসিয়াল ফরম-১৩ গ্রহণের জন্য নিচের তথ্যগুলো পূরণ করা প্রয়োজন:
                  </p>
                </div>
                <ul className="space-y-1.5 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                  {validateForm().map((err, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowValidationModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    তথ্য পূরণ করতে ফিরে যান
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
