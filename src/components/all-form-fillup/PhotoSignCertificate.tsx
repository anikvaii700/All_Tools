// PhotoSignCertificate.tsx
// ছবি ও স্বাক্ষর পরিবর্তনের প্রত্যয়ন (ইউনিয়ন পরিষদ / পৌরসভা প্রত্যয়নপত্র)
// Exact implementation of user-provided specification and image_d5c7e51c.png, image_936000ca.png & image_cb079219.png
// Features:
// 1. Dual-pane responsive layout: Left side = Detailed inputs & live controls, Right side = Authentic A4 official certificate
// 2. People's Republic of Bangladesh official emblem at the very top of the A4 certificate
// 3. Fully editable Union Parishad name, Upazila, District, Applicant name, Parents, NID, DOB, Reason & Signatures
// 4. Synchronized applicant name inside both paragraph and official specimen table
// 5. One-click Sample Data loader, Reset, Validation
// 6. One-click High-Resolution PDF Download via html2canvas-pro + jsPDF
// 7. One-click A4 Printing with dedicated print styles
// 8. Mobile Tab Switcher ('তথ্য পূরণ ফর্ম' vs 'A4 সার্টিফিকেট প্রিভিউ')

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
  Image as ImageIcon,
  Upload,
  Trash2,
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface PhotoSignCertificateData {
  // ১। ইউনিয়ন পরিষদ / কর্তৃপক্ষ তথ্য
  unionParishad: string;
  upazila: string;
  district: string;
  memoNo: string;
  issueDate: string;

  // ২। আবেদনকারীর তথ্য
  applicantName: string;
  relationType: 'father' | 'husband';
  guardianName: string;
  motherName: string;
  village: string;
  postOffice: string;
  voterYear: string;
  nidNumber: string;
  dateOfBirth: string;

  // ৩। সমস্যা / প্রত্যয়নের কারণ
  reasonDetails: string;

  // ৪। ছবি ও স্বাক্ষর
  applicantPhoto?: string;
  signatoryDesignation: string;
  signatoryName?: string;
}

export const SAMPLE_PHOTO_SIGN_DATA: PhotoSignCertificateData = {
  unionParishad: '০৫ নং আন্দিউড়া ইউনিয়ন পরিষদ',
  upazila: 'মাধবপুর',
  district: 'হবিগঞ্জ',
  memoNo: '',
  issueDate: '২৮/১০/২০২৬',
  applicantName: 'ছামিরা',
  relationType: 'father',
  guardianName: 'মোঃ মিলন মিয়া',
  motherName: 'আলিমা বেগম',
  village: 'আন্দিউড়া',
  postOffice: 'আন্দিউড়া-৩৩০১',
  voterYear: '২০২২',
  nidNumber: '৪৬৭২৯২৮৭৪৬',
  dateOfBirth: '০৫-০৫-১৯৯৮',
  reasonDetails:
    'তাহার জাতীয় পরিচয়পত্রে থাকা ছবি ও স্বাক্ষর অন্য একজন হিন্দু মহিলার। এমতাবস্থায় এই জাতীয় পরিচয়পত্র দিয়ে কোন রকম কাজ করা যাচ্ছেনা। তাই উক্ত জাতীয় পরিচয়পত্রে তাহার বর্তমান ছবি ও স্বাক্ষর দিয়ে ঠিক করার জন্য প্রত্যয়ন করা হলো।',
  signatoryDesignation: 'চেয়ারম্যান',
  signatoryName: '',
};

export const EMPTY_PHOTO_SIGN_DATA: PhotoSignCertificateData = {
  unionParishad: '০৫ নং আন্দিউড়া ইউনিয়ন পরিষদ',
  upazila: 'মাধবপুর',
  district: 'হবিগঞ্জ',
  memoNo: '',
  issueDate: new Date().toLocaleDateString('bn-BD'),
  applicantName: '',
  relationType: 'father',
  guardianName: '',
  motherName: '',
  village: '',
  postOffice: '',
  voterYear: '২০২২',
  nidNumber: '',
  dateOfBirth: '',
  reasonDetails:
    'তাহার জাতীয় পরিচয়পত্রে থাকা ছবি ও স্বাক্ষর অন্য একজন হিন্দু মহিলার। এমতাবস্থায় এই জাতীয় পরিচয়পত্র দিয়ে কোন রকম কাজ করা যাচ্ছেনা। তাই উক্ত জাতীয় পরিচয়পত্রে তাহার বর্তমান ছবি ও স্বাক্ষর দিয়ে ঠিক করার জন্য প্রত্যয়ন করা হলো।',
  signatoryDesignation: 'চেয়ারম্যান',
  signatoryName: '',
};

