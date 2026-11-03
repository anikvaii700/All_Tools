// LandlordVoterCertificate.tsx
// বাড়ির মালিকের প্রত্যয়নপত্র (নতুন ভোটার নিবন্ধনের জন্য বর্তমান ঠিকানার প্রত্যয়ন)
// Exact implementation of user-provided specification and image_4c431222.png
// Features:
// 1. Dual-pane responsive layout: Left side = Detailed inputs & live controls, Right side = Authentic A4 official certificate
// 2. Exact Bengali wording & structure requested by the user
// 3. One-click Sample Data loader, Reset, Validation
// 4. One-click High-Resolution PDF Download via html2canvas-pro + jsPDF
// 5. One-click A4 Printing with dedicated print styles
// 6. Mobile Tab Switcher ('তথ্য পূরণ ফর্ম' vs 'A4 সার্টিফিকেট প্রিভিউ')

import React, { useState, useRef } from 'react';
import {
  Home,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Edit3,
  ZoomIn,
  ZoomOut,
  User,
  MapPin,
  Calendar,
  FileCheck2,
  ShieldCheck,
  Building,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface LandlordCertificateData {
  // ১। ভাড়াটিয়া / আবেদনকারীর তথ্য
  tenantName: string;
  relationType: 'father' | 'husband';
  guardianName: string;
  motherName: string;
  tenantNid: string;

  // ২। স্থায়ী ঠিকানা
  permVillage: string;
  permPost: string;
  permUpazila: string;
  permDistrict: string;

  // ৩। বর্তমান ঠিকানা (মালিকানাধীন বাড়ি)
  holdingNo: string;
  presentVillage: string;
  wardNo: string;
  presentPost: string;
  presentUpazila: string;
  presentDistrict: string;
  residingSinceDate: string;

  // ৪। প্রত্যয়ন সংক্রান্ত
  issueDate: string;
  customPurpose: string;

  // ৫। বাড়ির মালিকের তথ্য
  landlordName: string;
  landlordNid: string;
  landlordMobile: string;
  landlordAddress: string;
}

export const SAMPLE_LANDLORD_DATA: LandlordCertificateData = {
  tenantName: 'নাঈম মিয়া',
  relationType: 'father',
  guardianName: 'মো: রফিকুল ইসলাম',
  motherName: 'মোসা: রহিমা খাতুন',
  tenantNid: '১৯৯৫২৬৯১৬৪৫০৪৫৭১২',
  permVillage: 'চর ভবানীপুর',
  permPost: 'আনন্দবাজার',
  permUpazila: 'সোনাইমুড়ী',
  permDistrict: 'নোয়াখালী',
  holdingNo: '১২/বি (৪র্থ তলা)',
  presentVillage: 'ধানমন্ডি লেকভিউ',
  wardNo: '১৫',
  presentPost: 'ধানমন্ডি',
  presentUpazila: 'ধানমন্ডি',
  presentDistrict: 'ঢাকা',
  residingSinceDate: '০১/০১/২০২২',
  issueDate: '২৮/১০/২০২৬',
  customPurpose: 'তার নতুন ভোটার নিবন্ধনের ক্ষেত্রে বর্তমান ঠিকানার প্রমাণ হিসেবে এই প্রত্যয়নপত্র প্রদান করা হলো।',
  landlordName: 'হাজী মো: নুরুল আলম',
  landlordNid: '১৯৭২১২৩৪৫৬৭৮৯০১২৩',
  landlordMobile: '০১৭১১-২২৩৩৪৪',
  landlordAddress: 'বাড়ি-১২/বি, রোড-৭, ধানমন্ডি, ঢাকা-১২০৫',
};

export const EMPTY_LANDLORD_DATA: LandlordCertificateData = {
  tenantName: '',
  relationType: 'father',
  guardianName: '',
  motherName: '',
  tenantNid: '',
  permVillage: '',
  permPost: '',
  permUpazila: '',
  permDistrict: '',
  holdingNo: '',
  presentVillage: '',
  wardNo: '',
  presentPost: '',
  presentUpazila: '',
  presentDistrict: '',
  residingSinceDate: '',
  issueDate: new Date().toLocaleDateString('bn-BD'),
  customPurpose: 'তার নতুন ভোটার নিবন্ধনের ক্ষেত্রে বর্তমান ঠিকানার প্রমাণ হিসেবে এই প্রত্যয়নপত্র প্রদান করা হলো।',
  landlordName: '',
  landlordNid: '',
  landlordMobile: '',
  landlordAddress: '',
};

interface LandlordVoterCertificateProps {
  onBackToHub?: () => void;
  backButtonLabel?: string;
  onShowToast?: (msg: string, icon?: string) => void;
  initialData?: Partial<LandlordCertificateData>;
}

export const LandlordVoterCertificate: React.FC<LandlordVoterCertificateProps> = ({
  onBackToHub,
  backButtonLabel = '← ফিরে যান',
  onShowToast,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<LandlordCertificateData>({
    ...SAMPLE_LANDLORD_DATA,
    ...initialData,
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [includeOfficialBorder, setIncludeOfficialBorder] = useState<boolean>(true);

  const previewRef = useRef<HTMLDivElement>(null);

  const updateField = (field: keyof LandlordCertificateData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoadSample = () => {
    setFormData({ ...SAMPLE_LANDLORD_DATA });
    onShowToast?.('নমুনা তথ্য সফলভাবে লোড করা হয়েছে!', '✨');
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি সকল তথ্য মুছে ফাঁকা প্রত্যয়নপত্র তৈরি করতে চান?')) {
      setFormData({ ...EMPTY_LANDLORD_DATA });
      onShowToast?.('সকল তথ্য রিসেট করা হয়েছে', '🔄');
    }
  };

  const handleValidate = () => {
    const missing: string[] = [];
    if (!formData.tenantName.trim()) missing.push('ভাড়াটিয়ার নাম');
    if (!formData.guardianName.trim()) missing.push('পিতা/স্বামীর নাম');
    if (!formData.landlordName.trim()) missing.push('বাড়ির মালিকের নাম');

    if (missing.length > 0) {
      alert(`অনুগ্রহ করে নিম্নোক্ত তথ্যগুলো পূরণ করুন:\n• ${missing.join('\n• ')}`);
    } else {
      onShowToast?.('সকল আবশ্যক তথ্য সঠিকভাবে পূরণ করা হয়েছে! ✅', '👍');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    try {
      setIsExportingPdf(true);
      onShowToast?.('অফিশিয়াল A4 PDF তৈরি হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...', '⏳');

      const element = previewRef.current;
      const originalTransform = element.style.transform;
      element.style.transform = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      element.style.transform = originalTransform;

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      const fileName = `Landlord_Certificate_${formData.tenantName.replace(/\s+/g, '_') || 'Tenant'}.pdf`;
      pdf.save(fileName);

      onShowToast?.('A4 PDF সফলভাবে ডাউনলোড হয়েছে!', '🎉');
    } catch (error) {
      console.error('PDF export failed:', error);
      onShowToast?.('PDF তৈরিতে সমস্যা হয়েছে। সরাসরি প্রিন্ট বাটন ব্যবহার করুন।', '⚠️');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Helper for dots or filled text
  const renderTextOrDots = (
    value: string,
    fallbackDots = '..................................................................................'
  ) => {
    if (value && value.trim()) {
      return (
        <span className="font-bold text-slate-900 border-b border-dotted border-slate-900 pb-0.5 px-1">
          {value}
        </span>
      );
    }
    return <span className="text-slate-500 tracking-wider">{fallbackDots}</span>;
  };

  return (
    <div className="w-full space-y-4 font-sans text-slate-900">
      {/* TOP HEADER CONTROLS BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-3 sm:p-4 shadow-sm print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Back & Title */}
          <div className="flex items-center gap-2.5">
            {onBackToHub && (
              <button
                type="button"
                onClick={onBackToHub}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{backButtonLabel}</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base">🏠</span>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  বাড়ির মালিকের প্রত্যয়নপত্র
                </h2>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 font-extrabold px-2 py-0.5 rounded-full border border-cyan-200">
                  নতুন ভোটার নিবন্ধনের বর্তমান ঠিকানা
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                নতুন ভোটার নিবন্ধন ও ঠিকানা প্রমাণের জন্য বাড়িওয়ালার সম্পূর্ণ এডিটেবল প্রত্যয়নপত্র ও A4 প্রিন্ট
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
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
              className="px-3 py-2 rounded-xl bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
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
      <div className="lg:hidden max-w-md mx-auto px-4 mt-1 print:hidden">
        <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'edit'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>তথ্য পূরণ ফর্ম</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>A4 সার্টিফিকেট প্রিভিউ</span>
          </button>
        </div>
      </div>

      {/* MAIN 2-COLUMN LAYOUT: LEFT INPUT CONTROLS + RIGHT A4 PREVIEW */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================== */}
        {/* LEFT COLUMN: EDIT CONTROLS (COL-SPAN-5)                    */}
        {/* ========================================================== */}
        <div
          className={`lg:col-span-5 space-y-4 print:hidden ${
            activeTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Section 1: Tenant Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-cyan-700" />
              <h4 className="text-xs font-extrabold text-slate-800">
                ১। ভাড়াটিয়া / আবেদনকারীর তথ্য
              </h4>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ভাড়াটিয়ার নামঃ <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.tenantName}
                onChange={(e) => updateField('tenantName', e.target.value)}
                placeholder="যেমন: নাঈম মিয়া"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  সম্পর্কঃ
                </label>
                <select
                  value={formData.relationType}
                  onChange={(e) => updateField('relationType', e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="father">পিতার নাম</option>
                  <option value="husband">স্বামীর নাম</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {formData.relationType === 'husband' ? 'স্বামীর নামঃ' : 'পিতার নামঃ'}{' '}
                  <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => updateField('guardianName', e.target.value)}
                  placeholder={formData.relationType === 'husband' ? 'স্বামীর পুরো নাম' : 'পিতার পুরো নাম'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  মাতার নামঃ
                </label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => updateField('motherName', e.target.value)}
                  placeholder="মাতার পুরো নাম"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  জাতীয় পরিচয়পত্র নম্বর (যদি থাকে)ঃ
                </label>
                <input
                  type="text"
                  value={formData.tenantNid}
                  onChange={(e) => updateField('tenantNid', e.target.value)}
                  placeholder="১০/১৩/১৭ ডিজিট NID নম্বর"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Permanent Address */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-extrabold text-slate-800">
                ২। ভাড়াটিয়ার স্থায়ী ঠিকানা
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  গ্রামঃ
                </label>
                <input
                  type="text"
                  value={formData.permVillage}
                  onChange={(e) => updateField('permVillage', e.target.value)}
                  placeholder="গ্রামের নাম"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ডাকঘরঃ
                </label>
                <input
                  type="text"
                  value={formData.permPost}
                  onChange={(e) => updateField('permPost', e.target.value)}
                  placeholder="ডাকঘরের নাম"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  উপজেলাঃ
                </label>
                <input
                  type="text"
                  value={formData.permUpazila}
                  onChange={(e) => updateField('permUpazila', e.target.value)}
                  placeholder="উপজেলার নাম"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  জেলাঃ
                </label>
                <input
                  type="text"
                  value={formData.permDistrict}
                  onChange={(e) => updateField('permDistrict', e.target.value)}
                  placeholder="জেলার নাম"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Present Address (Rented Property) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-cyan-700" />
              <h4 className="text-xs font-extrabold text-slate-800">
                ৩। ভাড়াটিয়ার বর্তমান ঠিকানা (মালিকানাধীন বাড়ি)
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  বাড়ি/হোল্ডিং নংঃ
                </label>
                <input
                  type="text"
                  value={formData.holdingNo}
                  onChange={(e) => updateField('holdingNo', e.target.value)}
                  placeholder="যেমন: ১২/বি (৪র্থ তলা)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  গ্রাম/মহল্লাঃ
                </label>
                <input
                  type="text"
                  value={formData.presentVillage}
                  onChange={(e) => updateField('presentVillage', e.target.value)}
                  placeholder="যেমন: ধানমন্ডি লেকভিউ"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ওয়ার্ড নংঃ
                </label>
                <input
                  type="text"
                  value={formData.wardNo}
                  onChange={(e) => updateField('wardNo', e.target.value)}
                  placeholder="যেমন: ১৫"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ডাকঘরঃ
                </label>
                <input
                  type="text"
                  value={formData.presentPost}
                  onChange={(e) => updateField('presentPost', e.target.value)}
                  placeholder="যেমন: ধানমন্ডি"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  উপজেলা/থানাঃ
                </label>
                <input
                  type="text"
                  value={formData.presentUpazila}
                  onChange={(e) => updateField('presentUpazila', e.target.value)}
                  placeholder="যেমন: ধানমন্ডি"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  জেলাঃ
                </label>
                <input
                  type="text"
                  value={formData.presentDistrict}
                  onChange={(e) => updateField('presentDistrict', e.target.value)}
                  placeholder="যেমন: ঢাকা"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                বসবাসের শুরুর তারিখ (অত্র ঠিকানায় বসবাস করছেন)ঃ
              </label>
              <input
                type="text"
                value={formData.residingSinceDate}
                onChange={(e) => updateField('residingSinceDate', e.target.value)}
                placeholder="যেমন: ০১/০১/২০২২"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 4: Landlord Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Home className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-extrabold text-slate-800">
                ৪। বাড়ির মালিকের বিবরণ
              </h4>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                বাড়ির মালিকের নামঃ <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={formData.landlordName}
                onChange={(e) => updateField('landlordName', e.target.value)}
                placeholder="যেমন: হাজী মো: নুরুল আলম"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  জাতীয় পরিচয়পত্র নম্বরঃ
                </label>
                <input
                  type="text"
                  value={formData.landlordNid}
                  onChange={(e) => updateField('landlordNid', e.target.value)}
                  placeholder="মালিকের NID নম্বর"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  মোবাইল নম্বরঃ
                </label>
                <input
                  type="text"
                  value={formData.landlordMobile}
                  onChange={(e) => updateField('landlordMobile', e.target.value)}
                  placeholder="০১৭xxxxxxxx"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                বাড়ির ঠিকানাঃ
              </label>
              <input
                type="text"
                value={formData.landlordAddress}
                onChange={(e) => updateField('landlordAddress', e.target.value)}
                placeholder="যেমন: বাড়ি-১২/বি, রোড-৭, ধানমন্ডি, ঢাকা-১২০৫"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Section 5: Certificate Date & Styling Options */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-indigo-700" />
              <h4 className="text-xs font-extrabold text-slate-800">
                ৫। প্রত্যয়নপত্রের তারিখ ও অপশন
              </h4>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                প্রত্যয়ন প্রদানের তারিখঃ
              </label>
              <input
                type="text"
                value={formData.issueDate}
                onChange={(e) => updateField('issueDate', e.target.value)}
                placeholder="যেমন: ২৮/১০/২০২৬"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="border-toggle"
                checked={includeOfficialBorder}
                onChange={(e) => setIncludeOfficialBorder(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
              />
              <label htmlFor="border-toggle" className="text-xs font-medium text-slate-700 cursor-pointer">
                সার্টিফিকেটে ক্লাসিক অফিশিয়াল বর্ডার যুক্ত করুন
              </label>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: OFFICIAL A4 CERTIFICATE PREVIEW (COL-SPAN-7) */}
        {/* ========================================================== */}
        <div
          className={`lg:col-span-7 space-y-3 ${
            activeTab === 'edit' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Zoom Bar */}
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">জুম:</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer"
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
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="বড় করুন"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="text-[11px] font-bold text-cyan-700 hover:underline ml-1 cursor-pointer"
              >
                রিসেট
              </button>
            </div>

            <div className="text-[11px] font-extrabold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
              A4 অফিশিয়াল প্রত্যয়নপত্র
            </div>
          </div>

          {/* DOCUMENT WRAPPER (Strict A4 Paper Replica) */}
          <div className="overflow-x-auto flex justify-center pb-8">
            <div
              ref={previewRef}
              id="landlord-certificate-a4"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
              className={`w-[210mm] min-h-[297mm] max-h-[297mm] bg-white text-slate-900 shadow-xl p-[14mm] sm:p-[18mm] font-serif leading-relaxed text-[13.5px] print:m-0 print:p-[14mm] print:shadow-none print:border-none print:w-[210mm] print:scale-100 box-border overflow-hidden flex flex-col justify-between ${
                includeOfficialBorder ? 'border-4 border-double border-slate-800' : 'border border-slate-300'
              }`}
            >
              {/* TOP HEADER SECTION */}
              <div className="space-y-4">
                <div className="text-center space-y-1.5 pt-2 border-b border-slate-300 pb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-slate-300 text-2xl mb-1 shadow-2xs">
                    🏠
                  </div>
                  <h1 className="text-[22px] sm:text-[24px] font-black text-slate-950 tracking-tight leading-snug">
                    বাড়ির মালিকের প্রত্যয়নপত্র
                  </h1>
                  <h2 className="text-[14px] font-bold text-slate-800">
                    (নতুন ভোটার নিবন্ধনের জন্য বর্তমান ঠিকানার প্রত্যয়ন)
                  </h2>
                </div>

                {/* STATEMENT BODY */}
                <div className="space-y-4 text-justify pt-2">
                  <p className="font-semibold text-[14px] text-slate-900">
                    এই মর্মে প্রত্যয়ন করা যাচ্ছে যে,
                  </p>

                  {/* TENANT DETAILS TABLE / BLOCK */}
                  <div className="space-y-2.5 pl-4 text-[13.5px]">
                    <div className="flex items-baseline">
                      <span className="min-w-[245px] sm:min-w-[255px] shrink-0 font-bold whitespace-nowrap">নামঃ</span>
                      <span className="flex-1 font-bold text-slate-950 border-b border-dotted border-slate-800 pb-0.5 min-h-[20px]">
                        {formData.tenantName || '..................................................................................'}
                      </span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="min-w-[245px] sm:min-w-[255px] shrink-0 font-bold whitespace-nowrap">
                        {formData.relationType === 'husband' ? 'স্বামীর নামঃ' : 'পিতা/স্বামীর নামঃ'}
                      </span>
                      <span className="flex-1 font-bold text-slate-950 border-b border-dotted border-slate-800 pb-0.5 min-h-[20px]">
                        {formData.guardianName || '..................................................................................'}
                      </span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="min-w-[245px] sm:min-w-[255px] shrink-0 font-bold whitespace-nowrap">মাতার নামঃ</span>
                      <span className="flex-1 font-bold text-slate-950 border-b border-dotted border-slate-800 pb-0.5 min-h-[20px]">
                        {formData.motherName || '..................................................................................'}
                      </span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="min-w-[245px] sm:min-w-[255px] shrink-0 font-bold whitespace-nowrap">
                        জাতীয় পরিচয়পত্র নম্বর (যদি থাকে)ঃ
                      </span>
                      <span className="flex-1 font-bold text-slate-950 border-b border-dotted border-slate-800 pb-0.5 min-h-[20px]">
                        {formData.tenantNid || '..................................................................................'}
                      </span>
                    </div>

                    {/* Permanent Address */}
                    <div className="pt-1">
                      <div className="font-bold mb-1">স্থায়ী ঠিকানাঃ</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pl-4">
                        <div className="flex items-baseline">
                          <span className="w-20 shrink-0 font-medium">গ্রামঃ</span>
                          <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                            {formData.permVillage || '........................................'}
                          </span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="w-20 shrink-0 font-medium">ডাকঘরঃ</span>
                          <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                            {formData.permPost || '........................................'}
                          </span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="w-20 shrink-0 font-medium">উপজেলাঃ</span>
                          <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                            {formData.permUpazila || '........................................'}
                          </span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="w-20 shrink-0 font-medium">জেলাঃ</span>
                          <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                            {formData.permDistrict || '........................................'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PARAGRAPH: TENANT OCCUPANCY IN PROPERTY */}
                  <p className="leading-relaxed pt-2">
                    উপরোক্ত ব্যক্তি আমার বাড়ির একজন ভাড়াটিয়া। তিনি বর্তমানে আমার মালিকানাধীন বাড়িতে বসবাস করছেন।
                  </p>

                  {/* PRESENT ADDRESS BLOCK */}
                  <div className="pl-4 space-y-1.5">
                    <div className="font-bold mb-1">বর্তমান ঠিকানাঃ</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pl-4">
                      <div className="flex items-baseline">
                        <span className="w-28 shrink-0 font-medium">বাড়ি/হোল্ডিং নংঃ</span>
                        <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                          {formData.holdingNo || '........................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="w-28 shrink-0 font-medium">গ্রাম/মহল্লাঃ</span>
                        <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                          {formData.presentVillage || '........................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="w-28 shrink-0 font-medium">ওয়ার্ড নংঃ</span>
                        <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                          {formData.wardNo || '........................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="w-28 shrink-0 font-medium">ডাকঘরঃ</span>
                        <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                          {formData.presentPost || '........................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="w-28 shrink-0 font-medium">উপজেলা/থানাঃ</span>
                        <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                          {formData.presentUpazila || '........................................'}
                        </span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="w-28 shrink-0 font-medium">জেলাঃ</span>
                        <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                          {formData.presentDistrict || '........................................'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PARAGRAPH: RESIDING DURATION & VERIFICATION */}
                  <p className="leading-relaxed pt-2">
                    তিনি অত্র ঠিকানায়{' '}
                    <span className="font-bold border-b border-dotted border-slate-800 px-2 pb-0.5">
                      {formData.residingSinceDate || '....................................'}
                    </span>{' '}
                    তারিখ হতে বসবাস করে আসছেন।
                  </p>

                  <p className="leading-relaxed">
                    আমি তাকে ব্যক্তিগতভাবে চিনি এবং তিনি উক্ত ঠিকানায় বসবাস করছেন মর্মে নিশ্চিত করছি। {formData.customPurpose}
                  </p>

                  <p className="leading-relaxed font-medium">
                    আমি তার সর্বাঙ্গীণ মঙ্গল কামনা করি।
                  </p>
                </div>
              </div>

              {/* BOTTOM SECTION: DATE & LANDLORD SIGNATURE */}
              <div className="pt-8 pb-4">
                <div className="flex justify-between items-end">
                  {/* Left: Issue Date */}
                  <div className="text-[13px] self-end pb-1">
                    <span className="font-bold">তারিখঃ </span>
                    <span className="border-b border-dotted border-slate-800 pb-0.5 font-bold">
                      {formData.issueDate || '............................'}
                    </span>
                  </div>

                  {/* Right: Landlord Signature & Details */}
                  <div className="w-[330px] sm:w-[350px] space-y-1.5 text-[12.5px]">
                    {/* Generous pen signing clearance above line */}
                    <div className="min-h-[50px] flex items-end">
                      <div className="w-full border-t border-dashed border-slate-800 pt-1 text-center font-bold">
                        বাড়ির মালিকের স্বাক্ষর
                      </div>
                    </div>

                    <div className="flex items-baseline">
                      <span className="min-w-[150px] shrink-0 font-bold whitespace-nowrap">বাড়ির মালিকের নামঃ</span>
                      <span className="flex-1 font-bold border-b border-dotted border-slate-800 pb-0.5">
                        {formData.landlordName || '....................................................'}
                      </span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="min-w-[150px] shrink-0 font-bold whitespace-nowrap">
                        জাতীয় পরিচয়পত্র নম্বরঃ
                      </span>
                      <span className="flex-1 font-bold border-b border-dotted border-slate-800 pb-0.5">
                        {formData.landlordNid || '............................................'}
                      </span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="min-w-[150px] shrink-0 font-bold whitespace-nowrap">মোবাইল নম্বরঃ</span>
                      <span className="flex-1 font-bold border-b border-dotted border-slate-800 pb-0.5">
                        {formData.landlordMobile || '............................................................'}
                      </span>
                    </div>

                    <div className="flex items-baseline">
                      <span className="min-w-[150px] shrink-0 font-bold whitespace-nowrap">বাড়ির ঠিকানাঃ</span>
                      <span className="flex-1 border-b border-dotted border-slate-800 pb-0.5">
                        {formData.landlordAddress || '............................................................'}
                      </span>
                    </div>
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
