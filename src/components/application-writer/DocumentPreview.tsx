import React, { useState, useEffect, useRef } from 'react';
import { DocumentStyle, TemplateId } from './types';

const toBanglaNum = (num: number): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((d) => bnDigits[Number(d)] ?? d)
    .join('');
};

interface DocumentPreviewProps {
  content: string;
  templateId: TemplateId;
  style: DocumentStyle;
  language: 'bn' | 'en';
  isAiEnhanced?: boolean;
  onChangeStyle?: (newStyle: Partial<DocumentStyle>) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  content,
  templateId,
  style,
  language,
  isAiEnhanced,
  onChangeStyle,
}) => {
  // Margin class
  const marginClasses = {
    compact: 'p-8 sm:p-10', // ~0.5 inch
    normal: 'p-10 sm:p-14', // ~0.75-1 inch
    wide: 'p-12 sm:p-16',   // ~1.25 inch
  }[style.margin];

  // Font family class
  const fontClasses = {
    noto: 'font-sans', // uses Noto Sans Bengali
    hind: 'font-sans tracking-tight',
    kalpurush: 'font-serif',
    solaiman: 'font-sans',
    tiro: 'font-serif',
    sans: 'font-sans',
    serif: 'font-serif',
  }[style.fontFamily] || 'font-sans';

  // Alignment class
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[style.alignment];

  // Template specific accents
  const getTemplateHeader = () => {
    switch (templateId) {
      case 'modern-bn':
        return (
          <div className="border-b-2 border-slate-700 pb-3 mb-6 flex justify-between items-center text-xs text-slate-500 uppercase tracking-wider font-semibold">
            <span>অফিসিয়াল পত্র / দাপ্তরিক আবেদন</span>
            <span>The MoSaFa Application Standard</span>
          </div>
        );
      case 'school-college':
        return (
          <div className="border-b border-indigo-200 pb-2 mb-6 flex justify-between items-center text-[11px] text-indigo-700 font-medium">
            <span>শিক্ষা প্রতিষ্ঠান বিভাগীয় আবেদনপত্র</span>
            <span>Academic Division</span>
          </div>
        );
      case 'office-leave':
        return (
          <div className="border-b border-emerald-300 pb-2.5 mb-6 flex justify-between items-center text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">
            <span>Corporate Leave Application</span>
            <span>Internal HR Reference</span>
          </div>
        );
      case 'complaint-letter':
        return (
          <div className="border-b-2 border-rose-500 pb-2.5 mb-6 flex justify-between items-center text-[11px] text-rose-700 font-bold tracking-wide">
            <span>নাগরিক অভিযোগপত্র / প্রতিকারের আবেদন</span>
            <span>Official Grievance Redress</span>
          </div>
        );
      case 'job-application':
        return (
          <div className="border-b border-slate-300 pb-3 mb-6 flex justify-between items-center text-xs text-slate-600 font-semibold tracking-wider uppercase">
            <span>Formal Job Application & Cover Letter</span>
            <span>Confidential</span>
          </div>
        );
      case 'english-official':
        return (
          <div className="border-b border-slate-800 pb-3 mb-6 flex justify-between items-center text-xs text-slate-700 font-bold tracking-widest uppercase">
            <span>Official Correspondence</span>
            <span>Formal Letter</span>
          </div>
        );
      default:
        return null;
    }
  };

  const lines = content.split('\n');

  const documentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState<number>(1);

  useEffect(() => {
    if (documentRef.current) {
      // Standard A4 sheet height is 1123px at 96 DPI
      // Check if actual content overflows 1 standard A4 page
      const scrollH = documentRef.current.scrollHeight;
      const calculated = Math.max(1, Math.ceil(scrollH / 1123));
      setPageCount(calculated);
    }
  }, [content, style, templateId]);

  // Signature block check states
  const showApplicant = style.showApplicantSign !== false;
  const showDeptHead = Boolean(style.showDeptHeadSign);
  const showApproval = Boolean(style.showApprovalSign);
  const showGuardian = Boolean(style.showGuardianSign);
  const showTeacher = Boolean(style.showTeacherSign);

  return (
    <div className="w-full flex flex-col items-center py-2">
      {/* Optional Signature & Approval Controls Bar (Hidden from Print & PDF) */}
      <div className="print:hidden w-full max-w-[794px] mb-3 p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>স্বাক্ষর ও সুপারিশ অপশন (প্রয়োজন অনুযায়ী টিক দিন):</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            টিক না দিলে এগুলো ডকুমেন্টে বা PDF-এ থাকবে না
          </span>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap text-xs">
          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 transition">
            <input
              type="checkbox"
              checked={showApplicant}
              onChange={(e) => onChangeStyle?.({ showApplicantSign: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
            />
            <span className="font-semibold text-slate-800">আবেদনকারীর স্বাক্ষর</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 transition">
            <input
              type="checkbox"
              checked={showDeptHead}
              onChange={(e) => onChangeStyle?.({ showDeptHeadSign: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
            />
            <span className="font-semibold text-slate-800">বিভাগীয় প্রধানের সুপারিশ</span>
          </label>

          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 transition">
            <input
              type="checkbox"
              checked={showApproval}
              onChange={(e) => onChangeStyle?.({ showApprovalSign: e.target.checked })}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
            />
            <span className="font-semibold text-slate-800">মানবসম্পদ / সিইও অনুমোদন</span>
          </label>

          {templateId === 'school-college' && (
            <>
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 transition">
                <input
                  type="checkbox"
                  checked={showGuardian}
                  onChange={(e) => onChangeStyle?.({ showGuardianSign: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">অভিভাবকের স্বাক্ষর</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 transition">
                <input
                  type="checkbox"
                  checked={showTeacher}
                  onChange={(e) => onChangeStyle?.({ showTeacherSign: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">শ্রেণি শিক্ষকের স্বাক্ষর</span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div
        ref={documentRef}
        id="a4-application-document-sheet"
        className={`bg-white text-slate-900 shadow-xl border border-slate-200 w-full max-w-[794px] min-h-[1123px] relative flex flex-col justify-between transition-all ${marginClasses} ${fontClasses}`}
        style={{
          fontSize: `${style.fontSize}px`,
          lineHeight: style.lineSpacing,
          fontWeight: style.bold ? 'bold' : 'normal',
          fontStyle: style.italic ? 'italic' : 'normal',
          textDecoration: style.underline ? 'underline' : 'none',
        }}
      >
        {/* Template Header if any */}
        <div>
          {getTemplateHeader()}

          {/* AI or Template Source Badge (hidden during print & PDF) */}
          <div className="print:hidden absolute top-3 right-4 flex items-center gap-1.5 opacity-60 text-[10px]">
            {isAiEnhanced ? (
              <span className="bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200">
                ✨ AI-উন্নত
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
                📋 টেমপ্লেট ড্রাফট
              </span>
            )}
          </div>

          {/* Main Document Body */}
          <div className={`space-y-2.5 ${alignmentClass}`}>
            {lines.map((line, idx) => {
              const trimmed = line.trim();
              const isSubject =
                trimmed.startsWith('বিষয়:') ||
                trimmed.startsWith('বিষয়:') ||
                trimmed.startsWith('Subject:') ||
                trimmed.startsWith('SUBJECT:');
              const isDate = trimmed.startsWith('তারিখ:') || trimmed.startsWith('Date:');
              const isRecipient = trimmed === 'বরাবর' || trimmed === 'To';
              const isSalutation =
                trimmed === 'জনাব,' ||
                trimmed === 'মহোদয়,' ||
                trimmed === 'জনাব/জনাবা,' ||
                trimmed === 'Dear Sir/Madam,' ||
                trimmed === 'Dear Sir,';
              const isSignOff =
                trimmed.startsWith('বিনীত নিবেদক') ||
                trimmed.startsWith('বিনীত,') ||
                trimmed.startsWith('ধন্যবাদান্তে,') ||
                trimmed.startsWith('Yours sincerely') ||
                trimmed.startsWith('Yours faithfully');

              if (trimmed === '') {
                return <div key={idx} className="h-3" />;
              }

              return (
                <p
                  key={idx}
                  className={`
                    ${isSubject ? 'font-bold py-1 text-slate-950 underline decoration-slate-400 decoration-1 underline-offset-4' : ''}
                    ${isDate ? 'font-medium text-slate-700' : ''}
                    ${isRecipient ? 'font-semibold text-slate-900 mt-2' : ''}
                    ${isSalutation ? 'font-semibold pt-1' : ''}
                    ${isSignOff ? 'font-semibold pt-4' : ''}
                  `}
                >
                  {line}
                </p>
              );
            })}
          </div>

          {/* School/College Template Signature Block (Only shows checked options) */}
          {templateId === 'school-college' && (
            (() => {
              const anySchoolSign = showApplicant || showGuardian || showTeacher || showApproval;
              if (!anySchoolSign) return null;

              return (
                <div className="mt-12 pt-6 border-t border-dashed border-slate-300 flex items-end justify-between gap-4 text-xs text-slate-700">
                  {showGuardian && (
                    <div className="text-center flex-1 min-w-[90px] max-w-[190px]">
                      <div className="w-full border-b border-slate-400 mb-1.5" />
                      <span>অভিভাবকের স্বাক্ষর ও তারিখ</span>
                    </div>
                  )}
                  {showTeacher && (
                    <div className="text-center flex-1 min-w-[90px] max-w-[190px]">
                      <div className="w-full border-b border-slate-400 mb-1.5" />
                      <span>শ্রেণি শিক্ষকের স্বাক্ষর</span>
                    </div>
                  )}
                  {showApplicant && (
                    <div className="text-center flex-1 min-w-[90px] max-w-[190px]">
                      <div className="w-full border-b border-slate-400 mb-1.5" />
                      <span>শিক্ষার্থীর স্বাক্ষর</span>
                    </div>
                  )}
                  {showApproval && (
                    <div className="text-center flex-1 min-w-[90px] max-w-[190px]">
                      <div className="w-full border-b border-slate-400 mb-1.5" />
                      <span>প্রধান শিক্ষক / অধ্যক্ষের অনুমোদন</span>
                    </div>
                  )}
                </div>
              );
            })()
          )}

          {/* Office Leave / Corporate Signatures (Only shows checked options) */}
          {(templateId === 'office-leave' || showDeptHead || showApproval) && (
            (() => {
              const anyOfficeSign = showApplicant || showDeptHead || showApproval;
              if (!anyOfficeSign) return null;

              return (
                <div className="mt-12 pt-6 border-t border-dashed border-slate-300 flex items-end justify-between gap-4 text-xs text-slate-700">
                  {showApplicant && (
                    <div className="text-center flex-1 min-w-[100px] max-w-[200px]">
                      <div className="w-full border-b border-slate-400 mb-1.5" />
                      <span className="font-medium">আবেদনকারীর স্বাক্ষর</span>
                    </div>
                  )}
                  {showDeptHead && (
                    <div className="text-center flex-1 min-w-[100px] max-w-[200px]">
                      <div className="w-full border-b border-slate-400 mb-1.5" />
                      <span className="font-medium">বিভাগীয় প্রধানের সুপারিশ</span>
                    </div>
                  )}
                  {showApproval && (
                    <div className="text-center flex-1 min-w-[100px] max-w-[200px]">
                      <div className="w-full border-b border-slate-400 mb-1.5" />
                      <span className="font-medium">মানবসম্পদ / সিইও অনুমোদন</span>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>

        {/* Bottom Page Numbering: ONLY shown if 2 or more pages (never shown for 1-page document) */}
        {style.showPageNumber && pageCount > 1 && (
          <div className="pt-8 text-center text-[11px] text-slate-400 border-t border-slate-100 mt-8">
            <span>পৃষ্ঠা ১ / {toBanglaNum(pageCount)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