const COMMON_REASONS = [
  {
    label: 'অন্য ব্যক্তির ছবি ও স্বাক্ষর (ছবির মতো ডিফল্ট)',
    text: 'তাহার জাতীয় পরিচয়পত্রে থাকা ছবি ও স্বাক্ষর অন্য একজন হিন্দু মহিলার। এমতাবস্থায় এই জাতীয় পরিচয়পত্র দিয়ে কোন রকম কাজ করা যাচ্ছেনা। তাই উক্ত জাতীয় পরিচয়পত্রে তাহার বর্তমান ছবি ও স্বাক্ষর দিয়ে ঠিক করার জন্য প্রত্যয়ন করা হলো।',
  },
  {
    label: 'ছবি ও স্বাক্ষর অস্পষ্ট / মুছে গেছে',
    text: 'তাহার জাতীয় পরিচয়পত্রে থাকা ছবি ও স্বাক্ষর সম্পূর্ণ অস্পষ্ট ও অকার্যকর হয়ে পড়েছে। এমতাবস্থায় উক্ত জাতীয় পরিচয়পত্রে তাহার বর্তমান পরিষ্কার ছবি ও সঠিক স্বাক্ষর দিয়ে ঠিক করার জন্য প্রত্যয়ন করা হলো।',
  },
  {
    label: 'ভুলবশত অন্য ব্যক্তির ছবি সংযুক্ত',
    text: 'তাহার জাতীয় পরিচয়পত্রে কারিগরি ত্রুটির কারণে অন্য ব্যক্তির ছবি ও স্বাক্ষর মুদ্রিত হয়েছে। তাই উক্ত জাতীয় পরিচয়পত্রে তাহার বর্তমান আসল ছবি ও স্বাক্ষর প্রতিস্থাপন করার জন্য এই প্রত্যয়নপত্র প্রদান করা হলো।',
  },
  {
    label: 'স্বাক্ষর পরিবর্তন ও ছবি হালনাগাদ',
    text: 'তাহার জাতীয় পরিচয়পত্রে রক্ষিত ছবি পূর্বের এবং স্বাক্ষর পরিবর্তিত হওয়ায় বিভিন্ন অফিশিয়াল কাজে জটিলতা দেখা দিচ্ছে। বিধায় তাহার বর্তমান ছবি ও নতুন স্বাক্ষর দিয়ে এনআইডি সংশোধনের জন্য প্রত্যয়ন করা হলো।',
  },
];

interface PhotoSignCertificateProps {
  onBackToHub?: () => void;
  backButtonLabel?: string;
  onShowToast?: (message: string, icon?: string) => void;
  initialData?: Partial<PhotoSignCertificateData>;
}

export const PhotoSignCertificate: React.FC<PhotoSignCertificateProps> = ({
  onBackToHub,
  backButtonLabel = '← ড্যাশবোর্ডে ফিরে যান',
  onShowToast,
  initialData,
}) => {
  const [data, setData] = useState<PhotoSignCertificateData>({
    ...SAMPLE_PHOTO_SIGN_DATA,
    ...(initialData || {}),
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof PhotoSignCertificateData>(
    field: K,
    value: PhotoSignCertificateData[K]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setData(EMPTY_PHOTO_SIGN_DATA);
    onShowToast?.('সব তথ্য মুছে ফাঁকা ফরম প্রস্তুত করা হয়েছে', '🧹');
  };

  const handleLoadSample = () => {
    setData(SAMPLE_PHOTO_SIGN_DATA);
    onShowToast?.('০৫ নং আন্দিউড়া ইউপির নমুনা প্রত্যয়নপত্র লোড হয়েছে', '✨');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast?.('ছবির সাইজ সর্বোচ্চ ২ মেগাবাইট হতে হবে', '⚠️');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        updateField('applicantPhoto', base64);
        onShowToast?.('পাসপোর্ট ছবি সফলভাবে যুক্ত হয়েছে', '📸');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
    onShowToast?.('প্রিন্ট উইন্ডো খোলা হয়েছে', '🖨️');
  };

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    try {
      setIsDownloading(true);
      onShowToast?.('A4 সাইজ হাই-রেজ্যুলেশন PDF তৈরি হচ্ছে...', '⏳');

      const element = certificateRef.current;
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
      pdf.save(`Photo_Sign_Certificate_${safeName}.pdf`);

      onShowToast?.('প্রত্যয়নপত্র PDF সফলভাবে ডাউনলোড হয়েছে!', '✅');
    } catch (err) {
      console.error('PDF generation error:', err);
      onShowToast?.('PDF তৈরিতে সমস্যা হয়েছে। প্রিন্ট অপশন ব্যবহার করুন।', '❌');
    } finally {
      setIsDownloading(false);
    }
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
                ছবি ও স্বাক্ষর পরিবর্তনের প্রত্যয়নপত্র
              </h2>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                ইউনিয়ন পরিষদ / পৌরসভা ফরম্যাট
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ০৫ নং আন্দিউড়া ইউনিয়ন পরিষদ সহ সকল তথ্য এডিটেবল • হুবহু A4 সাইজ • তাৎক্ষণিক প্রিন্ট ও PDF
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
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
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
          <span>A4 প্রত্যয়ন প্রিভিউ</span>
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
          {/* Section 1: ইউনিয়ন পরিষদ ও কর্তৃপক্ষ */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-rose-800 font-bold text-xs">
              <Building className="w-4 h-4 text-rose-600" />
              <span>১। ইউনিয়ন পরিষদ / কর্তৃপক্ষ ও ইস্যু সংক্রান্ত</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ইউনিয়ন পরিষদ / পৌরসভা নাম (এডিটেবল):
                </label>
                <input
                  type="text"
                  value={data.unionParishad}
                  onChange={(e) => updateField('unionParishad', e.target.value)}
                  placeholder="যেমন: ০৫ নং আন্দিউড়া ইউনিয়ন পরিষদ"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">উপজেলা / থানা:</label>
                  <input
                    type="text"
                    value={data.upazila}
                    onChange={(e) => updateField('upazila', e.target.value)}
                    placeholder="যেমন: মাধবপুর"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">জেলা:</label>
                  <input
                    type="text"
                    value={data.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    placeholder="যেমন: হবিগঞ্জ"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">তারিখ (প্রিন্টে দৃশ্যমান):</label>
                  <input
                    type="text"
                    value={data.issueDate}
                    onChange={(e) => updateField('issueDate', e.target.value)}
                    placeholder="যেমন: ২৮/১০/২০২৬"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">স্মারক নং (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={data.memoNo}
                    onChange={(e) => updateField('memoNo', e.target.value)}
                    placeholder="যেমন: ইউপি/২০২৬/৮৫"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: আবেদনকারীর পূর্ণ তথ্য */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-indigo-800 font-bold text-xs">
              <User className="w-4 h-4 text-indigo-600" />
              <span>২। আবেদনকারীর তথ্য (ফরম্যাট ও ছকে স্বয়ংক্রিয় সিঙ্ক)</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  আবেদনকারীর নাম (এডিটেবল): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={data.applicantName}
                  onChange={(e) => updateField('applicantName', e.target.value)}
                  placeholder="যেমন: ছামিরা"
                  className="w-full px-3 py-1.5 rounded-xl border-2 border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-black text-slate-900 bg-indigo-50/30 text-sm"
                />
                <span className="text-[10px] text-indigo-600 font-medium mt-0.5 block">
                  💡 নাম পরিবর্তন করলে প্রত্যয়নের ভেতরের প্যারাগ্রাফ ও নিচের ছক উভয় জায়গায় স্বয়ংক্রিয়ভাবে আপডেট হবে।
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">অভিভাবক:</label>
                  <select
                    value={data.relationType}
                    onChange={(e) => updateField('relationType', e.target.value as 'father' | 'husband')}
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="father">পিতাঃ</option>
                    <option value="husband">স্বামীঃ</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">পিতা / স্বামীর নাম:</label>
                  <input
                    type="text"
                    value={data.guardianName}
                    onChange={(e) => updateField('guardianName', e.target.value)}
                    placeholder="যেমন: মোঃ মিলন মিয়া"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">মাতার নাম:</label>
                <input
                  type="text"
                  value={data.motherName}
                  onChange={(e) => updateField('motherName', e.target.value)}
                  placeholder="যেমন: আলিমা বেগম"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">গ্রাম / মহল্লা:</label>
                  <input
                    type="text"
                    value={data.village}
                    onChange={(e) => updateField('village', e.target.value)}
                    placeholder="যেমন: আন্দিউড়া"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ডাকঘর (পোস্ট কোড সহ):</label>
                  <input
                    type="text"
                    value={data.postOffice}
                    onChange={(e) => updateField('postOffice', e.target.value)}
                    placeholder="যেমন: আন্দিউড়া-৩৩০১"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">ভোটার বছর:</label>
                  <input
                    type="text"
                    value={data.voterYear}
                    onChange={(e) => updateField('voterYear', e.target.value)}
                    placeholder="যেমন: ২০২২"
                    className="w-full px-2 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">জাতীয় পরিচয়পত্র নং (NID):</label>
                  <input
                    type="text"
                    value={data.nidNumber}
                    onChange={(e) => updateField('nidNumber', e.target.value)}
                    placeholder="যেমন: ৪৬৭২৯২৮৭৪৬"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">জন্ম তারিখ:</label>
                <input
                  type="text"
                  value={data.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  placeholder="যেমন: ০৫-০৫-১৯৯৮"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: সমস্যা ও প্রত্যয়নের কারণ বিবরণ */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-amber-800 font-bold text-xs">
              <FileCheck2 className="w-4 h-4 text-amber-600" />
              <span>৩। প্রত্যয়নের কারণ বিবরণ (কাস্টম বা ক্লিক করে সিলেক্ট)</span>
            </div>

            {/* Quick Reason Presets */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_REASONS.map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateField('reasonDetails', reason.text)}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition active:scale-95 cursor-pointer text-left"
                >
                  {reason.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">
                প্রত্যয়নপত্রের মূল বিবরণ টেক্সট:
              </label>
              <textarea
                rows={4}
                value={data.reasonDetails}
                onChange={(e) => updateField('reasonDetails', e.target.value)}
                placeholder="সমস্যার কারণ বিস্তারিত লিখুন..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-xs font-serif leading-relaxed text-slate-900"
              />
            </div>
          </div>

          {/* Section 4: পাসপোর্ট সাইজ ছবি ও স্বাক্ষরকারী */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-teal-800 font-bold text-xs">
              <ImageIcon className="w-4 h-4 text-teal-600" />
              <span>৪। ছবি সংযুক্তি (ঐচ্ছিক) ও স্বাক্ষরকারী পদবী</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  আবেদনকারীর ছবি (প্রিন্টে ফাঁকা বক্স বা ছবি প্রিভিউ):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{data.applicantPhoto ? 'ছবি পরিবর্তন করুন' : 'পাসপোর্ট ছবি আপলোড'}</span>
                  </button>

                  {data.applicantPhoto && (
                    <button
                      type="button"
                      onClick={() => updateField('applicantPhoto', undefined)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ছবি সরান (ফাঁকা বক্স রাখুন)</span>
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * ছবি আপলোড না করলে অফিশিয়াল প্রিন্টের মতো ফাঁকা ছবি সংযুক্ত করার বক্স থাকবে।
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">স্বাক্ষরকারী পদবী:</label>
                  <input
                    type="text"
                    value={data.signatoryDesignation}
                    onChange={(e) => updateField('signatoryDesignation', e.target.value)}
                    placeholder="যেমন: চেয়ারম্যান"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">স্বাক্ষরকারীর নাম (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={data.signatoryName || ''}
                    onChange={(e) => updateField('signatoryName', e.target.value)}
                    placeholder="চেয়ারম্যানের নাম"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANE: LIVE A4 CERTIFICATE CANVAS (lg:col-span-7)         */}
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
                <span>📄 A4 প্রত্যয়নপত্র লাইভ প্রিভিউ</span>
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
                id="photo-sign-certificate-a4"
                ref={certificateRef}
                className="w-[210mm] min-h-[297mm] bg-white text-black p-[14mm] sm:p-[16mm] shadow-2xl relative flex flex-col justify-between font-serif border border-slate-400 select-text"
              >
                <div>
                  {/* ====================================================== */}
                  {/* A. TOP HEADER: EMBLEM & REPUBLIC TITLE (IMAGE EXACT)   */}
                  {/* ====================================================== */}
                  <div className="text-center pt-1 pb-2">
                    {/* Bangladesh Government Logo (Requested by user at the very top) */}
                    <img
                      src="/assets/aistudio/image_cb079219.png"
                      alt="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"
                      className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-1.5 object-contain"
                    />

                    {/* Government Title */}
                    <div className="text-[12.5px] sm:text-[13px] font-bold tracking-wide text-slate-800">
                      গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                    </div>

                    {/* Union Parishad Name (Highlighted Large Header as in image_d5c7e51c.png) */}
                    <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-black my-0.5 leading-snug">
                      {data.unionParishad || '০৫ নং আন্দিউড়া ইউনিয়ন পরিষদ'}
                    </h1>

                    {/* Upazila & District */}
                    <div className="text-[12.5px] sm:text-[13px] font-bold text-slate-800">
                      উপজেলা: {data.upazila || 'মাধবপুর'}, জেলা: {data.district || 'হবিগঞ্জ'}।
                    </div>
                  </div>

                  {/* Horizontal Divider Line */}
                  <div className="border-t-2 border-black w-full my-1.5" />

                  {/* Memo (Left) & Date (Right) Row */}
                  <div className="flex items-center justify-between text-xs font-semibold px-2 mb-6">
                    <div className="flex items-center gap-1.5">
                      <span>|</span>
                      {data.memoNo && <span>স্মারক নং: {data.memoNo}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>তারিখঃ</span>
                      <span className="font-bold underline decoration-dotted ml-1">
                        {data.issueDate || '...................'}
                      </span>
                    </div>
                  </div>

                  {/* Certificate Title: প্রত্যয়নপত্র (Underlined) */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-black inline-block border-b-2 border-black pb-0.5 px-4 tracking-wider text-black">
                      প্রত্যয়নপত্র
                    </h2>
                  </div>

                  {/* ====================================================== */}
                  {/* B. MAIN BODY PARAGRAPH (EXACT USER WORDING & STRUCTURE) */}
                  {/* ====================================================== */}
                  <p className="text-[13.5px] sm:text-[14px] leading-[2.2] text-justify font-normal indent-8 mb-8 text-black">
                    এই মর্মে প্রত্যয়ন করা যাইতেছে যে,{' '}
                    <span className="font-black text-black">
                      {data.applicantName || '................................'}
                    </span>
                    , {data.relationType === 'husband' ? 'স্বামীঃ' : 'পিতাঃ'}{' '}
                    <span className="font-bold text-black">
                      {data.guardianName || '................................'}
                    </span>
                    , মাতাঃ-{' '}
                    <span className="font-bold text-black">
                      {data.motherName || '................................'}
                    </span>
                    , গ্রামঃ{' '}
                    <span className="font-semibold text-black">
                      {data.village || '................................'}
                    </span>
                    , ডাকঘরঃ{' '}
                    <span className="font-semibold text-black">
                      {data.postOffice || '................................'}
                    </span>
                    , উপজেলাঃ {data.upazila || '................................'}, জেলাঃ{' '}
                    {data.district || '................................'}। তিনি অত্র{' '}
                    <span className="font-bold text-black">
                      {data.unionParishad || '০৫ নং আন্দিউড়া'}
                    </span>{' '}
                    ইউনিয়নের স্থায়ী বাসিন্দা ও বাংলাদেশের নাগরিক। তিনি আমার নিকট ব্যক্তিগত ভাবে পরিচিত। তিনি{' '}
                    <span className="font-bold text-black">{data.voterYear || '২০২২'}</span> সালের
                    হালনাগাদে ইউনিয়ন পরিষদে ভোটার হন। তাহার জাতীয় পরিচয় নং-{' '}
                    <span className="font-bold text-black tracking-wider">
                      {data.nidNumber || '................................'}
                    </span>
                    , জন্ম তারিখঃ{' '}
                    <span className="font-bold text-black">
                      {data.dateOfBirth || '................................'}
                    </span>{' '}
                    খ্রিঃ। {data.reasonDetails}
                  </p>

                  {/* ====================================================== */}
                  {/* C. THREE-COLUMN SPECIMEN TABLE (EXACT IMAGE STRUCTURE) */}
                  {/* ====================================================== */}
                  <div className="border-2 border-black mb-8 w-full bg-white">
                    {/* Table Header Row */}
                    <div className="grid grid-cols-12 border-b-2 border-black text-center font-bold text-[13px] sm:text-[14px] bg-slate-50/50">
                      <div className="col-span-4 border-r-2 border-black py-2.5 px-2">
                        আবেদনকারীর নাম
                      </div>
                      <div className="col-span-4 border-r-2 border-black py-2.5 px-2">
                        আবেদনকারীর স্বাক্ষর
                      </div>
                      <div className="col-span-4 py-2.5 px-2">
                        আবেদনকারীর ছবি
                      </div>
                    </div>

                    {/* Table Body: 3 Columns */}
                    <div className="grid grid-cols-12 min-h-[160px] sm:min-h-[175px]">
                      {/* Column 1: আবেদনকারীর নাম (Vertically and horizontally centered) */}
                      <div className="col-span-4 border-r-2 border-black flex items-center justify-center p-3 text-center bg-white">
                        <span className="text-base sm:text-lg font-black text-black">
                          {data.applicantName || '—'}
                        </span>
                      </div>

                      {/* Column 2: আবেদনকারীর স্বাক্ষর (3 stacked physical signature compartments) */}
                      <div className="col-span-4 border-r-2 border-black flex flex-col justify-between bg-white">
                        <div className="flex-1 border-b border-black flex items-center justify-center text-[10px] text-slate-300 relative px-2 py-3">
                          <span className="text-slate-200 select-none text-[10px]">স্বাক্ষর ১</span>
                        </div>
                        <div className="flex-1 border-b border-black flex items-center justify-center text-[10px] text-slate-300 relative px-2 py-3">
                          <span className="text-slate-200 select-none text-[10px]">স্বাক্ষর ২</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-[10px] text-slate-300 relative px-2 py-3">
                          <span className="text-slate-200 select-none text-[10px]">স্বাক্ষর ৩</span>
                        </div>
                      </div>

                      {/* Column 3: আবেদনকারীর ছবি (One tall cell spanning full 3-rows height) */}
                      <div className="col-span-4 flex flex-col items-center justify-center p-2.5 bg-white">
                        {data.applicantPhoto ? (
                          <div className="relative group">
                            <img
                              src={data.applicantPhoto}
                              alt="আবেদনকারীর ছবি"
                              className="w-[105px] h-[130px] object-cover border border-slate-600 rounded-xs shadow-xs"
                            />
                            <div className="text-[8px] text-center text-slate-500 mt-1">
                              পাসপোর্ট সাইজ সত্যায়িত ছবি
                            </div>
                          </div>
                        ) : (
                          <div className="w-[110px] h-[135px] border border-dashed border-slate-600 rounded-xs flex flex-col items-center justify-center text-center p-2 bg-slate-50/60">
                            <span className="text-[11px] font-bold text-slate-600">
                              পাসপোর্ট সাইজ
                            </span>
                            <span className="text-[10px] font-bold text-slate-600">
                              ছবি
                            </span>
                            <span className="text-[8.5px] text-slate-400 mt-1 leading-tight">
                              (এখানে সংযুক্ত করুন ও সত্যায়িত করুন)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Future Blessing Text */}
                  <p className="text-[13.5px] sm:text-[14px] font-medium mb-12 text-black">
                    আমি তাহার উজ্জ্বল ভবিষ্যৎ কামনা করি।
                  </p>
                </div>

                {/* ====================================================== */}
                {/* D. BOTTOM OFFICIAL SIGNATURE & SEAL BLOCK               */}
                {/* ====================================================== */}
                <div className="flex justify-between items-end pt-10 pb-4">
                  {/* Left: Official Round Seal Area */}
                  <div className="text-center w-36">
                    <div className="w-24 h-24 mx-auto rounded-full border border-dashed border-slate-400 flex flex-col items-center justify-center text-slate-400 text-[10px] p-2 select-none">
                      <span>অফিসিয়াল গোল সিলমোহর</span>
                    </div>
                  </div>

                  {/* Right: Chairman / Signatory Block */}
                  <div className="text-center min-w-[240px] space-y-0.5">
                    <div className="w-48 mx-auto border-t border-black mb-1.5" />
                    <div className="font-bold text-[13.5px] sm:text-[14px] text-black">
                      {data.signatoryName ? data.signatoryName : null}
                    </div>
                    <div className="font-extrabold text-[13px] sm:text-[13.5px] text-black">
                      {data.signatoryDesignation || 'চেয়ারম্যান'}
                    </div>
                    <div className="text-[12px] font-bold text-slate-800">
                      {data.unionParishad || '০৫ নং আন্দিউড়া ইউনিয়ন পরিষদ'}
                    </div>
                    <div className="text-[11.5px] text-slate-700">
                      {data.upazila || 'মাধবপুর'}, {data.district || 'হবিগঞ্জ'}।
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
